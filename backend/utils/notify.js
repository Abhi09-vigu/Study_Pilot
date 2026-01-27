const nodemailer = require('nodemailer');
const Reminder = require('../models/Reminder');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined,
});

async function sendEmail(to, subject, text) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Mock Email]', { to, subject, text });
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

async function sendDueReminders() {
  const now = new Date();
  const due = await Reminder.find({ sent: false, dueAt: { $lte: now } }).populate('user');
  for (const r of due) {
    const to = r.user?.email;
    const subject = 'Study-Pilot Reminder';
    const text = r.message;
    if (r.channel === 'email' && to) await sendEmail(to, subject, text);
    if (r.channel === 'whatsapp') {
      console.log('[Mock WhatsApp]', { to: r.user?.email, text });
    }
    r.sent = true;
    await r.save();
  }
  if (due.length) console.log(`Sent ${due.length} reminders`);
}

module.exports = { sendEmail, sendDueReminders };
