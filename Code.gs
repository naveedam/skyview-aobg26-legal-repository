/**
 * Skyview AOBG26 Legal Repository
 * Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
 * Repository: naveedam/skyview-aobg26-legal-repository
 *
 * File: Code.gs
 * Description: Main HTTP request router, first-run initialization interceptor,
 * and page template renderer for the Google Apps Script Web App.
 */

/**
 * Handles all incoming GET requests to the Web Application.
 *
 * Routing Rules:
 * 1. FIRST-RUN AUTO-DETECTION:
 *    If checkRepositoryStatus().initialized === false, automatically intercepts
 *    the request and routes directly to the Administrator Setup screen.
 *
 * 2. POST-INITIALIZATION ROUTING:
 *    - Defaults to Member Portal (index.html)
 *    - ?page=admin routes to Admin Dashboard (admin.html)
 *    - ?page=portal explicitly routes to Member Portal
 *
 * @param {Object} e HTTP GET event parameters
 * @return {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  try {
    var status = checkRepositoryStatus();
    var page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toLowerCase() : 'portal';
    var userEmail = '';
    try {
      userEmail = Session.getActiveUser().getEmail() || '';
    } catch (sessionErr) {
      Logger.log('Could not determine active user email: ' + sessionErr);
    }

    // Dynamic admin authorization: reads ADMIN_EMAIL dynamically from Settings sheet
    var activeUserEmailNormalized = userEmail.toLowerCase().trim();
    var adminEmailNormalized = getAdminEmail();
    var isAdmin = (activeUserEmailNormalized !== '' && adminEmailNormalized !== '' && activeUserEmailNormalized === adminEmailNormalized);
    
    // 1. FIRST-RUN DETECTION:
    // If repository has not been initialized in Google Drive / Sheets
    if (!status.initialized) {
      // If the repository is not initialized yet, allow initialization by the first logged-in user only.
      if (activeUserEmailNormalized !== '') {
        var setupTemplate = getHtmlTemplate('admin');
        setupTemplate.isAdmin = true;
        setupTemplate.userEmail = userEmail;
        setupTemplate.requestedPage = 'setup';
        setupTemplate.isSetupMode = true;
        setupTemplate.repoStatus = status;
        
        var setupOutput = setupTemplate.evaluate();
        setupOutput.setTitle('Skyview AOBG26 Legal Repository - Administrator Setup');
        setupOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        setupOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
        return setupOutput;
      } else {
        // Anonymous / unauthenticated session when uninitialized - show Member Portal with sign-in guidance
        var uninitTemplate = getHtmlTemplate('index');
        uninitTemplate.isAdmin = false;
        uninitTemplate.userEmail = '';
        uninitTemplate.requestedPage = 'portal';
        uninitTemplate.isSetupMode = false;
        uninitTemplate.repoStatus = status;
        uninitTemplate.accessNotice = 'Repository setup must be initialized by an authenticated Google Workspace user.';
        
        var uninitOutput = uninitTemplate.evaluate();
        uninitOutput.setTitle('Skyview AOBG26 Legal Repository - Member Portal');
        uninitOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        uninitOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
        return uninitOutput;
      }
    }
    
    // 2. SERVER-SIDE RESTRICTION FOR ADMIN DASHBOARD:
    // After initialization, only the stored ADMIN_EMAIL read from the Settings sheet may access.
    // Otherwise redirect to the Member Portal.
    if (page === 'admin') {
      if (!isAdmin) {
        Logger.log('Unauthorized Admin Dashboard access attempt from: ' + (userEmail || 'Anonymous') + ' - Redirecting to Member Portal.');
        page = 'portal';
      }
    }
    
    var templateName = (page === 'admin' && isAdmin) ? 'admin' : 'index';
    var title = (templateName === 'admin')
      ? 'Skyview AOBG26 Legal Repository - Admin Dashboard'
      : 'Skyview AOBG26 Legal Repository - Member Portal';
    
    var template = getHtmlTemplate(templateName);
    template.isAdmin = isAdmin;
    template.userEmail = userEmail;
    template.requestedPage = (templateName === 'admin') ? 'admin' : 'portal';
    template.isSetupMode = false;
    template.repoStatus = status;
    
    var htmlOutput = template.evaluate();
    htmlOutput.setTitle(title);
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return htmlOutput;
  } catch (err) {
    Logger.log('Fatal error in doGet: ' + err);
    var errOutput = HtmlService.createHtmlOutput(
      '<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 40px auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFF;">' +
      '<h2 style="color: #0F766E;">Skyview Legal Repository</h2>' +
      '<p style="color: #64748B;">An unexpected error occurred while loading the application.</p>' +
      '<pre style="background: #F8FAFC; padding: 12px; border-radius: 6px; color: #DC2626; font-size: 12px;">' + err.toString() + '</pre>' +
      '<p><a href="?" style="color: #0F766E; font-weight: bold;">Reload Application</a></p>' +
      '</div>'
    );
    errOutput.setTitle('Skyview Legal Repository - Error');
    return errOutput;
  }
}
