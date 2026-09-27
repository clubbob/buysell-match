import type { Metadata } from 'next';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { TermsBody } from '@/components/legal/legal-bodies';

export const metadata: Metadata = {
  title: '이용약관',
};

export default function TermsPage() {
  return (
    <LegalDoc title="이용약관">
      <TermsBody />
    </LegalDoc>
  );
}
