/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Owner Account: skyviewaobg26@gmail.com
 *
 * File: Code.gs
 * Description: Web App entry point, routing, HTML Service template inclusion, and metadata endpoints.
 */

/**
 * Web App entry point handling HTTP GET requests
 * @param {Object} e Event object
 * @return {GoogleAppsScript.HTML.HtmlOutput}
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

/**
 * Helper to include modular HTML files (CSS, JS) inside HTML Service templates
 * Usage: <?!= include('styles'); ?>
 *
 * @param {string} filename
 * @return {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Returns configuration metadata used by the client-side UI
 * @return {Object}
 */
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
}
