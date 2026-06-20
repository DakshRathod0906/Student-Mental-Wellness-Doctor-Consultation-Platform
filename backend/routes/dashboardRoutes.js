const express = require('express');
const router = express.Router();
const { getStudentDashboard, getDoctorDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/student', authorize('student'), getStudentDashboard);
router.get('/doctor', authorize('doctor'), getDoctorDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;
