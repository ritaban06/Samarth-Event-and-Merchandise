const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const Client = require('../models/clientModel');
const { sendPackageConfirmation } = require('../utils/emailService');
const { send } = require('process');
// Route 1: Get all packages
router.get('/', async (req, res) => {
    try {
        const packagesPath = path.join(__dirname, '../json/packages.json');
        const packagesData = await fs.readFile(packagesPath, 'utf8');
        const packages = JSON.parse(packagesData);
        res.json(packages);
    } catch (error) {
        console.error('Error reading packages:', error);
        res.status(500).json({ message: 'Error fetching packages' });
    }
});

// Route 2: Update package.registered count for a user
router.patch('/update-count/:userId', async (req, res) => {
    try {
        const client = await Client.findOne({ uid: req.params.userId });
        
        if (!client) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (client.package.status !== 'active') {
            return res.status(400).json({ message: 'No active package found' });
        }

        // Increment the registered count
        client.package.registered += 1;

        await client.save();
        res.json({ 
            registered: client.package.registered,
            status: client.package.status,
            limit: client.package.limit
        });
    } catch (error) {
        console.error('Error updating package count:', error);
        res.status(500).json({ message: 'Error updating package count' });
    }
});

// Route 3: Buy/Activate a package for a user
router.post('/buy/:userId', async (req, res) => {
    try {
        const { packageId, paymentType, paymentId } = req.body;
        
        // Read package details from JSON
        const packagesPath = path.join(__dirname, '../json/packages.json');
        const packagesData = await fs.readFile(packagesPath, 'utf8');
        const packages = JSON.parse(packagesData).packages;
        
        // Find the selected package
        const selectedPackage = packages.find(pkg => pkg.id === packageId);
        if (!selectedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Update client's package details
        const client = await Client.findOne({ uid: req.params.userId });
        if (!client) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update package details
        client.package = {
            status: 'active',
            limit: selectedPackage.limit,
            registered: 0,
            payment: {
                status: paymentType === 'cash' ? 'pending' : 'paid',
                type: paymentType,
                payment_id: paymentType === 'online' ? paymentId : undefined
            }
        };

        await client.save();
        await sendPackageConfirmation(client.userName, client.uid, client.email, client.package.payment.status);
        res.json({ 
            message: 'Package activated successfully',
            package: client.package
        });

       

    } catch (error) {
        console.error('Error buying package:', error);
        res.status(500).json({ message: 'Error activating package' });
    }
});

// Route: Get user package data
router.get('/datafetch', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const client = await Client.findOne({ uid: id });
        if (!client) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            package: client.package,
            userName: client.userName,
            email: client.email
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Backend route example
router.put('/clients/:clientId/package-status', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status } = req.body;
    
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { 'package.payment.status': status },
      { new: true }
    );
    await sendPackageConfirmation(updatedClient.userName, updatedClient.uid, updatedClient.email, updatedClient.package.payment.status)
    
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;