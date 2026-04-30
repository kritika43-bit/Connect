const express = require('express');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const sendEmailNotification = async (to, senderName, content) => {
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
      subject: `New message from ${senderName} - Connect`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
          <h2 style="color: #6366f1; text-align: center;">New Message</h2>
          <p>Hello,</p>
          <p>You have received a new message from <strong>${senderName}</strong>:</p>
          <div style="background: #f3f4f6; padding: 20px; color: #1f2937; border-radius: 8px; margin: 20px 0; font-style: italic;">
            "${content}"
          </div>
          <p>You can reply directly to this email or log in to Connect to continue the conversation.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 Connect. All rights reserved.</p>
        </div>
      `
    });
    console.log(`Notification email sent to ${to}`);
  } catch (error) {
    console.error('Nodemailer error:', error);
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get messages involving the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.userId },
          { receiverId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } }
      }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.userId,
        receiverId: parseInt(receiverId),
        content
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } }
      }
    });

    // Send email notification
    if (message.receiver.email) {
      const senderName = message.sender.profile 
        ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
        : message.sender.email;
      await sendEmailNotification(message.receiver.email, senderName, content);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
