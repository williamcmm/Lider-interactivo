'use client'

import React, { createContext, useContext } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { User } from 'firebase/auth';

interface FirebaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  notes: any[];
  sharedNotes: any[];
  firebaseUser: User;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authData = useFirebaseAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Función para reemplazar useSession()
export function useSession() {
  const { user, loading } = useAuth();
  
  return {
    data: user ? {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    } : null,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated'
  };
}

// Función para verificar si el usuario es admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN';
}
