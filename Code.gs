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
 * 1. ZERO-CONFIG FIRST-RUN AUTO-DETECTION:
 *    Checks whether the repository has already been initialized by looking for the
 *    hidden Settings sheet inside the Master Register (without using Session.getActiveUser()
 *    or Session.getEffectiveUser() to determine whether setup is required).
 *    - If the Settings sheet does not exist: automatically display the Administrator Setup screen.
 *    - If the Settings sheet exists: automatically display the Member Portal.
 *
 * 2. POST-INITIALIZATION ROUTING:
 *    - Defaults to Member Portal (index.html)
 *    - ?page=admin routes to Admin Dashboard (admin.html) for authorized admin
 *    - ?page=portal explicitly routes to Member Portal
 *
 * @param {Object} e HTTP GET event parameters
 * @return {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  try {
    // 1. Check whether repository has already been initialized by looking for
    // the hidden Settings sheet inside the Master Register.
    // Do NOT use Session.getActiveUser() or Session.getEffectiveUser() to determine setup.
    var status = checkRepositoryStatus();
    var page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toLowerCase() : '';

    // If Settings sheet does not exist, automatically display Administrator Setup screen
    if (!status.initialized) {
      var setupTemplate = getHtmlTemplate('admin');
      setupTemplate.isAdmin = false;
      setupTemplate.userEmail = '';
      setupTemplate.adminEmail = '';
      setupTemplate.requestedPage = 'setup';
      setupTemplate.isSetupMode = true;
      setupTemplate.repoStatus = status;

      var setupOutput = setupTemplate.evaluate();
      setupOutput.setTitle('Skyview AOBG26 Legal Repository - Administrator Setup');
      setupOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
      setupOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      return setupOutput;
    }

    // If Settings sheet exists, determine user role and page routing
    var userEmail = '';
    try {
      userEmail = Session.getActiveUser().getEmail() || '';
    } catch (sessionErr) {
      Logger.log('Active user session check: ' + sessionErr);
    }

    var activeUserEmailNormalized = userEmail.toLowerCase().trim();
    var adminEmailNormalized = getAdminEmail().toLowerCase().trim();
    var isAdmin = (activeUserEmailNormalized !== '' && adminEmailNormalized !== '' && activeUserEmailNormalized === adminEmailNormalized);

    // Admin Dashboard should only be available after initialization and for authorized admin
    if (page === 'admin') {
      if (!isAdmin) {
        Logger.log('Non-admin access to ?page=admin redirected to Member Portal.');
        page = 'portal';
      }
    } else {
      // If the Settings sheet exists, automatically display the Member Portal
      page = 'portal';
    }

    var templateName = (page === 'admin' && isAdmin) ? 'admin' : 'index';
    var title = (templateName === 'admin')
      ? 'Skyview AOBG26 Legal Repository - Admin Dashboard'
      : 'Skyview AOBG26 Legal Repository - Member Portal';

    var template = getHtmlTemplate(templateName);
    template.isAdmin = isAdmin;
    template.userEmail = userEmail;
    template.adminEmail = adminEmailNormalized;
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
