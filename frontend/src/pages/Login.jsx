import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'student') navigate('/dashboard/student');
      else if (data.role === 'doctor') navigate('/dashboard/doctor');
      else if (data.role === 'admin') navigate('/dashboard/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
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
        maxWidth: '400px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '32px' }}>🌿</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px 0' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Sign in to your wellness dashboard</p>
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
            <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
          Don't have an account? <Link to="/register" style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
