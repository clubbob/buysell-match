import type { Metadata } from 'next';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import BuyerProfileForm from '@/features/buyer/BuyerProfileForm';

export const metadata: Metadata = {
  title: '구매자 정보',
};

export default function BuyerProfilePage() {
  return (
    <div className="space-y-5">
      <PageBack href="/mypage">← 마이페이지</PageBack>
      <article className="panel px-4 py-6 sm:px-6 sm:py-8">
        <PageIntro
          title="구매자 정보"
          description="핸드폰 번호와 배송 주소를 등록합니다. 주소는 여러 개 넣을 수 있고, 주문에 쓸 기본 주소를 고릅니다."
        />
        <BuyerProfileForm />
      </article>
    </div>
  );
}
