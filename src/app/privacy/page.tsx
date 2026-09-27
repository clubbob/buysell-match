import type { Metadata } from 'next';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { PrivacyBody } from '@/components/legal/legal-bodies';

export const metadata: Metadata = {
  title: '개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="개인정보처리방침">
      <PrivacyBody />
    </LegalDoc>
  );
}
