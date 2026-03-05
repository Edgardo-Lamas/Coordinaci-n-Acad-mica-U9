import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SECTORES } from '../data/mockData';
import { getInternos, getCursos, getCapacitadores, getInscripciones, saveInscripciones, createCertificadoPendiente, getCertificados, updateInternoWhatsapp, addAuditLog } from '../data/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, User, Calendar, Building2, BookOpen, Award, Hash, CreditCard, Clock, MessageCircle, Pencil, Check, X
} from 'lucide-react';

export default function InternoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isResponsable, isCargador } = useAuth();
    const INTERNOS = getInternos();
    const CURSOS = getCursos();
    const CAPACITADORES = getCapacitadores();
    const [inscripcionesList, setInscripcionesList] = useState(() => getInscripciones());
    const certificadosList = getCertificados();
    const [toast, setToast] = useState(null);
    const [waContacto, setWaContacto] = useState(() => {
        const found = getInternos().find(i => i.numero_interno === id);
        return found?.whatsapp_contacto || '';
    });
    const [editingWa, setEditingWa] = useState(false);
    const [waValue, setWaValue] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleCalifChange = (inscId, newCalif) => {
        const insc = inscripcionesList.find(i => i.id === inscId);
        if (!insc) return;
        const prevCalif = insc.calificacion;
        const updated = inscripcionesList.map(i =>
            i.id === inscId ? { ...i, calificacion: newCalif } : i
        );
        setInscripcionesList(updated);
        saveInscripciones(updated);
        if (newCalif === 'aprobado' && prevCalif !== 'aprobado') {
            createCertificadoPendiente(inscId);
            const curso = CURSOS.find(c => c.id === insc.curso_id);
            const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);
            addAuditLog(user, 'APROBAR_INSCRIPCION', 'Inscripcion', `${interno?.nombre_completo || insc.interno_nro} aprobado en "${curso?.nombre || insc.curso_id}"`);
            showToast('Certificado enviado a Coordinación para aprobación');
        }
    };

    const handleSaveWa = (e) => {
        e.preventDefault();
        updateInternoWhatsapp(id, waValue);
        setWaContacto(waValue);
        setEditingWa(false);
    };

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
    const internoInscripciones = inscripcionesList.filter(
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
                onClick={() => navigate(-1)}
                style={{ marginBottom: 'var(--space-4)' }}
            >
                <ArrowLeft size={18} /> Volver
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
                                <div className="profile-meta-item">
                                    <MessageCircle size={14} style={{ color: '#25D366', flexShrink: 0 }} />
                                    {editingWa ? (
                                        <form onSubmit={handleSaveWa} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            <input
                                                className="form-input"
                                                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)', height: 28, width: 180 }}
                                                placeholder="Ej: 5491123456789"
                                                value={waValue}
                                                onChange={e => setWaValue(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="submit" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--success)' }}>
                                                <Check size={14} />
                                            </button>
                                            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditingWa(false)}>
                                                <X size={14} />
                                            </button>
                                        </form>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ color: waContacto ? 'inherit' : 'var(--gray-400)' }}>
                                                {waContacto || 'Sin WhatsApp familiar'}
                                            </span>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                style={{ padding: 2, height: 'auto', width: 'auto', minWidth: 'unset' }}
                                                onClick={() => { setWaValue(waContacto); setEditingWa(true); }}
                                                title="Editar WhatsApp del familiar"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                        </span>
                                    )}
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
                                    <th>Certificado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursosDelInterno.map(item => {
                                    const cert = certificadosList.find(c => c.inscripcion_id === item.id);
                                    // Responsable/Cargador solo cambia estados de su propio sector
                                    const puedeEditar = !isResponsable() && !isCargador()
                                        ? true
                                        : item.curso?.sector_id === user.sector_id;
                                    return (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.curso?.nombre || '—'}</td>
                                        <td>{item.curso?.tipo || '—'}</td>
                                        <td>{item.sectorCurso?.nombre || '—'}</td>
                                        <td>{item.capacitador?.nombre || '—'}</td>
                                        <td>{item.curso?.carga_horaria || '—'}h</td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                            {new Date(item.fecha_inscripcion).toLocaleDateString('es-AR')}
                                        </td>
                                        <td>
                                            {puedeEditar ? (
                                                <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                                                    <button
                                                        className={`btn btn-sm ${item.calificacion === 'en_curso' ? 'btn-primary' : 'btn-ghost'}`}
                                                        onClick={() => handleCalifChange(item.id, 'en_curso')}
                                                    >En Curso</button>
                                                    <button
                                                        className={`btn btn-sm ${item.calificacion === 'aprobado' ? 'btn-success' : 'btn-ghost'}`}
                                                        onClick={() => handleCalifChange(item.id, 'aprobado')}
                                                    >Aprobado</button>
                                                    <button
                                                        className={`btn btn-sm ${item.calificacion === 'desaprobado' ? 'btn-danger' : 'btn-ghost'}`}
                                                        onClick={() => handleCalifChange(item.id, 'desaprobado')}
                                                    >Desaprobado</button>
                                                </div>
                                            ) : (
                                                <span className={`badge ${getCalificacionBadge(item.calificacion)}`}>
                                                    {getCalificacionLabel(item.calificacion)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {!cert && <span style={{ color: 'var(--gray-400)', fontSize: 'var(--text-xs)' }}>—</span>}
                                            {cert?.estado === 'emitido' && (
                                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Award size={11} /> Emitido
                                                </span>
                                            )}
                                            {cert?.estado === 'pendiente' && (
                                                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={11} /> Pend. coord.
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
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

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 500,
                    background: '#166534', color: '#fff',
                    padding: '12px 20px', borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 'var(--text-sm)', fontFamily: 'sans-serif'
                }}>
                    <Award size={16} />
                    {toast}
                </div>
            )}
        </div>
    );
}
