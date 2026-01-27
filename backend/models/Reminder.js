const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    dueAt: { type: Date, required: true },
    channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
    sent: { type: Boolean, default: false },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', ReminderSchema);
