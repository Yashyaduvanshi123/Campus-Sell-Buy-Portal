const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', upload.single('profile_image'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
