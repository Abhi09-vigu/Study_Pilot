const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    topicTitle: { type: String },
    type: { type: String, enum: ['theory', 'practice'], default: 'practice' },
    dueAt: { type: Date },
    status: { type: String, enum: ['pending', 'done', 'skipped'], default: 'pending' },
    feedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
