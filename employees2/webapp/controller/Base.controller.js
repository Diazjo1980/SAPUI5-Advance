//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    function onInit() {

    };

    function toOrderDetails(oEvent) {
        let orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteOrderDetails", {
            OrderID: orderID
        });
    };

    let Base = Controller.extend("logaligroup.employees.controller.Base", {


    });

    Base.prototype.onInit = onInit;
    Base.prototype.toOrderDetails = toOrderDetails;

    return Base;
});