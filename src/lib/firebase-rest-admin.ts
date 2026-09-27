import { createSign } from 'crypto';

type ServiceAccount = {
  project_id?: string;
  client_email: string;
  private_key: string;
};

type TokenCache = { value: string; exp: number };

let tokenCache: TokenCache | null = null;

function parseServiceAccount(raw?: string): ServiceAccount | null {
  if (!raw?.trim()) return null;
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
  const account = parsed as Record<string, string>;
  const privateKey = typeof account.private_key === 'string' ? account.private_key.replace(/\\n/g, '\n') : '';
  if (!account.client_email || !privateKey) return null;
  return {
    project_id: account.project_id,
    client_email: account.client_email,
    private_key: privateKey,
  };
}

function projectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)?.project_id || '';
}

export function hasFirebaseAdminConfig() {
  return Boolean(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) && projectId());
}

function storageBucket() {
  return (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId()}.appspot.com`).replace(/^gs:\/\//, '');
}

export async function uploadStorageFile(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
  const token = await getAccessToken();
  const bucket = storageBucket();
  if (!token || !bucket) throw new Error('Storage가 연결되지 않았습니다.');

  const upload = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(path)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: bytes,
    },
  );
  const data = (await upload.json()) as { name?: string; downloadTokens?: string; error?: { message?: string } };
  if (!upload.ok) {
    throw new Error(data.error?.message ?? 'Storage 업로드에 실패했습니다.');
  }

  const tokenParam = data.downloadTokens ?? '';
  const objectPath = encodeURIComponent(data.name || path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${objectPath}?alt=media${tokenParam ? `&token=${tokenParam}` : ''}`;
}

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && tokenCache.exp - 60_000 > Date.now()) return tokenCache.value;
  const account = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (!account) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      sub: account.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/firebase',
      ].join(' '),
    }),
  ).toString('base64url');
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(account.private_key, 'base64url')}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !data.access_token) return null;
  tokenCache = {
    value: data.access_token,
    exp: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

function fromValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if ('stringValue' in item) return String(item.stringValue ?? '');
  if ('integerValue' in item) return Number(item.integerValue);
  if ('doubleValue' in item) return Number(item.doubleValue);
  if ('booleanValue' in item) return Boolean(item.booleanValue);
  if ('timestampValue' in item) return String(item.timestampValue ?? '');
  if ('nullValue' in item) return null;
  if ('arrayValue' in item) {
    const values = (item.arrayValue as { values?: unknown[] } | undefined)?.values ?? [];
    return values.map(fromValue);
  }
  if ('mapValue' in item) {
    return fromFields((item.mapValue as { fields?: Record<string, unknown> } | undefined)?.fields);
  }
  return null;
}

function fromFields(fields?: Record<string, unknown>): Record<string, unknown> {
  if (!fields) return {};
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));
}

function toValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  if (typeof value === 'object') {
    return { mapValue: { fields: toFields(value as Record<string, unknown>) } };
  }
  return { stringValue: String(value) };
}

function toFields(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]));
}

function docId(name?: string) {
  return name?.split('/').pop() ?? '';
}

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export async function listAuthUsers(): Promise<AuthUser[]> {
  const token = await getAccessToken();
  const project = projectId();
  if (!token || !project) return [];

  const users: AuthUser[] = [];
  let pageToken = '';
  for (let page = 0; page < 10; page += 1) {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/projects/' + project + '/accounts:batchGet', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxResults: 1000, ...(pageToken ? { nextPageToken: pageToken } : {}) }),
    });
    if (!response.ok) {
      const fallback = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/downloadAccount', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxResults: 1000, ...(pageToken ? { nextPageToken: pageToken } : {}) }),
      });
      const data = (await fallback.json()) as {
        users?: { localId?: string; email?: string; displayName?: string; createdAt?: string }[];
        nextPageToken?: string;
      };
      if (!fallback.ok) break;
      for (const user of data.users ?? []) {
        if (!user.localId) continue;
        users.push(toAuthUser(user));
      }
      pageToken = data.nextPageToken ?? '';
      if (!pageToken) break;
      continue;
    }
    const data = (await response.json()) as {
      users?: { localId?: string; email?: string; displayName?: string; createdAt?: string }[];
      nextPageToken?: string;
    };
    for (const user of data.users ?? []) {
      if (!user.localId) continue;
      users.push(toAuthUser(user));
    }
    pageToken = data.nextPageToken ?? '';
    if (!pageToken) break;
  }
  return users;
}

function toAuthUser(user: { localId?: string; email?: string; displayName?: string; createdAt?: string }): AuthUser {
  const createdMs = Number(user.createdAt);
  return {
    uid: user.localId ?? '',
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    createdAt: Number.isFinite(createdMs) && createdMs > 0 ? new Date(createdMs).toISOString() : '',
  };
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const token = await getAccessToken();
  const project = projectId();
  if (!token || !project) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:lookup`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: [email] }),
  });
  const data = (await response.json()) as { users?: { localId?: string; email?: string; displayName?: string; createdAt?: string }[] };
  const user = data.users?.[0];
  return user?.localId ? toAuthUser(user) : null;
}

export async function getAuthUser(uid: string): Promise<AuthUser | null> {
  const token = await getAccessToken();
  const project = projectId();
  if (!token || !project) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:lookup`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: [uid] }),
  });
  const data = (await response.json()) as { users?: { localId?: string; email?: string; displayName?: string; createdAt?: string }[] };
  const user = data.users?.[0];
  return user?.localId ? toAuthUser(user) : null;
}

export async function deleteAuthUser(uid: string): Promise<void> {
  const token = await getAccessToken();
  const project = projectId();
  if (!token || !project) return;
  await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:delete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: uid }),
  });
}

export async function verifyIdToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = (await response.json()) as { users?: { localId?: string }[] };
  return data.users?.[0]?.localId ?? null;
}

function documentsUrl(collection: string, id?: string) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/${collection}`;
  return id ? `${base}/${id}` : base;
}

export async function listDocuments(collection: string): Promise<{ id: string; data: Record<string, unknown> }[]> {
  const token = await getAccessToken();
  if (!token || !projectId()) return [];
  const items: { id: string; data: Record<string, unknown> }[] = [];
  let pageToken = '';
  for (let page = 0; page < 20; page += 1) {
    const url = new URL(documentsUrl(collection));
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = (await response.json()) as {
      documents?: { name?: string; fields?: Record<string, unknown> }[];
      nextPageToken?: string;
    };
    if (!response.ok) break;
    for (const doc of data.documents ?? []) {
      const id = docId(doc.name);
      if (id) items.push({ id, data: fromFields(doc.fields) });
    }
    pageToken = data.nextPageToken ?? '';
    if (!pageToken) break;
  }
  return items;
}

export async function getDocument(collection: string, id: string): Promise<Record<string, unknown> | null> {
  const token = await getAccessToken();
  if (!token || !projectId()) return null;
  const response = await fetch(documentsUrl(collection, id), { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404 || !response.ok) return null;
  const data = (await response.json()) as { fields?: Record<string, unknown> };
  return fromFields(data.fields);
}

export async function setDocument(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  const token = await getAccessToken();
  if (!token || !projectId()) throw new Error('관리자 DB가 연결되지 않았습니다.');
  const response = await fetch(documentsUrl(collection, id), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!response.ok) throw new Error('저장하지 못했습니다.');
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  const token = await getAccessToken();
  if (!token || !projectId()) return;
  await fetch(documentsUrl(collection, id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function queryDocumentIds(collection: string, field: string, value: string): Promise<string[]> {
  const token = await getAccessToken();
  if (!token || !projectId()) return [];
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: { stringValue: value },
          },
        },
      },
    }),
  });
  const rows = (await response.json()) as { document?: { name?: string } }[];
  if (!response.ok || !Array.isArray(rows)) return [];
  return rows.map((row) => docId(row.document?.name)).filter(Boolean);
}
