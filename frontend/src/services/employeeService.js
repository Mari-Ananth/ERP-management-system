import api from './api';

const employeeService = {
  getEmployees: async (params) => {
    const response = await api.get('/api/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post('/api/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },

  deactivateEmployee: async (id) => {
    const response = await api.delete(`/api/employees/${id}`);
    return response.data;
  }
};

export default employeeService;
