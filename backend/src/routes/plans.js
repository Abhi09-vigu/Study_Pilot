import express from 'express';
import auth from '../middleware/auth.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import { generatePlan } from '../services/planGenerator.js';
import { generateAIPlan } from '../services/openrouter.js';

const router = express.Router();

// Create plan after duration confirmation
router.post('/create', auth, async (req, res) => {
  try {
    const { title, syllabus, subjects, durationDays, startDate, endDate, dailyHours, useAI } = req.body;
    if ((!syllabus || !Array.isArray(syllabus) || syllabus.length === 0) && (!subjects || !Array.isArray(subjects) || subjects.length === 0)) {
      return res.status(400).json({ error: 'Subjects required' });
    }

    let days = durationDays;
    if (!days && endDate && startDate) {
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      days = Math.max(1, Math.ceil((ed - sd) / (1000 * 60 * 60 * 24)) + 1);
    }
    if (!days) return res.status(400).json({ error: 'Duration (days) or start+end date required' });

    let planDays;
    let planTitle = title || 'Study Plan';
    const sd = startDate ? new Date(startDate) : new Date();
    const effectiveSyllabus = (syllabus && syllabus.length) ? syllabus : (subjects || []).map(s => ({ subject: s, topics: [] }));
    let aiFallback = false;

    if (useAI) {
      try {
        const ai = await generateAIPlan({ subjectsOnly: subjects, syllabus: effectiveSyllabus, days, dailyHours });
        planTitle = ai.title || planTitle;
        // assign dates sequentially from sd
        let date = new Date(sd);
        planDays = ai.planDays.map((d) => {
          const withDate = { ...d, date: new Date(date) };
          date.setDate(date.getDate() + 1);
          return withDate;
        });
      } catch (e) {
        console.error('AI plan generation failed, falling back:', e.message);
        aiFallback = true;
        planDays = generatePlan({ syllabus: effectiveSyllabus, days, dailyHours, startDate: sd });
      }
    } else {
      // If only subjects provided, build a placeholder syllabus
      planDays = generatePlan({ syllabus: effectiveSyllabus, days, dailyHours, startDate: sd });
    }

    const plan = await Plan.create({ userId: req.userId, title: planTitle, syllabus: effectiveSyllabus, startDate: sd, endDate: endDate || planDays[planDays.length - 1].date, days: planDays, ongoing: true });

    await User.updateOne({ _id: req.userId }, { $inc: { 'stats.totalPlans': 1 } });

    res.json({ plan, aiFallback });
  } catch (err) {
    res.status(500).json({ error: 'Plan creation failed', details: err.message });
  }
});

// List all plans for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans', details: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const plan = await Plan.findOne({ _id: req.params.id, userId: req.userId });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan });
});

export default router;
