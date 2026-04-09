const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'gea9.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS internos (
  numero_interno TEXT PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  dni TEXT,
  sector_actual INTEGER,
  fecha_ingreso TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  whatsapp_contacto TEXT,
  observaciones TEXT,
  pendiente_reconciliacion INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
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
  sector_id INTEGER,
  descripcion TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS capacitadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  dni TEXT,
  institucion TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interno_nro TEXT NOT NULL,
  curso_id INTEGER NOT NULL,
  sector_id INTEGER,
  calificacion TEXT DEFAULT 'en_curso',
  observaciones TEXT,
  fecha_inscripcion TEXT,
  fecha_inicio_curso TEXT,
  fecha_fin_curso TEXT,
  usuario_cargador_id INTEGER,
  fecha_carga TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificados (
  codigo TEXT PRIMARY KEY,
  inscripcion_id INTEGER NOT NULL,
  hash_integridad TEXT,
  fecha_emision TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  pdf_url TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
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
  activo INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS correction_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registro_id INTEGER,
  registro_desc TEXT,
  campo TEXT,
  valor_actual TEXT,
  valor_propuesto TEXT,
  motivo TEXT,
  solicitante_nombre TEXT,
  solicitante_id INTEGER,
  estado TEXT DEFAULT 'pendiente',
  fecha TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`);

// Usuario administrador por defecto si la tabla está vacía
const countUsuarios = db.prepare('SELECT COUNT(*) as c FROM usuarios').get();
if (countUsuarios.c === 0) {
    db.prepare(`INSERT INTO usuarios (email, password, nombre, rol, sector_id, activo)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run('soporte@u9.gob.ar', 'U9sop0rte#2025', 'Edgardo Lamas', 'administrador', null, 1);
    console.log('[DB] Usuario admin creado: soporte@u9.gob.ar');
}

console.log(`[DB] Base de datos lista en: ${DB_PATH}`);

module.exports = db;
