import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setMessage(result.message || 'Password reset instructions have been logged to the console!');
    } else {
      setError(result.error || 'Failed to process request. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="animate-fade-in">
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>🔑</div>
          <h2 style={titleStyle}>Forgot Password</h2>
          <p style={subtitleStyle}>Enter your email to receive a password reset token</p>
        </div>

        {error && (
          <div style={errorAlertStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        {message && (
          <div style={successAlertStyle}>
            <span>✅</span> {message}
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="e.g., employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Generate Reset Token'}
            </button>
          </form>
        ) : (
          <div style={instructionBoxStyle}>
            <strong>Testing Instructions:</strong><br />
            1. Open the backend command terminal logs.<br />
            2. Copy the generated UUID Token.<br />
            3. Click the link below to input the token and reset your password.
            <div style={{marginTop: '15px'}}>
              <Link to="/reset-password" style={actionBtnStyle}>Go to Reset Password</Link>
            </div>
          </div>
        )}

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

const instructionBoxStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '13px',
  color: '#475569',
  lineHeight: '1.6'
};

const actionBtnStyle = {
  display: 'block',
  textAlign: 'center',
  backgroundColor: '#4f46e5',
  color: '#fff',
  padding: '10px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px'
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

export default ForgotPassword;
