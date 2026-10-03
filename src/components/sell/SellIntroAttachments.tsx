'use client';

import { useRef } from 'react';

export type IntroAttachmentItem = {
  id: string;
  url: string;
  file: File | null;
};

const MAX_COUNT = 8;
const MAX_BYTES = 8 * 1024 * 1024;

function isPdf(item: IntroAttachmentItem) {
  if (item.file?.type.includes('pdf')) return true;
  return item.url.toLowerCase().includes('.pdf');
}

export default function SellIntroAttachments({
  items,
  onChange,
  error,
}: {
  items: IntroAttachmentItem[];
  onChange: (items: IntroAttachmentItem[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next = [...items];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_COUNT) break;
      if (file.size > MAX_BYTES) continue;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        url: file.type.includes('pdf') ? '' : URL.createObjectURL(file),
        file,
      });
    }
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.length > 0 && items.length < MAX_COUNT ? (
        <div className="flex justify-end">
          <button type="button" className="btn-secondary shrink-0" onClick={() => inputRef.current?.click()}>
            파일 추가
          </button>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="relative overflow-hidden border border-line bg-slate-50">
              {isPdf(item) ? (
                <div className="flex min-h-16 items-center px-4 py-4 pr-20">
                  <p className="min-w-0 truncate text-sm font-semibold text-ink">
                    {item.file?.name || '첨부 PDF'}
                  </p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="block w-full object-contain" />
              )}
              <button
                type="button"
                className="absolute right-3 top-3 border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm hover:bg-slate-100"
                onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          className="flex w-full min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-slate-50 px-4 py-6 text-sm text-subtle"
          onClick={() => inputRef.current?.click()}
        >
          클릭해서 상품 소개용 사진 또는 PDF를 등록하세요
        </button>
      )}
      {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
    </div>
  );
}
