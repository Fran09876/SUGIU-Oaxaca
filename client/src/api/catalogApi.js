import apiClient from './client';

export const catalogApi = {
  getCategories: async () => {
    const res = await apiClient.get('/catalogos/categorias');
    return res.data;
  },

  getStatuses: async () => {
    const res = await apiClient.get('/catalogos/estados');
    return res.data;
  },

  getDepartments: async () => {
    const res = await apiClient.get('/catalogos/dependencias');
    return res.data;
  },

  getRoles: async () => {
    const res = await apiClient.get('/catalogos/roles');
    return res.data;
  },

  createDepartment: async (data) => {
    const res = await apiClient.post('/catalogos/dependencias', data);
    return res.data;
  },

  updateDepartment: async (id, data) => {
    const res = await apiClient.put(`/catalogos/dependencias/${id}`, data);
    return res.data;
  },

  createCategory: async (data) => {
    const res = await apiClient.post('/catalogos/categorias', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await apiClient.put(`/catalogos/categorias/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/catalogos/categorias/${id}`);
    return res.data;
  },
};
