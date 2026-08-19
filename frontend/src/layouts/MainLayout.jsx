import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const role = user.role;

  // Define sidebar links based on user role
  const getSidebarLinks = () => {
    const dashboardLink = { path: '/', label: '📊 Dashboard' };
    
    switch (role) {
      case 'ADMIN':
        return [
          dashboardLink,
          { path: '/employees', label: '👥 Employees' },
          { path: '/departments', label: '🏢 Departments' },
          { path: '/leaves', label: '📅 Leaves' },
          { path: '/payroll', label: '💳 Payroll' },
          { path: '/assets', label: '💻 Assets' },
          { path: '/users', label: '👤 User Management' }
        ];
      case 'HR':
        return [
          dashboardLink,
          { path: '/employees', label: '👥 Employees' },
          { path: '/departments', label: '🏢 Departments' },
          { path: '/leaves', label: '📅 Leaves' }
        ];
      case 'MANAGER':
        return [
          dashboardLink,
          { path: '/team', label: '👥 My Team' },
          { path: '/leaves', label: '📅 Leave Requests' }
        ];
      case 'FINANCE':
        return [
          dashboardLink,
          { path: '/payroll', label: '💳 Payroll Management' }
        ];
      case 'EMPLOYEE':
        return [
          dashboardLink,
          { path: `/profile/${user.id || 'me'}`, label: '👤 My Profile' },
          { path: '/leaves', label: '📅 My Leaves' },
          { path: '/payroll', label: '💳 My Payroll' },
          { path: '/assets', label: '💻 My Assets' }
        ];
      default:
        return [dashboardLink];
    }
  };

  const links = getSidebarLinks();

  return (
    <div style={layoutContainerStyle}>
      {/* Top Navbar */}
      <nav style={navbarStyle}>
        <div style={navLeftStyle}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={toggleSidebarBtnStyle}
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <span style={logoStyle}>💼 ERP System</span>
        </div>
        <div style={navRightStyle}>
          <div style={profileBadgeStyle}>
            <span style={profileIconStyle}>👤</span>
            <div style={profileInfoStyle}>
              <span style={userNameStyle}>{user.firstName} {user.lastName}</span>
              <span style={userRoleStyle}>{user.role}</span>
            </div>
          </div>
          <button onClick={logout} style={logoutBtnStyle}>Sign Out</button>
        </div>
      </nav>

      {/* Main Body (Sidebar + Content) */}
      <div style={bodyContainerStyle}>
        {/* Sidebar */}
        <aside style={sidebarStyle(sidebarOpen)}>
          <div style={sidebarMenuHeaderStyle}>NAVIGATION</div>
          <ul style={menuListStyle}>
            {links.map((link) => {
              // Active link checking
              const isActive = location.pathname === link.path || 
                (link.path !== '/' && location.pathname.startsWith(link.path));
              
              return (
                <li key={link.path} style={{ marginBottom: '8px' }}>
                  <Link 
                    to={link.path} 
                    style={menuLinkStyle(isActive)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Content Panel */}
        <main style={contentPanelStyle}>
          <div style={contentWrapperStyle}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// CSS styles in JS for layout structure
const layoutContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  backgroundColor: '#f8fafc'
};

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '64px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '0 24px',
  zIndex: 100,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
};

const navLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const toggleSidebarBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  color: '#64748b',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const logoStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#4f46e5'
};

const navRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const profileBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const profileIconStyle = {
  fontSize: '24px',
  backgroundColor: '#f1f5f9',
  padding: '6px',
  borderRadius: '50%'
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const userNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e293b'
};

const userRoleStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748b',
  letterSpacing: '0.5px'
};

const logoutBtnStyle = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  border: 'none'
};

const bodyContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  height: 'calc(100vh - 64px)',
  overflow: 'hidden'
};

const sidebarStyle = (isOpen) => ({
  width: isOpen ? '250px' : '0px',
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e2e8f0',
  padding: isOpen ? '24px 16px' : '0px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.25s ease-in-out',
  overflowY: 'auto',
  boxSizing: 'border-box'
});

const sidebarMenuHeaderStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#94a3b8',
  letterSpacing: '1px',
  marginBottom: '16px',
  textAlign: 'left',
  paddingLeft: '12px'
};

const menuListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const menuLinkStyle = (isActive) => ({
  display: 'block',
  padding: '10px 14px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'left',
  color: isActive ? '#ffffff' : '#475569',
  backgroundColor: isActive ? '#4f46e5' : 'transparent',
  transition: 'all 0.15s ease',
  boxShadow: isActive ? '0 4px 10px rgba(79, 70, 229, 0.2)' : 'none'
});

const contentPanelStyle = {
  flex: 1,
  height: '100%',
  overflowY: 'auto',
  backgroundColor: '#f8fafc',
  padding: '32px',
  boxSizing: 'border-box'
};

const contentWrapperStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  height: '100%'
};

export default MainLayout;
export { menuLinkStyle }; // for potential reuse
