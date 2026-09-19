/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Drive.gs
 * Description: Google Drive hierarchical folder management.
 * Dynamically resolves Root, Block, Tower, and Unit folders using the hidden Settings sheet.
 * Never hardcodes any Folder IDs.
 */

/**
 * Returns the Root Google Drive Folder ("Skyview Legal Repository")
 * Resolves ID dynamically from the hidden Settings sheet.
 *
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getRootRepositoryFolder() {
  var rootId = getSetting('ROOT_FOLDER_ID');
  
  // Fallback: Drive search if ID not yet cached
  if (!rootId) {
    try {
      var folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
      if (folders.hasNext()) {
        var root = folders.next();
        rootId = root.getId();
        saveSetting('ROOT_FOLDER_ID', rootId, 'Root ID for Skyview Legal Repository');
      }
    } catch (e) {
      Logger.log('Error locating root folder: ' + e);
    }
  }
  
  if (!rootId) {
    throw new Error('Repository Root Folder not found. Please run Administrator Setup first.');
  }
  
  return DriveApp.getFolderById(rootId);
}

/**
 * Returns the Block Folder ("Block Venus" or "Block Jupiter")
 *
 * @param {string} block "Venus" | "Jupiter"
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getBlockFolder(block) {
  var blockName = sanitizeText(block || 'Venus');
  var blockKey = (blockName.toUpperCase().charAt(0) === 'J') ? 'JUPITER' : 'VENUS';
  var settingKey = blockKey + '_FOLDER_ID';
  
  var blockFolderId = getSetting(settingKey);
  if (blockFolderId) {
    try {
      return DriveApp.getFolderById(blockFolderId);
    } catch (e) {
      Logger.log('Invalid cached block folder ID for ' + settingKey + ': ' + e);
    }
  }
  
  // Fallback: search or create under root
  var root = getRootRepositoryFolder();
  var targetName = 'Block ' + (blockKey === 'JUPITER' ? 'Jupiter' : 'Venus');
  var matches = root.getFoldersByName(targetName);
  var folder;
  if (matches.hasNext()) {
    folder = matches.next();
  } else {
    folder = root.createFolder(targetName);
  }
  
  saveSetting(settingKey, folder.getId(), 'Folder ID for ' + targetName);
  return folder;
}

/**
 * Returns the Tower folder for a given Block and Tower.
 * Dynamically resolves folder ID from the hidden Settings sheet.
 *
 * @param {string} block "Venus" | "Jupiter"
 * @param {string} tower "A" | "B" | "C" | "D" | "E"
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getTowerFolder(block, tower) {
  var blockName = sanitizeText(block || 'Venus');
  var blockKey = (blockName.toUpperCase().charAt(0) === 'J') ? 'JUPITER' : 'VENUS';
  var towerLetter = sanitizeText(tower || 'A').toUpperCase();
  
  var settingKey = 'FOLDER_' + blockKey + '_TOWER_' + towerLetter;
  var towerFolderId = getSetting(settingKey);
  
  if (towerFolderId) {
    try {
      return DriveApp.getFolderById(towerFolderId);
    } catch (e) {
      Logger.log('Invalid cached tower folder ID for ' + settingKey + ': ' + e);
    }
  }
  
  // Locate or create under Block folder
  var blockFolder = getBlockFolder(blockKey);
  var targetName = 'Tower ' + towerLetter;
  var matches = blockFolder.getFoldersByName(targetName);
  var folder;
  if (matches.hasNext()) {
    folder = matches.next();
  } else {
    folder = blockFolder.createFolder(targetName);
  }
  
  saveSetting(settingKey, folder.getId(), 'Folder ID for ' + blockKey + ' Tower ' + towerLetter);
  return folder;
}

/**
 * Automatically locates or creates the specific Unit Folder under the corresponding Tower folder.
 * Example Hierarchy: Skyview Legal Repository -> Block Venus -> Tower A -> VA-1204
 *
 * @param {string} block "Venus" | "Jupiter"
 * @param {string} tower "A" | "B" | "C" | "D" | "E"
 * @param {string} unitCode Standard unit code e.g. "VA-1204"
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateUnitFolder(block, tower, unitCode) {
  var towerFolder = getTowerFolder(block, tower);
  var unitName = sanitizeText(unitCode || 'Unit');
  
  var existing = towerFolder.getFoldersByName(unitName);
  if (existing.hasNext()) {
    return existing.next();
  }
  
  // Create unit folder automatically
  return towerFolder.createFolder(unitName);
}

/**
 * Returns the Association Documents folder
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getAssociationDocsFolder() {
  var folderId = getSetting('FOLDER_ASSOCIATION_DOCS');
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      Logger.log('Invalid cached Association Docs folder ID: ' + e);
    }
  }
  
  var root = getRootRepositoryFolder();
  var matches = root.getFoldersByName('Association Documents');
  var folder = matches.hasNext() ? matches.next() : root.createFolder('Association Documents');
  saveSetting('FOLDER_ASSOCIATION_DOCS', folder.getId(), 'Folder ID for Association Documents');
  return folder;
}

/**
 * Returns the Court Proceedings folder
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getCourtProceedingsFolder() {
  var folderId = getSetting('FOLDER_COURT_PROCEEDINGS');
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      Logger.log('Invalid cached Court Proceedings folder ID: ' + e);
    }
  }
  
  var root = getRootRepositoryFolder();
  var matches = root.getFoldersByName('Court Proceedings');
  var folder = matches.hasNext() ? matches.next() : root.createFolder('Court Proceedings');
  saveSetting('FOLDER_COURT_PROCEEDINGS', folder.getId(), 'Folder ID for Court Proceedings');
  return folder;
}

/**
 * Saves an uploaded base64 file into the target Unit Folder
 *
 * @param {GoogleAppsScript.Drive.Folder} unitFolder
 * @param {string} base64Data Base64 encoded file string
 * @param {string} mimeType File mime type
 * @param {string} standardizedFilename Standardized association filename
 * @param {string} description Remarks or metadata
 * @return {Object} { fileId, fileUrl, downloadUrl }
 */
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
}
