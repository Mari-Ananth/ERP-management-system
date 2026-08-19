import api from './api';

const leaveService = {
  getLeaveTypes: async (status) => {
    const response = await api.get('/api/leave-types', { params: { status } });
    return response.data;
  },

  createLeaveType: async (data) => {
    const response = await api.post('/api/leave-types', data);
    return response.data;
  },

  updateLeaveType: async (id, data) => {
    const response = await api.put(`/api/leave-types/${id}`, data);
    return response.data;
  },

  getMyBalances: async (year) => {
    const response = await api.get('/api/leaves/balances/my', { params: { year } });
    return response.data;
  },

  getEmployeeBalances: async (employeeId, year) => {
    const response = await api.get(`/api/leaves/balances/employee/${employeeId}`, { params: { year } });
    return response.data;
  },

  applyLeave: async (data) => {
    const response = await api.post('/api/leaves', data);
    return response.data;
  },

  getMyLeaves: async () => {
    const response = await api.get('/api/leaves/my');
    return response.data;
  },

  getTeamLeaves: async () => {
    const response = await api.get('/api/leaves/team');
    return response.data;
  },

  getAllLeaves: async (params) => {
    const response = await api.get('/api/leaves', { params });
    return response.data;
  },

  approveLeave: async (id) => {
    const response = await api.put(`/api/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeave: async (id, reason) => {
    const response = await api.put(`/api/leaves/${id}/reject`, null, { params: { reason } });
    return response.data;
  },

  cancelLeave: async (id) => {
    const response = await api.put(`/api/leaves/${id}/cancel`);
    return response.data;
  }
};

export default leaveService;
