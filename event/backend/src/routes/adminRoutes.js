const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Event = require('../models/eventModel');
const { executeWithBackoff, formatPaymentStatusCell, bulkAddRows, 
        batchFormatPaymentStatusCells, updateRowById, BASE_HEADERS } = require('../utils/sheetUtils');
const { PaidConfirmation } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const googleSheetsService = require('../utils/googleSheets');

// Add this function at the top of the file
// const formatPaymentStatusCell = async (sheet, rowIndex, status) => {
//   const cell = sheet.getCell(rowIndex, 6); // 6 is the index for Payment Status column
  
//   switch (status.toUpperCase()) {
//     case 'PAID':
//       cell.backgroundColor = { red: 0.7, green: 0.9, blue: 0.7 }; // Light green
//       break;
//     case 'PENDING':
//       cell.backgroundColor = { red: 1, green: 0.9, blue: 0.6 }; // Light yellow
//       break;
//     case 'UNPAID':
//       cell.backgroundColor = { red: 0.9, green: 0.7, blue: 0.7 }; // Light red
//       break;
//   }
// };

// Middleware to check for JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Modify the sync-sheets route to include additional fields
router.post('/admin/sync-sheets', async (req, res) => {
    try {
        const { registrations } = req.body;
        
        // Validate input
        if (!registrations || !Array.isArray(registrations)) {
            return res.status(400).json({ 
                message: 'Invalid registrations data',
                details: 'Registrations must be an array'
            });
        }

        // Use the googleSheetsService for synchronization
        try {
            await googleSheetsService.syncToSheets(registrations);
            
            res.json({ 
                message: 'Data synced successfully',
                count: registrations.length
            });
        } catch (serviceError) {
            throw new Error(`Sheet service error: ${serviceError.message}`);
        }
    } catch (error) {
        console.error('Sync error:', error);
        
        res.status(500).json({ 
            message: 'Failed to sync with Google Sheets',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update payment status
router.put('/admin/registration/:id/payment-status', async (req, res) => {
    try {
      const { status, eventId, uid, paymentType } = req.body;
      const currentDate = moment().toISOString();
  
      // Fetch event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const eventName = event.eventName;
      const participant = event.participants.find(p => p.uid === uid);
      
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
      
      const name = participant.name;
      const email = participant.email;
  
      // Update MongoDB
      const updateData = { "participants.$[elem].payment.status": "paid" };
      if (paymentType === "cash") {
        updateData["participants.$[elem].payment.date"] = currentDate;
      }
  
      const result = await Event.updateOne(
        { _id: eventId, "participants.uid": uid },
        { $set: updateData },
        { arrayFilters: [{ "elem.uid": uid }] }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'No updates made' });
      }
  
      console.log('Payment status updated successfully');
  
      await PaidConfirmation(name, uid, email, eventName, paymentType);
  
      // Sync with Google Sheets using the new utility functions
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
      try {
        // Use executeWithBackoff for API calls
        await executeWithBackoff(async () => {
          await doc.useServiceAccountAuth({
            client_email: JSON.parse(process.env.GOOGLE_CREDENTIALS).client_email,
            private_key: JSON.parse(process.env.GOOGLE_CREDENTIALS).private_key,
          });
        });
        
        await executeWithBackoff(() => doc.loadInfo());
  
        
        console.log('Syncing sheet for event:', event.eventName);
        
        // Create the sheet manually since getOrCreateEventSheet is not exported from sheetUtils
        await executeWithBackoff(() => doc.loadInfo());
        
        const cleanedEventName = event.eventName.trim().replace(/[^\w\s-]/g, '').substring(0, 100);
        let sheet = doc.sheetsByTitle[cleanedEventName];
        
        if (!sheet) {
            // Create new sheet with headers
            const headers = [
                'Registration ID',
                'Student Name', 
                'Email',
                'Event Name',
                'Registration Date',
                'Amount (₹)',
                'Payment Status',
                'Payment Type'
            ];
            
            sheet = await executeWithBackoff(() => 
                doc.addSheet({
                    title: cleanedEventName,
                    headerValues: headers
                })
            );
            
            // Format headers
            await executeWithBackoff(async () => {
                await sheet.loadCells('A1:H1');
                for (let i = 0; i < headers.length; i++) {
                    const cell = sheet.getCell(0, i);
                    cell.textFormat = { bold: true };
                    cell.horizontalAlignment = 'CENTER';
                    cell.backgroundColor = { red: 0.8, green: 0.8, blue: 0.8 };
                }
                await sheet.saveUpdatedCells();
            });
        }
        
        if (!sheet) throw new Error('Failed to get or create sheet');
  
        // Use updateRowById from sheetUtils
        const updateData = {
          'Payment Status': status.toUpperCase(),
          'Payment Type': paymentType || 'OFFLINE'
        };
        
        if (status === 'paid') {
          updateData['Payment Date'] = new Date().toLocaleDateString();
        }
        
        const updated = await updateRowById(sheet, uid, updateData);
        
        if (!updated) {
          console.log(`Row not found for registration ID: ${uid}, will attempt to add`);
          // If row doesn't exist, create a new one
          const newRowData = {
            'Registration ID': uid,
            'Student Name': name,
            'Email': email,
            'Event Name': eventName,
            'Registration Date': new Date().toLocaleDateString(),
            'Amount (₹)': participant.payment?.amount || '0',
            'Payment Status': status.toUpperCase(),
            'Payment Type': paymentType || 'OFFLINE'
          };
          
          await bulkAddRows(sheet, [newRowData]);
        }
        
        // Apply formatting with error handling
        try {
          const rows = await executeWithBackoff(() => sheet.getRows());
          const rowIndex = rows.findIndex(row => row['Registration ID'] === uid);
          
          if (rowIndex !== -1) {
            // Use batchFormatPaymentStatusCells for better performance
            await batchFormatPaymentStatusCells(sheet, rowIndex + 1, rowIndex + 1);
          }
        } catch (formatError) {
          console.error('Error formatting cells:', formatError);
        }
      } catch (sheetError) {
        console.error('Google Sheets sync error:', sheetError);
      }
  
      res.json({
        message: 'Payment status updated successfully',
      });
  
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        message: 'Failed to update payment status',
        error: error.message
      });
    }
  });

// Admin login route
router.post('/admin/login', async(req, res) => {
    const { username, password } = req.body;

    // Check if the username and password match the environment variables
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Create a JWT token
        const token = await jwt.sign({ username }, process.env.JWTSECRET, { expiresIn: '1h' }); // 1 hour expiration
        return res.json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});


module.exports = router; 
