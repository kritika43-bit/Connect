const express = require('express');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Auth middleware (simplified for this task)
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

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        userId = decoded.userId;
      } catch (err) { /* ignore invalid token for public listing */ }
    }

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { include: { profile: true } },
        applications: userId ? { where: { userId } } : false
      }
    });

    // Simplify response to just show if user applied
    const jobsWithStatus = jobs.map(job => {
      const { applications, ...jobData } = job;
      return {
        ...jobData,
        hasApplied: applications ? applications.length > 0 : false
      };
    });

    res.json(jobsWithStatus);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a job (Admin/Alumni only)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role === 'STUDENT') return res.status(403).json({ message: 'Students cannot post jobs' });
  try {
    const { title, company, location, description, applyLink } = req.body;
    const job = await prisma.job.create({
      data: { title, company, location, description, applyLink, authorId: req.user.userId }
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for a job
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: { jobId, userId }
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await prisma.jobApplication.create({
      data: { jobId, userId }
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

module.exports = router;
