const express = require("express");
const User = require("../models/clientModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUserDetails = require("../utils/fetchUserDetails");
const { oauth2Client } = require('../utils/googleAuth');
const AUTHENTICATED_SIGNATURE = process.env.JWTSECRET;
const axios = require('axios');
const UIDCounter = require("../models/uidModel");
const { sendOtpEmail } = require("../utils/emailService");


// Function to initialize UID counter (run this once during setup)
const initializeUIDCounter = async () => {
    try {
        const existingCounter = await UIDCounter.findOne({ name: "userUID" });
        if (!existingCounter) {
            await UIDCounter.create({ name: "userUID", lastFour: 1000 });
            console.log("UID Counter initialized.");
        }
    } catch (error) {
        console.error("Error initializing UID counter:", error);
    }
};

// Ensure UID counter exists at startup
initializeUIDCounter();

// Function to generate unique UID safely
const generateUID = async (constantPrefix = "2025") => {
    try {
        // Ensure atomic increment using findOneAndUpdate on UIDCounter
        const counter = await UIDCounter.findOneAndUpdate(
            { name: "userUID" }, 
            { $inc: { lastFour: 1 } }, // Atomically increment lastFour
            { new: true, upsert: true } // Return updated value, create if missing
        );

        const lastFour = counter.lastFour;
        const uid = constantPrefix + lastFour.toString().padStart(4, "0");

        console.log('Generated UID:', uid);
        return uid;
    } catch (error) {
        console.error('Error generating UID:', error);
        throw new Error('Failed to generate unique UID');
    }
};

// authenticating user at /api/newuserauth
router.post("/newuserauth", [
    body('userName', 'Enter a valid name.').isLength({ min: 3 }),
    body('email', 'Enter a valid email.').isEmail(),
    body('password', 'Password should be of at least 8 characters.').isLength({ min: 8 })],
    async (req, res) => {
        console.log('Manual Registration Request Body:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // checking if the email already exists
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                if (user.authType === 'google') {
                    return res.status(401).json({ 
                        error: "This email is registered with Google. Please use Google Sign-In." 
                    });
                }
                return res.status(401).json({ 
                    error: "User with this email already exists." 
                });
            }

            if (!req.body.password) {
                return res.status(400).json({ 
                    error: "Password is required for manual registration" 
                });
            }

            // creating hash of user's password
            const salt = await bcrypt.genSalt(8);
            const secured_pass = await bcrypt.hash(req.body.password, salt);

            // Get a unique UID
            const uniqueUID = await generateUID();

            // Create new user with the unique UID
            user = await User.create({
                userName: req.body.userName,
                password: secured_pass,
                email: req.body.email,
                authType: 'manual',
                uid: uniqueUID
            });

            console.log('Created Manual User:', {
                id: user.id,
                userName: user.userName,
                email: user.email,
                authType: user.authType,
                uid: user.uid
            });

            const payload = {
                user: {
                    id: user.id
                }
            };

            const token = jwt.sign(payload, AUTHENTICATED_SIGNATURE);

            res.status(201).json({ 
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    authType: user.authType,
                    uid: user.uid
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                error: "Registration failed", 
                details: error.message 
            });
        }
    }
);

// Logging in signed up user at /api/verify
router.post("/verify", [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be empty').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({ error: "Invalid credentials" });
        }

        // Check if user is registered with Google
        if (user.authType === 'google') {
            return res.status(400).json({ 
                error: "This email is registered with Google. Please use Google Sign-In." 
            });
        }

        // Verify password for manual authentication
        let verified = await bcrypt.compare(req.body.password, user.password);
        if (!verified) {
            return res.status(404).json({ error: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, AUTHENTICATED_SIGNATURE);
        res.status(200).json({ token });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            error: "Login failed", 
            details: error.message 
        });
    }
});

// Google Auth endpoint
router.post("/google", async (req, res) => {
    const { code } = req.body;
    
    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );

        const { email, name } = userInfo.data;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                userName: name,
                email: email,
                authType: 'google', // Specify Google authentication
                uid: await generateUID() // Assign a unique UID
            });
        } else if (user.authType !== 'google') {
            return res.status(400).json({
                error: "Email already registered with manual authentication"
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, AUTHENTICATED_SIGNATURE);
        
        res.json({ 
            token,
            user: {
                id: user.id,
                userName: user.userName,
                email: user.email,
                authType: user.authType,
                uid: user.uid // Ensure UID is included in the response
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ 
            error: "Authentication failed", 
            details: error.message 
        });
    }
});

// Fetching user details from token at /api/datafetch
router.post("/datafetch",
    fetchUserDetails,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password") // Ensure password is not included
            res.status(200).json(user);
        } catch (error) {
            res.status(500).send({ error: error.message, err: "Internal server issues.. please try again later." , place: "datafetch"});
        }
    }
);

router.post("/otp", async (req, res) => {
    const { otp, email } = req.body;
    try {
        const response = await sendOtpEmail(email, otp);
        if (response.success) {
            return res.status(200).json({ success: true, message: "OTP sent successfully." });
        } else {
            return res.status(500).json({ success: false, message: "Failed to send OTP." });
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

// New route to check team registration eligibility
router.get('/clients/all', async (req, res) => {
    try {
        const response = await User.find();
        res.json(response);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})

// Admin login endpoint
router.post("/admin/login", [
    body('username', 'Username is required').notEmpty(),
    body('password', 'Password is required').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array()[0].msg 
        });
    }

    try {
        const { username, password } = req.body;
        
        // Check admin credentials (you can modify this logic)
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid admin credentials" 
            });
        }

        // Create admin token
        const payload = {
            user: {
                id: 'admin',
                username: username,
                isAdmin: true
            }
        };

        const token = jwt.sign(payload, AUTHENTICATED_SIGNATURE || 'fallback_secret', {
            expiresIn: '24h'
        });

        res.status(200).json({ 
            success: true,
            token,
            user: {
                id: 'admin',
                username: username,
                isAdmin: true
            },
            message: 'Admin login successful'
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ 
            success: false,
            message: "Admin login failed", 
            error: error.message 
        });
    }
});

// Admin token verification endpoint
router.post("/admin/verify", async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access token required' 
            });
        }

        jwt.verify(token, AUTHENTICATED_SIGNATURE || 'fallback_secret', (err, user) => {
            if (err) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Invalid or expired token' 
                });
            }
            
            if (!user.user.isAdmin) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Admin access required' 
                });
            }

            res.status(200).json({
                success: true,
                user: user.user,
                message: 'Token is valid'
            });
        });

    } catch (error) {
        console.error('Admin Verify Error:', error);
        res.status(500).json({ 
            success: false,
            message: "Token verification failed", 
            error: error.message 
        });
    }
});

module.exports = router;