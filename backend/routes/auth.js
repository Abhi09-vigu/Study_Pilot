const router = require('express').Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname) || '';
		const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
		cb(null, `${Date.now()}-${base}${ext}`);
	}
});
const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
	fileFilter: (req, file, cb) => {
		if (/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) return cb(null, true);
		cb(new Error('Only image files are allowed'));
	}
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.patch('/profile', auth, upload.single('avatar'), updateProfile);

module.exports = router;
