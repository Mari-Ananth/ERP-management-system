import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hrService from '../services/hrService';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await hrService.getHRDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch HR dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={loaderStyle}>Loading dashboard metrics...</div>;
  if (error) return <div style={errorAlertStyle}>{error}</div>;
  if (!stats) return <div style={emptyStateStyle}>No dashboard stats available.</div>;

  // Calculate percentages
  const activePercentage = stats.totalEmployees > 0 
    ? ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1) 
    : 0;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>📊 HR Overview Dashboard</h1>
          <p style={subtitleStyle}>Aggregate analytics, active staff distribution, and leave operations metrics.</p>
        </div>
        <button onClick={fetchStats} style={btnSecondaryStyle}>🔄 Refresh Metrics</button>
      </div>

      {/* Grid of indicators */}
      <div style={indicatorsGridStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardTitleStyle}>Total Headcount</span>
            <span style={iconStyle('#4f46e5', 'rgba(79, 70, 229, 0.1)')}>👥</span>
          </div>
          <div style={cardValueStyle}>{stats.totalEmployees}</div>
          <div style={cardFooterStyle}>
            <span style={{ color: '#10b981', fontWeight: '700' }}>{activePercentage}%</span> Active Staff
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardTitleStyle}>Departments</span>
            <span style={iconStyle('#10b981', 'rgba(16, 185, 129, 0.1)')}>🏢</span>
          </div>
          <div style={cardValueStyle}>{stats.totalDepartments}</div>
          <div style={cardFooterStyle}>
            Organization sections count
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardTitleStyle}>Pending Leaves</span>
            <span style={iconStyle('#f59e0b', 'rgba(245, 158, 11, 0.1)')}>⌛</span>
          </div>
          <div style={cardValueStyle}>{stats.pendingLeaveRequests}</div>
          <div style={cardFooterStyle}>
            Awaiting manager approval
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={cardTitleStyle}>Currently On Leave</span>
            <span style={iconStyle('#ef4444', 'rgba(239, 68, 68, 0.1)')}>🌴</span>
          </div>
          <div style={cardValueStyle}>{stats.employeesOnLeave}</div>
          <div style={cardFooterStyle}>
            Out-of-office today
          </div>
        </div>
      </div>

      {/* Analytics Visualization and Quick Links */}
      <div style={sectionsGridStyle}>
        {/* Active Ratio Visualizer */}
        <div style={visualizerCardStyle}>
          <h3 style={sectionHeadingStyle}>Staff Status Distribution</h3>
          <div style={barContainerStyle}>
            <div style={barLabelRowStyle}>
              <span>Active ({stats.activeEmployees})</span>
              <span>{activePercentage}%</span>
            </div>
            <div style={barOutlineStyle}>
              <div style={barProgressStyle(activePercentage, '#10b981')} />
            </div>
          </div>
          <div style={{ ...barContainerStyle, marginTop: '20px' }}>
            <div style={barLabelRowStyle}>
              <span>Inactive / Suspended ({stats.inactiveEmployees})</span>
              <span>{(100 - activePercentage).toFixed(1)}%</span>
            </div>
            <div style={barOutlineStyle}>
              <div style={barProgressStyle(100 - activePercentage, '#94a3b8')} />
            </div>
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div style={visualizerCardStyle}>
          <h3 style={sectionHeadingStyle}>Quick Operations Shortcuts</h3>
          <div style={shortcutGridStyle}>
            <Link to="/employees" style={shortcutLinkStyle('#eff6ff', '#2563eb')}>
              <span style={{ fontSize: '20px' }}>👥</span>
              <div>
                <strong>Add / Manage Employee</strong>
                <div style={shortcutSubStyle}>Create profile logs</div>
              </div>
            </Link>
            <Link to="/departments" style={shortcutLinkStyle('#ecfdf5', '#059669')}>
              <span style={{ fontSize: '20px' }}>🏢</span>
              <div>
                <strong>Update Departments</strong>
                <div style={shortcutSubStyle}>Design section layouts</div>
              </div>
            </Link>
            <Link to="/leaves" style={shortcutLinkStyle('#fffbeb', '#d97706')}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <div>
                <strong>Review Leave Logs</strong>
                <div style={shortcutSubStyle}>Check status indexes</div>
              </div>
            </Link>
            <Link to="/assets" style={shortcutLinkStyle('#faf5ff', '#7c3aed')}>
              <span style={{ fontSize: '20px' }}>💻</span>
              <div>
                <strong>Check Out Hardware</strong>
                <div style={shortcutSubStyle}>Register asset serials</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styling definitions
const containerStyle = {
  fontFamily: 'system-ui, sans-serif'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#1e1b4b',
  margin: 0
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0 0'
};

const btnSecondaryStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600',
  backgroundColor: '#ffffff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  cursor: 'pointer'
};

const indicatorsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  textAlign: 'left'
};

const cardTitleStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const iconStyle = (color, bg) => ({
  fontSize: '18px',
  color: color,
  backgroundColor: bg,
  height: '36px',
  width: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const cardValueStyle = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#1e293b',
  margin: '12px 0 6px 0'
};

const cardFooterStyle = {
  fontSize: '12px',
  color: '#64748b'
};

const sectionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '28px'
};

const visualizerCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '28px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  textAlign: 'left'
};

const sectionHeadingStyle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#1e293b',
  margin: '0 0 20px 0'
};

const barContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const barLabelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569'
};

const barOutlineStyle = {
  width: '100%',
  height: '10px',
  backgroundColor: '#f1f5f9',
  borderRadius: '9999px',
  overflow: 'hidden'
};

const barProgressStyle = (percentage, color) => ({
  width: `${percentage}%`,
  height: '100%',
  backgroundColor: color,
  borderRadius: '9999px'
});

const shortcutGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const shortcutLinkStyle = (bg, color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px',
  backgroundColor: bg,
  borderRadius: '10px',
  textDecoration: 'none',
  color: color,
  transition: 'transform 0.15s ease',
  textAlign: 'left'
});

const shortcutSubStyle = {
  fontSize: '11px',
  opacity: 0.8,
  marginTop: '2px'
};

const loaderStyle = {
  padding: '60px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: '600'
};

const errorAlertStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
  color: '#991b1b',
  padding: '16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600'
};

const emptyStateStyle = {
  padding: '40px',
  textAlign: 'center',
  color: '#94a3b8'
};

export default HRDashboard;
