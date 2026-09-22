import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/invalid-email': '올바른 이메일 주소를 입력해 주세요.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
  'auth/operation-not-allowed': '이메일 가입이 아직 켜져 있지 않습니다. Firebase Authentication에서 이메일/비밀번호를 사용 설정해 주세요.',
  'auth/unauthorized-domain': '이 도메인은 Firebase에 허용되지 않았습니다. Authentication → Settings → Authorized domains에 localhost를 추가해 주세요.',
};

export function getAuthErrorMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? `${fallback} (${error.code})`;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isAsciiPassword(password: string): boolean {
  return /^[\x21-\x7E]+$/.test(password);
}

export const inputClassName = 'input-field';
