import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import api from '../services/api';

const EmployeeList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Filter States
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    designation: '',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    departmentId: '',
    managerId: '',
    password: '',
    role: 'EMPLOYEE'
  });

  const isEditableRole = user.role === 'ADMIN' || user.role === 'HR';

  useEffect(() => {
    fetchEmployees();
    fetchDropdowns();
  }, [search, deptFilter, statusFilter, currentPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: search || undefined,
        departmentId: deptFilter || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
        sortDir: 'asc'
      };
      const data = await employeeService.getEmployees(params);
      setEmployees(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      // Fetch departments
      const deptRes = await api.get('/api/departments');
      setDepartments(deptRes.data || []);

      // Fetch potential managers (admins/managers/hr roles, or all employees list)
      const empRes = await api.get('/api/employees', { params: { size: 100 } });
      setManagers(empRes.data.content || []);
    } catch (err) {
      // Fallback or ignore dropdown errors gracefully
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setModalType('create');
    setSelectedEmpId(null);
    setFormFields({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: '',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      departmentId: '',
      managerId: '',
      password: '',
      role: 'EMPLOYEE'
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setModalType('edit');
    setSelectedEmpId(emp.id);
    setFormFields({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth || '',
      gender: emp.gender || 'Male',
      address: emp.address || '',
      joiningDate: emp.joiningDate || '',
      designation: emp.designation || '',
      employmentType: emp.employmentType || 'FULL_TIME',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
      departmentId: emp.departmentId || '',
      managerId: emp.managerId || '',
      password: '', // optional on update
      role: emp.role || 'EMPLOYEE'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Quick validation
    if (!formFields.firstName || !formFields.lastName || !formFields.email || !formFields.designation) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      if (modalType === 'create') {
        await employeeService.createEmployee(formFields);
        setSuccess('Employee created successfully!');
      } else {
        await employeeService.updateEmployee(selectedEmpId, formFields);
        setSuccess('Employee details updated successfully!');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.email || 'Failed to save employee records.');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate employee: ${name}? This will terminate their contract and disable their login account.`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await employeeService.deactivateEmployee(id);
      setSuccess(`Employee ${name} deactivated successfully.`);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate employee.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Employee Directory</h1>
          <p style={subtitleStyle}>View, search, filter, and manage company staff directory</p>
        </div>
        {isEditableRole && (
          <button onClick={openCreateModal} style={addBtnStyle}>
            ➕ Add Employee
          </button>
        )}
      </div>

      {/* Message banners */}
      {error && <div style={errorAlertStyle}>⚠️ {error}</div>}
      {success && <div style={successAlertStyle}>✅ {success}</div>}

      {/* Filter panel */}
      <div style={filterPanelStyle}>
        <input
          type="text"
          placeholder="Search by name, email, or code..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
          style={searchInputStyle}
        />
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(0); }}
          style={filterInputStyle}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
          style={filterInputStyle}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="ON_NOTICE">ON NOTICE</option>
          <option value="TERMINATED">TERMINATED</option>
        </select>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div style={loaderStyle}>Loading staff records...</div>
      ) : employees.length === 0 ? (
        <div style={emptyStateStyle}>No employees found matching the filters.</div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Designation</th>
                <th style={thStyle}>Employment Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={tableRowStyle}>
                  <td style={tdCodeStyle}>{emp.employeeCode}</td>
                  <td style={tdNameStyle}>{emp.firstName} {emp.lastName}</td>
                  <td style={tdStyle}>{emp.email}</td>
                  <td style={tdStyle}>{emp.departmentName || 'N/A'}</td>
                  <td style={tdStyle}>{emp.designation}</td>
                  <td style={tdStyle}>{emp.employmentType?.replace('_', ' ')}</td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle(emp.employmentStatus)}>
                      {emp.employmentStatus}
                    </span>
                  </td>
                  <td style={tdActionStyle}>
                    <button 
                      onClick={() => navigate(`/profile/${emp.id}`)}
                      style={actionBtnStyle('#4f46e5', 'rgba(79, 70, 229, 0.1)')}
                    >
                      👁️ View
                    </button>
                    {isEditableRole && (
                      <>
                        <button 
                          onClick={() => openEditModal(emp)}
                          style={actionBtnStyle('#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                        >
                          ✏️ Edit
                        </button>
                        {emp.employmentStatus !== 'TERMINATED' && (
                          <button 
                            onClick={() => handleDeactivate(emp.id, `${emp.firstName} ${emp.lastName}`)}
                            style={actionBtnStyle('#ef4444', 'rgba(239, 68, 68, 0.1)')}
                          >
                            ❌ Terminate
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={paginationStyle}>
              <button 
                disabled={currentPage === 0} 
                onClick={() => setCurrentPage(currentPage - 1)}
                style={pageBtnStyle}
              >
                Previous
              </button>
              <span style={pageSpanStyle}>Page {currentPage + 1} of {totalPages}</span>
              <button 
                disabled={currentPage >= totalPages - 1} 
                onClick={() => setCurrentPage(currentPage + 1)}
                style={pageBtnStyle}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Management Modal Popup */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{margin: 0}}>{modalType === 'create' ? 'Create Employee Profile' : 'Edit Employee Details'}</h2>
              <button onClick={() => setShowModal(false)} style={closeModalBtnStyle}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={formStyle}>
              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formFields.firstName}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                    required
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formFields.lastName}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                    required
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formFields.email}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                    required
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formFields.phone}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formFields.dateOfBirth}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Gender</label>
                  <select
                    name="gender"
                    value={formFields.gender}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Address</label>
                <textarea
                  name="address"
                  value={formFields.address}
                  onChange={handleInputChange}
                  rows="2"
                  style={modalInputStyle}
                />
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Joining Date *</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formFields.joiningDate}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                    required
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    value={formFields.designation}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    style={modalInputStyle}
                    required
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Employment Type</label>
                  <select
                    name="employmentType"
                    value={formFields.employmentType}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formFields.employmentStatus}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ON_NOTICE">ON NOTICE</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Department</label>
                  <select
                    name="departmentId"
                    value={formFields.departmentId}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="">No Department Assigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Manager/Team Lead</label>
                  <select
                    name="managerId"
                    value={formFields.managerId}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                  >
                    <option value="">No Manager Assigned</option>
                    {managers
                      .filter((m) => m.id !== selectedEmpId) // avoid assigning self as manager
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>ERP User Role *</label>
                  <select
                    name="role"
                    value={formFields.role}
                    onChange={handleInputChange}
                    style={modalInputStyle}
                    required
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Staff)</option>
                    <option value="MANAGER">MANAGER (Team Lead)</option>
                    <option value="HR">HR (Human Resources Manager)</option>
                    <option value="FINANCE">FINANCE (Payroll Specialist)</option>
                    <option value="ADMIN">ADMIN (System Administrator)</option>
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>
                    Password {modalType === 'edit' ? '(Leave empty to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formFields.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    style={modalInputStyle}
                    required={modalType === 'create'}
                  />
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalType === 'create' ? 'Create Employee' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Styles
const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '30px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#1e293b',
  margin: '0 0 4px 0'
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: 0
};

const addBtnStyle = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  padding: '10px 18px'
};

const errorAlertStyle = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '20px',
  fontSize: '14px'
};

const successAlertStyle = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  color: '#065f46',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '20px',
  fontSize: '14px'
};

const filterPanelStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  flexWrap: 'wrap'
};

const searchInputStyle = {
  flex: 1,
  minWidth: '240px'
};

const filterInputStyle = {
  minWidth: '160px'
};

const loaderStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: '#64748b'
};

const emptyStateStyle = {
  padding: '40px 0',
  textAlign: 'center',
  color: '#64748b',
  border: '1px dashed #cbd5e1',
  borderRadius: '8px'
};

const tableContainerStyle = {
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle = {
  borderBottom: '2px solid #e2e8f0'
};

const thStyle = {
  padding: '12px 16px',
  fontWeight: '700',
  fontSize: '13px',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableRowStyle = {
  borderBottom: '1px solid #f1f5f9',
  transition: 'background-color 0.15s ease'
};

const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#334155'
};

const tdCodeStyle = {
  ...tdStyle,
  fontWeight: '700',
  color: '#4f46e5'
};

const tdNameStyle = {
  ...tdStyle,
  fontWeight: '600',
  color: '#1e293b'
};

const tdActionStyle = {
  ...tdStyle,
  display: 'flex',
  gap: '8px'
};

const actionBtnStyle = (color, bg) => ({
  color: color,
  backgroundColor: bg,
  padding: '6px 12px',
  fontSize: '12px',
  borderRadius: '6px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer'
});

const statusBadgeStyle = (status) => {
  let color = '#475569';
  let bg = '#e2e8f0';

  if (status === 'ACTIVE') {
    color = '#065f46';
    bg = '#d1fae5';
  } else if (status === 'TERMINATED') {
    color = '#991b1b';
    bg = '#fee2e2';
  } else if (status === 'ON_NOTICE') {
    color = '#92400e';
    bg = '#fef3c7';
  }

  return {
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    color,
    backgroundColor: bg
  };
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '12px',
  marginTop: '20px'
};

const pageBtnStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer'
};

const pageSpanStyle = {
  fontSize: '13px',
  color: '#64748b'
};

// Modal styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  padding: '28px',
  boxSizing: 'border-box'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '14px',
  marginBottom: '20px'
};

const closeModalBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '28px',
  color: '#64748b',
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const formRowStyle = {
  display: 'flex',
  gap: '16px'
};

const formGroupStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  textAlign: 'left'
};

const formLabelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569'
};

const modalInputStyle = {
  width: '100%'
};

const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '16px',
  marginTop: '10px'
};

export default EmployeeList;
