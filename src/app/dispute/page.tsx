import type { Metadata } from 'next';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { DisputeBody } from '@/components/legal/legal-bodies';
import CompanyInfo from '@/components/legal/CompanyInfo';
import IntermediaryNotice from '@/components/legal/IntermediaryNotice';

export const metadata: Metadata = {
  title: '분쟁 해결 안내',
};

export default function DisputePage() {
  return (
    <LegalDoc title="분쟁 해결 안내">
      <IntermediaryNotice variant="panel" className="mt-4" />
      <CompanyInfo variant="legal" className="mt-4 rounded-sm border border-line bg-slate-50 px-4 py-3" />
      <DisputeBody />
    </LegalDoc>
  );
}
