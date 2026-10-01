import type { Metadata } from 'next';
import CompanyInfo from '@/components/legal/CompanyInfo';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { PrivacyBody } from '@/components/legal/legal-bodies';

export const metadata: Metadata = {
  title: '개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="개인정보처리방침">
      <CompanyInfo variant="legal" className="mt-4 rounded-sm border border-line bg-slate-50 px-4 py-3" />
      <PrivacyBody />
    </LegalDoc>
  );
}
