'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type AutoResizeTextareaProps = {
  id?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
};

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
}

export default function AutoResizeTextarea({ id, value, onChange, className, placeholder }: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resizeTextarea(ref.current);
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={(event) => {
        onChange(event);
        resizeTextarea(event.currentTarget);
      }}
      className={cn('resize-none overflow-hidden py-3', className)}
    />
  );
}
