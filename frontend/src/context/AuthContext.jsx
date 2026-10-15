import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const initialToken = localStorage.getItem('accessToken');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Configure axios auth header & 401 automatic logout interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me/`).then((res) => {
        setUser((prev) => {
          const updated = { ...prev, ...res.data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }).catch(() => {});
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token, logout]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login/`, { username, password });
      const { access, refresh, user: userData } = res.data;
      
      setToken(access);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Invalid username or password.';
      if (errData) {
        if (typeof errData === 'string' && (errData.includes('<!doctype') || errData.includes('<html'))) {
          msg = 'Authentication server temporarily unavailable. Please try again.';
        } else if (errData.detail) {
          msg = errData.detail;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/auth/register/`, formData);
      // Auto-login after registration
      return await login(formData.username, formData.password);
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Registration failed. Please check your information.';
      if (errData) {
        if (typeof errData === 'string') {
          if (errData.includes('<!doctype') || errData.includes('<html')) {
            msg = 'Server database connection error. Please try again shortly.';
          } else {
            msg = errData;
          }
        } else if (errData.detail) {
          msg = errData.detail;
        } else if (typeof errData === 'object') {
          const firstKey = Object.keys(errData)[0];
          const val = errData[firstKey];
          msg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    const res = await axios.patch(`${API_BASE}/auth/me/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const updatedUser = { ...user, ...res.data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
