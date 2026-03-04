import express from 'express';
import Address from '../models/Address';
import { protect } from '../middleware/auth';
const router = express.Router();
// @route   GET /api/addresses
// @desc    Get user addresses
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user?.id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/addresses
// @desc    Create address
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const addressData = {
            ...req.body,
            user: req.user?.id,
        };
        // If this is set as default, unset other defaults
        if (addressData.isDefault) {
            await Address.updateMany({ user: req.user?.id }, { isDefault: false });
        }
        const address = await Address.create(addressData);
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user?.id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // If setting as default, unset other defaults
        if (req.body.isDefault) {
            await Address.updateMany({ user: req.user?.id }, { isDefault: false });
        }
        const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
