import type { Metadata } from 'next';
import AuthForm from '@/features/auth/AuthForm';

export const metadata: Metadata = {
  title: '로그인',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
