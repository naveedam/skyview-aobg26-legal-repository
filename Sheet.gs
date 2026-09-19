/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Sheet.gs
 * Description: Master Register and hidden Settings sheet management.
 * Strictly reads and writes configuration dynamically from the hidden Settings sheet.
 */

/**
 * Retrieves the Master Register spreadsheet.
 * Reads the spreadsheet ID from the hidden Settings sheet / Script Properties.
 *
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getMasterSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('MASTER_REGISTER_ID');
  
  if (!sheetId) {
    // Attempt auto-discovery in Google Drive before failing
    try {
      var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
      if (files.hasNext()) {
        var foundSheet = files.next();
        sheetId = foundSheet.getId();
        props.setProperty('MASTER_REGISTER_ID', sheetId);
      }
    } catch (e) {
      Logger.log('Drive discovery error in getMasterSpreadsheet: ' + e);
    }
  }
  
  if (!sheetId) {
    throw new Error('Skyview Master Register is not configured. Please initialize the repository first.');
  }
  
  return SpreadsheetApp.openById(sheetId);
}

/**
 * Returns the active 'Register' sheet
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getRegisterSheet() {
  var ss = getMasterSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_REGISTER);
  if (!sheet) {
    throw new Error('Register sheet not found in Skyview Master Register spreadsheet.');
  }
  return sheet;
}

/**
 * Returns the hidden 'Settings' sheet where all dynamic IDs and parameters are preserved
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
 * Retrieves a configuration setting.
 * First checks the hidden Settings sheet in the Master Register, with ScriptProperties fallback.
 *
 * @param {string} key Configuration key (e.g. 'ROOT_FOLDER_ID', 'VENUS_FOLDER_ID')
 * @return {string} Setting value or empty string
 */
function getSetting(key) {
  var cleanKey = sanitizeText(key);
  if (!cleanKey) return '';
  
  // 1. Fast cache lookup via Script Properties
  var props = PropertiesService.getScriptProperties();
  var cachedVal = props.getProperty(cleanKey);
  if (cachedVal) return cachedVal;
  
  // 2. Authoritative lookup from hidden Settings sheet
  try {
    var sheetId = props.getProperty('MASTER_REGISTER_ID');
    if (!sheetId) {
      try {
        var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
        if (files.hasNext()) {
          sheetId = files.next().getId();
          props.setProperty('MASTER_REGISTER_ID', sheetId);
        }
      } catch (dErr) {}
    }
    if (sheetId) {
      var ss = SpreadsheetApp.openById(sheetId);
      var settingsSheet = ss.getSheetByName(SHEET_NAME_SETTINGS);
      if (settingsSheet) {
        var data = settingsSheet.getDataRange().getValues();
        for (var i = 0; i < data.length; i++) {
          var rowKey = sanitizeText(data[i][0]);
          if (rowKey === cleanKey) {
            var val = data[i][1] ? data[i][1].toString().trim() : '';
            props.setProperty(cleanKey, val); // update cache
            return val;
          }
        }
      }
    }
  } catch (e) {
    Logger.log('Error reading setting "' + cleanKey + '" from sheet: ' + e);
  }
  
  return '';
}

/**
 * Saves a configuration setting to both the hidden Settings sheet and Script Properties.
 * Ensures zero hardcoding of IDs.
 *
 * @param {string} key Configuration key
 * @param {string} value Value to store
 * @param {string} [description] Optional human-readable description
 */
function saveSetting(key, value, description) {
  var cleanKey = sanitizeText(key);
  var cleanVal = sanitizeText(value);
  var cleanDesc = sanitizeText(description);
  
  var props = PropertiesService.getScriptProperties();
  props.setProperty(cleanKey, cleanVal);
  
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
        if (sanitizeText(data[i][0]) === cleanKey) {
          settingsSheet.getRange(i + 1, 2).setValue(cleanVal);
          if (cleanDesc) {
            settingsSheet.getRange(i + 1, 3).setValue(cleanDesc);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        settingsSheet.appendRow([cleanKey, cleanVal, cleanDesc || 'System parameter']);
      }
    }
  } catch (e) {
    Logger.log('Error writing setting "' + cleanKey + '" to sheet: ' + e);
  }
}

/**
 * Returns all key-value configuration rows from the hidden Settings sheet
 * @return {Array<Object>}
 */
function getAllSettings() {
  try {
    var settingsSheet = getSettingsSheet();
    var data = settingsSheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      list.push({
        key: data[i][0].toString(),
        value: data[i][1] ? data[i][1].toString() : '',
        description: data[i][2] ? data[i][2].toString() : ''
      });
    }
    return list;
  } catch (e) {
    Logger.log('Error reading all settings: ' + e);
    return [];
  }
}

/**
 * Appends multiple rows of document records to the Register sheet in a single atomic batch
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
  
  // Format timestamps
  sheet.getRange(startRow, 2, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

/**
 * Retrieves all records from the Register sheet as an array of structured objects
 * @return {Array<Object>}
 */
function getAllRegisterRecords() {
  try {
    var sheet = getRegisterSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, REGISTER_COLUMNS.length).getValues();
    var records = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[2]) continue; // Skip blank rows
      
      var record = {};
      for (var c = 0; c < REGISTER_COLUMNS.length; c++) {
        var key = REGISTER_COLUMNS[c];
        var val = row[c];
        
        if (val instanceof Date) {
          record[key] = Utilities.formatDate(val, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
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
 * Calculates statistical metrics for the Admin Dashboard
 * @return {Object}
 */
function getRegisterStats() {
  var records = getAllRegisterRecords();
  var totalFiles = records.length;
  
  var submissionIds = {};
  var uniqueUnits = {};
  var venusCount = 0;
  var jupiterCount = 0;
  var legalStatusMap = {};
  var docTypeMap = {};
  
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var subId = r['Submission ID'];
    if (subId) submissionIds[subId] = true;
    
    var uCode = r['Unit Code'];
    if (uCode) uniqueUnits[uCode] = true;
    
    var block = r['Block'] || '';
    if (block.toLowerCase() === 'venus') venusCount++;
    if (block.toLowerCase() === 'jupiter') jupiterCount++;
    
    var status = r['Legal Status'] || 'Unspecified';
    legalStatusMap[status] = (legalStatusMap[status] || 0) + 1;
    
    var dType = r['Document Type'] || 'Other';
    docTypeMap[dType] = (docTypeMap[dType] || 0) + 1;
  }
  
  return {
    totalSubmissions: Object.keys(submissionIds).length,
    totalFiles: totalFiles,
    uniqueUnits: Object.keys(uniqueUnits).length,
    venusDocuments: venusCount,
    jupiterDocuments: jupiterCount,
    legalStatusMap: legalStatusMap,
    docTypeMap: docTypeMap
  };
}
