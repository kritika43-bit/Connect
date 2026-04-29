const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/auth');
const jobRoutes = require('./src/routes/jobs');
const eventRoutes = require('./src/routes/events');
const postRoutes = require('./src/routes/posts');
const userRoutes = require('./src/routes/users');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');

const dashboardRoutes = require('./src/routes/dashboard');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});


// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Alumni Portal API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
