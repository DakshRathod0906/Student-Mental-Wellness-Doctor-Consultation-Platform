import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get('/appointments');
      setAppointments(data);
    } catch (err) {
      setError('Failed to fetch appointment history');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
      setSuccess('Appointment cancelled successfully.');
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>Consultations History</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Track and join your upcoming video consultation sessions or view past treatment history notes.
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

      {/* Appointment History Logs */}
      <div>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800 }}>Your Session Log</h2>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px' }} className="bento-card">
            No appointments scheduled. Go to the Doctor Directory to book a slot.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map(app => (
              <div key={app._id} className="bento-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                      {user?.role === 'student' 
                        ? `Dr. ${app.doctorId?.firstName} ${app.doctorId?.lastName}` 
                        : `Student: ${app.studentId?.firstName} ${app.studentId?.lastName}`}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontWeight: 'bold',
                      backgroundColor: app.status === 'approved' ? '#dcfce7' : (app.status === 'pending' ? '#fef3c7' : '#f1f5f9'),
                      color: app.status === 'approved' ? '#15803d' : (app.status === 'pending' ? '#b45309' : '#64748b'),
                      textTransform: 'capitalize'
                    }}>{app.status}</span>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                    📅 {new Date(app.scheduledDate).toLocaleDateString()} at {app.scheduledTime} ({app.duration} mins)
                  </p>
                  
                  {app.doctorNotes && (
                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8fafc', borderLeft: '3px solid #14b8a6', borderRadius: '4px', fontSize: '13px' }}>
                      <strong>Clinical Notes:</strong> {app.doctorNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {app.status === 'approved' && app.meetingLink && (
                    <button 
                      onClick={() => window.open(app.meetingLink, '_blank')}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Join Room
                    </button>
                  )}

                  {['pending', 'approved'].includes(app.status) && (
                    <button 
                      onClick={() => handleCancel(app._id)}
                      className="btn-secondary"
                      style={{
                        color: '#ef4444',
                        borderColor: '#fca5a5',
                        padding: '8px 16px',
                        fontSize: '13px'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Appointments;
