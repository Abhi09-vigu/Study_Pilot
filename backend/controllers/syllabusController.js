const Syllabus = require('../models/Syllabus');

async function upsertSyllabus(req, res) {
  try {
    const { courseTitle, topics } = req.body;
    const doc = await Syllabus.findOneAndUpdate(
      { user: req.userId, courseTitle },
      { user: req.userId, courseTitle, topics },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getSyllabi(req, res) {
  try {
    const list = await Syllabus.find({ user: req.userId }).sort('-updatedAt');
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { upsertSyllabus, getSyllabi };
