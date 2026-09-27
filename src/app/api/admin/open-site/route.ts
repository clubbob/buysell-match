import { execFile } from 'node:child_process';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { getPublicSiteUrl } from '@/lib/site';

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const href = getPublicSiteUrl();
  const canLaunch = process.platform === 'win32' && process.env.NODE_ENV !== 'production';
  if (!canLaunch) {
    return NextResponse.json({ ok: true, href, openInClient: true });
  }

  execFile('cmd.exe', ['/c', 'start', '', href], { windowsHide: true });
  return NextResponse.json({ ok: true, href });
}
