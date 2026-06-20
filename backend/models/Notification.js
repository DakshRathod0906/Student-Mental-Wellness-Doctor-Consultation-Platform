const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Notification'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_approved',
      'appointment_cancelled',
      'assessment_completed',
      'review_received',
      'appointment_reminder',
      'assessment_prompt',
      'general'
    ],
    default: 'general',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only track createdAt for notifications
});

module.exports = mongoose.model('Notification', NotificationSchema);
