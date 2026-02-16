import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    SECTORES, INTERNOS, CURSOS, INSCRIPCIONES, DEMO_USERS, ROLES,
    ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES, CAPACITADORES
} from '../data/mockData';
import {
    ArrowLeft, Users, BookOpen, UserCheck, Building2, Eye
} from 'lucide-react';

export default function SectorDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('internos');

    const sector = SECTORES.find(s => s.id === Number(id));

    if (!sector) {
        return (
            <div className="empty-state">
                <Building2 size={64} className="empty-icon" />
                <div className="empty-title">Sector no encontrado</div>
                <button className="btn btn-primary" onClick={() => navigate('/sectores')} style={{ marginTop: 16 }}>
                    Volver a Sectores
                </button>
            </div>
        );
    }

    const sectorInternos = INTERNOS.filter(i => i.sector_actual === sector.id);
    const sectorCursos = CURSOS.filter(c => c.sector_id === sector.id);
    const sectorResponsables = DEMO_USERS.filter(u => u.rol === ROLES.RESPONSABLE && u.sector_id === sector.id);

    return (
        <div>
            <button className="btn btn-ghost" onClick={() => navigate('/sectores')} style={{ marginBottom: 'var(--space-4)' }}>
                <ArrowLeft size={18} /> Volver a Sectores
            </button>

            {/* Header */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Building2 size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{sector.nombre}</h1>
                            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{sector.descripcion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Internos</div>
                        <div className="stat-value">{sectorInternos.filter(i => i.estado === 'activo').length}</div>
                        <div className="stat-change positive">{sectorInternos.length} total</div>
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
                    <div className="stat-icon green"><UserCheck size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Responsables</div>
                        <div className="stat-value">{sectorResponsables.length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'internos' ? 'active' : ''}`} onClick={() => setActiveTab('internos')}>
                    <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Internos ({sectorInternos.length})
                </button>
                <button className={`tab ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
                    <BookOpen size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Cursos ({sectorCursos.length})
                </button>
                <button className={`tab ${activeTab === 'responsables' ? 'active' : ''}`} onClick={() => setActiveTab('responsables')}>
                    <UserCheck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Responsables ({sectorResponsables.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'internos' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nº Interno</th>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Fecha Ingreso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectorInternos.length > 0 ? sectorInternos.map(interno => (
                                <tr key={interno.numero_interno}>
                                    <td><strong style={{ color: 'var(--primary-700)' }}>#{interno.numero_interno}</strong></td>
                                    <td style={{ fontWeight: 500 }}>{interno.nombre_completo}</td>
                                    <td>
                                        <span className={`badge ${interno.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                                            {interno.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>{new Date(interno.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/internos/${interno.numero_interno}`)}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5}><div className="empty-state"><div className="empty-title">Sin internos en este sector</div></div></td></tr>
                            )}
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
                                <th>Inscriptos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectorCursos.length > 0 ? sectorCursos.map(curso => {
                                const cap = CAPACITADORES.find(c => c.id === curso.capacitador_id);
                                const inscriptos = INSCRIPCIONES.filter(i => i.curso_id === curso.id).length;
                                return (
                                    <tr key={curso.id}>
                                        <td style={{ fontWeight: 600 }}>{curso.nombre}</td>
                                        <td>{curso.tipo}</td>
                                        <td>{cap?.nombre || '—'}</td>
                                        <td>{curso.carga_horaria}h</td>
                                        <td><span className={`badge ${ESTADOS_CURSO_BADGES[curso.estado]}`}>{ESTADOS_CURSO_LABELS[curso.estado]}</span></td>
                                        <td>{inscriptos} / {curso.cupo_maximo}</td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={6}><div className="empty-state"><div className="empty-title">Sin cursos en este sector</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'responsables' && (
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {sectorResponsables.length > 0 ? sectorResponsables.map(resp => (
                        <div key={resp.id} className="card">
                            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 'var(--radius-full)',
                                    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700
                                }}>
                                    {resp.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{resp.nombre}</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{resp.email}</div>
                                </div>
                                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Responsable</span>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <div className="empty-title">Sin responsables asignados</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
