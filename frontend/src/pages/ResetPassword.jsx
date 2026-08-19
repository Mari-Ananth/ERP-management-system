import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, newPassword);
    setLoading(false);

    if (result.success) {
      setMessage(result.message || 'Password reset successful!');
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Failed to reset password. Please verify your token.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="animate-fade-in">
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>🔒</div>
          <h2 style={titleStyle}>Reset Password</h2>
          <p style={subtitleStyle}>Input your reset token and select a new password</p>
        </div>

        {error && (
          <div style={errorAlertStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        {message && (
          <div style={successAlertStyle}>
            <span>✅</span> {message}
            <div style={{fontSize: '12px', marginTop: '5px', fontWeight: 'normal'}}>
              Redirecting to sign-in page shortly...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Reset Token</label>
            <input
              type="text"
              placeholder="Paste UUID token from logs"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div style={footerStyle}>
          <Link to="/login" style={backLinkStyle}>← Back to Sign In</Link>
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
  fontSize: '24px',
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

const successAlertStyle = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  color: '#065f46',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '20px',
  fontSize: '14px',
  fontWeight: '600'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155'
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

const footerStyle = {
  textAlign: 'center',
  marginTop: '24px'
};

const backLinkStyle = {
  fontSize: '14px',
  color: '#4f46e5',
  textDecoration: 'none',
  fontWeight: '500'
};

export default ResetPassword;
