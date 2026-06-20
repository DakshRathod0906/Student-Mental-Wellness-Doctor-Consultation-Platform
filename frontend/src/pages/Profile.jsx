import React, { useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  
  // Basic profile settings (All users)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Profile settings (Doctors only)
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [fee, setFee] = useState(0);
  const [image, setImage] = useState('');
  const [qualification, setQualification] = useState('');
  const [bio, setBio] = useState('');

  // Password update settings (All roles)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
      
      if (user.role === 'doctor' && user.doctorProfile) {
        setSpecialization(user.doctorProfile.specialization || '');
        setExperience(user.doctorProfile.experience || 0);
        setFee(user.doctorProfile.fee || 0);
        setImage(user.doctorProfile.image || '');
        setQualification(user.doctorProfile.qualification || '');
        setBio(user.doctorProfile.bio || '');
      }
    }
  }, [user]);

  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/auth/profile', {
        firstName,
        lastName,
        phoneNumber
      });
      setSuccess('Profile details updated successfully!');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/doctors/profile', {
        specialization,
        experience,
        fee,
        image,
        qualification,
        bio
      });
      setSuccess('Consultant profile updated successfully!');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/auth/password', { currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div style={{ color: '#ffffff' }}>
      {error && (
        <div style={{ color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Profile Card & Password Config */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Editable details */}
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Personal Information</h3>
            <form onSubmit={handleUpdateBasicInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Email Address (Cannot change)</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#94a3b8', cursor: 'not-allowed', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Account Type</label>
                <div style={{ textTransform: 'capitalize', color: '#60a5fa', fontWeight: 600, padding: '4px 0' }}>{user?.role}</div>
              </div>
              <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
                Save Profile Details
              </button>
            </form>
          </div>

          {/* Password update form */}
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Change Password</h3>
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>
              <button type="submit" style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Doctor profile update (Doctors only) */}
        {user?.role === 'doctor' && (
          <div style={{
            flex: 2,
            minWidth: '320px',
            backgroundColor: '#1e293b',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Consultant Profile Info</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>Completing these fields allows you to appear in the student directory.</p>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Specialization</label>
                  <input 
                    type="text" 
                    value={specialization} 
                    onChange={(e) => setSpecialization(e.target.value)} 
                    placeholder="Psychiatrist, Counselor"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Experience (Years)</label>
                  <input 
                    type="number" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Consultation Fee ($)</label>
                  <input 
                    type="number" 
                    value={fee} 
                    onChange={(e) => setFee(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Profile Image (URL)</label>
                  <input 
                    type="text" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    placeholder="https://example.com/avatar.jpg"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Qualifications</label>
                <input 
                  type="text" 
                  value={qualification} 
                  onChange={(e) => setQualification(e.target.value)} 
                  placeholder="MBBS, MD in Psychiatry"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Brief Bio / About Yourself</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows="4"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Save Profile
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
