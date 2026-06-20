const express = require('express');
const router = express.Router();
const { getJournals, createJournal, updateJournal, deleteJournal } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Secure all journal routes with authentication and check role = student
router.use(protect);
router.use(authorize('student'));

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .put(updateJournal)
  .delete(deleteJournal);

module.exports = router;
