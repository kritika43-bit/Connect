const express = require('express');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: { author: { include: { profile: true } }, attendees: true }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (Admin/Alumni)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role === 'STUDENT') return res.status(403).json({ message: 'Students cannot create events' });
  try {
    const { title, description, date, location } = req.body;
    const event = await prisma.event.create({
      data: { title, description, date: new Date(date), location, authorId: req.user.userId }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// RSVP to an event
router.post('/:id/rsvp', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: { attendees: { connect: { id: req.user.userId } } }
    });
    res.json({ message: 'RSVP successful', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
