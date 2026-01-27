const Reminder = require('../models/Reminder');

async function scheduleReminder(req, res) {
  try {
    const { message, dueAt, channel, taskId, planId } = req.body;
    const reminder = await Reminder.create({ user: req.userId, message, dueAt, channel, task: taskId, plan: planId });
    res.json(reminder);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function listReminders(req, res) {
  try {
    const list = await Reminder.find({ user: req.userId }).sort('-dueAt');
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { scheduleReminder, listReminders };
