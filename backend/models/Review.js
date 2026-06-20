const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Enforce one review per student per doctor
ReviewSchema.index({ studentId: 1, doctorId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
