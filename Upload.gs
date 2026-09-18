/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Upload.gs
 * Description: Validates member submissions, creates unit folders dynamically,
 * saves files into Google Drive with standardized names, and appends to Master Register.
 */

var ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
var MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Main server-side handler for member submissions
 *
 * @param {Object} submissionData
 * @return {Object} Result object with submission ID and summary
 */
function processMemberSubmission(submissionData) {
  if (!submissionData) {
    throw new Error('Submission payload is empty.');
  }
  
  // 1. Validate Member Details
  var memberName = sanitizeText(submissionData.memberName);
  var mobile = sanitizeText(submissionData.mobile);
  var email = sanitizeText(submissionData.email);
  
  if (!memberName || !mobile || !email) {
    throw new Error('Full Name, Mobile Number, and Email Address are all required.');
  }
  
  // 2. Validate Legal Status
  var legalStatusList = submissionData.legalStatus;
  if (!legalStatusList || !Array.isArray(legalStatusList) || legalStatusList.length === 0) {
    throw new Error('Please select at least one Legal Status.');
  }
  var legalStatusString = legalStatusList.join(', ');
  
  // 3. Validate Units
  var units = submissionData.units;
  if (!units || !Array.isArray(units) || units.length === 0) {
    throw new Error('At least one Property Unit must be added.');
  }
  
  // Verify that there is at least one document across units
  var totalFilesCount = 0;
  for (var u = 0; u < units.length; u++) {
    var unitObj = units[u];
    if (unitObj.documents && Array.isArray(unitObj.documents)) {
      for (var d = 0; d < unitObj.documents.length; d++) {
        var docItem = unitObj.documents[d];
        if (docItem.files && Array.isArray(docItem.files)) {
          totalFilesCount += docItem.files.length;
        }
      }
    }
  }
  
  if (totalFilesCount === 0) {
    throw new Error('Please select at least one document to upload.');
  }
  
  // 4. Generate Single Submission ID for the entire submission
  var submissionId = generateSubmissionId();
  var uploadDate = new Date();
  var uploadTimestamp = formatTimestampIST(uploadDate);
  
  var registerRowsToAppend = [];
  var uploadedFilesSummary = [];
  
  // 5. Process each unit and its documents
  for (var i = 0; i < units.length; i++) {
    var unit = units[i];
    
    var block = sanitizeText(unit.block || 'Venus');
    var tower = sanitizeText(unit.tower || 'A').toUpperCase();
    var floor = sanitizeText(unit.floor || '00');
    var flat = sanitizeText(unit.flat || '01');
    
    // Auto-calculate unit code internally
    var unitCode = formatUnitCode(block, tower, floor, flat);
    
    // Locate or create the unit folder in Drive
    // Skyview Legal Repository -> Block Venus/Jupiter -> Tower X -> UnitCode
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
        
        // Validate file extension
        var extMatch = origName.match(/\.[0-9a-z]+$/i);
        var ext = extMatch ? extMatch[0].toLowerCase() : '';
        if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
          throw new Error('Unsupported file type for "' + origName + '". Accepted formats: PDF, JPG, JPEG, PNG.');
        }
        
        // Validate file size (25 MB max)
        if (approxSizeBytes > MAX_FILE_SIZE_BYTES) {
          throw new Error('File "' + origName + '" exceeds the 25 MB size limit.');
        }
        
        // Sequence index (1-based per document type within the unit submission)
        var sequenceIndex = k + 1;
        
        // Format standardized filename:
        // Format: Block_Tower_Unit_DocumentType_YYYYMMDD_Sequence.ext
        // Example: Venus_A_VA1204_ConsumerForumOrder_20260918_01.pdf
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
        
        // Save file directly to target unit folder
        var driveFileResult = saveFileToUnitFolder(
          unitFolder,
          base64Data,
          mimeType,
          storedFilename,
          'Member: ' + memberName + ' | ' + remarks
        );
        
        // Row matching REGISTER_COLUMNS:
        // 0: Submission ID
        // 1: Upload Timestamp
        // 2: Member Name
        // 3: Mobile
        // 4: Email
        // 5: Legal Status
        // 6: Block
        // 7: Tower
        // 8: Floor
        // 9: Flat
        // 10: Unit Code
        // 11: Document Type
        // 12: Remarks
        // 13: Original Filename
        // 14: Stored Filename
        // 15: Google Drive File ID
        // 16: Google Drive Link
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
  
  // 6. Batch append all document rows to Master Register Sheet
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
}
