import React, { useEffect, useState } from 'react';
import API from '../services/api';

const DoctorNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const { data } = await API.get('/doctor-notes');
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch session notes history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '140px', width: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Consultation Notes & Recommendations 📝
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Clinical summaries and recommendation lists logged during student consultations.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Notes timeline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }} className="bento-card">
            No consultation notes logged yet. Notes will appear here once sessions are completed.
          </div>
        ) : (
          notes.map(item => (
            <div key={item._id} className="bento-card theme-doctornotes" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    Student: {item.studentId?.firstName} {item.studentId?.lastName}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Session Date: {new Date(item.appointmentId?.scheduledDate || item.createdAt).toLocaleDateString()} at {item.appointmentId?.scheduledTime || 'N/A'}
                  </span>
                </div>
                {item.followUpRequired && (
                  <span className="status-badge status-limited">
                    ⚠️ Follow-Up: {new Date(item.followUpDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div><strong>Clinical Session Summary Notes:</strong></div>
                <p style={{ margin: '6px 0 0 0', color: '#475569', lineHeight: 1.5 }}>{item.notes}</p>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                💡 Recommendation Details: {item.recommendations}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DoctorNotesPage;
