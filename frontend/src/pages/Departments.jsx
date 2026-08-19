import React, { useState, useEffect } from 'react';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import { useAuth } from '../context/AuthContext';

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  
  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeptEmployees, setSelectedDeptEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formManagerId, setFormManagerId] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');

  const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR';

  useEffect(() => {
    fetchDepartments();
    if (isAdminOrHR) {
      fetchEmployees();
    }
  }, [search]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getDepartments(search);
      setDepartments(data);
      setError('');
    } catch (err) {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees({ size: 1000 });
      setEmployees(data.content || []);
    } catch (err) {
      console.error('Failed to load employee list for manager assignment', err);
    }
  };

  const handleOpenAdd = () => {
    setFormCode('');
    setFormName('');
    setFormDesc('');
    setFormManagerId('');
    setFormStatus('ACTIVE');
    setShowAddModal(true);
  };

  const handleOpenEdit = (dept) => {
    setCurrentDept(dept);
    setFormCode(dept.departmentCode || '');
    setFormName(dept.name || '');
    setFormDesc(dept.description || '');
    setFormManagerId(dept.managerId || '');
    setFormStatus(dept.status || 'ACTIVE');
    setShowEditModal(true);
  };

  const handleOpenDetails = async (dept) => {
    setCurrentDept(dept);
    setShowDetailsModal(true);
    setLoadingEmployees(true);
    try {
      const data = await departmentService.getEmployeesInDepartment(dept.id);
      setSelectedDeptEmployees(data || []);
    } catch (err) {
      console.error(err);
      setSelectedDeptEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formCode || !formName) {
      setError('Department code and name are required.');
      return;
    }
    try {
      await departmentService.createDepartment({
        departmentCode: formCode,
        name: formName,
        description: formDesc,
        managerId: formManagerId || null,
        status: formStatus
      });
      setSuccessMsg('Department created successfully!');
      setShowAddModal(false);
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formCode || !formName) {
      setError('Department code and name are required.');
      return;
    }
    try {
      await departmentService.updateDepartment(currentDept.id, {
        departmentCode: formCode,
        name: formName,
        description: formDesc,
        managerId: formManagerId || null,
        status: formStatus
      });
      setSuccessMsg('Department updated successfully!');
      setShowEditModal(false);
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const handleToggleStatus = async (dept) => {
    const nextStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await departmentService.changeStatus(dept.id, nextStatus);
      setSuccessMsg(`Department marked as ${nextStatus}!`);
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to change status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }
    try {
      await departmentService.deleteDepartment(id);
      setSuccessMsg('Department deleted successfully!');
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department. Make sure the department contains no employees.');
    }
  };

  // Stats derived
  const activeCount = departments.filter(d => d.status === 'ACTIVE').length;
  const totalCount = departments.length;
  const staffedCount = departments.filter(d => d.managerId).length;

  return (
    <div style={containerStyle}>
      {/* Success/Error Alerts */}
      {successMsg && <div style={successAlertStyle}>{successMsg}</div>}
      {error && <div style={errorAlertStyle}>{error}</div>}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>🏢 Department Management</h1>
          <p style={subtitleStyle}>Create, configure, and monitor organization departments.</p>
        </div>
        {isAdminOrHR && (
          <button onClick={handleOpenAdd} style={btnPrimaryStyle}>
            + Add Department
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle('#4f46e5', 'rgba(79, 70, 229, 0.1)')}>🏢</div>
          <div>
            <div style={statLabelStyle}>Total Departments</div>
            <div style={statValStyle}>{totalCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle('#10b981', 'rgba(16, 185, 129, 0.1)')}>🟢</div>
          <div>
            <div style={statLabelStyle}>Active Departments</div>
            <div style={statValStyle}>{activeCount}</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle('#f59e0b', 'rgba(245, 158, 11, 0.1)')}>👤</div>
          <div>
            <div style={statLabelStyle}>Assigned Managers</div>
            <div style={statValStyle}>{staffedCount} / {totalCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Content Table */}
      {loading ? (
        <div style={loaderStyle}>Loading departments...</div>
      ) : departments.length === 0 ? (
        <div style={emptyStateStyle}>No departments found.</div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Department Name</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Employees</th>
                <th style={thRightStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} style={tableRowStyle}>
                  <td style={tdBoldStyle}>{dept.departmentCode}</td>
                  <td style={tdStyle}>
                    <div>{dept.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{dept.description}</div>
                  </td>
                  <td style={tdStyle}>
                    {dept.managerName ? (
                      <span style={managerBadgeStyle}>{dept.managerName}</span>
                    ) : (
                      <span style={noManagerStyle}>No manager assigned</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle(dept.status)}>
                      {dept.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleOpenDetails(dept)} style={countLinkStyle}>
                      👥 {dept.employeeCount || 0} Employees
                    </button>
                  </td>
                  <td style={tdRightStyle}>
                    {isAdminOrHR ? (
                      <div style={actionsContainerStyle}>
                        <button onClick={() => handleOpenEdit(dept)} style={btnActionStyle}>✏️ Edit</button>
                        <button onClick={() => handleToggleStatus(dept)} style={btnActionStyle}>
                          🔄 {dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.role === 'ADMIN' && (
                          <button onClick={() => handleDelete(dept.id)} style={btnDeleteActionStyle}>🗑️ Delete</button>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>Read-only Access</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Create New Department</h2>
            <form onSubmit={handleCreate}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT, HR, FIN"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  placeholder="Provide a description..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Assign Manager</label>
                <select
                  value={formManagerId}
                  onChange={(e) => setFormManagerId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Select Manager --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                  ))}
                </select>
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowAddModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Edit Department</h2>
            <form onSubmit={handleUpdate}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Department Code</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Department Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Assign Manager</label>
                <select
                  value={formManagerId}
                  onChange={(e) => setFormManagerId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Select Manager --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                  ))}
                </select>
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowEditModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL (EMPLOYEES LIST) --- */}
      {showDetailsModal && (
        <div style={modalBackdropStyle}>
          <div style={modalLargeContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Department Members: {currentDept?.name}</h2>
              <button onClick={() => setShowDetailsModal(false)} style={closeBtnStyle}>✕</button>
            </div>
            
            {loadingEmployees ? (
              <div style={loaderStyle}>Loading department employees...</div>
            ) : selectedDeptEmployees.length === 0 ? (
              <div style={emptyStateStyle}>No employees assigned to this department.</div>
            ) : (
              <div style={employeeListScrollStyle}>
                <table style={miniTableStyle}>
                  <thead>
                    <tr>
                      <th style={miniThStyle}>Code</th>
                      <th style={miniThStyle}>Name</th>
                      <th style={miniThStyle}>Designation</th>
                      <th style={miniThStyle}>Email</th>
                      <th style={miniThStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDeptEmployees.map(emp => (
                      <tr key={emp.id} style={tableRowStyle}>
                        <td style={tdBoldStyle}>{emp.employeeCode}</td>
                        <td style={tdStyle}>{emp.firstName} {emp.lastName}</td>
                        <td style={tdStyle}>{emp.designation}</td>
                        <td style={tdStyle}>{emp.email}</td>
                        <td style={tdStyle}>
                          <span style={statusBadgeStyle(emp.employmentStatus)}>
                            {emp.employmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ ...modalActionsStyle, borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button type="button" onClick={() => setShowDetailsModal(false)} style={btnSubmitStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling Object
const containerStyle = {
  fontFamily: 'system-ui, sans-serif'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '28px'
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

const btnPrimaryStyle = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
  transition: 'transform 0.15s ease'
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

const statCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
};

const statIconStyle = (color, bg) => ({
  fontSize: '24px',
  color: color,
  backgroundColor: bg,
  height: '48px',
  width: '48px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const statLabelStyle = {
  fontSize: '13px',
  color: '#64748b',
  fontWeight: '500'
};

const statValStyle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1e293b'
};

const filterBarStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px'
};

const searchInputStyle = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
};

const tableContainerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
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
  borderBottom: '1px solid #f1f5f9',
  transition: 'background-color 0.15s ease'
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

const managerBadgeStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: '#eff6ff',
  color: '#1d4ed8'
};

const noManagerStyle = {
  fontSize: '12px',
  color: '#94a3b8',
  fontStyle: 'italic'
};

const countLinkStyle = {
  background: 'none',
  border: 'none',
  color: '#4f46e5',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer',
  padding: 0
};

const statusBadgeStyle = (status) => {
  let bg = '#f1f5f9';
  let color = '#475569';
  if (status === 'ACTIVE') {
    bg = '#ecfdf5';
    color = '#047857';
  } else if (status === 'INACTIVE' || status === 'TERMINATED') {
    bg = '#fef2f2';
    color = '#b91c1c';
  }
  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: bg,
    color: color
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
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const btnDeleteActionStyle = {
  ...btnActionStyle,
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
  borderColor: '#fee2e2'
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
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const modalLargeContentStyle = {
  ...modalContentStyle,
  maxWidth: '720px'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '16px',
  marginBottom: '20px'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#94a3b8',
  cursor: 'pointer'
};

const modalTitleStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#1e293b',
  margin: 0
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

const textareaStyle = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical'
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

const employeeListScrollStyle = {
  maxHeight: '360px',
  overflowY: 'auto',
  marginBottom: '20px'
};

const miniTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const miniThStyle = {
  padding: '10px 12px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748b',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  textTransform: 'uppercase'
};

export default Departments;
