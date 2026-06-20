import React, { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import Profile from './Profile';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/dashboard/admin');
        setStats(data);
      } catch (err) {
        setError('Failed to load admin metrics');
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            {activeTab === 'overview' ? 'Platform overall health indicators and diagnostic metrics.' : 'Configure administrative details and system password.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: activeTab === 'overview' ? 'none' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'overview' ? '#14b8a6' : '#ffffff',
              color: activeTab === 'overview' ? '#ffffff' : '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            📊 Overview
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: activeTab === 'settings' ? 'none' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'settings' ? '#14b8a6' : '#ffffff',
              color: activeTab === 'settings' ? '#ffffff' : '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="bento-card">
          <Profile />
        </div>
      ) : (
        stats && (
          <>
            {/* Stats Bento Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '-12px', marginBottom: '12px' }}>
              <StatCard title="Total Students" value={stats.cards.totalStudents} icon="👥" color="#14b8a6" />
              <StatCard title="Active Consultants" value={stats.cards.totalDoctors} icon="🩺" color="#6366f1" />
              <StatCard title="Consultations Booked" value={stats.cards.totalAppointments} icon="📅" color="#f97316" />
              <StatCard title="Assessments Completed" value={stats.cards.totalAssessments} icon="🔬" color="#8b5cf6" />
              <StatCard title="Submitted Reviews" value={stats.cards.totalReviews} icon="⭐" color="#eab308" />
            </div>

            {/* Visual Analytics Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '24px' }}>
              
              {/* Severity Distribution Pie Chart */}
              <div className="bento-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Assessment Severity Distribution</h3>
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.severityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {stats.severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peak Consultation Hours Bar Chart */}
              <div className="bento-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Peak Consultation Hours</h3>
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.peakUsageHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip cursor={{ fill: 'rgba(20,184,166,0.05)' }} />
                      <Bar name="Sessions Booked" dataKey="bookings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Searches / Specializations */}
              <div className="bento-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Top Concern Search Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stats.topSearches.map((search, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#f0fdfa',
                          color: '#14b8a6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>{index + 1}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{search.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '120px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            backgroundColor: '#14b8a6',
                            borderRadius: '3px',
                            width: `${Math.min(100, (search.count / stats.topSearches[0].count) * 100)}%`
                          }} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>{search.count} clicks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment Trend Lines */}
              <div className="bento-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Consultation Volume Trend</h3>
                {stats.appointmentTrend.length === 0 ? (
                  <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No bookings log</div>
                ) : (
                  <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.appointmentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" name="Bookings Count" dataKey="status" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          </>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
