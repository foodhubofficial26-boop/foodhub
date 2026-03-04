import express from 'express';
import { upload } from '../config/cloudinary';
import { protect, admin } from '../middleware/auth';
const router = express.Router();
// @route   POST /api/upload
// @desc    Upload image
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: req.file.path,
            filename: req.file.filename,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
