import ClientProviders from './ClientProviders';
import LayoutShell from './LayoutShell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <LayoutShell>{children}</LayoutShell>
    </ClientProviders>
  );
}
