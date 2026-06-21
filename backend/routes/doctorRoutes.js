const express = require('express');
const router = express.Router();
const { getDoctors, getFeaturedDoctors, getDoctorById, updateDoctorProfile, verifyDoctor } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Featured is public
router.get('/featured', getFeaturedDoctors);

// All others are protected
router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.patch('/:id/verify', protect, authorize('admin'), verifyDoctor);

module.exports = router;
