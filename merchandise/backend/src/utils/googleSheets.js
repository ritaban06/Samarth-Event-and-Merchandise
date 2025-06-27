const { GoogleSpreadsheet } = require('google-spreadsheet');
const { executeWithBackoff, clearCache } = require('./sheetUtils');
const Event = require('../models/eventModel');

class GoogleSheetsService {
  constructor() {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID is not configured');
    }
    // console.log('Sheet ID configured:', process.env.GOOGLE_SHEET_ID);
    this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    this.initialized = false;
    this.lastInitTime = 0;
    this.initTTL = 5 * 60 * 1000; // 5 minutes
    this.batchSize = 20; // Process rows in batches of 20
    
    // Cache for sheets
    this.sheetsCache = {};
  }

  // Format date to DD/MM/YYYY
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Return empty string if invalid date
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  // Format amount to handle different cases
  formatAmount(amount) {
    if (!amount) return '0';
    if (typeof amount === 'number') return amount.toString();
    if (typeof amount === 'string') {
      const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''));
      return isNaN(parsedAmount) ? '0' : parsedAmount.toString();
    }
    return '0';
  }

  async init() {
    try {
      const now = Date.now();
      
      // Only re-initialize if TTL has expired
      if (!this.initialized || (now - this.lastInitTime > this.initTTL)) {
        console.log('Initializing Google Sheets connection...');
        
        if (!process.env.GOOGLE_CREDENTIALS) {
          throw new Error('GOOGLE_CREDENTIALS environment variable is missing');
        }

        let credentials;
        try {
          credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
          console.log('Credentials parsed successfully');
        } catch (error) {
          console.error('Failed to parse GOOGLE_CREDENTIALS:', error);
          throw new Error('Invalid GOOGLE_CREDENTIALS format');
        }

        // Use the executeWithBackoff for API calls
        await executeWithBackoff(async () => {
          await this.doc.useServiceAccountAuth({
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          });
        });
        
        console.log('Loading sheet information...');
        await executeWithBackoff(async () => {
          await this.doc.loadInfo();
        });
        console.log('Sheet title:', this.doc.title);
        
        this.sheet = this.doc.sheetsByIndex[0];
        if (!this.sheet) {
          throw new Error('No sheet found in the document');
        }
        console.log('Found sheet:', this.sheet.title);
        
        this.initialized = true;
        this.lastInitTime = now;
        console.log('Google Sheets initialization complete');
      } else {
        console.log('Using cached Google Sheets connection');
      }
    } catch (error) {
      this.initialized = false;
      console.error('Failed to initialize Google Sheets:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async syncToSheets(registrations) {
    try {
      console.log('Starting sync process...');
      await this.init();
      
      // Updated headers to include all required fields
      
      // Group registrations by event name
      const registrationsByEvent = {};
      registrations.forEach(reg => {
        if (!registrationsByEvent[reg.eventName]) {
          registrationsByEvent[reg.eventName] = [];
        }
        registrationsByEvent[reg.eventName].push(reg);
      });
      
      console.log(`Found ${Object.keys(registrationsByEvent).length} events to sync`);
      
      // Process each event separately
      for (const eventName of Object.keys(registrationsByEvent)) {
        const eventRegs = registrationsByEvent[eventName];
        console.log(`Processing ${eventRegs.length} registrations for event: ${eventName}`);

      const event = await Event.findOne({ eventName });
      if (!event) {
        console.error(`Event not found in database: ${eventName}`);
        continue;
      }

      // Get additional field names from the event model
      const additionalFieldNames = event.additionalFields?.map(field => field.name) || [];
      
      // Create headers including additional fields
      const headers = [
        'Registration ID',
        'Student Name',
        'Email',
        'Event Name',
        'Payment Status',
        'Payment ID',
        'Payment Type',
        'Payment Date',
        'Amount (₹)',
        'Team Name',
        'Team UID',
        'Team Role',
        ...additionalFieldNames
      ];
        
        // Get or create a sheet for this event
        const sheet = await getOrCreateEventSheet(this.doc, eventName);
        
        // Ensure headers are set correctly
        try {
          await executeWithBackoff(() => sheet.setHeaderRow(headers));
          console.log(`Headers set for ${eventName} sheet`);
        } catch (headerError) {
          console.error(`Error setting headers for ${eventName}:`, headerError);
        }
        
        // Get existing rows for this event's sheet
        let existingRows;
        try {
          existingRows = await executeWithBackoff(() => sheet.getRows());
          console.log(`Found ${existingRows.length} existing rows for ${eventName}`);
        } catch (error) {
          console.error(`Error fetching existing rows for ${eventName}:`, error);
          existingRows = [];
        }
        
        // Create a map of existing registrations by registrationId
        const existingRegistrations = new Map(
          existingRows.map(row => [row['Registration ID'], row])
        );
        
        // Prepare updates in batches
        const updates = [];
        const newRows = [];
        
        for (const reg of eventRegs) {
          const rowData = {
            'Registration ID': reg.uid || '',
            'Student Name': reg.name || '',
            'Email': reg.email || '',
            'Event Name': reg.eventName || '',
            'Payment Status': reg.payment?.status === 'paid' ? 'Paid' : 
                            reg.payment?.status === 'pending' ? 'Pending' : 
                            reg.payment?.status === 'package' ? 'Package' : 'Unpaid',
            'Payment ID': reg.payment?.payment_id || 'N/A',
            'Payment Type': reg.payment?.type || 'N/A',
            'Payment Date': this.formatDate(reg.payment?.date || reg.registrationDate),
            'Amount (₹)': this.formatAmount(reg.payment?.amount || reg.amount),
            'Team Name': reg.team?.teamName || 'N/A',
            'Team UID': reg.team?.teamuid || 'N/A',
            'Team Role': reg.team? reg.team.teamLeader? 'Leader' : 'Member' : 'N/A'
          };

          if (reg.additionalDetails instanceof Map) {
            // If additionalDetails is a Map object
            additionalFieldNames.forEach(fieldName => {
              rowData[fieldName] = reg.additionalDetails.get(fieldName) || '';
            });
          } else if (typeof reg.additionalDetails === 'object' && reg.additionalDetails !== null) {
            // If additionalDetails is a regular object
            additionalFieldNames.forEach(fieldName => {
              rowData[fieldName] = reg.additionalDetails[fieldName] || '';
            });
          }
          
          const existingRow = existingRegistrations.get(rowData['Registration ID']);
          if (existingRow) {
            updates.push({ row: existingRow, data: rowData });
          } else {
            newRows.push(rowData);
          }
        }
        
        // Process updates in batches
        console.log(`Processing ${updates.length} updates and ${newRows.length} new rows for ${eventName}`);
        
        // Update existing rows in batches
        for (let i = 0; i < updates.length; i += this.batchSize) {
          const batch = updates.slice(i, i + this.batchSize);
          await Promise.all(batch.map(async ({ row, data }) => {
            Object.keys(data).forEach(key => {
              row[key] = data[key];
            });
            try {
              await executeWithBackoff(() => row.save());
            } catch (error) {
              console.error(`Failed to update row ${data['Registration ID']} for ${eventName}:`, error);
            }
          }));
          
          console.log(`Updated batch ${i / this.batchSize + 1} of ${Math.ceil(updates.length / this.batchSize)} for ${eventName}`);
          
          // Small delay between batches to prevent quota issues
          if (i + this.batchSize < updates.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Add new rows in batches
        for (let i = 0; i < newRows.length; i += this.batchSize) {
          const batch = newRows.slice(i, i + this.batchSize);
          try {
            await executeWithBackoff(() => sheet.addRows(batch));
            console.log(`Added batch ${i / this.batchSize + 1} of ${Math.ceil(newRows.length / this.batchSize)} for ${eventName}`);
          } catch (error) {
            console.error(`Failed to add batch of rows for ${eventName}:`, error);
            
            // Fall back to adding one by one if batch fails
            for (const row of batch) {
              try {
                await executeWithBackoff(() => sheet.addRow(row));
                console.log(`Added row for ${row['Registration ID']} in ${eventName}`);
              } catch (rowError) {
                console.error(`Failed to add row ${row['Registration ID']} for ${eventName}:`, rowError);
              }
              
              // Add a small delay between individual row additions
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          // Small delay between batches
          if (i + this.batchSize < newRows.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Format the header row and add conditional formatting in batches
        try {
          // Get the column indices
          const paymentStatusIndex = headers.indexOf('Payment Status');
          const lastRow = sheet.rowCount;
          
          // Format headers in one batch
          await executeWithBackoff(async () => {
            const headerRange = `A1:${String.fromCharCode(64 + headers.length)}1`;
            await sheet.loadCells(headerRange);  // Load header row
            for (let i = 0; i < headers.length; i++) {
              const cell = sheet.getCell(0, i);
              cell.textFormat = { bold: true };
              cell.horizontalAlignment = 'CENTER';
              cell.backgroundColor = { red: 0.8, green: 0.8, blue: 0.8 };
            }
            await sheet.saveUpdatedCells();
          });
          
          // Process payment status formatting in batches
          // const BATCH_SIZE = 50; // Format 50 rows at a time
          // for (let startRow = 1; startRow < lastRow; startRow += BATCH_SIZE) {
          //   const endRow = Math.min(startRow + BATCH_SIZE - 1, lastRow - 1);
          //   const range = `${String.fromCharCode(65 + paymentStatusIndex)}${startRow + 1}:${String.fromCharCode(65 + paymentStatusIndex)}${endRow + 1}`;
            
          //   await executeWithBackoff(async () => {
          //     await sheet.loadCells(range);
              
          //     for (let i = startRow; i <= endRow; i++) {
          //       const cell = sheet.getCell(i, paymentStatusIndex);
          //       if (cell.value === 'Paid') {
          //         cell.backgroundColor = { red: 0.7, green: 0.9, blue: 0.7 }; // Light green
          //       } else if (cell.value === 'Pending') {
          //         cell.backgroundColor = { red: 1, green: 0.9, blue: 0.6 }; // Light yellow
          //       } else if (cell.value === 'Unpaid') {
          //         cell.backgroundColor = { red: 0.9, green: 0.7, blue: 0.7 }; // Light red
          //       }
          //     }
              
          //     await sheet.saveUpdatedCells();
          //   });
            
          //   console.log(`Formatted payment status for rows ${startRow+1}-${endRow+1} in ${eventName}`);
            
          //   // Add delay between formatting batches
          //   if (startRow + BATCH_SIZE < lastRow) {
          //     await new Promise(resolve => setTimeout(resolve, 1000));
          //   }
          // }
          
          console.log(`Sheet formatting completed for ${eventName}`);
        } catch (error) {
          console.error(`Error formatting sheet for ${eventName}:`, error);
        }
      }
      
      console.log('Sync completed successfully for all events');
      return true;
    } catch (error) {
      console.error('Error in syncToSheets:', error);
      throw new Error(`Sync failed: ${error.message}`);
    }
  }
  
  /**
   * Reset the cache and force reinitialization on next request
   */
  resetConnection() {
    this.initialized = false;
    this.lastInitTime = 0;
    this.sheetsCache = {};
    clearCache(); // Clear the sheetUtils cache as well
    console.log('Google Sheets connection reset');
  }
}

async function getOrCreateEventSheet(doc, eventName) {
  return await executeWithBackoff(async () => {
    try {
      // Ensure eventName is not undefined or empty
      if (!eventName) {
        throw new Error('Event name is required');
      }

      // Clean the event name to make it sheet-friendly
      const sheetName = eventName
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .substring(0, 100); // Sheets have a length limit

      // Load all sheets
      await doc.loadInfo();
      
      // Try to find existing sheet
      let sheet = doc.sheetsByTitle[sheetName];
      
      // If sheet doesn't exist, create it
      if (!sheet) {
        console.log(`Creating new sheet for event: ${sheetName}`);
        sheet = await doc.addSheet({
          title: sheetName,
          headerValues: [
            'Registration ID',
            'Name',
            'Email',
            'Phone',
            'Payment Date',     // Changed from 'Registration Date'
            'Payment Status',
            'Payment ID',
            'Payment Type',
            'Amount (₹)',
            'Team Name',        // Added
            'Team UID',
            'Team Role'         // Added
          ]
        });
        
        await sheet.setHeaderRow([
          'Registration ID',
          'Name',
          'Email',
          'Phone',
          'Payment Date',
          'Payment Status',
          'Payment ID',
          'Payment Type',
          'Amount (₹)',
          'Team Name',
          'Team UID',
          'Team Role'
        ]);

        // Format header row - update range to include new column
        await sheet.loadCells('A1:K1');
        for (let i = 0; i < sheet.headerValues.length; i++) {
          const cell = sheet.getCell(0, i);
          cell.textFormat = { bold: true };
          cell.backgroundColor = { red: 0.8, green: 0.8, blue: 0.8 };
        }
        await sheet.saveUpdatedCells();
      }

      return sheet;
    } catch (error) {
      console.error('Error in getOrCreateEventSheet:', error);
      throw new Error(`Failed to get or create sheet: ${error.message}`);
    }
  });
}

module.exports = new GoogleSheetsService();