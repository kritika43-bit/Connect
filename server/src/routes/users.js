const express = require("express");
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { upload, getSignedImageUrl } = require('../utils/upload');

const router = express.Router();
const prisma = new PrismaClient();

// Auth middleware
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

// GET Directory (All public users)
router.get("/", authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      where: {
        profile: { isPublic: true }
      }
    });

    // Generate signed URLs for each user profile
    const usersWithSignedUrls = await Promise.all(users.map(async (u) => {
      if (u.profile && u.profile.avatarUrl) {
        u.profile.avatarUrl = await getSignedImageUrl(u.profile.avatarUrl);
      }
      return u;
    }));

    res.json(usersWithSignedUrls);
  } catch (err) {
    console.error('Directory fetch error:', err);
    res.status(500).json({ error: "Failed to fetch directory" });
  }
});

// GET Profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId }
    });
    
    if (profile && profile.avatarUrl) {
      profile.avatarUrl = await getSignedImageUrl(profile.avatarUrl);
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// UPDATE Profile
router.post("/profile", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, graduationYear, currentJob, company, bio, isPublic, avatarUrl } = req.body;

    // Create update object without avatarUrl to prevent overwriting permanent keys with temporary signed URLs
    const updateData = { 
      firstName, 
      lastName, 
      graduationYear: parseInt(graduationYear), 
      currentJob, 
      company, 
      bio, 
      isPublic 
    };

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.userId },
      update: updateData,
      create: { 
        ...updateData,
        userId: req.user.userId,
        avatarUrl: avatarUrl && !avatarUrl.includes('X-Amz-Signature') ? avatarUrl : null,
        isPublic: isPublic !== undefined ? isPublic : true
      }
    });

    if (profile && profile.avatarUrl) {
      profile.avatarUrl = await getSignedImageUrl(profile.avatarUrl);
    }

    res.json({ message: "Profile saved successfully", profile });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// UPLOAD Profile Photo
router.post("/profile/photo", authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = req.file.location; // S3 URL

    const profile = await prisma.profile.update({
      where: { userId: req.user.userId },
      data: { avatarUrl }
    });

    const signedUrl = await getSignedImageUrl(avatarUrl);

    res.json({ message: "Photo uploaded successfully", avatarUrl: signedUrl, profile });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

module.exports = router;