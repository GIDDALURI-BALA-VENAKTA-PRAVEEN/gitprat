import StudioUser from '../models/StudioUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const JWT_SECRET = process.env.JWT_SECRET || 'studiosecret';
const otpStore = {};

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

function formatPhoneNumber(phone) {
  let p = phone.replace(/\D/g, '');
  if (!p.startsWith('+')) p = '+91' + p;
  return p;
}

export const sendStudioOtp = async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ message: 'Email or phone required' });
  const identifier = email || phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[identifier] = { otp, timestamp: Date.now() };
  try {
    if (email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your StudioFlyer OTP',
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      });
      res.json({ message: 'OTP sent to email' });
    } else if (phone && twilioClient) {
      const formattedPhone = formatPhoneNumber(phone);
      await twilioClient.messages.create({
        body: `Your StudioFlyer OTP is: ${otp}. It expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });
      res.json({ message: 'OTP sent to phone' });
    } else {
      res.status(500).json({ message: 'No email or phone transport available' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyStudioOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  const identifier = email || phone;
  if (!identifier || !otp) return res.status(400).json({ message: 'Email/phone and OTP required' });
  const record = otpStore[identifier];
  if (!record) return res.status(400).json({ message: 'OTP not found or expired' });
  if (Date.now() - record.timestamp > 10 * 60 * 1000) {
    delete otpStore[identifier];
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp.toString() !== otp.toString()) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  delete otpStore[identifier];
  // Find or create user
  let user = null;
  if (email) {
    user = await StudioUser.findOne({ where: { email } });
    if (!user && phone) user = await StudioUser.findOne({ where: { phone } });
  } else if (phone) {
    user = await StudioUser.findOne({ where: { phone } });
  }
  let isNewUser = false;
  if (!user) {
    user = await StudioUser.create({ email, phone });
    isNewUser = true;
  }
  const token = jwt.sign({ userId: user.id, email: user.email, phone: user.phone }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, email: user.email, phone: user.phone, firstName: user.firstName, lastName: user.lastName }, isNewUser });
};

// Comment out password-based register/login
// export const register = ...
// export const login = ...

export const getProfile = async (req, res) => {
  const user = await StudioUser.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatar: user.avatar });
};

export const updateProfile = async (req, res) => {
  const user = await StudioUser.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { firstName, lastName, phone, avatar } = req.body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatar: user.avatar });
}; 