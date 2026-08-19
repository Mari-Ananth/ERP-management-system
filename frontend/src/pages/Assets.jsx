import React, { useState, useEffect } from 'react';
import assetService from '../services/assetService';
import employeeService from '../services/employeeService';
import { useAuth } from '../context/AuthContext';

const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [currentAsset, setCurrentAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('LAPTOP');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState(0);
  const [formWarranty, setFormWarranty] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');

  // Assign/Return states
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const isAdminOrHR = user.role === 'ADMIN' || user.role === 'HR';

  const assetTypes = ['LAPTOP', 'DESKTOP', 'MONITOR', 'MOBILE', 'KEYBOARD', 'MOUSE', 'ID_CARD', 'OTHER'];

  useEffect(() => {
    fetchAssets();
    if (isAdminOrHR) {
      loadEmployees();
    }
  }, [search, filterType, filterStatus]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      if (isAdminOrHR) {
        const params = {
          search: search || null,
          type: filterType || null,
          status: filterStatus || null
        };
        const data = await assetService.getAllAssets(params);
        setAssets(data || []);
      } else {
        const data = await assetService.getMyAssets();
        // Since getMyAssets returns assignment records, we can map them or display assignments directly
        // But to make it clean, we'll store assignments directly in assets state for employees.
        setAssets(data || []);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch assets.');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getEmployees({ size: 1000 });
      setEmployees(data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setFormCode('');
    setFormName('');
    setFormType('LAPTOP');
    setFormBrand('');
    setFormModel('');
    setFormSerial('');
    setFormPurchaseDate('');
    setFormPurchasePrice(0);
    setFormWarranty('');
    setFormStatus('AVAILABLE');
    setShowAddModal(true);
  };

  const handleOpenEdit = (asset) => {
    setCurrentAsset(asset);
    setFormCode(asset.assetCode);
    setFormName(asset.name);
    setFormType(asset.type);
    setFormBrand(asset.brand || '');
    setFormModel(asset.model || '');
    setFormSerial(asset.serialNumber || '');
    setFormPurchaseDate(asset.purchaseDate || '');
    setFormPurchasePrice(asset.purchasePrice || 0);
    setFormWarranty(asset.warrantyExpiry || '');
    setFormStatus(asset.status);
    setShowEditModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await assetService.createAsset({
        assetCode: formCode,
        name: formName,
        type: formType,
        brand: formBrand,
        model: formModel,
        serialNumber: formSerial,
        purchaseDate: formPurchaseDate || null,
        purchasePrice: formPurchasePrice,
        warrantyExpiry: formWarranty || null,
        status: formStatus
      });
      setSuccessMsg('Asset registered successfully!');
      setShowAddModal(false);
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register asset.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await assetService.updateAsset(currentAsset.id, {
        assetCode: formCode,
        name: formName,
        type: formType,
        brand: formBrand,
        model: formModel,
        serialNumber: formSerial,
        purchaseDate: formPurchaseDate || null,
        purchasePrice: formPurchasePrice,
        warrantyExpiry: formWarranty || null,
        status: formStatus
      });
      setSuccessMsg('Asset details updated!');
      setShowEditModal(false);
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update asset details.');
    }
  };

  const handleOpenAssign = (asset) => {
    setCurrentAsset(asset);
    setAssignEmployeeId('');
    setAssignNotes('');
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assetService.assignAsset(currentAsset.id, {
        employeeId: assignEmployeeId,
        notes: assignNotes
      });
      setSuccessMsg('Asset assigned successfully!');
      setShowAssignModal(false);
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign asset.');
    }
  };

  const handleOpenReturn = (asset) => {
    setCurrentAsset(asset);
    setReturnCondition('GOOD');
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await assetService.returnAsset(currentAsset.id, {
        returnCondition,
        notes: returnNotes
      });
      setSuccessMsg('Asset returned successfully!');
      setShowReturnModal(false);
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check-in asset.');
    }
  };

  const handleMaintenance = async (id) => {
    try {
      await assetService.moveToMaintenance(id);
      setSuccessMsg('Asset is now under maintenance.');
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer asset.');
    }
  };

  const handleRetire = async (id) => {
    if (!window.confirm('Are you sure you want to RETIRE this asset? Retired assets cannot be assigned again.')) {
      return;
    }
    try {
      await assetService.retireAsset(id);
      setSuccessMsg('Asset has been retired.');
      fetchAssets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retire asset.');
    }
  };

  const handleOpenHistory = async (asset) => {
    setCurrentAsset(asset);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const data = await assetService.getAssetHistory(asset.id);
      setAssetHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Stats calculation
  const totalCount = assets.length;
  const assignedCount = assets.filter(a => a.status === 'ASSIGNED').length;
  const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;
  const availableCount = assets.filter(a => a.status === 'AVAILABLE').length;

  return (
    <div style={containerStyle}>
      {successMsg && <div style={successAlertStyle}>{successMsg}</div>}
      {error && <div style={errorAlertStyle}>{error}</div>}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>💻 Asset Management</h1>
          <p style={subtitleStyle}>Track and assign company hardware resources and devices.</p>
        </div>
        {isAdminOrHR && (
          <button onClick={handleOpenAdd} style={btnPrimaryStyle}>
            + Register Asset
          </button>
        )}
      </div>

      {/* Stats Cards (Admin/HR only) */}
      {isAdminOrHR && (
        <div style={statsContainerStyle}>
          <div style={statCardStyle}>
            <div style={statIconStyle('#4f46e5', 'rgba(79, 70, 229, 0.1)')}>📦</div>
            <div>
              <div style={statLabelStyle}>Total Hardware</div>
              <div style={statValStyle}>{totalCount}</div>
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statIconStyle('#f59e0b', 'rgba(245, 158, 11, 0.1)')}>👤</div>
            <div>
              <div style={statLabelStyle}>Checked Out</div>
              <div style={statValStyle}>{assignedCount}</div>
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statIconStyle('#ef4444', 'rgba(239, 68, 68, 0.1)')}>🔧</div>
            <div>
              <div style={statLabelStyle}>In Maintenance</div>
              <div style={statValStyle}>{maintenanceCount}</div>
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statIconStyle('#10b981', 'rgba(16, 185, 129, 0.1)')}>🟢</div>
            <div>
              <div style={statLabelStyle}>Available</div>
              <div style={statValStyle}>{availableCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters (Admin/HR only) */}
      {isAdminOrHR && (
        <div style={filterGridStyle}>
          <input
            type="text"
            placeholder="Search by code, brand, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={filterInputStyle}
          >
            <option value="">-- All Types --</option>
            {assetTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={filterInputStyle}
          >
            <option value="">-- All Statuses --</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="RETURNED">RETURNED</option>
            <option value="RETIRED">RETIRED</option>
          </select>
        </div>
      )}

      {/* Table view */}
      {loading ? (
        <div style={loaderStyle}>Loading assets...</div>
      ) : assets.length === 0 ? (
        <div style={emptyStateStyle}>No assets registered.</div>
      ) : (
        <div style={tableContainerStyle}>
          {isAdminOrHR ? (
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Asset Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Brand / Model</th>
                  <th style={thStyle}>Serial Number</th>
                  <th style={thStyle}>Assigned To</th>
                  <th style={thStyle}>Status</th>
                  <th style={thRightStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} style={tableRowStyle}>
                    <td style={tdBoldStyle}>{asset.assetCode}</td>
                    <td style={tdStyle}>{asset.name}</td>
                    <td style={tdStyle}>
                      <span style={typeBadgeStyle}>{asset.type}</span>
                    </td>
                    <td style={tdStyle}>{asset.brand} {asset.model}</td>
                    <td style={tdStyle}>{asset.serialNumber || '-'}</td>
                    <td style={tdStyle}>
                      {asset.assignedToEmployeeName ? (
                        <span style={assigneeBadgeStyle}>{asset.assignedToEmployeeName}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(asset.status)}>{asset.status}</span>
                    </td>
                    <td style={tdRightStyle}>
                      <div style={actionsContainerStyle}>
                        <button onClick={() => handleOpenHistory(asset)} style={btnActionStyle}>📜 History</button>
                        <button onClick={() => handleOpenEdit(asset)} style={btnActionStyle}>✏️ Edit</button>
                        {asset.status === 'AVAILABLE' && (
                          <>
                            <button onClick={() => handleOpenAssign(asset)} style={btnAssignStyle}>Check Out</button>
                            <button onClick={() => handleMaintenance(asset.id)} style={btnActionStyle}>🔧 Fix</button>
                          </>
                        )}
                        {asset.status === 'ASSIGNED' && (
                          <button onClick={() => handleOpenReturn(asset)} style={btnReturnStyle}>Check In</button>
                        )}
                        {asset.status === 'MAINTENANCE' && (
                          <button onClick={() => {
                            // We can just update status back to AVAILABLE
                            assetService.updateAsset(asset.id, { ...asset, status: 'AVAILABLE' })
                              .then(() => { setSuccessMsg('Asset ready for checkout!'); fetchAssets(); setTimeout(() => setSuccessMsg(''), 3000); });
                          }} style={btnAssignStyle}>Mark Available</button>
                        )}
                        {user.role === 'ADMIN' && asset.status !== 'RETIRED' && (
                          <button onClick={() => handleRetire(asset.id)} style={btnDeleteActionStyle}>Retire</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Regular Employee view of their assigned assets
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Asset Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Brand / Model</th>
                  <th style={thStyle}>Serial Number</th>
                  <th style={thStyle}>Assigned Date</th>
                  <th style={thStyle}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((assign) => (
                  <tr key={assign.id} style={tableRowStyle}>
                    <td style={tdBoldStyle}>{assign.assetCode}</td>
                    <td style={tdStyle}>{assign.assetName}</td>
                    <td style={tdStyle}>
                      <span style={typeBadgeStyle}>{assign.assetType}</span>
                    </td>
                    <td style={tdStyle}>{assign.notes}</td>
                    <td style={tdStyle}>{assign.id}</td>
                    <td style={tdStyle}>{assign.assignedDate}</td>
                    <td style={tdStyle}>{assign.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Register New Company Asset</h2>
            <form onSubmit={handleCreate}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Asset Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAP-0021, MOB-0112"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer Macbook Pro 16"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Asset Type</label>
                <select
                  required
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={inputStyle}
                >
                  {assetTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Model</label>
                  <input
                    type="text"
                    placeholder="e.g. M3 Max 2026"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. C02DX123QD16"
                  value={formSerial}
                  onChange={(e) => setFormSerial(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Warranty Expiry</label>
                  <input
                    type="date"
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowAddModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Edit Asset Details</h2>
            <form onSubmit={handleUpdate}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Asset Code</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={inputStyle}
                  disabled
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Asset Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Brand</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Model</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Serial Number</label>
                <input
                  type="text"
                  value={formSerial}
                  onChange={(e) => setFormSerial(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Warranty Expiry</label>
                  <input
                    type="date"
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowEditModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Save details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CHECKOUT/ASSIGN MODAL --- */}
      {showAssignModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Assign Asset: {currentAsset?.name}</h2>
            <form onSubmit={handleAssign}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Select Employee</label>
                <select
                  required
                  value={assignEmployeeId}
                  onChange={(e) => setAssignEmployeeId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Notes / Assignment Terms</label>
                <textarea
                  placeholder="State the device checkout notes..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowAssignModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Assign Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RETURN/CHECKIN MODAL --- */}
      {showReturnModal && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Return Asset: {currentAsset?.name}</h2>
            <form onSubmit={handleReturn}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Return Condition</label>
                <select
                  required
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  style={inputStyle}
                >
                  <option value="EXCELLENT">EXCELLENT (No signs of use)</option>
                  <option value="GOOD">GOOD (Regular wear & tear)</option>
                  <option value="DAMAGED">DAMAGED (Requires maintenance)</option>
                  <option value="LOST">LOST (Retired asset)</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Return Notes</label>
                <textarea
                  placeholder="Add details about device status on check-in..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  style={textareaStyle}
                />
              </div>
              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowReturnModal(false)} style={btnCancelStyle}>Cancel</button>
                <button type="submit" style={btnSubmitStyle}>Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HISTORY LOGS MODAL --- */}
      {showHistoryModal && (
        <div style={modalBackdropStyle}>
          <div style={modalLargeContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>Assignment Logs: {currentAsset?.name} ({currentAsset?.assetCode})</h2>
              <button onClick={() => setShowHistoryModal(false)} style={closeBtnStyle}>✕</button>
            </div>
            
            {loadingHistory ? (
              <div style={loaderStyle}>Loading assignment history...</div>
            ) : assetHistory.length === 0 ? (
              <div style={emptyStateStyle}>This asset has never been assigned.</div>
            ) : (
              <div style={employeeListScrollStyle}>
                <table style={miniTableStyle}>
                  <thead>
                    <tr>
                      <th style={miniThStyle}>Employee</th>
                      <th style={miniThStyle}>Assigned Date</th>
                      <th style={miniThStyle}>Returned Date</th>
                      <th style={miniThStyle}>Assigned By</th>
                      <th style={miniThStyle}>Return Condition</th>
                      <th style={miniThStyle}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetHistory.map(log => (
                      <tr key={log.id} style={tableRowStyle}>
                        <td style={tdBoldStyle}>{log.employeeName}</td>
                        <td style={tdStyle}>{log.assignedDate}</td>
                        <td style={tdStyle}>{log.returnedDate || <span style={{ color: '#10b981', fontWeight: '700' }}>Active Checkout</span>}</td>
                        <td style={tdStyle}>{log.assignedByName}</td>
                        <td style={tdStyle}>{log.returnCondition || '-'}</td>
                        <td style={tdStyle}>{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ ...modalActionsStyle, borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button type="button" onClick={() => setShowHistoryModal(false)} style={btnSubmitStyle}>Close</button>
            </div>
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

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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

const typeBadgeStyle = {
  display: 'inline-block',
  padding: '3px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '700',
  backgroundColor: '#f1f5f9',
  color: '#475569'
};

const assigneeBadgeStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: '#eff6ff',
  color: '#1d4ed8'
};

const statusBadgeStyle = (status) => {
  let bg = '#f1f5f9';
  let color = '#475569';
  if (status === 'AVAILABLE' || status === 'RETURNED') {
    bg = '#ecfdf5';
    color = '#047857';
  } else if (status === 'ASSIGNED') {
    bg = '#eff6ff';
    color = '#1d4ed8';
  } else if (status === 'MAINTENANCE') {
    bg = '#fffbeb';
    color = '#b45309';
  } else if (status === 'RETIRED') {
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

const btnAssignStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
  border: 'none',
  backgroundColor: '#10b981',
  color: '#ffffff',
  cursor: 'pointer'
};

const btnReturnStyle = {
  ...btnAssignStyle,
  backgroundColor: '#3b82f6'
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
  maxWidth: '760px'
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

export default Assets;
