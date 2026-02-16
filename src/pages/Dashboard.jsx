import { useAuth } from '../contexts/AuthContext';
import {
    INTERNOS, CURSOS, SECTORES, INSCRIPCIONES, CERTIFICADOS,
    CAPACITADORES, ESTADOS_CURSO, ESTADOS_CURSO_LABELS, DEMO_USERS, ROLES
} from '../data/mockData';
import {
    Users, BookOpen, Building2, Award, TrendingUp,
    ClipboardList, UserCheck, GraduationCap, Plus, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

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

    // Data for Charts
    const sectorData = SECTORES.map(sector => {
        const count = INTERNOS.filter(i => i.sector_actual === sector.id && i.estado === 'activo').length;
        return { name: sector.nombre, value: count };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    const COLORS = ['#3b69b4', '#00c1ab', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

    // Group inscriptions by month (mock data assumption: fecha_inscripcion exists)
    const inscripcionesPorMes = INSCRIPCIONES.reduce((acc, curr) => {
        const date = new Date(curr.fecha_inscripcion);
        const key = date.toLocaleString('es-AR', { month: 'short' }); // e.g., 'feb'
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // Convert to array for Recharts
    const inscripcionesData = Object.keys(inscripcionesPorMes).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        inscripciones: inscripcionesPorMes[key]
    }));


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
                        <div className="stat-card" onClick={() => navigate('/internos')} style={{ cursor: 'pointer', borderTopColor: 'var(--primary-500)' }}>
                            <div className="stat-icon blue">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Internos Activos</div>
                                <div className="stat-value">{totalInternos}</div>
                                <div className="stat-change positive">Registrados en sistema</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/cursos')} style={{ cursor: 'pointer', borderTopColor: 'var(--accent-500)' }}>
                            <div className="stat-icon teal">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Cursos Activos</div>
                                <div className="stat-value">{cursosActivos}</div>
                                <div className="stat-change positive">{cursosFinalizados} finalizados</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/sectores')} style={{ cursor: 'pointer', borderTopColor: '#8b5cf6' }}>
                            <div className="stat-icon purple">
                                <Building2 size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Sectores</div>
                                <div className="stat-value">{SECTORES.length}</div>
                                <div className="stat-change positive">Operativos</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderTopColor: 'var(--success)' }}>
                            <div className="stat-icon green">
                                <Award size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Certificados</div>
                                <div className="stat-value">{totalCertificados}</div>
                                <div className="stat-change positive">Emitidos</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderTopColor: 'var(--warning)' }}>
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
                            <div className="stat-card" style={{ cursor: 'pointer', borderTopColor: 'var(--danger)' }}>
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
                        <div className="stat-card" onClick={() => navigate('/mi-sector')} style={{ cursor: 'pointer', borderTopColor: 'var(--primary-500)' }}>
                            <div className="stat-icon blue">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Internos en mi Sector</div>
                                <div className="stat-value">{sectorInternos}</div>
                                <div className="stat-change positive">Activos</div>
                            </div>
                        </div>

                        <div className="stat-card" onClick={() => navigate('/cursos')} style={{ cursor: 'pointer', borderTopColor: 'var(--accent-500)' }}>
                            <div className="stat-icon teal">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Cursos en mi Sector</div>
                                <div className="stat-value">{sectorCursos}</div>
                                <div className="stat-change positive">En curso</div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderTopColor: 'var(--success)' }}>
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

            {/* Charts Section */}
            {(isAdmin() || isCoordinacion()) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    {/* Gráfico de Distribución de Internos */}
                    <div className="card" style={{ borderTop: '4px solid var(--primary-500)' }}>
                        <div className="card-header">
                            <h2 className="card-title">Distribución de Internos</h2>
                        </div>
                        <div className="card-body" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sectorData}
                                        cx="40%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sectorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Evolución de Inscripciones */}
                    <div className="card" style={{ borderTop: '4px solid var(--accent-500)' }}>
                        <div className="card-header">
                            <h2 className="card-title">Evolución de Inscripciones</h2>
                        </div>
                        <div className="card-body" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={inscripcionesData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="inscripciones" fill="var(--primary-500)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

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
