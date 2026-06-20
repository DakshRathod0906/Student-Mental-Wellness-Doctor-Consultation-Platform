const Assessment = require('../models/Assessment');
const Notification = require('../models/Notification');

// Helper to interpret PHQ-9 score
const interpretPHQ9 = (score) => {
  if (score <= 4) return { severity: 'Minimal', interpretation: 'Minimal or no depression symptoms. Monitor periodically.', recommendation: 'Maintain healthy habits, daily journaling, and active self-care.' };
  if (score <= 9) return { severity: 'Mild', interpretation: 'Mild depression symptoms. Support, self-care, and watch.', recommendation: 'Maintain healthy habits, daily journaling, and active self-care.' };
  if (score <= 14) return { severity: 'Moderate', interpretation: 'Moderate depression symptoms. Recommend clinical evaluation and counseling.', recommendation: 'Consider scheduling a consultation with a wellness counselor.' };
  if (score <= 19) return { severity: 'Moderately Severe', interpretation: 'Moderately severe depression. Needs active treatment, therapy or counseling.', recommendation: 'Consider scheduling a consultation with a wellness counselor.' };
  return { severity: 'Severe', interpretation: 'Severe depression. Immediate clinical evaluation, counseling, and medical intervention required.', recommendation: 'Consider scheduling a consultation with a wellness counselor.' };
};

// Helper to interpret GAD-7 score
const interpretGAD7 = (score) => {
  if (score <= 4) return { severity: 'Minimal', interpretation: 'Minimal or no anxiety symptoms. Monitor periodically.', recommendation: 'Use self-help mindfulness techniques and track your mood trends.' };
  if (score <= 9) return { severity: 'Mild', interpretation: 'Mild anxiety symptoms. Self-help strategies and active monitoring.', recommendation: 'Use self-help mindfulness techniques and track your mood trends.' };
  if (score <= 14) return { severity: 'Moderate', interpretation: 'Moderate anxiety symptoms. Clinical evaluation and counseling recommended.', recommendation: 'Consultation recommended for professional support.' };
  return { severity: 'Severe', interpretation: 'Severe anxiety. Active treatment, therapy, and clinical intervention required.', recommendation: 'Consultation recommended for professional support.' };
};

// Helper to interpret PSS-10 score
const interpretPSS10 = (score) => {
  if (score <= 13) return { severity: 'Minimal', interpretation: 'Low perceived stress levels.', recommendation: 'Practice relaxation exercises and regular physical activity.' };
  if (score <= 26) return { severity: 'Moderate', interpretation: 'Moderate perceived stress levels.', recommendation: 'Practice relaxation exercises and regular physical activity.' };
  return { severity: 'Severe', interpretation: 'High perceived stress levels.', recommendation: 'Consider booking a wellness consultation to manage stressors.' };
};

// Helper to interpret WHO-5 score
const interpretWHO5 = (score) => {
  const percentage = score * 4;
  if (percentage < 50) return { severity: 'Concerning', interpretation: 'Poor well-being. Potential risk of depression.', recommendation: 'Consultation recommended to explore wellness practices.' };
  return { severity: 'Good', interpretation: 'Good well-being index.', recommendation: 'Continue maintaining your healthy lifestyle habits.' };
};

// @desc    Submit a self-assessment (PHQ-9, GAD-7, PSS-10, or WHO-5)
// @route   POST /api/assessments
// @access  Private (Student)
const submitAssessment = async (req, res) => {
  try {
    const { type, answers } = req.body;

    if (!type || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Type and answers array are required' });
    }

    if (type === 'PHQ9' && answers.length !== 9) {
      return res.status(400).json({ message: 'PHQ-9 requires exactly 9 responses' });
    }

    if (type === 'GAD7' && answers.length !== 7) {
      return res.status(400).json({ message: 'GAD-7 requires exactly 7 responses' });
    }

    if (type === 'PSS10' && answers.length !== 10) {
      return res.status(400).json({ message: 'PSS-10 requires exactly 10 responses' });
    }

    if (type === 'WHO5' && answers.length !== 5) {
      return res.status(400).json({ message: 'WHO-5 requires exactly 5 responses' });
    }

    // Verify all answers are valid digits based on type
    const maxVal = type === 'WHO5' ? 5 : (type === 'PSS10' ? 4 : 3);
    const validAnswers = answers.every(ans => typeof ans === 'number' && ans >= 0 && ans <= maxVal);
    if (!validAnswers) {
      return res.status(400).json({ message: `Each answer response must be a number between 0 and ${maxVal}` });
    }

    // Calculate score
    const score = answers.reduce((total, val) => total + val, 0);

    // Interpret results
    let interpretationData;
    if (type === 'PHQ9') {
      interpretationData = interpretPHQ9(score);
    } else if (type === 'GAD7') {
      interpretationData = interpretGAD7(score);
    } else if (type === 'PSS10') {
      interpretationData = interpretPSS10(score);
    } else {
      interpretationData = interpretWHO5(score);
    }

    const assessment = await Assessment.create({
      userId: req.user.id,
      type,
      answers,
      score,
      severity: interpretationData.severity,
      interpretation: interpretationData.interpretation,
      recommendation: interpretationData.recommendation
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
