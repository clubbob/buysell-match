import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseClientConfig, hasFirebaseClientConfig } from '@/lib/firebase-config';

const APP_NAME = 'buysell-match';

function createFirebaseApp(): FirebaseApp {
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return existing;
  return initializeApp(getFirebaseClientConfig(), APP_NAME);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseClientConfig()) return null;
  return createFirebaseApp();
}

export function getClientAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getClientFirestore(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getClientStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}
