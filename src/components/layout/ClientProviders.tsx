'use client';

import { AuthProvider } from '@/features/auth/auth-context';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
