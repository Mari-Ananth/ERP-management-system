import React, { useState, useEffect } from 'react';
import leaveService from '../services/leaveService';
import departmentService from '../services/departmentService';
import { useAuth } from '../context/AuthContext';

const Leaves = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('history'); // history, team, admin, types
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Apply Form states
  const [applyTypeId, setApplyTypeId] = useState('');
  const [applyStart, setApplyStart] = useState('');
  const [applyEnd, setApplyEnd] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [applyInformHr, setApplyInformHr] = useState(false);


  // Reject Form states
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Leave Type Form states
  const [currentType, setCurrentType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeLimit, setTypeLimit] = useState(12);
  const [typePaid, setTypePaid] = useState(true);
  const [typeStatus, setTypeStatus] = useState('ACTIVE');

  // Filters for Admin view
  const [filterEmpId, setFilterEmpId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const isManager = user.role === 'MANAGER';
  const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR';

  useEffect(() => {
    // Set default active tab based on role
    if (isAdminOrHR) {
      setActiveTab('admin');
    } else if (isManager) {
      setActiveTab('team');
    } else {
      setActiveTab('history');
    }
    
    loadCommonData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyHistory();
    } else if (activeTab === 'team' && (isManager || isAdminOrHR)) {
      fetchTeamRequests();
    } else if (activeTab === 'admin' && isAdminOrHR) {
      fetchAllRequests();
    } else if (activeTab === 'types' && isAdminOrHR) {
      fetchLeaveTypes();
    }
  }, [activeTab, filterDeptId, filterTypeId, filterStatus]);

  const loadCommonData = async () => {
    try {
      setLoading(true);
      // Fetch leave balances for user
      if (user.id) {
        const balData = await leaveService.getMyBalances();
        setBalances(balData || []);
      }
      
      const typesData = await leaveService.getLeaveTypes();
      setLeaveTypes(typesData || []);

      if (isAdminOrHR) {
        const deptData = await departmentService.getDepartments();
        setDepartments(deptData || []);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load leave settings/balances.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHistory = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getMyLeaves();
      setMyRequests(data || []);
      
      // Update balances again to sync
      const balData = await leaveService.getMyBalances();
      setBalances(balData || []);
    } catch (err) {
      setError('Failed to load personal leave history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getTeamLeaves();
      setTeamRequests(data || []);
    } catch (err) {
      setError('Failed to load team requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: filterDeptId || null,
        leaveTypeId: filterTypeId || null,
        status: filterStatus || null
      };
      const data = await leaveService.getAllLeaves(params);
      setAllRequests(data || []);
    } catch (err) {
      setError('Failed to load all organization leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getLeaveTypes();
      setLeaveTypes(data || []);
    } catch (err) {
      setError('Failed to load leave types.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyTypeId || !applyStart || !applyEnd || !applyReason) {
      setError('All fields are required.');
      return;
    }
    try {
      await leaveService.applyLeave({
        leaveTypeId: applyTypeId,
        startDate: applyStart,
        endDate: applyEnd,
        reason: applyReason,
        informHr: applyInformHr
      });

      setSuccessMsg('Leave applied successfully! Awaiting manager review.');
      setShowApplyModal(false);
      fetchMyHistory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to APPROVE this leave request?')) {
      return;
    }
    try {
      await leaveService.approveLeave(id);
      setSuccessMsg('Leave request approved!');
      if (activeTab === 'team') fetchTeamRequests();
      else fetchAllRequests();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve leave request.');
    }
  };

  const handleOpenReject = (id) => {
    setSelectedRequestId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) {
      setError('Rejection reason is required.');
      return;
    }
    try {
      await leaveService.rejectLeave(selectedRequestId, rejectionReason);
      setSuccessMsg('Leave request rejected!');
      setShowRejectModal(false);
      if (activeTab === 'team') fetchTeamRequests();
      else fetchAllRequests();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject leave request.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to CANCEL this pending leave request?')) {
      return;
    }
    try {
      await leaveService.cancelLeave(id);
      setSuccessMsg('Leave request cancelled.');
      fetchMyHistory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel leave request.');
    }
  };

  // Leave Type Form Helpers
  const handleOpenAddType = () => {
    setCurrentType(null);
    setTypeName('');
    setTypeDesc('');
    setTypeLimit(12);
    setTypePaid(true);
    setTypeStatus('ACTIVE');
    setShowTypeModal(true);
  };

  const handleOpenEditType = (type) => {
    setCurrentType(type);
    setTypeName(type.name);
    setTypeDesc(type.description || '');
    setTypeLimit(type.annualLimit);
    setTypePaid(type.paid);
    setTypeStatus(type.status);
    setShowTypeModal(true);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    const payload = {
      name: typeName,
      description: typeDesc,
      annualLimit: typeLimit,
      paid: typePaid,
      status: typeStatus
    };
    try {
      if (currentType) {
        await leaveService.updateLeaveType(currentType.id, payload);
        setSuccessMsg('Leave type updated!');
      } else {
        await leaveService.createLeaveType(payload);
        setSuccessMsg('Leave type created!');
      }
      setShowTypeModal(false);
      fetchLeaveTypes();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save leave type.');
    }
  };

  return (
    <div style={containerStyle}>
      {successMsg && <div style={successAlertStyle}>{successMsg}</div>}
      {error && <div style={errorAlertStyle}>{error}</div>}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>📅 Leave Management</h1>
          <p style={subtitleStyle}>Apply for checkouts, view leave balances, and manage team requests.</p>
        </div>
        {user.id && (
          <button onClick={() => { setApplyTypeId(''); setApplyStart(''); setApplyEnd(''); setApplyReason(''); setApplyInformHr(false); setShowApplyModal(true); }} style={btnPrimaryStyle}>
            ✍️ Apply Leave
          </button>
        )}

      </div>

      {/* Leave Balance Cards */}
      {user.id && balances.length > 0 && (
        <div style={balancesContainerStyle}>
          {balances.map((bal) => (
            <div key={bal.id} style={balCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={balTypeTitleStyle}>{bal.leaveTypeName}</span>
                <span style={balPaidBadgeStyle(bal.paid)}>{bal.paid ? 'Paid' : 'Unpaid'}</span>
              </div>
              <div style={balNumberGridStyle}>
                <div>
                  <div style={balLabelStyle}>Limit</div>
                  <div style={balValStyle}>{bal.totalLeaves}</div>
                </div>
                <div>
                  <div style={balLabelStyle}>Used</div>
                  <div style={balUsedValStyle}>{bal.usedLeaves}</div>
                </div>
                <div>
                  <div style={balLabelStyle}>Remaining</div>
                  <div style={balRemValStyle(bal.remainingLeaves)}>{bal.remainingLeaves}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs Menu */}
      <div style={tabContainerStyle}>
        {user.id && (
          <button
            onClick={() => setActiveTab('history')}
            style={tabButtonStyle(activeTab === 'history')}
          >
            📋 My History
          </button>
        )}
        {(isManager || isAdminOrHR) && (
          <button
            onClick={() => setActiveTab('team')}
            style={tabButtonStyle(activeTab === 'team')}
          >
            👥 Team Requests
          </button>
        )}
        {isAdminOrHR && (
          <button
            onClick={() => setActiveTab('admin')}
            style={tabButtonStyle(activeTab === 'admin')}
          >
            🏢 All Requests
          </button>
        )}
        {isAdminOrHR && (
          <button
            onClick={() => setActiveTab('types')}
            style={tabButtonStyle(activeTab === 'types')}
          >
            ⚙️ Leave Types
          </button>
        )}
      </div>

      {/* --- TAB CONTENT: MY LEAVE HISTORY --- */}
      {activeTab === 'history' && (
        loading ? <div style={loaderStyle}>Loading history...</div> : myRequests.length === 0 ? (
          <div style={emptyStateStyle}>You have not submitted any leave requests.</div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Leave Type</th>
                  <th style={thStyle}>Start Date</th>
                  <th style={thStyle}>End Date</th>
                  <th style={thStyle}>Days</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Processed By</th>
                  <th style={thStyle}>Informed HR</th>
                  <th style={thRightStyle}>Actions</th>

                </tr>
              </thead>
              <tbody>
                {myRequests.map((req) => (
                  <tr key={req.id} style={tableRowStyle}>
                    <td style={tdBoldStyle}>{req.leaveTypeName}</td>
                    <td style={tdStyle}>{req.startDate}</td>
                    <td style={tdStyle}>{req.endDate}</td>
                    <td style={tdStyle}>{req.numberOfDays} days</td>
                    <td style={tdStyle}>{req.reason}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(req.status)}>{req.status}</span>
                      {req.rejectionReason && (
                        <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{req.approvedByName || '-'}</td>
                    <td style={tdStyle}>
                      <span style={informHrBadgeStyle(req.informHr)}>{req.informHr ? 'Yes' : 'No'}</span>
                    </td>
                    <td style={tdRightStyle}>

                      {req.status === 'PENDING' && (
                        <button onClick={() => handleCancel(req.id)} style={btnCancelActionStyle}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* --- TAB CONTENT: TEAM REQUESTS --- */}
      {activeTab === 'team' && (
        loading ? <div style={loaderStyle}>Loading team requests...</div> : teamRequests.length === 0 ? (
          <div style={emptyStateStyle}>No leave requests pending from your team.</div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Leave Type</th>
                  <th style={thStyle}>Start Date</th>
                  <th style={thStyle}>End Date</th>
                  <th style={thStyle}>Days</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Informed HR</th>
                  <th style={thRightStyle}>Actions</th>

                </tr>
              </thead>
              <tbody>
                {teamRequests.map((req) => (
                  <tr key={req.id} style={tableRowStyle}>
                    <td style={tdBoldStyle}>{req.employeeName}</td>
                    <td style={tdStyle}>{req.leaveTypeName}</td>
                    <td style={tdStyle}>{req.startDate}</td>
                    <td style={tdStyle}>{req.endDate}</td>
                    <td style={tdStyle}>{req.numberOfDays} days</td>
                    <td style={tdStyle}>{req.reason}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(req.status)}>{req.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={informHrBadgeStyle(req.informHr)}>{req.informHr ? 'Yes' : 'No'}</span>
                    </td>
                    <td style={tdRightStyle}>

                      {req.status === 'PENDING' ? (
                        <div style={actionsContainerStyle}>
                          <button onClick={() => handleApprove(req.id)} style={btnApproveStyle}>Approve</button>
                          <button onClick={() => handleOpenReject(req.id)} style={btnRejectStyle}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* --- TAB CONTENT: ADMIN / ALL REQUESTS --- */}
      {activeTab === 'admin' && (
        <div>
          <div style={filterGridStyle}>
            <select
              value={filterDeptId}
              onChange={(e) => setFilterDeptId(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- Filter Department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterTypeId}
              onChange={(e) => setFilterTypeId(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- Filter Leave Type --</option>
              {leaveTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- Filter Status --</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {loading ? <div style={loaderStyle}>Loading requests...</div> : allRequests.length === 0 ? (
            <div style={emptyStateStyle}>No leave requests found matching filters.</div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Employee</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Leave Type</th>
                    <th style={thStyle}>Period</th>
                    <th style={thStyle}>Days</th>
                    <th style={thStyle}>Reason</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Informed HR</th>
                    <th style={thRightStyle}>Actions</th>

                  </tr>
                </thead>
                <tbody>
                  {allRequests.map((req) => (
                    <tr key={req.id} style={tableRowStyle}>
                      <td style={tdBoldStyle}>
                        <div>{req.employeeName}</div>
                      </td>
                      <td style={tdStyle}>{req.departmentName}</td>
                      <td style={tdStyle}>{req.leaveTypeName}</td>
                      <td style={tdStyle}>
                        <div>{req.startDate} to {req.endDate}</div>
                      </td>
                      <td style={tdStyle}>{req.numberOfDays} days</td>
                      <td style={tdStyle}>{req.reason}</td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(req.status)}>{req.status}</span>
                        {req.rejectionReason && (
                          <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                            Reason: {req.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={informHrBadgeStyle(req.informHr)}>{req.informHr ? 'Yes' : 'No'}</span>
                      </td>
                      <td style={tdRightStyle}>

                        {req.status === 'PENDING' ? (
                          <div style={actionsContainerStyle}>
                            <button onClick={() => handleApprove(req.id)} style={btnApproveStyle}>Approve</button>
                            <button onClick={() => handleOpenReject(req.id)} style={btnRejectStyle}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            Processed {req.approvedByName && `by ${req.approvedByName}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: CONFIG LEAVE TYPES --- */}
      {activeTab === 'types' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={handleOpenAddType} style={btnSecondaryStyle}>
              + Configure Leave Type
            </button>
          </div>
          {loading ? <div style={loaderStyle}>Loading types...</div> : leaveTypes.length === 0 ? (
            <div style={emptyStateStyle}>No leave types configured.</div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Type Name</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Annual Limit</th>
                    <th style={thStyle}>Paid Status</th>
                    <th style={thStyle}>Status</th>
                    <th style={thRightStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map((type) => (
                    <tr key={type.id} style={tableRowStyle}>
                      <td style={tdBoldStyle}>{type.name}</td>
                      <td style={tdStyle}>{type.description}</td>
                      <td style={tdStyle}>{type.annualLimit} days</td>
                      <td style={tdStyle}>
                        <span style={balPaidBadgeStyle(type.paid)}>{type.paid ? 'PAID' : 'UNPAID'}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(type.status)}>{type.status}</span>
                      </td>
                      <td style={tdRightStyle}>
                        <button onClick={() => handleOpenEditType(type)} style={btnActionStyle}>✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- APPLY LEAVE MODAL --- */}
      {showApplyModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Apply for Leave</h2>
            <form onSubmit={handleApply}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Leave Type</label>
                <select
                  required
                  value={applyTypeId}
                  onChange={(e) => setApplyTypeId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Select Type --</option>
                  {leaveTypes.filter(t => t.status === 'ACTIVE').map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.paid ? 'Paid' : 'Unpaid'})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyStart}
                    onChange={(e) => setApplyStart(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="date"
                    required
                    value={applyEnd}
                    onChange={(e) => setApplyEnd(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Reason</label>
                <textarea
                  required
                  placeholder="Provide a reason for leave..."
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={{ ...formGroupStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px' }}>
                <input
                  id="informHrCheckbox"
                  type="checkbox"
                  checked={applyInformHr}
                  onChange={(e) => setApplyInformHr(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="informHrCheckbox" style={{ fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  Inform HR about this leave request
                </label>
              </div>
              <div style={modalActionsStyle}>

                <button type="button" onClick={() => setShowApplyModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REJECTION REASON MODAL --- */}
      {showRejectModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Reject Leave Request</h2>
            <form onSubmit={handleReject}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Rejection Reason</label>
                <textarea
                  required
                  placeholder="State the reason for rejecting this leave..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowRejectModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnDangerStyle}>Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LEAVE TYPE CONFIG MODAL --- */}
      {showTypeModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>{currentType ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
            <form onSubmit={handleSaveType}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SICK, CASUAL, VACATION"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  style={inputStyle}
                  disabled={!!currentType} // Lock name on edit to prevent code mismatch
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  placeholder="Type description..."
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Annual Limit (Days)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={typeLimit}
                  onChange={(e) => setTypeLimit(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ ...formGroupStyle, display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                  <label style={labelStyle}>Paid Status</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={typePaid}
                      onChange={(e) => setTypePaid(e.target.checked)}
                    />
                    Is Paid Leave
                  </label>
                </div>
                {currentType && (
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={typeStatus}
                      onChange={(e) => setTypeStatus(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                )}
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowTypeModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>{currentType ? 'Save changes' : 'Configure'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
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

const btnPrimaryStyle = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
};

const btnSecondaryStyle = {
  ...btnPrimaryStyle,
  backgroundColor: '#10b981',
  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
};

const balancesContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

const balCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '18px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  textAlign: 'left'
};

const balTypeTitleStyle = {
  fontWeight: '700',
  color: '#1e293b',
  fontSize: '15px'
};

const balPaidBadgeStyle = (paid) => ({
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 6px',
  borderRadius: '4px',
  backgroundColor: paid ? '#ecfdf5' : '#fef2f2',
  color: paid ? '#047857' : '#b91c1c'
});

const balNumberGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '8px',
  marginTop: '16px',
  borderTop: '1px solid #f1f5f9',
  paddingTop: '12px'
};

const balLabelStyle = {
  fontSize: '11px',
  color: '#64748b',
  fontWeight: '500',
  textTransform: 'uppercase'
};

const balValStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e293b',
  marginTop: '2px'
};

const balUsedValStyle = {
  ...balValStyle,
  color: '#64748b'
};

const balRemValStyle = (remaining) => ({
  ...balValStyle,
  color: remaining > 2 ? '#10b981' : '#f59e0b'
});

const tabContainerStyle = {
  display: 'flex',
  borderBottom: '1px solid #e2e8f0',
  marginBottom: '24px',
  gap: '8px'
};

const tabButtonStyle = (isActive) => ({
  padding: '10px 18px',
  border: 'none',
  borderBottom: isActive ? '3px solid #4f46e5' : '3px solid transparent',
  backgroundColor: 'transparent',
  fontWeight: '700',
  color: isActive ? '#4f46e5' : '#64748b',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.15s ease'
});

const filterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '24px'
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

const statusBadgeStyle = (status) => {
  let bg = '#f1f5f9';
  let color = '#475569';
  if (status === 'APPROVED') {
    bg = '#ecfdf5';
    color = '#047857';
  } else if (status === 'REJECTED') {
    bg = '#fef2f2';
    color = '#b91c1c';
  } else if (status === 'PENDING') {
    bg = '#fffbeb';
    color = '#b45309';
  } else if (status === 'CANCELLED') {
    bg = '#f1f5f9';
    color = '#64748b';
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

const informHrBadgeStyle = (informed) => {
  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: informed ? '#e0f2fe' : '#f1f5f9',
    color: informed ? '#0369a1' : '#64748b'
  };
};

const actionsContainerStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end'
};

const btnApproveStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
  border: 'none',
  backgroundColor: '#10b981',
  color: '#ffffff',
  cursor: 'pointer'
};

const btnRejectStyle = {
  ...btnApproveStyle,
  backgroundColor: '#ef4444'
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

const btnCancelActionStyle = {
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

const modalTitleStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#1e293b',
  margin: 0,
  marginBottom: '20px',
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

const btnDangerStyle = {
  ...btnCancelStyle,
  backgroundColor: '#ef4444',
  color: '#ffffff'
};

export default Leaves;
