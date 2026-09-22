import ClientProviders from './ClientProviders';
import Footer from './Footer';
import Header from './Header';
import ModeSelectBar from './ModeSelectBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <div className="sticky top-0 z-50">
          <Header />
          <ModeSelectBar />
        </div>
        <main className="mx-auto w-full min-w-0 max-w-board flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
        <Footer />
      </div>
    </ClientProviders>
  );
}
