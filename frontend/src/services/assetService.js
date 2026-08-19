import api from './api';

const assetService = {
  createAsset: async (data) => {
    const response = await api.post('/api/assets', data);
    return response.data;
  },

  updateAsset: async (id, data) => {
    const response = await api.put(`/api/assets/${id}`, data);
    return response.data;
  },

  getAssetById: async (id) => {
    const response = await api.get(`/api/assets/${id}`);
    return response.data;
  },

  getAllAssets: async (params) => {
    const response = await api.get('/api/assets', { params });
    return response.data;
  },

  assignAsset: async (id, data) => {
    const response = await api.post(`/api/assets/${id}/assign`, data);
    return response.data;
  },

  returnAsset: async (id, data) => {
    const response = await api.post(`/api/assets/${id}/return`, data);
    return response.data;
  },

  moveToMaintenance: async (id) => {
    const response = await api.post(`/api/assets/${id}/maintenance`);
    return response.data;
  },

  retireAsset: async (id) => {
    const response = await api.post(`/api/assets/${id}/retire`);
    return response.data;
  },

  getAssetHistory: async (id) => {
    const response = await api.get(`/api/assets/${id}/history`);
    return response.data;
  },

  getMyAssets: async () => {
    const response = await api.get('/api/assets/my');
    return response.data;
  }
};

export default assetService;
