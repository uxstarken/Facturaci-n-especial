'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  pendingUser: User | null;
  login: (email: string, pass: string, roleOverride?: Role) => { success: boolean; requires2FA?: boolean; message?: string };
  verify2FA: (code: string) => boolean;
  logout: () => void;
  setPendingUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('starken_fe_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('starken_fe_user');
        setUser(null);
      }
    } else {
      const loggedOut = localStorage.getItem('starken_fe_logged_out');
      if (!loggedOut) {
        // Initial demo mock user
        setUser(MOCK_USERS[0]);
        localStorage.setItem('starken_fe_user', JSON.stringify(MOCK_USERS[0]));
      } else {
        setUser(null);
      }
    }
  }, []);

  const login = (email: string, pass: string, roleOverride?: Role) => {
    localStorage.removeItem('starken_fe_logged_out');
    
    const cleanEmail = email.trim().toLowerCase();
    
    // Regla inteligente:
    // Si contiene "jefe" o "jefatura" -> Jefatura (Carlos Muñoz)
    // De lo contrario -> Analista (Ana Valenzuela)
    const isJefe = cleanEmail.includes('jefe') || cleanEmail.includes('jefatura');
    const assignedRole: Role = roleOverride || (isJefe ? 'Jefatura' : 'Analista');

    const assignedName = assignedRole === 'Jefatura' ? 'Carlos Muñoz' : 'Ana Valenzuela';
    const assignedEmail = cleanEmail || (assignedRole === 'Jefatura' ? 'jefe@starken.cl' : 'analista@starken.cl');

    const loggedInUser: User = {
      id: assignedRole === 'Jefatura' ? '2' : '1',
      name: assignedName,
      email: assignedEmail,
      role: assignedRole,
      requires2FA: false, // Ingreso directo con cualquier contraseña
    };

    setUser(loggedInUser);
    localStorage.setItem('starken_fe_user', JSON.stringify(loggedInUser));
    return { success: true, requires2FA: false };
  };

  const verify2FA = (code: string) => {
    if (pendingUser) {
      localStorage.removeItem('starken_fe_logged_out');
      setUser(pendingUser);
      localStorage.setItem('starken_fe_user', JSON.stringify(pendingUser));
      setPendingUser(null);
      return true;
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem('starken_fe_user');
    localStorage.setItem('starken_fe_logged_out', 'true');
  };

  return (
    <AuthContext.Provider value={{ user, pendingUser, login, verify2FA, logout, setPendingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
