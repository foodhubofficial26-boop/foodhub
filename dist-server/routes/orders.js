import express from 'express';
import Order from '../models/Order';
import { protect, admin } from '../middleware/auth';
const router = express.Router();
// @route   GET /api/orders
// @desc    Get all orders (admin) or user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        // If not admin, only show user's orders
        if (req.user?.role !== 'admin') {
            query.user = req.user?.id;
        }
        const orders = await Order.find(query)
            .populate('user', 'username email')
            .populate('items.foodItem', 'name imageUrl')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email')
            .populate('items.foodItem', 'name imageUrl');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user?.id && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            user: req.user?.id,
        };
        const order = await Order.create(orderData);
        const populated = await Order.findById(order._id)
            .populate('user', 'username email')
            .populate('items.foodItem', 'name imageUrl');
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate('user', 'username email')
            .populate('items.foodItem', 'name imageUrl');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/orders/stats/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/stats/dashboard', protect, admin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const User = require('../models/User').default;
        const FoodItem = require('../models/FoodItem').default;
        const totalUsers = await User.countDocuments();
        const totalFoodItems = await FoodItem.countDocuments();
        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            totalFoodItems,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
