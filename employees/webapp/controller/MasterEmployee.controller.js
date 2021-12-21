//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
	 */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        function onInit(Controller) {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onFilter() {
            var oJSONCountries = this.getView().getModel("jsonCountries").getData();

            var filters = [];

            if (oJSONCountries.EmployeeId !== "") {

                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }

            if (oJSONCountries.CountryKey !== "") {

                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
        };

        function onClearFilter() {

            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");

            //Llamo a la función onFilter para que al lipiar los input cargue nuevamente
            // los datos del modelo Employees
            this.onFilter();

        };

        function onShowPostalCode(oEvent) {
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("odataNorthwind");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show('Postal Code: ' + objectContext.PostalCode);

        };

        function onShowCity() {
            var oModel = this.getView().getModel("jsonModelConfig");
            oModel.setProperty("/visibleCity", true);
            oModel.setProperty("/visibleBtnShowCity", false);
            oModel.setProperty("/visibleBtnHideCity", true);

        };

        function onHideCity() {
            var oModel = this.getView().getModel("jsonModelConfig");
            oModel.setProperty("/visibleCity", false);
            oModel.setProperty("/visibleBtnShowCity", true);
            oModel.setProperty("/visibleBtnHideCity", false);
        };

        function showOrders(oEvent) {
            //Get selected Controler
            var iconPressed = oEvent.getSource();

            //Context from the model
            var oContext = iconPressed.getBindingContext("odataNorthwind");

            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.employees.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);
            };

            //Dialog binding to the context for selected data
            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
            this._oDialogOrders.open();
        };

        function onCloseOrders() {

            this._oDialogOrders.close();
        };

        function showEmployee(oEvent) {
            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            this._bus.publish("flexible", "showEmployee", path);
        };

        function toOrderDetails(oEvent) {
            let orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrderDetails", {
                OrderID: orderID
            });
        };

        var Main = Controller.extend("logaligroup.employees.controller.MasterEmployee", {});

        // Main.prototype.onValidate = function () {
        //     var inputEmployee = this.byId("inputEmployee");
        //     var valueEmployee = inputEmployee.getValue();

        //     if (valueEmployee.length === 6) {
        //         //inputEmployee.setDescription("OK");
        //         this.getView().byId("labelCountry").setVisible(true);
        //         this.getView().byId("slCountry").setVisible(true);

        //     } else {
        //         // inputEmployee.setDescription("Not OK");
        //         this.getView().byId("labelCountry").setVisible(false);
        //         this.getView().byId("slCountry").setVisible(false);
        //     }
        // };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.onShowPostalCode = onShowPostalCode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;
        Main.prototype.showEmployee = showEmployee;
        Main.prototype.toOrderDetails = toOrderDetails;

        return Main;
    });