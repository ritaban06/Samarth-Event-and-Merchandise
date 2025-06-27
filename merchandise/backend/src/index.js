require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const packageRoutes = require('./routes/packageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Sheets
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.RPG_ID || "",
    key_secret: process.env.RPG_SECRET || ""
});

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
.then(() => console.log('MongoDB Connected: all-events.esp0g.mongodb.net'))
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
    const options = {
        amount: req.body.amount,
        currency: req.body.currency || 'INR',
        receipt: "receipt#1",
        payment_capture: 1
    };

    const response = await razorpay.orders.create(options);

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
    console.log(`Server is running on https://samarth-event-page-backend.onrender.com`);
}); 