//@ts-nocheck
sap.ui.define([
    "logaligroup/employees/controller/Base.controller",
    "logaligroup/employees/model/formatter",
    "sap/m/MessageBox"
],

    function (Base, formatter, MessageBox) {

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence(oEvenT) {
            oEvenT.getSource().setEnabled(false);
            let tableIncidence = this.getView().byId("tableIncidence");
            let newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this);
            let incidenceModel = this.getView().getModel("incidenceModel");

            let odata = incidenceModel.getData();
            let index = odata.length;
            odata.push({ index: index + 1, _validateState: false, EanbledSave: false });
            incidenceModel.refresh();

            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {
            // let tableIncidence = this.getView().byId("tableIncidence");
            // let rowIncidence = oEvent.getSource().getParent().getParent();
            // let incidenceModel = this.getView().getModel("incidenceModel");
            // let odata = incidenceModel.getData();
            // let contextObject = rowIncidence.getBindingContext("incidenceModel");

            // //odata.splice(contextObject.index - 1, 1);
            // odata.splice(contextObject.sPath.substring(1, contextObject.sPath.length), 1);

            // for (var i in odata) {
            //     odata[i].index = parseInt(i) + 1;
            // };

            // incidenceModel.refresh();
            // tableIncidence.removeContent(rowIncidence);

            // for (var j in tableIncidence.getContent()) {
            //     tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
            // }

            let contextObject = oEvent.getSource().getBindingContext("incidenceModel").getObject();

            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
                onClose: function (oAction) {
                    if (oAction === "OK" && !contextObject.IncidenceId == undefined) {
                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: contextObject.IncidenceId,
                            SapId: contextObject.SapId,
                            EmployeeId: contextObject.EmployeeId
                        });
                        this.getView().byId("_IDGenButton1").setEnabled(true);
                    } else {
                        let tableIncidence = this.getView().byId("tableIncidence").getModel();
                        let rowIncidence = tableIncidence.getData();
                        let sPath = this.getBindingContext().getPath();
                        let sIndex = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1));
                        rowIncidence.removeContent(sIndex);
                        this.getView().byId("_IDGenButton1").setEnabled(true);
                    }
                }.bind(this)
            });
        };

        function onSaveIncidence(oEvent) {

            let incidence = oEvent.getSource().getParent().getParent();
            let incidenceRow = incidence.getBindingContext("incidenceModel");
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
            this.getView().byId("_IDGenButton1").setEnabled(true);
        };

        function updateIncidenceCreationDate(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            let oResourceBudle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) {
                contextObject._validateState = false;
                contextObject.CreationDateState = "Error";
                MessageBox.error(oResourceBudle.getText("errorCreationDateValue"), {
                    title: "Error",
                    onClose: null,
                    StyleCalss: "",
                    actions: MessageBox.Action.Close,
                    emphasizeAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });

            } else {
                contextObject.CreationDateX = true;
                contextObject._validateState = true;
                contextObject.CreationDateState = "None";
            };

            if (oEvent.getSource().isValidValue() && contextObject.Reason) {
                contextObject.EanbledSave = true;
            } else {
                contextObject.EanbledSave = false;
            };
            context.getModel().refresh();
        };

        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            let oResourceBudle = this.getView().getModel("i18n").getResourceBundle();

            if (oEvent.getSource().getValue()) {
                contextObject.ReasonState = "None";
                contextObject.ReasonX = true;
            } else {
                contextObject.ReasonState = "Error";
            };

            if (contextObject._validateState && oEvent.getSource().getValue()) {
                contextObject.EanbledSave = true;
            } else {
                contextObject.EanbledSave = false;
            };

            context.getModel().refresh();
        };

        function updateIncidenceType(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();

            if (contextObject._validateState && contextObject.Reason) {
                contextObject.EanbledSave = true;
            } else {
                contextObject.EanbledSave = false;
            };

            context.getModel().refresh();

            contextObject.TypeX = true;

        };


        let EmployeeDetails = Base.extend("logaligroup.employees.controller.EmployeeDetails", {


        });

        EmployeeDetails.prototype.onInit = onInit;
        EmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
        EmployeeDetails.prototype.Formatter = formatter;
        EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        EmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
        EmployeeDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        EmployeeDetails.prototype.updateIncidenceReason = updateIncidenceReason;
        EmployeeDetails.prototype.updateIncidenceType = updateIncidenceType;

        return EmployeeDetails;

    });