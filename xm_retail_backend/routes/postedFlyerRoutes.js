import express from 'express';
import postFlyer, { getPostedFlyers } from '../controllers/postedFlyerController.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// POST /api/posted-flyers
router.post('/', postFlyer);
// GET /api/posted-flyers
router.get('/', getPostedFlyers);
router.post('/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'No image provided' });
    const uploadRes = await cloudinary.uploader.upload(image, { folder: 'flyers' });
    res.json({ url: uploadRes.secure_url });
  } catch (err) {
    res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
  }
});

export default router; 