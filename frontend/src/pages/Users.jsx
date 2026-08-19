import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE');

  // Filters state
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterEnabled, setFilterEnabled] = useState('');

  const rolesList = ['ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE'];

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole, filterEnabled]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || null,
        role: filterRole || null,
        enabled: filterEnabled !== '' ? filterEnabled === 'true' : null
      };
      const data = await userService.getAllUsers(params);
      setUsers(data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      alert('You cannot deactivate your own admin account.');
      return;
    }
    const nextStatus = !user.enabled;
    const confirmMsg = `Are you sure you want to ${nextStatus ? 'ACTIVATE' : 'DEACTIVATE'} this user account?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    try {
      await userService.toggleUserStatus(user.id, nextStatus);
      setSuccessMsg(`User status changed successfully!`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to change user status.');
    }
  };

  const handleOpenRoleModal = (user) => {
    if (user.id === currentUser.id) {
      alert('You cannot change your own user role.');
      return;
    }
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserRole(selectedUser.id, selectedRole);
      setSuccessMsg('User role updated successfully!');
      setShowRoleModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update user role.');
    }
  };

  return (
    <div style={containerStyle}>
      {successMsg && <div style={successAlertStyle}>{successMsg}</div>}
      {error && <div style={errorAlertStyle}>{error}</div>}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>👤 User Account Management</h1>
          <p style={subtitleStyle}>Control login accounts, toggle active status, and assign security roles.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div style={filterGridStyle}>
        <input
          type="text"
          placeholder="Search by email or employee code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={filterInputStyle}
        >
          <option value="">-- All Roles --</option>
          {rolesList.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filterEnabled}
          onChange={(e) => setFilterEnabled(e.target.value)}
          style={filterInputStyle}
        >
          <option value="">-- All Statuses --</option>
          <option value="true">Active (Enabled)</option>
          <option value="false">Inactive (Disabled)</option>
        </select>
      </div>

      {/* Table view */}
      {loading ? (
        <div style={loaderStyle}>Loading user accounts...</div>
      ) : users.length === 0 ? (
        <div style={emptyStateStyle}>No user accounts found.</div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>User Account</th>
                <th style={thStyle}>Employee Details</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thRightStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={tableRowStyle}>
                  <td style={tdBoldStyle}>
                    <div>{user.email}</div>
                    {user.id === currentUser.id && (
                      <span style={selfBadgeStyle}>Your Account</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {user.employeeName ? (
                      <div>
                        <strong>{user.employeeName}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {user.employeeCode}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>System administrator</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={roleBadgeStyle(user.role)}>{user.role}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle(user.enabled)}>{user.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                  </td>
                  <td style={tdRightStyle}>
                    {user.id !== currentUser.id ? (
                      <div style={actionsContainerStyle}>
                        <button onClick={() => handleOpenRoleModal(user)} style={btnActionStyle}>🔑 Assign Role</button>
                        <button onClick={() => handleToggleStatus(user)} style={btnActionStyle}>
                          🔄 {user.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CHANGE ROLE MODAL --- */}
      {showRoleModal && selectedUser && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Update User Role</h2>
            <form onSubmit={handleRoleChange}>
              <div style={{ marginBottom: '14px', fontSize: '14px', color: '#475569' }}>
                Account: <strong>{selectedUser.email}</strong>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Select System Role</label>
                <select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={inputStyle}
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
                Warning: Changing the role will immediately adjust this user's page permissions and API access bounds.
              </p>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowRoleModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling
const containerStyle = {
  fontFamily: 'system-ui, sans-serif'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
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

const filterGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 180px 180px',
  gap: '16px',
  marginBottom: '24px'
};

const searchInputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none'
};

const filterInputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  outline: 'none'
};

const tableContainerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle = {
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
};

const thStyle = {
  padding: '14px 20px',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const thRightStyle = {
  ...thStyle,
  textAlign: 'right'
};

const tableRowStyle = {
  borderBottom: '1px solid #f1f5f9'
};

const tdStyle = {
  padding: '16px 20px',
  fontSize: '14px',
  color: '#334155'
};

const tdBoldStyle = {
  ...tdStyle,
  fontWeight: '700',
  color: '#1e293b'
};

const tdRightStyle = {
  ...tdStyle,
  textAlign: 'right'
};

const selfBadgeStyle = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: '700',
  backgroundColor: '#f1f5f9',
  color: '#4f46e5',
  padding: '1px 5px',
  borderRadius: '4px',
  marginTop: '4px'
};

const roleBadgeStyle = (role) => {
  let bg = '#f1f5f9';
  let color = '#475569';
  
  if (role === 'ADMIN') {
    bg = '#fef2f2';
    color = '#dc2626';
  } else if (role === 'HR') {
    bg = '#ecfdf5';
    color = '#059669';
  } else if (role === 'MANAGER') {
    bg = '#eff6ff';
    color = '#2563eb';
  } else if (role === 'FINANCE') {
    bg = '#faf5ff';
    color = '#7c3aed';
  }

  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: bg,
    color: color
  };
};

const statusBadgeStyle = (enabled) => {
  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: enabled ? '#ecfdf5' : '#f1f5f9',
    color: enabled ? '#047857' : '#64748b'
  };
};

const actionsContainerStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end'
};

const btnActionStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#334155',
  cursor: 'pointer'
};

const successAlertStyle = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  color: '#065f46',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '14px',
  fontWeight: '600'
};

const errorAlertStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
  color: '#991b1b',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '14px',
  fontWeight: '600'
};

const loaderStyle = {
  padding: '40px',
  textAlign: 'center',
  color: '#64748b',
  fontWeight: '600'
};

const emptyStateStyle = {
  padding: '40px',
  textAlign: 'center',
  color: '#94a3b8',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px dashed #cbd5e1'
};

// Modals
const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '28px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const modalTitleStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#1e293b',
  margin: 0,
  marginBottom: '16px',
  textAlign: 'left'
};

const formGroupStyle = {
  marginBottom: '18px',
  textAlign: 'left'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const modalActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '28px'
};

const btnCancelStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: 'none',
  cursor: 'pointer'
};

const btnSubmitStyle = {
  ...btnCancelStyle,
  backgroundColor: '#4f46e5',
  color: '#ffffff'
};

export default Users;
