import type { Metadata } from 'next';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import SellCreateForm from '@/features/sell/SellCreateForm';

export const metadata: Metadata = {
  title: '판매 상품 등록',
};

export default function NewSellPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="판매자"
        title="판매 상품 등록"
        description="상품 정보와 상품 소개 파일, 배송·교환·반품 안내를 등록합니다. 구매 신청은 이 사이트에서 합니다."
      >
        <PageBack href="/sell" />
      </PageIntro>
      <SellCreateForm />
    </div>
  );
}
