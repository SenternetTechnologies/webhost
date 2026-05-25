/**
 * Senternet Hosting Platform - Backend
 * Updated for: Senthilkumar (CEO, Senternet Technologies)
 */

const CONFIG = {
  SHEET_ID: "1rWhtkf0S8oRMEvbD0gBfisb5du1_IRYWpzQhwVZNdlk",
  SHEET_NAME: "Hosting_Database",
  APP_ID: 'senternet-hosting-v1'
};

function doGet(e) {
  const page = e.parameter.p;
  if (page) return serveUserSite(page);
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle("Senternet Hosting - Senthilkumar")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setupDatabase() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(["Timestamp", "App Name", "File Name", "Content", "Short URL"]);
  }
  return sheet;
}

function processUpload(appName, content, fileName) {
  const sheet = setupDatabase();
  const scriptUrl = ScriptApp.getService().getUrl();
  const shortUrl = scriptUrl + "?p=" + encodeURIComponent(appName);
  sheet.appendRow([new Date(), appName, fileName || "Direct Code", content, shortUrl]);
  return { success: true, appName, shortUrl };
}

function serveUserSite(appName) {
  const sheet = setupDatabase();
  const data = sheet.getDataRange().getValues();
  let userContent = "<h1>Site Not Found</h1>";
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === appName) {
      userContent = data[i][3];
      break;
    }
  }
  return HtmlService.createHtmlOutput(userContent)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
