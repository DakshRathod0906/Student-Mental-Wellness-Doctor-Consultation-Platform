import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Assessments = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/assessments/history');
      setHistory(data);
    } catch (err) {
      setError('Failed to fetch history logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div className="skeleton-block" style={{ height: '140px' }} />
          <div className="skeleton-block" style={{ height: '140px' }} />
        </div>
      </div>
    );
  }

  // Group assessments to find the latest of each type
  const getLatest = (type) => {
    const list = history.filter(h => h.type === type);
    return list.length > 0 ? list[0] : null;
  };

  // Rule-based change computation
  const getChangeMsg = (type) => {
    const list = history.filter(h => h.type === type);
    if (list.length < 2) return null;
    const current = list[0].score;
    const prev = list[1].score;
    const diff = current - prev;
    if (diff === 0) return 'No change';
    
    // For WHO-5, higher is better, so increase means improved.
    // For PHQ-9, GAD-7, PSS-10, lower is better, so decrease means improved.
    const isImproved = (type === 'WHO5' && diff > 0) || (type !== 'WHO5' && diff < 0);
    return {
      text: `${isImproved ? '↓' : '↑'} ${Math.abs(diff)} points since last test`,
      color: isImproved ? '#10b981' : '#ef4444'
    };
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays} days ago`;
  };

  const types = [
    { type: 'PHQ9', title: 'PHQ-9 Depression Screener', borderClass: 'theme-phq9', route: 'phq9', desc: '9 questions evaluating depressive symptoms and emotional status.' },
    { type: 'GAD7', title: 'GAD-7 Anxiety Screener', borderClass: 'theme-gad7', route: 'gad7', desc: '7 questions to evaluate anxiety levels and concern points.' },
    { type: 'PSS10', title: 'PSS-10 Perceived Stress', borderClass: 'theme-pss10', route: 'pss10', desc: '10 questions measuring perceived environmental stress.' },
    { type: 'WHO5', title: 'WHO-5 Well-being Index', borderClass: 'theme-who5', route: 'who5', desc: '5 questions measuring positive cognitive well-being.' }
  ];

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Mental Health Self-Assessments
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Standardized, secure clinical diagnostic tools to evaluate anxiety, stress, and well-being.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* 2x2 Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {types.map(t => {
          const latest = getLatest(t.type);
          const change = getChangeMsg(t.type);
          return (
            <div key={t.type} className={`bento-card ${t.borderClass}`} style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '220px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{t.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '6px 0 16px 0', lineHeight: 1.5 }}>{t.desc}</p>
                
                {latest ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last Score: <strong style={{ fontSize: '15px' }}>{latest.score}</strong></span>
                      <span style={{ color: '#64748b' }}>Taken: {getDaysAgo(latest.createdAt)}</span>
                    </div>
                    <div style={{ marginTop: '4px', fontWeight: 600 }}>Severity: {latest.severity}</div>
                    {change && (
                      <div style={{ marginTop: '4px', color: change.color, fontWeight: 700, fontSize: '12px' }}>
                        {change.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                    Not taken yet.
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate(`/assessments/${t.route}`)}
                className="btn-primary" 
                style={{ width: '100%', padding: '12px' }}
              >
                Start Assessment
              </button>
            </div>
          );
        })}
      </div>

      {/* History logs table */}
      <div className="bento-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Assessment Logs History</h3>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
            No past assessment scores logged. Choose a tool above to begin.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Date</th>
                <th style={{ padding: '12px 8px' }}>Screener Test</th>
                <th style={{ padding: '12px 8px' }}>Score</th>
                <th style={{ padding: '12px 8px' }}>Severity Category</th>
                <th style={{ padding: '12px 8px' }}>Recommendation Log</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 8px' }}>{item.type}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.score}</td>
                  <td style={{ padding: '12px 8px' }}>{item.severity}</td>
                  <td style={{ padding: '12px 8px', color: '#64748b' }}>{item.recommendation || 'No log details'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Assessments;
