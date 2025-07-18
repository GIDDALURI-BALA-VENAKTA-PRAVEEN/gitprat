
import express from 'express';

import { saveFlyer, getFlyers, getFlyer, uploadFlyer } from '../controllers/studioFlyerController.js';
import { studioAuthMiddleware } from '../middleware/studioAuthMiddleware.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/save', studioAuthMiddleware, saveFlyer);
router.get('/', studioAuthMiddleware, getFlyers);
router.get('/:id', studioAuthMiddleware, getFlyer);

// Unified upload route
router.post('/upload-flyer', studioAuthMiddleware, upload.single('flyer'), uploadFlyer);

export default router; 