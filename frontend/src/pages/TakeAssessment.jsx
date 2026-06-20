import React, { useState } from 'react';
import API from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things?',
  'Feeling down, depressed, or hopeless?',
  'Trouble falling or staying asleep, or sleeping too much?',
  'Feeling tired or having little energy?',
  'Poor appetite or overeating?',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
  'Trouble concentrating on things, such as reading?',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite?',
  'Thoughts that you would be better off dead or of hurting yourself?'
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge?',
  'Not being able to stop or control worrying?',
  'Worrying too much about different things?',
  'Trouble relaxing?',
  'Being so restless that it is hard to sit still?',
  'Becoming easily annoyed or irritable?',
  'Feeling afraid, as if something awful might happen?'
];

const PSS10_QUESTIONS = [
  'Been upset because of something that happened unexpectedly?',
  'Felt that you were unable to control the important things in your life?',
  'Felt nervous and "stressed"?',
  'Felt confident about your ability to handle your personal problems?', // reversed
  'Felt that things were going your way?', // reversed
  'Found that you could not cope with all the things that you had to do?',
  'Been able to control irritations in your life?', // reversed
  'Felt that you were on top of things?', // reversed
  'Been angered because of things that were outside of your control?',
  'Felt difficulties were piling up so high that you could not overcome them?'
];

const WHO5_QUESTIONS = [
  'I have felt cheerful and in good spirits.',
  'I have felt calm and relaxed.',
  'I have felt active and vigorous.',
  'I have felt fresh and rested.',
  'My daily life has been filled with things that interest me.'
];

const TakeAssessment = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const screenerType = type?.toUpperCase() || 'PHQ9';

  let questions = PHQ9_QUESTIONS;
  let scoringOptions = [
    { label: 'Not at all', value: 0 },
    { label: 'Several days', value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day', value: 3 }
  ];

  if (screenerType === 'GAD7') {
    questions = GAD7_QUESTIONS;
  } else if (screenerType === 'PSS10') {
    questions = PSS10_QUESTIONS;
    scoringOptions = [
      { label: 'Never', value: 0 },
      { label: 'Almost Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Fairly Often', value: 3 },
      { label: 'Very Often', value: 4 }
    ];
  } else if (screenerType === 'WHO5') {
    questions = WHO5_QUESTIONS;
    scoringOptions = [
      { label: 'At no time', value: 0 },
      { label: 'Some of the time', value: 1 },
      { label: 'Less than half of the time', value: 2 },
      { label: 'More than half of the time', value: 3 },
      { label: 'Most of the time', value: 4 },
      { label: 'All of the time', value: 5 }
    ];
  }

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSelectAnswer = (val) => {
    const updated = [...answers];
    updated[currentStep] = val;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      // Invert reverse items for PSS-10 (Index 3, 4, 6, 7 are Q4, Q5, Q7, Q8)
      let finalAnswers = [...answers];
      if (screenerType === 'PSS10') {
        const reverseIndices = [3, 4, 6, 7];
        finalAnswers = answers.map((ans, idx) => {
          if (reverseIndices.includes(idx)) {
            return 4 - ans;
          }
          return ans;
        });
      }

      const { data } = await API.post('/assessments', {
        type: screenerType,
        answers: finalAnswers
      });
      setResult(data);
    } catch (err) {
      setError('Failed to submit assessment answers');
    }
  };

  const pct = Math.round(((currentStep + 1) / questions.length) * 100);
  const estMinutes = Math.max(1, Math.round(((questions.length - (currentStep + 1)) * 12) / 60));

  // Determine screener theme border color
  const themeClass = screenerType === 'PHQ9' ? 'theme-phq9' : (screenerType === 'GAD7' ? 'theme-gad7' : (screenerType === 'PSS10' ? 'theme-pss10' : 'theme-who5'));

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Result Display */}
      {result ? (
        <div className={`bento-card ${themeClass}`} style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Assessment Outcomes</h2>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', margin: '16px 0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Severity classification</span>
            <div style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0', color: '#0f172a' }}>{result.score}</div>
            <strong style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0ea5e9' }}>{result.severity}</strong>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>{result.interpretation}</p>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
            💡 Recommendation: {result.recommendation}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/assessments')} className="btn-secondary">Assessments Hub</button>
            <button onClick={() => navigate('/appointments')} className="btn-primary" style={{ backgroundColor: '#06b6d4' }}>Book Consultation</button>
          </div>
        </div>
      ) : (
        /* Stepper Screener Wizard */
        <div className={`bento-card ${themeClass}`} style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{screenerType} Screener</h3>
            <button onClick={() => navigate('/assessments')} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Exit</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>⏱️ {estMinutes}m remaining</span>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#0ea5e9', transition: 'width 0.2s' }} />
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.5, minHeight: '60px', color: '#0f172a', marginBottom: '24px' }}>
            {questions[currentStep]}
          </h4>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {scoringOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectAnswer(opt.value)}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: answers[currentStep] === opt.value ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                  backgroundColor: answers[currentStep] === opt.value ? '#f0f9ff' : '#ffffff',
                  fontWeight: answers[currentStep] === opt.value ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
            <button 
              onClick={handlePrev} 
              disabled={currentStep === 0} 
              className="btn-secondary"
              style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
            >
              Previous
            </button>
            {currentStep < questions.length - 1 ? (
              <button 
                onClick={handleNext} 
                disabled={answers[currentStep] === null} 
                className="btn-primary"
                style={{ opacity: answers[currentStep] === null ? 0.5 : 1 }}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={answers.includes(null)} 
                className="btn-primary"
                style={{ backgroundColor: '#10b981', opacity: answers.includes(null) ? 0.5 : 1 }}
              >
                Submit Screener
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TakeAssessment;
