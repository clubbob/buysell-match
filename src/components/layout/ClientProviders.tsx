'use client';

import { AuthProvider } from '@/features/auth/auth-context';
import { ModeProvider } from '@/features/mode/mode-context';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ModeProvider>{children}</ModeProvider>
    </AuthProvider>
  );
}
