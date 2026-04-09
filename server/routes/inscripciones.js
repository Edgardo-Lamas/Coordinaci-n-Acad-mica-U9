const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM inscripciones').all());
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO inscripciones
        (id, interno_nro, curso_id, sector_id, calificacion, observaciones, fecha_inscripcion,
         fecha_inicio_curso, fecha_fin_curso, usuario_cargador_id, fecha_carga, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM inscripciones').run();
    const bulk = db.transaction((items) => items.forEach(i =>
        insert.run(i.id ?? null, i.interno_nro, i.curso_id, i.sector_id ?? null,
                   i.calificacion ?? 'en_curso', i.observaciones ?? null, i.fecha_inscripcion ?? null,
                   i.fecha_inicio_curso ?? null, i.fecha_fin_curso ?? null,
                   i.usuario_cargador_id ?? null, i.fecha_carga ?? null)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
