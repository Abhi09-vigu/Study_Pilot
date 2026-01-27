require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');

async function run() {
  await connectDB();
  const email = 'test@example.com';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: 'Test User', email, password: 'password', preferences: { dailyHours: 3, reminders: ['email'] } });
    console.log('Created user:', email, 'password: password');
  } else {
    console.log('User already exists:', email);
  }
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
