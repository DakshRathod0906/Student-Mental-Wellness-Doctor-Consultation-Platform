const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const Review = require('../models/Review');

// @desc    Get all doctors (paginated, filtered, sorted)
// @route   GET /api/doctors
// @access  Private (Authenticated Users)
const getDoctors = async (req, res) => {
  try {
    const { search, specialization, sort, page = 1, limit = 10 } = req.query;

    const query = {
      role: 'doctor',
      isProfileComplete: true
    };

    // Filter by Specialization
    if (specialization) {
      query['doctorProfile.specialization'] = specialization;
    }

    // Filter by Name Search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine Sorting
    let sortQuery = {};
    if (sort === 'rating') {
      sortQuery['doctorProfile.averageRating'] = -1;
    } else if (sort === 'experience') {
      sortQuery['doctorProfile.experience'] = -1;
    } else {
      sortQuery['createdAt'] = -1; // Default
    }

    const skipIndex = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const doctors = await User.find(query)
      .select('-passwordHash')
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skipIndex);

    res.json({
      doctors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated doctors for landing page
// @route   GET /api/doctors/featured
// @access  Public
const getFeaturedDoctors = async (req, res) => {
  try {
    const featured = await User.find({ role: 'doctor', isProfileComplete: true })
      .select('firstName lastName email doctorProfile')
      .sort({ 'doctorProfile.averageRating': -1 })
      .limit(3);
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor unified profile details by ID
// @route   GET /api/doctors/:id
// @access  Private (Authenticated Users)
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-passwordHash');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const availability = await DoctorAvailability.find({ doctorId: req.params.id });
    const reviews = await Review.find({ doctorId: req.params.id })
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      doctor,
      availability,
      reviews,
      averageRating: doctor.doctorProfile.averageRating,
      reviewCount: doctor.doctorProfile.reviewCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile configuration
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, fee, qualification, bio, image } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid profile account type' });
    }

    user.doctorProfile.specialization = specialization || user.doctorProfile.specialization;
    user.doctorProfile.experience = experience !== undefined ? Number(experience) : user.doctorProfile.experience;
    user.doctorProfile.fee = fee !== undefined ? Number(fee) : user.doctorProfile.fee;
    user.doctorProfile.qualification = qualification || user.doctorProfile.qualification;
    user.doctorProfile.bio = bio || user.doctorProfile.bio;
    user.doctorProfile.image = image || user.doctorProfile.image;

    // Check if profile completeness fields exist
    if (
      user.doctorProfile.specialization &&
      user.doctorProfile.experience &&
      user.doctorProfile.qualification &&
      user.doctorProfile.bio
    ) {
      user.isProfileComplete = true;
    }

    const updatedDoctor = await user.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getFeaturedDoctors,
  getDoctorById,
  updateDoctorProfile
};
