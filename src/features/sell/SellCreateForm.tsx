'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { createRemoteSellListing } from '@/lib/sell-remote';
import { inputClassName } from '@/features/auth/auth-errors';

const MAX_EXTRA = 5;

type ImageItem = {
  id: string;
  url: string;
  file: File;
};

function toImageItem(file: File): ImageItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    url: URL.createObjectURL(file),
    file,
  };
}

export default function SellCreateForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, ready: modeReady, setMode } = useUserMode();
  const [cover, setCover] = useState<ImageItem | null>(null);
  const [extras, setExtras] = useState<ImageItem[]>([]);
  const [title, setTitle] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [quantityLabel, setQuantityLabel] = useState('');
  const [remainingLabel, setRemainingLabel] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && modeReady && mode !== 'seller') setMode('seller');
  }, [user, modeReady, mode, setMode]);

  useEffect(() => {
    if (user?.email && !sellerEmail) setSellerEmail(user.email);
  }, [user, sellerEmail]);

  function handleCover(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setCover(toImageItem(file));
  }

  function handleExtras(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = MAX_EXTRA - extras.length;
    const files = Array.from(fileList).slice(0, remaining);
    setExtras((current) => [...current, ...files.map(toImageItem)]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user) {
      setError('로그인 후 등록할 수 있습니다.');
      return;
    }
    if (!cover) {
      setError('대표 이미지를 넣어 주세요.');
      return;
    }
    if (!title.trim()) {
      setError('상품명을 입력해 주세요.');
      return;
    }
    const regular = Number(regularPrice);
    const sale = Number(salePrice);
    if (!Number.isFinite(regular) || regular <= 0 || !Number.isFinite(sale) || sale <= 0) {
      setError('가격은 0보다 큰 숫자로 입력해 주세요.');
      return;
    }
    if (!quantityLabel.trim() || !remainingLabel.trim()) {
      setError('수량과 남은 수량을 입력해 주세요.');
      return;
    }
    if (!deadline) {
      setError('마감일을 선택해 주세요.');
      return;
    }
    if (!description.trim()) {
      setError('상품 안내를 입력해 주세요.');
      return;
    }
    if (!sellerName.trim() || !sellerPhone.trim() || !sellerEmail.trim()) {
      setError('상호, 전화, 이메일을 입력해 주세요.');
      return;
    }

    setPending(true);
    void (async () => {
      try {
        const item = await createRemoteSellListing(
          {
            id: `u-${crypto.randomUUID()}`,
            title: title.trim(),
            sellerId: user.uid,
            sellerName: sellerName.trim(),
            representativeName: '',
            businessVerified: false,
            sellerPhone: sellerPhone.trim(),
            sellerEmail: sellerEmail.trim(),
            regularPrice: regular,
            salePrice: sale,
            quantityLabel: quantityLabel.trim(),
            remainingLabel: remainingLabel.trim(),
            deadline,
            description: description.trim(),
          },
          [cover.file, ...extras.map((entry) => entry.file)],
        );
        router.push(`/sell/${item.id}`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : '등록에 실패했습니다.');
        setPending(false);
      }
    })();
  }

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-sm font-bold text-ink">상품 사진</h2>
        <p className="mt-1 text-sm text-muted">대표 이미지 1장은 필수입니다. 추가 이미지는 최대 {MAX_EXTRA}장까지 등록할 수 있습니다.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">대표 이미지</span>
            <span className="flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-slate-50">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="대표 이미지" className="h-40 w-full object-cover" />
              ) : (
                <span className="px-4 py-8 text-center text-sm text-subtle">클릭해서 대표 사진을 넣으세요</span>
              )}
            </span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleCover(event.target.files)} />
          </label>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink">추가 이미지</span>
            <div className="grid grid-cols-3 gap-2">
              {extras.map((item) => (
                <div key={item.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="h-24 w-full border border-line object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] text-white"
                    onClick={() => setExtras((current) => current.filter((entry) => entry.id !== item.id))}
                  >
                    삭제
                  </button>
                </div>
              ))}
              {extras.length < MAX_EXTRA ? (
                <label className="flex h-24 cursor-pointer items-center justify-center border border-dashed border-line text-xs text-subtle">
                  + 추가
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) => handleExtras(event.target.files)}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-ink">상품 정보</h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">상품명</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">정상가 (원)</span>
            <input
              type="number"
              min={1}
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">특판가 (원)</span>
            <input
              type="number"
              min={1}
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">수량</span>
            <input
              value={quantityLabel}
              onChange={(event) => setQuantityLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 50포"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">남은 수량</span>
            <input
              value={remainingLabel}
              onChange={(event) => setRemainingLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 32포 남음"
              required
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">마감일</span>
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className={inputClassName}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">상품 안내</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} h-32 py-3`}
            required
          />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-ink">판매자 연락처</h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">상호</span>
          <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} className={inputClassName} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">전화</span>
            <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} className={inputClassName} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">이메일</span>
            <input
              type="email"
              value={sellerEmail}
              onChange={(event) => setSellerEmail(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        </div>
      </section>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? '등록 중…' : '등록하기'}
      </button>
    </form>
  );
}
