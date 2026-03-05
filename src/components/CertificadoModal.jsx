import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, MessageCircle, ImageDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const PRINT_STYLE_ID = 'cert-print-styles';
const VERIFICAR_BASE_URL = 'https://ga.up9laplata.gob.ar/verificar/';

function injectPrintStyles() {
    if (document.getElementById(PRINT_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PRINT_STYLE_ID;
    style.textContent = `
        @media print {
            @page { size: A4 landscape; margin: 0; }
            body > * { display: none !important; }
            #certificado-printable {
                display: block !important;
                position: fixed !important;
                top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: white !important;
                z-index: 99999 !important;
            }
        }
    `;
    document.head.appendChild(style);
}

export default function CertificadoModal({ cert, onClose, onWhatsapp }) {
    const previewRef = useRef(null);
    const [exportingPng, setExportingPng] = useState(false);

    useEffect(() => {
        injectPrintStyles();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleExportPng = async () => {
        if (!previewRef.current) return;
        setExportingPng(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const link = document.createElement('a');
            link.download = `certificado-${cert.codigo}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Error exportando PNG:', e);
        } finally {
            setExportingPng(false);
        }
    };

    const props = {
        interno: cert.interno,
        curso: cert.curso,
        inscripcion: cert.inscripcion,
        capacitador: cert.capacitador,
        codigo: cert.codigo,
        fechaEmision: cert.fecha_emision,
        hashIntegridad: cert.hash_integridad,
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: 300 }}>
                <div
                    className="modal"
                    style={{ maxWidth: 960, width: '95%', maxHeight: '95vh', overflow: 'auto' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2 className="modal-title">Vista previa del certificado</h2>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                                <Printer size={16} /> Imprimir / PDF
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleExportPng}
                                disabled={exportingPng}
                                title="Descargar como imagen PNG"
                            >
                                {exportingPng
                                    ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: '2px' }} /> Generando...</>
                                    : <><ImageDown size={16} /> PNG</>
                                }
                            </button>
                            {onWhatsapp && (
                                <button
                                    className="btn btn-sm"
                                    style={{ background: '#25D366', color: 'white', border: 'none' }}
                                    onClick={onWhatsapp}
                                    title="Notificar al familiar por WhatsApp"
                                >
                                    <MessageCircle size={16} /> Notificar por WhatsApp
                                </button>
                            )}
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="modal-body" style={{ padding: 'var(--space-6)', background: '#f3f4f6' }}>
                        <div ref={previewRef}>
                            <CertificadoDocument {...props} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Versión para impresión — renderizada directo en body via portal */}
            {createPortal(
                <div id="certificado-printable" style={{ display: 'none' }}>
                    <CertificadoDocument {...props} isPrint />
                </div>,
                document.body
            )}
        </>
    );
}

function CertificadoDocument({ interno, curso, inscripcion, capacitador, codigo, fechaEmision, hashIntegridad, isPrint }) {
    const fmtDate = (str) => {
        if (!str) return '—';
        const [y, m, d] = str.split('-');
        return new Date(+y, +m - 1, +d).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const emisionLabel = fechaEmision
        ? fmtDate(fechaEmision)
        : new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const verificarUrl = `${VERIFICAR_BASE_URL}${codigo}`;

    const page = {
        width: isPrint ? '297mm' : '100%',
        minHeight: isPrint ? '210mm' : 'auto',
        background: '#ffffff',
        padding: '24px 40px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#1a1a2e',
        position: 'relative',
        boxSizing: 'border-box',
        border: isPrint ? 'none' : '1px solid #d1d5db',
        borderRadius: isPrint ? 0 : 8,
    };

    return (
        <div style={page}>
            {/* Bordes decorativos */}
            <div style={{ position: 'absolute', inset: 10, border: '3px solid #1e3a6e', borderRadius: 4, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 16, border: '1px solid #93acd3', borderRadius: 2, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', padding: '18px 24px' }}>

                {/* Encabezado */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a6e', paddingBottom: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 3 }}>
                        Ministerio de Justicia de la Provincia de Buenos Aires
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'sans-serif', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1e3a6e', marginBottom: 2 }}>
                        Unidad Penitenciaria N° 9 — La Plata
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#374151', marginBottom: 12 }}>
                        Centro de Actividades Académicas
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#0f2557', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
                        Certificado
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 }}>
                        de aprobación y participación
                    </div>
                </div>

                {/* Cuerpo */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontFamily: 'sans-serif', color: '#374151', marginBottom: 12, lineHeight: 1.5 }}>
                        La Coordinación Académica de la Unidad Penitenciaria N° 9 de La Plata certifica que
                    </p>

                    {/* Nombre */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontFamily: 'sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>
                            Nombre completo
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0f2557', letterSpacing: '0.02em', borderBottom: '2px solid #1e3a6e', display: 'inline-block', paddingBottom: 3, minWidth: 280 }}>
                            {interno?.nombre_completo || '—'}
                        </div>
                        {interno?.dni && (
                            <div style={{ fontSize: 11, fontFamily: 'sans-serif', color: '#6b7280', marginTop: 4 }}>
                                DNI N° {interno.dni}
                            </div>
                        )}
                    </div>

                    <p style={{ fontSize: 12, fontFamily: 'sans-serif', color: '#374151', marginBottom: 12, lineHeight: 1.5 }}>
                        ha completado satisfactoriamente el curso de
                    </p>

                    {/* Curso */}
                    <div style={{ display: 'inline-block', background: '#e8edf8', padding: '8px 24px', borderRadius: 4, marginBottom: 14, minWidth: 360 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a6e', marginBottom: 2 }}>
                            {curso?.nombre || '—'}
                        </div>
                        <div style={{ fontSize: 11, fontFamily: 'sans-serif', color: '#4b5563' }}>
                            {curso?.tipo || ''}{curso?.carga_horaria ? ` · ${curso.carga_horaria} horas` : ''}
                        </div>
                    </div>

                    {/* Detalles */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 36, borderTop: '1px solid #e5e7eb', paddingTop: 12, marginBottom: 16 }}>
                        {[
                            { label: 'Inicio', value: fmtDate(inscripcion?.fecha_inicio_curso) },
                            { label: 'Finalización', value: fmtDate(inscripcion?.fecha_fin_curso) },
                            { label: 'Carga Horaria', value: curso?.carga_horaria ? `${curso.carga_horaria} hs.` : '—' },
                            { label: 'Instructor/a', value: capacitador?.nombre || '—' },
                        ].map(item => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 8, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 2 }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'sans-serif', color: '#1f2937' }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie: fecha | firmas | QR */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>

                    {/* Fecha */}
                    <div style={{ fontSize: 10, fontFamily: 'sans-serif', color: '#4b5563', flexShrink: 0 }}>
                        La Plata, {emisionLabel}
                    </div>

                    {/* Firmas */}
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #374151', width: 160, margin: '0 auto', paddingTop: 5 }}>
                                <div style={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, color: '#0f2557' }}>Dirección</div>
                                <div style={{ fontSize: 9, fontFamily: 'sans-serif', color: '#4b5563' }}>Unidad Penitenciaria N° 9</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto', paddingTop: 5 }}>
                                <div style={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, color: '#0f2557' }}>Coordinación Académica</div>
                                <div style={{ fontSize: 9, fontFamily: 'sans-serif', color: '#4b5563' }}>Área Educativa</div>
                            </div>
                        </div>
                    </div>

                    {/* QR + código de validación */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        {hashIntegridad ? (
                            <>
                                <QRCodeSVG
                                    value={verificarUrl}
                                    size={72}
                                    level="M"
                                    style={{ display: 'block', margin: '0 auto 4px' }}
                                />
                                <div style={{ fontSize: 7, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>
                                    Código de validación
                                </div>
                                <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#374151', letterSpacing: '0.04em', lineHeight: 1.4 }}>
                                    {hashIntegridad.split('-').map((seg, i) => (
                                        <span key={i}>{seg}{i < 2 ? '-' : ''}</span>
                                    ))}
                                </div>
                                <div style={{ fontSize: 7, fontFamily: 'sans-serif', color: '#9ca3af', marginTop: 2 }}>
                                    {codigo}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 7, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>
                                    Código
                                </div>
                                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#6b7280' }}>
                                    {codigo}
                                </div>
                                <div style={{ fontSize: 7, fontFamily: 'sans-serif', color: '#d1d5db', marginTop: 3, fontStyle: 'italic' }}>
                                    Pendiente de emisión
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
