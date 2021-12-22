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

        let OrderDetails = Controller.extend("logaligroup.employees.controller.OrderDetails", {


        });

            OrderDetails.prototype.onInit = onInit;
            OrderDetails.prototype.onBack = onBack;
            OrderDetails.prototype.onClearSignature = onClearSignature;

            return OrderDetails;
});