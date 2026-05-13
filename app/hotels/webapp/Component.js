sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "travel/hotels/hotels/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("travel.hotels.hotels.Component", {

        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        /**
         * Called on app startup.
         */
        init: function () {
            // Call base class init — required
            UIComponent.prototype.init.apply(this, arguments);

            // Set device model (info about phone/tablet/desktop)
            this.setModel(models.createDeviceModel(), "device");

            // Initialize router — reads routes from manifest.json
            this.getRouter().initialize();
        }
    });
});