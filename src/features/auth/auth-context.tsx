'use client';

import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getClientAuth } from '@/lib/firebase';
import { hasFirebaseClientConfig } from '@/lib/firebase-config';
import { ensureMember, saveMember } from '@/lib/member-remote';
import { clearUserMode } from '@/lib/user-mode';
import type { SignupConsents } from '@/types/member';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string, consents: SignupConsents) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<void>;
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
      if (nextUser) {
        void ensureMember({
          id: nextUser.uid,
          name: nextUser.displayName,
          email: nextUser.email,
        }).catch(() => undefined);
      }
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    clearUserMode();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string, consents: SignupConsents) => {
      const auth = getClientAuth();
      if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
      clearUserMode();
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name });
      const now = new Date().toISOString();
      try {
        await saveMember({
          id: credential.user.uid,
          name,
          email: email.trim(),
          createdAt: now,
          termsAgreedAt: now,
          privacyAgreedAt: now,
          marketingAgreed: consents.marketingAgreed,
          marketingAgreedAt: consents.marketingAgreed ? now : '',
        });
      } catch {
        // Auth 가입은 유지하고, 이후 로그인 시 members 문서를 다시 맞춘다.
      }
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다.');
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const changePassword = useCallback(async (currentPassword: string, nextPassword: string) => {
    const auth = getClientAuth();
    const current = auth?.currentUser;
    if (!auth || !current?.email) throw new Error('로그인 후 비밀번호를 바꿀 수 있습니다.');
    const credential = EmailAuthProvider.credential(current.email, currentPassword);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, nextPassword);
  }, []);

  const logout = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) return;
    clearUserMode();
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
      changePassword,
      logout,
    }),
    [user, loading, configured, signInWithEmail, signUpWithEmail, sendPasswordReset, changePassword, logout],
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
