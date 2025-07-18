import express from 'express';
import { sendStudioOtp, verifyStudioOtp, getProfile, updateProfile } from '../controllers/studioUserController.js';
import { studioAuthMiddleware } from '../middleware/studioAuthMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendStudioOtp);
router.post('/verify-otp', verifyStudioOtp);
// router.post('/register', register);
// router.post('/login', login);
router.get('/profile', studioAuthMiddleware, getProfile);
router.patch('/profile', studioAuthMiddleware, updateProfile);

export default router; 