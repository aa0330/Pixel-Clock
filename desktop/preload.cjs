const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pixelClockDesktop', {
  getState: () => ipcRenderer.invoke('pixel-clock:get-state'),
  systemVolume: () => ipcRenderer.invoke('pixel-clock:system-volume'),
  sync: (state) => ipcRenderer.send('pixel-clock:sync', state),
  layout: (payload) => ipcRenderer.invoke('pixel-clock:layout', payload),
  beginDrag: (x, y) => ipcRenderer.send('pixel-clock:begin-drag', x, y),
  dragTo: (x, y) => ipcRenderer.send('pixel-clock:drag-to', x, y),
  endDrag: () => ipcRenderer.send('pixel-clock:end-drag'),
  attach: () => ipcRenderer.send('pixel-clock:attach'),
});
