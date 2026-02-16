import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SECTORES, INTERNOS, CURSOS, INSCRIPCIONES, ESTADOS_CURSO, ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES, CAPACITADORES, DEMO_USERS } from '../data/mockData';
import { Users, BookOpen, Building2, Eye, ClipboardList, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function MiSector() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('internos');
    const [showFormInscripcion, setShowFormInscripcion] = useState(false);
    const [inscripcionesList, setInscripcionesList] = useState(INSCRIPCIONES);
    const [newInsc, setNewInsc] = useState({ interno_nro: '', curso_id: '' });

    const sector = SECTORES.find(s => s.id === user.sector_id);
    const sectorInternos = INTERNOS.filter(i => i.sector_actual === user.sector_id && i.estado === 'activo');
    const sectorCursos = CURSOS.filter(c => c.sector_id === user.sector_id);
    const sectorInscripciones = inscripcionesList.filter(i => {
        const curso = CURSOS.find(c => c.id === i.curso_id);
        return curso?.sector_id === user.sector_id;
    });

    const cursosDisponibles = sectorCursos.filter(c =>
        c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO
    );

    const internosDisponibles = sectorInternos;

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
        setShowFormInscripcion(false);
        setNewInsc({ interno_nro: '', curso_id: '' });
    };

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

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Building2 size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                        {sector?.nombre || 'Mi Sector'}
                    </h1>
                    <p className="page-description">
                        Panel de gestión para tu sector asignado
                    </p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Internos Activos</div>
                        <div className="stat-value">{sectorInternos.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon teal"><BookOpen size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Cursos</div>
                        <div className="stat-value">{sectorCursos.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><ClipboardList size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Inscripciones</div>
                        <div className="stat-value">{sectorInscripciones.length}</div>
                    </div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'internos' ? 'active' : ''}`} onClick={() => setActiveTab('internos')}>
                    Internos ({sectorInternos.length})
                </button>
                <button className={`tab ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
                    Cursos ({sectorCursos.length})
                </button>
                <button className={`tab ${activeTab === 'inscripciones' ? 'active' : ''}`} onClick={() => setActiveTab('inscripciones')}>
                    Inscripciones ({sectorInscripciones.length})
                </button>
            </div>

            {activeTab === 'internos' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nº Interno</th>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectorInternos.map(interno => (
                                <tr key={interno.numero_interno}>
                                    <td><strong style={{ color: 'var(--primary-700)' }}>#{interno.numero_interno}</strong></td>
                                    <td style={{ fontWeight: 500 }}>{interno.nombre_completo}</td>
                                    <td><span className="badge badge-success">Activo</span></td>
                                    <td>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/internos/${interno.numero_interno}`)}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'cursos' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Tipo</th>
                                <th>Capacitador</th>
                                <th>Carga Horaria</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectorCursos.map(curso => {
                                const cap = CAPACITADORES.find(c => c.id === curso.capacitador_id);
                                return (
                                    <tr key={curso.id}>
                                        <td style={{ fontWeight: 600 }}>{curso.nombre}</td>
                                        <td>{curso.tipo}</td>
                                        <td>{cap?.nombre || '—'}</td>
                                        <td>{curso.carga_horaria}h</td>
                                        <td>
                                            <span className={`badge ${ESTADOS_CURSO_BADGES[curso.estado]}`}>
                                                {ESTADOS_CURSO_LABELS[curso.estado]}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'inscripciones' && (
                <div>
                    <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="page-subtitle" style={{ marginTop: 0 }}>Inscripciones del Sector {sector?.nombre}</h2>
                            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                                Total: {sectorInscripciones.length} inscrip. | Cargadas por: {new Set(sectorInscripciones.map(i => i.usuario_cargador_id)).size} usuarios
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowFormInscripcion(true)}>
                            <Plus size={18} /> Nueva Inscripción
                        </button>
                    </div>

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
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sectorInscripciones.length > 0 ? sectorInscripciones.map(insc => {
                                    const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);
                                    const curso = CURSOS.find(c => c.id === insc.curso_id);
                                    const cargador = DEMO_USERS.find(u => u.id === insc.usuario_cargador_id);
                                    return (
                                        <tr key={insc.id}>
                                            <td><strong style={{ color: 'var(--primary-700)' }}>#{insc.interno_nro}</strong></td>
                                            <td style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{interno?.nombre_completo || '—'}</td>
                                            <td style={{ fontSize: 'var(--text-sm)' }}>{curso?.nombre || '—'}</td>
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
                                                <div>{cargador?.nombre.split(' ')[0] || `ID: ${insc.usuario_cargador_id}`}</div>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => navigate(`/internos/${insc.interno_nro}`)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                            <div style={{ color: 'var(--gray-400)' }}>No hay inscripciones en este sector</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal para crear inscripción */}
            {showFormInscripcion && (
                <div className="modal-overlay" onClick={() => setShowFormInscripcion(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Inscripción — {sector?.nombre}</h2>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowFormInscripcion(false)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInscripcion}>
                            <div className="modal-body">
                                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                                    Cargador: <strong>{user.nombre}</strong> ({user.rolLabel})
                                </p>
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
                                        {cursosDisponibles.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre} ({c.tipo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowFormInscripcion(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Cargar Inscripción</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
