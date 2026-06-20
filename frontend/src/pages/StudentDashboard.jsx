import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(localStorage.getItem('dailyMood') || '');
  const [moodSuccess, setMoodSuccess] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const fetchStats = async () => {
    try {
      const statsRes = await API.get('/dashboard/student');
      setData(statsRes.data);

      const appRes = await API.get('/appointments');
      setAppointments(appRes.data);

      const journalRes = await API.get('/journals');
      setJournals(journalRes.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
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

  const upcomingApp = appointments.find(app => ['pending', 'approved', 'in_progress'].includes(app.status));

  const moodDetails = [
    { emoji: '😊', label: 'Great', color: '#f0fdf4', border: '#10b981' },
    { emoji: '🙂', label: 'Good', color: '#f8fafc', border: '#94a3b8' },
    { emoji: '😐', label: 'Okay', color: '#fcf8f2', border: '#f97316' },
    { emoji: '😔', label: 'Low', color: '#eff6ff', border: '#3b82f6' },
    { emoji: '😢', label: 'Very Low', color: '#fef2f2', border: '#ef4444' }
  ];

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '140px', width: '100%', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
        </div>
      </div>
    );
  }

  const wellnessIdx = data?.cards?.wellnessIndex || 74;
  const indexCat = data?.cards?.indexCategory || 'Good';

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
            Good Morning, {user?.firstName || 'Daksh'} 👋
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>Here is your wellness overview for today.</p>
        </div>
        
        {/* Quick Actions (Top Right) */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/journals')}
            className="btn-primary"
            style={{ backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📝 + New Journal
          </button>
          <button 
            onClick={() => setShowAssessmentModal(true)}
            className="btn-primary"
            style={{ backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🩺 + Take Assessment
          </button>
          <button 
            onClick={() => navigate('/appointments')}
            className="btn-primary"
            style={{ backgroundColor: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📅 + Book Appointment
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Hero Section: Wellness Index Card */}
      <div className="bento-card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid #334155',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wellness Summary</span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0' }}>
            Wellness Index: <span style={{ color: '#10b981' }}>{wellnessIdx}</span>/100
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>
            Your overall index is classified as <strong style={{ color: '#ffffff' }}>{indexCat}</strong>.
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '18px', fontWeight: 700 }}>
            <span>↑</span> +8 points
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>since last month</span>
        </div>
      </div>

      {/* Section 2: 4 cards in one row (Score cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div className="bento-card theme-phq9" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>PHQ-9 (Depression)</h3>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {data?.cards?.latestPHQ9 !== null ? data.cards.latestPHQ9 : 'N/A'}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
            {data?.cards?.latestPHQ9Severity || 'Pending Test'}
          </div>
        </div>

        <div className="bento-card theme-gad7" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>GAD-7 (Anxiety)</h3>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {data?.cards?.latestGAD7 !== null ? data.cards.latestGAD7 : 'N/A'}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>
            {data?.cards?.latestGAD7Severity || 'Pending Test'}
          </div>
        </div>

        <div className="bento-card theme-pss10" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>PSS-10 (Stress)</h3>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {data?.cards?.latestPSS10 !== null ? data.cards.latestPSS10 : 'N/A'}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#f97316', fontWeight: 600 }}>
            {data?.cards?.latestPSS10Severity || 'Pending Test'}
          </div>
        </div>

        <div className="bento-card theme-who5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>WHO-5 (Well-being)</h3>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {data?.cards?.latestWHO5 !== null ? data.cards.latestWHO5 : 'N/A'}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
            {data?.cards?.latestWHO5Severity || 'Pending Test'}
          </div>
        </div>

      </div>

      {/* Section 3: 3-column Layout (Mood Check-in, Upcoming Appointment, Recent Activities) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Mood Check-In Widget */}
        <div className="bento-card theme-journals" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Mood Check-In</h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>Log your daily mood in one click to maintain your streak.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
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
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{m.label}</span>
              </button>
            ))}
          </div>
          {moodSuccess && (
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, textAlign: 'center', marginTop: '12px' }}>
              ✓ Daily mood check-in registered!
            </div>
          )}
        </div>

        {/* Upcoming Appointment Status */}
        <div className="bento-card theme-appointments" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Next Consultation</h3>
            {upcomingApp ? (
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Dr. {upcomingApp.doctorId?.firstName} {upcomingApp.doctorId?.lastName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  📅 {new Date(upcomingApp.scheduledDate).toLocaleDateString()} at {upcomingApp.scheduledTime}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className="status-badge status-available">{upcomingApp.status}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '14px' }}>
                No consultations booked. Need a clinical opinion?
              </div>
            )}
          </div>
          {!upcomingApp && (
            <button onClick={() => navigate('/appointments')} className="btn-secondary" style={{ width: '100%', marginTop: '12px' }}>
              Browse Available Doctors
            </button>
          )}
        </div>

        {/* Recent Activities list */}
        <div className="bento-card theme-notifications" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Recent Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ color: '#16a34a', fontWeight: 600 }}>✓ Journal Entry Added</div>
              <div style={{ color: '#16a34a', fontWeight: 600 }}>✓ PHQ-9 Assessment Completed</div>
              <div style={{ color: '#475569' }}>□ GAD-7 Screener (Due soon)</div>
              <div style={{ color: '#475569' }}>□ Check-in weekly exercise log</div>
            </div>
          </div>
        </div>

      </div>

      {/* Section 4: Trend Charts */}
      <div className="bento-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Longitudinal Screener Outcomes</h3>
        {data && (!data.phqTrend?.length && !data.gadTrend?.length) ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Not enough data. Complete assessments to visualize trends.
          </div>
        ) : (
          data && (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} allowDuplicatedCategory={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 30]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                  <Legend />
                  <Line name="Depression (PHQ-9)" type="monotone" data={data.phqTrend} dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                  <Line name="Anxiety (GAD-7)" type="monotone" data={data.gadTrend} dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line name="Stress (PSS-10)" type="monotone" data={data.pssTrend} dataKey="score" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                  <Line name="Well-being (WHO-5)" type="monotone" data={data.whoTrend} dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        )}
      </div>

      {/* Section 5: Guides, Resources, Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="bento-card">
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700 }}>Wellness Guides</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
            <li>Exam stress management checklist (5 mins read)</li>
            <li>Sleep hygiene parameters (3 mins read)</li>
          </ul>
        </div>
        <div className="bento-card">
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700 }}>University Announcements</h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            Wellness center is open this weekend from 9:00 AM to 5:00 PM for walk-ins.
          </p>
        </div>
      </div>

      {/* Take Assessment Selector Modal */}
      {showAssessmentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>Choose Assessment Screener</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select a clinically validated tool to begin.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { setShowAssessmentModal(false); navigate('/assessments/phq9'); }} className="btn-secondary" style={{ textAlign: 'left', borderColor: '#ef4444' }}>🔴 PHQ-9 (Depression Screener)</button>
              <button onClick={() => { setShowAssessmentModal(false); navigate('/assessments/gad7'); }} className="btn-secondary" style={{ textAlign: 'left', borderColor: '#6366f1' }}>🟣 GAD-7 (Anxiety Screener)</button>
              <button onClick={() => { setShowAssessmentModal(false); navigate('/assessments/pss10'); }} className="btn-secondary" style={{ textAlign: 'left', borderColor: '#f97316' }}>🟠 PSS-10 (Perceived Stress)</button>
              <button onClick={() => { setShowAssessmentModal(false); navigate('/assessments/who5'); }} className="btn-secondary" style={{ textAlign: 'left', borderColor: '#10b981' }}>🟢 WHO-5 (Well-being Index)</button>
            </div>
            <button onClick={() => setShowAssessmentModal(false)} className="btn-secondary" style={{ width: '100%', marginTop: '16px', backgroundColor: '#f1f5f9' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
