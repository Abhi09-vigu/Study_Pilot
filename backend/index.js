require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { connectDB } = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const syllabusRoutes = require('./routes/syllabus');
const plannerRoutes = require('./routes/planner');
const taskRoutes = require('./routes/tasks');
const reminderRoutes = require('./routes/reminders');

// Utils
const { sendDueReminders } = require('./utils/notify');
const { sendDailyDigest } = require('./utils/dailyDigest');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Ensure uploads dir exists and serve statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Health
app.get('/api/health', (req, res) => {
	res.json({ ok: true, service: 'Study-Pilot Backend', time: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);

// Start server
const PORT = process.env.PORT || 4000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Study-Pilot API running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect DB', err);
		process.exit(1);
	});

// Automation: check and send reminders every 5 minutes
cron.schedule('*/5 * * * *', async () => {
	try {
		await sendDueReminders();
	} catch (e) {
		console.error('Reminder job failed:', e.message);
	}
});

// Daily 8:00 reminder email
cron.schedule('0 8 * * *', async () => {
	try {
		await sendDailyDigest();
		console.log('Daily digest sent');
	} catch (e) {
		console.error('Daily digest failed:', e.message);
	}
});

