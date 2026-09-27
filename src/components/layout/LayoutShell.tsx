'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ModeSelectBar from '@/components/layout/ModeSelectBar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="flex min-h-dvh min-w-0 flex-col">
        <div className="sticky top-0 z-50">
          <AdminHeader />
        </div>
        <main className="mx-auto w-full min-w-0 max-w-board flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh min-w-0 flex-col">
      <div className="sticky top-0 z-50">
        <Header />
        <ModeSelectBar />
      </div>
      <main className="mx-auto w-full min-w-0 max-w-board flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <Footer />
    </div>
  );
}
