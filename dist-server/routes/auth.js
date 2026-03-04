import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
const router = express.Router();
// Generate JWT Token
const generateToken = (id, username, role) => {
    return jwt.sign({ id, username, role }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d',
    });
};
// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, fullName, phone } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }
        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Check if this is the first user (make them admin)
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';
        // Create user
        const user = await User.create({
            username,
            password,
            email,
            fullName,
            phone,
            role,
        });
        const token = generateToken(user._id.toString(), user.username, user.role);
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id.toString(), user.username, user.role);
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
