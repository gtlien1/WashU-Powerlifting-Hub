//function written in Google Script
function attendanceTracker() {
  var sheet = SpreadsheetApp.openById("1OvG6Zc6MqFOJLm4Qfgh8jEhGD80PeGmamroI0M6hrxg");
  var attendance = sheet.getSheetByName("Attendance Form");
  var tracker = sheet.getSheetByName("Attendance Tracker");
  var rows = attendance.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  const currentDate = new Date().toJSON().slice(0,10);
  console.log(currentDate);
  
  let columnNum;

  //find columnn to place attendance tracking
  for (var i = 1; i < tracker.getDataRange().getNumColumns(); i++){
    dateTracker = JSON.stringify(tracker.getRange(6,i).getValue()).slice(1,11);
    if(dateTracker == currentDate){
      columnNum = i;
    }
  }

  console.log(columnNum);

  var yesSet = new Set();
  var noSet = new Set();

  for (var i = 2; i <= numRows; i++){
    if(attendance.getRange(i, 5).getValue() == "Yes"){
      yesSet.add(attendance.getRange(i, 3).getValue());
    }
    else if(attendance.getRange(i, 5).getValue() == "No"){
      noSet.add(attendance.getRange(i, 3).getValue());
    }
  }

  for (var t = 7; t <= tracker.getDataRange().getNumRows(); t++){
    //finds rows where names are equivalent
    if(yesSet.has(tracker.getRange(t,1).getValue())){
      tracker.getRange(t,columnNum).setValue("Yes");
    }
    else if(noSet.has(tracker.getRange(t,1).getValue())){
      tracker.getRange(t,columnNum).setValue("No");
    }
    else{
      tracker.getRange(t,columnNum).setValue("#N/A");
    }
  }
}

