const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAppointments, 
  cancelAppointment,
  approveAppointment,
  startAppointment,
  completeAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('student'), createAppointment);
router.get('/', getAppointments);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/approve', authorize('doctor'), approveAppointment);
router.patch('/:id/start', authorize('doctor'), startAppointment);
router.patch('/:id/complete', authorize('doctor'), completeAppointment);

module.exports = router;
