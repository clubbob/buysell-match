import type { Metadata } from 'next';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { MarketingBody } from '@/components/legal/legal-bodies';

export const metadata: Metadata = {
  title: '마케팅 수신 동의',
};

export default function MarketingPage() {
  return (
    <LegalDoc title="마케팅 수신 동의">
      <MarketingBody />
    </LegalDoc>
  );
}
