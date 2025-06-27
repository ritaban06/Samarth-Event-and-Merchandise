const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { authenticateToken, isAdmin } = require('../utils/auth');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RPG_ID,
  key_secret: process.env.RPG_SECRET
});

// Get all orders (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ 'user.uid': req.user.uid }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order belongs to user
    if (!req.user.isAdmin && order.user.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body;
    orderData.user = {
      uid: req.user.uid,
      name: req.user.name,
      email: req.user.email
    };

    // Validate stock and calculate total
    let total = 0;
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      const variant = product.variants.find(v => 
        v.size === item.variant.size && v.color === item.variant.color
      );

      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name} (${item.variant.size}, ${item.variant.color})`
        });
      }

      item.price = product.price;
      total += product.price * item.quantity;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`
    });

    orderData.payment = {
      status: 'pending',
      amount: total,
      paymentId: razorpayOrder.id
    };

    const order = new Order(orderData);
    const newOrder = await order.save();

    res.status(201).json({
      order: newOrder,
      razorpayOrder: razorpayOrder
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'shipped') {
      order.trackingNumber = req.body.trackingNumber;
      order.estimatedDeliveryDate = req.body.estimatedDeliveryDate;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify payment and update stock
router.post('/:id/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RPG_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment status
    order.payment.status = 'paid';
    order.payment.paymentId = razorpay_payment_id;
    order.payment.paymentDate = new Date();

    // Update product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const variantIndex = product.variants.findIndex(v => 
        v.size === item.variant.size && v.color === item.variant.color
      );
      product.variants[variantIndex].stock -= item.quantity;
      await product.save();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;