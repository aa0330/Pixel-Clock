window.__ModuleLoader__.load({
  id: '@local/pixel-clock',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace for every visible string of this widget. */
    const NS = 'pixel-clock';

    const DICTS = {
      zh: {
        name: '像素时钟',
        themeIslands: '绿屿',
        themeIce: '冰世界',
        themeAurora: '极光',
        themeAutumn: '赤秋',
        planet: '星球',
        size: '大小',
        location: '位置',
        modeApp: '应用内',
        modeDesktop: '桌面',
        settings: '设置',
        prevTrack: '上一个音轨：{name}',
        nextTrack: '下一个音轨：{name}',
        focus: '专注',
        rest: '休息',
        paused: '已暂停',
        idle: '未开始',
        idleHint: '右键设置 · {minutes} 分钟专注',
        breakReady: '该休息了',
        focusReady: '下一轮专注',
        hint: '单击加速自转，右键打开设置，按住拖动位置，← → 换音轨',
        timerHint: '右键星球打开设置 · 空格 开始/暂停 · R 重置 · S 跳过 · ← → 换音轨',
        doneToday: '今日完成',
        clockTab: '时钟',
        todos: '待办',
        reminders: '提醒',
        start: '开始',
        pause: '暂停',
        resume: '继续',
        skip: '跳过',
        skipHint: '跳到下一阶段',
        reset: '重置',
        settingFocus: '专注',
        settingBreak: '短休',
        settingLong: '长休',
        minutesShort: '分',
        cycleHint: '每 4 轮专注后进入长休息',
        todayLabel: '今日 {count} 轮',
        todoSummary: '已完成 {done}/{total}',
        todoPlaceholder: '写一条待办，回车添加',
        todoEmpty: '还没有待办，先写一条',
        reminderPlaceholder: '提醒我做什么…',
        reminderEmpty: '还没有提醒',
        dueIn: '{minutes} 分钟后',
        reminderTitle: '提醒',
        focusDone: '专注完成',
        focusDoneBody: '休息 {minutes} 分钟，起来走走',
        breakDone: '休息结束',
        breakDoneBody: '回来继续专注 {minutes} 分钟',
        autoStart: '自动开始下一段',
        sound: '提示音',
        music: '背景音乐',
        audio: '音效',
        musicVolume: '音量',
        musicTrack: '音轨',
        trackRain: '雨声溪流',
        trackNight: '雨夜白噪',
        trackIndoor: '室内雨声',
        trackEvening: '夜晚环境',
        musicHint: '专注时循环播放，休息自动停止',
        volumeCapped: '系统音量 {system}%，应用音量已限制在 {max}% 以内',
        notify: '桌面通知',
        detach: '弹出到桌面',
        desktopUnavailable: '桌面窗口不可用，请确认 Electron 运行时已安装',
        dismiss: '知道了',
        remove: '删除',
        close: '收起',
        add: '添加',
        clearDone: '清除已完成',
      },
      en: {
        name: 'Pixel Clock',
        themeIslands: 'Isle',
        themeIce: 'Ice',
        themeAurora: 'Aurora',
        themeAutumn: 'Autumn',
        planet: 'Planet',
        size: 'Size',
        location: 'Place',
        modeApp: 'In app',
        modeDesktop: 'Desktop',
        settings: 'Settings',
        prevTrack: 'Previous ambience: {name}',
        nextTrack: 'Next ambience: {name}',
        focus: 'Focus',
        rest: 'Break',
        paused: 'Paused',
        idle: 'Idle',
        idleHint: 'Right-click for settings · {minutes} min',
        breakReady: 'Time for a break',
        focusReady: 'Next focus',
        hint: 'Click to spin, right-click for settings, drag to move, ← → to switch ambience',
        timerHint: 'Right-click the planet for settings · Space start/pause · R reset · S skip · ← → switch ambience',
        doneToday: 'done today',
        clockTab: 'Clock',
        todos: 'To-do',
        reminders: 'Reminders',
        start: 'Start',
        pause: 'Pause',
        resume: 'Resume',
        skip: 'Skip',
        skipHint: 'Skip to the next phase',
        reset: 'Reset',
        settingFocus: 'Focus',
        settingBreak: 'Short',
        settingLong: 'Long',
        minutesShort: 'm',
        cycleHint: 'Long break after every 4 focus rounds',
        todayLabel: '{count} today',
        todoSummary: '{done}/{total} done',
        todoPlaceholder: 'Add a to-do, press Enter',
        todoEmpty: 'Nothing yet - add your first to-do',
        reminderPlaceholder: 'Remind me to…',
        reminderEmpty: 'No reminders yet',
        dueIn: 'in {minutes} min',
        reminderTitle: 'Reminder',
        focusDone: 'Focus complete',
        focusDoneBody: 'Take a {minutes}-minute break',
        breakDone: 'Break over',
        breakDoneBody: 'Back to focus for {minutes} min',
        autoStart: 'Auto-start next',
        sound: 'Chime',
        music: 'Music',
        audio: 'Audio',
        musicVolume: 'Volume',
        musicTrack: 'Track',
        trackRain: 'Rain & stream',
        trackNight: 'Rainy night',
        trackIndoor: 'Indoor rain',
        trackEvening: 'Night ambience',
        musicHint: 'Loops during focus, stops on breaks',
        volumeCapped: 'System volume {system}% — app volume capped at {max}%',
        notify: 'Notify',
        detach: 'Send to desktop',
        desktopUnavailable: 'Desktop window unavailable — check the Electron runtime',
        dismiss: 'Got it',
        remove: 'Remove',
        close: 'Close',
        add: 'Add',
        clearDone: 'Clear done',
      },
    };

    /** Shaders are extracted verbatim from the app's planet renderer. */
    const VERTEX_SRC = "__VERTEX_SHADER_JSON__";
    const FRAGMENT_SRC = "__FRAGMENT_SHADER_JSON__";

    /** Rendered size in CSS pixels; the pixel grid stays chunky at this scale. */
    const DEFAULT_SIZE = 124;
    const MIN_SIZE = 80;
    const MAX_SIZE = 180;
    const SIZE_STEP = 4;

    /** Preset stops shown as clickable dots under the size and volume sliders. */
    const SIZE_TICKS = [80, 100, 124, 148, 180];
    const VOLUME_TICKS = [0, 25, 50, 75, 100];
    const DPR_CAP = 2;
    const POSITION_KEY = 'pixel-clock:position';
    const TIMER_KEY = 'pixel-clock:timer';
    const TODOS_KEY = 'pixel-clock:todos';
    const REMINDERS_KEY = 'pixel-clock:reminders';
    const SETTINGS_KEY = 'pixel-clock:settings';
    const THEME_KEY = 'pixel-clock:theme';

    /** Quick delays offered under the reminder field. */
    const DELAYS = [10 * 60 * 1000, 25 * 60 * 1000, 60 * 60 * 1000];
    const EDGE = 8;
    const LABEL_TOP_SPACE = 44;

    /** Bundled ambience loops; all four are inlined by build.mjs. */
    const AMBIENCE_TRACKS = {
      rain: "__AMBIENCE_RAIN_URL__",
      night: "__AMBIENCE_NIGHT_URL__",
      indoor: "__AMBIENCE_INDOOR_URL__",
      evening: "__AMBIENCE_EVENING_URL__",
    };

    /** Cycle order for the side chevrons and the arrow keys. */
    const AMBIENCE_ORDER = ['rain', 'night', 'indoor', 'evening'];
    const AMBIENCE_LABELS = {
      rain: 'trackRain',
      night: 'trackNight',
      indoor: 'trackIndoor',
      evening: 'trackEvening',
    };

    /** Classic pomodoro cadence; the fourth focus session earns a long break. */
    const DEFAULT_SETTINGS = {
      focus: 25,
      break: 5,
      breakLong: 15,
      size: DEFAULT_SIZE,
      mode: 'desktop',
      autoStart: false,
      sound: true,
      music: false,
      musicVolume: 35,
      musicTrack: 'rain',
      notify: true,
    };

    /** Duration presets offered in the focus pane, in minutes. */
    const PRESETS = {
      focus: [15, 25, 50],
      break: [5, 10, 15],
      breakLong: [15, 20, 30],
    };

    const SET_SIZE = 4;

    function phaseMs(phase, settings) {
      const key = phase === 'focus' ? 'focus' : phase === 'break' ? 'break' : 'breakLong';
      return settings[key] * 60 * 1000;
    }

    function clampSize(value) {
      const bounded = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value)));
      return Math.round(bounded / SIZE_STEP) * SIZE_STEP;
    }

    /**
     * Planet presets borrowed from the app's renderer. landSize / cloudSize
     * stay integers: the noise wraps with mod(cell, period), so only integer
     * periods keep the longitude seam shut. landSize, cloudSize, cloudCover,
     * mode and the four palettes come straight from components/PlanetView.tsx.
     */
    const PLANETS = [
      {
        id: 'islands',
        nameKey: 'themeIslands',
        accent: '#83c95b',
        accentBreak: '#55b8c2',
        accentLong: '#7d9ff2',
        look: {
          mode: 2,
          land: ['#83c95b', '#4f9655', '#32675a', '#203f55'],
          rivers: ['#55b8c2', '#31537a'],
          clouds: ['#f4fff1', '#cde4df', '#6c829b', '#35445f'],
          landSize: 5,
          cloudSize: 8,
          cloudCover: 0.52,
          pixels: 96,
          seed: 2.71,
          light: [0.39, 0.61],
          spin: 0.22,
          yaw0: 0.2,
        },
      },
      {
        id: 'ice',
        nameKey: 'themeIce',
        accent: '#79b7c9',
        accentBreak: '#57a6b8',
        accentLong: '#8f9ff2',
        look: {
          mode: 6,
          land: ['#e8fbff', '#a9d8df', '#6598ac', '#304e68'],
          rivers: ['#70d9e8', '#397ca2'],
          clouds: ['#ffffff', '#d8eff5', '#83aaba', '#425f78'],
          landSize: 6,
          cloudSize: 9,
          cloudCover: 0.54,
          pixels: 96,
          seed: 5.13,
          light: [0.42, 0.58],
          spin: 0.18,
          yaw0: -0.35,
        },
      },
      {
        id: 'aurora',
        nameKey: 'themeAurora',
        accent: '#74b6c4',
        accentBreak: '#4e9aa8',
        accentLong: '#718bd8',
        look: {
          mode: 10,
          land: ['#e4f9ff', '#9ed8e4', '#5287a3', '#1c3852'],
          rivers: ['#137c75', '#10364f'],
          clouds: ['#f2fffb', '#c9eee6', '#6f9da8', '#31516a'],
          landSize: 7,
          cloudSize: 8,
          cloudCover: 0.55,
          pixels: 96,
          seed: 8.4,
          light: [0.5, 0.45],
          spin: 0.26,
          yaw0: 0.55,
        },
      },
      {
        id: 'autumn',
        nameKey: 'themeAutumn',
        accent: '#ffbf5c',
        accentBreak: '#58c2c4',
        accentLong: '#b24a3e',
        look: {
          mode: 0,
          land: ['#ffbf5c', '#e8843f', '#b24a3e', '#3f3a52'],
          rivers: ['#58c2c4', '#23607e'],
          clouds: ['#fff7e6', '#f0d9b8', '#a68a7e', '#4e4553'],
          landSize: 5,
          cloudSize: 7,
          cloudCover: 0.52,
          pixels: 96,
          seed: 4.2,
          light: [0.4, 0.62],
          spin: 0.22,
          yaw0: 0.15,
        },
      },
    ];

    const CLASS = 'dsh-pixel-clock';

    const CSS = `
@font-face {
  font-family: 'Fusion Pixel';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("__PIXEL_FONT_DATA_URL__") format('woff2');
}
.${CLASS} {
  position: fixed;
  right: 24px;
  bottom: 236px;
  z-index: 3;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
  color: color-mix(in srgb, var(--ap-accent, #83c95b) 55%, var(--ap-ink, #203f55));
}
.${CLASS}[data-phase='break'],
.${CLASS}[data-phase='breakLong'] {
  color: color-mix(in srgb, color-mix(in srgb, var(--ap-accent, #83c95b) 55%, var(--ap-ink, #203f55) 45%) 80%, var(--ap-break, #55b8c2) 20%);
}
.${CLASS}[data-low='true'] {
  color: color-mix(in srgb, var(--ap-accent, #83c95b) 34%, var(--ap-ink, #203f55));
}
.${CLASS}__body {
  position: absolute;
  inset: 0;
  animation: dsh-ap-bob 6.5s ease-in-out infinite alternate;
  will-change: transform;
}
.${CLASS}[data-dragging='true'] .${CLASS}__body {
  animation-play-state: paused;
}
.${CLASS}__halo {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ap-accent, #83c95b) 18%, transparent), color-mix(in srgb, var(--ap-break, #55b8c2) 9%, transparent) 46%, transparent 70%);
  filter: blur(10px);
  animation: dsh-ap-halo 7s ease-in-out infinite;
  pointer-events: none;
}
.${CLASS}__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
  touch-action: none;
  outline: none;
  filter: drop-shadow(0 4px 10px rgba(32, 63, 85, 0.2));
}
.${CLASS}__canvas:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ap-accent, #83c95b) 55%, transparent);
  outline-offset: 4px;
}
.${CLASS}[data-dragging='true'] .${CLASS}__canvas {
  cursor: grabbing;
}
.${CLASS}__progress {
  position: absolute;
  inset: -7px;
  width: calc(100% + 14px);
  height: calc(100% + 14px);
  pointer-events: none;
  transform: rotate(-90deg);
}
.${CLASS}__progress-arc {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-opacity: 0.28;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.35s linear;
}
.${CLASS}[data-status='ready'] .${CLASS}__progress {
  animation: dsh-ap-ready 1.4s ease-in-out infinite;
}
.${CLASS}__ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: dsh-ap-ring 0.9s ease-out forwards;
  pointer-events: none;
}
.${CLASS}__label {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translate(calc(-50% + var(--ap-label-x, 0px)), 4px);
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 3px 8px 2px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: var(--ap-accent, #83c95b);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  font-family: 'Fusion Pixel', 'Ark Pixel', 'Silkscreen', 'Monaco', monospace;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  -webkit-font-smoothing: none;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}
.${CLASS}__label-text {
  font-size: 10px;
}
.${CLASS}__label-clock {
  font-size: 18px;
  line-height: 1;
  letter-spacing: 0.03em;
}
.${CLASS}[data-status='idle'] .${CLASS}__label {
  opacity: 0.72;
  transform: translate(calc(-50% + var(--ap-label-x, 0px)), 0);
}
.${CLASS}[data-visible='true'] .${CLASS}__label,
.${CLASS}:hover .${CLASS}__label {
  opacity: 1;
  transform: translate(calc(-50% + var(--ap-label-x, 0px)), 0);
}
.${CLASS}__planet-btn {
  position: absolute;
  z-index: 3;
  top: 50%;
  width: 24px;
  height: 56px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  background: none;
  box-shadow: none;
  color: var(--ap-accent, #83c95b);
  cursor: pointer;
  opacity: 0;
  pointer-events: auto;
  transform: translateY(-50%);
  transition: opacity 0.2s ease;
}
.${CLASS}__planet-btn[data-dir='prev'] {
  left: -26px;
}
.${CLASS}__planet-btn[data-dir='next'] {
  right: -26px;
}
.${CLASS}__planet-btn:hover {
  opacity: 0.5;
}
.${CLASS}__planet-btn:focus-visible {
  opacity: 0.7;
  outline: none;
}
.${CLASS}[data-panel]:not([data-panel='closed']) .${CLASS}__planet-btn {
  display: none;
}
.${CLASS}__planet-btn svg {
  width: 13px;
  height: 13px;
  display: block;
}
.${CLASS}__panel {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(calc(-50% + var(--ap-shift, 0px)));
  width: 276px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-height: 380px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.12));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1c242b);
  box-shadow: 0 10px 26px rgba(16, 32, 44, 0.2);
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  pointer-events: auto;
  animation: dsh-ap-panel 0.18s ease-out;
}
.${CLASS}[data-side='right'] .${CLASS}__panel {
  right: auto;
  left: calc(100% + 8px);
}
.${CLASS}__tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 8px 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.1));
}
.${CLASS}__tab,
.${CLASS}__close,
.${CLASS}__detach-btn,
.${CLASS}__add,
.${CLASS}__chip,
.${CLASS}__del,
.${CLASS}__link,
.${CLASS}__bubble-btn {
  font: inherit;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 8px;
}
.${CLASS}__tab {
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary, #5b6b78);
}
.${CLASS}__tab:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(32, 63, 85, 0.07));
}
.${CLASS}__tab[aria-selected='true'] {
  background: var(--dsw-alias-interactive-bg-active, rgba(32, 63, 85, 0.11));
  color: var(--dsw-alias-label-primary, #1c242b);
}
.${CLASS}__close {
  margin-left: auto;
  width: 22px;
  height: 22px;
  font-size: 15px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__detach-btn {
  margin-left: auto;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__detach-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(32, 63, 85, 0.07));
  color: var(--dsw-alias-label-primary, #1c242b);
}
.${CLASS}__detach-btn + .${CLASS}__close {
  margin-left: 2px;
}
.${CLASS}__close:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(32, 63, 85, 0.07));
  color: var(--dsw-alias-label-primary, #1c242b);
}
.${CLASS}__pane {
  padding: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.${CLASS}__form {
  display: flex;
  gap: 6px;
}
.${CLASS}__input {
  flex: 1;
  min-width: 0;
  padding: 6px 9px;
  border-radius: 9px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.16));
  background: var(--dsw-specific-input-major, rgba(32, 63, 85, 0.04));
  color: inherit;
  font: inherit;
  outline: none;
}
.${CLASS}__input::placeholder {
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__input:focus-visible {
  border-color: var(--dsw-alias-brand-primary, #4f9655);
  box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, rgba(79, 150, 85, 0.25));
}
.${CLASS}__add {
  padding: 0 11px;
  border-radius: 9px;
  background: var(--dsw-alias-brand-primary, #4f9655);
  color: #fff;
}
.${CLASS}__add:hover {
  filter: brightness(1.06);
}
.${CLASS}__list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${CLASS}__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border-radius: 8px;
}
.${CLASS}__item:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(32, 63, 85, 0.06));
}
.${CLASS}__check {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary, #4f9655);
  cursor: pointer;
}
.${CLASS}__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${CLASS}__item[data-done='true'] .${CLASS}__text {
  color: var(--dsw-alias-label-tertiary, #7d8b96);
  text-decoration: line-through;
}
.${CLASS}__del {
  width: 20px;
  height: 20px;
  opacity: 0;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__item:hover .${CLASS}__del,
.${CLASS}__del:focus-visible {
  opacity: 1;
}
.${CLASS}__del:hover {
  color: var(--dsw-alias-state-error-primary, #d4564a);
}
.${CLASS}__chips {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.${CLASS}__chip {
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.16));
  color: var(--dsw-alias-label-secondary, #5b6b78);
  font-size: 11px;
}
.${CLASS}__chip:hover {
  border-color: var(--dsw-alias-brand-primary, #4f9655);
}
.${CLASS}__chip[aria-pressed='true'] {
  background: var(--dsw-alias-brand-primary-soft, rgba(79, 150, 85, 0.16));
  border-color: transparent;
  color: var(--dsw-alias-label-primary, #1c242b);
}
.${CLASS}__empty {
  padding: 14px 2px 10px;
  text-align: center;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__section-title {
  margin: 2px 2px 6px;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__divider {
  height: 1px;
  margin: 12px 0 10px;
  background: var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.1));
}
.${CLASS}__clock {
  margin-top: 2px;
  text-align: center;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}
.${CLASS}__state {
  margin-top: 1px;
  text-align: center;
  color: var(--dsw-alias-label-secondary, #5b6b78);
}
.${CLASS}__overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 9px;
}
.${CLASS}__dots {
  display: flex;
  align-items: center;
  gap: 4px;
}
.${CLASS}__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.18));
  transition: background 0.25s ease, transform 0.25s ease;
}
.${CLASS}__dot[data-on='true'] {
  background: var(--dsw-alias-brand-primary, #4f9655);
  transform: scale(1.15);
}
.${CLASS}__today {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
  font-variant-numeric: tabular-nums;
}
.${CLASS}__actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.${CLASS}__action {
  flex: 1;
  padding: 5px 8px;
  border-radius: 9px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.16));
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6b78);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, filter 0.2s ease;
}
.${CLASS}__action:hover {
  border-color: var(--dsw-alias-brand-primary, #4f9655);
  color: var(--dsw-alias-label-primary, #1c242b);
}
.${CLASS}__action[data-primary='true'] {
  border-color: transparent;
  background: var(--dsw-alias-brand-primary, #4f9655);
  color: #fff;
}
.${CLASS}__action[data-primary='true']:hover {
  filter: brightness(1.06);
  color: #fff;
}
.${CLASS}__setting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.${CLASS}__setting-label {
  flex: none;
  width: 30px;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__setting .${CLASS}__chips {
  flex: 1;
  margin-top: 0;
  gap: 4px;
}
.${CLASS}__range {
  flex: 1;
  min-width: 0;
  height: 18px;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;
}
.${CLASS}__range::-webkit-slider-runnable-track {
  height: 2px;
  border-radius: 1px;
  background: var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.18));
}
.${CLASS}__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 11px;
  height: 11px;
  margin-top: -4.5px;
  border: 0;
  border-radius: 2px;
  background: var(--ap-accent, #83c95b);
}
.${CLASS}__range:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ap-accent, #83c95b) 55%, transparent);
  outline-offset: 2px;
  border-radius: 4px;
}
.${CLASS}__range-value {
  flex: none;
  width: 38px;
  text-align: right;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
  font-variant-numeric: tabular-nums;
}
.${CLASS}__options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 10px;
}
.${CLASS}__option {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #5b6b78);
  cursor: pointer;
}
.${CLASS}__option input {
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary, #4f9655);
  cursor: pointer;
}
.${CLASS}__volume {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #5b6b78);
}
.${CLASS}__volume span {
  flex: none;
}
.${CLASS}__volume span:last-child {
  width: 34px;
  text-align: right;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
  font-variant-numeric: tabular-nums;
}
.${CLASS}__volume input[type="range"]:disabled {
  opacity: 0.45;
  cursor: default;
}
.${CLASS}__range-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}
.${CLASS}__range-wrap input[type="range"] {
  flex: 1;
  min-width: 0;
}
.${CLASS}__ticks {
  position: absolute;
  left: 5.5px;
  right: 5.5px;
  top: 50%;
  height: 0;
  pointer-events: none;
}
.${CLASS}__tick {
  position: absolute;
  top: 0;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  pointer-events: auto;
}
.${CLASS}__tick::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--dsw-alias-label-tertiary, #7d8b96);
  opacity: 0.5;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.${CLASS}__tick:hover::after {
  transform: translate(-50%, -50%) scale(1.7);
  opacity: 1;
}
.${CLASS}__tick:focus-visible {
  outline: none;
}
.${CLASS}__tick:focus-visible::after {
  background: var(--ap-accent, #83c95b);
  opacity: 1;
}
.${CLASS}__note {
  margin-top: 8px;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.${CLASS}__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(32, 63, 85, 0.1));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #7d8b96);
}
.${CLASS}__link {
  font-size: 11px;
  color: var(--dsw-alias-brand-primary, #4f9655);
}
.${CLASS}__link:hover {
  text-decoration: underline;
}
.${CLASS}__due {
  color: var(--dsw-alias-state-warn-primary, #c98a1e);
}
.${CLASS}__bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 34px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 230px;
  padding: 7px 8px 7px 11px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: var(--ap-accent, #83c95b);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  font-family: 'Fusion Pixel', 'Ark Pixel', 'Silkscreen', 'Monaco', monospace;
  font-size: 11px;
  pointer-events: auto;
  animation: dsh-ap-pop 0.2s ease-out;
}
.${CLASS}__bubble-text {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.${CLASS}__bubble-btn {
  flex: none;
  padding: 3px 8px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--ap-accent, #83c95b) 34%, transparent);
  color: inherit;
  font-size: 11px;
}
@keyframes dsh-ap-panel {
  from { opacity: 0; transform: translateY(calc(-50% + var(--ap-shift, 0px))) scale(0.97); }
  to { opacity: 1; transform: translateY(calc(-50% + var(--ap-shift, 0px))) scale(1); }
}
@keyframes dsh-ap-pop {
  from { opacity: 0; transform: translate(-50%, 6px) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
@keyframes dsh-ap-bob {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}
@keyframes dsh-ap-halo {
  0%, 100% { opacity: 0.35; transform: scale(0.97); }
  50% { opacity: 0.6; transform: scale(1.03); }
}
@keyframes dsh-ap-ring {
  from { opacity: 0.6; transform: scale(0.6); }
  to { opacity: 0; transform: scale(1.5); }
}
@keyframes dsh-ap-ready {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@media (prefers-reduced-motion: reduce) {
  .${CLASS}__body, .${CLASS}__halo, .${CLASS}[data-status='ready'] .${CLASS}__progress { animation: none; }
}
@media (max-width: 720px) {
  .${CLASS} { right: 14px; bottom: 170px; }
  .${CLASS}__label { font-size: 10px; }
}
`;

    function hexToRgb(hex) {
      const value = parseInt(hex.slice(1), 16);
      return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
    }

    function dayKey(date) {
      const stamp = date || new Date();
      return `${stamp.getFullYear()}-${stamp.getMonth() + 1}-${stamp.getDate()}`;
    }

    function formatClock(ms) {
      const total = Math.max(0, Math.ceil(ms / 1000));
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function freshTimer(settings) {
      const ms = phaseMs('focus', settings);
      return {
        phase: 'focus',
        status: 'idle',
        endsAt: null,
        remainMs: ms,
        totalMs: ms,
        cycle: 0,
        doneToday: 0,
        doneDate: dayKey(),
      };
    }

    /** The next phase after one finishes; safe to call for a restored, expired run. */
    function advance(state, settings, auto) {
      const isFocus = state.phase === 'focus';
      const today = dayKey();
      let cycle = state.cycle;
      if (isFocus) cycle += 1;
      else if (state.phase === 'breakLong') cycle = 0;
      const nextPhase = isFocus ? (cycle % SET_SIZE === 0 ? 'breakLong' : 'break') : 'focus';
      const ms = phaseMs(nextPhase, settings);
      return {
        phase: nextPhase,
        status: auto ? 'running' : 'ready',
        endsAt: auto ? Date.now() + ms : null,
        remainMs: ms,
        totalMs: ms,
        cycle,
        doneToday: isFocus ? (state.doneDate === today ? state.doneToday + 1 : 1) : state.doneDate === today ? state.doneToday : 0,
        doneDate: today,
      };
    }

    function readSettings() {
      const base = { ...DEFAULT_SETTINGS };
      try {
        const raw = window.localStorage.getItem(SETTINGS_KEY);
        const stored = raw ? JSON.parse(raw) : null;
        if (!stored || typeof stored !== 'object') return base;
        for (const key of ['focus', 'break', 'breakLong']) {
          const value = stored[key];
          if (typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 180) base[key] = Math.round(value);
        }
        if (typeof stored.size === 'number' && Number.isFinite(stored.size)) {
          base.size = clampSize(stored.size);
        }
        if (stored.mode === 'app' || stored.mode === 'desktop') base.mode = stored.mode;
        for (const key of ['autoStart', 'sound', 'music', 'notify']) {
          if (typeof stored[key] === 'boolean') base[key] = stored[key];
        }
        if (typeof stored.musicVolume === 'number' && Number.isFinite(stored.musicVolume)) {
          base.musicVolume = Math.min(100, Math.max(0, Math.round(stored.musicVolume)));
        }
        if (typeof stored.musicTrack === 'string' && AMBIENCE_TRACKS[stored.musicTrack]) {
          base.musicTrack = stored.musicTrack;
        }
      } catch (error) {
        /* fall back to the classic cadence */
      }
      return base;
    }

    function saveSettings(settings) {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        /* private mode without storage: settings just do not survive a reload */
      }
    }

    function readTheme() {
      try {
        const id = window.localStorage.getItem(THEME_KEY);
        return PLANETS.some((planet) => planet.id === id) ? id : PLANETS[0].id;
      } catch (error) {
        return PLANETS[0].id;
      }
    }

    function saveTheme(id) {
      try {
        window.localStorage.setItem(THEME_KEY, id);
      } catch (error) {
        /* private mode without storage: the planet choice just does not persist */
      }
    }

    function storedSnapshot(settings) {
      return {
        timer: readTimer(settings),
        settings,
        todos: readTodos(),
        reminders: readReminders(),
        theme: readTheme(),
        lang: (typeof document !== 'undefined' && document.documentElement.lang) || 'zh',
        screen: null,
      };
    }

    /** Loopback bridge owned by the desktop helper process. */
    function bridgeBase() {
      return window.__pixelClockBridge || 'http://127.0.0.1:17890';
    }

    async function bridgeCall(path, options) {
      const init = { cache: 'no-store', ...(options || {}) };
      if (init.body) init.headers = { 'Content-Type': 'application/json', ...(init.headers || {}) };
      const response = await fetch(bridgeBase() + path, init);
      if (!response.ok) throw new Error(`pixel clock bridge ${response.status}`);
      return response.json();
    }

    /** Restore the widget state handed back by the desktop helper. */
    function seedLocalState(state) {
      if (!state || typeof state !== 'object') return;
      try {
        if (state.timer) window.localStorage.setItem(TIMER_KEY, JSON.stringify(state.timer));
        if (state.settings) window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
        if (state.todos) window.localStorage.setItem(TODOS_KEY, JSON.stringify(state.todos));
        if (state.reminders) window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(state.reminders));
        if (typeof state.theme === 'string') window.localStorage.setItem(THEME_KEY, state.theme);
      } catch (error) {
        /* private mode without storage: the widget just keeps its current state */
      }
    }

    function readTimer(settings) {
      const fallback = freshTimer(settings);
      try {
        const raw = window.localStorage.getItem(TIMER_KEY);
        if (!raw) return fallback;
        const stored = JSON.parse(raw);
        if (!stored || !['focus', 'break', 'breakLong'].includes(stored.phase) || typeof stored.status !== 'string') return fallback;
        const merged = Object.assign(fallback, stored);
        if (!['idle', 'running', 'paused', 'ready'].includes(merged.status)) return freshTimer(settings);
        if (typeof stored.totalMs !== 'number' || stored.totalMs <= 0) merged.totalMs = phaseMs(merged.phase, settings);
        if (typeof merged.remainMs !== 'number' || merged.remainMs < 0) merged.remainMs = merged.totalMs;
        merged.cycle = Number.isFinite(merged.cycle) ? Math.max(0, Math.round(merged.cycle)) : 0;
        merged.doneToday = Number.isFinite(merged.doneToday) ? Math.max(0, Math.round(merged.doneToday)) : 0;
        if (typeof merged.doneDate !== 'string') merged.doneDate = dayKey();
        if (merged.status === 'running') {
          if (typeof merged.endsAt !== 'number') return freshTimer(settings);
          if (merged.endsAt <= Date.now()) return advance(merged, settings, false);
        }
        return merged;
      } catch (error) {
        return fallback;
      }
    }

    function readPosition() {
      try {
        const raw = window.localStorage.getItem(POSITION_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw);
        if (value && typeof value.x === 'number' && typeof value.y === 'number') return value;
      } catch (error) {
        /* a malformed entry just means "use the default corner" */
      }
      return null;
    }

    function readList(key) {
      try {
        const raw = window.localStorage.getItem(key);
        const value = raw ? JSON.parse(raw) : null;
        return Array.isArray(value) ? value : [];
      } catch (error) {
        return [];
      }
    }

    function saveList(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* private mode without storage: the list just does not survive a reload */
      }
    }

    function makeId() {
      return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    }

    function readTodos() {
      return readList(TODOS_KEY)
        .filter((item) => item && typeof item.text === 'string')
        .map((item) => ({ id: String(item.id || makeId()), text: item.text, done: Boolean(item.done) }));
    }

    function readReminders() {
      const now = Date.now();
      return readList(REMINDERS_KEY)
        .filter(
          (item) =>
            item &&
            typeof item.text === 'string' &&
            typeof item.at === 'number' &&
            item.at > now - 24 * 60 * 60 * 1000,
        )
        .map((item) => ({ id: String(item.id || makeId()), text: item.text, at: item.at }))
        .sort((a, b) => a.at - b.at);
    }

    function formatAt(at) {
      const date = new Date(at);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function clampPosition(x, y, width, height) {
      const maxX = Math.max(EDGE, window.innerWidth - width - EDGE);
      const maxY = Math.max(EDGE + LABEL_TOP_SPACE, window.innerHeight - height - EDGE);
      return { x: Math.min(Math.max(x, EDGE), maxX), y: Math.min(Math.max(y, EDGE + LABEL_TOP_SPACE), maxY) };
    }

    function compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(log || 'shader compile failed');
      }
      return shader;
    }

    function linkProgram(gl) {
      const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
      const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(log || 'program link failed');
      }
      return program;
    }

    /** Static pixel planet, shown when WebGL is unavailable. */
    function FallbackPlanet({ look, surfaceProps }) {
      const blob = (key, x, y, w, hh, fill) => h('rect', { key, x, y, width: w, height: hh, fill });
      return h(
        'svg',
        { className: `${CLASS}__canvas`, viewBox: '0 0 64 64', ...surfaceProps },
        h('circle', { cx: 32, cy: 32, r: 31, fill: look.land[3] }),
        h('circle', { cx: 32, cy: 32, r: 29, fill: look.rivers[1] }),
        blob('a', 16, 18, 12, 8, look.land[0]),
        blob('b', 26, 22, 8, 6, look.land[1]),
        blob('c', 20, 26, 8, 6, look.land[2]),
        blob('d', 34, 32, 10, 8, look.land[1]),
        blob('e', 26, 38, 10, 6, look.land[0]),
        blob('f', 12, 36, 8, 6, look.rivers[0]),
        blob('g', 38, 20, 6, 4, look.clouds[0]),
        blob('h', 14, 44, 6, 4, look.clouds[1]),
      );
    }

    /**
     * Loops the selected bundled ambience through one decoded AudioBuffer,
     * which keeps the repeat sample-accurate (an <audio loop> leaves a gap at
     * the seam) and lets the shared AudioContext own the volume ramps.
     */
    function createAmbience(audio) {
      const master = audio.createGain();
      master.gain.value = 0.0001;
      master.connect(audio.destination);

      const buffers = {};
      let current = null;
      let playing = false;
      let level = DEFAULT_SETTINGS.musicVolume / 100;
      let track = DEFAULT_SETTINGS.musicTrack;

      function load(id) {
        if (!buffers[id]) {
          buffers[id] = fetch(AMBIENCE_TRACKS[id])
            .then((response) => response.arrayBuffer())
            .then((data) => audio.decodeAudioData(data))
            .catch((error) => {
              delete buffers[id];
              throw error;
            });
        }
        return buffers[id];
      }

      function play() {
        const id = track;
        load(id)
          .then((buffer) => {
            if (!playing || id !== track) return;
            const source = audio.createBufferSource();
            const gain = audio.createGain();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gain);
            gain.connect(master);
            gain.gain.value = 1;
            source.start();
            current = { source, gain };
          })
          .catch(() => {
            playing = false;
          });
      }

      /** A 200 ms fade keeps switching tracks from clicking. */
      function fadeOut(node) {
        if (!node) return;
        const now = audio.currentTime;
        try {
          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setValueAtTime(node.gain.gain.value, now);
          node.gain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
          node.source.stop(now + 0.25);
        } catch (error) {
          /* already stopped */
        }
      }

      function start() {
        if (playing) return;
        playing = true;
        const now = audio.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(Math.max(0.0001, level), now + 1.2);
        play();
      }

      function stop() {
        playing = false;
        const now = audio.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        fadeOut(current);
        current = null;
      }

      function setTrack(id) {
        if (!AMBIENCE_TRACKS[id] || id === track) return;
        track = id;
        if (!playing) return;
        fadeOut(current);
        current = null;
        play();
      }

      function setVolume(value) {
        level = Math.min(1, Math.max(0, value));
        if (!playing) return;
        const now = audio.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(Math.max(0.0001, level), now + 0.2);
      }

      return { start, stop, setVolume, setTrack };
    }

    function PlanetTimer({ t, locale, onDetach, initialNotice }) {
      const desktop = typeof window !== 'undefined' && window.pixelClockDesktop ? window.pixelClockDesktop : null;
      const canvasRef = React.useRef(null);
      const labelRef = React.useRef(null);
      const surfaceRef = React.useRef(null);
      const [status, setStatus] = React.useState('pending');
      const [settings, setSettings] = React.useState(readSettings);
      const [systemVolume, setSystemVolume] = React.useState(null);
      const [themeId, setThemeId] = React.useState(readTheme);
      const [timer, setTimer] = React.useState(() => readTimer(settings));
      const [now, setNow] = React.useState(Date.now());
      const [pokes, setPokes] = React.useState(0);
      const [, setRevision] = React.useState(0);
      const [position, setPositionState] = React.useState(readPosition);
      const [dragging, setDragging] = React.useState(false);
      const [panel, setPanel] = React.useState(() => {
        const forced = window.__pixelClockPanel;
        return forced === 'clock' || forced === 'todo' || forced === 'settings' ? forced : 'closed';
      });
      const [side, setSide] = React.useState('left');
      const [desktopLayout, setDesktopLayout] = React.useState({ left: 30, top: 40, side: 'left' });
      const [labelShift, setLabelShift] = React.useState(0);
      const [shift, setShift] = React.useState(0);
      const [todos, setTodos] = React.useState(readTodos);
      const [reminders, setReminders] = React.useState(readReminders);
      const [firing, setFiring] = React.useState(null);
      const [notice, setNotice] = React.useState(initialNotice || null);
      const [todoDraft, setTodoDraft] = React.useState('');
      const [reminderDraft, setReminderDraft] = React.useState('');
      const [delay, setDelay] = React.useState(DELAYS[0]);
      const positionRef = React.useRef(position);
      const timerRef = React.useRef(timer);
      const settingsRef = React.useRef(settings);
      const tRef = React.useRef(t);
      const dragRef = React.useRef(null);
      const detachRef = React.useRef(false);
      const progressRef = React.useRef(0);
      const burst = React.useRef(0);
      const audioRef = React.useRef(null);
      const musicRef = React.useRef(null);
      const rootRef = React.useRef(null);
      const panelRef = React.useRef(null);
      const todoInputRef = React.useRef(null);
      const reminderInputRef = React.useRef(null);
      const remindersRef = React.useRef(reminders);

      remindersRef.current = reminders;
      settingsRef.current = settings;
      tRef.current = t;

      const duration = timer.totalMs || phaseMs(timer.phase, settings);
      const remainMs = timer.status === 'running' ? Math.max(0, (timer.endsAt || now) - now) : timer.remainMs;
      const progress =
        timer.status === 'ready' ? 1 : Math.min(1, Math.max(0, 1 - remainMs / duration));
      // Focus grows clockwise from zero; break starts full and drains clockwise.
      const ringElapsed = timer.status === 'ready' ? 0 : Math.min(1, Math.max(0, 1 - remainMs / duration));
      const clock = formatClock(remainMs);
      const todayDone = timer.doneDate === dayKey() ? timer.doneToday : 0;
      const planet = PLANETS.find((item) => item.id === themeId) || PLANETS[0];
      const planetName = t(planet.nameKey);
      const size = clampSize(settings.size);
      // A loud system plus a loud app is unpleasant; cap the app volume when
      // the Mac's own output is already high.
      const volumeCeiling = systemVolume === null ? 100 : systemVolume > 85 ? 55 : systemVolume > 70 ? 70 : 100;
      const shownVolume = Math.min(settings.musicVolume, volumeCeiling);

      positionRef.current = position;
      timerRef.current = timer;
      progressRef.current = progress;

      // Background ambience only runs through the focus phase; a break, a
      // pause or a reset fades it out. The toggle click and the start button
      // are the gestures that unlock the shared AudioContext.
      React.useEffect(() => {
        if (!settings.music || timer.status !== 'running' || timer.phase !== 'focus') {
          if (musicRef.current) musicRef.current.stop();
          return undefined;
        }
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return undefined;
        if (!audioRef.current) {
          try {
            audioRef.current = new AudioCtor();
          } catch (error) {
            return undefined;
          }
        }
        const audio = audioRef.current;
        if (audio.state === 'suspended') audio.resume().catch(() => {});
        if (!musicRef.current) musicRef.current = createAmbience(audio);
        musicRef.current.setTrack(settings.musicTrack);
        musicRef.current.setVolume(shownVolume / 100);
        musicRef.current.start();
        return () => {
          if (musicRef.current) musicRef.current.stop();
        };
      }, [settings.music, timer.status, timer.phase]);

      React.useEffect(() => {
        if (musicRef.current) musicRef.current.setVolume(shownVolume / 100);
      }, [shownVolume]);

      React.useEffect(() => {
        if (musicRef.current) musicRef.current.setTrack(settings.musicTrack);
      }, [settings.musicTrack]);

      // The bound `t` reads the live locale; a redraw is needed when it changes.
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(() => setRevision((n) => n + 1));
      }, [locale]);

      // One ticker for the readout; it also fires phase transitions and reminders.
      React.useEffect(() => {
        const needed = timer.status === 'running' || reminders.length > 0;
        if (!needed) return undefined;
        // The readout needs 4 Hz; idle reminders only need a once-a-second sweep.
        const period = timer.status === 'running' ? 250 : 1000;
        const id = window.setInterval(() => {
          const stamp = Date.now();
          setNow(stamp);
          const current = timerRef.current;
          const live = settingsRef.current;
          if (current.status === 'running' && current.endsAt && stamp >= current.endsAt) {
            const next = advance(current, live, live.autoStart);
            setTimer((prev) => (prev.status === 'running' ? next : prev));
            chime(current.phase === 'focus' ? 'focus' : 'rest');
            burst.current += 4;
            setPokes((n) => n + 1);
            const minutes = Math.max(1, Math.round(next.remainMs / 60000));
            const finishedFocus = current.phase === 'focus';
            const doneTitle = tRef.current(finishedFocus ? 'focusDone' : 'breakDone');
            const doneBody = tRef.current(finishedFocus ? 'focusDoneBody' : 'breakDoneBody', { minutes });
            setNotice(`${doneTitle} · ${doneBody}`);
            notify(doneTitle, doneBody);
          }
          const due = remindersRef.current.find((item) => item.at <= stamp);
          if (due) {
            remindersRef.current = remindersRef.current.filter((item) => item.id !== due.id);
            setReminders(remindersRef.current);
            setFiring(due);
            chime('remind');
            notify(tRef.current('reminderTitle'), due.text);
          }
        }, period);
        return () => window.clearInterval(id);
      }, [timer.status, timer.endsAt, timer.phase, reminders.length]);

      // Keep the run across a reload.
      React.useEffect(() => {
        try {
          window.localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
        } catch (error) {
          /* private mode without storage: the session just does not survive a reload */
        }
      }, [timer]);

      React.useEffect(() => {
        saveSettings(settings);
      }, [settings]);

      React.useEffect(() => {
        saveTheme(themeId);
      }, [themeId]);

      // The detached window is the active instance: keep the helper in sync.
      React.useEffect(() => {
        if (!desktop || typeof desktop.sync !== 'function') return;
        desktop.sync({
          timer,
          settings,
          todos,
          reminders,
          theme: themeId,
          lang: (typeof document !== 'undefined' && document.documentElement.lang) || 'zh',
        });
      }, [desktop, timer, settings, todos, reminders, themeId]);

      // Lists live in the widget, not in the session: keep them across reloads.
      React.useEffect(() => {
        saveList(TODOS_KEY, todos);
      }, [todos]);

      React.useEffect(() => {
        saveList(REMINDERS_KEY, reminders);
      }, [reminders]);

      React.useEffect(() => {
        if (!notice) return undefined;
        const id = window.setTimeout(() => setNotice(null), 8000);
        return () => window.clearTimeout(id);
      }, [notice]);

      // A reminder that came due while the app was closed greets you on mount.
      React.useEffect(() => {
        const stamp = Date.now();
        const due = remindersRef.current.filter((item) => item.at <= stamp);
        if (due.length === 0) return;
        remindersRef.current = remindersRef.current.filter((item) => item.at > stamp);
        setReminders(remindersRef.current);
        setFiring(due[due.length - 1]);
      }, []);

      // In the desktop window the helper resizes around the open popover,
      // so the root offset (and the popover side) come from the host process.
      // The window only widens for the label or the panel, never by a fixed
      // margin, which keeps the transparent frame tight around the planet.
      React.useEffect(() => {
        if (!desktop) return undefined;
        let alive = true;
        const push = () => {
          if (!alive) return;
          const label = labelRef.current;
          const panelEl = panelRef.current;
          Promise.resolve(
            desktop.layout({
              open: panel !== 'closed',
              size,
              labelWidth: label ? label.offsetWidth : 0,
              panelHeight: panelEl ? panelEl.offsetHeight : 0,
            }),
          )
            .then((next) => {
              if (!alive || !next) return;
              setDesktopLayout({
                left: Number.isFinite(next.left) ? next.left : 8,
                top: Number.isFinite(next.top) ? next.top : 40,
                side: next.side === 'right' ? 'right' : 'left',
              });
            })
            .catch(() => {});
        };
        push();
        let observer = null;
        if (typeof ResizeObserver === 'function') {
          observer = new ResizeObserver(push);
          if (labelRef.current) observer.observe(labelRef.current);
          if (panelRef.current) observer.observe(panelRef.current);
        }
        return () => {
          alive = false;
          if (observer) observer.disconnect();
        };
      }, [desktop, panel, size]);

      // Re-read the Mac's output volume whenever the settings pane opens, so
      // the cap follows whatever the user did in Control Center.
      React.useEffect(() => {
        if (!desktop || typeof desktop.systemVolume !== 'function') return undefined;
        let alive = true;
        Promise.resolve(desktop.systemVolume())
          .then((value) => {
            if (!alive) return;
            setSystemVolume(typeof value === 'number' && Number.isFinite(value) ? value : null);
          })
          .catch(() => {});
        return () => {
          alive = false;
        };
      }, [desktop, panel]);

      // Keep the popover on screen wherever the planet was dragged to.
      React.useEffect(() => {
        if (desktop || panel === 'closed' || !panelRef.current) {
          setShift(0);
          return;
        }
        const box = panelRef.current.getBoundingClientRect();
        const overTop = 12 - box.top;
        const overBottom = box.bottom - (window.innerHeight - 12);
        setShift(overTop > 0 ? overTop : overBottom > 0 ? -overBottom : 0);
      }, [desktop, panel, side, size]);

      React.useEffect(() => {
        if (panel === 'todo' && todoInputRef.current) todoInputRef.current.focus();
      }, [panel]);

      // Keep a dragged widget inside the window when the window or the sphere shrinks.
      React.useEffect(() => {
        const onResize = () => {
          const current = positionRef.current;
          if (!current) return;
          const rect = rootRef.current && rootRef.current.getBoundingClientRect();
          const edge = clampSize(settingsRef.current.size);
          setPositionState(
            clampPosition(current.x, current.y, (rect && rect.width) || edge, (rect && rect.height) || edge),
          );
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      React.useEffect(() => {
        const current = positionRef.current;
        if (!current) return;
        const next = clampPosition(current.x, current.y, size, size);
        if (next.x !== current.x || next.y !== current.y) {
          positionRef.current = next;
          setPositionState(next);
        }
      }, [size]);

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const look = planet.look;
        const lightRadius = Math.hypot(look.light[0] - 0.5, look.light[1] - 0.5);
        const lightAngle = Math.atan2(look.light[1] - 0.5, look.light[0] - 0.5);

        let gl = null;
        try {
          gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            depth: false,
            stencil: false,
          });
        } catch (error) {
          gl = null;
        }
        if (!gl) {
          setStatus('failed');
          return undefined;
        }

        let program = null;
        try {
          program = linkProgram(gl);
        } catch (error) {
          console.warn('[pixel-clock] planet shader unavailable:', error.message);
          setStatus('failed');
          return undefined;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        const cssSize = clampSize(settingsRef.current.size);
        canvas.width = Math.round(cssSize * dpr);
        canvas.height = canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(program);

        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const at = (name) => gl.getUniformLocation(program, name);
        const uni = {
          time: at('uTime'),
          orientation: at('uOrientation'),
          pixels: at('uPixels'),
          seed: at('uSeed'),
          landSize: at('uLandSize'),
          cloudSize: at('uCloudSize'),
          cloudCover: at('uCloudCover'),
          light: at('uLightOrigin'),
          mode: at('uMode'),
        };

        gl.uniform1f(uni.pixels, look.pixels);
        gl.uniform1f(uni.seed, look.seed);
        gl.uniform1f(uni.landSize, Math.round(look.landSize));
        gl.uniform1f(uni.cloudSize, Math.round(look.cloudSize));
        gl.uniform1f(uni.cloudCover, look.cloudCover);
        gl.uniform2f(uni.light, look.light[0], look.light[1]);
        gl.uniform1i(uni.mode, look.mode);
        const paint = (name, hex) => {
          const [r, g, b] = hexToRgb(hex);
          gl.uniform3f(at(name), r, g, b);
        };
        look.land.forEach((hex, index) => paint(`uLand${index}`, hex));
        look.rivers.forEach((hex, index) => paint(`uRiver${index}`, hex));
        look.clouds.forEach((hex, index) => paint(`uCloud${index}`, hex));

        let yaw = look.yaw0;
        let spinVelocity = 0;
        let elapsed = 0;
        let last = 0;
        let alive = true;
        let raf = 0;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const draw = () => {
          const half = yaw / 2;
          const angle = lightAngle + Math.PI * 2 * progressRef.current;
          gl.uniform1f(uni.time, elapsed);
          gl.uniform4f(uni.orientation, 0, Math.sin(half), 0, Math.cos(half));
          gl.uniform2f(uni.light, 0.5 + lightRadius * Math.cos(angle), 0.5 + lightRadius * Math.sin(angle));
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        surfaceRef.current = { canvas, gl, draw, dpr };

        const frame = (stamp) => {
          if (!alive) return;
          raf = requestAnimationFrame(frame);
          if (!last) last = stamp;
          const dt = Math.min((stamp - last) / 1000, 0.05);
          last = stamp;
          if (document.hidden) return;

          if (burst.current !== 0) {
            spinVelocity += burst.current;
            burst.current = 0;
          }
          const idle = motion.matches ? 0 : look.spin;
          yaw += (idle + spinVelocity) * dt;
          spinVelocity *= Math.pow(0.06, dt);
          if (Math.abs(spinVelocity) < 0.002) spinVelocity = 0;
          elapsed += dt;
          draw();
        };

        const onLost = (event) => {
          event.preventDefault();
          alive = false;
          setStatus('failed');
        };

        canvas.addEventListener('webglcontextlost', onLost);
        draw();
        setStatus('ready');
        raf = requestAnimationFrame(frame);

        return () => {
          alive = false;
          cancelAnimationFrame(raf);
          canvas.removeEventListener('webglcontextlost', onLost);
          if (surfaceRef.current && surfaceRef.current.canvas === canvas) surfaceRef.current = null;
          gl.deleteBuffer(quad);
          gl.deleteProgram(program);
        };
      }, [themeId]);

      // Resize the drawing buffer without recompiling the shader.
      React.useEffect(() => {
        const surface = surfaceRef.current;
        if (!surface) return;
        const width = Math.round(size * surface.dpr);
        if (surface.canvas.width !== width) {
          surface.canvas.width = width;
          surface.canvas.height = width;
          surface.gl.viewport(0, 0, width, width);
          surface.draw();
        }
      }, [size, status]);

      /** A short, soft two-tone chime; unlocked by the first click that starts a run. */
      function chime(kind) {
        if (!settingsRef.current.sound) return;
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;
        if (!audioRef.current) {
          try {
            audioRef.current = new AudioCtor();
          } catch (error) {
            return;
          }
        }
        const audio = audioRef.current;
        if (audio.state === 'suspended') audio.resume().catch(() => {});
        const start = audio.currentTime + 0.02;
        const notes = kind === 'focus' ? [660, 880, 1320] : kind === 'remind' ? [784, 1047, 1319] : [880, 660];
        notes.forEach((freq, index) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          const at = start + index * 0.17;
          oscillator.type = 'sine';
          oscillator.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.linearRampToValueAtTime(0.07, at + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(at);
          oscillator.stop(at + 0.6);
        });
      }

      /** Desktop notification; the Harness window may or may not grant the API. */
      function notify(title, body) {
        if (!settingsRef.current.notify) return;
        try {
          if (typeof window.Notification !== 'function' || window.Notification.permission !== 'granted') return;
          const note = new window.Notification(title, { body, silent: true });
          note.onclick = () => {
            try {
              window.focus();
            } catch (error) {
              /* focus is best effort */
            }
            note.close();
          };
          window.setTimeout(() => {
            try {
              note.close();
            } catch (error) {
              /* already closed */
            }
          }, 8000);
        } catch (error) {
          /* notifications are best effort */
        }
      }

      function askNotify() {
        try {
          if (typeof window.Notification !== 'function' || window.Notification.permission !== 'default') return;
          const request = window.Notification.requestPermission();
          if (request && typeof request.catch === 'function') request.catch(() => {});
        } catch (error) {
          /* permission prompts are best effort */
        }
      }

      const toggle = () => {
        const stamp = Date.now();
        if (audioRef.current && audioRef.current.state === 'suspended') audioRef.current.resume().catch(() => {});
        if (settingsRef.current.notify) askNotify();
        setTimer((prev) => {
          if (prev.status === 'running') {
            return { ...prev, status: 'paused', endsAt: null, remainMs: Math.max(0, (prev.endsAt || stamp) - stamp) };
          }
          const remaining = prev.status === 'paused' ? Math.max(1000, prev.remainMs) : prev.remainMs || phaseMs(prev.phase, settings);
          return {
            ...prev,
            status: 'running',
            endsAt: stamp + remaining,
            remainMs: remaining,
            totalMs: prev.totalMs || phaseMs(prev.phase, settings),
          };
        });
        setNow(stamp);
      };

      const reset = () => {
        const ms = phaseMs('focus', settings);
        setTimer((prev) => ({
          ...prev,
          phase: 'focus',
          status: 'idle',
          endsAt: null,
          remainMs: ms,
          totalMs: ms,
          cycle: 0,
        }));
        setNow(Date.now());
      };

      const skip = () => {
        const stamp = Date.now();
        setTimer((prev) => {
          const phase = prev.phase === 'focus' ? 'break' : 'focus';
          const cycle = prev.phase === 'breakLong' ? 0 : prev.cycle;
          const ms = phaseMs(phase, settings);
          return { ...prev, phase, cycle, status: 'ready', endsAt: null, remainMs: ms, totalMs: ms };
        });
        setNow(stamp);
      };

      const updateSettings = (patch) => {
        const next = { ...settings, ...patch };
        if (patch.size !== undefined) next.size = clampSize(patch.size);
        setSettings(next);
        if (patch.notify) askNotify();
        if (patch.music) {
          const AudioCtor = window.AudioContext || window.webkitAudioContext;
          if (AudioCtor && !audioRef.current) {
            try {
              audioRef.current = new AudioCtor();
            } catch (error) {
              /* audio unavailable; the timer still runs */
            }
          }
          if (audioRef.current && audioRef.current.state === 'suspended') audioRef.current.resume().catch(() => {});
        }
        setTimer((prev) => {
          if (prev.status === 'running' || prev.status === 'paused') return prev;
          const ms = phaseMs(prev.phase, next);
          return { ...prev, remainMs: ms, totalMs: ms };
        });
      };

      const detachToDesktop = async (override) => {
        if (!onDetach || detachRef.current) return;
        detachRef.current = true;
        const box = rootRef.current && rootRef.current.getBoundingClientRect();
        const screenAnchor = box
          ? { x: Math.round(window.screenX + box.left), y: Math.round(window.screenY + box.top) }
          : null;
        const nextSettings = override && override.settings ? override.settings : settings;
        try {
          await onDetach({
            timer,
            settings: nextSettings,
            todos,
            reminders,
            theme: themeId,
            lang: (typeof document !== 'undefined' && document.documentElement.lang) || 'zh',
            screen: screenAnchor,
          });
        } catch (error) {
          detachRef.current = false;
          setNotice(t('desktopUnavailable'));
        }
      };

      const selectMode = (mode) => {
        if (settings.mode === mode) return;
        const next = { ...settings, mode };
        updateSettings({ mode });
        if (mode === 'desktop') {
          if (!desktop) detachToDesktop({ settings: next });
        } else if (desktop) {
          desktop.attach();
        }
      };

      const openPanel = (tab) => {
        setTodoDraft('');
        setReminderDraft('');
        if (panel === 'closed' && rootRef.current) {
          const box = rootRef.current.getBoundingClientRect();
          setSide(box.left < 340 ? 'right' : 'left');
        }
        setPanel((prev) => (prev === tab ? 'closed' : tab));
      };

      const openSettings = () => {
        setTodoDraft('');
        setReminderDraft('');
        if (panel === 'closed' && rootRef.current) {
          const box = rootRef.current.getBoundingClientRect();
          setSide(box.left < 340 ? 'right' : 'left');
        }
        setPanel((prev) => (prev === 'clock' ? 'closed' : 'clock'));
      };

      /** Theme switch is cosmetic: it never touches the running timer. */
      const selectPlanet = (id) => {
        if (id === themeId) return;
        setThemeId(id);
        burst.current += 2.2;
        setPokes((n) => n + 1);
      };

      /** The side chevrons and the arrow keys cycle the ambience track. */
      const stepTrack = (step) => {
        const index = AMBIENCE_ORDER.indexOf(settings.musicTrack);
        const next = AMBIENCE_ORDER[(index + step + AMBIENCE_ORDER.length) % AMBIENCE_ORDER.length];
        if (next) updateSettings({ musicTrack: next });
      };

      const addTodo = () => {
        const text = todoDraft.trim();
        if (!text) return;
        setTodos((prev) => prev.concat({ id: makeId(), text, done: false }));
        setTodoDraft('');
      };

      const toggleTodo = (id) => {
        setTodos((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
      };

      const removeTodo = (id) => {
        setTodos((prev) => prev.filter((item) => item.id !== id));
      };

      const clearDone = () => {
        setTodos((prev) => prev.filter((item) => !item.done));
      };

      const addReminder = () => {
        const text = reminderDraft.trim();
        if (!text) return;
        const next = reminders
          .concat({ id: makeId(), text, at: Date.now() + delay })
          .sort((a, b) => a.at - b.at);
        setReminders(next);
        setReminderDraft('');
      };

      const removeReminder = (id) => {
        setReminders((prev) => prev.filter((item) => item.id !== id));
      };

      const spin = () => {
        burst.current += 2.2;
        setPokes((n) => n + 1);
      };

      const remember = (next) => {
        try {
          window.localStorage.setItem(POSITION_KEY, JSON.stringify(next));
        } catch (error) {
          /* private mode without storage: the widget just forgets where it was */
        }
      };

      const onPointerDown = (event) => {
        if (event.button !== 0) return;
        const box = event.currentTarget.getBoundingClientRect();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: box.left,
          originY: box.top,
          width: box.width,
          height: box.height,
          moved: false,
        };
        if (desktop) desktop.beginDrag(event.screenX, event.screenY);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch (error) {
          /* capture is a nicety; dragging still works while the pointer stays inside */
        }
        setDragging(true);
      };

      const onPointerMove = (event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        drag.moved = true;
        if (desktop) {
          desktop.dragTo(event.screenX, event.screenY);
          return;
        }
        // Dragging the sphere past the Harness window edge hands it to the
        // desktop helper instead of clipping it against the Web view.
        if (onDetach && !detachRef.current) {
          const rawX = drag.originX + dx;
          const rawY = drag.originY + dy;
          const maxX = Math.max(EDGE, window.innerWidth - drag.width - EDGE);
          const maxY = Math.max(EDGE, window.innerHeight - drag.height - EDGE);
          const outX = rawX > maxX ? rawX - maxX : rawX < EDGE ? EDGE - rawX : 0;
          const outY = rawY > maxY ? rawY - maxY : rawY < EDGE ? EDGE - rawY : 0;
          const nearX = event.clientX <= 14 || event.clientX >= window.innerWidth - 14;
          const nearY = event.clientY <= 14 || event.clientY >= window.innerHeight - 14;
          if ((outX > 16 && nearX) || (outY > 16 && nearY)) {
            detachToDesktop();
            return;
          }
        }
        const next = clampPosition(drag.originX + dx, drag.originY + dy, drag.width, drag.height);
        positionRef.current = next;
        setPositionState(next);
      };

      const finishDrag = (event, tapOnRelease) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch (error) {
          /* released already */
        }
        if (desktop) desktop.endDrag();
        if (drag.moved) {
          if (!desktop) remember(positionRef.current);
        } else if (tapOnRelease) {
          spin();
        }
      };

      const endDrag = (event) => finishDrag(event, true);
      const cancelDrag = (event) => finishDrag(event, false);

      const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        } else if (event.key === 'r' || event.key === 'R') {
          event.preventDefault();
          reset();
        } else if (event.key === 's' || event.key === 'S') {
          event.preventDefault();
          skip();
        } else if (event.key === 'o' || event.key === 'O') {
          event.preventDefault();
          openSettings();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          stepTrack(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          stepTrack(1);
        } else if (event.key === 'Escape') {
          if (panel !== 'closed') {
            event.preventDefault();
            setPanel('closed');
          } else if (desktop) {
            event.preventDefault();
            desktop.attach();
          }
        }
      };

      const isFocusPhase = timer.phase === 'focus';
      const focusMinutes = Math.round(phaseMs('focus', settings) / 60000);
      let caption = t('name');
      let labelText = '';
      let labelPrefix = '';
      let labelClock = '';
      let visible = false;
      if (timer.status === 'running') {
        labelPrefix = isFocusPhase ? t('focus') : t('rest');
        labelClock = clock;
        caption = `${labelPrefix} ${labelClock}`;
        visible = true;
      } else if (timer.status === 'paused') {
        labelPrefix = t('paused');
        labelClock = clock;
        caption = `${labelPrefix} ${labelClock}`;
        visible = true;
      } else if (timer.status === 'ready') {
        labelPrefix = isFocusPhase ? t('focusReady') : t('breakReady');
        labelClock = clock;
        caption = `${labelPrefix} ${labelClock}`;
        visible = true;
      } else {
        labelText = desktop ? `${planetName} · ${t('idle')}` : `${t('name')} · ${t('idleHint', { minutes: focusMinutes })}`;
        caption = labelText;
      }

      const stateText =
        timer.status === 'running'
          ? isFocusPhase
            ? t('focus')
            : t('rest')
          : timer.status === 'paused'
            ? t('paused')
            : timer.status === 'ready'
              ? isFocusPhase
                ? t('focusReady')
                : t('breakReady')
              : t('idle');
      const primaryLabel = timer.status === 'running' ? t('pause') : timer.status === 'paused' ? t('resume') : t('start');
      const low = isFocusPhase && timer.status === 'running' && remainMs <= 60 * 1000;
      const filled = Math.min(timer.cycle, SET_SIZE);

      const doneCount = todos.filter((item) => item.done).length;
      const panelSide = desktop ? desktopLayout.side : side;
      const labelShape = labelClock ? 'clock' : 'text';

      // Keep the time popover inside the window when the sphere hugs an edge.
      React.useEffect(() => {
        const measure = () => {
          const label = labelRef.current;
          const root = rootRef.current;
          if (!label || !root) return;
          const width = label.offsetWidth;
          const box = root.getBoundingClientRect();
          const center = box.left + box.width / 2;
          const limit = 10;
          let next = 0;
          if (center - width / 2 < limit) next = limit - (center - width / 2);
          else if (center + width / 2 > window.innerWidth - limit) next = window.innerWidth - limit - (center + width / 2);
          setLabelShift(next < 0 ? Math.floor(next) : Math.ceil(next));
        };
        let alive = true;
        measure();
        window.addEventListener('resize', measure);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (alive) measure();
          }).catch(() => {});
        }
        return () => {
          alive = false;
          window.removeEventListener('resize', measure);
        };
      }, [position, size, panel, desktopLayout.left, labelShape, labelPrefix, labelText, themeId, settings.focus]);
      const boxStyle = {
        ...(desktop
          ? { left: desktopLayout.left, top: desktopLayout.top, right: 'auto', bottom: 'auto' }
          : position
            ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
            : null),
        width: size,
        height: size,
        '--ap-shift': `${desktop ? 0 : shift}px`,
        '--ap-accent': planet.accent,
        '--ap-break': planet.accentBreak,
        '--ap-long': planet.accentLong,
        '--ap-ink': planet.look.land[3],
        '--ap-label-x': `${labelShift}px`,
      };
      const circumference = 2 * Math.PI * 46;
      const trackIndex = AMBIENCE_ORDER.indexOf(settings.musicTrack);
      const prevTrack = AMBIENCE_ORDER[(trackIndex - 1 + AMBIENCE_ORDER.length) % AMBIENCE_ORDER.length];
      const nextTrack = AMBIENCE_ORDER[(trackIndex + 1) % AMBIENCE_ORDER.length];
      const surfaceProps = {
        role: 'button',
        tabIndex: 0,
        title: `${t('name')} · ${planetName} · ${t('hint')}${todayDone > 0 ? ` · ${t('doneToday')} ${todayDone}` : ''}`,
        'aria-label': caption,
        'aria-haspopup': 'dialog',
        'aria-expanded': panel === 'closed' ? 'false' : 'true',
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: cancelDrag,
        onContextMenu: (event) => {
          event.preventDefault();
          openSettings();
        },
        onKeyDown,
      };
      const chevron = (dir) =>
        h(
          'svg',
          { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
          h('path', { d: dir === 'prev' ? 'M9.8 3.2 5 8l4.8 4.8' : 'M6.2 3.2 11 8l-4.8 4.8' }),
        );

      const todoForm = h(
        'div',
        { className: `${CLASS}__form` },
        h('input', {
          ref: todoInputRef,
          className: `${CLASS}__input`,
          value: todoDraft,
          placeholder: t('todoPlaceholder'),
          'aria-label': t('todos'),
          onChange: (event) => setTodoDraft(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTodo();
            }
          },
        }),
        h('button', { type: 'button', className: `${CLASS}__add`, onClick: addTodo }, t('add')),
      );

      const todoList =
        todos.length === 0
          ? h('div', { className: `${CLASS}__empty` }, t('todoEmpty'))
          : h(
              'ul',
              { className: `${CLASS}__list` },
              todos.map((item) =>
                h(
                  'li',
                  { key: item.id, className: `${CLASS}__item`, 'data-done': item.done ? 'true' : 'false' },
                  h('input', {
                    type: 'checkbox',
                    className: `${CLASS}__check`,
                    checked: item.done,
                    'aria-label': item.text,
                    onChange: () => toggleTodo(item.id),
                  }),
                  h('span', { className: `${CLASS}__text`, title: item.text }, item.text),
                  h(
                    'button',
                    { type: 'button', className: `${CLASS}__del`, title: t('remove'), 'aria-label': t('remove'), onClick: () => removeTodo(item.id) },
                    '×',
                  ),
                ),
              ),
            );

      const todoFoot = h(
        'div',
        { className: `${CLASS}__foot` },
        h('span', null, t('todoSummary', { done: doneCount, total: todos.length })),
        doneCount > 0 ? h('button', { type: 'button', className: `${CLASS}__link`, onClick: clearDone }, t('clearDone')) : null,
      );

      const reminderForm = h(
        'div',
        { className: `${CLASS}__form` },
        h('input', {
          ref: reminderInputRef,
          className: `${CLASS}__input`,
          value: reminderDraft,
          placeholder: t('reminderPlaceholder'),
          'aria-label': t('reminders'),
          onChange: (event) => setReminderDraft(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addReminder();
            }
          },
        }),
        h('button', { type: 'button', className: `${CLASS}__add`, onClick: addReminder }, t('add')),
      );

      const delayChips = h(
        'div',
        { className: `${CLASS}__chips` },
        DELAYS.map((ms) =>
          h(
            'button',
            {
              key: ms,
              type: 'button',
              className: `${CLASS}__chip`,
              'aria-pressed': delay === ms ? 'true' : 'false',
              onClick: () => setDelay(ms),
            },
            `${Math.round(ms / 60000)}${t('minutesShort')}`,
          ),
        ),
      );

      const reminderList =
        reminders.length === 0
          ? h('div', { className: `${CLASS}__empty` }, t('reminderEmpty'))
          : h(
              'ul',
              { className: `${CLASS}__list` },
              reminders.map((item) =>
                h(
                  'li',
                  { key: item.id, className: `${CLASS}__item`, 'data-done': item.at <= now ? 'true' : 'false' },
                  h('span', { className: `${CLASS}__text`, title: item.text }, item.text),
                  h(
                    'span',
                    { className: `${CLASS}__due` },
                    `${formatAt(item.at)} · ${t('dueIn', { minutes: Math.max(1, Math.round((item.at - now) / 60000)) })}`,
                  ),
                  h(
                    'button',
                    { type: 'button', className: `${CLASS}__del`, title: t('remove'), 'aria-label': t('remove'), onClick: () => removeReminder(item.id) },
                    '×',
                  ),
                ),
              ),
            );

      const presetChip = (settingKey, value) =>
        h(
          'button',
          {
            key: `${settingKey}-${value}`,
            type: 'button',
            className: `${CLASS}__chip`,
            'aria-pressed': settings[settingKey] === value ? 'true' : 'false',
            onClick: () => updateSettings({ [settingKey]: value }),
          },
          `${value}${t('minutesShort')}`,
        );

      const settingRow = (labelKey, settingKey) =>
        h(
          'div',
          { className: `${CLASS}__setting` },
          h('span', { className: `${CLASS}__setting-label` }, t(labelKey)),
          h('div', { className: `${CLASS}__chips` }, PRESETS[settingKey].map((value) => presetChip(settingKey, value))),
        );

      const cycleDots = h(
        'div',
        { className: `${CLASS}__dots`, title: t('cycleHint'), 'aria-hidden': 'true' },
        Array.from({ length: SET_SIZE }, (_, index) =>
          h('span', { key: index, className: `${CLASS}__dot`, 'data-on': index < filled ? 'true' : 'false' }),
        ),
      );

      const clockPane = h(
        React.Fragment,
        null,
        h('div', { className: `${CLASS}__clock`, 'aria-hidden': 'true' }, clock),
        h('div', { className: `${CLASS}__state` }, stateText),
        h(
          'div',
          { className: `${CLASS}__overview` },
          cycleDots,
          h('span', { className: `${CLASS}__today` }, t('todayLabel', { count: todayDone })),
        ),
        h(
          'div',
          { className: `${CLASS}__actions` },
          h('button', { type: 'button', className: `${CLASS}__action`, 'data-primary': 'true', onClick: toggle }, primaryLabel),
          h('button', { type: 'button', className: `${CLASS}__action`, title: t('skipHint'), onClick: skip }, t('skip')),
          h('button', { type: 'button', className: `${CLASS}__action`, onClick: reset }, t('reset')),
        ),
        h('div', { className: `${CLASS}__note` }, t('timerHint')),
      );

      const settingsPane = h(
        React.Fragment,
        null,
        h(
          'div',
          { className: `${CLASS}__setting` },
          h('span', { className: `${CLASS}__setting-label` }, t('planet')),
          h(
            'div',
            { className: `${CLASS}__chips` },
            PLANETS.map((item) =>
              h(
                'button',
                {
                  key: item.id,
                  type: 'button',
                  className: `${CLASS}__chip`,
                  'aria-pressed': item.id === planet.id ? 'true' : 'false',
                  onClick: () => selectPlanet(item.id),
                },
                t(item.nameKey),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: `${CLASS}__setting` },
          h('span', { className: `${CLASS}__setting-label` }, t('size')),
          h(
            'div',
            { className: `${CLASS}__range-wrap` },
            h('input', {
              type: 'range',
              className: `${CLASS}__range`,
              min: MIN_SIZE,
              max: MAX_SIZE,
              step: SIZE_STEP,
              value: settings.size,
              'aria-label': t('size'),
              onChange: (event) => updateSettings({ size: Number(event.target.value) }),
            }),
            h(
              'div',
              { className: `${CLASS}__ticks` },
              SIZE_TICKS.map((value) =>
                h('button', {
                  key: value,
                  type: 'button',
                  className: `${CLASS}__tick`,
                  style: { left: `${((value - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%` },
                  title: `${value}px`,
                  'aria-label': `${t('size')} ${value}px`,
                  onClick: () => updateSettings({ size: value }),
                }),
              ),
            ),
          ),
          h('span', { className: `${CLASS}__range-value` }, `${settings.size}px`),
        ),
        h(
          'div',
          { className: `${CLASS}__setting` },
          h('span', { className: `${CLASS}__setting-label` }, t('location')),
          h(
            'div',
            { className: `${CLASS}__chips` },
            [
              ['app', 'modeApp'],
              ['desktop', 'modeDesktop'],
            ].map(([value, labelKey]) =>
              h(
                'button',
                {
                  key: value,
                  type: 'button',
                  className: `${CLASS}__chip`,
                  'aria-pressed': settings.mode === value ? 'true' : 'false',
                  onClick: () => selectMode(value),
                },
                t(labelKey),
              ),
            ),
          ),
        ),
        settingRow('settingFocus', 'focus'),
        settingRow('settingBreak', 'break'),
        settingRow('settingLong', 'breakLong'),
        h(
          'div',
          { className: `${CLASS}__options` },
          h(
            'label',
            { className: `${CLASS}__option` },
            h('input', { type: 'checkbox', checked: settings.autoStart, onChange: (event) => updateSettings({ autoStart: event.target.checked }) }),
            t('autoStart'),
          ),
          h(
            'label',
            { className: `${CLASS}__option` },
            h('input', { type: 'checkbox', checked: settings.sound, onChange: (event) => updateSettings({ sound: event.target.checked }) }),
            t('sound'),
          ),
          h(
            'label',
            { className: `${CLASS}__option` },
            h('input', { type: 'checkbox', checked: settings.notify, onChange: (event) => updateSettings({ notify: event.target.checked }) }),
            t('notify'),
          ),
        ),
        h('div', { className: `${CLASS}__divider` }),
        h('div', { className: `${CLASS}__section-title` }, t('audio')),
        h(
          'label',
          { className: `${CLASS}__option` },
          h('input', { type: 'checkbox', checked: settings.music, onChange: (event) => updateSettings({ music: event.target.checked }) }),
          t('music'),
        ),
        h(
          'div',
          { className: `${CLASS}__volume` },
          h('span', null, t('musicVolume')),
          h(
            'div',
            { className: `${CLASS}__range-wrap` },
            h('input', {
              type: 'range',
              className: `${CLASS}__range`,
              min: 0,
              max: volumeCeiling,
              step: 5,
              value: shownVolume,
              disabled: !settings.music,
              'aria-label': t('musicVolume'),
              onChange: (event) => updateSettings({ musicVolume: Math.min(Number(event.target.value), volumeCeiling) }),
            }),
            h(
              'div',
              { className: `${CLASS}__ticks` },
              VOLUME_TICKS.filter((value) => value <= volumeCeiling).map((value) =>
                h('button', {
                  key: value,
                  type: 'button',
                  className: `${CLASS}__tick`,
                  style: { left: `${(value / volumeCeiling) * 100}%` },
                  title: `${value}%`,
                  'aria-label': `${t('musicVolume')} ${value}%`,
                  onClick: () => updateSettings({ musicVolume: Math.min(value, volumeCeiling) }),
                }),
              ),
            ),
          ),
          h('span', null, `${shownVolume}%`),
        ),
        volumeCeiling < 100
          ? h('div', { className: `${CLASS}__note` }, t('volumeCapped', { system: systemVolume, max: volumeCeiling }))
          : null,
        h(
          'div',
          { className: `${CLASS}__setting` },
          h('span', { className: `${CLASS}__setting-label` }, t('musicTrack')),
          h(
            'div',
            { className: `${CLASS}__chips` },
            [
              ['rain', 'trackRain'],
              ['night', 'trackNight'],
              ['indoor', 'trackIndoor'],
              ['evening', 'trackEvening'],
            ].map(([value, labelKey]) =>
              h(
                'button',
                {
                  key: value,
                  type: 'button',
                  className: `${CLASS}__chip`,
                  'aria-pressed': settings.musicTrack === value ? 'true' : 'false',
                  onClick: () => updateSettings({ musicTrack: value }),
                },
                t(labelKey),
              ),
            ),
          ),
        ),
        h('div', { className: `${CLASS}__note` }, t('musicHint')),
      );

      const todoPane = h(
        React.Fragment,
        null,
        h('div', { className: `${CLASS}__section-title` }, t('todos')),
        todoForm,
        todoList,
        todoFoot,
        h('div', { className: `${CLASS}__divider` }),
        h('div', { className: `${CLASS}__section-title` }, t('reminders')),
        reminderForm,
        delayChips,
        reminderList,
      );

      const panelPane = panel === 'clock' ? clockPane : panel === 'todo' ? todoPane : settingsPane;

      const panelNode =
        panel === 'closed'
          ? null
          : h(
              'div',
              {
                className: `${CLASS}__panel`,
                ref: panelRef,
                role: 'dialog',
                'aria-label': t('settings'),
                onKeyDown: (event) => {
                  if (event.key === 'Escape') setPanel('closed');
                },
              },
              h(
                'div',
                { className: `${CLASS}__tabs` },
                h(
                  'button',
                  { type: 'button', className: `${CLASS}__tab`, 'aria-selected': panel === 'clock' ? 'true' : 'false', onClick: () => openPanel('clock') },
                  t('clockTab'),
                ),
                h(
                  'button',
                  { type: 'button', className: `${CLASS}__tab`, 'aria-selected': panel === 'todo' ? 'true' : 'false', onClick: () => openPanel('todo') },
                  t('todos'),
                ),
                h(
                  'button',
                  { type: 'button', className: `${CLASS}__tab`, 'aria-selected': panel === 'settings' ? 'true' : 'false', onClick: () => openPanel('settings') },
                  t('settings'),
                ),
                onDetach
                  ? h(
                      'button',
                      { type: 'button', className: `${CLASS}__detach-btn`, title: t('detach'), 'aria-label': t('detach'), onClick: detachToDesktop },
                      '↗',
                    )
                  : null,
                h(
                  'button',
                  { type: 'button', className: `${CLASS}__close`, title: t('close'), 'aria-label': t('close'), onClick: () => setPanel('closed') },
                  '×',
                ),
              ),
              h('div', { className: `${CLASS}__pane` }, panelPane),
            );

      return h(
        'div',
        {
          ref: rootRef,
          className: CLASS,
          'data-phase': timer.phase,
          'data-status': timer.status,
          'data-low': low ? 'true' : 'false',
          'data-theme': planet.id,
          'data-dragging': dragging ? 'true' : 'false',
          'data-visible': visible || dragging ? 'true' : 'false',
          'data-panel': panel,
          'data-side': panelSide,
          style: boxStyle,
        },
        h(
          'button',
          {
            type: 'button',
            className: `${CLASS}__planet-btn`,
            'data-dir': 'prev',
            title: t('prevTrack', { name: t(AMBIENCE_LABELS[prevTrack]) }),
            'aria-label': t('prevTrack', { name: t(AMBIENCE_LABELS[prevTrack]) }),
            onClick: () => stepTrack(-1),
          },
          chevron('prev'),
        ),
        h(
          'button',
          {
            type: 'button',
            className: `${CLASS}__planet-btn`,
            'data-dir': 'next',
            title: t('nextTrack', { name: t(AMBIENCE_LABELS[nextTrack]) }),
            'aria-label': t('nextTrack', { name: t(AMBIENCE_LABELS[nextTrack]) }),
            onClick: () => stepTrack(1),
          },
          chevron('next'),
        ),
        h(
          'div',
          { className: `${CLASS}__body` },
          h('div', { className: `${CLASS}__halo` }),
          status === 'failed'
            ? h(FallbackPlanet, { look: planet.look, surfaceProps })
            : h('canvas', { ref: canvasRef, className: `${CLASS}__canvas`, ...surfaceProps }),
          h(
            'svg',
            { className: `${CLASS}__progress`, viewBox: '0 0 100 100', 'aria-hidden': 'true' },
            h('circle', {
              className: `${CLASS}__progress-arc`,
              cx: 50,
              cy: 50,
              r: 46,
              strokeDasharray: circumference,
              strokeDashoffset: isFocusPhase ? circumference * (1 - ringElapsed) : -circumference * ringElapsed,
            }),
          ),
          h(
            'div',
            { className: `${CLASS}__label`, ref: labelRef },
            labelClock
              ? h(
                  React.Fragment,
                  null,
                  h('span', { className: `${CLASS}__label-text` }, labelPrefix),
                  h('span', { className: `${CLASS}__label-clock` }, labelClock),
                )
              : h('span', { className: `${CLASS}__label-text` }, labelText),
          ),
          h('span', { className: `${CLASS}__sr`, role: 'status', 'aria-live': 'polite' }, timer.status === 'running' ? '' : `${stateText} ${clock}`),
          pokes === 0 ? null : h('span', { key: pokes, className: `${CLASS}__ripple` }),
        ),
        panelNode,
        firing
          ? h(
              'div',
              { className: `${CLASS}__bubble`, role: 'status' },
              h('span', { className: `${CLASS}__bubble-text` }, firing.text),
              h('button', { type: 'button', className: `${CLASS}__bubble-btn`, onClick: () => setFiring(null) }, t('dismiss')),
            )
          : notice
            ? h(
                'div',
                { className: `${CLASS}__bubble`, role: 'status' },
                h('span', { className: `${CLASS}__bubble-text` }, notice),
                h('button', { type: 'button', className: `${CLASS}__bubble-btn`, onClick: () => setNotice(null) }, t('dismiss')),
              )
            : null,
      );
    }

    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'zh', DICTS.zh), 'pixel-clock: zh dictionary');
      ctx.effect(() => ctx.locale.register(NS, 'en', DICTS.en), 'pixel-clock: en dictionary');
      ctx.effect(() => {
        if (typeof document === 'undefined') return undefined;
        const tag = document.createElement('style');
        tag.dataset.plugin = '@local/pixel-clock';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => tag.remove();
      }, 'pixel-clock: widget styles');

      const t = ctx.locale.bind(NS);
      const locale = ctx.locale;

      async function openDesktopWindow(snapshot) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
          try {
            await bridgeCall('/detach', { method: 'POST', body: JSON.stringify({ state: snapshot }) });
            const started = Date.now();
            while (Date.now() - started < 5000) {
              await new Promise((resolve) => window.setTimeout(resolve, 200));
              try {
                const status = await bridgeCall('/status');
                if (status && status.detached) return true;
              } catch (error) {
                /* the helper may still be loading */
              }
            }
            return false;
          } catch (error) {
            await new Promise((resolve) => window.setTimeout(resolve, 250));
          }
        }
        return false;
      }

      function Overlay() {
        const desktop = typeof window !== 'undefined' && window.pixelClockDesktop;
        const [detached, setDetached] = React.useState(false);
        const [booting, setBooting] = React.useState(() => {
          if (desktop) return false;
          if (typeof document === 'undefined' || !document.body) return false;
          return readSettings().mode === 'desktop';
        });
        const [fallbackNotice, setFallbackNotice] = React.useState(null);

        React.useEffect(() => {
          if (desktop) {
            setBooting(false);
            return undefined;
          }
          let alive = true;
          (async () => {
            try {
              const status = await bridgeCall('/status');
              if (!alive) return;
              if (status && status.detached) {
                setDetached(true);
                setBooting(false);
                return;
              }
            } catch (error) {
              /* the helper may still be starting */
            }
            const settings = readSettings();
            if (settings.mode !== 'desktop') {
              setBooting(false);
              return;
            }
            const opened = await openDesktopWindow(storedSnapshot(settings));
            if (!alive) return;
            setBooting(false);
            if (opened) setDetached(true);
            else setFallbackNotice(t('desktopUnavailable'));
          })();
          return () => {
            alive = false;
          };
        }, [desktop]);

        React.useEffect(() => {
          if (desktop || !detached) return undefined;
          let alive = true;
          let failures = 0;
          const id = window.setInterval(async () => {
            try {
              const status = await bridgeCall('/status');
              if (!alive) return;
              failures = 0;
              if (!status || !status.detached) {
                try {
                  const payload = await bridgeCall('/state');
                  seedLocalState(payload && payload.state);
                } catch (error) {
                  /* keep the current local state */
                }
                if (alive) setDetached(false);
              }
            } catch (error) {
              failures += 1;
              if (alive && failures >= 3) setDetached(false);
            }
          }, 1000);
          return () => {
            alive = false;
            window.clearInterval(id);
          };
        }, [desktop, detached]);

        const detach = async (snapshot) => {
          const opened = await openDesktopWindow(snapshot);
          if (!opened) throw new Error('desktop window did not open');
          setDetached(true);
        };

        if (desktop) return h(PlanetTimer, { t, locale });
        if (booting || detached) return null;
        return h(PlanetTimer, { t, locale, onDetach: detach, initialNotice: fallbackNotice });
      }

      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'pixel-clock',
            order: 40,
            label: () => t('name'),
          },
          Overlay,
        ),
      );
    }

    return { inject, apply };
  },
});
