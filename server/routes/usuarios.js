const express = require('express');
const router = express.Router();
const db = require('../database');

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const user = db.prepare('SELECT * FROM usuarios WHERE email = ? AND password = ? AND activo = 1').get(email, password);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT id, email, nombre, rol, sector_id, activo FROM usuarios').all();
    res.json(rows);
});

router.post('/bulk', (req, res) => {
    const lista = req.body;
    if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });
    const insert = db.prepare(`INSERT OR REPLACE INTO usuarios
        (id, email, password, nombre, rol, sector_id, activo, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    db.prepare('DELETE FROM usuarios').run();
    const bulk = db.transaction((items) => items.forEach(u =>
        insert.run(u.id ?? null, u.email, u.password, u.nombre, u.rol, u.sector_id ?? null, u.activo ? 1 : 0)));
    bulk(lista);
    res.json({ ok: true, count: lista.length });
});

module.exports = router;
