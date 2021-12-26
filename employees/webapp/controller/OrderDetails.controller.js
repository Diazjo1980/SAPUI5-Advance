//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], function (Controller, History, MessageBox) {

    function _onObjectMatched(oEvent) {

        this.onClearSignature();

        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "odataNorthwind",
            events: {
                dataReceived: function (oData) {
                    _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                }.bind(this)
            }
        });

        const objectContext = this.getView().getModel("odataNorthwind").getContext("/Orders(" + oEvent.getParameter("arguments").OrderID + ")").getObject();

        if (objectContext) {

            _readSignature.bind(this)(objectContext.OrderID, objectContext.EmployeeID);

        }


    };

    function _readSignature(orderId, employeeId) {

        this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId + "',SapId='" + this.getOwnerComponent().SapId + "',EmployeeId='" + employeeId + "')", {
            success: function (data) {
                const signature = this.getView().byId("signature");

                if (data.MediaContent !== "") {
                    signature.setSignature("data:image/png;base64," + data.MediaContent);
                }

            }.bind(this),

            error: function (data) { }
        });

    };

    function onInit() {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
    };

    function onBack(oEvent) {
        let oHistory = History.getInstance();
        let sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain", true);
        }
    };

    function onClearSignature(oEvent) {
        let signature = this.byId("signature");
        signature.clear();
    };

    function factoryOrderDetails(listId, oContext) {

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
                content: [
                    new sap.m.Bar({
                        contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                        contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStatus} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: 'Error' }),
                        contentRight: new sap.m.Label({ text: "{ parts: [{path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}" })
                    })
                ]
            });

            return customListItem;
        }

    };

    function onSaveSignature(oEvent) {

        const signature = this.byId("signature");
        const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        let signaturePng;

        if (!signature.isFill()) {
            MessageBox.error(oResourceBundle.getText("fillSignature"));
        } else {

            signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
            let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

            let body = {
                OrderId: objectOrder.OrderID.toString(),
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: objectOrder.EmployeeID.toString(),
                MimeType: "image/png",
                MediaContent: signaturePng

            };

            this.getView().getModel("incidenceModel").create("/SignatureSet", body, {

                success: function () {
                    MessageBox.information(oResourceBundle.getText("signatureSaved"));
                },

                error: function () {
                    MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                }
            });

        }
    };

    function onFileBeforeUpload(oEvent) {

        let fileName = oEvent.getParameter("fileName");
        let objectContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

        let oHeaderSlug = new sap.m.UploadCollectionParameter({
            name: "slug",
            value: objectContext.OrderID + ";" + this.getOwnerComponent().SapId + ";"
                   + objectContext.EmployeeID 
                   + ";" + fileName  
        });

        oEvent.getParameters().addHeaderParameter(oHeaderSlug);
    };

    function onFileChange(oEvent) {

        let oUploadColletcion = oEvent.getSource();

        // Header CSRF token - Cross-site request forgery
        let oHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: this.getView().getModel("incidenceModel").getSecurityToken()
        });

        oUploadColletcion.addHeaderParameter(oHeaderToken);
    };

    let OrderDetails = Controller.extend("logaligroup.employees.controller.OrderDetails", {


    });

    OrderDetails.prototype.onInit = onInit;
    OrderDetails.prototype.onBack = onBack;
    OrderDetails.prototype.onClearSignature = onClearSignature;
    OrderDetails.prototype.factoryOrderDetails = factoryOrderDetails;
    OrderDetails.prototype.onSaveSignature = onSaveSignature;
    OrderDetails.prototype.onFileBeforeUpload = onFileBeforeUpload;
    OrderDetails.prototype.onFileChange = onFileChange;

    return OrderDetails;
});