const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email transporter configuration (using a simulation/log by default)
const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    await transporter.sendMail({
      from: `"Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your email - Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
          <h2 style="color: #6366f1; text-align: center;">Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for joining Connect. Please use the following One-Time Password (OTP) to verify your email address:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 Connect. All rights reserved.</p>
        </div>
      `
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Nodemailer error:', error);
  }
};


// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, graduationYear, role } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or Phone is required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60000); // 15 mins

    // Create User and Profile
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: (role === 'STUDENT' || role === 'ALUMNI') ? role : 'ALUMNI',
        otp,
        otpExpiry,
        isVerified: false,
        profile: {
          create: {
            firstName,
            lastName,
            graduationYear: graduationYear ? parseInt(graduationYear) : null,
          }
        }
      },
      include: { profile: true }
    });

    // Send verification email if email provided
    if (email) {
      await sendEmail(email, otp);
    }

    res.status(201).json({ 
      message: 'Registration successful. Please verify your email with the OTP sent.', 
      userId: user.id,
      email: user.email,
      requiresVerification: true 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify Email OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpiry: null }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Email verified successfully', 
      token, 
      user: { id: user.id, email: user.email, role: user.role, isVerified: true } 
    });
  } catch (error) {
    console.error('Email verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login via Email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Login verification check removed as per user request
    // if (!user.isVerified) {
    //   ...
    // }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    if (user.profile && user.profile.avatarUrl) {
      user.profile.avatarUrl = await getSignedImageUrl(user.profile.avatarUrl);
    }

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, profile: user.profile, isVerified: true } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Request OTP for Phone Login (Existing)
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

    console.log(`\n\n=== SMS SIMULATION ===\nTo: ${phone}\nOTP: ${otp}\n======================\n\n`);

    res.json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify Phone OTP (Existing)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { phone }, include: { profile: true } });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpiry: null }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    if (user.profile && user.profile.avatarUrl) {
      user.profile.avatarUrl = await getSignedImageUrl(user.profile.avatarUrl);
    }

    res.json({ token, user: { id: user.id, phone: user.phone, role: user.role, profile: user.profile, isVerified: true } });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const { getSignedImageUrl } = require('../utils/upload');

// Get Current User
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.profile && user.profile.avatarUrl) {
      user.profile.avatarUrl = await getSignedImageUrl(user.profile.avatarUrl);
    }
    
    res.json({ user: { id: user.id, email: user.email, phone: user.phone, role: user.role, profile: user.profile, isVerified: user.isVerified } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
