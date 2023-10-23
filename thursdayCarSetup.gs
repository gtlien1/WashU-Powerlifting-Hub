//function written in Google Script
function thursdayCarSetup() {
  var sheet = SpreadsheetApp.openById("1OvG6Zc6MqFOJLm4Qfgh8jEhGD80PeGmamroI0M6hrxg");
  var attendance = sheet.getSheetByName("Attendance Form");
  var pickup = sheet.getSheetByName("Pickup");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  var rows2 = pickup.getDataRange();
  var numRows2 = rows2.getNumRows();

  var locations = new Map();
  var riders = new Map();
  var totalSpace = 0;
  var totalRiders = 0;

  //clear duplicates from attendance
  for (var i = numRows; i > 1; i--){
    for (var t = numRows; t > 1; t--){
      if(attendance.getRange(i, 3).getValue() == attendance.getRange(t,3).getValue() && i != t){
        attendance.deleteRow(t);
      }
    }
  }
  rows.sort({column:9, ascending: false});

  //clear recent pickup entry
  var rowsDeleted = 0; 
  for (var i = 1; i <= numRows2 - 1; i++) {
    var row = values[i];
    pickup.deleteRow((parseInt(i)+1) - rowsDeleted);
    rowsDeleted++;
  }
  var rowsDeleted = 0;
  for (var i = 1; i <= numRows2 - 1; i++) {
    var row = values[i];
    if (row[0] == '') { // This searches all cells in columns A (change to row[1] for columns B and so on) and deletes row if cell is empty or has value 'delete'.
      pickup.deleteRow((parseInt(i)+1) - rowsDeleted);
      rowsDeleted++;
    }
  }

  //iterate through all rows and tally locations
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    if(row[1] == "Thursday, 7pm - 9pm"){
      if(locations.get(row[9]) == null && row[9] != '' && row[9] != "I'm driving myself"){
        locations.set(row[9], 0);
      }
      if(row[9] != '' && row[9] != "I'm driving myself"){
        riders.set(row[2], row[9]);
        locations.set(row[9], locations.get(row[9])+1);
        totalRiders++;
      }
    }
  }

  //iterates through all rows and grabs drivers, adds drivers and their seats to dictionary drivers
  var drivers = new Map();
  var drivers2 = new Map();
  var extraDrivers = new Map();
  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i];
    if(row[1] == "Thursday, 7pm - 9pm"){
      if (row[6] == 'Yes'){
        totalSpace = totalSpace + row[8];
        drivers.set(row[2],row[8]);
        drivers2.set(row[2],row[8]);
      }
    }
  }

  //if there are not enough drivers, ping
  if (totalSpace < (totalRiders)){
    MailApp.sendEmail({
      to: "22fioriglioc@gmail.com",
      subject: "Not enough car space!",
      htmlBody: "There are more riders than available car spaces!"
    });
    throw new Error("Not enough drivers");
  }

  //insert data into new pickup sheet
  //places drivers in new list, loops through car space numbers and should check if match int in location
  //matches drivers to location if driver spots available match location number
  var iterable1 = 2;
  var iterable2 = 2;
  for (const [j, k] of drivers.entries()) {
    iterable2 = iterable1;
    for (const [i,l] of locations.entries()){
      if (k == l){
        pickup.getRange(iterable2, 1).setValue(i);
        locations.delete(i);
        iterable2++;
      }
    }
    pickup.getRange(iterable1, 2).setValue(j);
    if(!pickup.getRange(iterable1, 1).isBlank()){
      drivers.delete(j);
    }
    iterable1++;
  }  

  //iterate through rest of drivers, assign highest driver 
  rows2 = pickup.getDataRange();
  numRows2 = rows2.getNumRows();
  var nextDriver;
  var nextDriver = "";
  var nextLocation = "";
  var filled = false;
  while(locations.size != 0 && drivers.size != 0){
    highestDriver = 0;
    highestLocation = 0;
    //sets highestLocation to location with highest demand
    for (const [i,l] of locations.entries()){
      if(locations.get(i) > highestLocation){
        highestLocation = locations.get(i);
        nextLocation = i;
      }
    }
    //sets highestDriver to driver with greatest spaces remaining
    //needs fixing. if driver already has location, cannot pick again
    for (const [j, k] of drivers.entries()) {
      if(drivers.get(j) > highestDriver){
        highestDriver = drivers.get(j);
        nextDriver = j;
      }
    }
    //assign location to driver
    //subtract spaces from driver, subtract spaces from location remaining
    //if spaces remaining from driver is 0, delete from dictionary
    //if spaces remaining from location is 0, delete from dictionary
    for (var i = 2; i <= numRows2; i++) {
      if(pickup.getRange(i, 2).getValue() == nextDriver && pickup.getRange(i, 1).isBlank()){
        pickup.getRange(i, 1).setValue(nextLocation);
        if (drivers.get(nextDriver) > locations.get(nextLocation)){
          extraDrivers.set(nextDriver, drivers.get(nextDriver) - locations.get(nextLocation));
          locations.delete(nextLocation);
          drivers.delete(nextDriver);
          break;
        }
        else{
          locations.set(nextLocation, locations.get(nextLocation) - drivers.get(nextDriver));
          drivers.delete(nextDriver);
          break;
        }
      }
    }
  }

  //delete extra drivers
  for (var i = 2; i <= numRows2; i++) {
      if(!pickup.getRange(i, 2).isBlank() && pickup.getRange(i, 1).isBlank()){
        pickup.deleteRow(i);
      }
  }

  //assign extra locations
  for(const [j, k] of locations.entries()) {
    var nextBlankRow = 2;
    while(!pickup.getRange(nextBlankRow, 1).isBlank()){
      nextBlankRow++;
    }
    pickup.getRange(nextBlankRow,1).setValue(j);

    //subtract out possible locations based on number of spaces left drivers
  }

  //there may be extra drivers, if a driver has so much space that they get double assigned, we may double assign some and not single assign others.
  //place extra locations
  var nextDriver;
  var nextDriver = "";
  var nextLocation = "";
  var filled = false;
  while(locations.size != 0 && extraDrivers.size != 0){
    highestDriver = 0;
    highestLocation = 0;
    //sets highestLocation to location with highest demand
    for (const [i,l] of locations.entries()){
      if(locations.get(i) > highestLocation){
        highestLocation = locations.get(i);
        nextLocation = i;
      }
    }
    //sets highestDriver to driver with greatest spaces remaining
    //needs fixing. if driver already has location, cannot pick again
    for (const [j, k] of extraDrivers.entries()) {
      if(extraDrivers.get(j) > highestDriver){
        highestDriver = extraDrivers.get(j);
        nextDriver = j;
      }
    }
    //assign extra locations to driver
    //subtract spaces from driver, subtract spaces from location remaining
    //if spaces remaining from driver is 0, delete from dictionary
    //if spaces remaining from location is 0, delete from dictionary
    rows2 = pickup.getDataRange();
    numRows2 = rows2.getNumRows();
    for (var i = 2; i <= numRows2; i++) {
      if(pickup.getRange(i, 2).isBlank() && extraDrivers.get(nextDriver) >= locations.get(pickup.getRange(i,1).getValue())){
        pickup.getRange(i, 2).setValue(nextDriver);
        extraDrivers.set(nextDriver, extraDrivers.get(nextDriver) - locations.get(nextLocation));
        locations.delete(nextLocation);
        break;
        }
      else if(pickup.getRange(i, 2).isBlank() && extraDrivers.get(nextDriver) < locations.get(pickup.getRange(i,1).getValue())){
        pickup.getRange(i, 2).setValue(nextDriver);
        //should not put all locations in, should only put extra location in
        var nextBlankRow = 2;
        while(!pickup.getRange(nextBlankRow, 1).isBlank()){
          nextBlankRow++;
        }
        pickup.getRange(nextBlankRow,1).setValue(nextLocation);
        locations.set(nextLocation, locations.get(nextLocation) - extraDrivers.get(nextDriver));
        extraDrivers.delete(nextDriver);
      }
    }
  }

  //iterate through all rows and grab riders
  var potentialRider;
  var counter = 0;
  for (var i = 2; i <= numRows2; i++){
    for(var j = 5; j < drivers2.get(pickup.getRange(i,2).getValue())+5; j++){
      for(const [l,m] of riders.entries()){
        if (pickup.getRange(i, 1).getValue() == m){
          potentialRider = l;
          counter++;
          break;
        }
      }
      pickup.getRange(i,j).setValue(potentialRider);
      riders.delete(potentialRider);
      potentialRider = "";
    }
    drivers2.set(pickup.getRange(i,2).getValue(), drivers2.get(pickup.getRange(i,2).getValue()) - counter);
    counter = 0;
  }

  rows2 = pickup.getDataRange();
  numRows2 = rows2.getNumRows();
  // add phone numbers and car description
  for (var i = 2; i <= numRows2; i++) {
        var personrow;
        for (var j = 2; j <= numRows; j++){
          if (attendance.getRange(j,3).getValue() == pickup.getRange(i,2).getValue()){
            personrow = j;
          }
        }
        pickup.getRange(i,3).setValue(attendance.getRange(personrow, 4).getValue());
        pickup.getRange(i,4).setValue(attendance.getRange(personrow, 8).getValue());
  }
  //sort rows
  rows2.sort(1);
  
  //resize cells for viewing
  columns = rows2.getNumColumns();
  for(var i = 1; i <= columns; i++){
    pickup.autoResizeColumn(i);
  }
}
