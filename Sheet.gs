/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Sheet.gs
 * Description: Master Register and Settings sheet management, batch row appending, and querying.
 */

var REGISTER_COLUMNS = [
  'Submission ID',
  'Upload Timestamp',
  'Member Name',
  'Mobile',
  'Email',
  'Legal Status',
  'Block',
  'Tower',
  'Floor',
  'Flat',
  'Unit Code',
  'Document Type',
  'Remarks',
  'Original Filename',
  'Stored Filename',
  'Google Drive File ID',
  'Google Drive Link'
];

var SHEET_NAME_REGISTER = 'Register';
var SHEET_NAME_SETTINGS = 'Settings';

/**
 * Retrieves the Master Register spreadsheet using the stored ID
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getMasterSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('MASTER_REGISTER_ID');
  
  if (!sheetId) {
    throw new Error('Repository is not initialized. Please run Administrator Setup first.');
  }
  
  return SpreadsheetApp.openById(sheetId);
}

/**
 * Returns the Register sheet
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getRegisterSheet() {
  var ss = getMasterSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_REGISTER);
  if (!sheet) {
    throw new Error('Register sheet not found in Master Spreadsheet.');
  }
  return sheet;
}

/**
 * Returns the Settings sheet
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSettingsSheet() {
  var ss = getMasterSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_SETTINGS);
    sheet.hideSheet();
  }
  return sheet;
}

/**
 * Appends multiple rows of document records to the Register sheet in a single batch
 * @param {Array<Array<any>>} rows Array of row data matching REGISTER_COLUMNS
 */
function appendRegisterRows(rows) {
  if (!rows || rows.length === 0) return;
  
  var sheet = getRegisterSheet();
  var startRow = sheet.getLastRow() + 1;
  var numRows = rows.length;
  var numCols = rows[0].length;
  
  var range = sheet.getRange(startRow, 1, numRows, numCols);
  range.setValues(rows);
  
  // Format timestamps and text wrapping if needed
  sheet.getRange(startRow, 2, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

/**
 * Retrieves all records from the Register sheet as an array of objects
 * @return {Array<Object>}
 */
function getAllRegisterRecords() {
  try {
    var sheet = getRegisterSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return []; // Header only or empty
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, REGISTER_COLUMNS.length).getValues();
    var records = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      // Skip empty rows
      if (!row[0] && !row[2]) continue;
      
      var record = {};
      for (var c = 0; c < REGISTER_COLUMNS.length; c++) {
        var key = REGISTER_COLUMNS[c];
        var val = row[c];
        
        if (val instanceof Date) {
          record[key] = Utilities.formatDate(val, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
        } else {
          record[key] = val !== null && val !== undefined ? val.toString() : '';
        }
      }
      records.push(record);
    }
    
    return records;
  } catch (e) {
    Logger.log('Error reading register records: ' + e);
    return [];
  }
}

/**
 * Saves a key-value setting to both ScriptProperties and the hidden Settings sheet
 * @param {string} key
 * @param {string} value
 */
function saveSetting(key, value) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(key, value);
  
  try {
    var sheetId = props.getProperty('MASTER_REGISTER_ID');
    if (sheetId) {
      var ss = SpreadsheetApp.openById(sheetId);
      var settingsSheet = ss.getSheetByName(SHEET_NAME_SETTINGS);
      if (!settingsSheet) {
        settingsSheet = ss.insertSheet(SHEET_NAME_SETTINGS);
        settingsSheet.hideSheet();
      }
      
      var data = settingsSheet.getDataRange().getValues();
      var found = false;
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === key) {
          settingsSheet.getRange(i + 1, 2).setValue(value);
          found = true;
          break;
        }
      }
      if (!found) {
        settingsSheet.appendRow([key, value]);
      }
    }
  } catch (e) {
    Logger.log('Could not update Settings sheet for ' + key + ': ' + e);
  }
}

/**
 * Retrieves a setting by key
 * @param {string} key
 * @return {string}
 */
function getSetting(key) {
  var props = PropertiesService.getScriptProperties();
  var val = props.getProperty(key);
  if (val) return val;
  
  // Fallback to Settings sheet
  try {
    var sheetId = props.getProperty('MASTER_REGISTER_ID');
    if (sheetId) {
      var ss = SpreadsheetApp.openById(sheetId);
      var settingsSheet = ss.getSheetByName(SHEET_NAME_SETTINGS);
      if (settingsSheet) {
        var data = settingsSheet.getDataRange().getValues();
        for (var i = 0; i < data.length; i++) {
          if (data[i][0] === key) {
            props.setProperty(key, data[i][1].toString());
            return data[i][1].toString();
          }
        }
      }
    }
  } catch (e) {
    Logger.log('Could not read Setting ' + key + ': ' + e);
  }
  return '';
}
