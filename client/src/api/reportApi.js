import apiClient from './client';

export const reportApi = {
  getReports: async (params = {}) => {
    const res = await apiClient.get('/reportes', { params });
    return res.data;
  },

  getReportById: async (id) => {
    const res = await apiClient.get(`/reportes/${id}`);
    return res.data;
  },

  createReport: async (formData) => {
    const res = await apiClient.post('/reportes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  supportReport: async (id, ciudadanoId) => {
    const res = await apiClient.post(`/reportes/${id}/apoyo`, { ciudadano_id: ciudadanoId });
    return res.data;
  },

  updateStatus: async (id, statusData) => {
    const res = await apiClient.patch(`/reportes/${id}/estado`, statusData);
    return res.data;
  },

  getStatistics: async () => {
    const res = await apiClient.get('/reportes/estadisticas');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get('/reportes/analitica');
    return res.data;
  },

  getReportsGeoJson: async () => {
    const res = await apiClient.get('/reportes/gis/geojson');
    return res.data;
  },

  getMyReports: async () => {
    const res = await apiClient.get('/reportes/mis-reportes');
    return res.data;
  },
};
