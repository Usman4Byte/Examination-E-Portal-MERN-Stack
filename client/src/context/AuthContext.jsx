import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, logoutUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load (Persist login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginAPI(email, password);
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loadUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);