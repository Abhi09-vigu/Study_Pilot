const User = require('../models/User');
const Syllabus = require('../models/Syllabus');
const Plan = require('../models/Plan');
const { generatePlanForDate } = require('./aiPlanner');
const { sendEmail } = require('./notify');

async function ensureTodayPlan(userId) {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  let plan = await Plan.findOne({ user: userId, date: { $gte: start, $lte: end } });
  if (!plan) {
    const syllabi = await Syllabus.find({ user: userId });
    const topics = syllabi.flatMap((s) => s.topics);
    plan = await generatePlanForDate({ userId, topics, date: new Date(), dailyHours: 3 });
  }
  return plan;
}

async function sendDailyDigest() {
  const users = await User.find({});
  for (const u of users) {
    const plan = await ensureTodayPlan(u._id);
    const first = plan?.items?.[0];
    const to = u.email;
    const subject = 'Study-Pilot: Today’s Topic Reminder';
    const text = first
      ? `Hello ${u.name},\n\nToday’s focus: [${first.type}] ${first.topicTitle} — ${first.durationMinutes} minutes.\n\nStay consistent!\n– Study-Pilot`
      : `Hello ${u.name},\n\nYou have no items scheduled today. Generate a plan in Study-Pilot to stay on track.\n\n– Study-Pilot`;
    await sendEmail(to, subject, text);
  }
}

module.exports = { sendDailyDigest };
