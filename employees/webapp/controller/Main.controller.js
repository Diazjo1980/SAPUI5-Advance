//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],

    function (Controller, MessageBox) {

        return Controller.extend("logaligroup.employees.controller.Main", {

            onBeforeRendering: function () {
                this._detailEmployeeView = this.getView().byId("employeeDetailsView");
            },

            onInit: function () {
                var oView = this.getView();
                //let i18nBundle = oView.getModel("i18n").getResourceBundle();

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

                this._bus.subscribe("incidence", "onDeleteIncidence", function (channelId, eventId, data) {

                    let oResourceBudle = this.getView().getModel("i18n").getResourceBundle();
                    this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
                        "',SapId='" + data.SapId +
                        "',EmployeeId='" + data.EmployeeId + "')", {
                        success: function () {
                            this.onReadIncidence.bind(this)(data.EmployeeId.toString());
                            sap.m.MessageToast.show(oResourceBudle.getText("odataDeleteOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBudle.getText("odataDeleteNOTOK"));
                        }.bind(this)

                    });

                }, this);

            },

            showEmployeeDetails: function (category, nameEvent, path) {
                var detailView = this.getView().byId("employeeDetailsView");
                detailView.bindElement("odataNorthwind>" + path);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                let incidenceModel = new sap.ui.model.json.JSONModel([]);
                detailView.setModel(incidenceModel, "incidenceModel");
                detailView.byId("tableIncidence").removeAllContent();

                this.onReadIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);
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
                            MessageBox.success(oResourceBudle.getText("odataSaveOK"));
                            //sap.m.MessageToast.show(oResourceBudle.getText("odataSaveOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBudle.getText("odataSaveNOTOK"));
                        }.bind(this)

                    })

                } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                    incidenceModel[data.incidenceRow].ReasonX ||
                    incidenceModel[data.incidenceRow].TypeX) {

                    let body = {

                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                        Type: incidenceModel[data.incidenceRow].Type,
                        TypeX: incidenceModel[data.incidenceRow].TypeX,
                        Reason: incidenceModel[data.incidenceRow].Reason,
                        ReasonX: incidenceModel[data.incidenceRow].ReasonX

                    };

                    this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                        "',SapId='" + incidenceModel[data.incidenceRow].SapId +
                        "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                        success: function () {
                            this.onReadIncidence.bind(this)(employeeId.toString());
                            sap.m.MessageToast.show(oResourceBudle.getText("odataUpdateOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBudle.getText("odataUpdateNOTOK"));
                        }.bind(this)

                    });

                }
                else {
                    sap.m.MessageToast.show(oResourceBudle.getText("odataNoChanges"));
                };

            },

            onReadIncidence: function (employeeId) {
                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeId.toString()),
                    ],

                    success: function (data) {
                        let incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                        incidenceModel.setData(data.results);
                        let tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                        tableIncidence.removeAllContent();

                        for (let incidence in data.results) {

                            data.results[incidence]._validateState = true;
                            data.results[incidence].EnabledSave = false;

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