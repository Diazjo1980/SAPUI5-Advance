//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {

    function _onObjectMatched (oEvent) {
        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "odataNorthwind"
        });
    };

        function onInit () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);                
        };

        function onBack (oEvent) {
            let oHistory = History.getInstance();
            let sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            }
        };

        function onClearSignature (oEvent) {
            let signature = this.byId("signature");
            signature.clear();
        };

        function factoryOrderDetails (listId, oContext) {

            let contextObject = oContext.getObject();
            oContext.Currency = "EUR";
            let unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if (contextObject.Quantity <= unitsInStock) {

                let objectListItem = new sap.m.ObjectListItem({
                    title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                    number: "{ parts: [{path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
                    numberUnit: "{odataNorthwind>Currency}"
                }); 
                
                return objectListItem;

            } else {

                let customListItem = new sap.m.CustomListItem({
                    content : [
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"}),
                            contentMiddle: new sap.m.ObjectStatus({text: "{i18n>availableStatus} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: 'Error'}),
                            contentRight: new sap.m.Label({ text: "{ parts: [{path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}" }) 
                        })
                    ]
                });

                return customListItem;
            }

        };

        let OrderDetails = Controller.extend("logaligroup.employees.controller.OrderDetails", {


        });

            OrderDetails.prototype.onInit = onInit;
            OrderDetails.prototype.onBack = onBack;
            OrderDetails.prototype.onClearSignature = onClearSignature;
            OrderDetails.prototype.factoryOrderDetails = factoryOrderDetails;

            return OrderDetails;
});