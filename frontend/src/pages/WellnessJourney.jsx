import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WellnessJourney = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [journals, setJournals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await API.get('/dashboard/student');
        setData(statsRes.data);

        const journalRes = await API.get('/journals');
        setJournals(journalRes.data);

        const appRes = await API.get('/appointments');
        setAppointments(appRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '200px', width: '100%' }} />
      </div>
    );
  }

  const wellnessIdx = data?.cards?.wellnessIndex || 74;
  const indexCat = data?.cards?.indexCategory || 'Good';

  // Heatmap helper (30 blocks representing journal submissions)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    // mock active days
    const activeDays = [2, 5, 6, 8, 9, 12, 13, 15, 16, 19, 20, 22, 23, 26, 27];
    return activeDays.includes(i + 1);
  });

  // Mood Calendar helper for June 2026 (start day Tuesday, 30 days)
  const daysInJune = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // mock mood logs
    const moodLogs = {
      1: '😊', 2: '😊', 3: '😐', 4: '😔', 5: '😊',
      6: '😊', 7: '🙂', 9: '😐', 12: '😊', 13: '🙂',
      15: '😊', 16: '😐', 19: '😔', 20: '😊'
    };
    return { day: dayNum, emoji: moodLogs[dayNum] || null };
  });

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          My Wellness Journey 🏔️
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Your absolute progress vault: review charts, streaks, logs, and milestone achievements.
        </p>
      </div>

      {/* Wellness Index Summary */}
      <div className="bento-card" style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '32px',
        borderRadius: '24px',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>Wellness Score Index</span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0' }}>{wellnessIdx}/100</h2>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            {indexCat} Index
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>↑ +8 points</div>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>improved since last month</span>
        </div>
      </div>

      {/* Assessment Trends Grid */}
      <div className="bento-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Longitudinal Assessment Progress</h3>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} allowDuplicatedCategory={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 30]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" name="Depression (PHQ-9)" data={data?.phqTrend} dataKey="score" stroke="#ef4444" strokeWidth={3} />
              <Line type="monotone" name="Anxiety (GAD-7)" data={data?.gadTrend} dataKey="score" stroke="#6366f1" strokeWidth={3} />
              <Line type="monotone" name="Stress (PSS-10)" data={data?.pssTrend} dataKey="score" stroke="#f97316" strokeWidth={3} />
              <Line type="monotone" name="Well-being (WHO-5)" data={data?.whoTrend} dataKey="score" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Calendar & Journal Heatmap row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Mood Calendar */}
        <div className="bento-card theme-journals">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700 }}>Mood Calendar (June 2026)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '13px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <strong key={d} style={{ color: '#64748b' }}>{d}</strong>
            ))}
            {/* June 2026 starts on Monday (1 empty cell if Sunday start) */}
            <div />
            {daysInJune.map(dayInfo => (
              <div 
                key={dayInfo.day} 
                style={{ 
                  padding: '6px 0', 
                  borderRadius: '8px', 
                  backgroundColor: dayInfo.emoji ? '#f0fdf4' : '#f8fafc',
                  border: dayInfo.emoji ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  minHeight: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>{dayInfo.day}</span>
                {dayInfo.emoji && <span style={{ fontSize: '14px' }}>{dayInfo.emoji}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Journal Heatmap */}
        <div className="bento-card theme-who5">
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Journal Activity Heatmap</h3>
          <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>GitHub style contribution log for your journaling consistency.</p>
          <div className="heatmap-grid" style={{ maxWidth: '280px', margin: '0 auto' }}>
            {heatmapDays.map((active, i) => (
              <div 
                key={i}
                className="heatmap-cell"
                style={{
                  backgroundColor: active ? '#10b981' : '#f1f5f9',
                  border: '1px solid #cbd5e1'
                }}
                title={active ? 'Journal completed' : 'No entry'}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Appointment Timelines & Achievements badges row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Timeline */}
        <div className="bento-card theme-appointments">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Wellness Activity Timelines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #cbd5e1' }}>
            <div>
              <div style={{ position: 'absolute', left: '-6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0ea5e9' }} />
              <strong style={{ fontSize: '13px' }}>Today</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Wrote journal: "Feeling better after final exams."</p>
            </div>
            <div>
              <div style={{ position: 'absolute', left: '-6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <strong style={{ fontSize: '13px' }}>Yesterday</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Completed GAD-7 Anxiety Assessment. Score: 8 (Mild)</p>
            </div>
            <div>
              <div style={{ position: 'absolute', left: '-6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
              <strong style={{ fontSize: '13px' }}>3 Days Ago</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Attended consultation session with Dr. Sharma.</p>
            </div>
          </div>
        </div>

        {/* Achievements badges */}
        <div className="bento-card theme-doctornotes">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Achievements & Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            
            <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '24px' }}>🌱</div>
              <strong style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>First Journal</strong>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>Unlocked</span>
            </div>

            <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '24px' }}>✍️</div>
              <strong style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>10 Journal Entries</strong>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>Unlocked</span>
            </div>

            <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '24px' }}>🔬</div>
              <strong style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>First Assessment</strong>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>Unlocked</span>
            </div>

            <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc', opacity: 0.5 }}>
              <div style={{ fontSize: '24px' }}>🏆</div>
              <strong style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>5 Assessments</strong>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Locked</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default WellnessJourney;
