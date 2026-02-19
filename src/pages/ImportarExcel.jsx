import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { importInternosFromExcel, hasImportedData, clearImportedInternos, getInternosCount } from '../data/dataService';

export default function ImportarExcel() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState([]);
    const [dragover, setDragover] = useState(false);
    const [hasData, setHasData] = useState(hasImportedData());
    const fileRef = useRef(null);
    const navigate = useNavigate();

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
                setResult(importResult);
                setHasData(true);
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
                    <h1 className="page-title">Importar Internos desde Excel</h1>
                    <p className="page-description">
                        Carga masiva de internos. Se importan <strong>Nº ID</strong>, <strong>Apellido y Nombre</strong> y <strong>DNI</strong>.
                    </p>
                </div>
            </div>

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
                        <div style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--success)' }}>{result.imported}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Importados</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--warning)' }}>{result.skipped}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Omitidos</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gray-400)' }}>{result.total}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Total</div>
                            </div>
                        </div>

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
        </div>
    );
}
