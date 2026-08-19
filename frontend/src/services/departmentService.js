import api from './api';

const departmentService = {
  getDepartments: async (search) => {
    const response = await api.get('/api/departments', { params: { search } });
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await api.get(`/api/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/api/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/api/departments/${id}`, data);
    return response.data;
  },

  changeStatus: async (id, status) => {
    const response = await api.put(`/api/departments/${id}/status`, null, { params: { status } });
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/api/departments/${id}`);
    return response.data;
  },

  getEmployeesInDepartment: async (id) => {
    const response = await api.get(`/api/departments/${id}/employees`);
    return response.data;
  }
};

export default departmentService;
