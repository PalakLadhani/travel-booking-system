sap.ui.define([
    "travel/hotels/hotels/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.Chat", {

        onInit: function () {
            this.getRouter().getRoute("chat")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oQuery = oEvent.getParameter("arguments")["?query"];
            const sHotelId = oQuery && oQuery.hotelId;
            console.log("Chat route matched — hotelId:", sHotelId);
        },

        onNavBack: function () {
            this.getRouter().navTo("hotels");
        }
    });
});