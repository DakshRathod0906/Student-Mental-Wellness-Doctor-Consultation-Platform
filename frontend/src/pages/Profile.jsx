import React, { useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  // Student specific details
  const studentDetails = {
    university: 'ABC State University',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Junior)',
    id: 'CS-2026-0942'
  };

  const badges = [
    { title: '🌱 First Journal', unlocked: true, desc: 'Logged your very first daily entry.' },
    { title: '✍️ 10 Journal Entries', unlocked: true, desc: 'Consistently logged 10 journals.' },
    { title: '🔬 First Assessment', unlocked: true, desc: 'Completed your first clinical screener.' },
    { title: '🏆 5 Assessments', unlocked: false, desc: 'Complete 5 self-assessments.' },
    { title: '📅 First Booking', unlocked: true, desc: 'Scheduled your first consultation.' },
    { title: '🤝 5 Consultations', unlocked: false, desc: 'Complete 5 clinical consultations.' }
  ];

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          User Profile Information 👤
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Verify your student credentials and view your unlocked milestone achievements.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Profile details */}
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{user?.firstName} {user?.lastName}</strong></div>
            <div><span style={{ color: '#64748b' }}>Email:</span> <strong>{user?.email}</strong></div>
            <div><span style={{ color: '#64748b' }}>Role:</span> <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></div>
            
            {user?.role === 'student' && (
              <>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />
                <div><span style={{ color: '#64748b' }}>University:</span> <strong>{studentDetails.university}</strong></div>
                <div><span style={{ color: '#64748b' }}>Department:</span> <strong>{studentDetails.department}</strong></div>
                <div><span style={{ color: '#64748b' }}>Academic Year:</span> <strong>{studentDetails.year}</strong></div>
                <div><span style={{ color: '#64748b' }}>Student ID:</span> <strong>{studentDetails.id}</strong></div>
              </>
            )}
          </div>
        </div>

        {/* Achievements list */}
        <div className="bento-card theme-doctornotes">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700 }}>Achievements & Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {badges.map((badge, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1', 
                  backgroundColor: badge.unlocked ? '#ffffff' : '#f1f5f9',
                  opacity: badge.unlocked ? 1 : 0.5
                }}
              >
                <div style={{ fontSize: '24px' }}>{badge.unlocked ? badge.title.split(' ')[0] : '🔒'}</div>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{badge.title.split(' ').slice(1).join(' ')}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{badge.desc}</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    backgroundColor: badge.unlocked ? '#dcfce7' : '#e2e8f0',
                    color: badge.unlocked ? '#15803d' : '#475569'
                  }}>{badge.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
