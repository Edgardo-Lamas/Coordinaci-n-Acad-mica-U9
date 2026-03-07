const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  db: {
    getAll: (tableName) => ipcRenderer.invoke('db:getAll', tableName),
    saveAll: (tableName, records) => ipcRenderer.invoke('db:saveAll', tableName, records),
    addAuditEntry: (entry) => ipcRenderer.invoke('db:addAuditEntry', entry),
    getConfig: (key) => ipcRenderer.invoke('db:getConfig', key),
    setConfig: (key, value) => ipcRenderer.invoke('db:setConfig', key, value),
  }
})
