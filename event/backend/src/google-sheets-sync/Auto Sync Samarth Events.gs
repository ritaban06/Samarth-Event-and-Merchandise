// const jwt = require('jsonwebtoken');
// const token = jwt.sign(payload, secret, { expiresIn: '365d' });

// ================== Helpers ==================
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    var d = new Date(dateStr);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy");
  } catch (e) {
    return 'N/A';
  }
}

function formatAmount(amount) {
  if (!amount || isNaN(amount)) return 'N/A';
  return "₹" + amount;
}

// ================== Main Sync Function ==================
function syncSingleEvent(eventName) {
  var spreadsheetId = '<only-google-sheets-id>';
  var jwtToken = '<generate-new-jwtToken-for-365-days>';

  var apiUrl = 'https://samarth-event-backend-droplet.ritaban.me/api/events';
  var options = {
    'method': 'get',
    'headers': { 'Authorization': 'Bearer ' + jwtToken }
  };

  // Fetch all events
  var response = UrlFetchApp.fetch(apiUrl, options);
  var allEvents = JSON.parse(response.getContentText());

  // Find specific event
  var event = allEvents.find(ev => ev.eventName === eventName);
  if (!event) {
    Logger.log("❌ Event not found in API: " + eventName);
    return;
  }

  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(event.eventName);

  // Create new sheet if missing
  if (!sheet) {
    Logger.log('📝 Creating new sheet for event: ' + event.eventName);
    sheet = ss.insertSheet(event.eventName);

    var headers = [
      'Registration ID','Student Name','Email','Event Name','Payment Status',
      'Payment ID','Payment Type','Payment Date','Amount (₹)',
      'Team Name','Team UID','Team Role'
    ];

    if (event.additionalFields && event.additionalFields.length > 0) {
      event.additionalFields.forEach(f => headers.push(f.name));
    }

    sheet.appendRow(headers);
  }

  // Ensure headers are up to date
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  event.additionalFields?.forEach(f => {
    if (!headers.includes(f.name)) {
      headers.push(f.name);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  });

  // Collect existing data
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var uidIndex = headers.indexOf('Registration ID');
  var existingUidMap = {};
  data.forEach(function(row, i) {
    var uid = row[uidIndex];
    if (uid) existingUidMap[uid] = i + 2;
  });

  // Insert or update rows
  event.participants.forEach(function(reg) {
    var values = headers.map(function(header) {
      switch (header) {
        case 'Registration ID': return reg.uid || 'N/A';
        case 'Student Name':    return reg.name || 'N/A';
        case 'Email':           return reg.email || 'N/A';
        case 'Event Name':      return event.eventName || 'N/A';

        case 'Payment Status': 
          return reg.payment?.status === 'paid' ? 'Paid' :
                 reg.payment?.status === 'pending' ? 'Pending' :
                 reg.payment?.status === 'package' ? 'Package' :
                 reg.payment?.status === 'free' ? 'Free' : 'Unpaid';

        case 'Payment ID':      return reg.payment?.payment_id || 'N/A';
        case 'Payment Type':    return reg.payment?.type || 'N/A';
        case 'Payment Date':    return formatDate(reg.payment?.date || reg.registrationDate);
        case 'Amount (₹)':      return formatAmount(reg.payment?.amount || reg.amount);

        case 'Team Name':       return reg.team?.teamName || 'N/A';
        case 'Team UID':        return reg.team?.teamuid || 'N/A';
        case 'Team Role':       return reg.team ? (reg.team.teamLeader ? 'Leader' : 'Member') : 'N/A';

        default:
          if (reg.hasOwnProperty(header)) return reg[header];
          if (reg.additionalDetails && reg.additionalDetails.hasOwnProperty(header)) 
            return reg.additionalDetails[header];
          return 'N/A';
      }
    });

    if (existingUidMap[reg.uid]) {
      Logger.log('✏️ Updating row for UID: ' + reg.uid);
      sheet.getRange(existingUidMap[reg.uid], 1, 1, values.length).setValues([values]);
    } else {
      Logger.log('➕ Adding new row for UID: ' + reg.uid);
      sheet.appendRow(values);
    }
  });
}

// ================== Webhook Entry Point ==================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    Logger.log("📨 Webhook payload: " + JSON.stringify(data));

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach(eventName => {
        syncSingleEvent(eventName);
      });
      return ContentService.createTextOutput("✅ Synced events: " + data.events.join(", "));
    } else {
      return ContentService.createTextOutput("⚠️ Ignored (no events provided)");
    }
  } catch (err) {
    Logger.log("❌ Error in doPost: " + err);
    return ContentService.createTextOutput("Error: " + err);
  }
}
