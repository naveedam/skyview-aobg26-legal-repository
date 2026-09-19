/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Utils.gs
 * Description: Centralized constants, ID generators, string formatters, and HTML template helpers.
 */

// ==========================================
// CENTRALIZED REPOSITORY CONSTANTS
// ==========================================

/** Official registered association name */
var ASSOCIATION_NAME = "Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association";

/** Name of the root Google Drive repository folder */
var ROOT_FOLDER_NAME = 'Skyview Legal Repository';

/** Name of the Master Register Google Spreadsheet */
var SPREADSHEET_NAME = 'Skyview Master Register';

/** Sheet names within the Master Register */
var SHEET_NAME_REGISTER = 'Register';
var SHEET_NAME_SETTINGS = 'Settings';

/** Building Blocks configuration */
var BLOCKS = ['Venus', 'Jupiter'];
var VENUS_TOWERS = ['A', 'B', 'C', 'D'];
var JUPITER_TOWERS = ['A', 'B', 'C', 'D', 'E'];

/** Allowed document file extensions and size limit */
var ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
var MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/** Standard timezone for all association records */
var TIMEZONE = 'Asia/Kolkata';

/** Default Administrator Email */
var DEFAULT_ADMIN_EMAIL = 'ieskyview.association@gmail.com';

/**
 * 17 Standardized Columns for the Master Register
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

// ==========================================
// HELPER FUNCTIONS & BUSINESS LOGIC
// ==========================================

/**
 * Dynamically retrieves the authorized administrator email address.
 * Reads from the hidden Settings sheet / Script Properties.
 *
 * @return {string} Configured admin email address in lowercase, or ieskyview.association@gmail.com.
 */
function getAdminEmail() {
  try {
    var props = PropertiesService.getScriptProperties();
    var cached = props.getProperty('ADMIN_EMAIL');
    if (cached) {
      return cached.toLowerCase().trim();
    }
    
    // Read from hidden Settings sheet
    var settingVal = getSetting('ADMIN_EMAIL');
    if (settingVal) {
      props.setProperty('ADMIN_EMAIL', settingVal.toLowerCase().trim());
      return settingVal.toLowerCase().trim();
    }
  } catch (e) {
    Logger.log('Error reading dynamic ADMIN_EMAIL: ' + e);
  }
  return DEFAULT_ADMIN_EMAIL;
}

/**
 * Checks whether the active user session is the authorized Administrator.
 * 
 * Rules:
 * 1. Admin Dashboard should ONLY be available after initialization.
 * 2. After initialization, only the stored ADMIN_EMAIL (ieskyview.association@gmail.com)
 *    is authorized to access the Admin Dashboard.
 *
 * @return {boolean}
 */
function checkIsAdminUser() {
  try {
    var status = checkRepositoryStatus();
    if (!status.initialized) {
      // Admin dashboard is only available after initialization
      return false;
    }

    var activeEmail = '';
    try {
      activeEmail = Session.getActiveUser().getEmail() || '';
    } catch (sessionErr) {
      Logger.log('Could not obtain Session email: ' + sessionErr);
    }
    
    if (!activeEmail) {
      return false;
    }
    activeEmail = activeEmail.toLowerCase().trim();
    
    var configuredAdmin = getAdminEmail().toLowerCase().trim();
    if (!configuredAdmin) {
      return false;
    }
    
    return activeEmail === configuredAdmin;
  } catch (e) {
    Logger.log('Admin authorization check exception: ' + e);
    return false;
  }
}

/**
 * Generates unit code internally based on Block, Tower, Floor, Flat.
 * Example: Block "Venus", Tower "A", Floor "12", Flat "04" => "VA-1204"
 * Example: Block "Jupiter", Tower "C", Floor "08", Flat "02" => "JC-0802"
 *
 * @param {string} block "Venus" | "Jupiter"
 * @param {string} tower "A" | "B" | "C" | "D" | "E"
 * @param {string|number} floor "00" - "25"
 * @param {string|number} flat "01" - "04"
 * @return {string} Formatted unit code e.g. "VA-1204"
 */
function formatUnitCode(block, tower, floor, flat) {
  var blockPrefix = (block && block.toString().trim().toUpperCase().charAt(0) === 'J') ? 'J' : 'V';
  var towerLetter = (tower || 'A').toString().trim().toUpperCase();
  
  var floorStr = (floor !== undefined && floor !== null) ? floor.toString().trim() : '00';
  if (floorStr.length < 2) floorStr = '0' + floorStr;
  
  var flatStr = (flat !== undefined && flat !== null) ? flat.toString().trim() : '01';
  if (flatStr.length < 2) flatStr = '0' + flatStr;
  
  return blockPrefix + towerLetter + '-' + floorStr + flatStr;
}

/**
 * Generates an atomic sequential submission ID (e.g. SV-SUB-000001) using ScriptLock
 * @return {string}
 */
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
    Logger.log('Lock error generating submission ID: ' + e);
    return 'SV-SUB-' + Utilities.formatDate(new Date(), TIMEZONE, 'yyMMddHHmmss');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Formats standardized document filename
 * Format: Block_Tower_Unit_DocumentType_YYYYMMDD_Sequence.ext
 * Example: Venus_A_VA1204_ConsumerForumOrder_20260918_01.pdf
 *
 * @param {string} block
 * @param {string} tower
 * @param {string} unitCode
 * @param {string} docType
 * @param {Date} date
 * @param {number} sequenceIndex 1-based index (e.g. 1, 2, 3)
 * @param {string} originalFilename
 * @return {string}
 */
function generateStandardFilename(block, tower, unitCode, docType, date, sequenceIndex, originalFilename) {
  var cleanBlock = (block || 'Venus').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  var cleanTower = (tower || 'A').toString().trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
  var cleanUnit = (unitCode || 'VA0000').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  var cleanDocType = (docType || 'Document').toString().trim().replace(/[^a-zA-Z0-9]/g, '');
  
  var dateStr = Utilities.formatDate(date || new Date(), TIMEZONE, 'yyyyMMdd');
  var seqStr = ('00' + (sequenceIndex || 1)).slice(-2);
  
  var ext = '';
  if (originalFilename && originalFilename.indexOf('.') !== -1) {
    ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
  } else {
    ext = '.pdf';
  }
  
  return cleanBlock + '_' + cleanTower + '_' + cleanUnit + '_' + cleanDocType + '_' + dateStr + '_' + seqStr + ext;
}

/**
 * Sanitizes input text by trimming and handling nulls
 * @param {*} str
 * @return {string}
 */
function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  return str.toString().trim();
}

/**
 * Formats a Date object to YYYY-MM-DD HH:mm:ss in IST
 * @param {Date} [date]
 * @return {string}
 */
function formatTimestampIST(date) {
  return Utilities.formatDate(date || new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Helper to include partial HTML files in GAS templates.
 * Supports both standard ('styles') and clasp subfolder ('html/styles') resolution seamlessly.
 *
 * @param {string} filename
 * @return {string} HTML content
 */
function include(filename) {
  var namesToTry = [
    filename,
    'html/' + filename,
    filename.replace(/^html\//, '')
  ];
  
  for (var i = 0; i < namesToTry.length; i++) {
    try {
      return HtmlService.createHtmlOutputFromFile(namesToTry[i]).getContent();
    } catch (e) {
      // try next
    }
  }
  throw new Error('Include file not found: ' + filename);
}

/**
 * Helper to resolve an HTML template file.
 * Checks both root and 'html/' subdirectory.
 *
 * @param {string} templateName
 * @return {GoogleAppsScript.HTML.HtmlTemplate}
 */
function getHtmlTemplate(templateName) {
  var namesToTry = [
    templateName,
    'html/' + templateName,
    templateName.replace(/^html\//, '')
  ];
  
  for (var i = 0; i < namesToTry.length; i++) {
    try {
      return HtmlService.createTemplateFromFile(namesToTry[i]);
    } catch (e) {
      // try next
    }
  }
  throw new Error('Template file not found: ' + templateName);
}
