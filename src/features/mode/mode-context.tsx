'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import {
  clearUserMode,
  loadUserMode,
  saveUserMode,
  type UserMode,
} from '@/lib/user-mode';

type ModeContextValue = {
  mode: UserMode | null;
  ready: boolean;
  setMode: (mode: UserMode, options?: { navigate?: boolean }) => void;
  resetMode: (options?: { navigate?: boolean }) => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setModeState] = useState<UserMode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    setModeState(user ? loadUserMode() : null);
    setReady(true);
  }, [user, loading]);

  const setMode = useCallback(
    (next: UserMode, options?: { navigate?: boolean }) => {
      setModeState(next);
      saveUserMode(next);
      if (options?.navigate) router.push('/');
    },
    [router],
  );

  const resetMode = useCallback(
    (options?: { navigate?: boolean }) => {
      setModeState(null);
      clearUserMode();
      if (options?.navigate) router.push('/');
    },
    [router],
  );

  const value = useMemo(
    () => ({ mode, ready, setMode, resetMode }),
    [mode, ready, setMode, resetMode],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useUserMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useUserMode must be used within ModeProvider');
  }
  return context;
}
