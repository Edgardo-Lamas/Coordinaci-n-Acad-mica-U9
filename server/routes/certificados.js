const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM certificados').all());
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO certificados
        (codigo, inscripcion_id, hash_integridad, fecha_emision, estado, pdf_url, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM certificados').run();
    const bulk = db.transaction((items) => items.forEach(c =>
        insert.run(c.codigo, c.inscripcion_id, c.hash_integridad ?? null,
                   c.fecha_emision ?? null, c.estado ?? 'pendiente', c.pdf_url ?? null)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
