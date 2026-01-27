const Plan = require('../models/Plan');
const Task = require('../models/Task');

// Simple rule-based planner: interleave theory and practice, respect daily hours
function buildDailyItems(topics, dailyMinutes) {
  const items = [];
  let remaining = dailyMinutes;
  let toggle = 'theory';
  const slot = 45; // 45-minute sessions

  // Sort topics by nearest dueDate and higher estimatedHours
  const sorted = [...topics].sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate) : new Date('2999-01-01');
    const db = b.dueDate ? new Date(b.dueDate) : new Date('2999-01-01');
    if (da.getTime() !== db.getTime()) return da - db;
    return (b.estimatedHours || 0) - (a.estimatedHours || 0);
  });

  let i = 0;
  while (remaining >= slot && i < sorted.length) {
    const topic = sorted[i % sorted.length];
    items.push({ topicTitle: topic.title, type: toggle, durationMinutes: slot, status: 'pending' });
    remaining -= slot;
    toggle = toggle === 'theory' ? 'practice' : 'theory';
    i++;
  }
  return items;
}

async function generatePlanForDate({ userId, topics, date, dailyHours = 3 }) {
  const dailyMinutes = Math.max(60, Math.min(8 * 60, dailyHours * 60));
  const items = buildDailyItems(topics, dailyMinutes);
  const totalMinutes = items.reduce((acc, it) => acc + (it.durationMinutes || 0), 0);
  const plan = await Plan.findOneAndUpdate(
    { user: userId, date },
    { user: userId, date, items, totalMinutes },
    { upsert: true, new: true }
  );

  // Create practice tasks from plan items for tracking
  const practiceItems = items.filter((it) => it.type === 'practice');
  for (const it of practiceItems) {
    await Task.create({ user: userId, title: `Practice: ${it.topicTitle}`, topicTitle: it.topicTitle, type: 'practice', status: 'pending' });
  }
  return plan;
}

module.exports = { generatePlanForDate };
