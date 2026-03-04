import express, { Response } from 'express';
import Restaurant from '../models/Restaurant';
import { protect, admin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, is_veg, min_rating } = req.query;
    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (is_veg !== undefined) {
      query.isVeg = is_veg === 'true';
    }
    if (min_rating) {
      query.rating = { $gte: Number(min_rating) };
    }

    const restaurants = await Restaurant.find(query).sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Public
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/restaurants
// @desc    Create restaurant
// @access  Private/Admin
router.post('/', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/restaurants/:id
// @desc    Update restaurant
// @access  Private/Admin
router.put('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/restaurants/:id
// @desc    Delete restaurant
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
