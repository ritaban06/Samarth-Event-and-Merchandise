const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user is admin
        if (decoded.username !== process.env.ADMIN_USERNAME) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Get dashboard statistics
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        
        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'shipped'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'userName email')
            .populate('items.product', 'name');

        res.json({
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue
            },
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get all orders with filtering
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (page - 1) * limit;
        
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'userName email phone')
            .populate('items.product', 'name price images');

        const totalOrders = await Order.countDocuments(filter);
        
        res.json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                hasNext: skip + orders.length < totalOrders,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
router.patch('/orders/:orderId/status', authenticateAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('user', 'userName email')
         .populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get all products for admin
router.get('/products', authenticateAdmin, async (req, res) => {
    try {
        const { category, status, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (status && status !== 'all') {
            filter.status = status;
        }

        const skip = (page - 1) * limit;
        
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);
        
        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                hasNext: skip + products.length < totalProducts,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create new product
router.post('/products', authenticateAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/products/:productId', authenticateAdmin, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findByIdAndUpdate(
            productId,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/products/:productId', authenticateAdmin, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Sync orders to Google Sheets
router.post('/sync-orders', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.body;
        
        // Build filter for orders
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Fetch orders from database
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('user', 'userName email phone')
            .populate('items.product', 'name price category');

        if (orders.length === 0) {
            return res.status(400).json({ error: 'No orders found for the specified criteria' });
        }

        // Initialize Google Sheets
        const googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const serviceAccountAuth = new JWT({
            email: googleCredentials.client_email,
            key: googleCredentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        // Get or create the Orders sheet
        let sheet = doc.sheetsByTitle['Orders'];
        if (!sheet) {
            sheet = await doc.addSheet({ 
                title: 'Orders',
                headerValues: [
                    'Order ID', 'Customer Name', 'Email', 'Phone', 'Status',
                    'Total Amount', 'Order Date', 'Items', 'Quantities', 'Sizes', 'Colors'
                ]
            });
        }

        // Clear existing data (except headers)
        await sheet.clear('A2:K');

        // Prepare rows for insertion
        const rows = orders.map(order => {
            const items = order.items.map(item => item.product.name).join(', ');
            const quantities = order.items.map(item => item.quantity).join(', ');
            const sizes = order.items.map(item => item.size || 'N/A').join(', ');
            const colors = order.items.map(item => item.color || 'N/A').join(', ');

            return {
                'Order ID': order._id.toString(),
                'Customer Name': order.user.userName,
                'Email': order.user.email,
                'Phone': order.user.phone || 'N/A',
                'Status': order.status,
                'Total Amount': order.totalAmount,
                'Order Date': order.createdAt.toISOString().split('T')[0],
                'Items': items,
                'Quantities': quantities,
                'Sizes': sizes,
                'Colors': colors
            };
        });

        // Add rows to sheet
        await sheet.addRows(rows);

        res.json({ 
            message: `Successfully synced ${orders.length} orders to Google Sheets`,
            ordersCount: orders.length,
            sheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
        });

    } catch (error) {
        console.error('Sync orders error:', error);
        res.status(500).json({ 
            error: 'Failed to sync orders to Google Sheets',
            details: error.message 
        });
    }
});

module.exports = router;
