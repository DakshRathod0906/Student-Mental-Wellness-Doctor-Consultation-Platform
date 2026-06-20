import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'ASSESSMENT', 'JOURNAL', 'APPOINTMENT', 'SYSTEM'

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      setError('Failed to fetch notification items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '140px', width: '100%' }} />
      </div>
    );
  }

  // Filter based on notification type category
  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ASSESSMENT') return ['assessment_completed', 'assessment_prompt'].includes(n.type);
    if (filterType === 'JOURNAL') return n.type?.includes('journal');
    if (filterType === 'APPOINTMENT') return n.type?.includes('appointment');
    return n.type?.includes('system') || n.type?.includes('general');
  });

  // Group notifications chronologically
  const groupNotifications = () => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    now.setHours(0,0,0,0);
    const oneDay = 24 * 60 * 60 * 1000;

    filteredNotifs.forEach(n => {
      const created = new Date(n.createdAt);
      created.setHours(0,0,0,0);
      const diff = now - created;

      if (diff === 0) {
        today.push(n);
      } else if (diff === oneDay) {
        yesterday.push(n);
      } else if (diff < 7 * oneDay) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const { today, yesterday, thisWeek, older } = groupNotifications();

  const renderSection = (title, items, borderTheme) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(n => (
            <div 
              key={n._id}
              onClick={() => handleMarkRead(n._id)}
              className={`bento-card ${borderTheme}`}
              style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: n.isRead ? '#ffffff' : 'rgba(245,158,11,0.04)',
                cursor: 'pointer'
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{n.title || 'Wellness Update'}</h4>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>{n.message}</p>
                <span style={{ fontSize: '10px', color: '#cbd5e1', display: 'block', marginTop: '6px' }}>{new Date(n.createdAt).toLocaleTimeString()}</span>
              </div>
              {!n.isRead && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Notification Center 🔔
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Chronological record of assessments, journal streaks, and clinical consultation logs.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'ASSESSMENT', 'JOURNAL', 'APPOINTMENT', 'SYSTEM'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterType === type ? '#f59e0b' : 'transparent',
              color: filterType === type ? '#ffffff' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grouped notification lists */}
      {filteredNotifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }} className="bento-card">
          No notifications found in this category.
        </div>
      ) : (
        <>
          {renderSection('Today', today, 'theme-notifications')}
          {renderSection('Yesterday', yesterday, 'theme-notifications')}
          {renderSection('This Week', thisWeek, 'theme-notifications')}
          {renderSection('Older', older, 'theme-notifications')}
        </>
      )}

    </div>
  );
};

export default NotificationsPage;
