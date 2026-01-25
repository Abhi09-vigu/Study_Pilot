import express from 'express';
import auth from '../middleware/auth.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';

const router = express.Router();

// Mark a session as completed
router.post('/complete', auth, async (req, res) => {
  try {
    const { planId, dayId, sessionId } = req.body;
    const plan = await Plan.findOne({ _id: planId, userId: req.userId });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const day = plan.days.id(dayId);
    if (!day) return res.status(404).json({ error: 'Day not found' });
    const session = day.sessions.id(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.done = true;
    // Day completed if all sessions done
    day.completed = day.sessions.every(s => s.done);

    await plan.save();

    // Update user stats and streak kindly
    const user = await User.findById(req.userId);
    user.stats.tasksCompleted += 1;
    const today = new Date();
    const last = user.stats.lastCompletedAt ? new Date(user.stats.lastCompletedAt) : null;
    const diffDays = last ? Math.floor((today - last) / (1000 * 60 * 60 * 24)) : null;
    if (diffDays === 1 || last === null) {
      user.stats.streak += 1;
    } else if (diffDays > 1) {
      user.stats.streak = 1; // restart gently
    }
    user.stats.lastCompletedAt = today;
    await user.save();

    res.json({ message: 'Great job—task marked as done! 🎉', plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark task', details: err.message });
  }
});

export default router;
