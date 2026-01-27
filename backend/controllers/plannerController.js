const Syllabus = require('../models/Syllabus');
const Plan = require('../models/Plan');
const { generatePlanForDate } = require('../utils/aiPlanner');
const User = require('../models/User');
const { generateStudyPlan, explainTopic, generateMCQs } = require('../utils/openrouter');

async function generate(req, res) {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const user = await User.findById(req.userId);
    const dailyHours = user?.preferences?.dailyHours || 3;
    const syllabi = await Syllabus.find({ user: req.userId });
    const topics = syllabi.flatMap((s) => s.topics);
    const plan = await generatePlanForDate({ userId: req.userId, topics, date, dailyHours });
    res.json(plan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getToday(req, res) {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const plan = await Plan.findOne({ user: req.userId, date: { $gte: start, $lte: end } });
    res.json(plan || { items: [], totalMinutes: 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function updateItemStatus(req, res) {
  try {
    const { planId, index, status } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan || String(plan.user) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
    if (plan.items[index]) {
      plan.items[index].status = status;
      await plan.save();
    }
    res.json(plan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { generate, getToday, updateItemStatus };

// AI plan via OpenRouter; returns JSON schedule and optionally persists today's plan
async function aiGenerate(req, res) {
  try {
    const days = Number(req.body.days || 7);
    const user = await User.findById(req.userId);
    const syllabi = await Syllabus.find({ user: req.userId });
    const topics = syllabi.flatMap((s) => s.topics);
    if (!topics.length) return res.status(400).json({ error: 'No topics found. Add syllabus first.' });

    const aiPlan = await generateStudyPlan(topics, days);

    // Persist day 1 as today's plan if available
    const day1 = aiPlan?.schedule?.find((d) => d.day === 1) || aiPlan?.schedule?.[0];
    if (day1?.items?.length) {
      const items = day1.items.map((it) => ({ topicTitle: it.topic, type: it.type, durationMinutes: it.duration_minutes || 45 }));
      const date = new Date();
      await Plan.findOneAndUpdate(
        { user: req.userId, date: { $gte: new Date(date.setHours(0,0,0,0)), $lte: new Date(date.setHours(23,59,59,999)) } },
        { user: req.userId, date: new Date(), items, totalMinutes: items.reduce((a, b) => a + (b.durationMinutes || 0), 0) },
        { upsert: true, new: true }
      );
    }

    res.json(aiPlan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports.aiGenerate = aiGenerate;

// AI explanation for a topic
async function explain(req, res) {
  try {
    const { topic, type } = req.body;
    if (!topic) return res.status(400).json({ error: 'Missing topic' });
    const md = await explainTopic(topic, type);
    res.json({ topic, type, content: md });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports.explain = explain;

// Generate MCQs for a topic
async function mcqs(req, res) {
  try {
    const { topic, count } = req.body;
    if (!topic) return res.status(400).json({ error: 'Missing topic' });
    const data = await generateMCQs(topic, Number(count || 5));
    res.json({ topic, questions: data.questions || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Submit MCQ answers and mark item as done
async function submitMcqs(req, res) {
  try {
    const { planId, index, answers, questions = [], min = 3 } = req.body;
    if (!planId || typeof index !== 'number' || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const plan = await Plan.findById(planId);
    if (!plan || String(plan.user) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
    if (!plan.items[index]) return res.status(400).json({ error: 'Invalid item index' });
    // Score answers using provided questions' answer_index
    const total = answers.length;
    let correct = 0;
    answers.forEach((ans, i) => {
      const ai = questions[i]?.answer_index;
      if (typeof ai === 'number' && ans === ai) correct++;
    });
    const wrong = total - correct;
    const passed = correct >= Number(min || 3);
    if (passed) {
      plan.items[index].status = 'done';
      await plan.save();
    }
    res.json({
      plan,
      result: { total, correct, wrong, marks: correct, min: Number(min || 3), passed },
      passed,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports.mcqs = mcqs;
module.exports.submitMcqs = submitMcqs;
