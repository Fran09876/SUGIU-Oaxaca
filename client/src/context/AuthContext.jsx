import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sigiu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('sigiu_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && !user) {
      authApi.getMe()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('sigiu_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('sigiu_token', res.data.token);
        localStorage.setItem('sigiu_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Error de autenticación');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('sigiu_token', res.data.token);
        localStorage.setItem('sigiu_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Error al registrar ciudadano');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error en registro';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sigiu_token');
    localStorage.removeItem('sigiu_user');
  };

  const roleName = user?.rol?.nombre || user?.rol || 'Ciudadano';
  const isAdmin = roleName === 'Administrador';
  const isOperator = roleName === 'Operador';
  const isCrew = roleName === 'Cuadrilla';
  const isCitizen = !user || roleName === 'Ciudadano';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        roleName,
        isAdmin,
        isOperator,
        isCrew,
        isCitizen,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
