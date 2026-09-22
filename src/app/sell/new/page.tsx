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
          description="상품 사진, 가격, 수량, 마감을 등록합니다. 목록에는 대표 이미지가 보입니다."
        />
        <div className="mt-6">
          <SellCreateForm />
        </div>
      </div>
    </div>
  );
}
