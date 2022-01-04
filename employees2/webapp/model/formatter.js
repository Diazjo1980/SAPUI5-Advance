sap.ui.define([

], function() {

    let timeDay = 24 * 60 * 60 * 1000;

    function dateFormat(date){

        if (date) {

            let dateNow = new Date();
            let dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy/MM/dd" });
            let dateFormatNow = new Date(dateFormat.format(dateNow));
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    
            switch(true){
    
                //today
                case date.getTime() === dateFormatNow.getTime():
                    return oResourceBundle.getText("today");
    
                //tomorrow
                case date.getTime() === dateFormatNow.getTime() + timeDay:
                    return oResourceBundle.getText("tomorrow");
    
                //yesterday
                case date.getTime() === dateFormatNow.getTime() - timeDay:
                    return oResourceBundle.getText("yesterday");
    
                default: return "";
            }
        }
    }

    return { dateFormat : dateFormat };
    
});