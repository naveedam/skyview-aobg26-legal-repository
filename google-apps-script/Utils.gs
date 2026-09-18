/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Utils.gs
 * Description: Helper functions for ID generation, unit codes, file naming, and date formatting.
 */

var ADMIN_EMAIL = 'skyviewaobg26@gmail.com';

/**
 * Returns whether the current user is the administrator
 * @return {boolean}
 */
function checkIsAdminUser() {
  try {
    var activeEmail = Session.getActiveUser().getEmail();
    if (!activeEmail) {
      // In web apps deployed as USER_DEPLOYING, getActiveUser() may be blank for anonymous users
      return false;
    }
    return activeEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  } catch (e) {
    Logger.log('Error checking admin user: ' + e);
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
 * Generates an atomic sequential submission ID (e.g. SV-SUB-000001)
 * @return {string}
 */
function generateSubmissionId() {
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  
  try {
    // Wait up to 10 seconds for concurrent submissions
    lock.waitLock(10000);
    
    var currentCounter = parseInt(props.getProperty('SUBMISSION_COUNTER') || '0', 10);
    var nextCounter = currentCounter + 1;
    props.setProperty('SUBMISSION_COUNTER', nextCounter.toString());
    
    var counterPadded = ('000000' + nextCounter).slice(-6);
    return 'SV-SUB-' + counterPadded;
  } catch (e) {
    Logger.log('Lock error generating submission ID: ' + e);
    // Fallback: timestamp based unique ID
    return 'SV-SUB-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMddHHmmss');
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
  
  var dateStr = Utilities.formatDate(date || new Date(), 'Asia/Kolkata', 'yyyyMMdd');
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
 * Sanitizes strings for safety
 */
function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  return str.toString().trim();
}

/**
 * Formats a Date object to YYYY-MM-DD HH:mm:ss in IST
 */
function formatTimestampIST(date) {
  return Utilities.formatDate(date || new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}
