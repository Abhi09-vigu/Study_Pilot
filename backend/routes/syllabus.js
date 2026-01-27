const router = require('express').Router();
const auth = require('../middleware/auth');
const { upsertSyllabus, getSyllabi } = require('../controllers/syllabusController');

router.use(auth);
router.get('/', getSyllabi);
router.post('/', upsertSyllabus);

module.exports = router;
