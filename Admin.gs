/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Admin.gs
 * Description: One-time repository initialization, folder hierarchy generation,
 * dashboard metrics calculation, search filtering, and CSV export.
 */

/**
 * Checks if the repository has been initialized
 * @return {Object} { initialized: boolean, rootFolderId: string, spreadsheetId: string }
 */
/**
 * Checks if the repository has been initialized
 * @return {Object} { initialized: boolean, rootFolderId: string, spreadsheetId: string }
 */
function checkRepositoryStatus() {
  var props = PropertiesService.getScriptProperties();
  var rootFolderId = props.getProperty('ROOT_FOLDER_ID');
  var masterRegisterId = props.getProperty('MASTER_REGISTER_ID');
  
  var isReady = false;
  var rootFolderUrl = '';
  var spreadsheetUrl = '';
  
  if (rootFolderId && masterRegisterId) {
    try {
      var rootFolder = DriveApp.getFolderById(rootFolderId);
      var ss = SpreadsheetApp.openById(masterRegisterId);
      rootFolderUrl = rootFolder.getUrl();
      spreadsheetUrl = ss.getUrl();
      isReady = true;
    } catch (e) {
      Logger.log('Drive/Sheet access verification error: ' + e);
      isReady = false;
    }
  } else {
    // Fallback: Check if repository was already created in Google Drive
    try {
      var folders = DriveApp.getFoldersByName('Skyview Legal Repository');
      if (folders.hasNext()) {
        var existingRoot = folders.next();
        var files = existingRoot.getFilesByName('Skyview Master Register');
        if (files.hasNext()) {
          var existingSheet = files.next();
          rootFolderId = existingRoot.getId();
          masterRegisterId = existingSheet.getId();
          props.setProperty('ROOT_FOLDER_ID', rootFolderId);
          props.setProperty('MASTER_REGISTER_ID', masterRegisterId);
          rootFolderUrl = existingRoot.getUrl();
          spreadsheetUrl = existingSheet.getUrl();
          isReady = true;
        }
      }
    } catch (discoveryErr) {
      Logger.log('Auto-discovery check error: ' + discoveryErr);
    }
  }
  
  return {
    initialized: isReady,
    rootFolderId: rootFolderId || '',
    rootFolderUrl: rootFolderUrl,
    spreadsheetId: masterRegisterId || '',
    spreadsheetUrl: spreadsheetUrl,
    isAdmin: checkIsAdminUser()
  };
}

/**
 * One-time self-initializing repository setup
 * Automatically creates the exact folder tree, Master Register spreadsheet, and hidden Settings sheet.
 * Stores all generated Folder IDs and Spreadsheet IDs inside the hidden Settings sheet.
 *
 * @return {Object} Initialization result details
 */
function initializeRepository() {
  var props = PropertiesService.getScriptProperties();
  
  // 1. Create Root Folder
  var rootFolder = DriveApp.createFolder('Skyview Legal Repository');
  var rootFolderId = rootFolder.getId();
  props.setProperty('ROOT_FOLDER_ID', rootFolderId);
  
  // 2. Create Block Venus and Towers (A–D)
  var venusFolder = rootFolder.createFolder('Block Venus');
  var venusFolderId = venusFolder.getId();
  props.setProperty('VENUS_FOLDER_ID', venusFolderId);
  
  var venusTowers = ['A', 'B', 'C', 'D'];
  var venusTowerMap = {};
  for (var v = 0; v < venusTowers.length; v++) {
    var tV = venusTowers[v];
    var tFolderV = venusFolder.createFolder('Tower ' + tV);
    var tIdV = tFolderV.getId();
    props.setProperty('FOLDER_VENUS_TOWER_' + tV, tIdV);
    venusTowerMap[tV] = tIdV;
  }
  
  // 3. Create Block Jupiter and Towers (A–E)
  var jupiterFolder = rootFolder.createFolder('Block Jupiter');
  var jupiterFolderId = jupiterFolder.getId();
  props.setProperty('JUPITER_FOLDER_ID', jupiterFolderId);
  
  var jupiterTowers = ['A', 'B', 'C', 'D', 'E'];
  var jupiterTowerMap = {};
  for (var j = 0; j < jupiterTowers.length; j++) {
    var tJ = jupiterTowers[j];
    var tFolderJ = jupiterFolder.createFolder('Tower ' + tJ);
    var tIdJ = tFolderJ.getId();
    props.setProperty('FOLDER_JUPITER_TOWER_' + tJ, tIdJ);
    jupiterTowerMap[tJ] = tIdJ;
  }
  
  // 4. Create Association Documents & Court Proceedings folders
  var assocFolder = rootFolder.createFolder('Association Documents');
  var assocFolderId = assocFolder.getId();
  props.setProperty('FOLDER_ASSOCIATION_DOCS', assocFolderId);
  
  var courtFolder = rootFolder.createFolder('Court Proceedings');
  var courtFolderId = courtFolder.getId();
  props.setProperty('FOLDER_COURT_PROCEEDINGS', courtFolderId);
  
  // 5. Create Skyview Master Register Spreadsheet inside Root Folder
  var spreadsheet = SpreadsheetApp.create('Skyview Master Register');
  var spreadsheetId = spreadsheet.getId();
  props.setProperty('MASTER_REGISTER_ID', spreadsheetId);
  props.setProperty('INITIALIZED', 'true');
  
  // Move spreadsheet file inside the root repository folder
  var sheetFile = DriveApp.getFileById(spreadsheetId);
  rootFolder.addFile(sheetFile);
  DriveApp.getRootFolder().removeFile(sheetFile);
  
  // 6. Setup "Register" Sheet
  var registerSheet = spreadsheet.getActiveSheet();
  registerSheet.setName('Register');
  
  // Insert and style headers
  registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length).setValues([REGISTER_COLUMNS]);
  var headerRange = registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length);
  headerRange.setBackground('#0F766E');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setHorizontalAlignment('center');
  registerSheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (var c = 1; c <= REGISTER_COLUMNS.length; c++) {
    registerSheet.setColumnWidth(c, 160);
  }
  registerSheet.setColumnWidth(1, 140); // Submission ID
  registerSheet.setColumnWidth(2, 160); // Timestamp
  registerSheet.setColumnWidth(11, 110); // Unit Code
  registerSheet.setColumnWidth(17, 260); // Drive Link
  
  // 7. Setup hidden "Settings" Sheet
  // Stores ALL generated Folder IDs and Spreadsheet IDs
  var settingsSheet = spreadsheet.insertSheet('Settings');
  var settingsData = [
    ['Key', 'Value', 'Description'],
    ['Root Folder ID', rootFolderId, 'Root ID for Skyview Legal Repository Drive folder'],
    ['Block Venus Folder ID', venusFolderId, 'Folder ID for Block Venus'],
    ['Venus Tower A Folder ID', venusTowerMap['A'], 'Folder ID for Venus Tower A'],
    ['Venus Tower B Folder ID', venusTowerMap['B'], 'Folder ID for Venus Tower B'],
    ['Venus Tower C Folder ID', venusTowerMap['C'], 'Folder ID for Venus Tower C'],
    ['Venus Tower D Folder ID', venusTowerMap['D'], 'Folder ID for Venus Tower D'],
    ['Block Jupiter Folder ID', jupiterFolderId, 'Folder ID for Block Jupiter'],
    ['Jupiter Tower A Folder ID', jupiterTowerMap['A'], 'Folder ID for Jupiter Tower A'],
    ['Jupiter Tower B Folder ID', jupiterTowerMap['B'], 'Folder ID for Jupiter Tower B'],
    ['Jupiter Tower C Folder ID', jupiterTowerMap['C'], 'Folder ID for Jupiter Tower C'],
    ['Jupiter Tower D Folder ID', jupiterTowerMap['D'], 'Folder ID for Jupiter Tower D'],
    ['Jupiter Tower E Folder ID', jupiterTowerMap['E'], 'Folder ID for Jupiter Tower E'],
    ['Association Documents Folder ID', assocFolderId, 'Folder ID for Association Documents'],
    ['Court Proceedings Folder ID', courtFolderId, 'Folder ID for Court Proceedings'],
    ['Skyview Master Register Spreadsheet ID', spreadsheetId, 'Spreadsheet ID for Skyview Master Register'],
    ['Register Sheet Name', 'Register', 'Main legal document register sheet'],
    ['Settings Sheet Name', 'Settings', 'Hidden system configuration sheet'],
    ['Association Name', "Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association", 'Registered Association Name'],
    ['Owner Account', ADMIN_EMAIL, 'Owner Google Workspace account'],
    ['Initialized At', new Date().toISOString(), 'Repository creation timestamp'],
    ['Initialized By', Session.getActiveUser().getEmail() || ADMIN_EMAIL, 'Administrator Account']
  ];
  
  settingsSheet.getRange(1, 1, settingsData.length, 3).setValues(settingsData);
  settingsSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#E2E8F0');
  settingsSheet.setColumnWidth(1, 260);
  settingsSheet.setColumnWidth(2, 340);
  settingsSheet.setColumnWidth(3, 360);
  settingsSheet.hideSheet();
  
  return {
    success: true,
    message: 'Skyview Legal Repository successfully initialized! All Drive folders, Tower directories, and Master Register with hidden Settings created.',
    rootFolderId: rootFolderId,
    rootFolderUrl: rootFolder.getUrl(),
    spreadsheetId: spreadsheetId,
    spreadsheetUrl: spreadsheet.getUrl()
  };
}

/**
 * Calculates statistics and retrieves all register records for the Admin Dashboard
 * @return {Object} Dashboard metrics and document records
 */
function getAdminDashboardData() {
  var records = getAllRegisterRecords();
  
  var membersSet = {};
  var submissionsSet = {};
  var unitsSet = {};
  var venusUnitsSet = {};
  var jupiterUnitsSet = {};
  var litigantsSet = {};
  var ownersSet = {};
  
  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    
    // Distinct member identifier (Email or Mobile or Name)
    var memberKey = (rec['Email'] || rec['Mobile'] || rec['Member Name']).toLowerCase().trim();
    if (memberKey) {
      membersSet[memberKey] = true;
    }
    
    // Submissions
    if (rec['Submission ID']) {
      submissionsSet[rec['Submission ID']] = true;
    }
    
    // Units
    var unitCode = rec['Unit Code'];
    if (unitCode) {
      unitsSet[unitCode] = true;
      var block = (rec['Block'] || '').toLowerCase();
      if (block.indexOf('venus') !== -1 || unitCode.charAt(0) === 'V') {
        venusUnitsSet[unitCode] = true;
      } else if (block.indexOf('jupiter') !== -1 || unitCode.charAt(0) === 'J') {
        jupiterUnitsSet[unitCode] = true;
      }
    }
    
    // Legal status flags
    var legalStatus = (rec['Legal Status'] || '').toLowerCase();
    if (legalStatus.indexOf('litigant') !== -1) {
      litigantsSet[memberKey] = true;
    }
    if (legalStatus.indexOf('registered owner') !== -1) {
      ownersSet[memberKey] = true;
    }
  }
  
  var statistics = {
    totalMembers: Object.keys(membersSet).length,
    totalSubmissions: Object.keys(submissionsSet).length,
    totalUnits: Object.keys(unitsSet).length,
    totalDocuments: records.length,
    venusUnits: Object.keys(venusUnitsSet).length,
    jupiterUnits: Object.keys(jupiterUnitsSet).length,
    litigants: Object.keys(litigantsSet).length,
    registeredOwners: Object.keys(ownersSet).length
  };
  
  var props = PropertiesService.getScriptProperties();
  
  return {
    statistics: statistics,
    records: records,
    rootFolderUrl: props.getProperty('ROOT_FOLDER_ID') ? DriveApp.getFolderById(props.getProperty('ROOT_FOLDER_ID')).getUrl() : '',
    spreadsheetUrl: props.getProperty('MASTER_REGISTER_ID') ? SpreadsheetApp.openById(props.getProperty('MASTER_REGISTER_ID')).getUrl() : ''
  };
}

/**
 * Generates CSV string of the entire Master Register for download
 * @return {string} CSV text
 */
function exportRegisterCsv() {
  var sheet = getRegisterSheet();
  var data = sheet.getDataRange().getValues();
  if (!data || data.length === 0) return '';
  
  var csvRows = [];
  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    var formattedRow = [];
    for (var c = 0; c < row.length; c++) {
      var cell = row[c];
      if (cell instanceof Date) {
        cell = Utilities.formatDate(cell, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
      } else if (cell === null || cell === undefined) {
        cell = '';
      } else {
        cell = cell.toString().replace(/"/g, '""');
      }
      formattedRow.push('"' + cell + '"');
    }
    csvRows.push(formattedRow.join(','));
  }
  
  return csvRows.join('\r\n');
}
