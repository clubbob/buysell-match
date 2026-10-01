'use client';

import PageIntro from '@/components/ui/PageIntro';
import { useAuth } from '@/features/auth/auth-context';
import HomeGuide from '@/features/home/HomeGuide';
import HomeMarketplaceIntro from '@/features/home/HomeMarketplaceIntro';
import HomeRecentSections from '@/features/home/HomeRecentSections';
import { useUserMode } from '@/features/mode/mode-context';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export default function SiteHome() {
  const { user } = useAuth();
  const { mode } = useUserMode();
  const showMarketplaceIntro = !user || !mode;

  return (
    <div className="space-y-6">
      <PageIntro title={SITE_NAME} description={`${SITE_NAME}은 ${SITE_TAGLINE}.`} />

      {showMarketplaceIntro ? <HomeMarketplaceIntro /> : null}

      <HomeRecentSections />

      <HomeGuide />
    </div>
  );
}
