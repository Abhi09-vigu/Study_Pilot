const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PreferenceSchema = new mongoose.Schema({
  reminders: { type: [String], default: ['email'] }, // email, whatsapp
  dailyHours: { type: Number, default: 3 },
});

const BehaviorSchema = new mongoose.Schema({
  consistencyScore: { type: Number, default: 0 },
  lastActiveAt: { type: Date },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    preferences: { type: PreferenceSchema, default: () => ({}) },
    behavior: { type: BehaviorSchema, default: () => ({}) },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
