import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import api from '../services/api';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const targetId = id && id !== 'me' ? id : user.id;

  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable Form fields state
  const [formFields, setFormFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    joiningDate: '',
    designation: '',
    employmentType: '',
    employmentStatus: '',
    departmentId: '',
    managerId: '',
    role: ''
  });

  const isSelf = targetId === user.id || targetId == 'me';
  const isAdminOrHr = user.role === 'ADMIN' || user.role === 'HR';

  useEffect(() => {
    fetchProfile();
    if (isAdminOrHr) {
      fetchDropdowns();
    }
  }, [targetId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      // If we don't have targetId (e.g. logging in without employee ID seeded yet, fallback to user.id)
      const empId = targetId || user.id;
      if (!empId) {
        throw new Error('No employee profile associated with this user.');
      }
      const data = await employeeService.getEmployeeById(empId);
      setProfile(data);
      setFormFields({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || 'Male',
        address: data.address || '',
        joiningDate: data.joiningDate || '',
        designation: data.designation || '',
        employmentType: data.employmentType || 'FULL_TIME',
        employmentStatus: data.employmentStatus || 'ACTIVE',
        departmentId: data.departmentId || '',
        managerId: data.managerId || '',
        role: data.role || 'EMPLOYEE'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee profile details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const deptRes = await api.get('/api/departments');
      setDepartments(deptRes.data || []);

      const empRes = await api.get('/api/employees', { params: { size: 100 } });
      setManagers(empRes.data.content || []);
    } catch (err) {
      // Ignore
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (isAdminOrHr) {
        // Full administrative update
        const updated = await employeeService.updateEmployee(targetId, formFields);
        setProfile(updated);
        setSuccess('Employee record updated successfully!');
      } else if (isSelf) {
        // Self contact details update
        const updated = await employeeService.updateEmployee(targetId, formFields);
        setProfile(updated);
        setSuccess('Profile details saved successfully.');
      } else {
        setError('You are not authorized to edit this profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={loaderContainerStyle}>Loading profile info...</div>;
  }

  if (error && !profile) {
    return (
      <div style={containerStyle}>
        <div style={errorAlertStyle}>⚠️ {error}</div>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header banner */}
      <div style={profileHeaderStyle}>
        <div style={avatarBoxStyle}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="" style={avatarImgStyle} />
          ) : (
            <span style={avatarPlaceholderStyle}>👤</span>
          )}
        </div>
        <div style={headerTextStyle}>
          <h1 style={titleStyle}>{profile.firstName} {profile.lastName}</h1>
          <p style={subtitleStyle}>{profile.designation} | {profile.departmentName || 'No Department'}</p>
          <span style={codeBadgeStyle}>{profile.employeeCode}</span>
        </div>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>
          ← Back
        </button>
      </div>

      {error && <div style={errorAlertStyle}>⚠️ {error}</div>}
      {success && <div style={successAlertStyle}>✅ {success}</div>}

      {/* Main Profile Form */}
      <form onSubmit={handleFormSubmit} style={formStyle}>
        <div style={sectionContainerStyle}>
          <h3 style={sectionTitleStyle}>Personal Details</h3>
          
          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formFields.firstName}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formFields.lastName}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formFields.email}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formFields.phone}
                onChange={handleInputChange}
                disabled={!isSelf && !isAdminOrHr}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formFields.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Gender</label>
              <select
                name="gender"
                value={formFields.gender}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Permanent Address *</label>
            <textarea
              name="address"
              value={formFields.address}
              onChange={handleInputChange}
              disabled={!isSelf && !isAdminOrHr}
              rows="3"
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div style={sectionContainerStyle}>
          <h3 style={sectionTitleStyle}>Contract & Role Details</h3>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formFields.joiningDate}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Designation</label>
              <input
                type="text"
                name="designation"
                value={formFields.designation}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Employment Type</label>
              <select
                name="employmentType"
                value={formFields.employmentType}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Employment Status</label>
              <select
                name="employmentStatus"
                value={formFields.employmentStatus}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
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
              <label style={labelStyle}>Department</label>
              <select
                name="departmentId"
                value={formFields.departmentId}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              >
                <option value="">No Department Assigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Manager</label>
              <select
                name="managerId"
                value={formFields.managerId}
                onChange={handleInputChange}
                disabled={!isAdminOrHr}
                style={inputStyle}
              >
                <option value="">No Manager Assigned</option>
                {managers
                  .filter((m) => m.id !== targetId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
              </select>
            </div>
          </div>

          {isAdminOrHr && (
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>System Access Role</label>
                <select
                  name="role"
                  value={formFields.role}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="HR">HR</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                {/* Spacer */}
              </div>
            </div>
          )}
        </div>

        {(isSelf || isAdminOrHr) && (
          <div style={footerStyle}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={saveBtnStyle}
            >
              {saving ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// Styling Variables for Premium Look
const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '32px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  textAlign: 'left'
};

const loaderContainerStyle = {
  padding: '60px 0',
  textAlign: 'center',
  color: '#64748b'
};

const profileHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '24px',
  marginBottom: '32px',
  position: 'relative'
};

const avatarBoxStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#f1f5f9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden'
};

const avatarPlaceholderStyle = {
  fontSize: '40px'
};

const avatarImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const headerTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#1e293b',
  margin: 0
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: 0
};

const codeBadgeStyle = {
  display: 'inline-block',
  width: 'fit-content',
  padding: '3px 10px',
  backgroundColor: 'rgba(79, 70, 229, 0.1)',
  color: '#4f46e5',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700'
};

const backBtnStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer'
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

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
};

const sectionContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const sectionTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#4f46e5',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '8px',
  margin: 0
};

const formRowStyle = {
  display: 'flex',
  gap: '20px'
};

const formGroupStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px'
};

const saveBtnStyle = {
  padding: '12px 28px',
  fontSize: '15px'
};

export default EmployeeProfile;
