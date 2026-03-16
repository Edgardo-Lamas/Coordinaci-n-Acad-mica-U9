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
    addCorrectionRequest: (entry) => ipcRenderer.invoke('db:addCorrectionRequest', entry),
    resolveCorrectionRequest: (id, resueltoPorNombre, estado, fechaResolucion) =>
      ipcRenderer.invoke('db:resolveCorrectionRequest', id, resueltoPorNombre, estado, fechaResolucion),
  },

  watchFolder: {
    getFolder: () => ipcRenderer.invoke('watch:getFolder'),
    setFolder: (folderPath) => ipcRenderer.invoke('watch:setFolder', folderPath),
    openDialog: () => ipcRenderer.invoke('watch:openDialog'),
    readFile: (filePath) => ipcRenderer.invoke('watch:readFile', filePath),
    onNewExcel: (callback) => ipcRenderer.on('watch:newExcel', (_e, filePath, filename) => callback(filePath, filename)),
    removeListener: () => ipcRenderer.removeAllListeners('watch:newExcel'),
  },
})
