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
      <PageIntro
        eyebrow="판매자"
        title="팝니다 등록"
        description="한 번 등록으로 마감까지 여러 번 거래할 수 있습니다. 쿠팡·스마트스토어·유튜브 주소를 각각 넣을 수 있습니다. 공구 구매 신청은 이 사이트에서 합니다."
      />
      <SellCreateForm />
    </div>
  );
}
