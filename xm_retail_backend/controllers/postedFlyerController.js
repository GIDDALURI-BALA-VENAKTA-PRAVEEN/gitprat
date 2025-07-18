import PostedFlyer from '../models/PostedFlyer.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const postFlyer = async (req, res) => {
  try {
    const { name, email, number, title, flyerData, imageData } = req.body;
    if (!name || !email || !number || !title || !flyerData || !imageData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Upload the preview image to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(imageData, {
      folder: 'postedflyers'
    });
    const previewImageUrl = uploadRes.secure_url;

    // Count images in flyerData for stats
    const imageCount = flyerData.elements
      ? flyerData.elements.filter((el) => el.type === 'image').length
      : 0;
    const totalSize = JSON.stringify(flyerData).length;

    const postedFlyer = await PostedFlyer.create({
      name,
      email,
      number,
      title,
      flyerData,
      previewImageUrl, // Store the single preview image URL
      imageData: '', // Not used anymore
      imageCount,
      totalSize,
    });

    res.status(201).json({
      message: 'Flyer posted successfully',
      postedFlyer,
      stats: {
        imageCount,
        totalSize,
      }
    });
  } catch (err) {
    console.error('❌ Error in postFlyer:', err);
    // Provide more specific error messages
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Invalid data format', error: err.message });
    }
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ message: 'Database error occurred', error: err.message });
    }
    if (err.name === 'SequelizeConnectionError') {
      return res.status(500).json({ message: 'Database connection error', error: err.message });
    }
    if (err.name === 'SequelizeTimeoutError') {
      return res.status(500).json({ message: 'Database operation timed out', error: err.message });
    }
    // Log the full error for debugging
    console.error('Full error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      message: 'Failed to post flyer', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getPostedFlyers = async (req, res) => {
  try {
    const flyers = await PostedFlyer.findAll({ order: [['createdAt', 'DESC']] });
    res.json(flyers);
  } catch (err) {
    console.error('❌ Error in getPostedFlyers:', err);
    res.status(500).json({ message: 'Failed to fetch posted flyers', error: err.message });
  }
};

export default postFlyer;