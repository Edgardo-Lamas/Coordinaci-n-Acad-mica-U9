import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    INSCRIPCIONES, INTERNOS, CURSOS, SECTORES, ESTADOS_CURSO, DEMO_USERS
} from '../data/mockData';
import {
    Search, Plus, ClipboardList, Eye, Edit, XCircle, User
} from 'lucide-react';

export default function Inscripciones() {
    const { user, isResponsable, isCoordinacion, isAdmin, isCargador } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterCalificacion, setFilterCalificacion] = useState('');
    const [filterSector, setFilterSector] = useState(isResponsable() || isCargador() ? String(user.sector_id) : '');
    const [showForm, setShowForm] = useState(false);
    const [inscripcionesList, setInscripcionesList] = useState(INSCRIPCIONES);
    const [newInsc, setNewInsc] = useState({ interno_nro: '', curso_id: '' });

    const getCalificacionBadge = (cal) => {
        switch (cal) {
            case 'aprobado': return 'badge-success';
            case 'desaprobado': return 'badge-danger';
            case 'en_curso': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const getCalificacionLabel = (cal) => {
        switch (cal) {
            case 'aprobado': return 'Aprobado';
            case 'desaprobado': return 'Desaprobado';
            case 'en_curso': return 'En Curso';
            default: return cal;
        }
    };

    const enriched = inscripcionesList.map(insc => {
        const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);
        const curso = CURSOS.find(c => c.id === insc.curso_id);
        const sector = curso ? SECTORES.find(s => s.id === curso.sector_id) : null;
        const cargador = DEMO_USERS.find(u => u.id === insc.usuario_cargador_id);
        return { ...insc, interno, curso, sector, cargador };
    });

    const filtered = enriched.filter(insc => {
        const matchSearch = !search ||
            insc.interno?.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
            insc.interno_nro.includes(search) ||
            insc.curso?.nombre?.toLowerCase().includes(search.toLowerCase());
        const matchCalif = !filterCalificacion || insc.calificacion === filterCalificacion;
        const matchSector = !filterSector || String(insc.curso?.sector_id) === filterSector;
        
        // PERMISSION LOGIC
        let hasAccess = true;
        if (isResponsable() || isCargador()) {
            hasAccess = insc.curso?.sector_id === user.sector_id;
        }
        // Admin y coordinación ven todo
        
        return matchSearch && matchCalif && matchSector && hasAccess;
    });

    const handleCalifChange = (inscId, newCalif) => {
        setInscripcionesList(prev => prev.map(i =>
            i.id === inscId ? { ...i, calificacion: newCalif } : i
        ));
    };

    const handleCreateInscripcion = (e) => {
        e.preventDefault();
        const nuevaCarga = {
            id: inscripcionesList.length + 1,
            interno_nro: newInsc.interno_nro,
            curso_id: Number(newInsc.curso_id),
            calificacion: 'en_curso',
            observaciones: '',
            fecha_inscripcion: new Date().toISOString().split('T')[0],
            usuario_cargador_id: user.id,
            fecha_carga: new Date().toISOString(),
            fecha_inicio_curso: CURSOS.find(c => c.id === Number(newInsc.curso_id))?.fecha_inicio || '',
            fecha_fin_curso: CURSOS.find(c => c.id === Number(newInsc.curso_id))?.fecha_fin || ''
        };
        setInscripcionesList([...inscripcionesList, nuevaCarga]);
        setShowForm(false);
        setNewInsc({ interno_nro: '', curso_id: '' });
    };

    const cursosDisponibles = CURSOS.filter(c =>
        c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO
    ).filter(c => {
        if (isResponsable() || isCargador()) {
            return c.sector_id === user.sector_id;
        }
        return true;
    });

    const internosDisponibles = INTERNOS.filter(i => i.estado === 'activo')
        .filter(i => {
            if (isResponsable() || isCargador()) {
                return i.sector_actual === user.sector_id;
            }
            return true;
        });

    // Sectores disponibles según el rol
    const sectoresDisponibles = !filterSector && !isResponsable() && !isCargador() 
        ? SECTORES 
        : isResponsable() || isCargador() 
            ? SECTORES.filter(s => s.id === user.sector_id)
            : SECTORES;

    const canCreateInscripcion = isResponsable() || isCargador() || isCoordinacion() || isAdmin();

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inscripciones</h1>
                    <p className="page-description">
                        Gestión de inscripciones con trazabilidad y auditoría
                    </p>
                </div>
                {canCreateInscripcion && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Nueva Inscripción
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por interno, Nº o curso..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="toolbar-right">
                    {(!isResponsable() && !isCargador()) && (
                        <select className="filter-select" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
                            <option value="">Todos los sectores</option>
                            {SECTORES.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
                        </select>
                    )}
                    <select className="filter-select" value={filterCalificacion} onChange={(e) => setFilterCalificacion(e.target.value)}>
                        <option value="">Todas las calificaciones</option>
                        <option value="en_curso">En Curso</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="desaprobado">Desaprobado</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nº Interno</th>
                            <th>Nombre</th>
                            <th>Curso</th>
                            <th>Período</th>
                            <th>Calificación</th>
                            <th>Cargado por</th>
                            <th>Fecha Carga</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(insc => (
                            <tr key={insc.id}>
                                <td>
                                    <strong style={{ color: 'var(--primary-700)' }}>#{insc.interno_nro}</strong>
                                </td>
                                <td style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{insc.interno?.nombre_completo || '—'}</td>
                                <td style={{ fontSize: 'var(--text-sm)' }}>{insc.curso?.nombre || '—'}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                    {insc.fecha_inicio_curso ? new Date(insc.fecha_inicio_curso).toLocaleDateString('es-AR') : '—'} 
                                    {insc.fecha_fin_curso ? ' → ' + new Date(insc.fecha_fin_curso).toLocaleDateString('es-AR') : ''}
                                </td>
                                <td>
                                    <span className={`badge ${getCalificacionBadge(insc.calificacion)}`}>
                                        {getCalificacionLabel(insc.calificacion)}
                                    </span>
                                </td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <User size={14} />
                                        <span>{insc.cargador?.nombre || `ID: ${insc.usuario_cargador_id}`}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                    {insc.fecha_carga ? new Date(insc.fecha_carga).toLocaleString('es-AR', { 
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    }) : '—'}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-ghost btn-icon btn-sm"
                                        title="Ver ficha"
                                        onClick={() => navigate(`/internos/${insc.interno_nro}`)}
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8}>
                                    <div className="empty-state">
                                        <ClipboardList size={48} className="empty-icon" />
                                        <div className="empty-title">No hay inscripciones</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Inscription Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Inscripción</h2>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInscripcion}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Interno *</label>
                                    <select className="form-select" required value={newInsc.interno_nro}
                                        onChange={e => setNewInsc({ ...newInsc, interno_nro: e.target.value })}>
                                        <option value="">Seleccionar interno...</option>
                                        {internosDisponibles.map(i => (
                                            <option key={i.numero_interno} value={i.numero_interno}>
                                                #{i.numero_interno} — {i.nombre_completo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Curso *</label>
                                    <select className="form-select" required value={newInsc.curso_id}
                                        onChange={e => setNewInsc({ ...newInsc, curso_id: e.target.value })}>
                                        <option value="">Seleccionar curso...</option>
                                        {cursosDisponibles.map(c => {
                                            const sector = SECTORES.find(s => s.id === c.sector_id);
                                            return (
                                                <option key={c.id} value={c.id}>
                                                    {c.nombre} ({sector?.nombre})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Inscribir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
