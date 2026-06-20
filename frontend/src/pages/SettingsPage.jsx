import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'notifications', 'privacy', 'security'
  
  // Security Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await API.put('/auth/password', { oldPassword, newPassword });
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Platform Settings ⚙️
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Configure notification logs, adjust security passcodes, and control diagnostic sharing settings.
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

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '1px', marginBottom: '24px' }}>
        {['profile', 'notifications', 'privacy', 'security'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === t ? '3px solid #14b8a6' : '3px solid transparent',
              color: activeTab === t ? '#14b8a6' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab contents */}
      {activeTab === 'profile' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Account Profile Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div><strong>First Name:</strong> {user?.firstName}</div>
            <div><strong>Last Name:</strong> {user?.lastName}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Role:</strong> {user?.role}</div>
            <div><strong>Verification Status:</strong> {user?.isEmailVerified ? 'Verified' : 'Pending'}</div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Preferences Toggles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Appointment Status Alerts</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Receive instant notifications when doctor approves session requests.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Diagnostic Reminders</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Notify me when assessments are due or need review updates.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Sharing Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Share Screener Records</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Allow assigned doctors to view score trends before meetings.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Update Security Password</h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Old Password</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <button type="button" className="btn-secondary" style={{ color: '#ef4444' }}>Logout All Devices</button>
              <button type="submit" className="btn-primary" style={{ backgroundColor: '#14b8a6' }}>Update Passcode</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
