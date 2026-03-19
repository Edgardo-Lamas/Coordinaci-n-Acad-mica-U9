import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SECTORES, ESTADOS_CURSO, ESTADOS_CURSO_LABELS, ESTADOS_CURSO_BADGES, DEMO_USERS } from '../data/mockData';
import { getInternos, getCursos, getCapacitadores, saveInternos, getInscripciones, saveInscripciones, exportSectorData, addAuditLog, addCorrectionRequest, importInternosFromExcel, reconciliarInternos } from '../data/dataService';
import { useCicloLectivo } from '../contexts/CicloLectivoContext';
import { Users, BookOpen, Building2, Eye, ClipboardList, Plus, XCircle, Download, Upload, Flag, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI?.isElectron === true;

export default function MiSector() {
    const INTERNOS = getInternos();
    const CURSOS = getCursos();
    const CAPACITADORES = getCapacitadores();
    const { user } = useAuth();
    const { cicloActivo, CURRENT_YEAR } = useCicloLectivo();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('internos');
    const [showFormInscripcion, setShowFormInscripcion] = useState(false);
    const [inscripcionesList, setInscripcionesList] = useState(() => getInscripciones());
    const [newInsc, setNewInsc] = useState({ nombre: '', dni: '', whatsapp: '', curso_id: '' });
    const [flagModal, setFlagModal] = useState(null); // { insc, motivo }
    const [flagEnviada, setFlagEnviada] = useState(null); // id de inscripción con bandera enviada
    const [reporteListo, setReporteListo] = useState(false);
    const [watchedFolder, setWatchedFolder] = useState('');
    const [excelToast, setExcelToast] = useState(null);

    useEffect(() => {
        if (!IS_ELECTRON) return;
        window.electronAPI.sector.onReporteReady(() => setReporteListo(true));
        return () => window.electronAPI.sector.removeReporteListener();
    }, []);

    useEffect(() => {
        if (!IS_ELECTRON) return;
        window.electronAPI.watchFolder.getFolder().then(f => setWatchedFolder(f || ''));
        window.electronAPI.watchFolder.onNewExcel(async (filePath, filename) => {
            try {
                const buf = await window.electronAPI.watchFolder.readFile(filePath);
                const data = new Uint8Array(buf);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                const result = importInternosFromExcel(rows);
                const recon = reconciliarInternos();
                addAuditLog(user, 'IMPORTAR_INTERNOS_AUTO', 'Interno',
                    `Importación automática ${filename}: ${result.imported} importados, ${recon.reconciliados} reconciliados`);
                setExcelToast({ msg: `${filename}: ${result.imported} internos cargados, ${recon.reconciliados} reconciliados`, type: 'success' });
                setTimeout(() => setExcelToast(null), 8000);
            } catch (err) {
                setExcelToast({ msg: `Error al importar ${filename}: ${err.message}`, type: 'error' });
                setTimeout(() => setExcelToast(null), 6000);
            }
        });
        return () => window.electronAPI.watchFolder.removeListener();
    }, []);

    const handleConfigFolder = async () => {
        const folder = await window.electronAPI.watchFolder.openDialog();
        if (folder) {
            await window.electronAPI.watchFolder.setFolder(folder);
            setWatchedFolder(folder);
        }
    };

    const sector = SECTORES.find(s => s.id === user.sector_id);
    const sectorInternos = INTERNOS.filter(i => i.sector_actual === user.sector_id && i.estado === 'activo');
    const sectorCursos = CURSOS.filter(c => {
        if (c.sector_id !== user.sector_id) return false;
        return c.fecha_inicio ? c.fecha_inicio.startsWith(cicloActivo) : cicloActivo === CURRENT_YEAR;
    });
    const sectorInscripciones = inscripcionesList.filter(i => {
        const matchSector = i.sector_id != null ? i.sector_id === user.sector_id : CURSOS.find(c => c.id === i.curso_id)?.sector_id === user.sector_id;
        const matchCiclo = i.fecha_inicio_curso ? i.fecha_inicio_curso.startsWith(cicloActivo) : cicloActivo === CURRENT_YEAR;
        return matchSector && matchCiclo;
    });

    const cursosDisponibles = sectorCursos.filter(c =>
        c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO
    );

    const handleCreateInscripcion = (e) => {
        e.preventDefault();
        const cursoId = Number(newInsc.curso_id);
        const curso = CURSOS.find(c => c.id === cursoId);
        const dniLimpio = newInsc.dni.trim();
        const nombreLimpio = newInsc.nombre.trim();

        // Buscar por DNI; si no existe, registrarlo (número de interno = DNI hasta reconciliación)
        const allInternos = getInternos();
        const yaExiste = allInternos.find(i => String(i.dni) === String(dniLimpio));
        let nroRef;
        if (!yaExiste) {
            nroRef = dniLimpio; // DNI como identificador temporal
            saveInternos([...allInternos, {
                numero_interno: dniLimpio,
                nombre_completo: nombreLimpio,
                dni: dniLimpio,
                whatsapp: newInsc.whatsapp.trim() || '',
                estado: 'activo',
                sector_actual: user.sector_id,
                pendiente_reconciliacion: true,
            }]);
        } else {
            nroRef = yaExiste.numero_interno;
            saveInternos(allInternos.map(i =>
                String(i.dni) === String(dniLimpio)
                    ? { ...i, sector_actual: user.sector_id }
                    : i
            ));
        }

        const nuevaCarga = {
            id: inscripcionesList.length + 1,
            interno_nro: nroRef,
            curso_id: cursoId,
            sector_id: user.sector_id,
            calificacion: 'en_curso',
            observaciones: '',
            fecha_inscripcion: new Date().toISOString().split('T')[0],
            usuario_cargador_id: user.id,
            fecha_carga: new Date().toISOString(),
            fecha_inicio_curso: curso?.fecha_inicio || '',
            fecha_fin_curso: curso?.fecha_fin || ''
        };
        const updatedInsc = [...inscripcionesList, nuevaCarga];
        setInscripcionesList(updatedInsc);
        saveInscripciones(updatedInsc);

        setShowFormInscripcion(false);
        setNewInsc({ nombre: '', dni: '', whatsapp: '', curso_id: '' });
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

    const handleEnviarBandera = () => {
        if (!flagModal) return;
        const { insc, motivo } = flagModal;
        const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);
        const curso = CURSOS.find(c => c.id === insc.curso_id);
        addCorrectionRequest({
            registro_id: insc.id,
            registro_desc: `${interno?.nombre_completo || `Interno #${insc.interno_nro}`} — ${curso?.nombre || `Curso #${insc.curso_id}`}`,
            campo: 'eliminar_inscripcion',
            valor_actual: insc.calificacion || '',
            valor_propuesto: '',
            motivo: motivo || 'Sin especificar',
            solicitante_nombre: user.nombre,
            solicitante_id: user.id,
        });
        addAuditLog(user, 'SOLICITAR_CORRECCION', 'Inscripción', `Bandera enviada para inscripción #${insc.id}: ${interno?.nombre_completo} — ${curso?.nombre}`);
        setFlagEnviada(insc.id);
        setFlagModal(null);
    };

    const handleExportar = () => {
        const datos = exportSectorData(user.sector_id, sector?.nombre || `Sector ${user.sector_id}`, user.nombre);
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const fecha = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `sector-${(sector?.nombre || user.sector_id).replace(/\s+/g, '_')}-${fecha}.json`;
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addAuditLog(user, 'EXPORTAR_SECTOR', 'Sector',
            `Exportó datos del sector ${sector?.nombre}: ${datos.inscripciones.length} inscripciones, ${datos.cursos.length} cursos`
        );
    };

    const handleGenerarCertificado = (insc) => {
        const curso = CURSOS.find(c => c.id === insc.curso_id);
        const interno = INTERNOS.find(i => i.numero_interno === insc.interno_nro);

        if (!interno || !curso) return;

        // Generar código único de certificado
        const codigo = `CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Simular descarga de certificado (en producción sería PDF con jsPDF)
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

        // Descargar como archivo de texto (en producción sería PDF)
        const elemento = document.createElement('a');
        elemento.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(certificadoTexto));
        elemento.setAttribute('download', `${codigo}_${interno.nombre_completo}.txt`);
        elemento.style.display = 'none';
        document.body.appendChild(elemento);
        elemento.click();
        document.body.removeChild(elemento);
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
                <button
                    className={`btn btn-sm ${reporteListo ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => { handleExportar(); setReporteListo(false); }}
                    title="Exportar datos del sector para enviar a Coordinación"
                >
                    <Upload size={16} /> Exportar sector
                </button>
            </div>

            {reporteListo && (
                <div style={{
                    background: 'var(--warning, #d97706)', color: '#fff',
                    borderRadius: 8, padding: '12px 20px', marginBottom: 'var(--space-4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    boxShadow: '0 2px 8px rgba(217,119,6,0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                        <Upload size={18} />
                        Reporte semanal listo — exportá los datos y envialos a Coordinación
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ background: '#fff', color: '#d97706', fontWeight: 700 }}
                            onClick={() => { handleExportar(); setReporteListo(false); }}>
                            Exportar ahora
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }}
                            onClick={() => setReporteListo(false)}>✕</button>
                    </div>
                </div>
            )}

            {IS_ELECTRON && (
                <div className="card" style={{ marginBottom: 'var(--space-4)', borderLeft: '4px solid var(--primary-300)' }}>
                    <div className="card-body" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FolderOpen size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                    Carpeta de actualización de internos
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: watchedFolder ? 'var(--gray-500)' : 'var(--gray-400)', fontFamily: watchedFolder ? 'monospace' : 'inherit' }}>
                                    {watchedFolder || 'Sin carpeta configurada — guardá el Excel de Jefatura aquí para importarlo automáticamente'}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleConfigFolder}>
                            <FolderOpen size={14} /> {watchedFolder ? 'Cambiar carpeta' : 'Configurar carpeta'}
                        </button>
                    </div>
                </div>
            )}

            {excelToast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    background: excelToast.type === 'success' ? '#16a34a' : '#dc2626',
                    color: '#fff', borderRadius: 8, padding: '12px 20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: 420,
                    fontSize: 'var(--text-sm)', fontWeight: 500
                }}>
                    {excelToast.msg}
                </div>
            )}

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

                                    // Determine if certificate can be generated
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
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        style={{ color: flagEnviada === insc.id ? 'var(--gray-400)' : '#dc2626' }}
                                                        onClick={() => flagEnviada !== insc.id && setFlagModal({ insc, motivo: '' })}
                                                        title={flagEnviada === insc.id ? 'Bandera ya enviada' : 'Reportar error a Coordinación'}
                                                    >
                                                        <Flag size={16} />
                                                    </button>
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
                                    <label className="form-label">DNI *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Número de DNI"
                                        value={newInsc.dni}
                                        onChange={e => {
                                            const dni = e.target.value;
                                            const enc = INTERNOS.find(i => String(i.dni) === String(dni.trim()));
                                            setNewInsc({
                                                ...newInsc,
                                                dni,
                                                nombre: enc ? enc.nombre_completo : newInsc.nombre,
                                                whatsapp: enc?.whatsapp || newInsc.whatsapp,
                                            });
                                        }}
                                        required
                                        autoFocus
                                    />
                                    {newInsc.dni.trim() && INTERNOS.find(i => String(i.dni) === String(newInsc.dni.trim())) && (
                                        <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 'var(--text-xs)', color: '#166534' }}>
                                            ✓ Ya registrado — datos completados automáticamente
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nombre completo *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Apellido y nombre"
                                        value={newInsc.nombre}
                                        onChange={e => setNewInsc({ ...newInsc, nombre: e.target.value })}
                                        required
                                        readOnly={!!INTERNOS.find(i => String(i.dni) === String(newInsc.dni.trim()))}
                                        style={INTERNOS.find(i => String(i.dni) === String(newInsc.dni.trim())) ? { background: 'var(--gray-50)', color: 'var(--gray-600)' } : undefined}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        WhatsApp <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>opcional</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ej: 2214567890"
                                        value={newInsc.whatsapp}
                                        onChange={e => setNewInsc({ ...newInsc, whatsapp: e.target.value })}
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

            {/* Modal bandera de error */}
            {flagModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                                <Flag size={18} /> Reportar error a Coordinación
                            </h2>
                            <button className="modal-close" onClick={() => setFlagModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                                Esta inscripción será marcada para revisión. Coordinación podrá eliminarla si corresponde.
                                <strong> Vos no podés eliminarla directamente.</strong>
                            </p>
                            <div className="form-group">
                                <label className="form-label">Motivo del error</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Ej: Inscripción duplicada, interno equivocado, curso incorrecto..."
                                    value={flagModal.motivo}
                                    onChange={e => setFlagModal(f => ({ ...f, motivo: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setFlagModal(null)}>Cancelar</button>
                            <button
                                className="btn btn-danger"
                                onClick={handleEnviarBandera}
                                disabled={!flagModal.motivo.trim()}
                            >
                                <Flag size={16} /> Enviar bandera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
