import api from './api';

const payrollService = {
  createPayroll: async (data) => {
    const response = await api.post('/api/payroll', data);
    return response.data;
  },

  generatePayroll: async (month, year) => {
    const response = await api.post('/api/payroll/generate', null, { params: { month, year } });
    return response.data;
  },

  updatePayroll: async (id, data) => {
    const response = await api.put(`/api/payroll/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id) => {
    const response = await api.put(`/api/payroll/${id}/pay`);
    return response.data;
  },

  getPayrollById: async (id) => {
    const response = await api.get(`/api/payroll/${id}`);
    return response.data;
  },

  getAllPayrolls: async (params) => {
    const response = await api.get('/api/payroll', { params });
    return response.data;
  },

  getMyPayroll: async () => {
    const response = await api.get('/api/payroll/my');
    return response.data;
  }
};

export default payrollService;
