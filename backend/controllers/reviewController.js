const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Add a review for a doctor
// @route   POST /api/reviews
// @access  Private (Student)
const createReview = async (req, res) => {
  try {
    const { doctorId, rating, review } = req.body;

    if (!doctorId || !rating || !review) {
      return res.status(400).json({ message: 'DoctorId, rating, and review text are required' });
    }

    // Verify student has a completed appointment with this doctor
    const appointment = await Appointment.findOne({
      studentId: req.user.id,
      doctorId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(400).json({ message: 'You can only review doctors with whom you have completed appointments' });
    }

    // Create review (uniqueness constraint on compound index studentId + doctorId prevents duplicates)
    const newReview = await Review.create({
      studentId: req.user.id,
      doctorId,
      rating: Number(rating),
      review
    });

    // Update doctor cached ratings metrics
    const doctorReviews = await Review.find({ doctorId });
    const reviewCount = doctorReviews.length;
    const totalRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalRating / reviewCount).toFixed(1));

    await User.findByIdAndUpdate(doctorId, {
      'doctorProfile.averageRating': averageRating,
      'doctorProfile.reviewCount': reviewCount
    });

    res.status(201).json(newReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted a review for this consultant' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Private (Authenticated Users)
const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getDoctorReviews
};
