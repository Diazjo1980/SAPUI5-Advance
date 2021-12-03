//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
    ], 
    
    function(Controller){
    
        return Controller.extend("logaligroup.employees.controller.Main", {
    
            onInit: function() {
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
                
            },

            showEmployeeDetails: function(category, nameEvent, path) {
                var detailView = this.getView().byId("employeeDetailsView");
                detailView.bindElement("jsonEmployees>" + path);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");
            }
    
        });
    
    });