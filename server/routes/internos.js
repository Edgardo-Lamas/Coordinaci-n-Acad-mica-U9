const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM internos').all();
    res.json(rows);
});

router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM internos WHERE numero_interno = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
});

router.post('/', (req, res) => {
    const i = req.body;
    db.prepare(`INSERT OR REPLACE INTO internos
        (numero_interno, nombre_completo, dni, sector_actual, fecha_ingreso, estado, whatsapp_contacto, observaciones, pendiente_reconciliacion, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
        .run(i.numero_interno, i.nombre_completo, i.dni ?? null, i.sector_actual ?? null,
             i.fecha_ingreso ?? null, i.estado ?? 'activo', i.whatsapp_contacto ?? null,
             i.observaciones ?? null, i.pendiente_reconciliacion ? 1 : 0);
    res.json({ ok: true });
});

router.put('/:id', (req, res) => {
    const i = req.body;
    db.prepare(`UPDATE internos SET nombre_completo=?, dni=?, sector_actual=?, fecha_ingreso=?,
        estado=?, whatsapp_contacto=?, observaciones=?, pendiente_reconciliacion=?, updated_at=datetime('now')
        WHERE numero_interno=?`)
        .run(i.nombre_completo, i.dni ?? null, i.sector_actual ?? null, i.fecha_ingreso ?? null,
             i.estado ?? 'activo', i.whatsapp_contacto ?? null, i.observaciones ?? null,
             i.pendiente_reconciliacion ? 1 : 0, req.params.id);
    res.json({ ok: true });
});

// Guardar lista completa (compatibilidad con dataService.js)
router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO internos
        (numero_interno, nombre_completo, dni, sector_actual, fecha_ingreso, estado, whatsapp_contacto, observaciones, pendiente_reconciliacion, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM internos').run();
    const bulk = db.transaction((items) => items.forEach(i =>
        insert.run(i.numero_interno, i.nombre_completo, i.dni ?? null, i.sector_actual ?? null,
                   i.fecha_ingreso ?? null, i.estado ?? 'activo', i.whatsapp_contacto ?? null,
                   i.observaciones ?? null, i.pendiente_reconciliacion ? 1 : 0)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
