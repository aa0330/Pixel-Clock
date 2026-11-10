(function bootDesktop() {
  const api = window.pixelClockDesktop;
  const definition = window.__definition;
  if (!api || !definition) {
    document.body.textContent = 'Pixel Clock desktop helper failed to load.';
    return;
  }

  const KEYS = {
    timer: 'pixel-clock:timer',
    settings: 'pixel-clock:settings',
    todos: 'pixel-clock:todos',
    reminders: 'pixel-clock:reminders',
    theme: 'pixel-clock:theme',
  };

  function seed(state) {
    if (!state || typeof state !== 'object') return;
    try {
      if (state.timer) localStorage.setItem(KEYS.timer, JSON.stringify(state.timer));
      if (state.settings) localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
      if (state.todos) localStorage.setItem(KEYS.todos, JSON.stringify(state.todos));
      if (state.reminders) localStorage.setItem(KEYS.reminders, JSON.stringify(state.reminders));
      if (typeof state.theme === 'string') localStorage.setItem(KEYS.theme, state.theme);
    } catch (error) {
      console.warn('pixel clock: failed to seed state', error);
    }
  }

  const dicts = {};
  const locale = {
    register(namespace, language, entries) {
      dicts[namespace] = dicts[namespace] || {};
      dicts[namespace][language] = entries;
      return () => {};
    },
    bind(namespace) {
      return (key, params) => {
        const table = dicts[namespace] || {};
        const template = (table.zh && table.zh[key]) || (table.en && table.en[key]) || key;
        if (!params) return template;
        return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
      };
    },
    subscribe() {
      return () => {};
    },
  };

  const ctx = {
    effect(fn) {
      try {
        fn();
      } catch (error) {
        console.warn('pixel clock: effect failed', error);
      }
    },
    locale,
    slots: {
      inject(_slot, factory) {
        factory();
      },
      register(_options, component) {
        ctx.component = component;
        return component;
      },
    },
  };

  api.getState().then((state) => {
    seed(state);
    const lang = (state && state.lang) || navigator.language || 'zh';
    document.documentElement.lang = String(lang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const module = definition.factory((name) => {
      if (name === 'react') return window.React;
      throw new Error(`unexpected module ${name}`);
    });
    module.apply(ctx);
    const root = window.ReactDOM.createRoot(document.getElementById('app'));
    root.render(window.React.createElement(ctx.component));
  }).catch((error) => {
    console.error('pixel clock: boot failed', error);
    document.body.textContent = `Pixel Clock boot failed: ${error.message}`;
  });
})();
