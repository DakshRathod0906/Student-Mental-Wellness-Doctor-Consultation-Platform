const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
  getCampaigns,
  createCampaign,
  sendCampaign,
  deleteCampaign,
  getRules,
  upsertRule,
  toggleRule,
  getLogs,
  getAnalytics,
  sendTestEmail
} = require('../controllers/emailController');

// All email routes are admin-only
router.use(protect, authorize('admin'));

// Templates
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.post('/templates/:id/duplicate', duplicateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.post('/campaigns/:id/send', sendCampaign);
router.delete('/campaigns/:id', deleteCampaign);

// Automation Rules
router.get('/rules', getRules);
router.post('/rules', upsertRule);
router.patch('/rules/:id/toggle', toggleRule);

// Logs
router.get('/logs', getLogs);

// Analytics
router.get('/analytics', getAnalytics);

// Test Email
router.post('/send-test', sendTestEmail);

module.exports = router;
