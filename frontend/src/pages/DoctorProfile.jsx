import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  // Booking Widget States
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review states (For student review submissions)
  const [studentRating, setStudentRating] = useState(5);
  const [studentReviewMsg, setStudentReviewMsg] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get(`/doctors/${id}`);
      setData(data);
    } catch (err) {
      setError('Failed to load doctor profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const handleSelectSlot = (slot) => {
    setSelectedSlotId(slot._id);
    setSelectedTime(slot.startTime);
    // Find next matching date based on day string
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(slot.day);
    if (targetDayIndex === -1) return;

    const resultDate = new Date();
    const currentDayIndex = resultDate.getDay();
    let distance = targetDayIndex - currentDayIndex;
    if (distance <= 0) {
      distance += 7; // force next week
    }
    resultDate.setDate(resultDate.getDate() + distance);
    setSelectedDate(resultDate.toISOString().split('T')[0]);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select an available slot from the availability tab first.');
      return;
    }
    setBookingLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/appointments', {
        doctorId: id,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime
      });
      setSuccess('Appointment request booked successfully! Awaiting consultant confirmation.');
      setSelectedSlotId('');
      setSelectedDate('');
      setSelectedTime('');
      fetchDoctorDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!studentReviewMsg) return;
    setReviewLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/reviews', {
        doctorId: id,
        rating: Number(studentRating),
        review: studentReviewMsg
      });
      setSuccess('Review submitted successfully!');
      setStudentReviewMsg('');
      fetchDoctorDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>Loading doctor profile...</div>;
  if (!data?.doctor) return <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>Doctor profile not found</div>;

  const { doctor, availability, reviews, averageRating, reviewCount } = data;

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/doctors')}
        className="btn-secondary" 
        style={{ marginBottom: '24px', padding: '8px 16px', borderRadius: '10px' }}
      >
        ← Back to Directory
      </button>

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

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Column: Details & Tabs */}
        <div style={{ flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="bento-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px'
            }}>
              🩺
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Dr. {doctor.firstName} {doctor.lastName}</h1>
              <span style={{ fontSize: '14px', color: '#14b8a6', fontWeight: 600 }}>{doctor.doctorProfile?.specialization}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                <span>⭐ {averageRating || '0'} ({reviewCount || 0} reviews)</span>
                <span>•</span>
                <span>💼 {doctor.doctorProfile?.experience} Years Experience</span>
                <span>•</span>
                <strong style={{ color: '#0f172a' }}>${doctor.doctorProfile?.fee} / session</strong>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '16px' }}>
            {['about', 'availability', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #14b8a6' : '3px solid transparent',
                  color: activeTab === tab ? '#14b8a6' : '#64748b',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="bento-card" style={{ minHeight: '260px' }}>
            {activeTab === 'about' && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Biography</h3>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  {doctor.doctorProfile?.bio || 'No biography details provided.'}
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Qualifications</h3>
                <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px' }}>
                  🎓 {doctor.doctorProfile?.qualification || 'Certified Consultant'}
                </p>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Areas of Expertise</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Academic Stress', 'Anxiety', 'Burnout', 'Exam Pressure'].map((exp, idx) => (
                    <div key={idx} style={{ fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#14b8a6', fontWeight: 'bold' }}>✓</span> {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Weekly Consultation Slots</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select an active slot below to configure your booking request in the widget.</p>
                {availability.length === 0 ? (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>Doctor has not configured any availability slots.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {availability.filter(a => a.isAvailable).map(slot => (
                      <div 
                        key={slot._id}
                        onClick={() => handleSelectSlot(slot)}
                        style={{
                          border: selectedSlotId === slot._id ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                          backgroundColor: selectedSlotId === slot._id ? '#f0fdfa' : '#ffffff',
                          padding: '14px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <strong style={{ fontSize: '14px', display: 'block', color: '#0f172a' }}>{slot.day}</strong>
                        <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          ⏰ {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Student Feedback ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>No feedback reviews left for this doctor yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {reviews.map(rev => (
                      <div key={rev._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '14px' }}>{rev.studentId?.firstName} {rev.studentId?.lastName}</strong>
                          <span style={{ color: '#eab308', fontWeight: 700, fontSize: '13px' }}>{'⭐'.repeat(rev.rating)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>{rev.review}</p>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit review if student is logged in */}
                {user?.role === 'student' && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Leave Feedback</h4>
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Session Rating</label>
                        <select 
                          value={studentRating}
                          onChange={(e) => setStudentRating(Number(e.target.value))}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                      <textarea
                        value={studentReviewMsg}
                        onChange={(e) => setStudentReviewMsg(e.target.value)}
                        placeholder="Write your review comments here (e.g. Session was highly reassuring...)"
                        rows="3"
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', resize: 'vertical' }}
                      />
                      <button type="submit" disabled={reviewLoading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div style={{ flex: 1, minWidth: '300px', position: 'sticky', top: '90px' }}>
          <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Schedule Consultation</h3>
            
            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Selected Consultation Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  disabled
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'not-allowed', outline: 'none', color: '#64748b' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Selected Slot Time</label>
                <input 
                  type="text" 
                  value={selectedTime}
                  disabled
                  placeholder="Select slot from availability tab"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'not-allowed', outline: 'none', color: '#64748b' }}
                />
              </div>

              {user?.role === 'student' ? (
                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                >
                  Book Appointment Now
                </button>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '10px' }}>
                  Please login as a Student to book sessions.
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorProfile;
