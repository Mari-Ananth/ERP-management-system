import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import Departments from './pages/Departments';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Assets from './pages/Assets';
import Users from './pages/Users';
import HRDashboard from './pages/HRDashboard';

// Simple placeholder dashboards to verify successful RBAC logins
const DashboardRedirector = () => {
  const { user } = useAuth();

  // Redirect Admin & HR to HR Dashboard
  if (user.role === 'ADMIN' || user.role === 'HR') {
    return <HRDashboard />;
  }

  const getDashboardTitle = () => {
    switch (user.role) {
      case 'MANAGER': return 'Manager Dashboard';
      case 'FINANCE': return 'Finance Panel';
      case 'EMPLOYEE': return 'Employee Portal';
      default: return 'Employee Resource Management (ERP)';
    }
  };

  return (
    <div style={cardStyle} className="animate-fade-in">
      <h2 style={cardTitleStyle}>{getDashboardTitle()}</h2>
      <p style={cardBodyStyle}>
        You have successfully authenticated via JWT. You are currently logged in with the email: <code>{user.email}</code>.
      </p>
      <div style={badgeStyle(user.role)}>{user.role} ACCESS</div>
      
      <div style={modulesListStyle}>
        <p style={{fontWeight: '700', marginBottom: '12px', color: '#1e293b'}}>Your Shortcuts:</p>
        <div style={modulesGridStyle}>
          {user.role === 'EMPLOYEE' && (
            <>
              <a href={`/profile/${user.id || 'me'}`} style={linkShortcutStyle}>👤 My Profile</a>
              <a href="/leaves" style={linkShortcutStyle}>📅 My Leaves</a>
              <a href="/payroll" style={linkShortcutStyle}>💳 My Payroll</a>
              <a href="/assets" style={linkShortcutStyle}>💻 My Assets</a>
            </>
          )}
          {user.role === 'MANAGER' && (
            <>
              <a href="/team" style={linkShortcutStyle}>👥 My Team</a>
              <a href="/leaves" style={linkShortcutStyle}>📅 Leave Requests</a>
            </>
          )}
          {user.role === 'FINANCE' && (
            <a href="/payroll" style={linkShortcutStyle}>💳 Payroll Management</a>
          )}
        </div>
      </div>
    </div>
  );
};

const linkShortcutStyle = {
  display: 'block',
  padding: '16px',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  color: '#4f46e5',
  textAlign: 'center'
};

// Styling for placeholder layout
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  textAlign: 'left'
};

const cardTitleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1e1b4b',
  margin: '0 0 12px 0'
};

const cardBodyStyle = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px 0'
};

const badgeStyle = (role) => {
  let color = '#4f46e5';
  let bg = 'rgba(79, 70, 229, 0.1)';
  
  if (role === 'ADMIN') {
    color = '#dc2626';
    bg = '#fef2f2';
  } else if (role === 'HR') {
    color = '#059669';
    bg = '#ecfdf5';
  } else if (role === 'MANAGER') {
    color = '#2563eb';
    bg = '#eff6ff';
  } else if (role === 'FINANCE') {
    color = '#7c3aed';
    bg = '#faf5ff';
  }
  
  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '700',
    color: color,
    backgroundColor: bg,
    marginBottom: '24px'
  };
};

const modulesListStyle = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px'
};

const modulesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '16px',
  marginTop: '12px'
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Redirector */}
            <Route index element={<DashboardRedirector />} />
            
            {/* Employee Management Views */}
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Module routes */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="leaves"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE']}>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="payroll"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE']}>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE']}>
                  <Assets />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="team"
              element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* Fallback to Root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
