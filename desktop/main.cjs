/**
 * Pixel Clock desktop helper.
 *
 * The DSH Web UI cannot render past its own Electron window, so this helper is
 * a separate transparent, always-on-top window. The Host half spawns it and it
 * exposes a tiny loopback bridge the Web UI uses to detach / attach the clock
 * and to hand state back and forth. macOS first; Windows uses the same code.
 */
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { execFile } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = Number(process.env.PIXEL_CLOCK_PORT || 17890);
const HOST_PID = Number(process.env.PIXEL_CLOCK_HOST_PID || 0);
const HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const DATA_DIR = path.join(HOME, 'pixel-clock');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const BOUNDS_FILE = path.join(DATA_DIR, 'bounds.json');
const LOG_FILE = path.join(DATA_DIR, 'helper.log');

const SIDE = 8;
const ARROW_SPACE = 30;
const TOP = 40;
const BOTTOM = 8;
const GAP = 8;
const EDGE = 6;
const PANEL_WIDTH = 276;
const PANEL_HEIGHT = 380;
const MIN_SIZE = 80;
const MAX_SIZE = 180;

let win = null;
let currentState = null;
let rootOffset = { left: SIDE, top: TOP };
let planetSize = 124;
let drag = null;

fs.mkdirSync(DATA_DIR, { recursive: true });
app.setName('pixel-clock-helper');
try {
  app.setPath('userData', path.join(DATA_DIR, 'electron'));
} catch (error) {
  /* a custom userData directory is a nicety, not a requirement */
}
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
if (process.env.PIXEL_CLOCK_DEBUG === '1') {
  app.commandLine.appendSwitch('remote-debugging-port', '9223');
  app.commandLine.appendSwitch('remote-allow-origins', '*');
}

function log(...args) {
  try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
  } catch (error) {
    /* logging is best effort */
  }
}

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return null;
  }
}

function saveJson(file, value) {
  try {
    fs.writeFileSync(file, JSON.stringify(value, null, 2));
  } catch (error) {
    log('write failed', file, error.message);
  }
}

function clampSize(value) {
  const rounded = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(Number(value) || 124)));
  return Math.round(rounded / 4) * 4;
}

function persistState() {
  if (currentState) saveJson(STATE_FILE, currentState);
}

/** Closing or returning the window always means the clock lives in the app again. */
function markModeApp() {
  if (!currentState || !currentState.settings || typeof currentState.settings !== 'object') return;
  if (currentState.settings.mode === 'app') return;
  currentState.settings.mode = 'app';
  persistState();
}

function persistBounds() {
  if (win && !win.isDestroyed()) saveJson(BOUNDS_FILE, win.getBounds());
}

function allowedOrigin(req) {
  // The desktop UI may run on a custom scheme; the bridge is loopback-only.
  return '*';
}

function send(req, res, status, body) {
  const allow = allowedOrigin(req);
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (allow) {
    headers['Access-Control-Allow-Origin'] = allow;
    headers['Vary'] = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2000000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch (error) {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function displayFor(planetX, planetY) {
  return screen.getDisplayNearestPoint({ x: planetX, y: planetY }).workArea;
}

/** Window bounds that keep the planet at its current screen position. */
function applyLayout(size, open, labelWidth, panelHeight) {
  if (!win || win.isDestroyed()) return { left: SIDE, top: TOP, side: 'left' };
  const bounds = win.getBounds();
  const planetX = bounds.x + rootOffset.left;
  const planetY = bounds.y + rootOffset.top;
  const display = displayFor(planetX, planetY);

  // The window only grows past the planet for the label above it and for the
  // popover, so the transparent margin stays as small as the content allows.
  const overhang = Math.max(0, Math.round(((Number(labelWidth) || 0) - size) / 2));
  const panel = Math.min(PANEL_HEIGHT, Math.max(160, Number(panelHeight) || PANEL_HEIGHT));

  let width = size + overhang * 2 + ARROW_SPACE * 2;
  let left = ARROW_SPACE + overhang;
  let top = TOP;
  let height = size + TOP + BOTTOM;
  let side = 'left';

  if (open) {
    side = planetX - (PANEL_WIDTH + GAP) >= display.x + EDGE ? 'left' : 'right';
    height = Math.max(height, panel + SIDE * 2);
    top = Math.max(TOP, Math.round((height - size) / 2));
    if (side === 'left') {
      left = SIDE + PANEL_WIDTH + GAP + overhang;
      width = left + size + overhang + SIDE;
    } else {
      width = SIDE + overhang + size + GAP + PANEL_WIDTH + SIDE;
    }
  }

  let x = planetX - left;
  let y = planetY - top;
  x = Math.min(Math.max(x, display.x + EDGE), display.x + display.width - width - EDGE);
  y = Math.min(Math.max(y, display.y + EDGE), display.y + display.height - height - EDGE);
  win.setBounds({ x, y, width, height });
  rootOffset = { left, top };
  planetSize = size;
  persistBounds();
  return { left, top, side };
}

function createWindow(anchor) {
  if (win && !win.isDestroyed()) {
    win.showInactive();
    return;
  }
  const size = clampSize(currentState && currentState.settings && currentState.settings.size);
  const saved = loadJson(BOUNDS_FILE);
  const display = screen.getPrimaryDisplay().workArea;
  const baseWidth = size + ARROW_SPACE * 2;
  const baseHeight = size + TOP + BOTTOM;
  const baseLeft = ARROW_SPACE;
  let originX = anchor && Number.isFinite(anchor.x) ? anchor.x - baseLeft : saved && Number.isFinite(saved.x) ? saved.x : display.x + display.width - baseWidth - 24;
  let originY = anchor && Number.isFinite(anchor.y) ? anchor.y - TOP : saved && Number.isFinite(saved.y) ? saved.y : display.y + 120;
  originX = Math.min(Math.max(originX, display.x + EDGE), display.x + display.width - baseWidth - EDGE);
  originY = Math.min(Math.max(originY, display.y + EDGE), display.y + display.height - baseHeight - EDGE);

  rootOffset = { left: baseLeft, top: TOP };
  planetSize = size;
  win = new BrowserWindow({
    x: Math.round(originX),
    y: Math.round(originY),
    width: baseWidth,
    height: baseHeight,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  try {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch (error) {
    /* visibleOnAllWorkspaces is not available on every platform */
  }
  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => {
    if (win && !win.isDestroyed()) win.showInactive();
  });
  win.on('closed', () => {
    markModeApp();
    win = null;
    drag = null;
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    log('renderer gone', JSON.stringify(details));
    markModeApp();
    attachWindow();
  });
  win.webContents.on('console-message', (_event, level, message) => log('console', level, message));
}

function attachWindow() {
  markModeApp();
  if (!win || win.isDestroyed()) return;
  persistBounds();
  win.destroy();
  win = null;
  drag = null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (!(req.method === 'GET' && url.pathname === '/status')) {
    log('http', req.method, url.pathname, req.headers.origin || '-');
  }
  if (req.method === 'OPTIONS') {
    const allow = allowedOrigin(req);
    if (!allow) {
      res.writeHead(403);
      res.end();
      return;
    }
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allow,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    });
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    send(req, res, 200, { ok: true, app: 'pixel-clock', detached: !!win, pid: process.pid, hostPid: HOST_PID });
    return;
  }
  if (url.pathname === '/status') {
    send(req, res, 200, { detached: !!win, state: currentState });
    return;
  }
  if (url.pathname === '/state' && req.method === 'GET') {
    send(req, res, 200, { state: currentState });
    return;
  }
  if (url.pathname === '/state' && req.method === 'POST') {
    const body = await readBody(req);
    const state = body && body.state && typeof body.state === 'object' ? body.state : body;
    if (state && typeof state === 'object') {
      currentState = state;
      persistState();
    }
    send(req, res, 200, { ok: true });
    return;
  }
  if (url.pathname === '/detach' && req.method === 'POST') {
    const body = await readBody(req);
    const state = body && body.state && typeof body.state === 'object' ? body.state : body;
    if (state && typeof state === 'object') {
      currentState = state;
      persistState();
    }
    await app.whenReady();
    createWindow(state && state.screen);
    send(req, res, 200, { ok: true });
    return;
  }
  if (url.pathname === '/attach' && req.method === 'POST') {
    attachWindow();
    send(req, res, 200, { ok: true });
    return;
  }
  send(req, res, 404, { ok: false, error: 'not found' });
});

server.on('error', (error) => log('bridge error', error.message));
server.listen(PORT, '127.0.0.1', () => log('bridge listening', PORT, 'host', HOST_PID));

setInterval(() => {
  if (!HOST_PID) return;
  try {
    process.kill(HOST_PID, 0);
  } catch (error) {
    log('host gone, quitting');
    app.quit();
  }
}, 2500);

ipcMain.handle('pixel-clock:get-state', () => currentState);

/** macOS exposes the output volume through AppleScript; elsewhere report null. */
ipcMain.handle('pixel-clock:system-volume', () => new Promise((resolve) => {
  if (process.platform !== 'darwin') {
    resolve(null);
    return;
  }
  execFile('/usr/bin/osascript', ['-e', 'output volume of (get volume settings)'], { timeout: 1500 }, (error, stdout) => {
    if (error) {
      resolve(null);
      return;
    }
    const value = Number.parseInt(String(stdout).trim(), 10);
    resolve(Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null);
  });
}));

ipcMain.on('pixel-clock:sync', (_event, state) => {
  if (state && typeof state === 'object') {
    currentState = state;
    persistState();
  }
});

ipcMain.handle('pixel-clock:layout', (_event, payload) => {
  const size = clampSize(payload && payload.size);
  return applyLayout(size, !!(payload && payload.open), payload && payload.labelWidth, payload && payload.panelHeight);
});

ipcMain.on('pixel-clock:begin-drag', (_event, sx, sy) => {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  drag = { winX: bounds.x, winY: bounds.y, sx, sy, left: rootOffset.left, top: rootOffset.top };
});

ipcMain.on('pixel-clock:drag-to', (_event, sx, sy) => {
  if (!win || win.isDestroyed() || !drag) return;
  const bounds = win.getBounds();
  const display = screen.getDisplayNearestPoint({ x: sx, y: sy }).workArea;
  // Clamp the sphere, not the window: the transparent padding may hang off the
  // screen so the planet can sit right at the edge.
  const minX = display.x + EDGE - drag.left;
  const maxX = Math.max(minX, display.x + display.width - EDGE - drag.left - planetSize);
  const minY = display.y + EDGE - drag.top;
  const maxY = Math.max(minY, display.y + display.height - EDGE - drag.top - planetSize);
  const x = Math.min(Math.max(drag.winX + (sx - drag.sx), minX), maxX);
  const y = Math.min(Math.max(drag.winY + (sy - drag.sy), minY), maxY);
  win.setPosition(Math.round(x), Math.round(y), false);
});

ipcMain.on('pixel-clock:end-drag', () => {
  drag = null;
  persistBounds();
});

ipcMain.on('pixel-clock:attach', () => attachWindow());

app.on('window-all-closed', (event) => {
  /* Keep the bridge alive so the Web UI can detach again. */
  event.preventDefault();
});

app.on('before-quit', () => {
  try {
    server.close();
  } catch (error) {
    /* already closed */
  }
});

app.whenReady().then(() => {
  currentState = currentState || loadJson(STATE_FILE);
  if (process.platform === 'darwin' && app.dock) {
    try {
      app.dock.hide();
    } catch (error) {
      /* dock hiding is best effort */
    }
  }
  log('app ready', process.platform, process.arch);
});
