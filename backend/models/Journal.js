const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  visibility: {
    type: String,
    enum: ['private', 'doctor_visible'],
    default: 'private'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Journal', JournalSchema);
