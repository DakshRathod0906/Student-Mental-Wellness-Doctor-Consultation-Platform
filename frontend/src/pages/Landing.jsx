import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

const Landing = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  
  // Anonymous Assessment State
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(9).fill(null));
  const [score, setScore] = useState(null);
  const [severity, setSeverity] = useState('');
  const [interpretation, setInterpretation] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/doctors/featured');
        setFeaturedDoctors(data);
      } catch (err) {
        console.error('Failed to load featured doctors', err);
      }
    };
    fetchFeatured();
  }, []);

  const handleAnswerSelect = (value) => {
    const updated = [...answers];
    updated[currentStep] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate PHQ-9 score in browser state
      const totalScore = answers.reduce((sum, val) => sum + (val || 0), 0);
      setScore(totalScore);

      let sev = 'Minimal';
      let interp = 'Minimal or no depression symptoms. Monitor periodically.';
      if (totalScore >= 15) {
        sev = 'Severe';
        interp = 'Severe depression. Immediate clinical evaluation and counseling recommended.';
      } else if (totalScore >= 10) {
        sev = 'Moderate';
        interp = 'Moderate depression. We suggest speaking with our clinical consultants.';
      } else if (totalScore >= 5) {
        sev = 'Mild';
        interp = 'Mild symptoms. Support, self-care, and mindfulness guides are recommended.';
      }

      setSeverity(sev);
      setInterpretation(interp);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWizard = () => {
    setShowWizard(false);
    setCurrentStep(0);
    setAnswers(Array(9).fill(null));
    setScore(null);
  };

  return (
    <div style={{ backgroundColor: '#fafafa', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <header style={{
        height: '70px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ color: '#14b8a6', fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌿</span> WELLHEALTH
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/login')} className="btn-secondary">Log In</button>
          <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '48px'
      }}>
        <div style={{ flex: 1, minWidth: '320px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px 0', color: '#0f172a' }}>
            Track Your Mental Wellness.<br />
            <span style={{ color: '#14b8a6' }}>Connect With Trusted Professionals.</span><br />
            Build Better Habits.
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            A safe, supportive, and clinical wellness space designed specifically for college students. Assess your wellness score anonymously, log emotional journals, and coordinate sessions with certified clinicians.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px', borderRadius: '14px', backgroundColor: '#6366f1' }}>
              📊 Take Free Assessment
            </button>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px', borderRadius: '14px' }}>
              🔍 Find a Doctor
            </button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
          {/* Biophilic visual representation */}
          <div style={{
            width: '100%',
            maxWidth: '420px',
            height: '320px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', backgroundColor: '#14b8a6' }} />
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧘‍♀️</div>
            <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Your Trusted Wellness Companion</h4>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Empathy-focused care meets structural clinical precision to reduce cognitive load and support your campus life.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials or Timeline */}
      <section style={{ backgroundColor: '#ffffff', padding: '64px 32px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 800, margin: '0 0 48px 0' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>1. Create Account</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Quick sign up with your college email.</p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🩺</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>2. Take Assessment</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Complete self-assessments to understand your score.</p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>3. View Insights</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Monitor your wellness trend chart progressively.</p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>4. Book Doctor</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Schedule Jitsi video sessions with campus experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      {featuredDoctors.length > 0 && (
        <section style={{ padding: '64px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }}>Top Certified Consultants</h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 32px 0' }}>Empathetic clinical professionals available to schedule consults.</p>
          
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
            {featuredDoctors.map(doc => (
              <div key={doc._id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                minWidth: '280px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '20px' }}>🩺</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Dr. {doc.firstName} {doc.lastName}</h4>
                      <span style={{ fontSize: '12px', color: '#14b8a6', fontWeight: 600 }}>{doc.doctorProfile?.specialization}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.doctorProfile?.bio}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#eab308' }}>
                    ⭐ {doc.doctorProfile?.averageRating || '0'} ({doc.doctorProfile?.reviewCount || 0} reviews)
                  </span>
                  <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Immediate Support Hotline Drawer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '40px 32px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h4 style={{ color: '#14b8a6', margin: '0 0 12px 0', fontWeight: 700 }}>🛟 Need Immediate Support?</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '400px', lineHeight: 1.5 }}>
              If you are in danger or experiencing an acute mental health crisis, please reach out. Support lines are confidential, free, and available 24/7.
            </p>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
            <div>📞 <strong>Campus Hotline:</strong> +1 (800) 273-8255</div>
            <div style={{ marginTop: '4px' }}>💬 <strong>Crisis Support:</strong> Text HOME to 741741</div>
          </div>
        </div>
      </footer>

      {/* Anonymous Assessment Wizard Dialog */}
      {showWizard && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>PHQ-9 Depression Screener</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>🔒 In-Memory Anonymous Self-Test (Data not saved)</span>
              </div>
              <button onClick={resetWizard} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {score === null ? (
              <>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                  <div style={{ width: `${((currentStep + 1) / 9) * 100}%`, height: '100%', backgroundColor: '#14b8a6', transition: 'width 0.2s' }} />
                </div>

                {/* Question */}
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Question {currentStep + 1} of 9
                </p>
                <h4 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.4, minHeight: '60px', marginBottom: '24px' }}>
                  Over the last 2 weeks, how often have you been bothered by: {PHQ9_QUESTIONS[currentStep]}?
                </h4>

                {/* Answers Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { value: 0, label: "Not at all" },
                    { value: 1, label: "Several days" },
                    { value: 2, label: "More than half the days" },
                    { value: 3, label: "Nearly every day" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(option.value)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: answers[currentStep] === option.value ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                        backgroundColor: answers[currentStep] === option.value ? '#f0fdfa' : '#ffffff',
                        cursor: 'pointer',
                        fontWeight: answers[currentStep] === option.value ? 600 : 500,
                        transition: 'all 0.15s'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Wizard Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', borderRadius: '10px', opacity: currentStep === 0 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={answers[currentStep] === null}
                    className="btn-primary"
                    style={{ padding: '8px 16px', borderRadius: '10px', opacity: answers[currentStep] === null ? 0.5 : 1 }}
                  >
                    {currentStep === 8 ? "Submit & View" : "Next Question"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Assessment Completed</h4>
                <div style={{ margin: '16px 0', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Calculated Score</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: '#14b8a6', margin: '4px 0' }}>{score}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#0f172a' }}>Severity: {severity}</div>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
                  {interpretation}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => navigate('/register')} className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px' }}>
                    Save Score & Create Account
                  </button>
                  <button onClick={resetWizard} className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px' }}>
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
