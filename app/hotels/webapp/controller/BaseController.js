sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, UIComponent, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("travel.hotels.hotels.controller.BaseController", {

        /**
         * Returns the router for this component.
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Returns the i18n resource bundle.
         * Use: this.getResourceBundle().getText("appTitle")
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Shortcut: get a translated text by key.
         * Use: this.getText("appTitle")
         */
        getText: function (sKey, aArgs) {
            return this.getResourceBundle().getText(sKey, aArgs);
        },

        /**
         * Returns a named model from the component.
         */
        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        },

        /**
         * Sets a named model on the view.
         */
        setModel: function (oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        /**
         * Show a success toast (auto-dismisses).
         */
        showToast: function (sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Show an error dialog (user must dismiss).
         */
        showError: function (sMessage, sTitle) {
            MessageBox.error(sMessage, {
                title: sTitle || this.getText("errorTitle")
            });
        },

        /**
         * Show a success dialog.
         */
        showSuccess: function (sMessage, sTitle) {
            MessageBox.success(sMessage, {
                title: sTitle || this.getText("successTitle")
            });
        },

        /**
         * Navigate to a named route.
         * Use: this.navTo("hotelDetail", { hotelId: "abc" })
         */
        navTo: function (sRouteName, oParams) {
            this.getRouter().navTo(sRouteName, oParams);
        }
    });
});