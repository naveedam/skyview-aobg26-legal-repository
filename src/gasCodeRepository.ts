import { GasFile } from './types';

export const GAS_FILES: GasFile[] = [
  {
    name: 'appsscript.json',
    path: 'appsscript.json',
    type: 'manifest',
    description: 'Project manifest with OAuth scopes, USER_DEPLOYING execution, and Asia/Kolkata timezone.',
    code: `{
  "timeZone": "Asia/Kolkata",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}`
  },
  {
    name: 'Code.gs',
    path: 'Code.gs',
    type: 'server',
    description: 'Web App router, HTML Service include helper, authorization verification, and metadata provider.',
    code: `/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Code.gs
 * Description: Web App entry point, routing, HTML Service template inclusion, and metadata endpoints.
 */

function doGet(e) {
  var status = checkRepositoryStatus();
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toLowerCase() : 'portal';
  var isAdmin = checkIsAdminUser();
  
  // FIRST-RUN DETECTION:
  // If repository has not been initialized, display Administrator Setup screen instead of Member Portal.
  if (!status.initialized) {
    var setupTemplate = HtmlService.createTemplateFromFile('admin');
    setupTemplate.isAdmin = isAdmin;
    setupTemplate.userEmail = Session.getActiveUser().getEmail() || '';
    setupTemplate.requestedPage = 'setup';
    setupTemplate.isSetupMode = true;
    setupTemplate.repoStatus = status;
    
    var htmlOutput = setupTemplate.evaluate();
    htmlOutput.setTitle('Skyview AOBG26 Legal Repository - Administrator Setup');
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return htmlOutput;
  }
  
  // ON SUBSEQUENT LAUNCHES (or when already initialized):
  // Skip setup screen completely and route to requested page (defaults to Member Portal)
  var templateName = 'index';
  var title = 'Skyview AOBG26 Legal Repository - Member Portal';
  
  if (page === 'admin') {
    templateName = 'admin';
    title = 'Skyview AOBG26 Legal Repository - Admin Dashboard';
  }
  
  var template = HtmlService.createTemplateFromFile(templateName);
  
  // Inject runtime properties into template
  template.isAdmin = isAdmin;
  template.userEmail = Session.getActiveUser().getEmail() || '';
  template.requestedPage = page;
  template.isSetupMode = false;
  template.repoStatus = status;
  
  var htmlOutput = template.evaluate();
  htmlOutput.setTitle(title);
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getPortalConfig() {
  return {
    associationName: "Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association",
    appName: "Skyview AOBG26 Legal Repository",
    ownerEmail: ADMIN_EMAIL,
    blocks: [
      { name: 'Venus', towers: ['A', 'B', 'C', 'D'] },
      { name: 'Jupiter', towers: ['A', 'B', 'C', 'D', 'E'] }
    ],
    floors: [
      '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
      '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '20', '21', '22', '23', '24', '25'
    ],
    flats: ['01', '02', '03', '04'],
    legalStatuses: [
      'Allottee',
      'Prospective Buyer',
      'Litigant',
      'Registered Owner'
    ],
    documentTypes: [
      'Allotment Letter',
      'Builder Buyer Agreement',
      'Payment Receipt',
      'Consumer Forum Order',
      'Execution Petition',
      'RERA Order',
      'Absolute Sale Deed',
      'Encumbrance Certificate',
      'Possession Letter',
      'Khata',
      'Legal Notice',
      'Other'
    ],
    maxFileSizeMb: 25,
    isAdmin: checkIsAdminUser(),
    userEmail: Session.getActiveUser().getEmail() || ''
  };
}`
  },
  {
    name: 'Admin.gs',
    path: 'Admin.gs',
    type: 'server',
    description: 'First-run folder hierarchy creation, Master Register spreadsheet builder, stats counter, and CSV export.',
    code: `/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Admin.gs
 * Description: One-time repository initialization, folder hierarchy generation,
 * dashboard metrics calculation, search filtering, and CSV export.
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
  
  var sheetFile = DriveApp.getFileById(spreadsheetId);
  rootFolder.addFile(sheetFile);
  DriveApp.getRootFolder().removeFile(sheetFile);
  
  // 6. Setup "Register" Sheet
  var registerSheet = spreadsheet.getActiveSheet();
  registerSheet.setName('Register');
  registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length).setValues([REGISTER_COLUMNS]);
  var headerRange = registerSheet.getRange(1, 1, 1, REGISTER_COLUMNS.length);
  headerRange.setBackground('#0F766E');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setHorizontalAlignment('center');
  registerSheet.setFrozenRows(1);
  
  for (var c = 1; c <= REGISTER_COLUMNS.length; c++) {
    registerSheet.setColumnWidth(c, 160);
  }
  registerSheet.setColumnWidth(1, 140);
  registerSheet.setColumnWidth(2, 160);
  registerSheet.setColumnWidth(11, 110);
  registerSheet.setColumnWidth(17, 260);
  
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
    var memberKey = (rec['Email'] || rec['Mobile'] || rec['Member Name']).toLowerCase().trim();
    if (memberKey) membersSet[memberKey] = true;
    if (rec['Submission ID']) submissionsSet[rec['Submission ID']] = true;
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
    var legalStatus = (rec['Legal Status'] || '').toLowerCase();
    if (legalStatus.indexOf('litigant') !== -1) litigantsSet[memberKey] = true;
    if (legalStatus.indexOf('registered owner') !== -1) ownersSet[memberKey] = true;
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
  return csvRows.join('\\r\\n');
}`
  },
  {
    name: 'Drive.gs',
    path: 'Drive.gs',
    type: 'server',
    description: 'Dynamic Tower and Unit Folder (VA-1204) location and automatic folder creation.',
    code: `/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Drive.gs
 * Description: Drive folder structure management, unit folder locator/creator, and file persistence.
 */

function getRootRepositoryFolder() {
  var rootId = getSetting('ROOT_FOLDER_ID');
  if (!rootId) {
    throw new Error('Repository Root Folder not configured. Please initialize the repository.');
  }
  return DriveApp.getFolderById(rootId);
}

function getTowerFolder(block, tower) {
  var blockKey = (block || 'Venus').toString().trim();
  var towerKey = (tower || 'A').toString().trim().toUpperCase();
  var propKey = 'FOLDER_' + blockKey.toUpperCase() + '_TOWER_' + towerKey;
  var towerFolderId = getSetting(propKey);
  
  if (towerFolderId) {
    try {
      return DriveApp.getFolderById(towerFolderId);
    } catch (e) {
      Logger.log('Cached folder ID invalid: ' + e);
    }
  }
  
  var blockFolderId = getSetting(blockKey.toUpperCase() + '_FOLDER_ID');
  var blockFolder;
  if (blockFolderId) {
    blockFolder = DriveApp.getFolderById(blockFolderId);
  } else {
    var root = getRootRepositoryFolder();
    var blockFolders = root.getFoldersByName('Block ' + blockKey);
    if (blockFolders.hasNext()) {
      blockFolder = blockFolders.next();
      saveSetting(blockKey.toUpperCase() + '_FOLDER_ID', blockFolder.getId());
    } else {
      blockFolder = root.createFolder('Block ' + blockKey);
      saveSetting(blockKey.toUpperCase() + '_FOLDER_ID', blockFolder.getId());
    }
  }
  
  var targetName = 'Tower ' + towerKey;
  var towerFolders = blockFolder.getFoldersByName(targetName);
  var towerFolder = towerFolders.hasNext() ? towerFolders.next() : blockFolder.createFolder(targetName);
  saveSetting(propKey, towerFolder.getId());
  return towerFolder;
}

function getOrCreateUnitFolder(block, tower, unitCode) {
  var towerFolder = getTowerFolder(block, tower);
  var unitName = (unitCode || 'Unit').toString().trim();
  var existing = towerFolder.getFoldersByName(unitName);
  if (existing.hasNext()) {
    return existing.next();
  }
  return towerFolder.createFolder(unitName);
}

function saveFileToUnitFolder(unitFolder, base64Data, mimeType, standardizedFilename, description) {
  var cleanBase64 = base64Data;
  if (cleanBase64.indexOf(',') !== -1) {
    cleanBase64 = cleanBase64.split(',')[1];
  }
  var decodedBytes = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(decodedBytes, mimeType, standardizedFilename);
  var file = unitFolder.createFile(blob);
  if (description) {
    file.setDescription(description);
  }
  return {
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    downloadUrl: file.getDownloadUrl()
  };
}`
  },
  {
    name: 'Upload.gs',
    path: 'Upload.gs',
    type: 'server',
    description: 'Server handler for member submissions, multi-unit file processing, and standardized file naming.',
    code: `/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Upload.gs
 * Description: Validates member submissions, creates unit folders dynamically,
 * saves files into Google Drive with standardized names, and appends to Master Register.
 */

var ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
var MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

function processMemberSubmission(submissionData) {
  if (!submissionData) throw new Error('Submission payload is empty.');
  
  var memberName = sanitizeText(submissionData.memberName);
  var mobile = sanitizeText(submissionData.mobile);
  var email = sanitizeText(submissionData.email);
  if (!memberName || !mobile || !email) {
    throw new Error('Full Name, Mobile Number, and Email Address are all required.');
  }
  
  var legalStatusList = submissionData.legalStatus;
  if (!legalStatusList || !Array.isArray(legalStatusList) || legalStatusList.length === 0) {
    throw new Error('Please select at least one Legal Status.');
  }
  var legalStatusString = legalStatusList.join(', ');
  
  var units = submissionData.units;
  if (!units || !Array.isArray(units) || units.length === 0) {
    throw new Error('At least one Property Unit must be added.');
  }
  
  var submissionId = generateSubmissionId();
  var uploadDate = new Date();
  var uploadTimestamp = formatTimestampIST(uploadDate);
  var registerRowsToAppend = [];
  var uploadedFilesSummary = [];
  
  for (var i = 0; i < units.length; i++) {
    var unit = units[i];
    var block = sanitizeText(unit.block || 'Venus');
    var tower = sanitizeText(unit.tower || 'A').toUpperCase();
    var floor = sanitizeText(unit.floor || '00');
    var flat = sanitizeText(unit.flat || '01');
    var unitCode = formatUnitCode(block, tower, floor, flat);
    var unitFolder = getOrCreateUnitFolder(block, tower, unitCode);
    var unitDocuments = unit.documents || [];
    
    for (var j = 0; j < unitDocuments.length; j++) {
      var doc = unitDocuments[j];
      var docType = sanitizeText(doc.documentType || 'Other');
      var remarks = sanitizeText(doc.remarks || '');
      var files = doc.files || [];
      
      for (var k = 0; k < files.length; k++) {
        var fileData = files[k];
        var origName = sanitizeText(fileData.filename || 'document.pdf');
        var mimeType = fileData.mimeType || 'application/pdf';
        var base64Data = fileData.base64 || '';
        var approxSizeBytes = fileData.size || 0;
        
        var extMatch = origName.match(/\\.[0-9a-z]+$/i);
        var ext = extMatch ? extMatch[0].toLowerCase() : '';
        if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
          throw new Error('Unsupported format for "' + origName + '". Accepted: PDF, JPG, JPEG, PNG.');
        }
        if (approxSizeBytes > MAX_FILE_SIZE_BYTES) {
          throw new Error('File "' + origName + '" exceeds 25 MB limit.');
        }
        
        var sequenceIndex = k + 1;
        var cleanUnitCodeNoDash = unitCode.replace('-', '');
        var storedFilename = generateStandardFilename(
          block,
          tower,
          cleanUnitCodeNoDash,
          docType,
          uploadDate,
          sequenceIndex,
          origName
        );
        
        var driveFileResult = saveFileToUnitFolder(
          unitFolder,
          base64Data,
          mimeType,
          storedFilename,
          'Member: ' + memberName + ' | ' + remarks
        );
        
        var row = [
          submissionId,
          uploadTimestamp,
          memberName,
          mobile,
          email,
          legalStatusString,
          block,
          tower,
          floor,
          flat,
          unitCode,
          docType,
          remarks,
          origName,
          storedFilename,
          driveFileResult.fileId,
          driveFileResult.fileUrl
        ];
        registerRowsToAppend.push(row);
        
        uploadedFilesSummary.push({
          unitCode: unitCode,
          docType: docType,
          storedFilename: storedFilename,
          driveUrl: driveFileResult.fileUrl
        });
      }
    }
  }
  
  appendRegisterRows(registerRowsToAppend);
  
  return {
    success: true,
    submissionId: submissionId,
    timestamp: uploadTimestamp,
    memberName: memberName,
    unitsCount: units.length,
    documentsCount: registerRowsToAppend.length,
    files: uploadedFilesSummary
  };
}`
  },
  {
    name: 'Sheet.gs',
    path: 'Sheet.gs',
    type: 'server',
    description: 'Master Register spreadsheet access, batch appending, column layout, and hidden Settings sheet.',
    code: `/**
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

function getMasterSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('MASTER_REGISTER_ID');
  if (!sheetId) throw new Error('Repository is not initialized. Please run Administrator Setup first.');
  return SpreadsheetApp.openById(sheetId);
}

function getRegisterSheet() {
  var ss = getMasterSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_REGISTER);
  if (!sheet) throw new Error('Register sheet not found in Master Spreadsheet.');
  return sheet;
}

function appendRegisterRows(rows) {
  if (!rows || rows.length === 0) return;
  var sheet = getRegisterSheet();
  var startRow = sheet.getLastRow() + 1;
  var numRows = rows.length;
  var numCols = rows[0].length;
  var range = sheet.getRange(startRow, 1, numRows, numCols);
  range.setValues(rows);
  sheet.getRange(startRow, 2, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

function getAllRegisterRecords() {
  try {
    var sheet = getRegisterSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    var data = sheet.getRange(2, 1, lastRow - 1, REGISTER_COLUMNS.length).getValues();
    var records = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[2]) continue;
      var record = {};
      for (var c = 0; c < REGISTER_COLUMNS.length; c++) {
        var key = REGISTER_COLUMNS[c];
        var val = row[c];
        record[key] = (val instanceof Date) ? Utilities.formatDate(val, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss') : (val !== null && val !== undefined ? val.toString() : '');
      }
      records.push(record);
    }
    return records;
  } catch (e) {
    Logger.log('Error reading register records: ' + e);
    return [];
  }
}

function saveSetting(key, value) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(key, value);
}

function getSetting(key) {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty(key) || '';
}`
  },
  {
    name: 'Utils.gs',
    path: 'Utils.gs',
    type: 'server',
    description: 'Unit code formatter (VA-1204), atomic SV-SUB-000001 counter, and standardized naming.',
    code: `/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Utils.gs
 * Description: Helper functions for ID generation, unit codes, file naming, and date formatting.
 */

var ADMIN_EMAIL = 'skyviewaobg26@gmail.com';

function checkIsAdminUser() {
  try {
    var activeEmail = Session.getActiveUser().getEmail();
    if (!activeEmail) return false;
    return activeEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  } catch (e) {
    return false;
  }
}

function formatUnitCode(block, tower, floor, flat) {
  var blockPrefix = (block && block.toString().trim().toUpperCase().charAt(0) === 'J') ? 'J' : 'V';
  var towerLetter = (tower || 'A').toString().trim().toUpperCase();
  var floorStr = (floor !== undefined && floor !== null) ? floor.toString().trim() : '00';
  if (floorStr.length < 2) floorStr = '0' + floorStr;
  var flatStr = (flat !== undefined && flat !== null) ? flat.toString().trim() : '01';
  if (flatStr.length < 2) flatStr = '0' + flatStr;
  return blockPrefix + towerLetter + '-' + floorStr + flatStr;
}

function generateSubmissionId() {
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var currentCounter = parseInt(props.getProperty('SUBMISSION_COUNTER') || '0', 10);
    var nextCounter = currentCounter + 1;
    props.setProperty('SUBMISSION_COUNTER', nextCounter.toString());
    var counterPadded = ('000000' + nextCounter).slice(-6);
    return 'SV-SUB-' + counterPadded;
  } catch (e) {
    return 'SV-SUB-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMddHHmmss');
  } finally {
    lock.releaseLock();
  }
}

function generateStandardFilename(block, tower, unitCode, docType, date, sequenceIndex, originalFilename) {
  var cleanBlock = (block || 'Venus').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  var cleanTower = (tower || 'A').toString().trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
  var cleanUnit = (unitCode || 'VA0000').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  var cleanDocType = (docType || 'Document').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  var dateStr = Utilities.formatDate(date || new Date(), 'Asia/Kolkata', 'yyyyMMdd');
  var seqStr = ('00' + (sequenceIndex || 1)).slice(-2);
  var ext = (originalFilename && originalFilename.indexOf('.') !== -1) ? originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase() : '.pdf';
  return cleanBlock + '_' + cleanTower + '_' + cleanUnit + '_' + cleanDocType + '_' + dateStr + '_' + seqStr + ext;
}

function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  return str.toString().trim();
}

function formatTimestampIST(date) {
  return Utilities.formatDate(date || new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}`
  },
  {
    name: 'index.html',
    path: 'index.html',
    type: 'html',
    description: 'Member Upload Portal responsive HTML template with repeating unit cards and validation.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyview AOBG26 Legal Repository - Member Portal</title>
  <?!= include('styles'); ?>
</head>
<body>
  <header class="app-header">
    <div class="header-container">
      <div class="header-top-row">
        <div class="header-title-wrap">
          <span class="header-badge">Member Portal</span>
          <h1 class="app-title">Skyview AOBG26 Legal Repository</h1>
        </div>
        <div class="header-nav">
          <? if (isAdmin) { ?>
            <a href="?page=admin" class="nav-link-btn">
              <span>⚙️</span> Administrator Dashboard
            </a>
          <? } ?>
        </div>
      </div>
      <p class="app-subtitle">
        Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
      </p>
    </div>
  </header>

  <main class="main-content">
    <form id="memberUploadForm" novalidate>
      <!-- Section 1: Member Details -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title"><span class="card-title-number">1</span> Member Details</h2>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label form-label-required" for="memberName">Full Name</label>
            <input type="text" id="memberName" class="form-input" placeholder="e.g. Naveed Ahmed" required />
          </div>
          <div class="form-group">
            <label class="form-label form-label-required" for="memberMobile">Mobile Number</label>
            <input type="tel" id="memberMobile" class="form-input" placeholder="e.g. +91 9876543210" required />
          </div>
          <div class="form-group">
            <label class="form-label form-label-required" for="memberEmail">Email Address</label>
            <input type="email" id="memberEmail" class="form-input" placeholder="e.g. naveed@example.com" required />
          </div>
        </div>
      </section>

      <!-- Section 2: Legal Status -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title"><span class="card-title-number">2</span> Legal Status</h2>
        </div>
        <div class="checkbox-grid">
          <label class="checkbox-card">
            <input type="checkbox" name="legalStatus" value="Allottee" />
            <span class="checkbox-label">Allottee</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="legalStatus" value="Prospective Buyer" />
            <span class="checkbox-label">Prospective Buyer</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="legalStatus" value="Litigant" />
            <span class="checkbox-label">Litigant</span>
          </label>
          <label class="checkbox-card">
            <input type="checkbox" name="legalStatus" value="Registered Owner" />
            <span class="checkbox-label">Registered Owner</span>
          </label>
        </div>
      </section>

      <!-- Section 3 & 4: Units & Documents -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title"><span class="card-title-number">3</span> Property Units & Legal Documents</h2>
        </div>
        <div id="unitsContainer"></div>
        <div style="margin-top: 10px;">
          <button type="button" id="addUnitBtn" class="btn btn-outline">+ Add Another Property Unit</button>
        </div>
      </section>

      <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
        <button type="submit" id="submitBtn" class="btn btn-primary btn-lg">
          <span id="submitSpinner" class="spinner hidden"></span>
          <span id="submitBtnText">Submit Legal Documents to Repository</span>
        </button>
      </div>
    </form>
  </main>

  <div id="successModal" class="modal-overlay hidden">
    <div class="modal-content">
      <div class="modal-icon">✓</div>
      <h3 class="modal-title">Documents Submitted Successfully</h3>
      <div class="receipt-box">
        <div class="receipt-row"><span>Submission ID</span><strong id="receiptSubId">SV-SUB-000001</strong></div>
        <div class="receipt-row"><span>Member Name</span><strong id="receiptMemberName">-</strong></div>
        <div class="receipt-row"><span>Timestamp</span><strong id="receiptTimestamp">-</strong></div>
        <div class="receipt-row"><span>Units Recorded</span><strong id="receiptUnitsCount">-</strong></div>
        <div class="receipt-row"><span>Documents Secured</span><strong id="receiptDocsCount">-</strong></div>
      </div>
      <button type="button" class="btn btn-primary" onclick="resetFormAfterSuccess()">Done / Upload Another</button>
    </div>
  </div>

  <?!= include('scripts'); ?>
</body>
</html>`
  },
  {
    name: 'admin.html',
    path: 'admin.html',
    type: 'html',
    description: 'Admin Dashboard template with First-Run setup, 8 stats cards, instant filters, and CSV export.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyview AOBG26 Legal Repository - Administrator Dashboard</title>
  <?!= include('styles'); ?>
</head>
<body>
  <header class="app-header">
    <div class="header-container">
      <div class="header-top-row">
        <div class="header-title-wrap">
          <span class="header-badge">Administrator</span>
          <h1 class="app-title">Skyview AOBG26 Legal Repository</h1>
        </div>
        <div class="header-nav">
          <a href="?page=portal" class="nav-link-btn">📋 Member Upload Portal</a>
          <button type="button" class="nav-link-btn" onclick="downloadCsvExport()">⬇️ Export CSV</button>
        </div>
      </div>
      <p class="app-subtitle">Operated by skyviewaobg26@gmail.com</p>
    </div>
  </header>

  <main class="main-content">
    <? var status = checkRepositoryStatus(); if (!status.initialized) { ?>
      <div class="setup-box">
        <div class="setup-icon">⚙️</div>
        <h2 class="setup-title">First-Run Repository Initialization</h2>
        <p class="setup-desc">Automatically create Google Drive folder structure and Master Register spreadsheet.</p>
        <button type="button" id="initRepoBtn" class="btn btn-primary btn-lg">Initialize Skyview Repository</button>
      </div>
    <? } else { var data = getAdminDashboardData(); var stats = data.statistics; var records = data.records; ?>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-label">Total Members</span><div class="stat-value"><?= stats.totalMembers ?></div></div>
        <div class="stat-card"><span class="stat-label">Total Submissions</span><div class="stat-value"><?= stats.totalSubmissions ?></div></div>
        <div class="stat-card"><span class="stat-label">Total Units</span><div class="stat-value"><?= stats.totalUnits ?></div></div>
        <div class="stat-card"><span class="stat-label">Total Documents</span><div class="stat-value"><?= stats.totalDocuments ?></div></div>
        <div class="stat-card"><span class="stat-label">Venus Units</span><div class="stat-value"><?= stats.venusUnits ?></div></div>
        <div class="stat-card"><span class="stat-label">Jupiter Units</span><div class="stat-value"><?= stats.jupiterUnits ?></div></div>
        <div class="stat-card"><span class="stat-label">Litigants</span><div class="stat-value"><?= stats.litigants ?></div></div>
        <div class="stat-card"><span class="stat-label">Registered Owners</span><div class="stat-value"><?= stats.registeredOwners ?></div></div>
      </div>
      <!-- Search and Filter Table -->
      <div class="card">
        <input type="text" id="tableSearchInput" class="search-input" placeholder="Search by name, mobile, unit (VA-1204), or submission ID..." />
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr><th>Unit</th><th>Member</th><th>Status</th><th>Doc Type</th><th>Submission ID</th><th>Link</th></tr>
            </thead>
            <tbody id="adminTableBody">
              <!-- Dynamically populated from Google Apps Script -->
            </tbody>
          </table>
        </div>
      </div>
    <? } ?>
  </main>
  <?!= include('scripts'); ?>
</body>
</html>`
  },
  {
    name: 'styles.html',
    path: 'styles.html',
    type: 'html',
    description: 'Material-inspired responsive CSS styles matching Association brand specifications.',
    code: `<style>
:root {
  --primary: #0F766E;
  --primary-hover: #0D655E;
  --primary-light: #CCFBF1;
  --primary-dark: #115E59;
  --secondary: #2563EB;
  --bg-page: #F8FAFC;
  --surface: #FFFFFF;
  --surface-alt: #F1F5F9;
  --text-main: #0F172A;
  --text-muted: #475569;
  --border: #E2E8F0;
  --radius-sm: 6px;
  --radius-md: 10px;
}
/* Full CSS included in styles.html inside /google-apps-script/ */
</style>`
  },
  {
    name: 'scripts.html',
    path: 'scripts.html',
    type: 'html',
    description: 'Client-side vanilla JavaScript for dynamic unit cards, base64 file reading, and RPC calls.',
    code: `<script>
// Client-side script handling dynamic forms, unit calculations, file conversion, and server RPCs.
// Full code included in scripts.html inside /google-apps-script/
</script>`
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'docs',
    description: 'Comprehensive deployment manual, scopes guide, first-run initialization, and testing instructions.',
    code: `# Skyview AOBG26 Legal Repository
Deployment & Testing Manual for skyviewaobg26@gmail.com
See full documentation in /google-apps-script/README.md`
  }
];
