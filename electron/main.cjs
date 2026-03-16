const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { initDatabase } = require('./database.cjs')
const { registerIpcHandlers } = require('./ipc-handlers.cjs')
const db = require('./database.cjs')

const isDev = !app.isPackaged

let mainWindow = null
let fileWatcher = null

function setupWatcher(folderPath) {
  if (fileWatcher) { fileWatcher.close(); fileWatcher = null }
  if (!folderPath) return
  try {
    if (!fs.existsSync(folderPath)) return
    const recentlySent = new Set()
    fileWatcher = fs.watch(folderPath, (eventType, filename) => {
      if (!filename || !/\.(xlsx|xls)$/i.test(filename)) return
      const fullPath = path.join(folderPath, filename)
      if (recentlySent.has(fullPath)) return
      recentlySent.add(fullPath)
      setTimeout(() => recentlySent.delete(fullPath), 10000)
      // Esperar 2s para que el archivo termine de escribirse
      setTimeout(() => {
        try {
          if (mainWindow && fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0) {
            mainWindow.webContents.send('watch:newExcel', fullPath, filename)
          }
        } catch (_) {}
      }, 2000)
    })
  } catch (err) {
    console.warn('[Watcher] No se pudo iniciar carpeta vigilada:', err.message)
  }
}

function registerWatchHandlers() {
  ipcMain.handle('watch:getFolder', () => {
    try { return db.config.get('watched_folder') || '' } catch { return '' }
  })

  ipcMain.handle('watch:setFolder', (event, folderPath) => {
    db.config.set('watched_folder', folderPath || '')
    setupWatcher(folderPath)
    return { ok: true }
  })

  ipcMain.handle('watch:openDialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Seleccionar carpeta para Excel de Jefatura',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('watch:readFile', (event, filePath) => {
    const buf = fs.readFileSync(filePath)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Gestión Académica U9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  registerWatchHandlers()
  createWindow()

  // Iniciar carpeta vigilada si hay una configurada
  try {
    const savedFolder = db.config.get('watched_folder')
    if (savedFolder) setupWatcher(savedFolder)
  } catch (_) {}

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (fileWatcher) fileWatcher.close()
  if (process.platform !== 'darwin') app.quit()
})
