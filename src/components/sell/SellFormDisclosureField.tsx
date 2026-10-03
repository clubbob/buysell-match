import { inputClassName } from '@/features/auth/auth-errors';
import { cn } from '@/lib/utils';

export function SellFormDisclosureField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 border-b border-line last:border-b-0 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
      <span className="bg-slate-50 px-3 py-2.5 text-sm font-semibold text-ink sm:border-r sm:border-line">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <div className="space-y-1.5 px-3 py-2.5">
        {children}
        {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}

export function disclosureInputClass(hasError: boolean) {
  return cn(inputClassName, hasError && 'border-red-300 focus:border-red-400 focus:ring-red-300');
}
