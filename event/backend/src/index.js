require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const packageRoutes = require('./routes/packageRoutes');

// Start cron job for automatic Google Sheets sync
// require('./cron/syncSheetsCron');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Sheets
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// Initialize Razorpay
const Razorpay = require('razorpay');

// Validate Razorpay credentials
if (!process.env.RPG_ID || !process.env.RPG_SECRET) {
    console.error('ERROR: Razorpay credentials missing!');
    console.error('RPG_ID:', process.env.RPG_ID ? 'Present' : 'MISSING');
    console.error('RPG_SECRET:', process.env.RPG_SECRET ? 'Present' : 'MISSING');
    process.exit(1); // Exit if critical payment credentials are missing
}

const razorpay = new Razorpay({
    key_id: process.env.RPG_ID,
    key_secret: process.env.RPG_SECRET
});

console.log('Razorpay initialized with key:', process.env.RPG_ID);

// Middleware
app.use(cors({
  origin: [
    process.env.ADMIN_URL,  // Admin URL from environment variables
    process.env.CLIENT_URL, // Client URL from environment variables
    'http://localhost:3001', // Admin local development
    'http://localhost:3000'  // Client local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'auth-token']
}));

app.use(express.json()); // Parse JSON request body

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  // Parse cluster/host name from MONGO_URI
  const hostName = process.env.MONGO_URI.split('@')[1].split('/')[0];
  console.log(`MongoDB Connected successfully to database: ${hostName}`);

  // ✅ Start watching MongoDB changes after successful connection
  watchEvents();
})
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api', eventRoutes);
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/packages', packageRoutes);

// Dashboard Sync endpoint
app.post('/api/admin/sync-sheets', async (req, res) => {
  try {
    const { registrations } = req.body;
    
    // Validate input
    if (!registrations || !Array.isArray(registrations)) {
      return res.status(400).json({ 
        message: 'Invalid registrations data',
        details: 'Registrations must be an array'
      });
    }
    
    // Extract unique event names from registrations
    const eventNames = [...new Set(registrations.map(reg => reg.eventName))];
    
    // Check if we have events to sync
    if (eventNames.length === 0) {
      return res.status(400).json({
        message: 'No valid event names found in registrations'
      });
    }
    
    console.log(`📊 Dashboard requested sync for ${eventNames.length} events with ${registrations.length} registrations`);
    
    // Use our unified sync function
    const success = await syncEventsByName(eventNames);
    
    if (success) {
      res.json({ 
        message: 'Data sync initiated successfully',
        events: eventNames
      });
    } else {
      res.status(429).json({
        message: 'Sync skipped due to rate limiting',
        note: 'Try again later'
      });
    }
  } catch (error) {
    console.error('Dashboard sync error:', error);
    res.status(500).json({ 
      message: 'Failed to sync with Google Sheets',
      error: error.message
    });
  }
});

// Sample Route
app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Payment Routes
app.post('/api/orders', async(req, res) => {
  try {
    // Validate that Razorpay is properly initialized
    if (!razorpay) {
      console.error('Razorpay not initialized');
      return res.status(500).json({ 
        message: 'Payment service unavailable',
        error: 'Razorpay not properly configured'
      });
    }

    const options = {
        amount: req.body.amount,
        currency: req.body.currency || 'INR',
        receipt: "receipt#1",
        payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);
    const response = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', response.id);

    res.json({
        order_id: response.id,
        currency: response.currency,
        amount: response.amount
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

app.get("/api/payment/:paymentId", async(req, res) => {
  const { paymentId } = req.params;
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency
    });
  } catch(error) {
    console.error('Razorpay payment fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch payment', 
      error: error.message 
    });
  }
});

// Google Sheets Authentication
const authenticateGoogleSheets = async () => {
  try {
    await doc.useServiceAccountAuth({
      client_email: JSON.parse(process.env.GOOGLE_CREDENTIALS).client_email,
      private_key: JSON.parse(process.env.GOOGLE_CREDENTIALS).private_key,
    });
    await doc.loadInfo();
    console.log('Google Sheets connected:', doc.title);
  } catch (error) {
    console.error('Google Sheets authentication error:', error);
  }
};
 
// Initialize Google Sheets connection
authenticateGoogleSheets();

// ---------------- Change Stream Watcher with Batching + Error Handling ----------------
let changedEvents = new Set();
let resumeToken = null; // will store last seen resume token
let lastSyncTime = 0;
const MIN_SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes minimum between syncs
const MAX_EVENTS_PER_SYNC = 10; // Maximum number of events to sync in one batch
const MAX_API_REQUESTS_PER_DAY = 20000; // Google Apps Script quotas (being conservative)
const DAY_IN_MS = 24 * 60 * 60 * 1000;
let apiRequestsToday = 0;
let lastDayReset = Date.now();

// Reset API request counter daily
setInterval(() => {
  const now = Date.now();
  if (now - lastDayReset >= DAY_IN_MS) {
    console.log("🔄 Resetting daily API request counter");
    apiRequestsToday = 0;
    lastDayReset = now;
  }
}, 60 * 60 * 1000); // Check every hour

// Function to sync events to Google Sheets via Apps Script
async function syncEventsToSheets(events) {
  // Check if we've exceeded our daily quota
  if (apiRequestsToday >= MAX_API_REQUESTS_PER_DAY) {
    console.warn("⚠️ Daily API request quota exceeded. Skipping sync.");
    return false;
  }
  
  const now = Date.now();
  
  // Enforce minimum time between syncs
  if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
    console.log("⏱️ Too soon for another sync. Waiting...");
    return false;
  }
  
  // Limit number of events in one batch
  const eventsToSync = events.slice(0, MAX_EVENTS_PER_SYNC);
  
  console.log("🔄 Syncing with Google Sheets for events:", eventsToSync);
  
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbw-xTFVZxHubMO-xq5rHPSgookn3cp9bJssrCascQ_FNRa8PPTdQU1qEGBUmdowoqGr/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: eventsToSync })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }
    
    // Update counters
    lastSyncTime = now;
    apiRequestsToday++;
    console.log(`✅ Sync complete. API requests today: ${apiRequestsToday}/${MAX_API_REQUESTS_PER_DAY}`);
    
    return true;
  } catch (err) {
    console.error("❌ Failed to call Apps Script webhook:", err);
    return false;
  }
}

// Unified event sync function that can handle both manual and automatic syncs
async function syncEventsByName(eventNames) {
  return await syncEventsToSheets(eventNames);
}

async function watchEvents() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("events");

    // If we have a resume token, resume from there
    const pipeline = [];
    const options = resumeToken ? { resumeAfter: resumeToken } : {};

    const changeStream = collection.watch(pipeline, options);

    changeStream.on("change", async (change) => {
      console.log("📌 MongoDB change detected:", change);

      // save resume token for recovery
      resumeToken = change._id;

      let eventName = null;
      if (change.fullDocument && change.fullDocument.eventName) {
        eventName = change.fullDocument.eventName;
      } else if (change.documentKey && change.documentKey._id) {
        try {
          const updatedDoc = await collection.findOne({ _id: change.documentKey._id });
          eventName = updatedDoc?.eventName;
        } catch (err) {
          console.error("⚠️ Failed to fetch updated doc:", err);
        }
      }

      if (eventName) {
        changedEvents.add(eventName);
      }
    });

    // ✅ Handle errors so Node doesn’t crash
    changeStream.on("error", (err) => {
      console.error("❌ Change stream error:", err);
      console.log("Restarting watcher in 5s...");
      setTimeout(() => watchEvents(), 5000);
    });

    // ✅ Handle close events
    changeStream.on("close", () => {
      console.warn("⚠️ Change stream closed. Restarting in 5s...");
      setTimeout(() => watchEvents(), 5000);
    });

    // ✅ Batch sync every 2 minutes
    setInterval(async () => {
      if (changedEvents.size > 0) {
        const eventsToSync = Array.from(changedEvents);
        changedEvents.clear();
        
        // Use our unified sync function
        await syncEventsByName(eventsToSync);
      }
    }, MIN_SYNC_INTERVAL);

    console.log("✅ Change stream watcher started on 'events' collection");
  } catch (err) {
    console.error("Error starting change stream:", err);
    console.log("Retrying in 5s...");
    setTimeout(() => watchEvents(), 5000);
  }
}


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: err.message 
    });
});
 
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
