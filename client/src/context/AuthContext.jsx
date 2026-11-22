import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_user') || sessionStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_token') || sessionStorage.getItem('campus_token'));
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('campus_token') || sessionStorage.getItem('campus_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          if (localStorage.getItem('campus_token')) {
            localStorage.setItem('campus_user', JSON.stringify(response.data.user));
          } else {
            sessionStorage.setItem('campus_user', JSON.stringify(response.data.user));
          }
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('campus_token');
        localStorage.removeItem('campus_user');
        sessionStorage.removeItem('campus_token');
        sessionStorage.removeItem('campus_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setToken(receivedToken);
        setUser(receivedUser);
        
        if (rememberMe) {
          localStorage.setItem('campus_token', receivedToken);
          localStorage.setItem('campus_user', JSON.stringify(receivedUser));
          sessionStorage.removeItem('campus_token');
          sessionStorage.removeItem('campus_user');
        } else {
          sessionStorage.setItem('campus_token', receivedToken);
          sessionStorage.setItem('campus_user', JSON.stringify(receivedUser));
          localStorage.removeItem('campus_token');
          localStorage.removeItem('campus_user');
        }

        toast.success(`Welcome back, ${receivedUser.full_name}!`);
        return { success: true, user: receivedUser };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('campus_token', receivedToken);
        localStorage.setItem('campus_user', JSON.stringify(receivedUser));
        sessionStorage.removeItem('campus_token');
        sessionStorage.removeItem('campus_user');
        toast.success('Registration successful! Welcome to Campus Sell & Buy.');
        return { success: true, user: receivedUser };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('campus_token');
      localStorage.removeItem('campus_user');
      sessionStorage.removeItem('campus_token');
      sessionStorage.removeItem('campus_user');
      setUser(null);
      setToken(null);
      toast.success('You have been logged out.');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      if (localStorage.getItem('campus_token')) {
        localStorage.setItem('campus_user', JSON.stringify(newUser));
      } else {
        sessionStorage.setItem('campus_user', JSON.stringify(newUser));
      }
      return newUser;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
