import express, { Response } from 'express';
import FoodItem from '../models/FoodItem';
import { protect, admin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/food
// @desc    Get all food items
// @access  Public
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { restaurant, category, is_veg, search } = req.query;
    let query: any = {};

    if (restaurant) query.restaurant = restaurant;
    if (category) query.category = category;
    if (is_veg !== undefined) query.isVeg = is_veg === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const foodItems = await FoodItem.find(query)
      .populate('category', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    
    res.json(foodItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/food/:id
// @desc    Get food item by ID
// @access  Public
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id)
      .populate('category', 'name')
      .populate('restaurant', 'name');
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/food
// @desc    Create food item
// @access  Private/Admin
router.post('/', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = await FoodItem.create(req.body);
    const populated = await FoodItem.findById(foodItem._id)
      .populate('category', 'name')
      .populate('restaurant', 'name');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/food/:id
// @desc    Update food item
// @access  Private/Admin
router.put('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name')
      .populate('restaurant', 'name');
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/food/:id
// @desc    Delete food item
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
