export async function readApiJson<T extends { ok?: boolean; message?: string }>(
  response: Response,
  fallback: string,
): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(fallback);
  }
}
