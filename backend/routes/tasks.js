const router = require('express').Router();
const auth = require('../middleware/auth');
const { listTasks, updateTask } = require('../controllers/taskController');

router.use(auth);
router.get('/', listTasks);
router.patch('/:id', updateTask);

module.exports = router;
