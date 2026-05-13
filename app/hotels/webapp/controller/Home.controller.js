sap.ui.define([
    "travel/hotels/hotels/controller/BaseController",
    "travel/hotels/hotels/model/formatter"
], function (BaseController, formatter) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.Home", {

        formatter: formatter,

        onInit: function () {
            // No init logic needed yet
        },

        /**
         * Hero chat input — submitting sends user to the chat view
         * with the typed message as initial context.
         */
        onHeroChatSubmit: function (oEvent) {
            const sValue = this.byId("heroChatInput").getValue().trim();
            if (!sValue) {
                this.showToast("Please tell me where you want to go");
                return;
            }
            // Pass the initial message via URL query param
            this.navTo("chat", {
                "?query": { initialMessage: sValue }
            });
        },

        /**
         * Example prompt buttons — pre-fill the chat with a starter message.
         */
        onExamplePress: function (oEvent) {
            const sPrompt = oEvent.getSource().data("prompt");
            this.navTo("chat", {
                "?query": { initialMessage: sPrompt }
            });
        },

        /**
         * Featured destination "Plan Trip" button —
         * starts a chat about that specific destination.
         */
        onDestinationPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sName = oContext.getProperty("name");
            this.navTo("chat", {
                "?query": { initialMessage: `I want to plan a trip to ${sName}` }
            });
        },

        /**
         * "Browse All Hotels" link — alternative entry to the hotels list.
         */
        onBrowseHotels: function () {
            this.navTo("hotels");
        }
    });
});