const Task = require('../models/Task');

async function listTasks(req, res) {
  try {
    const tasks = await Task.find({ user: req.userId }).sort('-createdAt');
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const task = await Task.findById(id);
    if (!task || String(task.user) !== String(req.userId)) return res.status(404).json({ error: 'Not found' });
    if (status) task.status = status;
    if (feedback) task.feedback = feedback;
    await task.save();
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { listTasks, updateTask };
