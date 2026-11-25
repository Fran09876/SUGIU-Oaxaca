import apiClient from './client';

export const workOrderApi = {
  getWorkOrders: async (params = {}) => {
    const res = await apiClient.get('/ordenes', { params });
    return res.data;
  },

  getMyWorkOrders: async () => {
    const res = await apiClient.get('/ordenes/mis-ordenes');
    return res.data;
  },

  createWorkOrder: async (orderData) => {
    const res = await apiClient.post('/ordenes', orderData);
    return res.data;
  },

  startWorkOrder: async (id) => {
    const res = await apiClient.patch(`/ordenes/${id}/iniciar`);
    return res.data;
  },

  completeWorkOrder: async (id, formData) => {
    const res = await apiClient.post(`/ordenes/${id}/finalizar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  approveWorkOrder: async (id) => {
    const res = await apiClient.patch(`/ordenes/${id}/aprobar`);
    return res.data;
  },
};
