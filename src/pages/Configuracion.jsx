import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES, ROLE_LABELS, SECTORES } from '../data/mockData';
import { getUsuarios, saveUsuarios } from '../data/dataService';
import { Settings, Plus, Pencil, UserX, UserCheck, X, User, Eye, EyeOff, Trash2 } from 'lucide-react';

const ROLE_BADGE = {
    [ROLES.ADMIN]: 'badge-danger',
    [ROLES.COORDINACION]: 'badge-info',
    [ROLES.RESPONSABLE]: 'badge-success',
    [ROLES.CARGADOR]: 'badge-neutral',
    [ROLES.JEFE]: 'badge-purple',
};

const ROLES_CON_SECTOR = [ROLES.RESPONSABLE, ROLES.CARGADOR];

const emptyForm = {
    nombre: '',
    email: '',
    password: '',
    rol: ROLES.RESPONSABLE,
    sector_id: 1,
    activo: true,
};

export default function Configuracion() {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState(() => getUsuarios());
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [filterRol, setFilterRol] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const rolesNecesitanSector = ROLES_CON_SECTOR.includes(form.rol);

    const filteredUsuarios = filterRol
        ? usuarios.filter(u => u.rol === filterRol)
        : usuarios;

    const openCreate = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setShowPassword(false);
        setError('');
        setShowForm(true);
    };

    const openEdit = (u) => {
        setEditingUser(u);
        setForm({
            nombre: u.nombre,
            email: u.email,
            password: '',
            rol: u.rol,
            sector_id: u.sector_id ?? 1,
            activo: u.activo,
        });
        setShowPassword(false);
        setError('');
        setShowForm(true);
    };

    const handleSave = () => {
        setError('');
        if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
        if (!form.email.trim()) { setError('El email es obligatorio.'); return; }
        if (!editingUser && !form.password.trim()) { setError('La contraseña es obligatoria para un nuevo usuario.'); return; }

        // Email único (excepto si es el mismo usuario editado)
        const emailExists = usuarios.some(u =>
            u.email.toLowerCase() === form.email.toLowerCase() &&
            u.id !== editingUser?.id
        );
        if (emailExists) { setError('Ya existe un usuario con ese email.'); return; }

        const updated = editingUser
            ? usuarios.map(u => u.id === editingUser.id ? {
                ...u,
                nombre: form.nombre.trim(),
                email: form.email.trim().toLowerCase(),
                ...(form.password.trim() ? { password: form.password.trim() } : {}),
                rol: form.rol,
                sector_id: ROLES_CON_SECTOR.includes(form.rol) ? Number(form.sector_id) : null,
                activo: form.activo,
            } : u)
            : [...usuarios, {
                id: Math.max(0, ...usuarios.map(u => u.id)) + 1,
                nombre: form.nombre.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password.trim(),
                rol: form.rol,
                sector_id: ROLES_CON_SECTOR.includes(form.rol) ? Number(form.sector_id) : null,
                activo: form.activo,
            }];

        saveUsuarios(updated);
        setUsuarios(updated);
        setShowForm(false);
    };

    const handleToggleActivo = (userId) => {
        if (userId === currentUser.id) return; // no desactivarse a uno mismo
        const updated = usuarios.map(u =>
            u.id === userId ? { ...u, activo: !u.activo } : u
        );
        saveUsuarios(updated);
        setUsuarios(updated);
    };

    const handleDelete = (userId) => {
        const updated = usuarios.filter(u => u.id !== userId);
        saveUsuarios(updated);
        setUsuarios(updated);
        setConfirmDeleteId(null);
    };

    const getInitials = (name) =>
        name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const getSectorNombre = (sector_id) =>
        SECTORES.find(s => s.id === sector_id)?.nombre || '—';

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Settings size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                        Configuración
                    </h1>
                    <p className="page-description">Gestión de usuarios del sistema</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openCreate}>
                    <Plus size={16} /> Nuevo Usuario
                </button>
            </div>

            {/* Filtro por rol */}
            <div className="toolbar" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="toolbar-left">
                    <select className="filter-select" value={filterRol} onChange={e => setFilterRol(e.target.value)}>
                        <option value="">Todos los roles</option>
                        {Object.entries(ROLE_LABELS).map(([rol, label]) => (
                            <option key={rol} value={rol}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="toolbar-right" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
                    {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Sector</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsuarios.map(u => (
                            <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.5 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 8,
                                            background: u.activo ? 'var(--primary-100)' : 'var(--gray-100)',
                                            color: u.activo ? 'var(--primary-600)' : 'var(--gray-400)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: 12, flexShrink: 0
                                        }}>
                                            {getInitials(u.nombre)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                                                {u.nombre}
                                                {u.id === currentUser.id && (
                                                    <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--primary-400)', fontWeight: 400 }}>(vos)</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                                                {u.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${ROLE_BADGE[u.rol] || 'badge-neutral'}`}>
                                        {ROLE_LABELS[u.rol] || u.rol}
                                    </span>
                                </td>
                                <td style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                    {u.sector_id ? getSectorNombre(u.sector_id) : '—'}
                                </td>
                                <td>
                                    <span className={`badge ${u.activo ? 'badge-success' : 'badge-neutral'}`}>
                                        {u.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => openEdit(u)}
                                            title="Editar usuario"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => handleToggleActivo(u.id)}
                                            disabled={u.id === currentUser.id}
                                            title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                            style={{ color: u.activo ? 'var(--warning)' : 'var(--success)' }}
                                        >
                                            {u.activo ? <UserX size={15} /> : <UserCheck size={15} />}
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => setConfirmDeleteId(u.id)}
                                            disabled={u.id === currentUser.id}
                                            title="Eliminar usuario"
                                            style={{ color: 'var(--danger)' }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal confirmar eliminación */}
            {confirmDeleteId && (() => {
                const u = usuarios.find(x => x.id === confirmDeleteId);
                return (
                    <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
                        <div className="modal" style={{ maxWidth: 400, width: '95%' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Trash2 size={18} style={{ color: 'var(--danger)' }} />
                                    Eliminar usuario
                                </h2>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmDeleteId(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: 'var(--space-6)' }}>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 8 }}>
                                    ¿Estás seguro de que querés eliminar a <strong>{u?.nombre}</strong>?
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmDeleteId)}>
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Modal crear/editar */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" style={{ maxWidth: 480, width: '95%' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <User size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {error && (
                                <div className="login-error" style={{ fontSize: 'var(--text-sm)' }}>{error}</div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Nombre completo *</label>
                                <input
                                    className="form-input"
                                    value={form.nombre}
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                    placeholder="Ej: María López"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="usuario@sistema.gob.ar"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Contraseña {editingUser ? '(dejá vacío para no cambiarla)' : '*'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-input"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="••••••••"
                                        style={{ paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{
                                            position: 'absolute', right: 8, top: '50%',
                                            transform: 'translateY(-50%)', background: 'none',
                                            border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Rol *</label>
                                    <select
                                        className="form-input"
                                        value={form.rol}
                                        onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                                    >
                                        {Object.entries(ROLE_LABELS).map(([rol, label]) => (
                                            <option key={rol} value={rol}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {rolesNecesitanSector && (
                                    <div className="form-group">
                                        <label className="form-label">Sector *</label>
                                        <select
                                            className="form-input"
                                            value={form.sector_id}
                                            onChange={e => setForm(f => ({ ...f, sector_id: e.target.value }))}
                                        >
                                            {SECTORES.map(s => (
                                                <option key={s.id} value={s.id}>{s.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input
                                    type="checkbox"
                                    id="activo-check"
                                    checked={form.activo}
                                    onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <label htmlFor="activo-check" style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', cursor: 'pointer' }}>
                                    Usuario activo (puede ingresar al sistema)
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave}>
                                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
