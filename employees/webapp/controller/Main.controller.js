//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],

    function (Controller) {

        return Controller.extend("logaligroup.employees.controller.Main", {

            onBeforeRendering: function () {
                this._detailEmployeeView = this.getView().byId("employeeDetailsView");
            },

            onInit: function () {
                var oView = this.getView();
                var i18nBundle = oView.getModel("i18n").getResourceBundle();

                var oJSONModelEmpl = new sap.ui.model.json.JSONModel();
                oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
                oView.setModel(oJSONModelEmpl, "jsonEmployees");

                var oJSONModelCount = new sap.ui.model.json.JSONModel();
                oJSONModelCount.loadData("./localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCount, "jsonCountries");

                var oJSONModelLayout = new sap.ui.model.json.JSONModel();
                oJSONModelLayout.loadData("./localService/mockdata/Layouts.json", false);
                oView.setModel(oJSONModelLayout, "jsonLayout");

                var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                    visibleID: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false
                });

                oView.setModel(oJSONModelConfig, "jsonModelConfig");

                this._bus = sap.ui.getCore().getEventBus();
                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);
                this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);

            },

            showEmployeeDetails: function (category, nameEvent, path) {
                var detailView = this.getView().byId("employeeDetailsView");
                detailView.bindElement("odataNorthwind>" + path);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                let incidenceModel = new sap.ui.model.json.JSONModel([]);
                detailView.setModel(incidenceModel, "incidenceModel");
                detailView.byId("tableIncidence").removeAllContent();

                this.onReadIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeId);
            },

            onSaveODataIncidence: function (channelId, eventId, data) {
                let oResourceBudle = this.getView().getModel("i18n").getResourceBundle();
                let employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
                let incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

                if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {
                    let body = {
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        Type: incidenceModel[data.incidenceRow].Type,
                        Reason: incidenceModel[data.incidenceRow].Reason
                    };

                    this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                        success: function () {
                            this.onReadIncidence.bind(this)(employeeId.toString());
                            sap.m.MessageToast.show(oResourceBudle.getText("odataSaveOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBudle.getText("odataSaveNOTOK"));
                        }.bind(this)

                    })

                } else {
                    sap.m.MessageToast.show(oResourceBudle.getText("odataNoChanges"));
                };

            },

            onReadIncidence: function (employeeId) {
                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeId),
                    ],

                    success: function (data) {
                        let incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                        incidenceModel.setData(data.results);
                        let tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                        tableIncidence.removeAllContent();

                        for (let incidence in data.results) {

                            let newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                            this._detailEmployeeView.addDependent(newIncidence);
                            newIncidence.bindElement("incidenceModel>/" + incidence);
                            tableIncidence.addContent(newIncidence);
                        }
                    }.bind(this),

                    error: function (e) {
                    }

                });
            }

        });

    });