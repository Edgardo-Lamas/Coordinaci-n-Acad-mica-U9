import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    INTERNOS, CURSOS, SECTORES, INSCRIPCIONES, CERTIFICADOS,
    CAPACITADORES, ESTADOS_CURSO, ESTADOS_CURSO_LABELS, DEMO_USERS
} from '../data/mockData';
import {
    Users, BookOpen, Building2, Award, TrendingUp,
    ClipboardList, UserCheck, GraduationCap, Plus, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, isAdmin, isCoordinacion, isResponsable } = useAuth();
    const navigate = useNavigate();

    // Calculate stats
    const totalInternos = INTERNOS.filter(i => i.estado === 'activo').length;
    const cursosActivos = CURSOS.filter(c =>
        c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO
    ).length;
    const cursosFinalizados = CURSOS.filter(c => c.estado === ESTADOS_CURSO.FINALIZADO).length;
    const totalCertificados = CERTIFICADOS.length;
    const totalInscripciones = INSCRIPCIONES.length;
    const cursosPendientes = CURSOS.filter(c => c.estado === ESTADOS_CURSO.PENDIENTE).length;

    // Sector-specific stats for responsable
    const sectorInternos = isResponsable()
        ? INTERNOS.filter(i => i.sector_actual === user.sector_id && i.estado === 'activo').length
        : 0;
    const sectorCursos = isResponsable()
        ? CURSOS.filter(c => c.sector_id === user.sector_id && c.estado === ESTADOS_CURSO.EN_CURSO).length
        : 0;

    // Approval rate
    const aprobados = INSCRIPCIONES.filter(i => i.calificacion === 'aprobado').length;
    const tasaAprobacion = INSCRIPCIONES.length > 0
        ? Math.round((aprobados / INSCRIPCIONES.length) * 100)
        : 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {isResponsable() ? `Panel — ${user.sectorNombre}` : 'Dashboard'}
                    </h1>
                    <p className="page-description">
                        Bienvenido/a, {user.nombre}. {
                            isAdmin() ? 'Vista general del sistema.' :
                                isCoordinacion() ? 'Vista de coordinación académica.' :
                                    `Gestión del sector ${user.sectorNombre}.`
                        }
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {(isAdmin() || isCoordinacion()) && (
                    <>
                        <div className="stat-card" onClick={() => navigate('/internos')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon blue">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Internos Activos</div>
                                <div className="stat-value">{totalInternos}</div>
                                <div className="stat-change positive">Registrados en sistema</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/cursos')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon teal">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Cursos Activos</div>
                                <div className="stat-value">{cursosActivos}</div>
                                <div className="stat-change positive">{cursosFinalizados} finalizados</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/sectores')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon purple">
                                <Building2 size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Sectores</div>
                                <div className="stat-value">{SECTORES.length}</div>
                                <div className="stat-change positive">Operativos</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <Award size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Certificados</div>
                                <div className="stat-value">{totalCertificados}</div>
                                <div className="stat-change positive">Emitidos</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon yellow">
                                <ClipboardList size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Inscripciones</div>
                                <div className="stat-value">{totalInscripciones}</div>
                                <div className="stat-change positive">Tasa aprob. {tasaAprobacion}%</div>
                            </div>
                        </div>

                        {isCoordinacion() && (
                            <div className="stat-card" style={{ cursor: 'pointer' }}>
                                <div className="stat-icon red">
                                    <BookOpen size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Cursos Pendientes</div>
                                    <div className="stat-value">{cursosPendientes}</div>
                                    <div className="stat-change negative">Requieren aprobación</div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {isResponsable() && (
                    <>
                        <div className="stat-card" onClick={() => navigate('/mi-sector')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon blue">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Internos en mi Sector</div>
                                <div className="stat-value">{sectorInternos}</div>
                                <div className="stat-change positive">Activos</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/cursos')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon teal">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Cursos en mi Sector</div>
                                <div className="stat-value">{sectorCursos}</div>
                                <div className="stat-change positive">En curso</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Tasa de Aprobación</div>
                                <div className="stat-value">{tasaAprobacion}%</div>
                                <div className="stat-change positive">General</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Capacitadores Panel (Coordinación) */}
            {(isCoordinacion() || isAdmin()) && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">
                            <UserCheck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            Capacitadores
                        </h2>
                        <button className="btn btn-primary btn-sm">
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>DNI</th>
                                    <th>Institución</th>
                                    <th>Cursos Asignados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CAPACITADORES.map(cap => {
                                    const cursosAsignados = CURSOS.filter(c => c.capacitador_id === cap.id);
                                    return (
                                        <tr key={cap.id}>
                                            <td style={{ fontWeight: 600 }}>{cap.nombre}</td>
                                            <td>{cap.dni}</td>
                                            <td>{cap.institucion}</td>
                                            <td>
                                                {cursosAsignados.length > 0
                                                    ? cursosAsignados.map(c => (
                                                        <span key={c.id} className="badge badge-info" style={{ marginRight: 4 }}>
                                                            {c.nombre}
                                                        </span>
                                                    ))
                                                    : <span style={{ color: 'var(--gray-400)' }}>Sin cursos</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Courses */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Cursos Recientes</h2>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cursos')}>
                        Ver todos
                    </button>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Tipo</th>
                                <th>Sector</th>
                                <th>Estado</th>
                                <th>Inscriptos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CURSOS
                                .filter(c => isResponsable() ? c.sector_id === user.sector_id : true)
                                .slice(0, 5)
                                .map(curso => {
                                    const sector = SECTORES.find(s => s.id === curso.sector_id);
                                    const inscriptos = INSCRIPCIONES.filter(i => i.curso_id === curso.id).length;
                                    const estadoBadge = {
                                        pendiente: 'badge-warning',
                                        aprobado: 'badge-info',
                                        en_curso: 'badge-success',
                                        finalizado: 'badge-neutral',
                                        archivado: 'badge-neutral'
                                    };
                                    return (
                                        <tr key={curso.id}>
                                            <td style={{ fontWeight: 600 }}>{curso.nombre}</td>
                                            <td>{curso.tipo}</td>
                                            <td>{sector?.nombre || '—'}</td>
                                            <td>
                                                <span className={`badge ${estadoBadge[curso.estado]}`}>
                                                    {ESTADOS_CURSO_LABELS[curso.estado]}
                                                </span>
                                            </td>
                                            <td>{inscriptos} / {curso.cupo_maximo}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inscripciones Recientes - Coordinación */}
            {(isCoordinacion() || isAdmin()) && (
                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">
                            <Activity size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            Inscripciones Recientes por Sector
                        </h2>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/inscripciones')}>
                            Ver todas
                        </button>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Interno</th>
                                    <th>Curso / Sector</th>
                                    <th>Cargado por</th>
                                    <th>Fecha Carga</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {INSCRIPCIONES
                                    .sort((a, b) => new Date(b.fecha_carga || 0) - new Date(a.fecha_carga || 0))
                                    .slice(0, 8)
                                    .map(insc => {
                                        const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);
                                        const curso = CURSOS.find(c => c.id === insc.curso_id);
                                        const sector = curso ? SECTORES.find(s => s.id === curso.sector_id) : null;
                                        const cargador = DEMO_USERS.find(u => u.id === insc.usuario_cargador_id);
                                        const calificacionBadge = insc.calificacion === 'aprobado' ? 'badge-success' :
                                            insc.calificacion === 'desaprobado' ? 'badge-danger' : 'badge-info';
                                        return (
                                            <tr key={insc.id}>
                                                <td>
                                                    <strong style={{ color: 'var(--primary-700)' }}>#{insc.interno_nro}</strong>
                                                </td>
                                                <td style={{ fontSize: 'var(--text-xs)' }}>
                                                    <div style={{ fontWeight: 500 }}>{curso?.nombre || '—'}</div>
                                                    <div style={{ color: 'var(--gray-500)' }}>{sector?.nombre || '—'}</div>
                                                </td>
                                                <td style={{ fontSize: 'var(--text-xs)' }}>
                                                    <div>{cargador?.nombre.split(' ')[0] || `ID: ${insc.usuario_cargador_id}`}</div>
                                                    <div style={{ color: 'var(--gray-500)' }}>({cargador?.rol === 'cargador_datos' ? 'PPL' : cargador?.rol})</div>
                                                </td>
                                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                                    {insc.fecha_carga ? new Date(insc.fecha_carga).toLocaleString('es-AR', {
                                                        day: '2-digit', month: '2-digit', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    }) : '—'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${calificacionBadge}`}>
                                                        {insc.calificacion === 'aprobado' ? 'Aprobado' :
                                                            insc.calificacion === 'desaprobado' ? 'Desaprobado' : 'En Curso'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
