// Cron job to automatically sync registrations to Google Sheets
const cron = require('node-cron');
const Event = require('../models/eventModel');
const googleSheetsService = require('../utils/googleSheets');

// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('[CRON] Starting automatic Google Sheets sync...');
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
    await googleSheetsService.syncToSheets(registrations);
    console.log('[CRON] Google Sheets sync completed.');
  } catch (error) {
    console.error('[CRON] Google Sheets sync failed:', error);
  }
});

module.exports = {}; // For possible future extension
