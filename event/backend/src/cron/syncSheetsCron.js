// Cron job to automatically sync registrations to Google Sheets

const cron = require('node-cron');
const Event = require('../models/eventModel');

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Runs every 5 minutes

cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('[CRON] Starting automatic Google Sheets sync via API...');
    // Fetch all events and registrations
    const events = await Event.find({});
    const registrations = events.flatMap(event =>
      event.participants.map(participant => ({
        ...participant,
        eventName: event.eventName,
        registrationDate: participant.payment?.date,
        eventId: event._id
      }))
    );

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
