const express = require('express');
const router = express.Router();
const { submitAssessment, getAssessmentHistory } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('student'));

router.post('/', submitAssessment);
router.get('/history', getAssessmentHistory);

module.exports = router;
