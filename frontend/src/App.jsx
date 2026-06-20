import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Journals from './pages/Journals';
import Assessments from './pages/Assessments';
import TakeAssessment from './pages/TakeAssessment';
import WellnessJourney from './pages/WellnessJourney';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import Profile from './pages/Profile';
import DoctorNotesPage from './pages/DoctorNotesPage';
import Appointments from './pages/Appointments';
import Availability from './pages/Availability';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import { Link } from 'react-router-dom';

// Layout component to wrap dashboards with nav and sidebar
const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <div className="mobile-bottom-nav">
        <Link to="/dashboard/student" style={{ textDecoration: 'none', color: '#475569', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/assessments" style={{ textDecoration: 'none', color: '#475569', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>🩺</span>
          <span>Tests</span>
        </Link>
        <Link to="/journals" style={{ textDecoration: 'none', color: '#475569', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>📝</span>
          <span>Journal</span>
        </Link>
        <Link to="/appointments" style={{ textDecoration: 'none', color: '#475569', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>📅</span>
          <span>Bookings</span>
        </Link>
        <Link to="/profile" style={{ textDecoration: 'none', color: '#475569', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>👤</span>
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

import Landing from './pages/Landing';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/wellness-journey" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><WellnessJourney /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/journals" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><Journals /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><Assessments /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessments/:type" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><TakeAssessment /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><Doctors /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><DoctorProfile /></Layout>
            </ProtectedRoute>
          } />

          {/* Doctor Protected Routes */}
          <Route path="/dashboard/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout><DoctorDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/availability" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout><Availability /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/notes" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout><DoctorNotesPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['student', 'doctor', 'admin']}>
              <Layout><Appointments /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['student', 'doctor', 'admin']}>
              <Layout><NotificationsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['student', 'doctor', 'admin']}>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['student', 'doctor', 'admin']}>
              <Layout><SettingsPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin Protected Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
