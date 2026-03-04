import express from 'express';
import Category from '../models/Category';
import { protect, admin } from '../middleware/auth';
const router = express.Router();
// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/categories
// @desc    Create category
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
