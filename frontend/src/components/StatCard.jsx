import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: `6px solid ${color || '#14b8a6'}`,
      borderTop: '1px solid #e2e8f0',
      borderRight: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
      minWidth: '220px',
      flex: 1,
      margin: '12px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
    }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{title}</p>
        <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0f172a', fontWeight: 700 }}>{value !== null && value !== undefined ? value : '--'}</h3>
      </div>
      <div style={{ fontSize: '32px', color: color || '#14b8a6', opacity: 0.9 }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
