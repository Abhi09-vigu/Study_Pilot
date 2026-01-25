import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/today', auth, async (req, res) => {
  // Gentle, short notifications
  const reminders = [
    'One focused session today is enough 👍',
    'You’ve got this—small steps add up 💫',
    'Quick wellness tip: 5-minute stretch between sessions 🧘'
  ];
  res.json({ notifications: [
    { type: 'reminder', message: reminders[0] },
    { type: 'motivation', message: reminders[1] },
    { type: 'wellness', message: reminders[2] }
  ] });
});

export default router;
