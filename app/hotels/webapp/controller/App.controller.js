sap.ui.define([
    "travel/hotels/hotels/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.App", {

        onInit: function () {
            // Global busy-state model bound to <App busy="{appView>/busy}">
            const oModel = new JSONModel({ busy: false });
            this.getView().setModel(oModel, "appView");
        }
    });
});