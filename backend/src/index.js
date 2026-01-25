import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import planRoutes from './routes/plans.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Study Pilot backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 4000;

// Start server regardless; attempt DB connect and report status without exiting
app.listen(PORT, () => {
  console.log(`Study Pilot server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('Backend is running, but database is unavailable.');
  });
