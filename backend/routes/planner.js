const router = require('express').Router();
const auth = require('../middleware/auth');
const { generate, getToday, updateItemStatus, aiGenerate, explain, mcqs, submitMcqs } = require('../controllers/plannerController');

router.use(auth);
router.post('/generate', generate);
router.get('/today', getToday);
router.post('/status', updateItemStatus);
router.post('/ai', aiGenerate);
router.post('/explain', explain);
router.post('/mcqs', mcqs);
router.post('/mcqs/submit', submitMcqs);

module.exports = router;
