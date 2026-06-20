const express = require('express');
const router = express.Router();
const { createDoctorNote, getDoctorNotes } = require('../controllers/doctorNoteController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('doctor'), createDoctorNote);
router.get('/', authorize('student', 'doctor', 'admin'), getDoctorNotes);

module.exports = router;
