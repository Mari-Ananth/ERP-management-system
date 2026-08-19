import api from './api';

const hrService = {
  getHRDashboardStats: async () => {
    const response = await api.get('/api/hr/dashboard');
    return response.data;
  }
};

export default hrService;
