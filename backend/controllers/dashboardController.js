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

    const upcomingAppointments = await Appointment.countDocuments({
      studentId: userId,
      status: { $in: ['pending', 'approved', 'in_progress'] },
      scheduledDate: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    // Fetch last 6 PHQ9 & GAD7 assessments sorted chronologically for trends chart
    const rawPhqTrend = await Assessment.find({ userId, type: 'PHQ9' })
      .sort({ createdAt: -1 })
      .limit(6);
    const phqTrend = rawPhqTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    const rawGadTrend = await Assessment.find({ userId, type: 'GAD7' })
      .sort({ createdAt: -1 })
      .limit(6);
    const gadTrend = rawGadTrend.reverse().map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score
    }));

    res.json({
      cards: {
        journalCount,
        latestPHQ9: latestPHQ9 ? latestPHQ9.score : null,
        latestPHQ9Severity: latestPHQ9 ? latestPHQ9.severity : null,
        latestGAD7: latestGAD7 ? latestGAD7.score : null,
        latestGAD7Severity: latestGAD7 ? latestGAD7.severity : null,
        latestAssessmentDate: latestPHQ9 ? latestPHQ9.createdAt : (latestGAD7 ? latestGAD7.createdAt : null),
        upcomingAppointments
      },
      phqTrend,
      gadTrend
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
