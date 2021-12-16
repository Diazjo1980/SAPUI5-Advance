//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "logaligroup/employees/model/formatter"
],

    function (Controller, formatter) {

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {

            let tableIncidence = this.getView().byId("tableIncidence");
            let newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this);
            let incidenceModel = this.getView().getModel("incidenceModel");

            let odata = incidenceModel.getData();
            let index = odata.length;
            odata.push({ index: index + 1 });
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
            this._bus.publish("incidence", "onDeleteIncidence", {
                IncidenceId: contextObject.IncidenceId,
                SapId: contextObject.SapId,
                EmployeeId: contextObject.EmployeeId
            });
        };

        function onSaveIncidence(oEvent) {
            let incidence = oEvent.getSource().getParent().getParent();
            let incidenceRow = incidence.getBindingContext("incidenceModel");
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
        };

        function updateIncidenceCreationDate(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            contextObject.CreationDateX = true;

        };

        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            contextObject.ReasonX = true;

        };

        function updateIncidenceType(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            contextObject.TypeX = true;

        };


        let EmployeeDetails = Controller.extend("logaligroup.employees.controller.EmployeeDetails", {


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