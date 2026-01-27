const router = require('express').Router();
const auth = require('../middleware/auth');
const { scheduleReminder, listReminders } = require('../controllers/reminderController');

router.use(auth);
router.get('/', listReminders);
router.post('/', scheduleReminder);

module.exports = router;
