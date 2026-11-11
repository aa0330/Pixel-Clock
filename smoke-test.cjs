/**
 * Renders the widget to static markup under a stubbed client environment to
 * catch render-time crashes and check the three popover tabs.
 * Run: node smoke-test.cjs
 */
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const code = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
const hasPixelFont = code.includes('Fusion Pixel') && code.includes('data:font/woff2;base64,');
const store = new Map();

const fakeDoc = {
  createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
  head: { appendChild() {} },
};

const win = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  devicePixelRatio: 2,
  innerWidth: 1440,
  innerHeight: 900,
  __ModuleLoader__: { load: (definition) => { win.__definition = definition; } },
};

const ctx = {
  effect: (fn) => {
    try {
      fn();
    } catch (error) {
      console.log('effect threw:', error.message);
    }
  },
  locale: {
    register: () => () => {},
    bind: () => (key) => `[${key}]`,
    subscribe: () => () => {},
  },
  slots: {
    inject: (_slot, factory) => factory(),
    register: (_options, component) => {
      ctx.component = component;
      return component;
    },
  },
};

const factory = new Function('window', 'document', 'require', `${code}\nreturn window.__definition;`);
const definition = factory(win, fakeDoc, (name) => require(name));
const mod = definition.factory((name) => require(name));
mod.apply(ctx);

const render = (label) => {
  const html = renderToStaticMarkup(React.createElement(ctx.component));
  const pick = (re) => (html.match(re) || [])[1];
  const panel = pick(/data-panel="([^"]+)"/);
  const count = (re) => (html.match(re) || []).length;
  console.log(
    `${label.padEnd(22)} panel=${String(panel).padEnd(9)} phase=${pick(/data-phase="([^"]+)"/)} ` +
      `status=${pick(/data-status="([^"]+)"/)} dash=${Number(pick(/stroke-dashoffset="([^"]+)"/)).toFixed(1)} ` +
      `theme=${pick(/data-theme="([^"]+)"/)} planets=${count(/__planet-btn/g)} items=${count(/__item"/g)} ` +
      `tabs=${count(/__tab"/g)} bubble=${count(/__bubble"/g)}`,
  );
  return html;
};

const mount = (label, flag) => {
  win.__pixelClockPanel = flag;
  return render(label);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAILED: ${message}`);
};

// start with a couple of todos and a pending reminder
store.set('pixel-clock:timer', JSON.stringify({
  phase: 'focus', status: 'paused', endsAt: null, remainMs: 12 * 60 * 1000, cycle: 0, doneToday: 2, doneDate: '2026-11-10',
}));
store.set('pixel-clock:todos', JSON.stringify([
  { id: 'a', text: '写插件测试', done: false },
  { id: 'b', text: '看星球渲染', done: true },
]));
store.set('pixel-clock:reminders', JSON.stringify([
  { id: 'r', text: '喝水', at: Date.now() + 8 * 60 * 1000 },
]));

let html = mount('default (closed)', undefined);
assert(html.includes('data-panel="closed"'), 'panel starts closed');
assert(!html.includes('__dock'), 'no dock buttons outside the popup');
assert(!html.includes('__badge'), 'no badges outside the popup');
assert(!html.includes('__attach'), 'no floating attach cross');
assert((html.match(/__planet-btn/g) || []).length === 2, 'hover arrows switch planets');
assert(html.includes('data-theme="islands"'), 'default planet is the islands preset');

// the merged to-do tab owns both lists and their independent inputs
html = mount('todo panel', 'todo');
assert(html.includes('__panel'), 'todo panel renders');
assert(html.includes('data-panel="todo"'), 'todo tab is active');
assert((html.match(/__tab"/g) || []).length === 3, 'three popover tabs');
assert(html.includes('[clockTab]') && html.includes('[todos]') && html.includes('[settings]'), 'tab labels are localized');
assert((html.match(/__input/g) || []).length === 2, 'todo and reminder inputs render');
assert(html.includes('[todoPlaceholder]'), 'todo placeholder is localized');
assert(html.includes('[reminderPlaceholder]'), 'reminder placeholder is localized');
assert(html.includes('[todoSummary]'), 'todo summary is localized');
assert((html.match(/__item"/g) || []).length === 3, 'two todo rows and one reminder');
assert(html.includes('写插件测试'), 'todo text renders');
assert(html.includes('喝水'), 'reminder text renders');
assert(html.includes('__chip'), 'delay chips render');
assert(html.includes('[dueIn]'), 'reminder countdown is localized');
assert(html.includes('__section-title'), 'sections are labelled');
assert(html.includes('__divider'), 'sections are divided');

// the clock tab keeps the readout and controls
html = mount('clock panel', 'clock');
assert(hasPixelFont, 'pixel font is embedded');
assert(html.includes('data-panel="clock"'), 'clock tab is active');
assert(html.includes('__label-clock'), 'paused label shows the pixel clock');
assert(html.includes('__clock'), 'clock pane renders');
assert(!html.includes('__progress-track'), 'progress has no default track');
assert(html.includes('[resume]'), 'paused run offers resume');
assert((html.match(/__dot"/g) || []).length === 4, 'four cycle dots');
assert((html.match(/aria-pressed="true"/g) || []).length === 0, 'clock tab has no setting chips');
assert(html.includes('[timerHint]'), 'clock hint is localized');
assert(html.includes('[todayLabel]'), 'today counter is localized');
assert(html.includes('[cycleHint]'), 'cycle hint is localized');

// the settings tab owns artwork, size, location and durations
html = mount('settings panel', 'settings');
assert(html.includes('data-panel="settings"'), 'settings tab is active');
assert((html.match(/aria-pressed="true"/g) || []).length === 6, 'theme, location, three duration presets and one of four tracks selected');
assert((html.match(/type="range"/g) || []).length === 2, 'size and music volume sliders render');
assert(html.includes('min="80"') && html.includes('max="180"'), 'size slider is bounded');
assert(html.includes('min="0"') && html.includes('max="100"'), 'music volume slider is bounded');
assert(html.includes('[location]') && html.includes('[modeApp]') && html.includes('[modeDesktop]'), 'location modes are localized');
assert(html.includes('[settingFocus]') && html.includes('[settingBreak]') && html.includes('[settingLong]'), 'duration rows render');
assert((html.match(/checked=""/g) || []).length === 2, 'default toggles restore');
assert(html.includes('[music]'), 'music toggle is localized');
assert(html.includes('__volume'), 'music volume slider renders');
assert(html.includes('[musicHint]'), 'music hint is localized');
assert(html.includes('[trackRain]') && html.includes('[trackNight]') && html.includes('[trackIndoor]') && html.includes('[trackEvening]'), 'ambience tracks are localized');

// expired run still advances
store.set('pixel-clock:reminders', '[]');
store.set('pixel-clock:timer', JSON.stringify({
  phase: 'focus', status: 'running', endsAt: Date.now() - 1000, remainMs: 1000, cycle: 0, doneToday: 0, doneDate: '2026-11-10',
}));
html = mount('expired on load', undefined);
assert(html.includes('data-phase="break"'), 'expired focus advances to break');
assert(html.includes('[breakReady]'), 'break prompt is shown');

// break keeps a full faint ring that drains clockwise
store.set('pixel-clock:timer', JSON.stringify({
  phase: 'break', status: 'paused', endsAt: null, remainMs: 4 * 60 * 1000, totalMs: 5 * 60 * 1000, cycle: 1, doneToday: 2, doneDate: '2026-11-10',
}));
html = mount('break ring', undefined);
assert(html.includes('data-phase="break"'), 'break phase is restored');
assert(!html.includes('__progress-track'), 'break ring has no track');
const breakOffset = Number((html.match(/__progress-arc[^>]*stroke-dashoffset="([^"]+)"/) || [])[1]);
assert(breakOffset < 0, 'break ring drains clockwise from a full start');

// idle widget with no lists keeps the default look
store.delete('pixel-clock:todos');
store.delete('pixel-clock:reminders');
store.delete('pixel-clock:timer');
html = mount('fresh install', undefined);
assert(html.includes('data-status="idle"'), 'fresh timer is idle');
assert(!html.includes('__label-clock'), 'idle label has no clock');
assert(!html.includes('__badge'), 'no badge without items');
html = mount('fresh clock panel', 'clock');
assert(html.includes('[start]'), 'idle run offers start');
assert((html.match(/data-on="true"/g) || []).length === 0, 'a fresh set has no filled dots');

// stored settings drive the idle clock, presets, toggles and location
store.set('pixel-clock:settings', JSON.stringify({
  focus: 50, break: 10, breakLong: 30, size: 160, mode: 'app', autoStart: true, sound: false, notify: false,
}));
html = mount('custom clock', 'clock');
assert(html.includes('50:00'), 'focus preset applies to the idle clock');
assert(html.includes('width:160px;height:160px'), 'stored size applies to the sphere');
assert(html.includes('data-status="idle"'), 'settings do not start the timer');
html = mount('custom settings', 'settings');
assert((html.match(/aria-pressed="true"/g) || []).length === 6, 'custom preset selected per row');
assert((html.match(/checked=""/g) || []).length === 1, 'stored toggles restore');
assert(html.includes('aria-pressed="true">[modeApp]'), 'stored in-app location is selected');

// a stored planet choice drives the artwork palette and the ring accent
store.set('pixel-clock:theme', 'ice');
html = mount('ice theme', undefined);
assert(html.includes('data-theme="ice"'), 'stored planet restored');
assert(html.includes('[themeIce]'), 'planet name is localized');
assert(html.includes('--ap-accent:#79b7c9'), 'ring accent follows the planet');
assert(html.includes('[prevTrack]') && html.includes('[nextTrack]'), 'ambience arrows are labelled');

// the size setting is clamped to the allowed range
store.set('pixel-clock:settings', JSON.stringify({ size: 999 }));
html = mount('oversize', undefined);
assert(html.includes('width:180px;height:180px'), 'size clamps to the maximum');
store.set('pixel-clock:settings', JSON.stringify({ size: 8 }));
html = mount('undersize', undefined);
assert(html.includes('width:80px;height:80px'), 'size clamps to the minimum');

console.log('smoke ok');
