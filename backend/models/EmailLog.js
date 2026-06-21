const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'opened'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['transactional', 'campaign', 'automated', 'system'],
    default: 'transactional'
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },
  sentAt: {
    type: Date
  },
  openedAt: {
    type: Date
  },
  error: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
