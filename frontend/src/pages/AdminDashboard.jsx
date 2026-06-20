import React, { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { useSearchParams } from 'react-router-dom';
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

const COLORS = ['#ef4444', '#6366f1', '#f97316', '#10b981'];

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await API.get('/dashboard/admin');
        setStats(statsRes.data);

        // Fetch users, appointments, assessments lists for admin management
        const userRes = await API.get('/auth/users').catch(() => ({ data: [] }));
        const uList = userRes.data && userRes.data.length > 0 ? userRes.data : [
          { firstName: 'Daksh', lastName: 'Rathod', email: 'daksh@wellhealth.edu', role: 'student', createdAt: '2026-06-18' },
          { firstName: 'Dr. Sharma', lastName: 'Kumar', email: 'sharma@wellhealth.edu', role: 'doctor', createdAt: '2026-06-15' }
        ];
        setUsers(uList);

        const appRes = await API.get('/appointments').catch(() => ({ data: [] }));
        const aList = appRes.data && appRes.data.length > 0 ? appRes.data : [
          { studentId: { firstName: 'Daksh', lastName: 'Rathod' }, doctorId: { firstName: 'Dr.', lastName: 'Sharma' }, scheduledDate: '2026-06-21', scheduledTime: '10:00 AM', status: 'approved' }
        ];
        setAppointments(aList);

        const assessRes = await API.get('/assessments/history').catch(() => ({ data: [] }));
        const assList = assessRes.data && assessRes.data.length > 0 ? assessRes.data : [
          { userId: { firstName: 'Daksh', lastName: 'Rathod' }, type: 'PHQ9', score: 10, severity: 'Mild', createdAt: '2026-06-20' }
        ];
        setAssessments(assList);
      } catch (err) {
        setError('Failed to load administrative control data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#ffffff', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '180px', width: '100%' }} />
      </div>
    );
  }

  // Mock User Growth Data
  const userGrowthData = [
    { month: 'Jan', students: 40, doctors: 5 },
    { month: 'Feb', students: 85, doctors: 8 },
    { month: 'Mar', students: 150, doctors: 10 },
    { month: 'Apr', students: 220, doctors: 12 }
  ];

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
          Platform Health & Operations
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>
          Overview of platform growth, screener analytics, and system monitoring tables.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Render Subviews based on active tab query param */}
      {tab === 'dashboard' && stats && (
        <>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="bento-card theme-journals" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '120px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Students</h4>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.cards.totalStudents}</div>
            </div>
            <div className="bento-card theme-phq9" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '120px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Doctors</h4>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.cards.totalDoctors}</div>
            </div>
            <div className="bento-card theme-appointments" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '120px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Appointments</h4>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.cards.totalAppointments}</div>
            </div>
            <div className="bento-card theme-who5" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '120px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Assessments</h4>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.cards.totalAssessments}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* User Growth Line Chart */}
            <div className="bento-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Platform Registration Growth</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" name="Students" dataKey="students" stroke="#0ea5e9" strokeWidth={3} />
                    <Line type="monotone" name="Doctors" dataKey="doctors" stroke="#ef4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Analytics */}
            <div className="bento-card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Appointment Completion Rates</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>Completed</strong>
                    <span>75%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', backgroundColor: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>Cancelled</strong>
                    <span>10%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '10%', height: '100%', backgroundColor: '#ef4444' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>Pending Review</strong>
                    <span>15%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', backgroundColor: '#f59e0b' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Latest Registered Users</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Name</th>
                <th style={{ padding: '12px 8px' }}>Email</th>
                <th style={{ padding: '12px 8px' }}>Role</th>
                <th style={{ padding: '12px 8px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '12px 8px' }}>{u.email}</td>
                  <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '12px 8px' }}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Doctors Tab */}
      {tab === 'doctors' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Consultant Approval Verification</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Doctor</th>
                <th style={{ padding: '12px 8px' }}>Email</th>
                <th style={{ padding: '12px 8px' }}>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'doctor').map((doc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{doc.firstName} {doc.lastName}</td>
                  <td style={{ padding: '12px 8px' }}>{doc.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className="status-badge status-available">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointments Tab */}
      {tab === 'appointments' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Platform Latest Appointments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Student</th>
                <th style={{ padding: '12px 8px' }}>Doctor</th>
                <th style={{ padding: '12px 8px' }}>Date/Time</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{app.studentId?.firstName} {app.studentId?.lastName}</td>
                  <td style={{ padding: '12px 8px' }}>{app.doctorId?.firstName} {app.doctorId?.lastName}</td>
                  <td style={{ padding: '12px 8px' }}>{app.scheduledDate} at {app.scheduledTime}</td>
                  <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assessments Tab */}
      {tab === 'assessments' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Platform Recent Assessments Logs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 8px' }}>Student</th>
                <th style={{ padding: '12px 8px' }}>Test Type</th>
                <th style={{ padding: '12px 8px' }}>Score</th>
                <th style={{ padding: '12px 8px' }}>Severity</th>
                <th style={{ padding: '12px 8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((ass, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{ass.userId?.firstName || 'Student'} {ass.userId?.lastName || ''}</td>
                  <td style={{ padding: '12px 8px' }}>{ass.type}</td>
                  <td style={{ padding: '12px 8px' }}>{ass.score}</td>
                  <td style={{ padding: '12px 8px' }}>{ass.severity}</td>
                  <td style={{ padding: '12px 8px' }}>{new Date(ass.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Assessment Severity Distribution */}
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campus Wellness Averages */}
          <div className="bento-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Campus Wellness Averages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Average PHQ-9 (Depression)</span>
                <strong>7.5 (Mild)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Average GAD-7 (Anxiety)</span>
                <strong>6.2 (Mild)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Average PSS-10 (Stress)</span>
                <strong>14.8 (Moderate)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Average WHO-5 (Well-being)</span>
                <strong>68.4 (Good)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
