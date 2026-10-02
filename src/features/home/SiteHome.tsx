'use client';

import PageIntro from '@/components/ui/PageIntro';
import HomeGuide from '@/features/home/HomeGuide';
import HomeRecentSections from '@/features/home/HomeRecentSections';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export default function SiteHome() {
  return (
    <div className="space-y-6">
      <PageIntro title={SITE_NAME} description={`${SITE_NAME}은 ${SITE_TAGLINE}.`} />

      <HomeRecentSections />

      <HomeGuide />
    </div>
  );
}
