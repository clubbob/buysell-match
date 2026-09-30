import Logo, { type LogoMarkVariant } from '@/components/brand/Logo';
import LogoMark from '@/components/brand/LogoMark';
import LogoMarkLink from '@/components/brand/LogoMarkLink';
import LogoMarkPeople from '@/components/brand/LogoMarkPeople';
import LogoMarkDiscount from '@/components/brand/LogoMarkDiscount';
import LogoMarkThumbs from '@/components/brand/LogoMarkThumbs';
import LogoMarkUnbox from '@/components/brand/LogoMarkUnbox';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';

function MarkPreview({ mark }: { mark: LogoMarkVariant }) {
  if (mark === 'link') return <LogoMarkLink />;
  if (mark === 'people') return <LogoMarkPeople />;
  if (mark === 'unbox') return <LogoMarkUnbox />;
  if (mark === 'discount') return <LogoMarkDiscount />;
  if (mark === 'thumbs') return <LogoMarkThumbs />;
  return <LogoMark />;
}

function PreviewCard({
  title,
  description,
  mark,
}: {
  title: string;
  description: string;
  mark: LogoMarkVariant;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-line px-4 py-3 sm:px-6">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="mb-3 text-xs font-semibold text-subtle">헤더(어두운 배경)</p>
          <div className="rounded-md bg-ink px-4 py-3">
            <Logo mark={mark} inverted />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold text-subtle">본문(밝은 배경)</p>
          <div className="rounded-md border border-line bg-white px-4 py-3">
            <Logo mark={mark} />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold text-subtle">마크만 (48px)</p>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ink p-2 text-white">
            <MarkPreview mark={mark} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LogoPreviewPage() {
  return (
    <div className="space-y-5">
      <PageBack href="/" />
      <PageIntro title="로고 비교" description="공구·매칭·모임 로고를 나란히 확인합니다." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PreviewCard
          mark="group"
          title="공동구매 · 박스 (현재)"
          description="양옆 모임 + 가운데 택배 박스."
        />
        <PreviewCard
          mark="unbox"
          title="공동구매 · 언박싱"
          description="뚜껑이 열린 박스와 반짝임. 상품이 도착한 순간."
        />
        <PreviewCard
          mark="thumbs"
          title="만족 · 추천"
          description="엄지척. 잘 샀다, 추천한다는 긍정 신호."
        />
        <PreviewCard
          mark="discount"
          title="특가 · 할인"
          description="가격 태그와 % 기호."
        />
        <PreviewCard
          mark="people"
          title="공동구매 · 사람"
          description="여러 사람이 겹쳐 보이는 형태."
        />
        <PreviewCard
          mark="link"
          title="매칭"
          description="구매자와 판매자를 잇는 연결."
        />
      </div>
    </div>
  );
}
