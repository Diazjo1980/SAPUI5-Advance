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

            var oView = this.getView();
            var i18nBundle = oView.getModel("i18n").getResourceBundle();

            var oJSONModelEmpl = new sap.ui.model.json.JSONModel();
            oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
            oView.setModel(oJSONModelEmpl, "jsonEmployees");

            var oJSONModelCount = new sap.ui.model.json.JSONModel();
            oJSONModelCount.loadData("./localService/mockdata/Countries.json", false);
            oView.setModel(oJSONModelCount, "jsonCountries");

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });

            oView.setModel(oJSONModelConfig, "jsonModelConfig");
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
            var oContext = itemPressed.getBindingContext("jsonEmployees");
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

            var oTable = this.getView().byId("ordersTable");
            oTable.destroyItems();
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();
            var orders = objectContext.Orders;

            var orderItems = [];

            for (var i in orders) {
                orderItems.push(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Label({ text: orders[i].OrderID }),
                        new sap.m.Label({ text: orders[i].Freight }),
                        new sap.m.Label({ text: orders[i].ShipAddress })
                    ]
                }));
            }

            var newTable = new sap.m.Table({
                width: "auto",
                columns: [
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>orderID}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>freight}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>shipAddress}" }) })
                ],
                items: orderItems
            }).addStyleClass("sapUiSmallMargin");

            oTable.addItem(newTable);

            //OrderID
            var newTableJSON = new sap.m.Table();
            newTableJSON.setWidth("auto");
            newTableJSON.addStyleClass("sapUiSmallMargin");

            var columnOrderID = new sap.m.Column();
            var labelOrderID = new sap.m.Label();

            labelOrderID.bindProperty("text", "i18n>orderID");
            columnOrderID.setHeader(labelOrderID);
            newTableJSON.addColumn(columnOrderID);

            //Freight
            var columnFreight = new sap.m.Column();
            var labelFreight = new sap.m.Label();

            labelFreight.bindProperty("text", "i18n>freight");
            columnFreight.setHeader(labelFreight);
            newTableJSON.addColumn(columnFreight);

            //ShipAddress
            var columnShipAddress = new sap.m.Column();
            var labelShipAddress = new sap.m.Label();

            labelShipAddress.bindProperty("text", "i18n>shipAddress");
            columnShipAddress.setHeader(labelShipAddress);
            newTableJSON.addColumn(columnShipAddress);

            var columnListItem = new sap.m.ColumnListItem();

            //OrderID            
            var cellOrderID = new sap.m.Label();
            cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
            columnListItem.addCell(cellOrderID);

            //Freight            
            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight");
            columnListItem.addCell(cellFreight);

            //ShipAddress           
            var cellShipAddress = new sap.m.Label();
            cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
            columnListItem.addCell(cellShipAddress);

            var oBindingInfo = {
                model: "jsonEmployees",
                path: "Orders",
                template: columnListItem
            };

            newTableJSON.bindAggregation("items", oBindingInfo);
            newTableJSON.bindElement("jsonEmployees>" + oContext.getPath());

            oTable.addItem(newTableJSON);
        };

        var Main = Controller.extend("logaligroup.employees.controller.MainView", {});

        Main.prototype.onValidate = function () {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();

            if (valueEmployee.length === 6) {
                //inputEmployee.setDescription("OK");
                this.getView().byId("labelCountry").setVisible(true);
                this.getView().byId("slCountry").setVisible(true);

            } else {
                // inputEmployee.setDescription("Not OK");
                this.getView().byId("labelCountry").setVisible(false);
                this.getView().byId("slCountry").setVisible(false);
            }
        };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.onShowPostalCode = onShowPostalCode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;

        return Main;
    });