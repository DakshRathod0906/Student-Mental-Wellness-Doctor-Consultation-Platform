const DoctorAvailability = require('../models/DoctorAvailability');

// @desc    Add or Update doctor availability
// @route   POST /api/availability
// @access  Private (Doctor)
const addAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime, isAvailable } = req.body;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({ message: 'Day, startTime, and endTime are required' });
    }

    // Check if availability for this day already exists
    let availability = await DoctorAvailability.findOne({ doctorId: req.user.id, day });

    if (availability) {
      availability.startTime = startTime;
      availability.endTime = endTime;
      availability.isAvailable = isAvailable !== undefined ? isAvailable : availability.isAvailable;
      await availability.save();
      return res.json(availability);
    }

    availability = await DoctorAvailability.create({
      doctorId: req.user.id,
      day,
      startTime,
      endTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get availability for a specific doctor
// @route   GET /api/availability/:doctorId
// @access  Private (Student/Doctor/Admin)
const getAvailability = async (req, res) => {
  try {
    const availabilities = await DoctorAvailability.find({ doctorId: req.params.doctorId });
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAvailability,
  getAvailability
};
