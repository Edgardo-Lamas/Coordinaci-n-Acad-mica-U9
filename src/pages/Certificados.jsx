import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SECTORES } from '../data/mockData';
import {
    getCertificados, emitirCertificados,
    getInscripciones, getCursos, getInternos, getCapacitadores,
    getWhatsappConfig, saveWhatsappConfig, addAuditLog
} from '../data/dataService';
import { Award, CheckCircle, Clock, MessageCircle, Printer, Settings, Download, Globe } from 'lucide-react';
import CertificadoModal from '../components/CertificadoModal';
import { exportCertificados } from '../utils/exportExcel';

export default function Certificados() {
    const { user, isAdmin, isCoordinacion } = useAuth();
    const canEmit = isAdmin() || isCoordinacion();

    const [certificados, setCertificados] = useState(() => getCertificados());
    const [tab, setTab] = useState('pendientes');
    const [selectedCodigos, setSelectedCodigos] = useState([]);
    const [previewCert, setPreviewCert] = useState(null);
    const [whatsappNumber, setWhatsappNumber] = useState(() => getWhatsappConfig());
    const [showWhatsappConfig, setShowWhatsappConfig] = useState(false);

    const inscripciones = getInscripciones();
    const cursos = getCursos();
    const internos = getInternos();
    const capacitadores = getCapacitadores();

    const enrichCert = (cert) => {
        const inscripcion = inscripciones.find(i => i.id === cert.inscripcion_id);
        const curso = inscripcion ? cursos.find(c => c.id === inscripcion.curso_id) : null;
        const interno = inscripcion ? internos.find(i => i.numero_interno === inscripcion.interno_nro) : null;
        const sector = curso ? SECTORES.find(s => s.id === curso.sector_id) : null;
        const capacitador = curso ? capacitadores.find(u => u.id === curso.capacitador_id) : null;
        return { ...cert, inscripcion, curso, interno, sector, capacitador };
    };

    const enriched = certificados.map(enrichCert);
    const pendientes = enriched.filter(c => c.estado === 'pendiente');
    const emitidos = enriched.filter(c => c.estado === 'emitido');

    const toggleSelect = (codigo) => {
        setSelectedCodigos(prev =>
            prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCodigos.length === pendientes.length) {
            setSelectedCodigos([]);
        } else {
            setSelectedCodigos(pendientes.map(c => c.codigo));
        }
    };

    const handleEmitirBulk = () => {
        if (selectedCodigos.length === 0) return;
        const updated = emitirCertificados(selectedCodigos);
        setCertificados(updated);
        addAuditLog(user, 'EMITIR_CERTIFICADO', 'Certificado', `Emisión bulk de ${selectedCodigos.length} certificado(s): ${selectedCodigos.join(', ')}`);
        setSelectedCodigos([]);
        setTab('historial');
    };

    const handleEmitirUno = (codigo) => {
        const updated = emitirCertificados([codigo]);
        setCertificados(updated);
        addAuditLog(user, 'EMITIR_CERTIFICADO', 'Certificado', `Emisión individual: ${codigo}`);
        setTab('historial');
        const certEmitido = updated.map(enrichCert).find(c => c.codigo === codigo);
        if (certEmitido) setPreviewCert(certEmitido);
    };

    const handlePublicar = () => {
        const certificadosPublicos = emitidos.map(cert => ({
            codigo: cert.codigo,
            hash_integridad: cert.hash_integridad || '',
            fecha_emision: cert.fecha_emision || '',
            nombre_interno: cert.interno?.nombre_completo || '',
            dni_interno: cert.interno?.dni || '',
            curso_nombre: cert.curso?.nombre || '',
            curso_tipo: cert.curso?.tipo || '',
            curso_carga_horaria: cert.curso?.carga_horaria || '',
            fecha_inicio_curso: cert.inscripcion?.fecha_inicio_curso || '',
            fecha_fin_curso: cert.inscripcion?.fecha_fin_curso || '',
            sector_nombre: cert.sector?.nombre || '',
        }));
        const payload = {
            version: '1.0',
            actualizado: new Date().toISOString(),
            certificados: certificadosPublicos,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificados-publicos.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addAuditLog(user, 'PUBLICAR_CERTIFICADOS', 'Certificado', `Exportó ${certificadosPublicos.length} certificado(s) para verificación pública`);
    };

    const handleSaveWhatsapp = () => {
        saveWhatsappConfig(whatsappNumber);
        setShowWhatsappConfig(false);
    };

    const handleShareWhatsapp = (cert) => {
        const number = (cert.interno?.whatsapp_contacto || '').replace(/\D/g, '');
        if (!number) return;
        const nombreInterno = cert.interno?.nombre_completo || 'el interno';
        const nombreCurso = cert.curso?.nombre || 'el curso';
        const fecha = cert.fecha_emision
            ? new Date(cert.fecha_emision + 'T12:00:00').toLocaleDateString('es-AR')
            : '';
        const message = encodeURIComponent(
            `Estimado/a familiar de ${nombreInterno}, se informa la emisión del certificado ${cert.codigo} correspondiente al curso "${nombreCurso}", emitido el ${fecha}. Código de verificación: ${cert.hash_integridad || cert.codigo}. — Sistema de Gestión Académica, UP N°9 La Plata.`
        );
        const a = document.createElement('a');
        a.href = `https://wa.me/${number}?text=${message}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Certificados</h1>
                    <p className="page-description">
                        Emisión y gestión de certificados de aprobación
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    {canEmit && emitidos.length > 0 && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handlePublicar}
                            title="Descarga certificados-publicos.json para subir a GitHub Pages"
                        >
                            <Globe size={16} /> Publicar para verificación
                        </button>
                    )}
                    {emitidos.length > 0 && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => exportCertificados(
                                certificados.filter(c => c.estado === 'emitido'),
                                getInternos(), getCursos(), getInscripciones(), SECTORES
                            )}
                            title="Exportar historial a Excel"
                        >
                            <Download size={16} /> Exportar
                        </button>
                    )}
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowWhatsappConfig(v => !v)}
                        title="El número de WhatsApp de cada interno se carga en su perfil"
                    >
                        <Settings size={16} /> Config
                    </button>
                    {canEmit && selectedCodigos.length > 0 && (
                        <button className="btn btn-success" onClick={handleEmitirBulk}>
                            <CheckCircle size={18} />
                            Emitir seleccionados ({selectedCodigos.length})
                        </button>
                    )}
                </div>
            </div>

            {/* WhatsApp Config Panel */}
            {showWhatsappConfig && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                            N° WhatsApp Jefatura:
                        </label>
                        <input
                            type="tel"
                            className="form-input"
                            style={{ maxWidth: 260 }}
                            placeholder="Ej: 5492214567890"
                            value={whatsappNumber}
                            onChange={e => setWhatsappNumber(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveWhatsapp}>
                            Guardar
                        </button>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                            Formato internacional sin + ni espacios. Ej: 5492214xxxxxxx
                        </span>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon yellow"><Clock size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Pendientes de emisión</div>
                        <div className="stat-value">{pendientes.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><Award size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Certificados emitidos</div>
                        <div className="stat-value">{emitidos.length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 0 }}>
                <button
                    className={`tab ${tab === 'pendientes' ? 'active' : ''}`}
                    onClick={() => setTab('pendientes')}
                >
                    Pendientes de aprobación
                    {pendientes.length > 0 && (
                        <span className="badge badge-warning" style={{ marginLeft: 'var(--space-2)' }}>
                            {pendientes.length}
                        </span>
                    )}
                </button>
                <button
                    className={`tab ${tab === 'historial' ? 'active' : ''}`}
                    onClick={() => setTab('historial')}
                >
                    Historial de emitidos
                    {emitidos.length > 0 && (
                        <span className="badge badge-success" style={{ marginLeft: 'var(--space-2)' }}>
                            {emitidos.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab: Pendientes */}
            {tab === 'pendientes' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {canEmit && (
                                    <th style={{ width: 40 }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCodigos.length === pendientes.length && pendientes.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                )}
                                <th>Código</th>
                                <th>Interno</th>
                                <th>Curso</th>
                                <th>Sector</th>
                                <th>Fecha Inscripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes.length > 0 ? pendientes.map(cert => (
                                <tr key={cert.codigo}>
                                    {canEmit && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedCodigos.includes(cert.codigo)}
                                                onChange={() => toggleSelect(cert.codigo)}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-700)', fontSize: 'var(--text-xs)' }}>
                                            {cert.codigo}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                                            {cert.interno?.nombre_completo || '—'}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                            {cert.interno?.dni ? `DNI ${cert.interno.dni}` : `#${cert.inscripcion?.interno_nro || '—'}`}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>{cert.curso?.nombre || '—'}</td>
                                    <td>
                                        <span className="badge badge-neutral">
                                            {cert.sector?.nombre || '—'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                        {cert.inscripcion?.fecha_inscripcion
                                            ? (() => { const [y,m,d] = cert.inscripcion.fecha_inscripcion.split('-'); return new Date(+y,+m-1,+d).toLocaleDateString('es-AR'); })()
                                            : '—'}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setPreviewCert(cert)}
                                            >
                                                <Printer size={14} /> Ver
                                            </button>
                                            {canEmit && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleEmitirUno(cert.codigo)}
                                                >
                                                    <CheckCircle size={14} /> Emitir
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={canEmit ? 7 : 6}>
                                        <div className="empty-state">
                                            <Award size={48} className="empty-icon" />
                                            <div className="empty-title">Sin certificados pendientes</div>
                                            <div className="empty-text">
                                                Cuando un responsable marque una inscripción como Aprobado, aparecerá aquí.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Historial */}
            {tab === 'historial' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Interno</th>
                                <th>Curso</th>
                                <th>Sector</th>
                                <th>Fecha Emisión</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emitidos.length > 0 ? emitidos.map(cert => (
                                <tr key={cert.codigo}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-700)', fontSize: 'var(--text-xs)' }}>
                                                {cert.codigo}
                                            </span>
                                            <span className="badge badge-success">Emitido</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                                            {cert.interno?.nombre_completo || '—'}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                            {cert.interno?.dni ? `DNI ${cert.interno.dni}` : `#${cert.inscripcion?.interno_nro || '—'}`}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>{cert.curso?.nombre || '—'}</td>
                                    <td>
                                        <span className="badge badge-neutral">{cert.sector?.nombre || '—'}</span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                                        {cert.fecha_emision
                                            ? (() => { const [y,m,d] = cert.fecha_emision.split('-'); return new Date(+y,+m-1,+d).toLocaleDateString('es-AR'); })()
                                            : '—'}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setPreviewCert(cert)}
                                            >
                                                <Printer size={14} /> Ver
                                            </button>
                                            {cert.interno?.whatsapp_contacto ? (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: '#25D366' }}
                                                    onClick={() => handleShareWhatsapp(cert)}
                                                    title={`Enviar a ${cert.interno.whatsapp_contacto}`}
                                                >
                                                    <MessageCircle size={14} /> WhatsApp
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }} title="Sin número de contacto">
                                                    Sin nro.
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <Award size={48} className="empty-icon" />
                                            <div className="empty-title">Sin certificados emitidos</div>
                                            <div className="empty-text">Los certificados emitidos aparecerán aquí.</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de vista previa */}
            {previewCert && (
                <CertificadoModal
                    cert={previewCert}
                    onClose={() => setPreviewCert(null)}
                    onWhatsapp={previewCert.interno?.whatsapp_contacto
                        ? () => handleShareWhatsapp(previewCert)
                        : undefined}
                />
            )}
        </div>
    );
}
