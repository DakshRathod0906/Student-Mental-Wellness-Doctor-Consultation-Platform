import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Availability = () => {
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSchedule = async () => {
    try {
      const { data } = await API.get(`/availability/${user._id}`);
      setSchedule(data);
    } catch (err) {
      setError('Failed to fetch availability records');
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/availability', {
        day,
        startTime,
        endTime,
        isAvailable: true
      });
      setSuccess(`Updated availability slot for ${day}!`);
      fetchSchedule();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    }
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>Weekly Consultation Schedule</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Configure the weekday slots when students can schedule Jitsi consultation sessions with you.</p>
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

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Config Form */}
        <div className="bento-card" style={{
          flex: 1,
          minWidth: '280px',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Configure Available Hours</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Day of the Week</label>
              <select 
                value={day} 
                onChange={(e) => setDay(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', outline: 'none', fontSize: '14px', height: '40px' }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Start Time (HH:MM)</label>
                <input 
                  type="text" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>End Time (HH:MM)</label>
                <input 
                  type="text" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="17:00"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              Save Availability
            </button>
          </form>
        </div>

        {/* Existing Schedule */}
        <div style={{ flex: 2, minWidth: '320px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Your Configured Availability</h3>
          {schedule.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px' }} className="bento-card">
              No availability slots set yet. Configure using the form to appear in the directory.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schedule.map(slot => (
                <div key={slot._id} className="bento-card" style={{
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>{slot.day}</span>
                  <span style={{ fontSize: '14px', color: '#14b8a6', fontWeight: 600 }}>🕒 {slot.startTime} - {slot.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;
