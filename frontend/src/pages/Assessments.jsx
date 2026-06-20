import React, { useEffect, useState } from 'react';
import API from '../services/api';

const phq9Questions = [
  'Little interest or pleasure in doing things?',
  'Feeling down, depressed, or hopeless?',
  'Trouble falling or staying asleep, or sleeping too much?',
  'Feeling tired or having little energy?',
  'Poor appetite or overeating?',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
  'Trouble concentrating on things, such as reading the newspaper or watching television?',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?',
  'Thoughts that you would be better off dead or of hurting yourself in some way?'
];

const gad7Questions = [
  'Feeling nervous, anxious, or on edge?',
  'Not being able to stop or control worrying?',
  'Worrying too much about different things?',
  'Trouble relaxing?',
  'Being so restless that it is hard to sit still?',
  'Becoming easily annoyed or irritable?',
  'Feeling afraid, as if something awful might happen?'
];

const scoringOptions = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 }
];

const Assessments = () => {
  const [history, setHistory] = useState([]);
  const [activeType, setActiveType] = useState(null); // 'PHQ9' or 'GAD7'
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Local result display state to review after completion
  const [latestResult, setLatestResult] = useState(null);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/assessments/history');
      setHistory(data);
    } catch (err) {
      setError('Failed to fetch history logs');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStart = (type) => {
    setActiveType(type);
    setCurrentStep(0);
    setAnswers(type === 'PHQ9' ? new Array(9).fill(null) : new Array(7).fill(null));
    setError('');
    setSuccess('');
    setLatestResult(null);
  };

  const handleSelectAnswer = (value) => {
    const updated = [...answers];
    updated[currentStep] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    const totalQuestions = activeType === 'PHQ9' ? 9 : 7;
    if (currentStep < totalQuestions - 1) {
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
    setError('');
    setSuccess('');

    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      const { data } = await API.post('/assessments', {
        type: activeType,
        answers
      });
      setLatestResult(data);
      setSuccess(`Completed! Your score is ${data.score} (${data.severity}).`);
      setActiveType(null);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const activeQuestions = activeType === 'PHQ9' ? phq9Questions : gad7Questions;
  const totalQuestions = activeType === 'PHQ9' ? 9 : 7;

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>Mental Health Self-Assessments</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Empathy-focused, clinical screening tools to monitor your anxiety and depression trends securely.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {success && !activeType && (
        <div style={{ color: '#10b981', backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
          {success}
        </div>
      )}

      {/* Result Display Card (Empathetic snapshot) */}
      {latestResult && (
        <div className="bento-card" style={{ marginBottom: '32px', textAlign: 'center', maxWidth: '540px', margin: '0 auto 32px auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px 0' }}>Assessment Score Summary</h3>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Severity classification</span>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#14b8a6', margin: '4px 0' }}>{latestResult.score}</div>
            <strong style={{ color: '#0f172a', textTransform: 'uppercase', fontSize: '14px' }}>{latestResult.severity}</strong>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
            {latestResult.interpretation}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setLatestResult(null)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '10px' }}>Close</button>
            <a href="/doctors" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 20px', borderRadius: '10px' }}>Find a Doctor</a>
          </div>
        </div>
      )}

      {!activeType ? (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {/* PHQ-9 Card */}
          <div className="bento-card" style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🩺</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>PHQ-9 Depression Screener</h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                9 standard diagnostic questions to assess emotional states and evaluate depressive symptoms.
              </p>
            </div>
            <button onClick={() => handleStart('PHQ9')} className="btn-primary" style={{ width: '100%', padding: '12px' }}>Start PHQ-9</button>
          </div>

          {/* GAD-7 Card */}
          <div className="bento-card" style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧠</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>GAD-7 Anxiety Screener</h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                7 standard diagnostic questions to identify and evaluate general anxiety levels.
              </p>
            </div>
            <button onClick={() => handleStart('GAD7')} className="btn-primary" style={{ width: '100%', padding: '12px', backgroundColor: '#6366f1' }}>Start GAD-7</button>
          </div>
        </div>
      ) : (
        /* Wizard Stepper Card */
        <div className="bento-card" style={{ marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
              Screener: {activeType === 'PHQ9' ? 'PHQ-9 (Depression)' : 'GAD-7 (Anxiety)'}
            </h3>
            <button onClick={() => setActiveType(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Exit Test</button>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%`, height: '100%', backgroundColor: activeType === 'PHQ9' ? '#14b8a6' : '#6366f1', transition: 'width 0.2s' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Question {currentStep + 1} of {totalQuestions}
            </p>
            <h4 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.5, minHeight: '60px', marginBottom: '24px', color: '#0f172a' }}>
              Over the last 2 weeks, how often have you been bothered by: {activeQuestions[currentStep]}
            </h4>

            {/* Answer Selector */}
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
                    border: answers[currentStep] === opt.value ? (activeType === 'PHQ9' ? '2px solid #14b8a6' : '2px solid #6366f1') : '1px solid #e2e8f0',
                    backgroundColor: answers[currentStep] === opt.value ? (activeType === 'PHQ9' ? '#f0fdfa' : '#eef2ff') : '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: answers[currentStep] === opt.value ? 600 : 500,
                    transition: 'all 0.15s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Wizard Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="btn-secondary"
                style={{ padding: '8px 20px', borderRadius: '10px', opacity: currentStep === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>
              {currentStep < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={answers[currentStep] === null}
                  className="btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '10px', opacity: answers[currentStep] === null ? 0.5 : 1 }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={answers.includes(null)}
                  className="btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '10px', backgroundColor: '#10b981', opacity: answers.includes(null) ? 0.5 : 1 }}
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* History Grid */}
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800 }}>Assessment Logs</h2>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px' }}>
            No past assessment scores logged. Select a test above to begin.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {history.map(item => (
              <div key={item._id} className="bento-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: item.type === 'PHQ9' ? '#f0fdfa' : '#eef2ff',
                    color: item.type === 'PHQ9' ? '#0d9488' : '#4f46e5'
                  }}>{item.type}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                  Score: {item.score}
                </h3>
                <h5 style={{ margin: '0 0 12px 0', color: '#475569', textTransform: 'capitalize', fontSize: '13px', fontWeight: 600 }}>
                  Severity: {item.severity}
                </h5>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>{item.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Assessments;
