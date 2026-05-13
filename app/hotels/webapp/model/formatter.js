sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Formats a number as INR currency.
         * 4500 → "₹4,500"
         */
       currency: function (vValue) {
    if (vValue === undefined || vValue === null || vValue === "") return "";
    const cleaned = typeof vValue === "string" ? vValue.replace(/,/g, "") : vValue;
    const n = typeof cleaned === "string" ? parseFloat(cleaned) : Number(cleaned);
    if (isNaN(n)) return "";
    return "₹" + n.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
},

        /**
         * Formats availability boolean → human-readable status.
         */
        availabilityText: function (bAvailable) {
            // Note: this uses i18n indirectly via the controller, so
            // we'll do the text resolution at the call site for now.
            return bAvailable ? "Available" : "Not Available";
        },

        /**
         * Maps availability → UI5 status type.
         * true → "Success" (green), false → "Error" (red)
         */
        availabilityState: function (bAvailable) {
            return bAvailable ? "Success" : "Error";
        },

        /**
         * Formats a date string (ISO) → "Sep 1, 2026"
         */
        dateMedium: function (sDate) {
            if (!sDate) return "";
            const d = new Date(sDate);
            return d.toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
        },

        /**
         * Calculates the number of nights between two date strings.
         */
        nightsBetween: function (sCheckIn, sCheckOut) {
            if (!sCheckIn || !sCheckOut) return 0;
            const ms = new Date(sCheckOut) - new Date(sCheckIn);
            return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
        },

        /**
         * Maps booking status → UI5 status type for visual badges.
         */
        bookingStatusState: function (sStatus) {
            switch (sStatus) {
                case "confirmed": return "Success";
                case "pending":   return "Warning";
                case "cancelled": return "Error";
                default:          return "None";
            }
        },

        /**
         * Renders a rating as stars: 4.5 → "★★★★½"
         * (Simple text version; we'll use the actual RatingIndicator control in the view)
         */
        ratingStars: function (nRating) {
            if (!nRating) return "";
            return nRating.toFixed(1) + " ★";
        }
    };
});