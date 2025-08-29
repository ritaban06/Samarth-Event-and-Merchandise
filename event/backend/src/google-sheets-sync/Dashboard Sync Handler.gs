// Dashboard Sync Handler for Samarth Event Dashboard
// This script handles data sent from the admin dashboard to update Google Sheets

// ================== Configuration ==================
const SPREADSHEET_ID = '<your-google-sheets-id>';
const JWT_TOKEN = '<generate-jwt-token-for-365-days>';

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
function syncDashboardData(registrationsData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Preprocess registrations to handle Ignite event-specific logic
  // registrationsData.forEach(reg => {
  //   if (reg.eventName && reg.additionalDetails && reg.additionalDetails.semester) {
  //     const ignitePattern = /^ignite(\s+|$|\d*|\s+\d*|\s*\d+\s*)/i;
  //     if (ignitePattern.test(reg.eventName)) {
  //       const semester = parseInt(reg.additionalDetails.semester, 10);
  //       if (!isNaN(semester)) {
  //         if (semester === 1 || semester === 2) {
  //           reg.additionalDetails.year = "1";
  //         } else if (semester === 3 || semester === 4) {
  //           reg.additionalDetails.year = "2";
  //         } else if (semester === 5 || semester === 6) {
  //           reg.additionalDetails.year = "3";
  //         } else if (semester === 7 || semester === 8) {
  //           reg.additionalDetails.year = "4";
  //         } else {
  //           reg.additionalDetails.year = "N/A";
  //         }
  //       } else {
  //         reg.additionalDetails.year = "N/A";
  //       }
  //     }
  //   }
  // });
  
  // Group registrations by event
  const eventRegistrations = {};
  registrationsData.forEach(reg => {
    if (!eventRegistrations[reg.eventName]) {
      eventRegistrations[reg.eventName] = [];
    }
    eventRegistrations[reg.eventName].push(reg);
  });
  
  // Process each event's registrations
  for (const eventName in eventRegistrations) {
    syncEventSheet(ss, eventName, eventRegistrations[eventName]);
  }
  
  return { success: true, message: "All data synced to Google Sheets successfully!" };
}

function syncEventSheet(spreadsheet, eventName, registrations) {
  Logger.log(`🔄 Syncing ${registrations.length} registrations for event: ${eventName}`);
  
  // Get or create sheet
  let sheet = spreadsheet.getSheetByName(eventName);
  if (!sheet) {
    Logger.log(`📝 Creating new sheet for event: ${eventName}`);
    sheet = spreadsheet.insertSheet(eventName);
    
    // Set up headers based on first registration
    const firstReg = registrations[0];
    const headers = [
      'Registration ID', 'Student Name', 'Email', 'Event Name', 'Payment Status',
      'Payment ID', 'Payment Type', 'Payment Date', 'Amount (₹)',
      'Team Name', 'Team UID', 'Team Role'
    ];
    
    // Add any additional fields if present
    if (firstReg.additionalDetails) {
      Object.keys(firstReg.additionalDetails).forEach(key => {
        if (!headers.includes(key)) headers.push(key);
      });
    }
    
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f3f3');
  }
  
  // Get current headers and data
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow() - 1), sheet.getLastColumn()).getValues();
  
  // Create map of existing UIDs to row indices
  const uidIndex = headers.indexOf('Registration ID');
  const existingUidMap = {};
  data.forEach((row, i) => {
    const uid = row[uidIndex];
    if (uid) existingUidMap[uid] = i + 2; // +2 because row index is 0-based and we have header row
  });
  
  // Process each registration
  registrations.forEach(reg => {
    const values = headers.map(header => {
      switch (header) {
        case 'Registration ID': return reg.uid || 'N/A';
        case 'Student Name': return reg.name || 'N/A';
        case 'Email': return reg.email || 'N/A';
        case 'Event Name': return eventName || 'N/A';
          
        case 'Payment Status':
          return reg.payment?.status === 'paid' ? 'Paid' :
                 reg.payment?.status === 'pending' ? 'Pending' :
                 reg.payment?.status === 'package' ? 'Package' :
                 reg.payment?.status === 'free' ? 'Free' : 'Unpaid';
          
        case 'Payment ID': return reg.payment?.payment_id || 'N/A';
        case 'Payment Type': return reg.payment?.type || 'N/A';
        case 'Payment Date': return formatDate(reg.payment?.date || reg.registrationDate);
        case 'Amount (₹)': return formatAmount(reg.payment?.amount || reg.amount);
          
        case 'Team Name': return reg.team?.teamName || 'N/A';
        case 'Team UID': return reg.team?.teamuid || 'N/A';
        case 'Team Role': return reg.team ? (reg.team.teamLeader ? 'Leader' : 'Member') : 'N/A';
          
        default:
          // Handle additional fields from additionalDetails or directly on reg object
          if (reg.hasOwnProperty(header)) return reg[header];
          if (reg.additionalDetails && reg.additionalDetails.hasOwnProperty(header)) 
            return reg.additionalDetails[header];
          return 'N/A';
      }
    });
    
    if (existingUidMap[reg.uid]) {
      // Update existing row
      Logger.log(`✏️ Updating row for UID: ${reg.uid}`);
      sheet.getRange(existingUidMap[reg.uid], 1, 1, values.length).setValues([values]);
    } else {
      // Add new row
      Logger.log(`➕ Adding new row for UID: ${reg.uid}`);
      sheet.appendRow(values);
    }
  });
}

// ================== API Endpoint ==================
function doPost(e) {
  try {
    // Validate auth token if present
    const authHeader = e.parameter.authorization || '';
    if (authHeader && (authHeader.startsWith('Bearer ') && authHeader.substring(7) !== JWT_TOKEN)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Unauthorized"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const payload = JSON.parse(e.postData.contents);
    
    // Handle both automatic sync (events list) and dashboard sync (registrations array)
    if (payload.events && Array.isArray(payload.events)) {
      // This is the automatic sync from the change stream
      Logger.log(`📨 Received automatic sync request for events: ${payload.events.join(', ')}`);
      
      // Process each event
      for (const eventName of payload.events) {
        syncSingleEvent(eventName);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: `Processed ${payload.events.length} events`
      })).setMimeType(ContentService.MimeType.JSON);
    } 
    else if (payload.registrations && Array.isArray(payload.registrations)) {
      // This is the manual dashboard sync
      Logger.log(`📨 Received dashboard sync request with ${payload.registrations.length} registrations`);
      
      const result = syncDashboardData(payload.registrations);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    else {
      // Invalid payload
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Invalid payload format"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    Logger.log(`❌ Error in doPost: ${err}`);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
