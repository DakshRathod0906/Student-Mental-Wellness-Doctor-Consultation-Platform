import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking selections
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const fetchAppointmentsAndDoctors = async () => {
    try {
      const appRes = await API.get('/appointments');
      setAppointments(appRes.data);

      const docRes = await API.get('/doctors');
      setDoctors(docRes.data.doctors || []);
    } catch (err) {
      setError('Failed to fetch appointment resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndDoctors();
  }, []);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please choose a consultant, date, and slot.');
      return;
    }

    try {
      await API.post('/appointments', {
        doctorId: selectedDoctor._id,
        scheduledDate: new Date(selectedDate),
        scheduledTime: selectedTime,
        duration: 30
      });
      setSuccess('Appointment request submitted successfully!');
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      fetchAppointmentsAndDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      fetchAppointmentsAndDoctors();
      setSuccess('Appointment cancelled successfully.');
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '180px', width: '100%' }} />
      </div>
    );
  }

  // Stats Counters
  const pendingCount = appointments.filter(app => app.status === 'pending').length;
  const approvedCount = appointments.filter(app => app.status === 'approved').length;
  const completedCount = appointments.filter(app => app.status === 'completed').length;
  const cancelledCount = appointments.filter(app => app.status === 'cancelled').length;

  const hoursSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  // Status timeline tracking mapper
  const getPipelineStep = (status) => {
    if (status === 'pending') return 1;
    if (status === 'approved') return 2;
    if (status === 'completed') return 3;
    return 4; // reviewed or closed
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Consultation Bookings 📅
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Browse available psychiatrists and track your scheduled consultation pipelines.
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

      {/* Dashboard Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="bento-card theme-appointments" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Approved</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{approvedCount}</div>
        </div>
        <div className="bento-card theme-notifications" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pending Review</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{pendingCount}</div>
        </div>
        <div className="bento-card theme-who5" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Completed</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{completedCount}</div>
        </div>
        <div className="bento-card theme-phq9" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Cancelled</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{cancelledCount}</div>
        </div>
      </div>

      {/* Book a Consultation flow */}
      {selectedDoctor ? (
        <form onSubmit={handleBookSession} className="bento-card theme-appointments" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>
            Book Consultation with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select an available slot below.</p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Select Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Select Time Slot</label>
              <select 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', height: '40px' }}
              >
                <option value="">Choose slot</option>
                {hoursSlots.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setSelectedDoctor(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#06b6d4' }}>Confirm Booking Request</button>
          </div>
        </form>
      ) : (
        /* Doctor Cards directory list */
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>Browse Available Counselors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {doctors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '24px' }}>
                No active doctor profiles registered.
              </div>
            ) : (
              doctors.map(doc => (
                <div key={doc._id} className="bento-card theme-appointments" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '220px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Dr. {doc.firstName} {doc.lastName}</h4>
                      <span className="status-badge status-available">Available</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: 600 }}>Psychiatrist & Counselor</span>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0', lineHeight: 1.4 }}>
                      Experience: {doc.doctorProfile?.experience || '5'} years | Rating: ⭐ 4.9
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>Anxiety</span>
                      <span style={{ backgroundColor: '#f1f5f9', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>Academic Stress</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoctor(doc)} className="btn-primary" style={{ width: '100%', backgroundColor: '#06b6d4' }}>Book Session Now</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Appointment History Journey Pipeline */}
      <div>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>Your Active Sessions</h3>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px', backgroundColor: '#ffffff' }}>
            No appointments booked yet. Click on any doctor card above to book.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {appointments.map(app => {
              const currentStep = getPipelineStep(app.status);
              return (
                <div key={app._id} className="bento-card theme-appointments">
                  <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>
                        {user?.role === 'student' 
                          ? `Dr. ${app.doctorId?.firstName} ${app.doctorId?.lastName}` 
                          : `Student: ${app.studentId?.firstName} ${app.studentId?.lastName}`}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>
                        📅 {new Date(app.scheduledDate).toLocaleDateString()} at {app.scheduledTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.status === 'approved' && app.meetingLink && (
                        <button onClick={() => window.open(app.meetingLink, '_blank')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Join Room</button>
                      )}
                      {['pending', 'approved'].includes(app.status) && (
                        <button onClick={() => handleCancel(app._id)} className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                      )}
                    </div>
                  </div>

                  {/* Status journey pipeline */}
                  <div style={{ display: 'flex', justifyBetween: 'space-between', position: 'relative', marginTop: '20px' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', backgroundColor: '#e2e8f0', zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: '14px', left: '10%', width: `${(currentStep - 1) * 33.3}%`, height: '3px', backgroundColor: '#06b6d4', zIndex: 2, transition: 'width 0.3s' }} />
                    
                    {['Requested', 'Confirmed', 'Completed', 'Reviewed'].map((step, idx) => {
                      const active = currentStep >= idx + 1;
                      return (
                        <div key={step} style={{ textAlign: 'center', width: '25%', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: active ? '#06b6d4' : '#ffffff',
                            border: '3px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            color: active ? '#ffffff' : '#cbd5e1',
                            fontWeight: 700
                          }}>{idx + 1}</div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: active ? '#0f172a' : '#94a3b8', marginTop: '6px' }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Appointments;
