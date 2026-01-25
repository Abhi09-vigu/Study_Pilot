import mongoose from 'mongoose';

const StatsSchema = new mongoose.Schema({
  totalPlans: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCompletedAt: { type: Date, default: null }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  academicLevel: { type: String, default: 'Unknown' },
  focusLevel: { type: String, default: 'Medium' },
  stats: { type: StatsSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
