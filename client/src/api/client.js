import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor para inyectar automáticamente el JWT Stateless si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sigiu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo global de respuestas y expiración de token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o es inválido, limpiar sesión local
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('sigiu_token');
        localStorage.removeItem('sigiu_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
