sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("mealentry.controller.Setting", {
      onPressSetting: function () {
        debugger
        var pDialogTimesheet;
        if (!pDialogTimesheet) {
          pDialogTimesheet = this.loadFragment({
            name: "mealentry.fragments.setting",
          });
        }
        pDialogTimesheet.then(function (oDialogTimesheet) {
          oDialogTimesheet.open();
        });
  
      },
      onPressSettingItems: function (oEvent) {
        debugger
  
        this.getOwnerComponent().getModel("TiffinTitle").setData(oEvent.getParameter("listItem").getTitle());
        this.getView().byId("FlexibleColumnLayoutSetting").setLayout("MidColumnFullScreen")
      },
      onPressNavBackSetting: function () {
        this.getView().byId("FlexibleColumnLayoutSetting").setLayout("OneColumn")
        debugger
  
      },
  
      onPressSettingApplyTheme: function () {
        if (!this.getView().byId("idThemeList").getSelectedItem()) {
          sap.m.MessageToast.show("Please select a theme.");
          return;
        }
        sap.ui.core.BusyIndicator.show();
        let oPayload = {
          "Theme": this.getView().byId("idThemeList").getSelectedItem().getId().split("-").pop()
        };
        let apiUrl = "https://meal-backend-sigma.vercel.app/api/meal";
  
        fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(oPayload)
        })
          .then(response => {
            if (!response.ok) throw new Error("Failed to update profile.");
            return response.json();
          })
          .then(data => {
            sap.ui.core.BusyIndicator.hide();
            sap.ui.getCore().applyTheme(this.getView().byId("idThemeList").getSelectedItem().getId().split("-").pop());
            sap.m.MessageToast.show("Theme applied: " + this.getView().byId("idThemeList").getSelectedItem().getId().split("-").pop());
            this.getView().getOwnerComponent().getModel("TiffinData").setData(data);
            this.getView().getOwnerComponent().getModel("TiffinData").refresh(true);
          })
          .catch(error => {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Error: " + error.message);
          });
      },
      CancelThemeSettingcancelPress: function (oEvent) {
        debugger
        var oModel = this.getView().getModel("TiffinData").getData().Theme;
        var oListItems = this.getView().byId("idThemeList").getItems()
        oListItems.forEach(element => {
          var items = element.getId().split("-").pop()
          if (oModel === items) {
            this.getView().byId("idThemeList").setSelectedItem(element, true)
          }
        });
        this.getView().byId("FlexibleColumnLayoutSetting").setLayout("OneColumn");
      },
  
  
      onToggleSoundandVibrate: function () {
        debugger
        sap.ui.core.BusyIndicator.show();
        let oPayload = {
          "Sound": this.getView().byId("soundSwitch").getState(),
          "Vibrate": this.getView().byId("vibrationSwitch").getState()
        };
        let apiUrl = "https://meal-backend-sigma.vercel.app/api/meal";
  
        fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(oPayload)
        })
          .then(response => {
            if (!response.ok) throw new Error("Failed to update profile.");
            return response.json();
          })
          .then(data => {
            sap.ui.core.BusyIndicator.hide();
            sap.ui.getCore().applyTheme(this.getView().byId("idThemeList").getSelectedItem().getId().split("-").pop());
            sap.m.MessageToast.show("Theme applied: " + this.getView().byId("idThemeList").getSelectedItem().getId().split("-").pop());
            this.getView().getOwnerComponent().getModel("TiffinData").setData(data);
            this.getView().getOwnerComponent().getModel("TiffinData").refresh(true);
          })
          .catch(error => {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Error: " + error.message);
          });
      },


    });
});
