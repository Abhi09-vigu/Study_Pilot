// User profile routes (alias for /api/auth/me)
// Provides a beginner-friendly endpoint: /api/user/profile

const router = require('express').Router();
const auth = require('../middleware/auth');
const { me } = require('../controllers/authController');

// GET /api/user/profile
// Protected: requires a valid JWT in Authorization: Bearer <token>
// Returns basic user info (name, email, createdAt, avatarUrl)
router.get('/profile', auth, me);

module.exports = router;
