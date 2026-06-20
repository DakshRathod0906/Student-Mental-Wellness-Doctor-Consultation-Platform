const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Helper to check if time falls within availability range
const isTimeWithinRange = (time, start, end) => {
  const [tHour, tMin] = time.split(':').map(Number);
  const [sHour, sMin] = start.split(':').map(Number);
  const [eHour, eMin] = end.split(':').map(Number);

  const tVal = tHour * 60 + tMin;
  const sVal = sHour * 60 + sMin;
  const eVal = eHour * 60 + eMin;

  return tVal >= sVal && tVal < eVal;
};

// @desc    Create a new appointment booking
// @route   POST /api/appointments
// @access  Private (Student)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledDate, scheduledTime, duration } = req.body;

    if (!doctorId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: 'DoctorId, scheduledDate, and scheduledTime are required' });
    }

    // Verify doctor exists and has role = doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor selected' });
    }

    // Determine the day of the week
    const dateObj = new Date(scheduledDate);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDay = daysOfWeek[dateObj.getDay()];

    // Verify doctor availability for that day
    const availability = await DoctorAvailability.findOne({ doctorId, day: selectedDay, isAvailable: true });
    if (!availability) {
      return res.status(400).json({ message: `Doctor is not available on ${selectedDay}s` });
    }

    // Check if scheduled time falls within availability window
    const durationMin = duration || 30;
    const isAvailableTime = isTimeWithinRange(scheduledTime, availability.startTime, availability.endTime);
    if (!isAvailableTime) {
      return res.status(400).json({ 
        message: `Requested time ${scheduledTime} is outside doctor's available hours (${availability.startTime} - ${availability.endTime})` 
      });
    }

    // Check for conflicting appointments (validate that the slot is not already taken)
    const dateStr = dateObj.toISOString().split('T')[0];
    const conflict = await Appointment.findOne({
      doctorId,
      status: { $in: ['pending', 'approved', 'in_progress'] },
      scheduledTime,
      scheduledDate: {
        $gte: new Date(dateStr),
        $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This slot is already booked for the selected doctor' });
    }

    const appointment = await Appointment.create({
      studentId: req.user.id,
      doctorId,
      scheduledDate: dateObj,
      scheduledTime,
      duration: durationMin,
      status: 'pending'
    });

    // Create notifications
    const formattedDate = dateObj.toLocaleDateString();
    
    // For student
    await Notification.create({
      userId: req.user.id,
      title: 'Appointment Booked',
      message: `Your booking request with Dr. ${doctor.firstName} ${doctor.lastName} on ${formattedDate} at ${scheduledTime} is pending doctor approval.`,
      type: 'appointment_booked'
    });

    // For doctor
    await Notification.create({
      userId: doctorId,
      title: 'New Booking Request',
      message: `A student (${req.user.firstName} ${req.user.lastName}) has requested a consultation with you on ${formattedDate} at ${scheduledTime}.`,
      type: 'appointment_booked'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments list
// @route   GET /api/appointments
// @access  Private (Student/Doctor/Admin)
const getAppointments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.studentId = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    }

    // Populate user profile info (name, email)
    const appointments = await Appointment.find(filter)
      .populate('studentId', 'firstName lastName email phoneNumber')
      .populate('doctorId', 'firstName lastName email doctorProfile')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve an appointment and generate Jitsi link
// @route   PATCH /api/appointments/:id/approve
// @access  Private (Doctor)
const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('studentId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to approve this appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve appointment in '${appointment.status}' state` });
    }

    // Generate secure Jitsi Link
    const roomId = `wellness-${crypto.randomUUID()}`;
    const meetingLink = `https://meet.jit.si/${roomId}`;

    appointment.status = 'approved';
    appointment.meetingRoomId = roomId;
    appointment.meetingLink = meetingLink;
    appointment.approvedAt = new Date();
    await appointment.save();

    const formattedDate = new Date(appointment.scheduledDate).toLocaleDateString();

    // Notify Student
    await Notification.create({
      userId: appointment.studentId._id,
      title: 'Appointment Approved',
      message: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} has approved your session on ${formattedDate} at ${appointment.scheduledTime}.`,
      type: 'appointment_approved'
    });

    // Notify Doctor
    await Notification.create({
      userId: appointment.doctorId._id,
      title: 'Appointment Approved',
      message: `You approved the appointment with ${appointment.studentId.firstName} ${appointment.studentId.lastName} on ${formattedDate} at ${appointment.scheduledTime}.`,
      type: 'appointment_approved'
    });

    res.json({ message: 'Appointment approved successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start an appointment
// @route   PATCH /api/appointments/:id/start
// @access  Private (Doctor)
const startAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to start this appointment' });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({ message: `Cannot start appointment in '${appointment.status}' state` });
    }

    appointment.status = 'in_progress';
    appointment.startedAt = new Date();
    await appointment.save();

    res.json({ message: 'Appointment started', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete an appointment
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Doctor)
const completeAppointment = async (req, res) => {
  try {
    const { doctorNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('studentId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to complete this appointment' });
    }

    if (appointment.status !== 'in_progress' && appointment.status !== 'approved') {
      return res.status(400).json({ message: `Cannot complete appointment in '${appointment.status}' state` });
    }

    appointment.status = 'completed';
    appointment.completedAt = new Date();
    if (doctorNotes) {
      appointment.doctorNotes = doctorNotes;
    }
    await appointment.save();

    // Notify Student (Review is now enabled)
    await Notification.create({
      userId: appointment.studentId._id,
      title: 'Consultation Completed',
      message: `Your session with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} has ended. Please share your feedback and leave a review.`,
      type: 'assessment_completed'
    });

    res.json({ message: 'Appointment completed successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (Student/Doctor/Admin)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('studentId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership or admin permission
    if (
      req.user.role !== 'admin' &&
      appointment.studentId._id.toString() !== req.user.id &&
      appointment.doctorId._id.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: 'Not authorized to modify this appointment' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    await appointment.save();

    const formattedDate = new Date(appointment.scheduledDate).toLocaleDateString();

    // Notify student
    await Notification.create({
      userId: appointment.studentId._id,
      title: 'Appointment Cancelled',
      message: `Your appointment with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName} on ${formattedDate} at ${appointment.scheduledTime} has been cancelled.`,
      type: 'appointment_cancelled'
    });

    // Notify doctor
    await Notification.create({
      userId: appointment.doctorId._id,
      title: 'Appointment Cancelled',
      message: `The appointment with student ${appointment.studentId.firstName} ${appointment.studentId.lastName} on ${formattedDate} at ${appointment.scheduledTime} has been cancelled.`,
      type: 'appointment_cancelled'
    });

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  approveAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment
};
