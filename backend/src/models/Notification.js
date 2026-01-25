import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  date: { type: Date, default: () => new Date() },
  type: { type: String, enum: ['reminder', 'motivation', 'wellness'], required: true },
  message: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
