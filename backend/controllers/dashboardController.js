const User = require('../models/User');
const Journal = require('../models/Journal');
const Assessment = require('../models/Assessment');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// @desc    Get dashboard metrics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const journalCount = await Journal.countDocuments({ userId });
    
    const latestPHQ9 = await Assessment.findOne({ userId, type: 'PHQ9' }).sort({ createdAt: -1 });
    const latestGAD7 = await Assessment.findOne({ userId, type: 'GAD7' }).sort({ createdAt: -1 });
    const latestPSS10 = await Assessment.findOne({ userId, type: 'PSS10' }).sort({ createdAt: -1 });
    const latestWHO5 = await Assessment.findOne({ userId, type: 'WHO5' }).sort({ createdAt: -1 });

    const upcomingAppointments = await Appointment.countDocuments({
      studentId: userId,
      status: { $in: ['pending', 'approved', 'in_progress'] },
      scheduledDate: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    // Wellness Index Calculation (0-100)
    // PHQ-9 (30%), GAD-7 (30%), PSS-10 (20%), WHO-5 (20%)
    const phqVal = latestPHQ9 ? latestPHQ9.score : 5; // default moderate-low if not taken
    const gadVal = latestGAD7 ? latestGAD7.score : 4;
    const pssVal = latestPSS10 ? latestPSS10.score : 12;
    const whoVal = latestWHO5 ? latestWHO5.score : 18;

    const phqNorm = ((27 - phqVal) / 27) * 100;
    const gadNorm = ((21 - gadVal) / 21) * 100;
    const pssNorm = ((40 - pssVal) / 40) * 100;
    const whoNorm = (whoVal / 25) * 100;

    const wellnessIndex = Math.round((phqNorm * 0.3) + (gadNorm * 0.3) + (pssNorm * 0.2) + (whoNorm * 0.2));

    // Determine category
    let indexCategory = 'Moderate';
    if (wellnessIndex >= 80) indexCategory = 'Excellent';
    else if (wellnessIndex >= 60) indexCategory = 'Good';
    else if (wellnessIndex >= 40) indexCategory = 'Moderate';
    else if (wellnessIndex >= 20) indexCategory = 'Concerning';
    else indexCategory = 'Critical';

    // Fetch trend entries
    const rawPhqTrend = await Assessment.find({ userId, type: 'PHQ9' }).sort({ createdAt: -1 }).limit(6);
    const phqTrend = rawPhqTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    const rawGadTrend = await Assessment.find({ userId, type: 'GAD7' }).sort({ createdAt: -1 }).limit(6);
    const gadTrend = rawGadTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    const rawPssTrend = await Assessment.find({ userId, type: 'PSS10' }).sort({ createdAt: -1 }).limit(6);
    const pssTrend = rawPssTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    const rawWhoTrend = await Assessment.find({ userId, type: 'WHO5' }).sort({ createdAt: -1 }).limit(6);
    const whoTrend = rawWhoTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    res.json({
      cards: {
        journalCount,
        wellnessIndex,
        indexCategory,
        latestPHQ9: latestPHQ9 ? latestPHQ9.score : null,
        latestPHQ9Severity: latestPHQ9 ? latestPHQ9.severity : 'None',
        latestGAD7: latestGAD7 ? latestGAD7.score : null,
        latestGAD7Severity: latestGAD7 ? latestGAD7.severity : 'None',
        latestPSS10: latestPSS10 ? latestPSS10.score : null,
        latestPSS10Severity: latestPSS10 ? latestPSS10.severity : 'None',
        latestWHO5: latestWHO5 ? latestWHO5.score : null,
        latestWHO5Severity: latestWHO5 ? latestWHO5.severity : 'None',
        latestAssessmentDate: latestPHQ9 ? latestPHQ9.createdAt : (latestGAD7 ? latestGAD7.createdAt : null),
        upcomingAppointments
      },
      phqTrend,
      gadTrend,
      pssTrend,
      whoTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for Doctor
// @route   GET /api/dashboard/doctor
// @access  Private (Doctor)
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      status: { $in: ['pending', 'approved', 'in_progress'] },
      scheduledDate: { $gte: startOfToday, $lte: endOfToday }
    });

    const upcomingAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      status: { $in: ['pending', 'approved', 'in_progress'] },
      scheduledDate: { $gte: startOfToday }
    });

    const uniqueStudents = await Appointment.distinct('studentId', { doctorId });

    // Fetch doctor rating metrics from User doc
    const doctorUser = await User.findById(doctorId);
    const averageRating = doctorUser.doctorProfile ? doctorUser.doctorProfile.averageRating : 0;
    const totalPatientsSeen = await Appointment.countDocuments({ doctorId, status: 'completed' });

    // Fetch recent 5 reviews
    const recentReviews = await Review.find({ doctorId })
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch full appointment history with populated student details
    const upcomingAppointments = await Appointment.find({
      doctorId,
      scheduledDate: { $gte: startOfToday }
    })
      .populate('studentId', 'firstName lastName email')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json({
      cards: {
        todayAppointments,
        upcomingAppointments: upcomingAppointmentsCount,
        totalPatients: uniqueStudents.length,
        patientsSeen: totalPatientsSeen,
        averageRating
      },
      upcomingAppointments,
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for Admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Fetch simple monthly appointment trend datasets (mock labels mapped to database data)
    const activeAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(10);
    const appointmentTrend = activeAppointments.map(app => ({
      date: new Date(app.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      status: app.status
    }));

    // Fetch assessment distribution (PHQ-9 vs GAD-7 counts)
    const phqCount = await Assessment.countDocuments({ type: 'PHQ9' });
    const gadCount = await Assessment.countDocuments({ type: 'GAD7' });

    // Severity distribution metrics for PHQ-9
    const minimalCount = await Assessment.countDocuments({ type: 'PHQ9', severity: 'Minimal' });
    const mildCount = await Assessment.countDocuments({ type: 'PHQ9', severity: 'Mild' });
    const moderateCount = await Assessment.countDocuments({ type: 'PHQ9', severity: 'Moderate' });
    const severeCount = await Assessment.countDocuments({ type: 'PHQ9', severity: { $in: ['Moderately Severe', 'Severe'] } });

    const severityDistribution = [
      { name: 'Minimal', value: minimalCount || 0 },
      { name: 'Mild', value: mildCount || 0 },
      { name: 'Moderate', value: moderateCount || 0 },
      { name: 'Severe', value: severeCount || 0 }
    ];

    // Mock/aggregate Peak Usage Hours
    const peakUsageHours = [
      { hour: '09:00 AM', bookings: 12 },
      { hour: '10:00 AM', bookings: 25 },
      { hour: '11:00 AM', bookings: 18 },
      { hour: '02:00 PM', bookings: 30 },
      { hour: '03:00 PM', bookings: 22 },
      { hour: '04:00 PM', bookings: 15 }
    ];

    // Top Specialization Searches
    const topSearches = [
      { name: 'Anxiety', count: 145 },
      { name: 'Academic Stress', count: 98 },
      { name: 'Sleep Issues', count: 82 },
      { name: 'Depression', count: 77 },
      { name: 'Burnout', count: 54 }
    ];

    res.json({
      cards: {
        totalStudents,
        totalDoctors,
        totalAppointments,
        totalAssessments,
        totalReviews
      },
      appointmentTrend,
      assessmentDistribution: [
        { name: 'PHQ-9 (Depression)', value: phqCount },
        { name: 'GAD-7 (Anxiety)', value: gadCount }
      ],
      severityDistribution,
      peakUsageHours,
      topSearches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getDoctorDashboard,
  getAdminDashboard
};
