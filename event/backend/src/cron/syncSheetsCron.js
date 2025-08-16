// Cron job to automatically sync registrations to Google Sheets

const cron = require('node-cron');
const Event = require('../models/eventModel');

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Runs every 5 minutes

cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('[CRON] Starting automatic Google Sheets sync via API...');
    // Fetch all events
    const events = await Event.find({});

    // Build registrations with all custom/additional fields
    const registrations = events.flatMap(event =>
      event.participants
        .filter(participant => participant.name && participant.email && participant.uid)
        .map(participant => {
          const reg = {
            uid: participant.uid || '',
            name: participant.name || '',
            email: participant.email || '',
            eventName: event.eventName || '',
            payment: participant.payment || {},
            registrationDate: participant.payment?.date || '',
            eventId: event._id || '',
            team: participant.team || {},
            additionalDetails: participant.additionalDetails || {},
          };
          // Add any additional fields from event.additionalFields
          if (event.additionalFields && Array.isArray(event.additionalFields)) {
            event.additionalFields.forEach(field => {
              const key = field.name;
              if (participant.additionalDetails && participant.additionalDetails.hasOwnProperty(key)) {
                reg[key] = participant.additionalDetails[key];
              }
            });
          }
          return reg;
        })
    );

    // Debug: log the registrations being sent
    console.log('[CRON] Registrations to sync:', JSON.stringify(registrations, null, 2));

    console.log('Registrations to sync:', registrations);

    // Call the backend sync API


  // Set these values directly here
  const apiUrl = 'http://localhost:5000/api/admin/sync-sheets'; // Change to your deployed API if needed

  // Generate admin JWT token using credentials and secret
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const jwtSecret = process.env.JWTSECRET || 'your_jwt_secret';
  const adminToken = jwt.sign({ username: adminUsername }, jwtSecret, { expiresIn: '1h' });
  const headers = { 'Authorization': `Bearer ${adminToken}` };

    const response = await axios.post(apiUrl, { registrations }, { headers });
    console.log('[CRON] Google Sheets sync API response:', response.data);

  } catch (error) {
    console.error('[CRON] Google Sheets sync via API failed:', error?.response?.data || error.message);
  }
});

module.exports = {}; // For possible future extension
