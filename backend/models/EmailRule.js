const mongoose = require('mongoose');

const EmailRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  trigger: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_approved',
      'appointment_cancelled',
      'appointment_reminder',
      'assessment_completed',
      'low_wellness_index',
      'journal_streak',
      'inactive_user',
      'password_changed',
      'doctor_note_added'
    ],
    required: true,
    unique: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['appointment', 'assessment', 'journal', 'system'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailRule', EmailRuleSchema);
