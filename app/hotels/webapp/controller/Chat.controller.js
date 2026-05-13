sap.ui.define([
    "travel/hotels/hotels/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "travel/hotels/hotels/model/markdown"
], function (BaseController, JSONModel, Fragment, MessageToast, markdown) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.Chat", {

        /**
         * Initial state lifecycle:
         * - Set up the chat model with empty messages and thread state
         * - Register route handler to capture initialMessage on entry
         */
        onInit: function () {
            // Local chat state
            const oChatModel = new JSONModel({
                messages: [],              // [{ role: "user"|"agent", text, html }]
                thread_id: null,           // server-assigned after first message
                isThinking: false,         // shows typing indicator + disables input
                showEmptyState: true,      // hides once first user message sent
                approvalData: null         // {action, args} when agent wants to book
            });
            this.getView().setModel(oChatModel, "chat");

            // Listen for navigation into this view
            const oRouter = this.getRouter();
            oRouter.getRoute("chat").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Called when user navigates to /chat (possibly with ?initialMessage=...)
         * If an initial message is provided, auto-send it.
         */
        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const oQuery = oArgs["?query"] || {};
            const sInitial = oQuery.initialMessage;

            // Reset state on fresh chat entry
            this._resetChat();

            if (sInitial) {
                // Auto-send the initial message after a brief delay
                // (gives the UI time to render the empty state first)
                setTimeout(() => this._sendMessageRaw(sInitial), 100);
            }
        },

        _resetChat: function () {
            const oChat = this.getView().getModel("chat");
            oChat.setProperty("/messages", []);
            oChat.setProperty("/thread_id", null);
            oChat.setProperty("/isThinking", false);
            oChat.setProperty("/showEmptyState", true);
            oChat.setProperty("/approvalData", null);
        },

        /**
         * User pressed Enter or clicked the send button.
         */
        onSendMessage: function () {
            const sText = this.byId("chatInput").getValue().trim();
            if (!sText) return;
            this.byId("chatInput").setValue("");
            this._sendMessageRaw(sText);
        },

        /**
         * Add user message to history, then call the agent.
         */
        _sendMessageRaw: function (sText) {
            this._addMessage("user", sText);
            this._callAgent(sText);
        },

        /**
         * Push a message into the chat history.
         */
        _addMessage: function (sRole, sText) {
            const oChat = this.getView().getModel("chat");
            const aMessages = oChat.getProperty("/messages").slice();
            aMessages.push({
                role: sRole,
                text: sText,
                html: markdown.toHtml(sText)
            });
            oChat.setProperty("/messages", aMessages);
            oChat.setProperty("/showEmptyState", false);
            // Auto-scroll after a tick
            setTimeout(() => this._scrollToBottom(), 50);
        },

        /**
         * Scroll the messages area to the bottom.
         */
        _scrollToBottom: function () {
            const oScroll = this.byId("chatScroll");
            if (oScroll) {
                const oDom = oScroll.getDomRef();
                if (oDom) oDom.scrollTop = oDom.scrollHeight;
            }
        },

        /**
         * Call the CAP backend's chatWithAgent action.
         * Maintains thread_id for conversation continuity.
         */
        _callAgent: async function (sMessage) {
            const oChat = this.getView().getModel("chat");
            oChat.setProperty("/isThinking", true);
            setTimeout(() => this._scrollToBottom(), 50);

            try {
                const sThreadId = oChat.getProperty("/thread_id");
                const oPayload = { message: sMessage };
                if (sThreadId) oPayload.threadId = sThreadId;

                const response = await fetch("/travel/chatWithAgent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(oPayload)
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const oData = await response.json();

                // Save the thread_id for follow-ups
                if (oData.threadId) {
                    oChat.setProperty("/thread_id", oData.threadId);
                }

                // Render the agent's reply
                this._addMessage("agent", oData.reply);

                // If the agent wants to book, open the approval dialog
                if (oData.needsApproval && oData.approvalData) {
                    let oApprovalData;
                    try {
                        oApprovalData = JSON.parse(oData.approvalData);
                    } catch (e) {
                        oApprovalData = { action: "unknown", args: {} };
                    }
                    oChat.setProperty("/approvalData", oApprovalData);
                    this._openApprovalDialog();
                }

            } catch (err) {
                console.error("[Chat] Agent call failed:", err);
                this._addMessage(
                    "agent",
                    "Sorry, I hit a technical issue. Please try again in a moment."
                );
                MessageToast.show("Connection error");
            } finally {
                oChat.setProperty("/isThinking", false);
                setTimeout(() => this._scrollToBottom(), 100);
            }
        },

        /**
         * Lazy-load and open the approval dialog fragment.
         */
        _openApprovalDialog: async function () {
            if (!this._pApprovalDialog) {
                this._pApprovalDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "travel.hotels.hotels.view.ApprovalDialog",
                    controller: this
                }).then(oDialog => {
                    this.getView().addDependent(oDialog);
                    // Bind the dialog to the chat model so it sees /approvalData
                    oDialog.setModel(this.getView().getModel("chat"));
                    return oDialog;
                });
            }
            const oDialog = await this._pApprovalDialog;
            oDialog.open();
        },

        /**
         * User clicked "Confirm Booking" in the dialog.
         */
        onApprovalConfirm: async function () {
            this._closeApprovalDialog();
            await this._sendApprovalDecision("approve");
        },

        /**
         * User clicked "Cancel" in the dialog.
         */
        onApprovalCancel: async function () {
            this._closeApprovalDialog();
            await this._sendApprovalDecision("reject");
        },

        _closeApprovalDialog: async function () {
            if (this._pApprovalDialog) {
                const oDialog = await this._pApprovalDialog;
                oDialog.close();
            }
        },

        /**
         * POST the user's decision to /approveBooking.
         */
        _sendApprovalDecision: async function (sDecision) {
            const oChat = this.getView().getModel("chat");
            const sThreadId = oChat.getProperty("/thread_id");
            if (!sThreadId) {
                MessageToast.show("Lost conversation context. Please start again.");
                return;
            }

            oChat.setProperty("/isThinking", true);
            setTimeout(() => this._scrollToBottom(), 50);

            try {
                const response = await fetch("/travel/approveBooking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        threadId: sThreadId,
                        decision: sDecision
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const oData = await response.json();
                this._addMessage("agent", oData.reply);

            } catch (err) {
                console.error("[Chat] Approval call failed:", err);
                this._addMessage("agent", "Something went wrong processing your decision.");
                MessageToast.show("Approval error");
            } finally {
                oChat.setProperty("/isThinking", false);
                oChat.setProperty("/approvalData", null);
                setTimeout(() => this._scrollToBottom(), 100);
            }
        },

        /**
         * Navigation handlers.
         */
        onNavBack: function () {
            this.navTo("home");
        },

        onNavBookings: function () {
            this.navTo("bookings");
        }
    });
});