import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

function leftoverNextPids() {
  const rootPosix = root.replaceAll('\\', '/');
  const raw = execSync(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"',
    { encoding: 'utf8' },
  ).trim();
  if (!raw) return [];

  const rows = JSON.parse(raw);
  const list = Array.isArray(rows) ? rows : [rows];
  return list
    .filter((row) => {
      const cmd = String(row.CommandLine ?? '');
      const inThisRepo = cmd.includes(root) || cmd.includes(rootPosix);
      const isNext =
        cmd.includes(`${path.sep}node_modules${path.sep}next`) ||
        cmd.includes('node_modules/next') ||
        cmd.includes('next-server') ||
        cmd.includes('next dev');
      return inThisRepo && isNext && Number(row.ProcessId) !== process.pid;
    })
    .map((row) => Number(row.ProcessId))
    .filter((pid) => Number.isInteger(pid) && pid > 0);
}

const leftover = leftoverNextPids();
for (const pid of leftover) {
  try {
    process.kill(pid);
    console.log(`이전 개발 서버를 종료했습니다. (pid ${pid})`);
  } catch {
    // already gone
  }
}

if (leftover.length > 0) {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

const child = spawn(process.execPath, [nextBin, 'dev'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
