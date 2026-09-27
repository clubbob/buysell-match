import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/features/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/admin-session';

export const metadata: Metadata = {
  title: '관리자 로그인',
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin/dashboard');
  return <AdminLoginForm />;
}
