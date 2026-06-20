const Assessment = require('../models/Assessment');
const Notification = require('../models/Notification');

// Helper to interpret PHQ-9 score
const interpretPHQ9 = (score) => {
  if (score <= 4) return { severity: 'Minimal', interpretation: 'Minimal or no depression symptoms. Monitor periodically.' };
  if (score <= 9) return { severity: 'Mild', interpretation: 'Mild depression symptoms. Support, self-care, and watch.' };
  if (score <= 14) return { severity: 'Moderate', interpretation: 'Moderate depression symptoms. Recommend clinical evaluation and counseling.' };
  if (score <= 19) return { severity: 'Moderately Severe', interpretation: 'Moderately severe depression. Needs active treatment, therapy or counseling.' };
  return { severity: 'Severe', interpretation: 'Severe depression. Immediate clinical evaluation, counseling, and medical intervention required.' };
};

// Helper to interpret GAD-7 score
const interpretGAD7 = (score) => {
  if (score <= 4) return { severity: 'Minimal', interpretation: 'Minimal or no anxiety symptoms. Monitor periodically.' };
  if (score <= 9) return { severity: 'Mild', interpretation: 'Mild anxiety symptoms. Self-help strategies and active monitoring.' };
  if (score <= 14) return { severity: 'Moderate', interpretation: 'Moderate anxiety symptoms. Clinical evaluation and counseling recommended.' };
  return { severity: 'Severe', interpretation: 'Severe anxiety. Active treatment, therapy, and clinical intervention required.' };
};

// @desc    Submit a self-assessment (PHQ-9 or GAD-7)
// @route   POST /api/assessments
// @access  Private (Student)
const submitAssessment = async (req, res) => {
  try {
    const { type, answers } = req.body;

    if (!type || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Type (PHQ9/GAD7) and answers array are required' });
    }

    if (type === 'PHQ9' && answers.length !== 9) {
      return res.status(400).json({ message: 'PHQ-9 requires exactly 9 responses' });
    }

    if (type === 'GAD7' && answers.length !== 7) {
      return res.status(400).json({ message: 'GAD-7 requires exactly 7 responses' });
    }

    // Verify all answers are valid digits (0-3)
    const validAnswers = answers.every(ans => typeof ans === 'number' && ans >= 0 && ans <= 3);
    if (!validAnswers) {
      return res.status(400).json({ message: 'Each answer response must be a number between 0 and 3' });
    }

    // Calculate score
    const score = answers.reduce((total, val) => total + val, 0);

    // Interpret results
    let interpretationData;
    if (type === 'PHQ9') {
      interpretationData = interpretPHQ9(score);
    } else {
      interpretationData = interpretGAD7(score);
    }

    const assessment = await Assessment.create({
      userId: req.user.id,
      type,
      answers,
      score,
      severity: interpretationData.severity,
      interpretation: interpretationData.interpretation
    });

    // Create system notification
    await Notification.create({
      userId: req.user.id,
      title: 'Assessment Completed',
      message: `You have successfully completed a ${type} assessment. Score: ${score}, Severity: ${interpretationData.severity}.`,
      type: 'assessment_completed'
    });

    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student assessment history
// @route   GET /api/assessments/history
// @access  Private (Student)
const getAssessmentHistory = async (req, res) => {
  try {
    const history = await Assessment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAssessment,
  getAssessmentHistory
};
