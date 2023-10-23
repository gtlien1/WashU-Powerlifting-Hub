//written in Google Scripts
function clearRange() {

  //clear attendance sheet
  var sheet = SpreadsheetApp.openById("1OvG6Zc6MqFOJLm4Qfgh8jEhGD80PeGmamroI0M6hrxg");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var rowsDeleted = 0;  
  
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    sheet.deleteRow((parseInt(i)+1) - rowsDeleted);
    rowsDeleted++;
  }
  
  var rows = sheet.getDataRange();

  var rowsDeleted = 0;
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    if (row[0] == '') { // This searches all cells in columns A (change to row[1] for columns B and so on) and deletes row if cell is empty or has value 'delete'.
      sheet.deleteRow((parseInt(i)+1) - rowsDeleted);
      rowsDeleted++;
    }
  }

  //clear pickup sheet
  var pickup = sheet.getSheetByName("Pickup");
  var rows = pickup.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var rowsDeleted = 0;  
  
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    pickup.deleteRow((parseInt(i)+1) - rowsDeleted);
    rowsDeleted++;
  }
  
  var rows = pickup.getDataRange();

  var rowsDeleted = 0;
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    if (row[0] == '') { // This searches all cells in columns A (change to row[1] for columns B and so on) and deletes row if cell is empty or has value 'delete'.
      pickup.deleteRow((parseInt(i)+1) - rowsDeleted);
      rowsDeleted++;
    }
  }
}
