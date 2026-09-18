/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Drive.gs
 * Description: Drive folder structure management, unit folder locator/creator, and file persistence.
 */

/**
 * Returns the Root Folder: Skyview Legal Repository
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getRootRepositoryFolder() {
  var rootId = getSetting('ROOT_FOLDER_ID');
  if (!rootId) {
    throw new Error('Repository Root Folder not configured. Please initialize the repository.');
  }
  return DriveApp.getFolderById(rootId);
}

/**
 * Returns the Tower folder for a given Block and Tower.
 * Uses cached tower folder IDs from ScriptProperties / Settings.
 *
 * @param {string} block "Venus" | "Jupiter"
 * @param {string} tower "A" | "B" | "C" | "D" | "E"
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getTowerFolder(block, tower) {
  var blockKey = (block || 'Venus').toString().trim();
  var towerKey = (tower || 'A').toString().trim().toUpperCase();
  
  var propKey = 'FOLDER_' + blockKey.toUpperCase() + '_TOWER_' + towerKey;
  var towerFolderId = getSetting(propKey);
  
  if (towerFolderId) {
    try {
      return DriveApp.getFolderById(towerFolderId);
    } catch (e) {
      Logger.log('Cached folder ID invalid for ' + propKey + ': ' + e);
    }
  }
  
  // Fallback: locate via Block folder
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
  var towerFolder;
  if (towerFolders.hasNext()) {
    towerFolder = towerFolders.next();
  } else {
    towerFolder = blockFolder.createFolder(targetName);
  }
  
  saveSetting(propKey, towerFolder.getId());
  return towerFolder;
}

/**
 * Automatically locates or creates the specific Unit Folder under the corresponding Tower folder.
 * Example: Skyview Legal Repository -> Block Venus -> Tower A -> VA-1204
 *
 * @param {string} block
 * @param {string} tower
 * @param {string} unitCode e.g. "VA-1204"
 * @return {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateUnitFolder(block, tower, unitCode) {
  var towerFolder = getTowerFolder(block, tower);
  var unitName = (unitCode || 'Unit').toString().trim();
  
  var existing = towerFolder.getFoldersByName(unitName);
  if (existing.hasNext()) {
    return existing.next();
  }
  
  // Create unit folder automatically
  return towerFolder.createFolder(unitName);
}

/**
 * Saves an uploaded file into the target Unit Folder
 *
 * @param {GoogleAppsScript.Drive.Folder} unitFolder
 * @param {string} base64Data Base64-encoded file data
 * @param {string} mimeType
 * @param {string} standardizedFilename
 * @param {string} description Remarks or metadata
 * @return {Object} { fileId, fileUrl, downloadUrl }
 */
function saveFileToUnitFolder(unitFolder, base64Data, mimeType, standardizedFilename, description) {
  // Extract pure base64 string if data URL prefix exists
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
