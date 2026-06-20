const express = require('express');
const router = express.Router();
const { register, login, getMe, getDoctors, updatePassword, updateProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/doctors', protect, getDoctors);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);

module.exports = router;
