import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: 'student',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(formData);
      if (data.role === 'student') navigate('/dashboard/student');
      else if (data.role === 'doctor') navigate('/dashboard/doctor');
      else if (data.role === 'admin') navigate('/dashboard/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      color: '#0f172a',
      padding: '24px'
    }}>
      <div className="bento-card" style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        margin: '24px 0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '32px' }}>🌿</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px 0' }}>Get Started</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Create your Wellhealth account</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>I am a...</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                height: '42px'
              }}
            >
              <option value="student">Student</option>
              <option value="doctor">Doctor / Consultant</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required 
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Phone Number</label>
            <input 
              type="text" 
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              required 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '12px',
              fontSize: '15px',
              borderRadius: '12px',
              marginTop: '8px'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
          Already have an account? <Link to="/login" style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
