/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Admin.gs
 * Description: Self-initializing repository setup, folder hierarchy generation,
 * hidden Settings sheet persistence, and Admin Dashboard data endpoints.
 */

/**
 * Checks whether the repository has been initialized by looking for the
 * hidden Settings sheet inside the Master Register Google Spreadsheet.
 *
 * Requirements:
 * - Do not use Session.getActiveUser() or Session.getEffectiveUser() to determine whether setup is required.
 * - Checks whether the hidden Settings sheet exists inside the Master Register.
 * - If Settings sheet does not exist: initialized is false (triggers Administrator Setup screen).
 * - If Settings sheet exists: initialized is true (triggers Member Portal).
 *
 * @return {Object} { initialized: boolean, rootFolderId: string, spreadsheetId: string, rootFolderUrl: string, spreadsheetUrl: string, adminEmail: string }
 */
function checkRepositoryStatus() {
  var props = PropertiesService.getScriptProperties();
  var masterRegisterId = props.getProperty('MASTER_REGISTER_ID');
  var rootFolderId = props.getProperty('ROOT_FOLDER_ID');
  
  var isReady = false;
  var rootFolderUrl = '';
  var spreadsheetUrl = '';
  
  // 1. Direct check using cached MASTER_REGISTER_ID
  if (masterRegisterId) {
    try {
      var ss = SpreadsheetApp.openById(masterRegisterId);
      var settingsSheet = ss.getSheetByName(SHEET_NAME_SETTINGS);
      if (settingsSheet) {
        spreadsheetUrl = ss.getUrl();
        isReady = true;

        if (!rootFolderId) {
          // Read rootFolderId from Settings sheet if missing in properties
          var data = settingsSheet.getDataRange().getValues();
          for (var i = 0; i < data.length; i++) {
            if (data[i][0] === 'ROOT_FOLDER_ID' && data[i][1]) {
              rootFolderId = data[i][1].toString().trim();
              props.setProperty('ROOT_FOLDER_ID', rootFolderId);
              break;
            }
          }
        }

        if (rootFolderId) {
          try {
            var rootFolder = DriveApp.getFolderById(rootFolderId);
            rootFolderUrl = rootFolder.getUrl();
          } catch (folderErr) {
            Logger.log('Root folder retrieval notice: ' + folderErr);
          }
        }
      }
    } catch (e) {
      Logger.log('Master Register verification error: ' + e);
      isReady = false;
    }
  }
  
  // 2. Drive auto-discovery fallback if not found in cache
  if (!isReady) {
    try {
      var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
      while (files.hasNext()) {
        var existingFile = files.next();
        try {
          var testSs = SpreadsheetApp.openById(existingFile.getId());
          var testSettings = testSs.getSheetByName(SHEET_NAME_SETTINGS);
          if (testSettings) {
            masterRegisterId = existingFile.getId();
            spreadsheetUrl = existingFile.getUrl();
            props.setProperty('MASTER_REGISTER_ID', masterRegisterId);
            props.setProperty('INITIALIZED', 'true');
            isReady = true;

            // Load and cache settings from sheet
            var sData = testSettings.getDataRange().getValues();
            for (var j = 0; j < sData.length; j++) {
              var k = sData[j][0] ? sData[j][0].toString().trim() : '';
              var v = sData[j][1] ? sData[j][1].toString().trim() : '';
              if (k && v) {
                props.setProperty(k, v);
                if (k === 'ROOT_FOLDER_ID') {
                  rootFolderId = v;
                  try {
                    rootFolderUrl = DriveApp.getFolderById(v).getUrl();
                  } catch (rfErr) {}
                }
              }
            }
            break;
          }
        } catch (subErr) {
          Logger.log('Auto-discovery candidate check notice: ' + subErr);
        }
      }
    } catch (discoveryErr) {
      Logger.log('Drive auto-discovery error: ' + discoveryErr);
    }
  }
  
  return {
    initialized: isReady,
    rootFolderId: rootFolderId || '',
    rootFolderUrl: rootFolderUrl,
    spreadsheetId: masterRegisterId || '',
    spreadsheetUrl: spreadsheetUrl,
    adminEmail: getAdminEmail()
  };
}

/**
 * One-time Self-Initializing Repository Setup.
 * Objective: The deployed Web App requires NO manual execution of Apps Script functions.
 * When the administrator clicks Initialize Repository:
 * 1. Create the root Google Drive folder 'Skyview Legal Repository'.
 * 2. Create Block Venus with Tower A, B, C, D.
 * 3. Create Block Jupiter with Tower A, B, C, D, E.
 * 4. Create Association Documents.
 * 5. Create Court Proceedings.
 * 6. Create the Skyview Master Register Google Sheet.
 * 7. Create a hidden Settings sheet.
 * 8. Store all folder IDs, spreadsheet ID, initialization timestamp, and the
 *    administrator email (ieskyview.association@gmail.com) inside Settings.
 * 9. Mark the repository as initialized.
 * 10. Automatically redirect to the Member Portal.
 *
 * @return {Object} Initialization result details
 */
function initializeRepository() {
  var status = checkRepositoryStatus();
  if (status.initialized) {
    return {
      success: true,
      message: 'Skyview Legal Repository is already initialized.',
      rootFolderId: status.rootFolderId,
      rootFolderUrl: status.rootFolderUrl,
      spreadsheetId: status.spreadsheetId,
      spreadsheetUrl: status.spreadsheetUrl,
      redirectUrl: '?page=portal'
    };
  }

  var targetAdminEmail = 'ieskyview.association@gmail.com';
  var userSessionEmail = '';
  try {
    userSessionEmail = Session.getActiveUser().getEmail() || '';
  } catch (sessionErr) {
    Logger.log('Session email during setup: ' + sessionErr);
  }

  var props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_EMAIL', targetAdminEmail);
  
  // 1. Create Root Folder: "Skyview Legal Repository"
  var rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
  var rootFolderId = rootFolder.getId();
  props.setProperty('ROOT_FOLDER_ID', rootFolderId);
  
  // 2. Create Block Venus with Tower A, B, C, D
  var venusFolder = rootFolder.createFolder('Block Venus');
  var venusFolderId = venusFolder.getId();
  props.setProperty('VENUS_FOLDER_ID', venusFolderId);
  
  var venusTowerMap = {};
  for (var v = 0; v < VENUS_TOWERS.length; v++) {
    var tV = VENUS_TOWERS[v];
    var tFolderV = venusFolder.createFolder('Tower ' + tV);
    var tIdV = tFolderV.getId();
    props.setProperty('FOLDER_VENUS_TOWER_' + tV, tIdV);
    venusTowerMap[tV] = tIdV;
  }
  
  // 3. Create Block Jupiter with Tower A, B, C, D, E
  var jupiterFolder = rootFolder.createFolder('Block Jupiter');
  var jupiterFolderId = jupiterFolder.getId();
  props.setProperty('JUPITER_FOLDER_ID', jupiterFolderId);
  
  var jupiterTowerMap = {};
  for (var j = 0; j < JUPITER_TOWERS.length; j++) {
    var tJ = JUPITER_TOWERS[j];
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
  var spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  var spreadsheetId = spreadsheet.getId();
  props.setProperty('MASTER_REGISTER_ID', spreadsheetId);
  props.setProperty('INITIALIZED', 'true');
  
  // Move spreadsheet file inside root folder
  var sheetFile = DriveApp.getFileById(spreadsheetId);
  rootFolder.addFile(sheetFile);
  DriveApp.getRootFolder().removeFile(sheetFile);
  
  // 6. Setup Primary "Register" Sheet with styled Association teal headers
  var registerSheet = spreadsheet.getSheetByName('Sheet1') || spreadsheet.getActiveSheet();
  registerSheet.setName(SHEET_NAME_REGISTER);
  
  registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length).setValues([REGISTER_COLUMNS]);
  
  var headerRange = registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length);
  headerRange.setBackground('#0F766E')
             .setFontColor('#FFFFFF')
             .setFontWeight('bold')
             .setFontFamily('Arial')
             .setFontSize(10)
             .setHorizontalAlignment('center');
  
  registerSheet.setFrozenRows(1);
  
  // Optimized column sizing
  registerSheet.setColumnWidth(1, 140);  // Submission ID
  registerSheet.setColumnWidth(2, 160);  // Upload Timestamp
  registerSheet.setColumnWidth(3, 180);  // Member Name
  registerSheet.setColumnWidth(4, 130);  // Mobile
  registerSheet.setColumnWidth(5, 200);  // Email
  registerSheet.setColumnWidth(6, 170);  // Legal Status
  registerSheet.setColumnWidth(7, 90);   // Block
  registerSheet.setColumnWidth(8, 70);   // Tower
  registerSheet.setColumnWidth(9, 60);   // Floor
  registerSheet.setColumnWidth(10, 60);  // Flat
  registerSheet.setColumnWidth(11, 100); // Unit Code
  registerSheet.setColumnWidth(12, 180); // Document Type
  registerSheet.setColumnWidth(13, 220); // Remarks
  registerSheet.setColumnWidth(14, 220); // Original Filename
  registerSheet.setColumnWidth(15, 260); // Stored Filename
  registerSheet.setColumnWidth(16, 220); // Drive File ID
  registerSheet.setColumnWidth(17, 260); // Drive Link
  
  // 7. Setup hidden "Settings" Sheet
  // Store all folder IDs, spreadsheet ID, initialization timestamp, and the administrator email (ieskyview.association@gmail.com) inside Settings
  var settingsSheet = spreadsheet.insertSheet(SHEET_NAME_SETTINGS);
  var initTimestamp = new Date().toISOString();
  var settingsData = [
    ['Key', 'Value', 'Description'],
    ['ROOT_FOLDER_ID', rootFolderId, 'Root ID for Skyview Legal Repository Drive folder'],
    ['VENUS_FOLDER_ID', venusFolderId, 'Folder ID for Block Venus'],
    ['FOLDER_VENUS_TOWER_A', venusTowerMap['A'], 'Folder ID for Venus Tower A'],
    ['FOLDER_VENUS_TOWER_B', venusTowerMap['B'], 'Folder ID for Venus Tower B'],
    ['FOLDER_VENUS_TOWER_C', venusTowerMap['C'], 'Folder ID for Venus Tower C'],
    ['FOLDER_VENUS_TOWER_D', venusTowerMap['D'], 'Folder ID for Venus Tower D'],
    ['JUPITER_FOLDER_ID', jupiterFolderId, 'Folder ID for Block Jupiter'],
    ['FOLDER_JUPITER_TOWER_A', jupiterTowerMap['A'], 'Folder ID for Jupiter Tower A'],
    ['FOLDER_JUPITER_TOWER_B', jupiterTowerMap['B'], 'Folder ID for Jupiter Tower B'],
    ['FOLDER_JUPITER_TOWER_C', jupiterTowerMap['C'], 'Folder ID for Jupiter Tower C'],
    ['FOLDER_JUPITER_TOWER_D', jupiterTowerMap['D'], 'Folder ID for Jupiter Tower D'],
    ['FOLDER_JUPITER_TOWER_E', jupiterTowerMap['E'], 'Folder ID for Jupiter Tower E'],
    ['FOLDER_ASSOCIATION_DOCS', assocFolderId, 'Folder ID for Association Documents'],
    ['FOLDER_COURT_PROCEEDINGS', courtFolderId, 'Folder ID for Court Proceedings'],
    ['MASTER_REGISTER_ID', spreadsheetId, 'Spreadsheet ID for Skyview Master Register'],
    ['REGISTER_SHEET_NAME', SHEET_NAME_REGISTER, 'Main legal document register sheet'],
    ['SETTINGS_SHEET_NAME', SHEET_NAME_SETTINGS, 'Hidden system configuration sheet'],
    ['ASSOCIATION_NAME', ASSOCIATION_NAME, 'Registered Association Name'],
    ['ADMIN_EMAIL', targetAdminEmail, 'Administrator email authorized for dashboard & maintenance'],
    ['INITIALIZED_AT', initTimestamp, 'Repository creation timestamp'],
    ['INITIALIZED_BY', userSessionEmail || targetAdminEmail, 'Administrator account that initialized repository'],
    ['INITIALIZED', 'true', 'Repository initialization flag']
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
    spreadsheetUrl: spreadsheet.getUrl(),
    redirectUrl: '?page=portal'
  };
}

/**
 * Returns data required by the Admin Dashboard: statistics, recent records, and repository configuration.
 *
 * @return {Object} Dashboard payload
 */
function getAdminDashboardData() {
  if (!checkIsAdminUser()) {
    var admin = getAdminEmail();
    throw new Error('Unauthorized: Admin Dashboard access is restricted to ' + (admin || 'the authorized Administrator'));
  }
  var status = checkRepositoryStatus();
  var defaultStats = {
    totalMembers: 0,
    totalSubmissions: 0,
    totalUnits: 0,
    totalDocuments: 0,
    venusUnits: 0,
    jupiterUnits: 0,
    litigants: 0,
    registeredOwners: 0
  };
  
  if (!status.initialized) {
    return {
      status: status,
      records: [],
      stats: defaultStats,
      statistics: defaultStats,
      settings: []
    };
  }
  
  var records = getAllRegisterRecords();
  var settings = getAllSettings();
  
  var submissionIds = {};
  var uniqueMembers = {};
  var uniqueUnits = {};
  var venusUnits = {};
  var jupiterUnits = {};
  var litigantCount = 0;
  var registeredOwnerCount = 0;
  
  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    var subId = rec['Submission ID'];
    if (subId) submissionIds[subId] = true;
    
    var email = (rec['Email'] || rec['Member Name'] || '').toLowerCase().trim();
    if (email) uniqueMembers[email] = true;
    
    var uCode = rec['Unit Code'] || '';
    if (uCode) uniqueUnits[uCode] = true;
    
    var block = (rec['Block'] || '').toLowerCase();
    if (block === 'venus' && uCode) venusUnits[uCode] = true;
    if (block === 'jupiter' && uCode) jupiterUnits[uCode] = true;
    
    var legalStatus = (rec['Legal Status'] || '').toLowerCase();
    if (legalStatus.indexOf('litigant') !== -1) litigantCount++;
    if (legalStatus.indexOf('registered owner') !== -1) registeredOwnerCount++;
  }
  
  var computedStats = {
    totalMembers: Object.keys(uniqueMembers).length,
    totalSubmissions: Object.keys(submissionIds).length,
    totalUnits: Object.keys(uniqueUnits).length,
    totalDocuments: records.length,
    venusUnits: Object.keys(venusUnits).length,
    jupiterUnits: Object.keys(jupiterUnits).length,
    litigants: litigantCount,
    registeredOwners: registeredOwnerCount
  };
  
  return {
    status: status,
    records: records,
    stats: computedStats,
    statistics: computedStats,
    settings: settings,
    rootFolderUrl: status.rootFolderUrl,
    spreadsheetUrl: status.spreadsheetUrl
  };
}

/**
 * Generates and returns a CSV string of all Master Register records
 * @return {string}
 */
function exportRegisterAsCsv() {
  var records = getAllRegisterRecords();
  var lines = [];
  
  // Header line
  lines.push(REGISTER_COLUMNS.map(function(col) {
    return '"' + col.replace(/"/g, '""') + '"';
  }).join(','));
  
  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    var line = REGISTER_COLUMNS.map(function(col) {
      var val = rec[col] || '';
      return '"' + val.replace(/"/g, '""') + '"';
    }).join(',');
    lines.push(line);
  }
  
  return lines.join('\r\n');
}
