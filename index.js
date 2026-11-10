/**
 * Host half: keeps a Pixel Clock desktop helper process available.
 *
 * The Web UI cannot render outside the Harness window, so the helper owns a
 * separate transparent always-on-top window. It exposes a loopback bridge the
 * Client half talks to when detaching or attaching the clock. Without the
 * Electron runtime the plugin still works entirely inside the Harness window.
 */
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

export const name = 'pixel-clock';

const PORT = Number(process.env.PIXEL_CLOCK_PORT || 17890);
const MAIN = fileURLToPath(new URL('./desktop/main.cjs', import.meta.url));

function dataDir() {
  return join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'pixel-clock');
}

function log(message) {
  try {
    const dir = dataDir();
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, 'host.log'), `[${new Date().toISOString()}] ${message}\n`);
  } catch (error) {
    /* logging is best effort */
  }
}

function electronBinary() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const candidates = [
    process.env.PIXEL_CLOCK_ELECTRON,
    join(home, 'electron', 'Electron.app', 'Contents', 'MacOS', 'Electron'),
    join(home, 'electron', 'electron'),
    join(home, 'electron', 'electron.exe'),
  ];
  return candidates.find((candidate) => candidate && existsSync(candidate)) || null;
}

function health() {
  return new Promise((resolve) => {
    const request = http.get({ host: '127.0.0.1', port: PORT, path: '/health', timeout: 800 }, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed && parsed.app === 'pixel-clock' ? parsed : null);
        } catch (error) {
          resolve(null);
        }
      });
    });
    request.on('error', () => resolve(null));
    request.on('timeout', () => {
      request.destroy();
      resolve(null);
    });
  });
}

export function apply(ctx) {
  ctx.effect(() => {
    let alive = true;
    let child = null;
    const binary = electronBinary();
    if (!binary) {
      log('electron runtime not found; desktop window unavailable');
      return undefined;
    }
    health().then(async (running) => {
      if (!alive) return;
      if (running && running.hostPid === process.pid) return;
      if (running) {
        log(`replacing stale helper pid=${running.pid} hostPid=${running.hostPid}`);
        try {
          process.kill(running.pid, 'SIGTERM');
        } catch (error) {
          log(`stale helper kill failed: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!alive) return;
      }
      const env = { ...process.env, PIXEL_CLOCK_PORT: String(PORT), PIXEL_CLOCK_HOST_PID: String(process.pid) };
      delete env.ELECTRON_RUN_AS_NODE;
      try {
        child = spawn(binary, [MAIN], { env, stdio: 'ignore' });
      } catch (error) {
        log(`spawn failed: ${error.message}`);
        return;
      }
      log(`helper started pid=${child.pid} binary=${binary}`);
      child.on('error', (error) => log(`helper error: ${error.message}`));
      child.on('exit', (code, signal) => log(`helper exited code=${code} signal=${signal}`));
    });
    return () => {
      alive = false;
      if (child && !child.killed) {
        try {
          child.kill('SIGTERM');
        } catch (error) {
          log(`helper kill failed: ${error.message}`);
        }
      }
    };
  }, 'pixel-clock: desktop helper');
}
