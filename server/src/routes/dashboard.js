const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { getSignedImageUrl } = require('../utils/upload');

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

// GET Dashboard Stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const alumniCount = await prisma.user.count({ where: { role: 'ALUMNI' } });
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    const activeUsers = await prisma.user.count(); // Simplified for now
    const jobCount = await prisma.job.count();
    const eventCount = await prisma.event.count({
      where: { date: { gte: new Date() } }
    });

    res.json({
      alumniCount,
      studentCount,
      activeUsers,
      jobCount,
      eventCount
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET Recent Feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: { include: { profile: true } } }
    });

    // Generate signed URLs for post authors
    const postsWithSignedUrls = await Promise.all(recentPosts.map(async (post) => {
      if (post.author.profile && post.author.profile.avatarUrl) {
        post.author.profile.avatarUrl = await getSignedImageUrl(post.author.profile.avatarUrl);
      }
      return post;
    }));

    const upcomingEvents = await prisma.event.findMany({
      take: 3,
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' }
    });

    res.json({
      recentPosts: postsWithSignedUrls,
      upcomingEvents
    });
  } catch (error) {
    console.error('Feed fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
