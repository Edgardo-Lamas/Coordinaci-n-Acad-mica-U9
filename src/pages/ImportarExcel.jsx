import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Trash2, Users, Building2, FolderOpen, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { importInternosFromExcel, hasImportedData, clearImportedInternos, getInternosCount, addAuditLog, importSectorData, reconciliarInternos } from '../data/dataService';
import { useAuth } from '../contexts/AuthContext';

const IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI?.isElectron === true;

export default function ImportarExcel() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('excel');

    // ── Tab Excel ──────────────────────────────────────────────────────────────
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState([]);
    const [dragover, setDragover] = useState(false);
    const [hasData, setHasData] = useState(hasImportedData());
    const fileRef = useRef(null);
    const navigate = useNavigate();

    // ── Carpeta vigilada (solo Electron) ───────────────────────────────────────
    const [watchedFolder, setWatchedFolder] = useState('');
    const [newExcelNotif, setNewExcelNotif] = useState(null); // { filePath, filename }

    useEffect(() => {
        if (!IS_ELECTRON) return;
        window.electronAPI.watchFolder.getFolder().then(f => setWatchedFolder(f || ''));
        window.electronAPI.watchFolder.onNewExcel((filePath, filename) => {
            setNewExcelNotif({ filePath, filename });
            setActiveTab('excel');
        });
        return () => window.electronAPI.watchFolder.removeListener();
    }, []);

    const handleChooseFolder = async () => {
        const chosen = await window.electronAPI.watchFolder.openDialog();
        if (chosen) {
            await window.electronAPI.watchFolder.setFolder(chosen);
            setWatchedFolder(chosen);
        }
    };

    const handleClearFolder = async () => {
        await window.electronAPI.watchFolder.setFolder('');
        setWatchedFolder('');
    };

    const handleAutoImport = async () => {
        if (!newExcelNotif) return;
        try {
            const arrayBuffer = await window.electronAPI.watchFolder.readFile(newExcelNotif.filePath);
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            const headers = Object.keys(jsonData[0] || {});
            let idColumn = null, nameColumn = null, dniColumn = null;
            for (const h of headers) {
                const lower = h.toLowerCase().replace(/[°º]/g, '').trim();
                if (!idColumn && (lower.includes('n id') || lower.includes('nro') || lower === 'id' || lower.includes('numero') || lower.includes('interno'))) idColumn = h;
                if (!nameColumn && (lower.includes('apellido') || lower.includes('nombre') || lower.includes('name'))) nameColumn = h;
                if (!dniColumn && (lower.includes('dni') || lower.includes('documento') || lower.includes('doc'))) dniColumn = h;
            }
            if (!idColumn || !nameColumn) {
                setErrors(['No se detectaron las columnas requeridas en el archivo.']);
                setNewExcelNotif(null);
                return;
            }
            const importResult = importInternosFromExcel(jsonData, idColumn, nameColumn, dniColumn);
            const recon = reconciliarInternos(importResult.validInternos);
            setResult({ ...importResult, reconciliados: recon.reconciliados, inscripcionesReconciliadas: recon.inscripcionesActualizadas, fromWatcher: true });
            setHasData(true);
            setNewExcelNotif(null);
            addAuditLog(user, 'IMPORTAR_INTERNOS_AUTO', 'Interno',
                `Importación automática ${newExcelNotif.filename}: ${importResult.imported} importados, ${recon.reconciliados} reconciliados`);
        } catch (err) {
            setErrors(['Error al procesar el archivo: ' + err.message]);
            setNewExcelNotif(null);
        }
    };

    // ── Tab Sector JSON ────────────────────────────────────────────────────────
    const [sectorFile, setSectorFile] = useState(null);
    const [sectorPayload, setSectorPayload] = useState(null);
    const [sectorError, setSectorError] = useState('');
    const [sectorResult, setSectorResult] = useState(null);
    const [sectorDragover, setSectorDragover] = useState(false);
    const sectorFileRef = useRef(null);

    const processSectorFile = (f) => {
        setSectorFile(f);
        setSectorError('');
        setSectorPayload(null);
        setSectorResult(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.tipo !== 'exportacion_sector') {
                    setSectorError('El archivo no es un paquete de exportación de sector válido.');
                    return;
                }
                setSectorPayload(parsed);
            } catch {
                setSectorError('Error al leer el archivo. Verificá que sea un .json válido.');
            }
        };
        reader.readAsText(f);
    };

    const handleImportSector = () => {
        if (!sectorPayload) return;
        try {
            const res = importSectorData(sectorPayload);
            setSectorResult(res);
            setSectorPayload(null);
            setSectorFile(null);
            addAuditLog(user, 'IMPORTAR_SECTOR', 'Sector',
                `Importó datos de ${res.sector_nombre}: ${res.inscripciones_nuevas} inscripciones nuevas, ${res.inscripciones_actualizadas} actualizadas`
            );
        } catch (err) {
            setSectorError(err.message);
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        setResult(null);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    setErrors(['El archivo no contiene datos.']);
                    return;
                }

                // Try to detect the right columns
                const headers = Object.keys(jsonData[0]);
                let idColumn = null;
                let nameColumn = null;

                // Look for ID column (Nº ID, N° ID, NRO, ID, etc.)
                for (const h of headers) {
                    const lower = h.toLowerCase().replace(/[°º]/g, '').trim();
                    if (lower.includes('n id') || lower.includes('nro') || lower === 'id' || lower.includes('numero') || lower.includes('interno')) {
                        idColumn = h;
                        break;
                    }
                }

                // Look for Name column (APELLIDOS Y NOMBRES, NOMBRE, etc.)
                for (const h of headers) {
                    const lower = h.toLowerCase().trim();
                    if (lower.includes('apellido') || lower.includes('nombre') || lower.includes('name')) {
                        nameColumn = h;
                        break;
                    }
                }

                // Look for DNI column
                let dniColumn = null;
                for (const h of headers) {
                    const lower = h.toLowerCase().trim();
                    if (lower.includes('dni') || lower.includes('documento') || lower.includes('doc') || lower === 'cuit' || lower === 'cuil') {
                        dniColumn = h;
                        break;
                    }
                }

                const previewData = {
                    totalRows: jsonData.length,
                    headers,
                    idColumn,
                    nameColumn,
                    dniColumn,
                    sampleRows: jsonData.slice(0, 10).map(row => ({
                        id: idColumn ? String(row[idColumn]).trim() : '',
                        nombre: nameColumn ? String(row[nameColumn]).trim() : '',
                        dni: dniColumn ? String(row[dniColumn]).trim() : '',
                        raw: row
                    })),
                    allRows: jsonData
                };

                setPreview(previewData);
            } catch (err) {
                setErrors(['Error al leer el archivo: ' + err.message]);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragover(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleImport = () => {
        if (!preview) return;
        setImporting(true);

        // Small delay for UX feedback
        setTimeout(() => {
            try {
                const importResult = importInternosFromExcel(
                    preview.allRows,
                    preview.idColumn,
                    preview.nameColumn,
                    preview.dniColumn
                );
                const recon = reconciliarInternos(importResult.validInternos);
                setResult({ ...importResult, reconciliados: recon.reconciliados, inscripcionesReconciliadas: recon.inscripcionesActualizadas });
                setHasData(true);
                addAuditLog(user, 'IMPORTAR_INTERNOS', 'Interno',
                    `Importación Excel: ${importResult.imported} registros importados, ${importResult.skipped} omitidos, ${recon.reconciliados} reconciliados`);
            } catch (err) {
                setErrors([err.message]);
            }
            setImporting(false);
        }, 800);
    };

    const handleClearData = () => {
        if (window.confirm('¿Está seguro de eliminar todos los datos importados? Se volverá a los datos de demostración.')) {
            clearImportedInternos();
            setHasData(false);
            setResult(null);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setErrors([]);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Importar datos</h1>
                    <p className="page-description">
                        Importación de internos desde Excel y datos de sectores enviados por email.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`tab ${activeTab === 'excel' ? 'active' : ''}`}
                    onClick={() => setActiveTab('excel')}
                >
                    <FileSpreadsheet size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Internos desde Excel
                </button>
                <button
                    className={`tab ${activeTab === 'sector' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sector')}
                >
                    <Building2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Datos de Sector
                </button>
            </div>

            {/* ── TAB: Importar datos de sector ─────────────────────────────── */}
            {activeTab === 'sector' && (
                <div>
                    {sectorResult ? (
                        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                            <div className="card-body" style={{ textAlign: 'center' }}>
                                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
                                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
                                    Datos del Sector <strong>{sectorResult.sector_nombre}</strong> importados
                                </h3>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                                    Exportado por <strong>{sectorResult.exportado_por}</strong> — {sectorResult.fecha_exportacion ? new Date(sectorResult.fecha_exportacion).toLocaleString('es-AR') : '—'}
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                                    {[
                                        { label: 'Inscripciones nuevas', val: sectorResult.inscripciones_nuevas, color: 'var(--success)' },
                                        { label: 'Inscripciones actualizadas', val: sectorResult.inscripciones_actualizadas, color: 'var(--primary-600)' },
                                        { label: 'Cursos nuevos', val: sectorResult.cursos_nuevos, color: 'var(--success)' },
                                        { label: 'Internos nuevos', val: sectorResult.internos_nuevos, color: 'var(--success)' },
                                    ].map(({ label, val, color }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color }}>{val}</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                                    <button className="btn btn-primary" onClick={() => navigate('/inscripciones')}>
                                        Ver Inscripciones
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setSectorResult(null)}>
                                        Importar otro archivo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                <div className="card-body">
                                    <div
                                        className={`upload-area ${sectorDragover ? 'dragover' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onDragOver={(e) => { e.preventDefault(); setSectorDragover(true); }}
                                        onDragLeave={() => setSectorDragover(false)}
                                        onDrop={(e) => { e.preventDefault(); setSectorDragover(false); const f = e.dataTransfer.files[0]; if (f) processSectorFile(f); }}
                                        onClick={() => sectorFileRef.current?.click()}
                                    >
                                        <Building2 size={48} className="upload-icon" />
                                        <div className="upload-text">
                                            Arrastrá el archivo .json del sector aquí o hacé clic para seleccionarlo
                                        </div>
                                        <div className="upload-hint">
                                            El archivo es generado por el Responsable del sector usando "Exportar sector"
                                        </div>
                                    </div>
                                    <input
                                        ref={sectorFileRef}
                                        type="file"
                                        accept=".json"
                                        style={{ display: 'none' }}
                                        onChange={(e) => { const f = e.target.files[0]; if (f) processSectorFile(f); }}
                                    />
                                    {sectorError && (
                                        <div className="login-error" style={{ marginTop: 'var(--space-4)' }}>
                                            <AlertCircle size={16} /> {sectorError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {sectorPayload && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <div className="card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <Building2 size={20} />
                                            <div>
                                                <h2 className="card-title">Sector: {sectorPayload.sector_nombre}</h2>
                                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                                    Exportado por <strong>{sectorPayload.exportado_por}</strong> — {new Date(sectorPayload.fecha_exportacion).toLocaleString('es-AR')}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setSectorFile(null); setSectorPayload(null); }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                                            {[
                                                { label: 'Inscripciones', val: sectorPayload.inscripciones?.length ?? 0 },
                                                { label: 'Cursos', val: sectorPayload.cursos?.length ?? 0 },
                                                { label: 'Internos', val: sectorPayload.internos?.length ?? 0 },
                                            ].map(({ label, val }) => (
                                                <div key={label} style={{ textAlign: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                                                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary-700)' }}>{val}</div>
                                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                                            Los registros existentes serán actualizados. Los registros nuevos serán agregados. No se elimina ningún dato.
                                        </p>
                                    </div>
                                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                                        <button className="btn btn-secondary" onClick={() => { setSectorFile(null); setSectorPayload(null); }}>Cancelar</button>
                                        <button className="btn btn-primary btn-lg" onClick={handleImportSector}>
                                            <Download size={18} /> Fusionar datos
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="card">
                                <div className="card-header"><h2 className="card-title">¿Cómo funciona?</h2></div>
                                <div className="card-body">
                                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                        {[
                                            { n: 1, title: 'Responsable exporta su sector', desc: 'Desde Mi Sector → "Exportar sector", se descarga un archivo .json con las inscripciones y calificaciones del sector.' },
                                            { n: 2, title: 'Envío por email', desc: 'El Responsable adjunta el archivo .json al email y lo envía a Coordinación Académica.' },
                                            { n: 3, title: 'Coordinación importa', desc: 'Coordinación carga el .json aquí. Los datos se fusionan: registros nuevos se agregan, existentes se actualizan.' },
                                        ].map(({ n, title, desc }) => (
                                            <div key={n} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                                <span className="badge badge-info" style={{ flexShrink: 0, width: 28, justifyContent: 'center' }}>{n}</span>
                                                <div>
                                                    <strong>{title}</strong>
                                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── TAB: Importar internos desde Excel ────────────────────────── */}
            {activeTab === 'excel' && (<>

            {/* Notificación: nuevo Excel detectado por la carpeta vigilada */}
            {newExcelNotif && (
                <div className="card" style={{ marginBottom: 'var(--space-4)', borderLeft: '4px solid var(--primary-600)', background: 'var(--primary-50, #eff6ff)' }}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <RefreshCw size={20} style={{ color: 'var(--primary-600)' }} />
                            <div>
                                <strong>Nuevo Excel detectado en la carpeta vigilada</strong>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{newExcelNotif.filename}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-primary btn-sm" onClick={handleAutoImport}>
                                <Download size={16} /> Importar ahora
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setNewExcelNotif(null)}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing data banner */}
            {hasData && !result && !preview && (
                <div className="card" style={{ marginBottom: 'var(--space-4)', borderLeft: '4px solid var(--success)' }}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Users size={20} style={{ color: 'var(--success)' }} />
                            <span><strong>{getInternosCount()}</strong> internos activos cargados desde archivo Excel</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/internos')}>
                                <Users size={16} /> Ver Internos
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={handleClearData} style={{ color: 'var(--danger)' }}>
                                <Trash2 size={16} /> Limpiar datos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
                            Importación Completada — Datos Guardados
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                            Los datos fueron guardados correctamente y persistirán al recargar la página.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--success)' }}>{result.imported}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Importados</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--warning)' }}>{result.skipped}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Omitidos</div>
                            </div>
                            {result.reconciliados > 0 && (
                                <div>
                                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary-600)' }}>{result.reconciliados}</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Reconciliados</div>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gray-400)' }}>{result.total}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Total</div>
                            </div>
                        </div>
                        {result.reconciliados > 0 && (
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-700)', background: 'var(--primary-50, #eff6ff)', padding: '8px 16px', borderRadius: 6, marginBottom: 'var(--space-4)' }}>
                                ✓ {result.reconciliados} interno{result.reconciliados !== 1 ? 's' : ''} cargado{result.reconciliados !== 1 ? 's' : ''} desde sectores fueron vinculados con su número de interno oficial.
                                {result.inscripcionesReconciliadas > 0 && ` (${result.inscripcionesReconciliadas} inscripciones actualizadas)`}
                            </div>
                        )}

                        {result.errors.length > 0 && (
                            <div style={{ textAlign: 'left', marginTop: 'var(--space-4)' }}>
                                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--warning-dark)', marginBottom: 8 }}>
                                    Registros con errores:
                                </h4>
                                {result.errors.map((err, i) => (
                                    <div key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', padding: '4px 0' }}>
                                        {err}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/internos')}>
                                <Users size={18} /> Ver Internos
                            </button>
                            <button className="btn btn-secondary" onClick={resetForm}>
                                Importar otro archivo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {!result && !preview && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-body">
                        <div
                            className={`upload-area ${dragover ? 'dragover' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                            onDragLeave={() => setDragover(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                        >
                            <Upload size={48} className="upload-icon" />
                            <div className="upload-text">
                                Arrastrá tu archivo Excel aquí o hacé clic para seleccionarlo
                            </div>
                            <div className="upload-hint">
                                Formatos aceptados: .xlsx, .xls, .csv — Se importarán las columnas Nº ID, Nombre y DNI
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const f = e.target.files[0];
                                if (f) processFile(f);
                            }}
                        />

                        {errors.length > 0 && (
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                {errors.map((err, i) => (
                                    <div key={i} className="login-error">
                                        <AlertCircle size={16} /> {err}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview */}
            {preview && !result && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <FileSpreadsheet size={20} />
                            <div>
                                <h2 className="card-title">{file?.name}</h2>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                    {preview.totalRows} registros encontrados
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={resetForm}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="card-body">
                        {/* Column Detection */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)' }}>
                                Columnas detectadas
                            </h3>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                <div style={{ padding: 'var(--space-3) var(--space-4)', background: preview.idColumn ? 'var(--success-light)' : 'var(--danger-light)', borderRadius: 'var(--radius-sm)' }}>
                                    <strong>Nº ID:</strong> {preview.idColumn || '❌ No detectada'}
                                </div>
                                <div style={{ padding: 'var(--space-3) var(--space-4)', background: preview.nameColumn ? 'var(--success-light)' : 'var(--danger-light)', borderRadius: 'var(--radius-sm)' }}>
                                    <strong>Nombre:</strong> {preview.nameColumn || '❌ No detectada'}
                                </div>
                                <div style={{ padding: 'var(--space-3) var(--space-4)', background: preview.dniColumn ? 'var(--success-light)' : 'var(--warning-light)', borderRadius: 'var(--radius-sm)' }}>
                                    <strong>DNI:</strong> {preview.dniColumn || '⚠️ No detectada (opcional)'}
                                </div>
                            </div>
                        </div>

                        {/* Preview Table */}
                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)' }}>
                            Vista Previa (primeros 10 registros)
                        </h3>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nº ID</th>
                                        <th>DNI</th>
                                        <th>Apellido y Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.sampleRows.map((row, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>
                                                <strong style={{ color: 'var(--primary-700)' }}>
                                                    {row.id || <span style={{ color: 'var(--danger)' }}>—</span>}
                                                </strong>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}>
                                                {row.dni || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                                            </td>
                                            <td>{row.nombre || <span style={{ color: 'var(--danger)' }}>—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                        <button className="btn btn-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleImport}
                            disabled={importing || !preview.idColumn || !preview.nameColumn}
                        >
                            {importing ? (
                                <>
                                    <div className="spinner" style={{ width: 18, height: 18 }} />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Importar {preview.totalRows} Registros
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Carpeta vigilada (solo Electron) */}
            {IS_ELECTRON && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FolderOpen size={18} /> Carpeta vigilada — Excel de Jefatura
                        </h2>
                    </div>
                    <div className="card-body">
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                            Cuando Jefatura envíe el Excel actualizado por email, guardalo en esta carpeta.
                            La aplicación lo detectará automáticamente y te ofrecerá importarlo.
                        </p>
                        {watchedFolder ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, fontSize: 'var(--text-sm)', fontFamily: 'monospace', border: '1px solid var(--gray-200)', wordBreak: 'break-all' }}>
                                    <Eye size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--success)' }} />
                                    {watchedFolder}
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={handleChooseFolder}>Cambiar</button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={handleClearFolder}>Quitar</button>
                            </div>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={handleChooseFolder}>
                                <FolderOpen size={16} /> Elegir carpeta
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Instrucciones</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <span className="badge badge-info" style={{ flexShrink: 0, width: 28, justifyContent: 'center' }}>1</span>
                            <div>
                                <strong>Preparar el archivo Excel</strong>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                    El archivo debe contener al menos dos columnas: <strong>Nº ID</strong> (número de interno), <strong>Apellidos y Nombres</strong>, y opcionalmente <strong>DNI</strong>. El DNI se usará para certificados y búsquedas.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <span className="badge badge-info" style={{ flexShrink: 0, width: 28, justifyContent: 'center' }}>2</span>
                            <div>
                                <strong>Cargar el archivo</strong>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                    Arrastre el archivo a la zona de carga o haga clic para seleccionarlo. Se aceptan formatos .xlsx y .xls.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <span className="badge badge-info" style={{ flexShrink: 0, width: 28, justifyContent: 'center' }}>3</span>
                            <div>
                                <strong>Revisar y confirmar</strong>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                                    Verifique que las columnas fueron detectadas correctamente y revise la vista previa antes de confirmar la importación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>)}
        </div>
    );
}
