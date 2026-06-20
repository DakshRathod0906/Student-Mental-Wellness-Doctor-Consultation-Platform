const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PHQ9', 'GAD7', 'PSS10', 'WHO5'],
    required: true
  },
  answers: {
    type: [Number],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    required: true
  },
  interpretation: {
    type: String,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
