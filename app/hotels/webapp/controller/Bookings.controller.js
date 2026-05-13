sap.ui.define([
    "travel/hotels/hotels/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.Bookings", {

        onNavBack: function () {
            this.getRouter().navTo("hotels");
        }
    });
});