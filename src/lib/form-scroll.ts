export function scrollToFormField(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    element.focus({ preventScroll: true });
    return;
  }

  if (element instanceof HTMLLabelElement) {
    element.focus({ preventScroll: true });
    return;
  }

  const focusable = element.querySelector<HTMLElement>('input:not(.sr-only), textarea, select, button');
  focusable?.focus({ preventScroll: true });
}
