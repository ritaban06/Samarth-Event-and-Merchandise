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

        console.log("🔄 Syncing with Google Sheets for events:", eventsToSync);

        try {
          await fetch("https://script.google.com/macros/s/AKfycbz8tLO2oWIVopzpQURV-U9R4QTYvBK_XmoEb6lyaZr5P8gDYr9Z4F0VGDzp3b5W1-xe/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: eventsToSync })
          });
        } catch (err) {
          console.error("⚠️ Failed to call Apps Script webhook:", err);
        }
      }
    }, 2 * 60 * 1000);

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
