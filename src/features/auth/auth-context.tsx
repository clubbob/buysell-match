'use client';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getClientAuth } from '@/lib/firebase';
import { hasFirebaseClientConfig } from '@/lib/firebase-config';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = hasFirebaseClientConfig();

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const logout = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      logout,
    }),
    [user, loading, configured, signInWithEmail, signUpWithEmail, sendPasswordReset, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
