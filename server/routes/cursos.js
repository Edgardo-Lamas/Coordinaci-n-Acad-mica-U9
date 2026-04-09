const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM cursos').all());
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO cursos
        (id, nombre, tipo, capacitador_id, programa, carga_horaria, fecha_inicio, fecha_fin, cupo_maximo, estado, sector_id, descripcion, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM cursos').run();
    const bulk = db.transaction((items) => items.forEach(c =>
        insert.run(c.id ?? null, c.nombre, c.tipo ?? null, c.capacitador_id ?? null, c.programa ?? null,
                   c.carga_horaria ?? null, c.fecha_inicio ?? null, c.fecha_fin ?? null,
                   c.cupo_maximo ?? null, c.estado ?? 'pendiente', c.sector_id ?? null, c.descripcion ?? null)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
