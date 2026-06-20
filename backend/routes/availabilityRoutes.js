const express = require('express');
const router = express.Router();
const { addAvailability, getAvailability } = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('doctor'), addAvailability);
router.get('/:doctorId', getAvailability);

module.exports = router;
