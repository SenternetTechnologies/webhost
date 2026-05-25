/**
 * Senternet Hosting Platform - Backend (Fully Responsive Version)
 * Developed for: Senthilkumar (CEO, Senternet Technologies)
 */

const CONFIG = {
  SHEET_NAME: "Hosting_Database",
  APP_ID: typeof __app_id !== 'undefined' ? __app_id : 'senternet-hosting-v1'
};

/**
 * Handle Web App Access
 * This function serves the main admin dashboard/index page.
 */
function doGet(e) {
  const page = e.parameter.p;

  // If a specific hosted page is requested via URL (?p=appname), serve that site
  if (page) {
    return serveUserSite(page);
  }

  // Otherwise, serve the main admin dashboard with viewport responsiveness enabled
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle("Senternet Hosting - Senthilkumar")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Setup Google Sheets Automatically
 * Initializes the required sheet with headers if it doesn't exist.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(["Timestamp", "App Name", "File Name", "Content", "Short URL"]);
    sheet.getRange(1, 1, 1, 5).setBackground("#6366f1").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Process File/Code Upload & Store in Sheet
 * Takes the code/content, app name, and file name, then registers it in the Database.
 */
function processUpload(appName, content, fileName) {
  const sheet = setupDatabase();
  const scriptUrl = ScriptApp.getService().getUrl();
  const shortUrl = scriptUrl + "?p=" + encodeURIComponent(appName);

  sheet.appendRow([
    new Date(),
    appName,
    fileName || "Direct Code Paste",
    content,
    shortUrl
  ]);

  return {
    success: true,
    appName: appName,
    shortUrl: shortUrl
  };
}

/**
 * Fetch Deployment History
 * Returns all hosted application details for the dashboard table.
 */
function getHistory() {
  try {
    const sheet = setupDatabase();
    const data = sheet.getDataRange().getValues();
    const history = [];

    // Skip header and reverse to show latest first
    for (let i = data.length - 1; i >= 1; i--) {
      history.push({
        timestamp: data[i][0],
        appName: data[i][1],
        fileName: data[i][2],
        url: data[i][4]
      });
    }
    return history;
  } catch (e) {
    return [];
  }
}

/**
 * Serve User's Hosted File (Enhanced for Mobile Responsiveness)
 * Pulls site content from the Google Sheet and renders it.
 */
function serveUserSite(appName) {
  const sheet = setupDatabase();
  const data = sheet.getDataRange().getValues();
  
  // Responsive 404 Error page using CSS max-width and percentage dimensions
  let userContent = '<div style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 15px; box-sizing: border-box; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;">' +
    '<div style="background: #ffffff; max-width: 380px; width: 100%; padding: 25px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); text-align: center; border: 1px solid #e5e7eb; box-sizing: border-box;">' +
      
      // Icon Area
      '<div style="background: #fee2e2; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">' +
        '<span style="font-size: 30px; color: #ef4444;">!</span>' +
      '</div>' +

      // Title & Error Code
      '<h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0;">Site Not Found</h1>' +
      '<p style="font-size: 12px; font-weight: 600; color: #3b82f6; margin: 5px 0 20px; text-transform: uppercase; letter-spacing: 1px;">Error Code: 404</p>' +
      
      // Logic Content
      '<div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">' +
        '<p style="font-size: 13px; color: #4b5563; margin: 0; line-height: 1.6;">' +
          '• Unga <b>Domain</b> expired aayirukalam.<br />' +
          '• Link <b>Wrong-ah</b> enter pannirpeenga.<br />' +
          '• Please unga link-ai check pannuga.' +
        '</p>' +
      '</div>' +

      '<p style="font-size: 13px; color: #6b7280; margin-bottom: 25px;">Otherwise, please contact <b>Senternet Admin</b> for assistance.</p>' +

      // Action Buttons
      '<div style="display: flex; flex-direction: column; gap: 10px;">' +
        '<a href="https://wa.me/918190038085" style="background: #2563eb; color: #ffffff; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s; display: block;">WhatsApp Admin</a>' +
        '<a href="mailto:senternettechnologies@gmail.com" style="background: #ffffff; color: #374151; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db; display: block;">Email Support</a>' +
      '</div>' +

      // Branding Footer
      '<div style="margin-top: 25px; border-top: 1px solid #f3f4f6; padding-top: 15px;">' +
        '<div style="font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 0.5px;">SENTERNET TECHNOLOGIES</div>' +
        '<div style="font-size: 10px; color: #d1d5db;">Aranthangi, Pudukkottai</div>' +
      '</div>' +

    '</div>' +
  '</div>';

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === appName) {
      userContent = data[i][3];
      break;
    }
  }

  // If user uploaded plain text (no HTML structure), wrap it with correct viewport tags
  if (!userContent.toLowerCase().includes("<html")) {
    userContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${appName} | Hosted by Senternet</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            padding: 20px; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${userContent.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;
  }

  // CRITICAL FIX: The `.addMetaTag('viewport', 'width=device-width, initial-scale=1')` 
  // command enforces that Google Script's sandboxed iframe scales perfectly on mobile screens!
  return HtmlService.createHtmlOutput(userContent)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
