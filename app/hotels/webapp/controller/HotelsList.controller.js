sap.ui.define([
    "travel/hotels/hotels/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "travel/hotels/hotels/model/formatter"
], function (BaseController, Filter, FilterOperator, Sorter, formatter) {
    "use strict";

    return BaseController.extend("travel.hotels.hotels.controller.HotelsList", {

        formatter: formatter,

        onInit: function () {
            // Filter state — kept in a single object so all filter handlers
            // can read/write consistently
            this._oFilterState = {
                search: "",
                cities: [],
                maxPrice: 10000,
                minRating: 0
            };
        },

        // ============================================================
        // SEARCH
        // ============================================================
        onSearch: function (oEvent) {
            this._oFilterState.search = oEvent.getParameter("query")
                || oEvent.getParameter("newValue") || "";
            this._applyAllFilters();
        },

        // ============================================================
        // CITY FILTER (multi-select via checkboxes)
        // ============================================================
        onCityFilter: function (oEvent) {
            const oCheckBox = oEvent.getSource();
            const sCity = oCheckBox.data("city");
            const bSelected = oEvent.getParameter("selected");

            if (bSelected) {
                if (!this._oFilterState.cities.includes(sCity)) {
                    this._oFilterState.cities.push(sCity);
                }
            } else {
                this._oFilterState.cities = this._oFilterState.cities.filter(c => c !== sCity);
            }
            this._applyAllFilters();
        },

        // ============================================================
        // PRICE FILTER
        // ============================================================
        onPriceFilter: function (oEvent) {
            const nValue = oEvent.getParameter("value");
            this._oFilterState.maxPrice = nValue;
            this.byId("priceLabel").setText("Up to ₹" + nValue.toLocaleString("en-IN"));
            this._applyAllFilters();
        },

        // ============================================================
        // RATING FILTER
        // ============================================================
        onRatingFilter: function (oEvent) {
            this._oFilterState.minRating = oEvent.getParameter("value");
            this._applyAllFilters();
        },

        // ============================================================
        // CLEAR FILTERS
        // ============================================================
        onClearFilters: function () {
            this._oFilterState = { search: "", cities: [], maxPrice: 10000, minRating: 0 };

            // Reset UI
            this.byId("searchField").setValue("");
            this.byId("priceSlider").setValue(10000);
            this.byId("priceLabel").setText("Up to ₹10,000");
            this.byId("ratingFilter").setValue(0);

            // Uncheck all city checkboxes
            const oFilterPanel = this.byId("page");
            const aCheckBoxes = oFilterPanel.findAggregatedObjects(true,
                c => c.isA && c.isA("sap.m.CheckBox"));
            aCheckBoxes.forEach(cb => cb.setSelected(false));

            this._applyAllFilters();
        },

        // ============================================================
        // SORT
        // ============================================================
        onSort: function (oEvent) {
            const sKey = oEvent.getParameter("selectedItem").getKey();
            const oBinding = this.byId("hotelsList").getBinding("items");

            let oSorter;
            switch (sKey) {
                case "price_asc":   oSorter = new Sorter("pricePerNight", false); break;
                case "price_desc":  oSorter = new Sorter("pricePerNight", true);  break;
                case "rating_desc": oSorter = new Sorter("rating", true);         break;
                case "name_asc":    oSorter = new Sorter("name", false);          break;
            }
            oBinding.sort(oSorter);
        },

        // ============================================================
        // APPLY ALL FILTERS — combines search + city + price + rating
        // into one OData filter
        // ============================================================
        _applyAllFilters: function () {
            const oBinding = this.byId("hotelsList").getBinding("items");
            const aFilters = [];

            // Search filter (across name, city, country)
            if (this._oFilterState.search) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, this._oFilterState.search),
                        new Filter("city", FilterOperator.Contains, this._oFilterState.search),
                        new Filter("country", FilterOperator.Contains, this._oFilterState.search)
                    ],
                    and: false
                }));
            }

            // City filter (multi-select OR)
            if (this._oFilterState.cities.length > 0) {
                aFilters.push(new Filter({
                    filters: this._oFilterState.cities.map(
                        c => new Filter("city", FilterOperator.EQ, c)
                    ),
                    and: false
                }));
            }

            // Price filter
            if (this._oFilterState.maxPrice < 10000) {
                aFilters.push(new Filter("pricePerNight", FilterOperator.LE, this._oFilterState.maxPrice));
            }

            // Rating filter
            if (this._oFilterState.minRating > 0) {
                aFilters.push(new Filter("rating", FilterOperator.GE, this._oFilterState.minRating));
            }

            // Apply combined filter (AND between groups)
            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);
        },

        // ============================================================
        // ACTIONS
        // ============================================================
      /**
 * Navigate to hotel detail page when user clicks the hotel name
 * or the "View Details" button.
 */
onViewDetails: function (oEvent) {
    const oContext = oEvent.getSource().getBindingContext();
    const sHotelId = oContext.getProperty("ID");
    this.navTo("hotelDetail", { hotelId: sHotelId });
},

/**
 * Navigate to chat page with the hotel pre-selected via query param.
 */
onBookPress: function (oEvent) {
    const oContext = oEvent.getSource().getBindingContext();
    const sHotelId = oContext.getProperty("ID");
    this.navTo("chat", { "?query": { hotelId: sHotelId } });
}
    });
});