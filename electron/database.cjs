const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let db = null

const SCHEMA = `
CREATE TABLE IF NOT EXISTS internos (
  numero_interno TEXT PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  dni TEXT,
  sector_actual INTEGER,
  fecha_ingreso TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  whatsapp_contacto TEXT
);

CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT,
  capacitador_id INTEGER,
  programa TEXT,
  carga_horaria INTEGER,
  fecha_inicio TEXT,
  fecha_fin TEXT,
  cupo_maximo INTEGER,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  sector_id INTEGER
);

CREATE TABLE IF NOT EXISTS capacitadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  dni TEXT,
  institucion TEXT
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interno_nro TEXT NOT NULL,
  curso_id INTEGER NOT NULL,
  calificacion TEXT,
  observaciones TEXT,
  fecha_inscripcion TEXT,
  fecha_inicio_curso TEXT,
  fecha_fin_curso TEXT,
  usuario_cargador_id INTEGER,
  fecha_carga TEXT
);

CREATE TABLE IF NOT EXISTS certificados (
  codigo TEXT PRIMARY KEY,
  inscripcion_id INTEGER NOT NULL,
  hash_integridad TEXT,
  fecha_emision TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  usuario_nombre TEXT,
  accion TEXT NOT NULL,
  entidad TEXT,
  detalle TEXT,
  fecha TEXT NOT NULL,
  ip TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL,
  sector_id INTEGER,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT
);
`

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'ga_u9.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  console.log('[DB] SQLite inicializado en:', dbPath)
  return db
}

// ── Internos ─────────────────────────────────────────────────────────────────
const internos = {
  getAll: () => db.prepare('SELECT * FROM internos').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO internos
      (numero_interno, nombre_completo, dni, sector_actual, fecha_ingreso, estado, whatsapp_contacto)
      VALUES (@numero_interno, @nombre_completo, @dni, @sector_actual, @fecha_ingreso, @estado, @whatsapp_contacto)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM internos').run()
      for (const row of rows) upsert.run(row)
    })(records)
  }
}

// ── Cursos ────────────────────────────────────────────────────────────────────
const cursos = {
  getAll: () => db.prepare('SELECT * FROM cursos').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO cursos
      (id, nombre, tipo, capacitador_id, programa, carga_horaria, fecha_inicio, fecha_fin, cupo_maximo, estado, sector_id)
      VALUES (@id, @nombre, @tipo, @capacitador_id, @programa, @carga_horaria, @fecha_inicio, @fecha_fin, @cupo_maximo, @estado, @sector_id)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM cursos').run()
      for (const row of rows) upsert.run(row)
    })(records)
  }
}

// ── Capacitadores ─────────────────────────────────────────────────────────────
const capacitadores = {
  getAll: () => db.prepare('SELECT * FROM capacitadores').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO capacitadores (id, nombre, dni, institucion)
      VALUES (@id, @nombre, @dni, @institucion)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM capacitadores').run()
      for (const row of rows) upsert.run(row)
    })(records)
  }
}

// ── Inscripciones ─────────────────────────────────────────────────────────────
const inscripciones = {
  getAll: () => db.prepare('SELECT * FROM inscripciones').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO inscripciones
      (id, interno_nro, curso_id, calificacion, observaciones, fecha_inscripcion,
       fecha_inicio_curso, fecha_fin_curso, usuario_cargador_id, fecha_carga)
      VALUES (@id, @interno_nro, @curso_id, @calificacion, @observaciones, @fecha_inscripcion,
       @fecha_inicio_curso, @fecha_fin_curso, @usuario_cargador_id, @fecha_carga)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM inscripciones').run()
      for (const row of rows) upsert.run(row)
    })(records)
  }
}

// ── Certificados ──────────────────────────────────────────────────────────────
const certificados = {
  getAll: () => db.prepare('SELECT * FROM certificados').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO certificados
      (codigo, inscripcion_id, hash_integridad, fecha_emision, estado, pdf_url)
      VALUES (@codigo, @inscripcion_id, @hash_integridad, @fecha_emision, @estado, @pdf_url)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM certificados').run()
      for (const row of rows) upsert.run(row)
    })(records)
  }
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
const auditLog = {
  getAll: () => db.prepare('SELECT * FROM audit_log ORDER BY fecha DESC').all(),
  addEntry: (entry) => {
    const result = db.prepare(`
      INSERT INTO audit_log (usuario_id, usuario_nombre, accion, entidad, detalle, fecha, ip)
      VALUES (@usuario_id, @usuario_nombre, @accion, @entidad, @detalle, @fecha, @ip)
    `).run(entry)
    return result.lastInsertRowid
  }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
const usuarios = {
  getAll: () => db.prepare('SELECT * FROM usuarios').all(),
  saveAll: (records) => {
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO usuarios (id, email, password, nombre, rol, sector_id, activo)
      VALUES (@id, @email, @password, @nombre, @rol, @sector_id, @activo)
    `)
    db.transaction((rows) => {
      db.prepare('DELETE FROM usuarios').run()
      for (const row of rows) upsert.run({ ...row, activo: row.activo ? 1 : 0 })
    })(records)
  }
}

// ── Config ────────────────────────────────────────────────────────────────────
const config = {
  get: (key) => {
    const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key)
    return row ? row.value : null
  },
  set: (key, value) => {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value)
  }
}

module.exports = { initDatabase, internos, cursos, capacitadores, inscripciones, certificados, auditLog, usuarios, config }
