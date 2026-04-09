const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM capacitadores').all());
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO capacitadores
        (id, nombre, dni, institucion, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM capacitadores').run();
    const bulk = db.transaction((items) => items.forEach(c =>
        insert.run(c.id ?? null, c.nombre, c.dni ?? null, c.institucion ?? null)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
