import type { Metadata } from 'next';
import FirebaseSetupBanner from '@/components/setup/FirebaseSetupBanner';
import HomePageClient from '@/features/home/HomePageClient';

export const metadata: Metadata = {
  title: '메인',
};

export default function HomePage() {
  return (
    <>
      <FirebaseSetupBanner />
      <HomePageClient />
    </>
  );
}
