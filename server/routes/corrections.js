const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM correction_requests ORDER BY fecha DESC').all());
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO correction_requests
        (id, registro_id, registro_desc, campo, valor_actual, valor_propuesto, motivo,
         solicitante_nombre, solicitante_id, estado, fecha, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM correction_requests').run();
    const bulk = db.transaction((items) => items.forEach(c =>
        insert.run(c.id ?? null, c.registro_id ?? null, c.registro_desc ?? null, c.campo ?? null,
                   c.valor_actual ?? null, c.valor_propuesto ?? null, c.motivo ?? null,
                   c.solicitante_nombre ?? null, c.solicitante_id ?? null,
                   c.estado ?? 'pendiente', c.fecha ?? new Date().toISOString())));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
