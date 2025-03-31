sap.ui.define([
  "./Setting",
  "sap/m/MessageBox"

], (Setting,MessageBox) => {
  "use strict";

  return Setting.extend("mealentry.controller.View1", {
    onInit() {
      this._getTiffinDataData();
    },
   
    formatter: {
      formatDate: function(sDate) {
          if (!sDate) return "";
          let oDate = new Date(sDate);
          let dd = String(oDate.getDate()).padStart(2, '0');
          let mm = String(oDate.getMonth() + 1).padStart(2, '0');
          let yyyy = oDate.getFullYear();
          return dd + "-" + mm + "-" + yyyy;
      }
  },
  
    _getTiffinDataData: function () {
      var that = this;
      sap.ui.core.BusyIndicator.show();
      var sUrl = "https://meal-backend-sigma.vercel.app/api/meal"
      fetch(sUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(TiffinData => {
          sap.ui.core.BusyIndicator.hide();
          if (TiffinData?.error) {
            sap.m.MessageToast.show("Error: " + TiffinData.error);
          } else {
            that.getView().getModel("TiffinData").setData(TiffinData);
            that.getView().getModel("TiffinData").refresh(true);

          }
        })
        .catch(error => {
          sap.ui.core.BusyIndicator.hide();
          sap.m.MessageToast.show("Error occurred: " + error.message);
        });
    },

    onSaveTiffinData: function (oEvent) {
      var isValid = true, oView = this.getView();

      ["dateInput", "tiffinTimeSelect"].forEach(id => {
          let oInput = oView.byId(id), val = oInput?.getValue?.()?.trim() || oInput?.getSelectedKey?.()?.trim();
          oInput?.setValueState(val ? "None" : (isValid = false, "Error")).setValueStateText(val ? "" : "This field is required");
      });
      
      ["numTiffinAxay", "numTiffinKaushik"].forEach(id => {
          let oInput = oView.byId(id), val = oInput?.getValue?.();
          oInput?.setValueState(val >= 0 ? "None" : (isValid = false, "Error")).setValueStateText(val >= 0 ? "" : "This field is required");
      });
      
      if (!isValid) return sap.m.MessageToast.show("Please fill all required fields.");
      
      var that = this;
      sap.ui.core.BusyIndicator.show();
      var sUrl = "https://meal-backend-sigma.vercel.app/api/meal";
      var oData = this.getView().getModel("AddTiffinData").getData();
      var numTiffinAxay = this.getView().getModel("AddTiffinData").getData().NumberofTiffinAxay || 0;
      var numTiffinKaushikBhargav = this.getView().getModel("AddTiffinData").getData().NumberofTiffin_Kaushik_Bhargav || 0;
  
      oData.AxayMealPrice = numTiffinAxay * 80;
      oData.Kaushik_Bhargav_meal_Price = numTiffinKaushikBhargav * 80;

      fetch(sUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oData)
      })
        .then(response => response.json())
        .then(result => {
          sap.ui.core.BusyIndicator.hide();
          if (result?.error) {
            sap.m.MessageToast.show("Error: " + result.error);
          } else {
            sap.m.MessageToast.show("Tiffin Data Saved Successfully!");
            that.getView().getModel("TiffinData").setData(result);
            that.getView().getModel("TiffinData").refresh(true);
            oEvent.getSource().getParent().close();
            oEvent.getSource().getParent().destroy();
            this.getView().getModel("AddTiffinData").setData({});
          }
        })
        .catch(error => {
          sap.ui.core.BusyIndicator.hide();
          sap.m.MessageToast.show("Error occurred: " + error.message);
        });
    },
    onChangeValue:function(oEvent){
      debugger
      oEvent.getSource().setValueState("None")
    },

    onPressAddNewTiffinData: function (oEvent) {
      debugger
      var oToday = new Date();
      var sFormattedDate = oToday.toISOString().split("T")[0];
      this.getOwnerComponent().getModel("AddTiffinData").setProperty("/Date", sFormattedDate)
      var pDialogTimesheet;
      if (!pDialogTimesheet) {
        pDialogTimesheet = this.loadFragment({
          name: "mealentry.fragments.addData",
        });
      pDialogTimesheet.then(function (oDialogTimesheet) {
        oDialogTimesheet.open();
      });
    }
      var pDialogTimesheet;
      if (!pDialogTimesheet) {
        pDialogTimesheet = this.loadFragment({
          name: "mealentry.fragments.EditData",
        });
      }
      pDialogTimesheet.then(function (oDialogTimesheet) {
        oDialogTimesheet.open();
      });
  

    },
    onCancelTiffinData: function (oEvent) {
      oEvent.getSource().getParent().close();
      oEvent.getSource().getParent().destroy();
      this.getView().getModel("AddTiffinData").setData({});
    },
    onSearch: function () {
      var oTable = this.getView().byId("TiffinDataTable");
      var oBinding = oTable.getBinding("items");
      var oDateRange = this.getView().getModel("FilterModel").getData().FirstDate
      var oEndDate = this.getView().getModel("FilterModel").getData().SecondDate;
      var oTiffinTimeFilter = this.getView().getModel("FilterModel").getData().TiffinTime
      var sStartDate = oDateRange ? oDateRange.getFullYear() + "-" + String(oDateRange.getMonth() + 1).padStart(2, "0") + "-" + String(oDateRange.getDate()).padStart(2, "0") : null;
      var sEndDate = oEndDate ? oEndDate.getFullYear() + "-" + String(oEndDate.getMonth() + 1).padStart(2, "0") + "-" + String(oEndDate.getDate()).padStart(2, "0") : null;
      var aFilters = [];

      if (sStartDate && sEndDate) {
        aFilters.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.BT, sStartDate, sEndDate));
      }
      if (oTiffinTimeFilter) {
        aFilters.push(new sap.ui.model.Filter("TiffinTime", sap.ui.model.FilterOperator.EQ, oTiffinTimeFilter));
      }
      oBinding.filter(aFilters);
    },
    onClearFilter: function () {
      debugger
      this.getView().getModel("FilterModel").setData({});
      this.onSearch();
    },
    PressDownloadDataDialog: function () {
      debugger
      var oDialogDownload;
      if (!oDialogDownload) {
        oDialogDownload = this.loadFragment({
          name: "mealentry.fragments.pdfDownload",
        });
      }
      oDialogDownload.then(function (oDownloadDialog) {
        oDownloadDialog.open();
      });
    },

    onPressdeleteTiffinData: function (oEvent) {
      debugger;
      let aSelectedItems = this.byId("TiffinDataTable").getSelectedItems();

      if (aSelectedItems.length === 0) {
      sap.m.MessageToast.show("Please select items to delete.");
        return;
      }

      let sid = aSelectedItems[0].getBindingContext("TiffinData").getObject()._id;
      let apiUrl = "https://meal-backend-sigma.vercel.app/api/meal=" + sid;

      MessageBox.confirm("Are you sure you want to delete the selected item?", {
        title: "Confirm Deletion",
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        emphasizedAction: MessageBox.Action.YES,
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            sap.ui.core.BusyIndicator.show();

            fetch(apiUrl, { method: "DELETE" })
              .then(response => {
                if (!response.ok) {
                  throw new Error("Failed to delete selected items.");
                }
                return response.json();
              })
              .then((data) => {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Selected items deleted successfully.");
                this.getOwnerComponent().getModel("TiffinData").setData(data);
                this.getOwnerComponent().getModel("TiffinData").refresh(true);
              })
              .catch(error => {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Error occurred: " + error.message);
              });
          }
        }
      });
    },
    onSelectTableItems:function(oEvent){
      debugger
      if(oEvent.getSource().getSelectedItems().length !== 0){
        this.getView().byId("deletedataBTN").setVisible(true);
      }else{
        this.getView().byId("deletedataBTN").setVisible(false);

      }
    },

    ///////////////////////////////////PDF Download//////////////////////////////////////////////

    onDownloadPDFData: function (oEvent) {
      var aData = this.getView().getModel("TiffinData").getProperty("/");
      var sStartDate = this.getView().getModel("PDFDownloadData").getProperty("/TiffinDateRangeDownloadStartDate");
      var sEndDate = this.getView().getModel("PDFDownloadData").getProperty("/TiffinDateRangeDownloadSecondDate");

      if (!sStartDate || !sEndDate) {
        sap.m.MessageToast.show("Please select a date range.");
        return;
      }

      var aFilteredData = aData.filter(function (oItem) {
        var oItemDate = new Date(oItem.Date);
        return oItemDate >= new Date(sStartDate) && oItemDate <= new Date(sEndDate);
      });


      var totalTiffinAxay = aFilteredData.reduce((sum, oItem) => sum + (oItem.NumberofTiffinAxay || 0), 0);
      var totalTiffinKaushikBhargav = aFilteredData.reduce((sum, oItem) => sum + (oItem.NumberofTiffin_Kaushik_Bhargav || 0), 0);
      var totalPriceAxay = aFilteredData.reduce((sum, oItem) => sum + (oItem.AxayMealPrice || 0), 0);
      var totalPriceKaushikBhargav = aFilteredData.reduce((sum, oItem) => sum + (oItem.Kaushik_Bhargav_meal_Price || 0), 0);
      if (aFilteredData.length === 0) {
        sap.m.MessageToast.show("No data found for the selected date range.");
        return;
      }

      var doc = new window.jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      let titleText = "Tiffin Data Report";
      let pageWidth = doc.internal.pageSize.getWidth();
      let titleX = pageWidth / 2 - (doc.getTextWidth(titleText) / 2);
      doc.text(titleText, titleX, 15);



      var aHeaders = [["Date", "Tiffins (Axay)", "Tiffins (Kaushik Bhargav)", "Tiffin Time"]];

      var aRows = aFilteredData.map(function (oItem) {
        return [oItem.Date, oItem.NumberofTiffinAxay, oItem.NumberofTiffin_Kaushik_Bhargav, oItem.TiffinTime];
      });

      doc.autoTable({
        head: aHeaders,
        body: aRows,
        startY: 25,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 40 },
          1: { halign: "center", cellWidth: 45 },
          2: { halign: "center", cellWidth: 55 },
          3: { halign: "center", cellWidth: 40 }
        }
      });


      let finalY = doc.lastAutoTable.finalY + 10;
      let boxX = 14;
      let boxY = finalY;
      let boxWidth = 180;
      let boxHeight = 50;

      doc.setDrawColor(0);
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(0);
      let summaryTitle = "Summary";
      let summaryTitleX = boxX + (boxWidth / 2) - (doc.getTextWidth(summaryTitle) / 2);
      doc.text(summaryTitle, summaryTitleX, boxY + 8);

      doc.setFontSize(12);
      let summaryData = [
        `Axay Total Tiffins : ${totalTiffinAxay}`,
        `Kaushik Bhargav Total Tiffins : ${totalTiffinKaushikBhargav}`,
        `Axay Total Tiffin Price (Axay): ${totalPriceAxay.toLocaleString("en-IN", { useGrouping: true })}`,
        `Kaushik Bhargav Total Tiffin Price: ${totalPriceKaushikBhargav.toLocaleString("en-IN", { useGrouping: true })}`,
        `Kaushik Tiffins Price: ${(totalPriceKaushikBhargav / 2).toLocaleString("en-IN", { useGrouping: true })}`,
        `Bhargav Tiffins Price: ${(totalPriceKaushikBhargav / 2).toLocaleString("en-IN", { useGrouping: true })}`
      ];

      for (var j = 0; j < summaryData.length; j++) {
        doc.text(summaryData[j], boxX + 10, boxY + 15 + (j * 6));
      }
      doc.save("TiffinData.pdf");
      oEvent.getSource().getParent().close();
      oEvent.getSource().getParent().destroy();
    },
  });
});
