import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notesText, setNotesText] = useState('');
  const [recText, setRecText] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeApp, setActiveApp] = useState(null);

  const fetchStatsAndSessions = async () => {
    try {
      const statsRes = await API.get('/dashboard/doctor');
      setStats(statsRes.data);

      const appRes = await API.get('/appointments');
      setAppointments(appRes.data);
    } catch (err) {
      setError('Failed to load doctor metrics');
    }
  };

  useEffect(() => {
    fetchStatsAndSessions();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.patch(`/appointments/${id}/approve`);
      setSuccess('Session approved successfully!');
      fetchStatsAndSessions();
    } catch (err) {
      setError('Failed to approve session');
    }
  };

  const handleStart = async (id, link) => {
    try {
      await API.patch(`/appointments/${id}/start`);
      window.open(link, '_blank');
      fetchStatsAndSessions();
    } catch (err) {
      setError('Failed to start session');
    }
  };

  const handleCompletePrompt = (app) => {
    setActiveApp(app);
    setNotesText('');
    setRecText('');
    setFollowUp(false);
    setFollowUpDate('');
    setShowNotesModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!notesText || !recText) {
      setError('Notes and recommendations are required');
      return;
    }
    try {
      // Create DoctorNote
      await API.post('/doctor-notes', {
        appointmentId: activeApp._id,
        studentId: activeApp.studentId?._id,
        notes: notesText,
        recommendations: recText,
        followUpRequired: followUp,
        followUpDate: followUp ? followUpDate : null
      });

      // Complete Appointment
      await API.patch(`/appointments/${activeApp._id}/complete`, { doctorNotes: notesText });

      setSuccess('Consultation completed and notes saved!');
      setShowNotesModal(false);
      fetchStatsAndSessions();
    } catch (err) {
      setError('Failed to complete session');
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.patch(`/appointments/${id}/cancel`);
      setSuccess('Session cancelled successfully.');
      fetchStatsAndSessions();
    } catch (err) {
      setError('Failed to cancel session');
    }
  };

  // Mock Assigned Students list with clinical data
  const studentsSummary = [
    { name: 'Daksh Rathod', phq: '10 (Mild)', gad: '8 (Mild)', pss: '18 (Moderate)', who: '64 (Good)', timeline: 'Jan: 18 → Feb: 15 → Mar: 12 → Apr: 10' },
    { name: 'Aarav Mehta', phq: '16 (Severe)', gad: '14 (Severe)', pss: '29 (High)', who: '40 (Poor)', timeline: 'Jan: 12 → Feb: 14 → Mar: 15 → Apr: 16' },
    { name: 'Ananya Iyer', phq: '4 (Minimal)', gad: '3 (Minimal)', pss: '10 (Low)', who: '84 (Good)', timeline: 'Jan: 6 → Feb: 5 → Mar: 4' }
  ];

  // Recent Student Activities feed
  const activities = [
    { title: 'Daksh Rathod completed PHQ-9 Assessment', time: '2 hours ago', badge: 'theme-phq9' },
    { title: 'Ananya Iyer logged mood "Very Happy"', time: '4 hours ago', badge: 'theme-who5' },
    { title: 'Daksh Rathod booked a consultation session', time: 'Yesterday', badge: 'theme-appointments' },
    { title: 'Aarav Mehta completed GAD-7 Assessment', time: 'Yesterday', badge: 'theme-gad7' }
  ];

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Doctor Command Center 🩺
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Monitor assigned student outcomes, log session notes, and configure availability slots.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#10b981', backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
          {success}
        </div>
      )}

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="bento-card theme-appointments" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Today's Sessions</h4>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.cards?.todayAppointments || 0}</div>
        </div>
        <div className="bento-card theme-doctornotes" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>This Week's Sessions</h4>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.cards?.upcomingAppointments || 0}</div>
        </div>
        <div className="bento-card theme-who5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Assigned Students</h4>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.cards?.totalPatients || 0}</div>
        </div>
        <div className="bento-card theme-notifications" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Pending Reviews</h4>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{appointments.filter(app => app.status === 'pending').length}</div>
        </div>
      </div>

      {/* Main Grid: Upcoming Bookings & Recent Student Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Session Bookings list */}
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Upcoming Session Bookings</h3>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No upcoming sessions scheduled</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appointments.map(app => (
                <div key={app._id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{app.studentId?.firstName} {app.studentId?.lastName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        📅 {new Date(app.scheduledDate).toLocaleDateString()} | ⏰ {app.scheduledTime}
                      </div>
                    </div>
                    <span className="status-badge status-available" style={{ textTransform: 'capitalize' }}>{app.status}</span>
                  </div>
                  
                  {/* Doctor actions based on status */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(app._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', backgroundColor: '#10b981' }}>Approve</button>
                        <button onClick={() => handleCancel(app._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', color: '#ef4444' }}>Decline</button>
                      </>
                    )}
                    {app.status === 'approved' && app.meetingLink && (
                      <button onClick={() => handleStart(app._id, app.meetingLink)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', backgroundColor: '#14b8a6' }}>Start Session</button>
                    )}
                    {app.status === 'in_progress' && (
                      <button onClick={() => handleCompletePrompt(app)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', backgroundColor: '#4f46e5' }}>Log Outcomes</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student activity feed */}
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Recent Student Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act, index) => (
              <div key={index} className={`bento-card ${act.badge}`} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>{act.title}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Student Health Summary table */}
      <div className="bento-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Assigned Students Wellness Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b' }}>
              <th style={{ padding: '12px 8px' }}>Student</th>
              <th style={{ padding: '12px 8px' }}>PHQ-9 (Depression)</th>
              <th style={{ padding: '12px 8px' }}>GAD-7 (Anxiety)</th>
              <th style={{ padding: '12px 8px' }}>PSS-10 (Stress)</th>
              <th style={{ padding: '12px 8px' }}>WHO-5 (Well-being)</th>
              <th style={{ padding: '12px 8px' }}>Assessment Timeline</th>
            </tr>
          </thead>
          <tbody>
            {studentsSummary.map((std, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{std.name}</td>
                <td style={{ padding: '12px 8px' }}>{std.phq}</td>
                <td style={{ padding: '12px 8px' }}>{std.gad}</td>
                <td style={{ padding: '12px 8px' }}>{std.pss}</td>
                <td style={{ padding: '12px 8px' }}>{std.who}</td>
                <td style={{ padding: '12px 8px', color: '#64748b', fontStyle: 'italic' }}>{std.timeline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete Session and Log Notes Modal */}
      {showNotesModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleCompleteSubmit} style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>Save Session Outcomes & Notes</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Log session diagnosis notes and rule recommendations.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Clinical Session Notes</label>
                <textarea 
                  value={notesText} 
                  onChange={(e) => setNotesText(e.target.value)} 
                  required 
                  rows="3"
                  placeholder="Student experiencing exam anxiety..."
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Recommendations</label>
                <textarea 
                  value={recText} 
                  onChange={(e) => setRecText(e.target.value)} 
                  required 
                  rows="2"
                  placeholder="Weekly meditation check-ins."
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={followUp} 
                  onChange={(e) => setFollowUp(e.target.checked)} 
                  id="followUp"
                />
                <label htmlFor="followUp" style={{ fontSize: '13px', fontWeight: 600 }}>Follow-up Consultation Required</label>
              </div>

              {followUp && (
                <div>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Follow-up Date</label>
                  <input 
                    type="date" 
                    value={followUpDate} 
                    onChange={(e) => setFollowUpDate(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowNotesModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" style={{ backgroundColor: '#4f46e5' }}>Save notes & complete</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
