import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="animate-fade-in">
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>💼</div>
          <h2 style={titleStyle}>Company ERP</h2>
          <p style={subtitleStyle}>Sign in to manage your company resources</p>
        </div>

        {error && (
          <div style={errorAlertStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="e.g., admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <div style={passwordHeaderStyle}>
              <label style={labelStyle}>Password</label>
              <Link to="/forgot-password" style={forgotLinkStyle}>Forgot Password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            className="btn-primary"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={seedInfoStyle}>
          <strong>Default Admin Demo:</strong><br />
          Email: <code style={{userSelect:'all'}}>admin@company.com</code> | Password: <code style={{userSelect:'all'}}>admin123</code>
        </div>
      </div>
    </div>
  );
};

// Styling Variables for Premium Look
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)',
  padding: '20px',
  boxSizing: 'border-box'
};

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  width: '100%',
  maxWidth: '420px',
  padding: '40px',
  boxSizing: 'border-box'
};

const logoContainerStyle = {
  textAlign: 'center',
  marginBottom: '30px'
};

const logoIconStyle = {
  fontSize: '48px',
  marginBottom: '10px'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#1e1b4b',
  margin: '0 0 4px 0'
};

const subtitleStyle = {
  color: '#64748b',
  fontSize: '14px',
  margin: 0
};

const errorAlertStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '20px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const passwordHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155'
};

const forgotLinkStyle = {
  fontSize: '13px',
  color: '#4f46e5',
  textDecoration: 'none',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  justifyContent: 'center',
  fontSize: '16px',
  marginTop: '10px'
};

const seedInfoStyle = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '12px',
  marginTop: '24px',
  color: '#475569',
  textAlign: 'center',
  lineHeight: '1.6'
};

export default Login;
