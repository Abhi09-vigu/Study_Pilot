import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const plans = await Plan.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5);
  const completedTasks = user?.stats?.tasksCompleted || 0;
  const ongoingPlans = plans.filter(p => p.ongoing).length;
  res.json({
    greeting: `Welcome back, ${user.name}!`,
    profile: { name: user.name, academicLevel: user.academicLevel, focusLevel: user.focusLevel },
    progress: {
      recentPlans: plans.map(p => ({ id: p._id, title: p.title, startDate: p.startDate, endDate: p.endDate, ongoing: p.ongoing })),
      completedTasks,
      ongoingPlans,
      streak: user?.stats?.streak || 0,
      totalPlans: user?.stats?.totalPlans || plans.length
    },
    encouragement: ongoingPlans ? 'Nice consistency—want to continue your current plan?' : 'Ready to start a fresh, gentle plan?'
  });
});

export default router;
