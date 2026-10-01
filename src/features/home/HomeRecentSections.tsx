'use client';

import HomeRecentBuy from '@/features/home/HomeRecentBuy';
import HomeRecentSell from '@/features/home/HomeRecentSell';
import { useUserMode } from '@/features/mode/mode-context';

export default function HomeRecentSections() {
  const { mode } = useUserMode();

  if (mode === 'seller') {
    return (
      <>
        <HomeRecentBuy />
        <HomeRecentSell />
      </>
    );
  }

  return (
    <>
      <HomeRecentSell />
      <HomeRecentBuy />
    </>
  );
}
