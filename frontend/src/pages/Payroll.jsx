import React, { useState, useEffect } from 'react';
import payrollService from '../services/payrollService';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import { useAuth } from '../context/AuthContext';

const Payroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  
  const [currentPayroll, setCurrentPayroll] = useState(null);

  // Generate batch state
  const [genMonth, setGenMonth] = useState('JANUARY');
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  // Edit fields state
  const [basicSalary, setBasicSalary] = useState(0);
  const [hra, setHra] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [taxDeduction, setTaxDeduction] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  // Filters state
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const isFinanceOrAdmin = user.role === 'ADMIN' || user.role === 'FINANCE';

  const monthsList = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  useEffect(() => {
    fetchPayroll();
    if (isFinanceOrAdmin) {
      loadFiltersData();
    }
  }, [filterEmployeeId, filterDeptId, filterMonth, filterYear, filterStatus]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      if (isFinanceOrAdmin) {
        const params = {
          employeeId: filterEmployeeId || null,
          departmentId: filterDeptId || null,
          month: filterMonth || null,
          year: filterYear || null,
          status: filterStatus || null
        };
        const data = await payrollService.getAllPayrolls(params);
        setPayrolls(data || []);
      } else {
        const data = await payrollService.getMyPayroll();
        setPayrolls(data || []);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch payroll history.');
    } finally {
      setLoading(false);
    }
  };

  const loadFiltersData = async () => {
    try {
      const depts = await departmentService.getDepartments();
      setDepartments(depts || []);
      
      const emps = await employeeService.getEmployees({ size: 1000 });
      setEmployees(emps.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const result = await payrollService.generatePayroll(genMonth, genYear);
      setSuccessMsg(`Payroll generated successfully for ${genMonth} ${genYear}! Generated records: ${result.length}`);
      setShowGenerateModal(false);
      fetchPayroll();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll batch.');
    }
  };

  const handleOpenEdit = (payroll) => {
    setCurrentPayroll(payroll);
    setBasicSalary(payroll.basicSalary);
    setHra(payroll.hra);
    setAllowances(payroll.allowances);
    setBonus(payroll.bonus);
    setOvertime(payroll.overtime);
    setTaxDeduction(payroll.taxDeduction);
    setOtherDeductions(payroll.otherDeductions);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await payrollService.updatePayroll(currentPayroll.id, {
        employeeId: currentPayroll.employeeId,
        month: currentPayroll.month,
        year: currentPayroll.year,
        basicSalary,
        hra,
        allowances,
        bonus,
        overtime,
        taxDeduction,
        otherDeductions
      });
      setSuccessMsg('Payroll calculations updated successfully!');
      setShowEditModal(false);
      fetchPayroll();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payroll.');
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm('Are you sure you want to mark this payroll as PAID? This sets the payment date and status.')) {
      return;
    }
    try {
      await payrollService.markAsPaid(id);
      setSuccessMsg('Payroll status marked as PAID!');
      fetchPayroll();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pay payroll.');
    }
  };

  const handleOpenSlip = (payroll) => {
    setCurrentPayroll(payroll);
    setShowSlipModal(true);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Stats for Admin/Finance
  const totalPayout = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);
  const pendingCount = payrolls.filter(p => p.paymentStatus !== 'PAID').length;
  const paidCount = payrolls.filter(p => p.paymentStatus === 'PAID').length;

  return (
    <div style={containerStyle}>
      {/* Hide page contents except slip when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-salary-slip, #print-salary-slip * {
            visibility: visible;
          }
          #print-salary-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        {successMsg && <div style={successAlertStyle}>{successMsg}</div>}
        {error && <div style={errorAlertStyle}>{error}</div>}

        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>💳 Payroll Management</h1>
            <p style={subtitleStyle}>Process, calculate, and review salary structures and slips.</p>
          </div>
          {isFinanceOrAdmin && (
            <button onClick={() => setShowGenerateModal(true)} style={btnPrimaryStyle}>
              ⚙️ Generate Monthly Batch
            </button>
          )}
        </div>

        {/* Stats cards for Finance/Admin */}
        {isFinanceOrAdmin && (
          <div style={statsContainerStyle}>
            <div style={statCardStyle}>
              <div style={statIconStyle('#4f46e5', 'rgba(79, 70, 229, 0.1)')}>💰</div>
              <div>
                <div style={statLabelStyle}>Total Net Payout</div>
                <div style={statValStyle}>${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#10b981', 'rgba(16, 185, 129, 0.1)')}>🟢</div>
              <div>
                <div style={statLabelStyle}>Paid Payrolls</div>
                <div style={statValStyle}>{paidCount} records</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#f59e0b', 'rgba(245, 158, 11, 0.1)')}>⏳</div>
              <div>
                <div style={statLabelStyle}>Pending Process</div>
                <div style={statValStyle}>{pendingCount} records</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters bar */}
        {isFinanceOrAdmin && (
          <div style={filterGridStyle}>
            <select
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- All Employees --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
              ))}
            </select>
            <select
              value={filterDeptId}
              onChange={(e) => setFilterDeptId(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- All Departments --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- All Months --</option>
              {monthsList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- All Years --</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={filterInputStyle}
            >
              <option value="">-- All Statuses --</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        )}

        {/* Table View */}
        {loading ? (
          <div style={loaderStyle}>Loading payroll records...</div>
        ) : payrolls.length === 0 ? (
          <div style={emptyStateStyle}>No payroll records found.</div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Employee</th>
                  {isFinanceOrAdmin && <th style={thStyle}>Dept</th>}
                  <th style={thStyle}>Month/Year</th>
                  <th style={thStyle}>Gross Salary</th>
                  <th style={thStyle}>Total Deductions</th>
                  <th style={thStyle}>Net Payout</th>
                  <th style={thStyle}>Status</th>
                  <th style={thRightStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.id} style={tableRowStyle}>
                    <td style={tdBoldStyle}>
                      <div>{p.employeeName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{p.employeeCode} - {p.designation}</div>
                    </td>
                    {isFinanceOrAdmin && <td style={tdStyle}>{p.departmentName}</td>}
                    <td style={tdStyle}>{p.month} {p.year}</td>
                    <td style={tdStyle}>${p.grossSalary.toFixed(2)}</td>
                    <td style={tdStyle}>-${p.totalDeductions.toFixed(2)}</td>
                    <td style={tdHighlightStyle}>${p.netSalary.toFixed(2)}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(p.paymentStatus)}>{p.paymentStatus}</span>
                      {p.paymentDate && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                          Paid: {p.paymentDate}
                        </div>
                      )}
                    </td>
                    <td style={tdRightStyle}>
                      <div style={actionsContainerStyle}>
                        <button onClick={() => handleOpenSlip(p)} style={btnActionStyle}>📄 Pay Slip</button>
                        {isFinanceOrAdmin && p.paymentStatus !== 'PAID' && (
                          <>
                            <button onClick={() => handleOpenEdit(p)} style={btnActionStyle}>✏️ Adjust</button>
                            <button onClick={() => handlePay(p.id)} style={btnPayStyle}>💳 Pay</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- GENERATE BATCH MODAL --- */}
      {showGenerateModal && (
        <div style={modalBackdropStyle} className="no-print">
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Generate Monthly Payroll</h2>
            <form onSubmit={handleGenerate}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Select Month</label>
                <select
                  required
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  style={inputStyle}
                >
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Select Year</label>
                <select
                  required
                  value={genYear}
                  onChange={(e) => setGenYear(parseInt(e.target.value))}
                  style={inputStyle}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Note: This will generate default payroll records for all active employees who do not already have a record for this period.
              </p>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowGenerateModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Generate Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (ADJUST SALARY) --- */}
      {showEditModal && (
        <div style={modalBackdropStyle} className="no-print">
          <div style={modalLargeContentStyle}>
            <h2 style={modalTitleStyle}>Adjust Salary Calculations ({currentPayroll?.employeeName})</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h3 style={sectionHeadingStyle}>Earnings</h3>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Basic Salary ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>HRA ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={hra}
                      onChange={(e) => setHra(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Allowances ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={allowances}
                      onChange={(e) => setAllowances(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Bonus ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={bonus}
                      onChange={(e) => setBonus(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Overtime Payout ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={overtime}
                      onChange={(e) => setOvertime(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <h3 style={sectionHeadingStyle}>Deductions</h3>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Tax Deduction ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={taxDeduction}
                      onChange={(e) => setTaxDeduction(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Other Deductions ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={otherDeductions}
                      onChange={(e) => setOtherDeductions(parseFloat(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowEditModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Save & Calculate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SALARY SLIP MODAL --- */}
      {showSlipModal && currentPayroll && (
        <div style={modalBackdropStyle}>
          <div style={modalSlipContentStyle}>
            <div style={modalHeaderStyle} className="no-print">
              <h2 style={modalTitleStyle}>Print Salary Slip</h2>
              <button onClick={() => setShowSlipModal(false)} style={closeBtnStyle}>✕</button>
            </div>
            
            {/* RENDER SLIP SECTION */}
            <div id="print-salary-slip" style={slipLayoutContainer}>
              <div style={slipHeaderSection}>
                <div style={slipCompanyStyle}>🏢 COMPANY ERP SYSTEM INC.</div>
                <div style={slipDocTitleStyle}>PAYSLIP FOR THE MONTH OF {currentPayroll.month} {currentPayroll.year}</div>
              </div>

              {/* Meta details */}
              <div style={slipMetaGrid}>
                <div style={slipMetaCol}>
                  <div><strong>Employee Name:</strong> {currentPayroll.employeeName}</div>
                  <div><strong>Employee Code:</strong> {currentPayroll.employeeCode}</div>
                  <div><strong>Department:</strong> {currentPayroll.departmentName || '-'}</div>
                </div>
                <div style={slipMetaCol}>
                  <div><strong>Designation:</strong> {currentPayroll.designation}</div>
                  <div><strong>Payment Status:</strong> <span style={{ fontWeight: '700' }}>{currentPayroll.paymentStatus}</span></div>
                  <div><strong>Payment Date:</strong> {currentPayroll.paymentDate || '-'}</div>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div style={slipTablesFlex}>
                <div style={slipTableBlock}>
                  <div style={slipBlockHeader}>EARNINGS</div>
                  <table style={slipTable}>
                    <tbody>
                      <tr>
                        <td style={slipTdStyle}>Basic Salary</td>
                        <td style={slipTdValStyle}>${currentPayroll.basicSalary.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={slipTdStyle}>HRA</td>
                        <td style={slipTdValStyle}>${currentPayroll.hra.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={slipTdStyle}>Allowances</td>
                        <td style={slipTdValStyle}>${currentPayroll.allowances.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={slipTdStyle}>Bonus</td>
                        <td style={slipTdValStyle}>${currentPayroll.bonus.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={slipTdStyle}>Overtime</td>
                        <td style={slipTdValStyle}>${currentPayroll.overtime.toFixed(2)}</td>
                      </tr>
                      <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: '700' }}>
                        <td style={slipTdStyle}>Gross Salary</td>
                        <td style={slipTdValStyle}>${currentPayroll.grossSalary.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={slipTableBlock}>
                  <div style={slipBlockHeader}>DEDUCTIONS</div>
                  <table style={slipTable}>
                    <tbody>
                      <tr>
                        <td style={slipTdStyle}>Tax Deductions (TDS)</td>
                        <td style={slipTdValStyle}>${currentPayroll.taxDeduction.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={slipTdStyle}>Other Deductions</td>
                        <td style={slipTdValStyle}>${currentPayroll.otherDeductions.toFixed(2)}</td>
                      </tr>
                      {/* filler rows to balance columns */}
                      <tr><td style={slipTdStyle}>&nbsp;</td><td style={slipTdValStyle}>&nbsp;</td></tr>
                      <tr><td style={slipTdStyle}>&nbsp;</td><td style={slipTdValStyle}>&nbsp;</td></tr>
                      <tr><td style={slipTdStyle}>&nbsp;</td><td style={slipTdValStyle}>&nbsp;</td></tr>
                      <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: '700' }}>
                        <td style={slipTdStyle}>Total Deductions</td>
                        <td style={slipTdValStyle}>${currentPayroll.totalDeductions.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Payout Summary */}
              <div style={slipSummaryBlock}>
                <span style={slipSummaryLabel}>NET TAKE-HOME PAYOUT:</span>
                <span style={slipSummaryVal}>${currentPayroll.netSalary.toFixed(2)}</span>
              </div>

              <div style={slipFooter}>
                <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b' }}>
                  This is a system-generated salary slip and does not require a physical signature.
                </div>
              </div>
            </div>
            
            <div style={modalActionsStyle} className="no-print">
              <button type="button" onClick={() => setShowSlipModal(false)} style={btnCancelStyle}>Close</button>
              <button type="button" onClick={handlePrintSlip} style={btnSubmitStyle}>🖨️ Print Slip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles
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
  fontSize: '20px',
  fontWeight: '700',
  color: '#1e293b'
};

const filterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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

const tdHighlightStyle = {
  ...tdStyle,
  fontWeight: '700',
  color: '#4f46e5'
};

const tdRightStyle = {
  ...tdStyle,
  textAlign: 'right'
};

const statusBadgeStyle = (status) => {
  let bg = '#f1f5f9';
  let color = '#475569';
  if (status === 'PAID') {
    bg = '#ecfdf5';
    color = '#047857';
  } else if (status === 'PENDING') {
    bg = '#fffbeb';
    color = '#b45309';
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

const btnPayStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
  border: 'none',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  cursor: 'pointer'
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
  maxWidth: '440px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const modalLargeContentStyle = {
  ...modalContentStyle,
  maxWidth: '680px'
};

const modalSlipContentStyle = {
  ...modalContentStyle,
  maxWidth: '800px',
  backgroundColor: '#f8fafc'
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
  margin: 0,
  textAlign: 'left'
};

const sectionHeadingStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#4f46e5',
  borderBottom: '1px solid #cbd5e1',
  paddingBottom: '6px',
  marginBottom: '14px',
  textAlign: 'left'
};

const formGroupStyle = {
  marginBottom: '16px',
  textAlign: 'left'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
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
  marginTop: '24px'
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

// Printable Salary Slip styling
const slipLayoutContainer = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '32px',
  color: '#1e293b',
  textAlign: 'left',
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const slipHeaderSection = {
  textAlign: 'center',
  borderBottom: '2px solid #1e293b',
  paddingBottom: '16px',
  marginBottom: '20px'
};

const slipCompanyStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#1e1b4b',
  letterSpacing: '0.5px'
};

const slipDocTitleStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  marginTop: '6px',
  letterSpacing: '1px'
};

const slipMetaGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  fontSize: '13px',
  lineHeight: '1.8',
  backgroundColor: '#f8fafc',
  padding: '16px',
  borderRadius: '6px',
  marginBottom: '24px',
  border: '1px solid #e2e8f0'
};

const slipMetaCol = {
  display: 'flex',
  flexDirection: 'column'
};

const slipTablesFlex = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  marginBottom: '24px'
};

const slipTableBlock = {
  display: 'flex',
  flexDirection: 'column'
};

const slipBlockHeader = {
  fontSize: '12px',
  fontWeight: '800',
  backgroundColor: '#e2e8f0',
  padding: '6px 12px',
  color: '#1e293b',
  letterSpacing: '0.5px'
};

const slipTable = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px'
};

const slipTdStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #f1f5f9',
  color: '#475569'
};

const slipTdValStyle = {
  ...slipTdStyle,
  textAlign: 'right',
  fontWeight: '600',
  color: '#1e293b'
};

const slipSummaryBlock = {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#1e1b4b',
  color: '#ffffff',
  padding: '14px 20px',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '16px',
  marginBottom: '20px'
};

const slipSummaryLabel = {
  letterSpacing: '0.5px'
};

const slipSummaryVal = {
  fontSize: '18px'
};

const slipFooter = {
  borderTop: '1px dashed #cbd5e1',
  paddingTop: '16px',
  textAlign: 'center',
  marginTop: '12px'
};

export default Payroll;
