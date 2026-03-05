import { useParams } from 'react-router-dom';
import { getCertificados, getCursos, getInternos, getInscripciones } from '../data/dataService';
import { CheckCircle, XCircle, Clock, GraduationCap } from 'lucide-react';

export default function Verificar() {
    const { codigo } = useParams();

    const cert = getCertificados().find(c => c.codigo === codigo);

    const fmtDate = (str) => {
        if (!str) return '—';
        const [y, m, d] = str.split('-');
        return new Date(+y, +m - 1, +d).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    let content;

    if (!cert) {
        content = (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <XCircle size={64} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
                    Certificado no encontrado
                </h2>
                <p style={{ color: '#6b7280', fontSize: 15 }}>
                    No existe ningún certificado con el código <strong>{codigo}</strong>.
                </p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
                    Verifique que el código sea correcto o que el certificado haya sido emitido.
                </p>
            </div>
        );
    } else if (cert.estado !== 'emitido') {
        content = (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Clock size={64} style={{ color: '#d97706', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
                    Certificado pendiente de emisión
                </h2>
                <p style={{ color: '#6b7280', fontSize: 15 }}>
                    El certificado <strong>{codigo}</strong> existe pero aún no ha sido emitido oficialmente.
                </p>
            </div>
        );
    } else {
        const inscripcion = getInscripciones().find(i => i.id === cert.inscripcion_id);
        const curso = inscripcion ? getCursos().find(c => c.id === inscripcion.curso_id) : null;
        const interno = inscripcion ? getInternos().find(i => i.numero_interno === inscripcion.interno_nro) : null;

        content = (
            <div style={{ padding: '24px' }}>
                <div style={{
                    background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: 8,
                    padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16
                }}>
                    <CheckCircle size={40} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>
                            CERTIFICADO VÁLIDO
                        </div>
                        <div style={{ fontSize: 13, color: '#166534' }}>
                            Emitido oficialmente por la Coordinación Académica — UP N° 9 La Plata
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Código" value={cert.codigo} mono />
                    <Field label="Fecha de emisión" value={fmtDate(cert.fecha_emision)} />
                    <Field label="Nombre" value={interno?.nombre_completo || '—'} />
                    <Field label="DNI" value={interno?.dni ? `N° ${interno.dni}` : '—'} />
                    <Field label="Curso" value={curso?.nombre || '—'} />
                    <Field label="Tipo" value={curso?.tipo || '—'} />
                    <Field label="Carga horaria" value={curso?.carga_horaria ? `${curso.carga_horaria} horas` : '—'} />
                    <Field label="Período"
                        value={inscripcion?.fecha_inicio_curso && inscripcion?.fecha_fin_curso
                            ? `${fmtDate(inscripcion.fecha_inicio_curso)} — ${fmtDate(inscripcion.fecha_fin_curso)}`
                            : '—'}
                    />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Hash de integridad" value={cert.hash_integridad || '—'} mono />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f9fafb',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingBottom: 48
        }}>
            {/* Header institucional */}
            <div style={{
                width: '100%', background: '#1e3a6e', color: 'white',
                padding: '20px 32px', marginBottom: 32,
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <GraduationCap size={32} />
                <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
                        Ministerio de Justicia — Prov. Buenos Aires
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em' }}>
                        Unidad Penitenciaria N° 9 — La Plata · Verificación de Certificados
                    </div>
                </div>
            </div>

            {/* Card de resultado */}
            <div style={{
                background: 'white', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                width: '100%', maxWidth: 640, border: '1px solid #e5e7eb'
            }}>
                {content}
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                Sistema de Gestión Académica — UP N° 9 La Plata
            </div>
        </div>
    );
}

function Field({ label, value, mono }) {
    return (
        <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>
                {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', fontFamily: mono ? 'monospace' : 'inherit' }}>
                {value}
            </div>
        </div>
    );
}
