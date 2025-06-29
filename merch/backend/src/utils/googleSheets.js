const { GoogleSpreadsheet } = require('google-spreadsheet');
const { executeWithBackoff, clearCache, getOrCreateOrderSheet } = require('./sheetUtils');
const Order = require('../models/orderModel');

class GoogleSheetsService {
  constructor() {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID is not configured');
    }
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

  async syncOrdersToSheets(orders) {
    try {
      console.log('Starting orders sync process...');
      await this.init();
      
      if (!orders || orders.length === 0) {
        throw new Error('No orders provided for sync');
      }
      
      console.log(`Syncing ${orders.length} orders to Google Sheets`);
      
      // Get or create the Orders sheet
      const sheet = await getOrCreateOrderSheet(this.doc, 'Orders');
      
      // Get existing rows
      let existingRows;
      try {
        existingRows = await executeWithBackoff(() => sheet.getRows());
        console.log(`Found ${existingRows.length} existing rows`);
      } catch (error) {
        console.error('Error fetching existing rows:', error);
        existingRows = [];
      }
      
      // Create a map of existing orders by Order ID
      const existingOrders = new Map(
        existingRows.map(row => [row['Order ID'], row])
      );
      
      // Prepare updates in batches
      const updates = [];
      const newRows = [];
      
      for (const order of orders) {
        const items = order.items ? order.items.map(item => 
          item.product?.name || item.productName || 'Unknown Item'
        ).join(', ') : 'N/A';
        
        const quantities = order.items ? order.items.map(item => 
          item.quantity || 1
        ).join(', ') : '1';
        
        const sizes = order.items ? order.items.map(item => 
          item.size || 'N/A'
        ).join(', ') : 'N/A';
        
        const colors = order.items ? order.items.map(item => 
          item.color || 'N/A'
        ).join(', ') : 'N/A';

        const rowData = {
          'Order ID': order._id?.toString() || order.id || 'N/A',
          'Customer Name': order.user?.userName || order.customerName || 'N/A',
          'Email': order.user?.email || order.customerEmail || 'N/A',
          'Phone': order.user?.phone || order.customerPhone || 'N/A',
          'Status': order.status || 'pending',
          'Total Amount': this.formatAmount(order.totalAmount || order.amount),
          'Order Date': this.formatDate(order.createdAt || order.orderDate),
          'Items': items,
          'Quantities': quantities,
          'Sizes': sizes,
          'Colors': colors
        };
        
        const existingRow = existingOrders.get(rowData['Order ID']);
        if (existingRow) {
          updates.push({ row: existingRow, data: rowData });
        } else {
          newRows.push(rowData);
        }
      }
      
      // Process updates in batches
      console.log(`Processing ${updates.length} updates and ${newRows.length} new rows`);
      
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
            console.error(`Failed to update row ${data['Order ID']}:`, error);
          }
        }));
        
        console.log(`Updated batch ${i / this.batchSize + 1} of ${Math.ceil(updates.length / this.batchSize)}`);
        
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
          console.log(`Added batch ${i / this.batchSize + 1} of ${Math.ceil(newRows.length / this.batchSize)}`);
        } catch (error) {
          console.error('Failed to add batch of rows:', error);
          
          // Fall back to adding one by one if batch fails
          for (const row of batch) {
            try {
              await executeWithBackoff(() => sheet.addRow(row));
              console.log(`Added row for order ${row['Order ID']}`);
            } catch (rowError) {
              console.error(`Failed to add row ${row['Order ID']}:`, rowError);
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
      
      console.log('Orders sync completed successfully');
      return true;
    } catch (error) {
      console.error('Error in syncOrdersToSheets:', error);
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

module.exports = new GoogleSheetsService();