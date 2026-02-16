import { useState } from 'react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    CURSOS, SECTORES, CAPACITADORES, INSCRIPCIONES, TIPOS_CURSO,
    ESTADOS_CURSO, ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES
} from '../data/mockData';
import {
    Plus, Search, BookOpen, CheckCircle, XCircle, Play, Eye
} from 'lucide-react';

export default function Cursos() {
    const { user, isAdmin, isCoordinacion, isResponsable } = useAuth();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [cursosList, setCursosList] = useState(CURSOS);

    // New course form
    const [newCurso, setNewCurso] = useState({
        nombre: '', tipo: TIPOS_CURSO[0], capacitador_id: 1,
        programa: '', carga_horaria: '', fecha_inicio: '', fecha_fin: '',
        cupo_maximo: '', sector_id: ''
    });

    const filteredCursos = cursosList.filter(c => {
        const matchSearch = !search || c.nombre.toLowerCase().includes(search.toLowerCase());
        const matchEstado = !filterEstado || c.estado === filterEstado;
        const matchTipo = !filterTipo || c.tipo === filterTipo;
        const matchSector = isResponsable() ? c.sector_id === user.sector_id : true;
        return matchSearch && matchEstado && matchTipo && matchSector;
    });

    const handleAction = (cursoId, action) => {
        setCursosList(prev => prev.map(c => {
            if (c.id !== cursoId) return c;
            switch (action) {
                case 'aprobar': return { ...c, estado: ESTADOS_CURSO.APROBADO };
                case 'rechazar': return { ...c, estado: ESTADOS_CURSO.ARCHIVADO };
                case 'iniciar': return { ...c, estado: ESTADOS_CURSO.EN_CURSO };
                case 'finalizar': return { ...c, estado: ESTADOS_CURSO.FINALIZADO };
                default: return c;
            }
        }));
    };

    const handleCreateCurso = (e) => {
        e.preventDefault();
        const nuevo = {
            ...newCurso,
            id: cursosList.length + 1,
            carga_horaria: Number(newCurso.carga_horaria),
            cupo_maximo: Number(newCurso.cupo_maximo),
            capacitador_id: Number(newCurso.capacitador_id),
            sector_id: Number(newCurso.sector_id),
            estado: ESTADOS_CURSO.PENDIENTE
        };
        setCursosList([...cursosList, nuevo]);
        setShowForm(false);
        setNewCurso({
            nombre: '', tipo: TIPOS_CURSO[0], capacitador_id: 1,
            programa: '', carga_horaria: '', fecha_inicio: '', fecha_fin: '',
            cupo_maximo: '', sector_id: ''
        });
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Cursos</h1>
                    <p className="page-description">
                        {isCoordinacion() || isAdmin()
                            ? 'Gestión de cursos con flujo de aprobación'
                            : 'Cursos disponibles en tu sector'
                        }
                    </p>
                </div>
                {(isCoordinacion() || isAdmin()) && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Nuevo Curso
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
                            placeholder="Buscar curso..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="toolbar-right">
                    <select className="filter-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {Object.entries(ESTADOS_CURSO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select className="filter-select" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {TIPOS_CURSO.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Courses Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Tipo</th>
                            <th>Sector</th>
                            <th>Capacitador</th>
                            <th>Carga Hor.</th>
                            <th>Período</th>
                            <th>Inscriptos</th>
                            <th>Estado</th>
                            {(isCoordinacion() || isAdmin()) && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCursos.length > 0 ? filteredCursos.map(curso => {
                            const sector = SECTORES.find(s => s.id === curso.sector_id);
                            const cap = CAPACITADORES.find(c => c.id === curso.capacitador_id);
                            const inscriptos = INSCRIPCIONES.filter(i => i.curso_id === curso.id).length;
                            return (
                                <tr key={curso.id}>
                                    <td style={{ fontWeight: 600 }}>{curso.nombre}</td>
                                    <td><span className="badge badge-neutral">{curso.tipo}</span></td>
                                    <td>{sector?.nombre || '—'}</td>
                                    <td>{cap?.nombre || '—'}</td>
                                    <td>{curso.carga_horaria}h</td>
                                    <td style={{ fontSize: 'var(--text-xs)' }}>
                                        {new Date(curso.fecha_inicio).toLocaleDateString('es-AR')} — {new Date(curso.fecha_fin).toLocaleDateString('es-AR')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div className="progress-bar" style={{ width: 60 }}>
                                                <div className="progress-bar-fill" style={{ width: `${(inscriptos / curso.cupo_maximo) * 100}%` }} />
                                            </div>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                                {inscriptos}/{curso.cupo_maximo}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${ESTADOS_CURSO_BADGES[curso.estado]}`}>
                                            {ESTADOS_CURSO_LABELS[curso.estado]}
                                        </span>
                                    </td>
                                    {(isCoordinacion() || isAdmin()) && (
                                        <td>
                                            <div className="table-actions">
                                                {curso.estado === ESTADOS_CURSO.PENDIENTE && (
                                                    <>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            title="Aprobar"
                                                            onClick={() => handleAction(curso.id, 'aprobar')}
                                                            style={{ color: 'var(--success)' }}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            title="Rechazar"
                                                            onClick={() => handleAction(curso.id, 'rechazar')}
                                                            style={{ color: 'var(--danger)' }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {curso.estado === ESTADOS_CURSO.APROBADO && (
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        title="Iniciar"
                                                        onClick={() => handleAction(curso.id, 'iniciar')}
                                                        style={{ color: 'var(--info)' }}
                                                    >
                                                        <Play size={16} />
                                                    </button>
                                                )}
                                                {curso.estado === ESTADOS_CURSO.EN_CURSO && (
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        title="Finalizar"
                                                        onClick={() => handleAction(curso.id, 'finalizar')}
                                                        style={{ color: 'var(--warning)' }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={isCoordinacion() || isAdmin() ? 9 : 8}>
                                    <div className="empty-state">
                                        <BookOpen size={48} className="empty-icon" />
                                        <div className="empty-title">No se encontraron cursos</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Course Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo Curso</h2>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForm(false)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCurso}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre del Curso *</label>
                                    <input className="form-input" required value={newCurso.nombre}
                                        onChange={e => setNewCurso({ ...newCurso, nombre: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tipo *</label>
                                        <select className="form-select" value={newCurso.tipo}
                                            onChange={e => setNewCurso({ ...newCurso, tipo: e.target.value })}>
                                            {TIPOS_CURSO.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sector *</label>
                                        <select className="form-select" required value={newCurso.sector_id}
                                            onChange={e => setNewCurso({ ...newCurso, sector_id: e.target.value })}>
                                            <option value="">Seleccionar...</option>
                                            {SECTORES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacitador *</label>
                                    <select className="form-select" value={newCurso.capacitador_id}
                                        onChange={e => setNewCurso({ ...newCurso, capacitador_id: e.target.value })}>
                                        {CAPACITADORES.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.institucion}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Programa / Descripción</label>
                                    <textarea className="form-textarea" rows={3} value={newCurso.programa}
                                        onChange={e => setNewCurso({ ...newCurso, programa: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Carga Horaria *</label>
                                        <input className="form-input" type="number" min="1" required value={newCurso.carga_horaria}
                                            onChange={e => setNewCurso({ ...newCurso, carga_horaria: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cupo Máximo *</label>
                                        <input className="form-input" type="number" min="1" required value={newCurso.cupo_maximo}
                                            onChange={e => setNewCurso({ ...newCurso, cupo_maximo: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fecha Inicio *</label>
                                        <input className="form-input" type="date" required value={newCurso.fecha_inicio}
                                            onChange={e => setNewCurso({ ...newCurso, fecha_inicio: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fecha Fin *</label>
                                        <input className="form-input" type="date" required value={newCurso.fecha_fin}
                                            onChange={e => setNewCurso({ ...newCurso, fecha_fin: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear Curso</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
