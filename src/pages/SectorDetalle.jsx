import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    SECTORES, CURSOS, INSCRIPCIONES, DEMO_USERS, ROLES,
    ESTADOS_CURSO, ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES, CAPACITADORES
} from '../data/mockData';
import { getInternos } from '../data/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, Users, BookOpen, UserCheck, Building2, Eye, Plus, XCircle, Download, ClipboardList
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

export default function SectorDetalle() {
    const INTERNOS = getInternos();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('internos');
    const [showFormInscripcion, setShowFormInscripcion] = useState(false);
    const [inscripcionesList, setInscripcionesList] = useState(INSCRIPCIONES);
    const [newInsc, setNewInsc] = useState({ interno_nro: '', curso_id: '' });

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
    const sectorInscripciones = inscripcionesList.filter(i => {
        const curso = CURSOS.find(c => c.id === i.curso_id);
        return curso?.sector_id === sector.id;
    });

    const cursosDisponibles = sectorCursos.filter(c =>
        c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO
    );

    const internosDisponibles = INTERNOS.filter(i => i.estado === 'activo');

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

    const handleGenerarCertificado = (insc) => {
        const curso = CURSOS.find(c => c.id === insc.curso_id);
        const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);

        if (!interno || !curso) return;

        const codigo = `CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        const certificadoTexto = `
CERTIFICADO DE ASISTENCIA Y APROBACIÓN

Certificamos que ${interno.nombre_completo}
DNI/Interno: ${insc.interno_nro}
Ha completado satisfactoriamente el curso:

${curso.nombre}

Tipo: ${curso.tipo}
Carga Horaria: ${curso.carga_horaria} horas
Período: ${insc.fecha_inicio_curso || '—'} a ${insc.fecha_fin_curso || '—'}
Sector: ${sector?.nombre}

Calificación: APROBADO
Código de Certificado: ${codigo}
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}

---
Sistema de Gestión Académica - Unidad 9 La Plata
        `;

        const elemento = document.createElement('a');
        elemento.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(certificadoTexto));
        elemento.setAttribute('download', `Certificado_${insc.interno_nro}_${codigo}.txt`);
        elemento.style.display = 'none';
        document.body.appendChild(elemento);
        elemento.click();
        document.body.removeChild(elemento);
    };

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
                <button className={`tab ${activeTab === 'inscripciones' ? 'active' : ''}`} onClick={() => setActiveTab('inscripciones')}>
                    <ClipboardList size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Inscripciones ({sectorInscripciones.length})
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

                                    const puedeGenerarCertificado = insc.calificacion === 'aprobado' &&
                                        curso && (curso.estado === ESTADOS_CURSO.APROBADO || curso.estado === ESTADOS_CURSO.FINALIZADO);

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
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => navigate(`/internos/${insc.interno_nro}`)}
                                                        title="Ver ficha del interno"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {puedeGenerarCertificado && (
                                                        <button
                                                            className="btn btn-icon btn-sm"
                                                            style={{
                                                                background: 'var(--success)',
                                                                color: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => handleGenerarCertificado(insc)}
                                                            title="Descargar certificado"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </div>
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
                                    <SearchableSelect
                                        options={internosDisponibles.map(i => ({
                                            value: i.numero_interno,
                                            label: `#${i.numero_interno} — ${i.nombre_completo}`,
                                            sublabel: i.dni ? `DNI ${i.dni}` : null
                                        }))}
                                        value={newInsc.interno_nro}
                                        onChange={val => setNewInsc({ ...newInsc, interno_nro: val })}
                                        placeholder="Escribí nombre o Nº de interno..."
                                        required
                                    />
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
