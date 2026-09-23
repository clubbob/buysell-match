import type { Metadata } from 'next';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import BuyCreateGuard from '@/features/buy/BuyCreateGuard';

export const metadata: Metadata = {
  title: '삽니다 등록',
};

export default function NewBuyPage() {
  return (
    <div className="space-y-5">
      <PageBack href="/buy" />
      <div className="panel px-4 py-6 sm:px-6 sm:py-8">
        <BuyCreateGuard>
          <PageIntro
            eyebrow="구매자"
            title="삽니다 등록"
            description="찾는 상품, 가격, 수량, 마감일을 받는 등록 폼은 다음 단계에서 붙입니다."
          />
        </BuyCreateGuard>
      </div>
    </div>
  );
}
