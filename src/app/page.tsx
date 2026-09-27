import FirebaseSetupBanner from '@/components/setup/FirebaseSetupBanner';
import HomePageClient from '@/features/home/HomePageClient';

export default function HomePage() {
  return (
    <>
      <FirebaseSetupBanner />
      <HomePageClient />
    </>
  );
}
