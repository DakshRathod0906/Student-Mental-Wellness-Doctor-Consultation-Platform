const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)`
    }
  },
  duration: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  meetingProvider: {
    type: String,
    default: 'jitsi'
  },
  meetingRoomId: {
    type: String
  },
  meetingLink: {
    type: String
  },
  doctorNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
