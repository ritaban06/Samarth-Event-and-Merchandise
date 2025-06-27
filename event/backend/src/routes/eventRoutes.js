const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { sendEventConfirmation } = require('../utils/emailService');

// Initialize Google Sheets
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// Import getOrCreateEventSheet function
const { getOrCreateEventSheet } = require('../utils/sheetUtils');

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/events', async (req, res) => {
  const { eventName, description, date, venue, maxParticipants, imageUrl, rulebookUrl, additionalFields, payment, team, teamSize } = req.body;

  // Validate team and teamSize
  if (team === 'team' && (!teamSize || teamSize < 2)) {
    return res.status(400).json({ message: 'Team size must be at least 2 for team events' });
  }

  const eventData = {
    eventName,
    description,
    date,
    venue,
    maxParticipants,
    imageUrl,
    rulebookUrl,
    additionalFields,
    payment,
    team,
  };

  // Only include teamSize if the event is a team event
  if (team === 'team') {
    eventData.teamSize = teamSize;
  }

  const event = new Event({
    ...eventData,
    participants: [] // Initialize participants as an empty array
  });
  
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.patch('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { eventName, description, date, venue, maxParticipants, imageUrl, rulebookUrl, additionalFields, payment, isActive, team, teamSize } = req.body;

  // Validate team and teamSize
  if (team === 'team' && (!teamSize || teamSize < 2)) {
    return res.status(400).json({ message: 'Team size must be at least 2 for team events' });
  }

  const updateData = { 
    eventName,
    description,
    date,
    venue,
    maxParticipants,
    imageUrl,
    rulebookUrl,
    additionalFields,
    payment,
    isActive,
    team,
  };

  // Only include teamSize if the event is a team event
  if (team === 'team') {
    updateData.teamSize = teamSize;
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.patch('/events/:id/register', async (req, res) => {
  const { id } = req.params;
  const participantData = req.body;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let isT = false;
    let isP = true;
    let tn = null;
    let tu = null;
    let pT = null;

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.participants.some(p => p.uid === participantData.uid);
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Set payment status to 'free' if event is free
    if (event.payment.status === 'free' || event.payment.amount === 0) {
      isP = false;
      participantData.payment = {
        status: 'free',
        amount: 0
      };
      // Remove any payment-related fields for free events
      delete participantData.paymentType;
      delete participantData.paymentDate;
    }

    if(participantData.payment.type){
      pT = participantData.payment.type;
      if(participantData.payment.type === 'online' || participantData.payment.type === 'package'){
        participantData.payment.status = 'paid';
      }
    }

    // Handle team event logic
    if (event.team === 'team') {
      isT = true;
      // Ensure team object exists
      if (!participantData.team) {
        return res.status(400).json({ message: 'Team information is required for team events' });
      }

      if (participantData.team.teamLeader) {
        // Team leader registration
        // Generate a unique team code for the leader
        
        // Initialize empty teammates array for team leader
        if (!participantData.team.teammates) {
          participantData.team.teammates = [];
        }
      } else if (participantData.team.teamuid) {
        // Teammate registration (not a team leader)
        const leaderIndex = event.participants.findIndex((p) => 
          p.team && p.team.teamLeader && p.team.teamuid === participantData.team.teamuid
        );
        
        if (leaderIndex === -1) {
          return res.status(400).json({ message: 'Invalid team code' });
        }
    
        // Add the team name to the teammate's data
        participantData.team.teamName = event.participants[leaderIndex].team.teamName;
    
        // Check if team is already full
        const teamSize = event.participants[leaderIndex].team.teammates.length + 1; // +1 for the leader
        if (teamSize >= event.teamSize) {
          return res.status(400).json({ message: 'Team is already full' });
        }
    
        // Remove teammates field from non-leaders to pass validation
        delete participantData.team.teammates;
        
        // Add the teammate to leader's teammates array
        await Event.findOneAndUpdate(
          { 
            _id: id, 
            "participants.uid": event.participants[leaderIndex].uid
          },
          { 
            $push: { 
              "participants.$.team.teammates": {
                uid: participantData.uid,
                name: participantData.name
              }
            }
          }
        );
        
        console.log(`Added participant ${participantData.name} to team ${participantData.team.teamuid}`);
      } else {
        return res.status(400).json({ message: 'Invalid team registration data - no team code provided' });
      }
    }

    // Add the participant to the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { 
        $push: { participants: participantData },
        $inc: { currentParticipants: 1 }
      },
      { new: true, runValidators: true }
    );

    if(participantData.team){
      tn = participantData.team.teamName;
      tu = participantData.team.teamuid;
    }
    
    // After successfully registering the participant
    const { name, email, uid } = participantData; // Extract necessary data

    await sendEventConfirmation(name, email, event.eventName, uid, tn, tu, isP, isT, pT);

    return res.json(updatedEvent);
  } catch (error) {
    console.error('Registration error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Change from /events/:id/update-payment to /:id/update-payment
router.patch('/events/:id/update-payment',  async (req, res) => {
  try {
    const { uid, payment } = req.body;
    
    if (!uid || !payment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the participant
    const participantIndex = event.participants.findIndex(p => p.uid === uid);
    
    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // Update payment details - fix any validation issues with the property names
    event.participants[participantIndex].payment = {
      ...event.participants[participantIndex].payment,
      status: payment.status,
      type: payment.type,
      id: payment.id,
      date: payment.date || new Date()
    };
    console.log(event.participants[participantIndex].payment.status)

    // Also update paymentType to match the schema expected property
    event.participants[participantIndex].paymentType = payment.type;
    event.participants[participantIndex].paymentDate = new Date(payment.date || new Date());
    
    await event.save();
    
    // After updating the event in the database
// Sync payment status to Google Sheets
try {
  await doc.useServiceAccountAuth({
    client_email: JSON.parse(process.env.GOOGLE_CREDENTIALS).client_email,
    private_key: JSON.parse(process.env.GOOGLE_CREDENTIALS).private_key,
  });

  const sheet = await getOrCreateEventSheet(doc, event.eventName);
  
  // Find the row with matching uid
  const rows = await sheet.getRows();
  const participantRow = rows.find(row => row['Registration ID'] === uid);
  
  if (participantRow) {
    participantRow['Payment Status'] = payment.status.toUpperCase();
    await participantRow.save();
    
    // Format the payment status cell
    const rowIndex = rows.indexOf(participantRow);
    await sheet.loadCells(`G${rowIndex + 2}`); // +2 because sheet is 1-indexed and has header
    const cell = sheet.getCell(rowIndex + 1, 6);
    
    // Set cell color based on payment status
    if (payment.status === 'paid') {
      cell.backgroundColor = { red: 0.56, green: 0.93, blue: 0.56 }; // Green for paid
    }
    
    await sheet.saveUpdatedCells();
  }
} catch (sheetError) {
  console.error('Google Sheets payment update error:', sheetError);
  // Don't fail the payment update if sheets sync fails
}
    
    res.json(event);
  } catch (err) {
    console.error('Payment update error:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add this route to fetch team details based on team UID
router.get('/events/:id/team/:teamuid', async (req, res) => {
  const { id, teamuid } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const teamLeader = event.participants.find(p => p.team && p.team.teamuid === teamuid && p.team.teamLeader);
    if (!teamLeader) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      teamName: teamLeader.team.teamName,
      teamuid: teamLeader.team.teamuid,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;