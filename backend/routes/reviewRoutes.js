const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('student'), createReview);
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;
