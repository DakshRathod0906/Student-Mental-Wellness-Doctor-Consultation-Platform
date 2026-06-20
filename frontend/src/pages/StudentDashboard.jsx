import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Profile from './Profile';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMood, setSelectedMood] = useState(localStorage.getItem('dailyMood') || '');
  const [moodSuccess, setMoodSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const statsRes = await API.get('/dashboard/student');
      setData(statsRes.data);

      const appRes = await API.get('/appointments');
      setAppointments(appRes.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    localStorage.setItem('dailyMood', mood);
    setMoodSuccess(true);
    setTimeout(() => setMoodSuccess(false), 2000);
  };

  // Determine Wellness Status based on latest assessment scores
  const getWellnessStatus = (phq, gad) => {
    if (phq === null && gad === null) return { status: 'Evaluating', color: '#6366f1', text: 'Take an assessment to see your status.' };
    const maxScore = Math.max(phq || 0, gad || 0);
    if (phq >= 15 || gad >= 15) return { status: 'High Priority', color: '#ef4444', text: 'We recommend scheduling a consultation soon.' };
    if (phq >= 10 || gad >= 10) return { status: 'Needs Attention', color: '#f97316', text: 'A quick talk with our counselor might help.' };
    return { status: 'Stable', color: '#10b981', text: 'You are doing great! Keep up your healthy habits.' };
  };

  const wellness = data?.cards ? getWellnessStatus(data.cards.latestPHQ9, data.cards.latestGAD7) : { status: 'Evaluating', color: '#6366f1', text: 'Pending assessment.' };

  // Check if assessment was completed in last 14 days
  const hasAssessmentIn14Days = () => {
    if (!data?.cards?.latestAssessmentDate) return false;
    const diffTime = Math.abs(new Date() - new Date(data.cards.latestAssessmentDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  // Filter next upcoming approved or pending appointment
  const upcomingApp = appointments.find(app => ['pending', 'approved', 'in_progress'].includes(app.status));

  // Check if there is an appointment tomorrow
  const isAppointmentTomorrow = () => {
    if (!upcomingApp) return false;
    const appDate = new Date(upcomingApp.scheduledDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return appDate.toDateString() === tomorrow.toDateString() || appDate.toDateString() === new Date().toDateString();
  };

  const resources = [
    { title: "Managing Exam Stress", category: "Stress", readTime: "5 min", icon: "🧠" },
    { title: "Better Sleep Habits", category: "Sleep", readTime: "3 min", icon: "😴" },
    { title: "Dealing with Burnout", category: "Stress", readTime: "6 min", icon: "🔥" },
    { title: "Mindfulness and Breathing", category: "Anxiety", readTime: "4 min", icon: "🧘" }
  ];

  const moodDetails = [
    { emoji: '😊', label: 'Happy', color: '#f0fdf4', border: '#10b981' },
    { emoji: '😐', label: 'Neutral', color: '#f8fafc', border: '#94a3b8' },
    { emoji: '😔', label: 'Sad', color: '#eff6ff', border: '#3b82f6' },
    { emoji: '😟', label: 'Worried', color: '#fffbeb', border: '#f59e0b' },
    { emoji: '😴', label: 'Tired', color: '#faf5ff', border: '#8b5cf6' }
  ];

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
            Hello, {user?.firstName} 👋
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>How are you feeling today?</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: activeTab === 'overview' ? 'none' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'overview' ? '#14b8a6' : '#ffffff',
              color: activeTab === 'overview' ? '#ffffff' : '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            📊 Overview
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: activeTab === 'settings' ? 'none' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'settings' ? '#14b8a6' : '#ffffff',
              color: activeTab === 'settings' ? '#ffffff' : '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="bento-card">
          <Profile />
        </div>
      ) : (
        <>
          {/* Empathetic Reminder Banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {data && !hasAssessmentIn14Days() && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <span style={{ color: '#78350f', fontSize: '14px', fontWeight: 500 }}>
                    You haven't completed a wellness self-assessment in over 14 days. Take a quick check to monitor your health.
                  </span>
                </div>
                <a href="/assessments" className="btn-primary" style={{ textDecoration: 'none', backgroundColor: '#d97706', fontSize: '13px' }}>
                  Take Assessment
                </a>
              </div>
            )}

            {isAppointmentTomorrow() && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <span style={{ color: '#14532d', fontSize: '14px', fontWeight: 600 }}>
                    Appointment Tomorrow: Session scheduled with Dr. {upcomingApp.doctorId.firstName} {upcomingApp.doctorId.lastName} at {upcomingApp.scheduledTime}.
                  </span>
                </div>
                {upcomingApp.status === 'approved' && upcomingApp.meetingLink && (
                  <button 
                    onClick={() => window.open(upcomingApp.meetingLink, '_blank')}
                    className="btn-primary" 
                    style={{ backgroundColor: '#16a34a', fontSize: '13px' }}
                  >
                    Join Consultation
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Premium Hero Info & Mood Tracker Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* Wellness Status Bento Card */}
            <div className="bento-card" style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)',
              border: '1px solid #14b8a633',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#14b8a6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wellness Snapshot</span>
                <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 2px 0', color: '#0f172a' }}>
                  Status: <span style={{ color: wellness.color }}>{wellness.status}</span>
                </h3>
                <p style={{ color: '#475569', fontSize: '13px', margin: '4px 0 16px 0', lineHeight: 1.4 }}>{wellness.text}</p>
              </div>

              {data?.cards && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', borderTop: '1px solid #14b8a615', paddingTop: '12px' }}>
                  <div>PHQ-9: <strong style={{ color: '#0f172a' }}>{data.cards.latestPHQ9Severity || 'None'}</strong></div>
                  <div>GAD-7: <strong style={{ color: '#0f172a' }}>{data.cards.latestGAD7Severity || 'None'}</strong></div>
                  <div>Last Updated: <strong style={{ color: '#0f172a' }}>{data.cards.latestAssessmentDate ? new Date(data.cards.latestAssessmentDate).toLocaleDateString() : 'Never'}</strong></div>
                </div>
              )}
            </div>

            {/* Interactive Mood Tracker Bento Card */}
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Daily Mood Tracker</h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>Log your current emotional state in one click.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
                {moodDetails.map(m => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodSelect(m.emoji)}
                    style={{
                      border: selectedMood === m.emoji ? `2px solid ${m.border}` : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      flex: 1,
                      padding: '8px 4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: selectedMood === m.emoji ? m.color : '#ffffff',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '24px', marginBottom: '4px' }}>{m.emoji}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{m.label}</span>
                  </button>
                ))}
              </div>
              {moodSuccess && (
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, textAlign: 'center', marginTop: '6px' }}>Check-in logged!</div>
              )}
            </div>

          </div>

          {/* Stats Cards Bento Row */}
          {data && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '-12px', marginBottom: '12px' }}>
              <StatCard title="Total Journals" value={data.cards.journalCount} icon="📝" color="#6366f1" />
              <StatCard title="PHQ-9 Score" value={data.cards.latestPHQ9 !== null ? `${data.cards.latestPHQ9} (${data.cards.latestPHQ9Severity})` : 'None'} icon="🩺" color="#14b8a6" />
              <StatCard title="GAD-7 Score" value={data.cards.latestGAD7 !== null ? `${data.cards.latestGAD7} (${data.cards.latestGAD7Severity})` : 'None'} icon="🧠" color="#8b5cf6" />
              <StatCard title="Upcoming Bookings" value={data.cards.upcomingAppointments} icon="📅" color="#f97316" />
            </div>
          )}

          {/* Wellness Trends & Next Consultation Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Trends Chart */}
            <div className="bento-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Mental Wellness Trends</h3>
              {data && (data.phqTrend.length === 0 && data.gadTrend.length === 0) ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  Start your wellness journey by taking your first assessment.
                </div>
              ) : (
                data && (
                  <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} allowDuplicatedCategory={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 27]} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                        <Legend />
                        <Line name="Depression (PHQ-9)" type="monotone" data={data.phqTrend} dataKey="score" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line name="Anxiety (GAD-7)" type="monotone" data={data.gadTrend} dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
            </div>

            {/* Upcoming Appointment Details */}
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Next Consultation Session</h3>
                {upcomingApp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🩺
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                          Dr. {upcomingApp.doctorId.firstName} {upcomingApp.doctorId.lastName}
                        </h4>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          {upcomingApp.doctorId.doctorProfile?.specialization || 'Clinical Consultant'}
                        </span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '14px' }}>
                      <div>📅 <strong>Date:</strong> {new Date(upcomingApp.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div style={{ marginTop: '6px' }}>⏰ <strong>Time:</strong> {upcomingApp.scheduledTime} ({upcomingApp.duration} minutes)</div>
                      <div style={{ marginTop: '6px' }}>🏷️ <strong>Status:</strong> <span style={{
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        color: upcomingApp.status === 'approved' ? '#10b981' : (upcomingApp.status === 'pending' ? '#f59e0b' : '#3b82f6')
                      }}>{upcomingApp.status}</span></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                    <span>You have no upcoming consultations scheduled.</span>
                    <a href="/doctors" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '13px' }}>
                      Find a Doctor
                    </a>
                  </div>
                )}
              </div>

              {upcomingApp && upcomingApp.status === 'approved' && upcomingApp.meetingLink && (
                <button 
                  onClick={() => window.open(upcomingApp.meetingLink, '_blank')}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '16px' }}
                >
                  Join Consultation Room
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bento Row: Self-care Checklist & Hotline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Self-care Activity Progress (Inspired by Mindo Active Path) */}
            <div className="bento-card">
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Self-Care Active Path</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>Track your weekly wellness progress habits.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <strong>🧘 Meditation</strong>
                    <span style={{ color: '#14b8a6', fontWeight: 600 }}>50% Complete</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '50%', height: '100%', backgroundColor: '#14b8a6', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <strong>📝 Journaling</strong>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>85% Complete</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', backgroundColor: '#6366f1', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <strong>🏃 Physical Activity</strong>
                    <span style={{ color: '#f97316', fontWeight: 600 }}>60% Complete</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', backgroundColor: '#f97316', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resources list */}
            <div className="bento-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Mental Wellness Guides</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.map((res, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#ffffff',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{res.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{res.title}</h4>
                        <span style={{
                          fontSize: '11px',
                          color: '#14b8a6',
                          backgroundColor: '#f0fdfa',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>{res.category}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>⏱️ {res.readTime}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Hotline section */}
          <div className="bento-card" style={{ marginTop: '24px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>🛟 Need Immediate Support?</h3>
              <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>Campus Helplines and crisis chat channels are free, confidential, and active 24/7.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => window.open('tel:18002738255')} className="btn-primary" style={{ backgroundColor: '#ef4444' }}>📞 Call Campus Line</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
