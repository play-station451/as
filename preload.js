const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js is running');

contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel, data) => ipcRenderer.send(channel, data),
      on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
      once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
      closeWindow: () => ipcRenderer.send('close-window'),
      toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-window')
    }
  }
);