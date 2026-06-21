import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const links = {
    student: [
      { path: '/dashboard/student', label: '📊 Dashboard' },
      { path: '/wellness-journey', label: '🏔️ Wellness Journey' },
      { path: '/journals', label: '📝 My Journals' },
      { path: '/assessments', label: '🩺 Assessments' },
      { path: '/appointments', label: '📅 Bookings' },
      { path: '/notifications', label: '🔔 Notifications' },
      { path: '/profile', label: '👤 Profile' },
      { path: '/settings', label: '⚙️ Settings' }
    ],
    doctor: [
      { path: '/dashboard/doctor', label: '📊 Dashboard' },
      { path: '/availability', label: '⚙️ Availability' },
      { path: '/appointments', label: '📅 Sessions' },
      { path: '/notes', label: '📝 Notes' },
      { path: '/profile', label: '👤 Profile' },
      { path: '/settings', label: '⚙️ Settings' }
    ],
    admin: [
      { path: '/dashboard/admin?tab=dashboard', label: '📊 Dashboard' },
      { path: '/dashboard/admin?tab=users', label: '👥 Users' },
      { path: '/dashboard/admin?tab=doctors', label: '🩺 Doctors' },
      { path: '/dashboard/admin?tab=appointments', label: '📅 Appointments' },
      { path: '/dashboard/admin?tab=assessments', label: '🗂️ Assessments' },
      { path: '/dashboard/admin?tab=analytics', label: '📈 Analytics' },
      { path: '/dashboard/admin?tab=emails', label: '✉️ Email Center' },
      { path: '/settings', label: '⚙️ Settings' }
    ]
  };

  const userLinks = links[user.role] || [];

  return (
    <div className="desktop-sidebar" style={{
      width: '260px',
      backgroundColor: '#ffffff',
      minHeight: 'calc(100vh - 70px)',
      borderRight: '1px solid #e2e8f0',
      padding: '24px 16px',
      zIndex: 5
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {userLinks.map(link => {
          const currentUrl = window.location.pathname + window.location.search;
          const isActive = currentUrl === link.path || 
                           (!link.path.includes('?') && window.location.pathname === link.path);
          return (
            <NavLink
              key={link.path}
              to={link.path}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: '12px',
                color: isActive ? '#0d9488' : '#64748b',
                backgroundColor: isActive ? 'rgba(20,184,166,0.08)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '15px',
                borderLeft: isActive ? '4px solid #14b8a6' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                } else {
                  e.currentTarget.style.backgroundColor = 'rgba(20,184,166,0.08)';
                  e.currentTarget.style.color = '#0d9488';
                }
              }}
            >
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
