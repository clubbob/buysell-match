export function maskPersonName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const first = [...trimmed][0];
  return first ? `${first}**` : '';
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return trimmed ? '**' : '';
  return `${trimmed.slice(0, at)}@**`;
}
