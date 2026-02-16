import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SECTORES, INTERNOS, CURSOS, INSCRIPCIONES, ESTADOS_CURSO, ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES, CAPACITADORES } from '../data/mockData';
import { Users, BookOpen, Building2, Eye, ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function MiSector() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('internos');

    const sector = SECTORES.find(s => s.id === user.sector_id);
    const sectorInternos = INTERNOS.filter(i => i.sector_actual === user.sector_id && i.estado === 'activo');
    const sectorCursos = CURSOS.filter(c => c.sector_id === user.sector_id);
    const sectorInscripciones = INSCRIPCIONES.filter(i => {
        const curso = CURSOS.find(c => c.id === i.curso_id);
        return curso?.sector_id === user.sector_id;
    });

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
        </div>
    );
}
