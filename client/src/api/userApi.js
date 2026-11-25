import apiClient from './client';

export const userApi = {
  getUsers: async (params = {}) => {
    const res = await apiClient.get('/usuarios', { params });
    return res.data;
  },

  getCrews: async () => {
    const res = await apiClient.get('/usuarios/cuadrillas');
    return res.data;
  },

  createUser: async (userData) => {
    const res = await apiClient.post('/usuarios', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await apiClient.put(`/usuarios/${id}`, userData);
    return res.data;
  },

  toggleUserStatus: async (id) => {
    const res = await apiClient.patch(`/usuarios/${id}/status`);
    return res.data;
  },
};
