sap.ui.define([
    "travel/hotels/hotels/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.HotelDetail", {

        onInit: function () {
            this.getRouter().getRoute("hotelDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sHotelId = oEvent.getParameter("arguments").hotelId;
            console.log("HotelDetail route matched — hotelId:", sHotelId);

            // Bind the view to /Hotels(<id>) so {name}, {city} etc. work
            this.getView().bindElement({
                path: "/Hotels(" + sHotelId + ")"
            });
        },

        onNavBack: function () {
            this.getRouter().navTo("hotels");
        }
    });
});