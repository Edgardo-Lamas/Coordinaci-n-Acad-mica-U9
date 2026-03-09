const { ipcMain } = require('electron')
const db = require('./database.cjs')

const TABLE_GETTERS = {
  internos:             () => db.internos.getAll(),
  cursos:               () => db.cursos.getAll(),
  capacitadores:        () => db.capacitadores.getAll(),
  inscripciones:        () => db.inscripciones.getAll(),
  certificados:         () => db.certificados.getAll(),
  audit_log:            () => db.auditLog.getAll(),
  usuarios:             () => db.usuarios.getAll(),
  correction_requests:  () => db.correctionRequests.getAll(),
}

const TABLE_SAVERS = {
  internos:             (r) => db.internos.saveAll(r),
  cursos:               (r) => db.cursos.saveAll(r),
  capacitadores:        (r) => db.capacitadores.saveAll(r),
  inscripciones:        (r) => db.inscripciones.saveAll(r),
  certificados:         (r) => db.certificados.saveAll(r),
  usuarios:             (r) => db.usuarios.saveAll(r),
  correction_requests:  (r) => db.correctionRequests.saveAll(r),
}

function registerIpcHandlers() {
  ipcMain.handle('db:getAll', (event, tableName) => {
    const getter = TABLE_GETTERS[tableName]
    if (!getter) throw new Error(`Tabla desconocida: ${tableName}`)
    return getter()
  })

  ipcMain.handle('db:saveAll', (event, tableName, records) => {
    const saver = TABLE_SAVERS[tableName]
    if (!saver) throw new Error(`Tabla desconocida: ${tableName}`)
    saver(records)
    return { ok: true }
  })

  ipcMain.handle('db:addAuditEntry', (event, entry) => {
    return db.auditLog.addEntry(entry)
  })

  ipcMain.handle('db:addCorrectionRequest', (event, entry) => {
    return db.correctionRequests.addEntry(entry)
  })

  ipcMain.handle('db:resolveCorrectionRequest', (event, id, resueltoPorNombre, estado, fechaResolucion) => {
    db.correctionRequests.resolve(id, resueltoPorNombre, estado, fechaResolucion)
    return { ok: true }
  })

  ipcMain.handle('db:getConfig', (event, key) => {
    return db.config.get(key)
  })

  ipcMain.handle('db:setConfig', (event, key, value) => {
    db.config.set(key, value)
    return { ok: true }
  })
}

module.exports = { registerIpcHandlers }
