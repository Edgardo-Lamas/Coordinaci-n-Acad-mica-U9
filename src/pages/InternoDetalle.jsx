import { useParams, useNavigate } from 'react-router-dom';
import { SECTORES } from '../data/mockData';
import { getInternos, getCursos, getCapacitadores, getInscripciones } from '../data/dataService';
import {
    ArrowLeft, User, Calendar, Building2, BookOpen, Award, Hash, CreditCard
} from 'lucide-react';

export default function InternoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const INTERNOS = getInternos();
    const CURSOS = getCursos();
    const CAPACITADORES = getCapacitadores();

    const interno = INTERNOS.find(i => i.numero_interno === id);

    if (!interno) {
        return (
            <div className="empty-state">
                <User size={64} className="empty-icon" />
                <div className="empty-title">Interno no encontrado</div>
                <div className="empty-text">
                    No se encontró un interno con el número #{id}
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/internos')} style={{ marginTop: 16 }}>
                    Volver a Internos
                </button>
            </div>
        );
    }

    const sector = SECTORES.find(s => s.id === interno.sector_actual);

    // Get all inscriptions for this intern
    const internoInscripciones = getInscripciones().filter(
        i => i.interno_nro === interno.numero_interno
    );

    const cursosDelInterno = internoInscripciones.map(insc => {
        const curso = CURSOS.find(c => c.id === insc.curso_id);
        const capacitador = curso ? CAPACITADORES.find(cap => cap.id === curso.capacitador_id) : null;
        const sectorCurso = curso ? SECTORES.find(s => s.id === curso.sector_id) : null;
        return {
            ...insc,
            curso,
            capacitador,
            sectorCurso
        };
    });

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
            {/* Back button */}
            <button
                className="btn btn-ghost"
                onClick={() => navigate('/internos')}
                style={{ marginBottom: 'var(--space-4)' }}
            >
                <ArrowLeft size={18} /> Volver a Internos
            </button>

            {/* Profile Header */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {interno.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="profile-info">
                            <h1 className="profile-name">{interno.nombre_completo}</h1>
                            <div className="profile-meta">
                                <div className="profile-meta-item">
                                    <Hash size={14} />
                                    <span>Nº {interno.numero_interno}</span>
                                </div>
                                {interno.dni && (
                                    <div className="profile-meta-item">
                                        <CreditCard size={14} />
                                        <span>DNI {interno.dni}</span>
                                    </div>
                                )}
                                <div className="profile-meta-item">
                                    <Building2 size={14} />
                                    <span>{sector?.nombre || 'Sin sector'}</span>
                                </div>
                                <div className="profile-meta-item">
                                    <Calendar size={14} />
                                    <span>Ingreso: {new Date(interno.fecha_ingreso).toLocaleDateString('es-AR')}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`badge ${interno.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                            {interno.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Cursos Totales</div>
                        <div className="stat-value">{cursosDelInterno.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Aprobados</div>
                        <div className="stat-value">
                            {cursosDelInterno.filter(c => c.calificacion === 'aprobado').length}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon teal">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">En Curso</div>
                        <div className="stat-value">
                            {cursosDelInterno.filter(c => c.calificacion === 'en_curso').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic History */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Historial Académico</h2>
                </div>
                {cursosDelInterno.length > 0 ? (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Tipo</th>
                                    <th>Sector</th>
                                    <th>Capacitador</th>
                                    <th>Carga Horaria</th>
                                    <th>Inscripción</th>
                                    <th>Calificación</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursosDelInterno.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.curso?.nombre || '—'}</td>
                                        <td>{item.curso?.tipo || '—'}</td>
                                        <td>{item.sectorCurso?.nombre || '—'}</td>
                                        <td>{item.capacitador?.nombre || '—'}</td>
                                        <td>{item.curso?.carga_horaria || '—'}h</td>
                                        <td>{new Date(item.fecha_inscripcion).toLocaleDateString('es-AR')}</td>
                                        <td>
                                            <span className={`badge ${getCalificacionBadge(item.calificacion)}`}>
                                                {getCalificacionLabel(item.calificacion)}
                                            </span>
                                        </td>
                                        <td>{item.observaciones || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="card-body">
                        <div className="empty-state">
                            <BookOpen size={48} className="empty-icon" />
                            <div className="empty-title">Sin historial académico</div>
                            <div className="empty-text">
                                Este interno no tiene cursos registrados.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
