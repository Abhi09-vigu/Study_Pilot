const mongoose = require('mongoose');

const PlanItemSchema = new mongoose.Schema({
  topicTitle: { type: String, required: true },
  type: { type: String, enum: ['theory', 'practice'], required: true },
  durationMinutes: { type: Number, default: 45 },
  status: { type: String, enum: ['pending', 'in-progress', 'done', 'skipped'], default: 'pending' },
  notes: { type: String },
});

const PlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    items: { type: [PlanItemSchema], default: [] },
    totalMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
