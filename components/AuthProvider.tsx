'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    // Optionally, load user from localStorage or cookie
    const stored = localStorage.getItem('cineglow_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cineglow_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 