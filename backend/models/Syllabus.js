const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  estimatedHours: { type: Number, default: 2 },
  dueDate: { type: Date },
  tags: { type: [String], default: [] },
});

const SyllabusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseTitle: { type: String, required: true },
    topics: { type: [TopicSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Syllabus', SyllabusSchema);
