import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  duration: Number,
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  motivationalLine: String,
  done: { type: Boolean, default: false }
}, { _id: true });

const DaySchema = new mongoose.Schema({
  date: Date,
  sessions: [SessionSchema],
  completed: { type: Boolean, default: false }
}, { _id: true });

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: String,
  syllabus: [{ subject: String, topics: [String] }],
  startDate: Date,
  endDate: Date,
  days: [DaySchema],
  ongoing: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);
