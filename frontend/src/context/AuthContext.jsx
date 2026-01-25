import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(token ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  const [view, setView] = useState(user ? 'dashboard' : 'login');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [token, user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    setView('dashboard');
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    setToken(res.token);
    setUser(res.user);
    setView('dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setView('login');
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, view, setView }}>
      {children}
    </AuthContext.Provider>
  );
}
