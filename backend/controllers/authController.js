const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, preferences: user.preferences } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { register, login };

// Return current user profile (requires auth)
async function me(req, res) {
  try {
    const user = await User.findById(req.userId).select('name email createdAt avatarUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports.me = me;

// Update profile: name, email, and optional avatar upload
async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (req.file) {
      // Ensure uploads are served from /uploads
      const relative = `/uploads/${req.file.filename}`;
      update.avatarUrl = relative;
    }
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true }).select('name email createdAt avatarUrl');
    res.json(user);
  } catch (e) {
    // Handle duplicate email
    if (e && e.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: e.message });
  }
}

module.exports.updateProfile = updateProfile;
