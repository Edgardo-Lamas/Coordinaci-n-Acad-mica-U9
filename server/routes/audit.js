const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM audit_log ORDER BY fecha DESC').all());
});

router.post('/', (req, res) => {
    const e = req.body;
    db.prepare(`INSERT INTO audit_log (usuario_id, usuario_nombre, accion, entidad, detalle, fecha, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(e.usuario_id ?? null, e.usuario_nombre ?? null, e.accion, e.entidad ?? null,
             e.detalle ?? null, e.fecha ?? new Date().toISOString(), e.ip ?? null);
    res.json({ ok: true });
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR IGNORE INTO audit_log (id, usuario_id, usuario_nombre, accion, entidad, detalle, fecha, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const bulk = db.transaction((items) => items.forEach(e =>
        insert.run(e.id ?? null, e.usuario_id ?? null, e.usuario_nombre ?? null, e.accion,
                   e.entidad ?? null, e.detalle ?? null, e.fecha, e.ip ?? null)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
