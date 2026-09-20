/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Upload.gs
 * Description: Member submission processing, multi-unit validation,
 * automatic Drive folder routing, standardized file naming, and Master Register updates.
 */

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
  
  // 1. Validate Member Contact Information
  var memberName = sanitizeText(submissionData.memberName);
  var mobile = sanitizeText(submissionData.mobile);
  var email = sanitizeText(submissionData.email);
  
  if (!memberName || !mobile || !email) {
    throw new Error('Full Name, Mobile Number, and Email Address are all required.');
  }
  
  // 2. Validate Multiple Legal Statuses
  var legalStatusList = submissionData.legalStatus;
  if (!legalStatusList || !Array.isArray(legalStatusList) || legalStatusList.length === 0) {
    throw new Error('Please select at least one Legal Status.');
  }
  var legalStatusString = legalStatusList.join(', ');
  
  // 3. Validate Multiple Property Units
  var units = submissionData.units;
  if (!units || !Array.isArray(units) || units.length === 0) {
    throw new Error('At least one Property Unit must be added.');
  }
  
  // Verify document existence across units
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
  
  // 4. Generate Single Atomic Submission ID for the entire submission
  var submissionId = generateSubmissionId();
  var uploadDate = new Date();
  var uploadTimestamp = formatTimestampIST(uploadDate);
  
  var registerRowsToAppend = [];
  var uploadedFilesSummary = [];
  
  // 5. Process each unit and its attached documents
  for (var i = 0; i < units.length; i++) {
    var unit = units[i];
    
    var block = sanitizeText(unit.block || 'Venus');
    var tower = sanitizeText(unit.tower || 'A').toUpperCase();
    var floor = sanitizeText(unit.floor || '00');
    var flat = sanitizeText(unit.flat || '01');
    
    // Auto-calculate standardized unit code (e.g. VA-1204)
    var unitCode = formatUnitCode(block, tower, floor, flat);
    
    // Dynamically locate or create the unit folder in Google Drive
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
        
        // Validate file extension against allowed list
        var extMatch = origName.match(/\.[0-9a-z]+$/i);
        var ext = extMatch ? extMatch[0].toLowerCase() : '';
        if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
          throw new Error('Unsupported file format for "' + origName + '". Allowed formats: PDF, JPG, JPEG, PNG.');
        }
        
        // Validate file size limit (25 MB max)
        if (approxSizeBytes > MAX_FILE_SIZE_BYTES) {
          throw new Error('File "' + origName + '" exceeds the 25 MB size limit.');
        }
        
        // Sequence index (1-based per document type within the unit submission)
        var sequenceIndex = k + 1;
        
        // Generate standardized filename:
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
        
        // Row matching REGISTER_COLUMNS (17 fields):
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
  
  // 6. Batch append all document rows to Master Register Sheet in a single atomic call
  appendRegisterRows(registerRowsToAppend);

  // 7. Send Gmail confirmation email receipt to the member
  var unitCodesList = [];
  for (var u = 0; u < units.length; u++) {
    var uObj = units[u];
    var uCodeFormatted = formatUnitCode(uObj.block, uObj.tower, uObj.floor, uObj.flat);
    if (unitCodesList.indexOf(uCodeFormatted) === -1) {
      unitCodesList.push(uCodeFormatted);
    }
  }
  var unitsSubmittedString = unitCodesList.join(', ');
  var totalDocumentsCount = registerRowsToAppend.length;
  
  var emailSent = false;
  try {
    sendSubmissionConfirmationEmail(
      email,
      memberName,
      submissionId,
      unitsSubmittedString,
      totalDocumentsCount,
      uploadTimestamp
    );
    emailSent = true;
  } catch (emailErr) {
    Logger.log('Confirmation email sending notice: ' + emailErr);
  }
  
  return {
    success: true,
    submissionId: submissionId,
    timestamp: uploadTimestamp,
    memberName: memberName,
    unitsCount: units.length,
    unitsSubmitted: unitsSubmittedString,
    documentsCount: totalDocumentsCount,
    emailReceiptSent: emailSent,
    files: uploadedFilesSummary
  };
}

/**
 * Sends a Gmail confirmation email receipt to the member after every successful submission.
 *
 * Subject: Skyview Repository Submission Received – {Submission ID}
 * Contents: Submission ID, Member Name, Units Submitted, Number of Documents and Timestamp.
 *
 * @param {string} recipientEmail Member's email address
 * @param {string} memberName Member's full name
 * @param {string} submissionId Unique submission tracking ID (e.g. SV-SUB-000001)
 * @param {string} unitsSubmitted Formatted list of property units submitted (e.g. VA-1204, JC-0802)
 * @param {number} documentsCount Total count of documents secured
 * @param {string} timestamp IST formatted timestamp of upload
 */
function sendSubmissionConfirmationEmail(recipientEmail, memberName, submissionId, unitsSubmitted, documentsCount, timestamp) {
  if (!recipientEmail) {
    Logger.log('No recipient email specified for confirmation receipt.');
    return;
  }
  
  // Subject: Skyview Repository Submission Received – {Submission ID}
  var subject = 'Skyview Repository Submission Received \u2013 ' + submissionId;
  
  // Retrieve ADMIN_EMAIL from the hidden Settings sheet as the replyTo address
  var adminEmail = getAdminEmail();
  var adminContactNotice = adminEmail ? ('Administrative Contact: ' + adminEmail) : '';
  
  var plainBody = [
    'Dear ' + memberName + ',',
    '',
    'Your legal documents have been successfully received and secured in the Skyview Legal Repository.',
    '',
    'SUBMISSION RECEIPT DETAILS:',
    '--------------------------------------------------',
    'Submission ID:       ' + submissionId,
    'Member Name:         ' + memberName,
    'Units Submitted:     ' + unitsSubmitted,
    'Number of Documents: ' + documentsCount,
    'Timestamp:           ' + timestamp,
    '--------------------------------------------------',
    '',
    'All documents have been cataloged in the Master Register and archived in your respective unit folder in Google Drive.',
    '',
    'Regards,',
    ASSOCIATION_NAME,
    adminContactNotice
  ].filter(function(line) { return line !== ''; }).join('\n');
  
  var htmlAdminNotice = adminEmail 
    ? ('<br/>Administrative Contact: <a href="mailto:' + adminEmail + '" style="color: #0F766E; text-decoration: none;">' + adminEmail + '</a>')
    : '';

  var htmlBody = [
    '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1E293B; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">',
    '  <div style="background-color: #0F766E; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px; color: #FFFFFF;">',
    '    <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #FFFFFF;">Skyview Legal Repository</h2>',
    '    <p style="margin: 0; font-size: 12px; color: #CCFBF1;">' + ASSOCIATION_NAME + '</p>',
    '  </div>',
    '  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Dear <strong>' + memberName + '</strong>,</p>',
    '  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Your legal documents have been successfully received, verified, and secured in the Association Google Drive repository and indexed in the Master Register.</p>',
    '  <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">',
    '    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">',
    '      <tr style="border-bottom: 1px solid #F1F5F9;">',
    '        <td style="padding: 10px 0; color: #64748B; font-weight: 500; width: 45%;">Submission ID</td>',
    '        <td style="padding: 10px 0; font-family: monospace; font-weight: 700; color: #0F766E;">' + submissionId + '</td>',
    '      </tr>',
    '      <tr style="border-bottom: 1px solid #F1F5F9;">',
    '        <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Member Name</td>',
    '        <td style="padding: 10px 0; font-weight: 600; color: #1E293B;">' + memberName + '</td>',
    '      </tr>',
    '      <tr style="border-bottom: 1px solid #F1F5F9;">',
    '        <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Units Submitted</td>',
    '        <td style="padding: 10px 0; font-weight: 600; color: #1E293B;">' + unitsSubmitted + '</td>',
    '      </tr>',
    '      <tr style="border-bottom: 1px solid #F1F5F9;">',
    '        <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Number of Documents</td>',
    '        <td style="padding: 10px 0; font-weight: 700; color: #0F766E;">' + documentsCount + ' Document(s)</td>',
    '      </tr>',
    '      <tr>',
    '        <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Timestamp</td>',
    '        <td style="padding: 10px 0; color: #475569;">' + timestamp + '</td>',
    '      </tr>',
    '    </table>',
    '  </div>',
    '  <p style="font-size: 13px; line-height: 1.5; color: #64748B; margin: 0 0 24px 0;">This email serves as an official confirmation of your submission. All files have been archived in your respective unit folders in the Skyview Drive repository.</p>',
    '  <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />',
    '  <p style="font-size: 11px; color: #94A3B8; margin: 0; line-height: 1.5;">' + ASSOCIATION_NAME + htmlAdminNotice + '</p>',
    '</div>'
  ].join('\n');
  
  try {
    var mailOptions = {
      htmlBody: htmlBody,
      name: 'Skyview Legal Repository'
    };
    if (adminEmail) {
      mailOptions.replyTo = adminEmail;
    }
    GmailApp.sendEmail(recipientEmail, subject, plainBody, mailOptions);
    Logger.log('Gmail confirmation email sent successfully to ' + recipientEmail + ' for ' + submissionId + (adminEmail ? ' (replyTo: ' + adminEmail + ')' : ''));
  } catch (gmailErr) {
    Logger.log('GmailApp error: ' + gmailErr + ' - attempting fallback via MailApp');
    try {
      var fallbackMailOptions = {
        to: recipientEmail,
        subject: subject,
        body: plainBody,
        htmlBody: htmlBody,
        name: 'Skyview Legal Repository'
      };
      if (adminEmail) {
        fallbackMailOptions.replyTo = adminEmail;
      }
      MailApp.sendEmail(fallbackMailOptions);
      Logger.log('MailApp fallback confirmation email sent successfully to ' + recipientEmail + (adminEmail ? ' (replyTo: ' + adminEmail + ')' : ''));
    } catch (mailErr) {
      Logger.log('MailApp error: ' + mailErr);
    }
  }
}
