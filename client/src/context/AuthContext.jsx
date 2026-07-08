import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('jacovet_token');
    const savedUser = localStorage.getItem('jacovet_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userProfile } = response.data;
      
      localStorage.setItem('jacovet_token', token);
      localStorage.setItem('jacovet_user', JSON.stringify(userProfile));
      
      setToken(token);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const registerUser = async (name, email, password, petName, petCategory, petBreed, petAge) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        petName,
        petCategory,
        petBreed,
        petAge
      });
      const { token, user: userProfile } = response.data;
      
      localStorage.setItem('jacovet_token', token);
      localStorage.setItem('jacovet_user', JSON.stringify(userProfile));
      
      setToken(token);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message };
    }
  };

  const registerDoctor = async (name, email, password, specialty, experience) => {
    try {
      const response = await api.post('/auth/register-doctor', {
        name,
        email,
        password,
        specialty,
        experience
      });
      const { token, user: userProfile } = response.data;
      
      localStorage.setItem('jacovet_token', token);
      localStorage.setItem('jacovet_user', JSON.stringify(userProfile));
      
      setToken(token);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      console.error('Doctor registration error:', error);
      const message = error.response?.data?.message || 'Doctor registration failed. Try again.';
      return { success: false, message };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('jacovet_token');
    localStorage.removeItem('jacovet_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoggedIn: !!token,
    loading,
    login: loginUser,
    register: registerUser,
    registerDoctor,
    logout: logoutUser
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
