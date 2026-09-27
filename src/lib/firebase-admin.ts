import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function parseServiceAccount(raw: string): Record<string, string> | null {
  const text = raw.trim().replace(/^\uFEFF/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    try {
      parsed = JSON.parse(JSON.parse(text) as string);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const account = { ...(parsed as Record<string, string>) };
  if (typeof account.private_key === 'string') {
    account.private_key = account.private_key.replace(/\\n/g, '\n');
  }
  if (!account.client_email || !account.private_key) return null;
  return account;
}

function createAdminApp(): App | null {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();

  try {
    if (raw) {
      const serviceAccount = parseServiceAccount(raw);
      if (!serviceAccount) return null;
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
      });
    }
    if (projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    }
  } catch {
    return null;
  }

  return null;
}

export function getFirebaseAdminApp(): App | null {
  return createAdminApp();
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}
