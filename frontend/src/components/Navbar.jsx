import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav style={{
      height: '70px',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      borderBottom: '1px solid #e2e8f0',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ color: '#14b8a6', fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🌿</span> WELLHEALTH
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Notification Bell */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotif(!showNotif)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '20px',
                cursor: 'pointer',
                position: 'relative',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                zIndex: 100
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Notifications</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => markRead(n._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: n.isRead ? 'transparent' : 'rgba(20,184,166,0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'rgba(20,184,166,0.05)'}
                    >
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{n.title || 'Update'}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{n.message}</p>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{user.firstName} {user.lastName}</p>
              <span style={{ fontSize: '12px', color: '#14b8a6', textTransform: 'capitalize', fontWeight: 500 }}>{user.role}</span>
            </div>
            <button 
              onClick={logout}
              className="btn-primary"
              style={{
                backgroundColor: '#ef4444',
                padding: '8px 16px',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
