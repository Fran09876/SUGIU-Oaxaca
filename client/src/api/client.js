import axios from 'axios';

// En producción en Vercel, apunta a la URL de Render configurada en VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// URL base del backend sin el prefijo /api/v1 para resolver archivos estáticos (/uploads)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Resuelve una URL de imagen o evidencia fotográfica de manera segura tanto en local como en producción
 * @param {string} path - Ruta relativa (/uploads/...) o URL absoluta (http...)
 * @returns {string|null} URL completa resuelta
 */
export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
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
