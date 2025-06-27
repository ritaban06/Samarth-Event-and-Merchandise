const Event = require('../models/eventModel');

const BASE_HEADERS = [
    'Registration ID',
    'Student Name',
    'Email',
    'Event Name',
    'Payment Date',  // Changed from 'Registration Date'
    'Amount (₹)',
    'Payment Status',
    'Payment Type',  // Added
    'Payment ID',    // Added
    'Team Name',     // Added
    'Team UID',
    'Team Role'       // Added
];

/**
 * Cache object to store document and sheet info
 */
const sheetCache = {
    docInfo: {
        lastLoaded: 0,
        ttl: 5 * 60 * 1000 // 5 minutes TTL
    },
    sheets: {}
};

/**
 * Execute an operation with exponential backoff for rate limit handling
 * @param {Function} operation - Async operation to execute
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<any>} - Result of the operation
 */
async function executeWithBackoff(operation, maxRetries = 5) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            // Check for rate limit errors (429) in different possible formats
            const isRateLimit = error.message?.includes('429') || 
                               error.code === 429 || 
                               error.response?.status === 429 ||
                               error.message?.includes('Quota exceeded');
            
            if (!isRateLimit) {
                throw error;
            }
            
            if (attempt >= maxRetries) {
                console.log(`Maximum retry attempts (${maxRetries}) reached. Giving up.`);
                throw error;
            }
            
            // Calculate delay with jitter: 1s, 2s, 4s, 8s, 16s...
            const baseDelay = Math.pow(4, attempt) * 1000;
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;
            
            console.log(`Rate limit exceeded. Attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${Math.round(delay/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

/**
 * Get or create a Google Sheet for an event
 * @param {GoogleSpreadsheetDocument} doc - Google Spreadsheet document
 * @param {string} eventName - Name of the event
 * @returns {Promise<GoogleSpreadsheetWorksheet>} - The sheet for the event
 */
async function getOrCreateEventSheet(doc, eventName) {
    try {
        if (!eventName) {
            throw new Error('Event name is required');
        }
        
        // Clean event name for sheet title
        const cleanedEventName = eventName
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .substring(0, 100); // Sheets have a length limit
            
        // Load doc info only if not recently loaded
        const now = Date.now();
        if (now - sheetCache.docInfo.lastLoaded > sheetCache.docInfo.ttl) {
            await executeWithBackoff(() => doc.loadInfo());
            sheetCache.docInfo.lastLoaded = now;
        }
        
        // Check if sheet is in cache
        if (sheetCache.sheets[cleanedEventName] && sheetCache.sheets[cleanedEventName].sheet) {
            console.log(`Using cached sheet for: ${cleanedEventName}`);
            return sheetCache.sheets[cleanedEventName].sheet;
        }
        
        // Fetch event details from database (only once)
        const event = await Event.findOne({ eventName });
        if (!event) {
            throw new Error(`Event not found: ${eventName}`);
        }

        const additionalFieldNames = event.additionalFields?.map(field => field.name) || [];
        const HEADERS = [...BASE_HEADERS, ...additionalFieldNames];
        
        // Find sheet by title (case insensitive if needed)
        let sheet = doc.sheetsByTitle[cleanedEventName];
        
        if (!sheet) {
            // Do a more thorough search if needed
            const allSheets = doc.sheetsByIndex;
            for (const s of allSheets) {
                if (s.title.toLowerCase() === cleanedEventName.toLowerCase()) {
                    sheet = s;
                    break;
                }
            }
        }
        
        // Create sheet if it doesn't exist
        if (!sheet) {
            try {
                console.log(`Creating new sheet for event: ${cleanedEventName}`);
                sheet = await executeWithBackoff(() => 
                    doc.addSheet({
                        title: cleanedEventName,
                        headerValues: HEADERS
                    })
                );
                
                // Format headers in one batch operation
                await executeWithBackoff(() => sheet.setHeaderRow(HEADERS));
                
                await executeWithBackoff(async () => {
                    await sheet.loadCells(`A1:${String.fromCharCode(64 + HEADERS.length)}1`);
                    for (let i = 0; i < HEADERS.length; i++) {
                        const cell = sheet.getCell(0, i);
                        cell.textFormat = { bold: true };
                        cell.horizontalAlignment = 'CENTER';
                        cell.backgroundColor = { red: 0.8, green: 0.8, blue: 0.8 };
                    }
                    await sheet.saveUpdatedCells();
                });
            } catch (error) {
                if (error.message?.includes('already exists')) {
                    // Force reload if sheet was created in another process
                    await executeWithBackoff(() => doc.loadInfo());
                    sheetCache.docInfo.lastLoaded = now;
                    sheet = doc.sheetsByTitle[cleanedEventName];
                    if (!sheet) throw new Error(`Sheet "${cleanedEventName}" exists but cannot be accessed`);
                } else {
                    throw error;
                }
            }
        } else {
            // Update headers if needed - but with optimizations
            try {
                // Only fetch headers if we need to
                const currentHeaders = await executeWithBackoff(() => sheet.headerValues);
                
                if (!currentHeaders || currentHeaders.length === 0) {
                    await executeWithBackoff(() => sheet.setHeaderRow(HEADERS));
                    
                    // Batch formatting operation
                    await executeWithBackoff(async () => {
                        await sheet.loadCells(`A1:${String.fromCharCode(64 + HEADERS.length)}1`);
                        for (let i = 0; i < HEADERS.length; i++) {
                            const cell = sheet.getCell(0, i);
                            cell.textFormat = { bold: true };
                            cell.horizontalAlignment = 'CENTER';
                            cell.backgroundColor = { red: 0.8, green: 0.8, blue: 0.8 };
                        }
                        await sheet.saveUpdatedCells();
                    });
                } else {
                    // Only update if there are new headers to add
                    const newHeaders = HEADERS.filter(header => !currentHeaders.includes(header));
                    if (newHeaders.length > 0) {
                        console.log(`Adding ${newHeaders.length} new headers to sheet ${cleanedEventName}`);
                        await executeWithBackoff(() => sheet.setHeaderRow([...currentHeaders, ...newHeaders]));
                    }
                }
            } catch (headerError) {
                console.error('Error checking headers:', headerError);
                // Only set headers if there was an error
                await executeWithBackoff(() => sheet.setHeaderRow(HEADERS));
            }
        }
        
        // Cache the sheet for future use
        sheetCache.sheets[cleanedEventName] = {
            sheet,
            lastAccessed: now
        };
        
        return sheet;
    } catch (error) {
        console.error('Error in getOrCreateEventSheet:', error);
        throw new Error(`Failed to get or create sheet: ${error.message}`);
    }
}

/**
 * Add or update rows in bulk to minimize API calls
 * @param {GoogleSpreadsheetWorksheet} sheet - The sheet to add rows to
 * @param {Array<Object>} rows - Array of row data objects
 * @returns {Promise<void>}
 */
async function bulkAddRows(sheet, rows) {
    if (!rows || rows.length === 0) return;

    // Use batchUpdate for multiple rows
    if (rows.length > 1) {
        await executeWithBackoff(() => sheet.addRows(rows, { insert: true }));
    } else {
        await executeWithBackoff(() => sheet.addRow(rows[0]));
    }
}

/**
 * Format payment status cell with color coding
 * @param {GoogleSpreadsheetWorksheet} sheet - The sheet containing the cell
 * @param {number} rowIndex - Row index (0-based)
 * @param {string} status - Payment status
 * @returns {Promise<void>}
 */
async function formatPaymentStatusCell(sheet, rowIndex, status) {
    const paymentStatusIndex = BASE_HEADERS.indexOf('Payment Status');
    if (paymentStatusIndex === -1) return;
    
    try {
        const cell = sheet.getCell(rowIndex, paymentStatusIndex);
        
        switch (status.toUpperCase()) {
            case 'PAID':
                cell.backgroundColor = { red: 0.7, green: 0.9, blue: 0.7 }; // Light green
                break;
            case 'PENDING':
                cell.backgroundColor = { red: 1, green: 0.9, blue: 0.6 }; // Light yellow
                break;
            case 'UNPAID':
                cell.backgroundColor = { red: 0.9, green: 0.7, blue: 0.7 }; // Light red
                break;
        }
    } catch (error) {
        console.error('Error formatting payment cell:', error);
    }
}

/**
 * Batch process format payment status cells
 * @param {GoogleSpreadsheetWorksheet} sheet - The sheet to format
 * @param {number} startRow - Starting row index (0-based)
 * @param {number} endRow - Ending row index (0-based)
 * @returns {Promise<void>}
 */
async function batchFormatPaymentStatusCells(sheet, startRow, endRow) {
    const paymentStatusIndex = BASE_HEADERS.indexOf('Payment Status');
    if (paymentStatusIndex === -1) return;
    
    try {
        // Load cells in one batch operation
        const column = String.fromCharCode(65 + paymentStatusIndex);
        await executeWithBackoff(() => 
            sheet.loadCells(`${column}${startRow + 1}:${column}${endRow + 1}`)
        );
        
        // Format each cell
        for (let row = startRow; row <= endRow; row++) {
            const cell = sheet.getCell(row, paymentStatusIndex);
            const status = cell.value?.toUpperCase() || '';
            
            switch (status) {
                case 'PAID':
                    cell.backgroundColor = { red: 0.7, green: 0.9, blue: 0.7 }; // Light green
                    break;
                case 'PENDING':
                    cell.backgroundColor = { red: 1, green: 0.9, blue: 0.6 }; // Light yellow
                    break;
                default:
                    cell.backgroundColor = { red: 0.9, green: 0.7, blue: 0.7 }; // Light red
                    break;
            }
        }
        
        // Save in one operation
        await executeWithBackoff(() => sheet.saveUpdatedCells());
    } catch (error) {
        console.error('Error in batch formatting cells:', error);
    }
}

/**
 * Update an existing row by ID
 * @param {GoogleSpreadsheetWorksheet} sheet - The sheet containing the row
 * @param {string} registrationId - Registration ID to look for
 * @param {Object} data - Object containing data to update
 * @returns {Promise<boolean>} - Whether update was successful
 */
async function updateRowById(sheet, registrationId, data) {
    try {
        // Load rows only if necessary
        const rows = await executeWithBackoff(() => sheet.getRows());
        const rowIndex = rows.findIndex(row => row['Registration ID'] === registrationId);
        
        if (rowIndex === -1) {
            console.log(`Row not found for registration ID: ${registrationId}`);
            return false;
        }
        
        // Update the row
        Object.keys(data).forEach(key => {
            rows[rowIndex][key] = data[key];
        });
        
        // Save changes
        await executeWithBackoff(() => rows[rowIndex].save());
        return true;
    } catch (error) {
        console.error('Error updating row:', error);
        return false;
    }
}

/**
 * Clear API cache to force reload on next request
 */
function clearCache() {
    sheetCache.docInfo.lastLoaded = 0;
    sheetCache.sheets = {};
    console.log('Sheet cache cleared');
}

module.exports = {
    getOrCreateEventSheet,
    executeWithBackoff,
    bulkAddRows,
    formatPaymentStatusCell,
    batchFormatPaymentStatusCells,
    updateRowById,
    clearCache,
    BASE_HEADERS
};