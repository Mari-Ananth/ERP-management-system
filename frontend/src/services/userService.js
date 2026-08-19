import api from './api';

const userService = {
  getAllUsers: async (params) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  toggleUserStatus: async (id, enabled) => {
    const response = await api.put(`/api/users/${id}/status`, null, { params: { enabled } });
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/api/users/${id}/role`, null, { params: { role } });
    return response.data;
  }
};

export default userService;
