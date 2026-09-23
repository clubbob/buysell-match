import type { Metadata } from 'next';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import SellCreateForm from '@/features/sell/SellCreateForm';

export const metadata: Metadata = {
  title: '팝니다 등록',
};

export default function NewSellPage() {
  return (
    <div className="space-y-5">
      <PageBack href="/sell" />
      <div className="panel px-4 py-6 sm:px-6 sm:py-8">
        <PageIntro
          eyebrow="판매자"
          title="팝니다 등록"
          description="한 번 등록으로 마감까지 여러 번 거래할 수 있습니다. 최소 수량이 모이면 거래하고, 잔여가 있으면 추가 거래합니다."
        />
        <div className="mt-6">
          <SellCreateForm />
        </div>
      </div>
    </div>
  );
}
