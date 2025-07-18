import StudioFlyer from '../models/StudioFlyer.js';
import StudioUser from '../models/StudioUser.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY || '434222998792551',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});



export const saveFlyer = async (req, res) => {
  const { title, flyerData, imageData } = req.body;
  const userId = req.user.userId;
  if (!flyerData) return res.status(400).json({ message: 'No flyer data' });
  // Get user details
  const user = await StudioUser.findByPk(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Upload preview image to Cloudinary
  let previewImageUrl = '';
  try {
    const uploadRes = await cloudinary.uploader.upload(imageData, {
      folder: 'savedflyers',
      public_id: `flyer_${userId}_${Date.now()}`,
      resource_type: 'image',
    });
    previewImageUrl = uploadRes.secure_url;
  } catch (err) {
    return res.status(500).json({ message: 'Failed to upload flyer image to Cloudinary', error: err.message });
  }

  const flyer = await StudioFlyer.create({ userId, title, flyerData, imageData: '', previewImageUrl });
  res.status(201).json({ flyer, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } });
};

export const getFlyers = async (req, res) => {
  const userId = req.user.userId;
  const flyers = await StudioFlyer.findAll({ where: { userId } });
  res.json({ flyers });
};

export const getFlyer = async (req, res) => {
  const flyer = await StudioFlyer.findByPk(req.params.id);
  if (!flyer) return res.status(404).json({ message: 'Not found' });
  res.json({ flyer });
};

// Unified flyer upload endpoint: tries Cloudinary, falls back to local
export const uploadFlyer = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    // Try Cloudinary first
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'sharedflyers',
          public_id: `flyer_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    // Success: return Cloudinary URL
    return res.json({ url: result.secure_url });
  } catch (error) {
    // Fallback to local storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `flyer_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, req.file.buffer);
    // Return local URL with warning
    const baseUrl = 'http://localhost:4000';
    const url = `${baseUrl}/uploads/${filename}`;
    return res.json({
      url,
      warning: 'This URL is only accessible locally. Set up Cloudinary for public sharing.'
    });
  }
}; 