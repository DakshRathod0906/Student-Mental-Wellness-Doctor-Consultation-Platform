const DoctorNote = require('../models/DoctorNote');
const Appointment = require('../models/Appointment');

// @desc    Create a doctor note for a session
// @route   POST /api/doctor-notes
// @access  Private (Doctor)
const createDoctorNote = async (req, res) => {
  try {
    const { appointmentId, studentId, notes, recommendations, followUpRequired, followUpDate } = req.body;

    if (!appointmentId || !studentId || !notes || !recommendations) {
      return res.status(400).json({ message: 'Appointment ID, Student ID, notes, and recommendations are required' });
    }

    const doctorNote = await DoctorNote.create({
      appointmentId,
      doctorId: req.user.id,
      studentId,
      notes,
      recommendations,
      followUpRequired: !!followUpRequired,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    // Optionally update the appointment doctorNotes field if it exists
    await Appointment.findByIdAndUpdate(appointmentId, { doctorNotes: notes });

    res.status(201).json(doctorNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor notes history
// @route   GET /api/doctor-notes
// @access  Private
const getDoctorNotes = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query = { doctorId: req.user.id };
    } else if (req.user.role === 'student') {
      query = { studentId: req.user.id };
    }

    const notes = await DoctorNote.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'scheduledDate scheduledTime')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDoctorNote,
  getDoctorNotes
};
