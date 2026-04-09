const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/internos',      require('./routes/internos'));
app.use('/api/cursos',        require('./routes/cursos'));
app.use('/api/inscripciones', require('./routes/inscripciones'));
app.use('/api/certificados',  require('./routes/certificados'));
app.use('/api/capacitadores', require('./routes/capacitadores'));
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/audit',         require('./routes/audit'));
app.use('/api/corrections',   require('./routes/corrections'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => {
    res.json({ ok: true, sistema: 'GEA9', version: '2.0.0', fecha: new Date().toISOString() });
});

// ── Sirve el frontend React (build estático) ──────────────────────────────────
const DIST = path.join(__dirname, '..', 'dist');
const fs = require('fs');
if (fs.existsSync(DIST)) {
    app.use(express.static(DIST));
    app.get('*', (req, res) => {
        res.sendFile(path.join(DIST, 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.json({ mensaje: 'GEA9 API corriendo. El frontend aún no está compilado.' }));
}

// ── Inicio ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   GEA9 — Servidor Central v2.0       ║');
    console.log('  ║   Gestión Académica · Unidad 9        ║');
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
    console.log(`  Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`  API disponible en:     http://localhost:${PORT}/api/ping`);
    console.log('');
});
