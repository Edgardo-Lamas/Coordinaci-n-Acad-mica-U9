import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { addCorrectionRequest } from '../data/dataService';
import { useAuth } from '../contexts/AuthContext';

const CAMPOS = [
    { value: 'calificacion', label: 'Calificación' },
    { value: 'observaciones', label: 'Observaciones' },
];

/**
 * Modal para que CARGADOR solicite corrección de una inscripción.
 * Props:
 *   inscripcion: objeto inscripción completo
 *   cursoNombre: string
 *   internoNombre: string
 *   onClose: () => void
 *   onSent: () => void   — callback tras enviar exitosamente
 */
export default function SolicitudCorreccionModal({ inscripcion, cursoNombre, internoNombre, onClose, onSent }) {
    const { user } = useAuth();
    const [campo, setCampo] = useState('calificacion');
    const [valorSugerido, setValorSugerido] = useState('');
    const [motivo, setMotivo] = useState('');
    const [sending, setSending] = useState(false);

    const valorActual = inscripcion?.[campo] ?? '';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valorSugerido.trim()) return;
        setSending(true);
        addCorrectionRequest({
            entidad: 'inscripcion',
            registro_id: String(inscripcion.id),
            registro_desc: `${internoNombre} — ${cursoNombre}`,
            campo,
            valor_actual: String(valorActual),
            valor_sugerido: valorSugerido.trim(),
            motivo: motivo.trim(),
            solicitante_id: user?.id || 0,
            solicitante_nombre: user?.nombre || 'Desconocido',
        });
        setSending(false);
        onSent();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                        <h3 className="modal-title">Solicitar corrección</h3>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                        <strong>{internoNombre}</strong> — {cursoNombre}
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Campo a corregir</label>
                            <select className="form-select" value={campo} onChange={e => setCampo(e.target.value)}>
                                {CAMPOS.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valor actual</label>
                            <input className="form-input" value={valorActual || '(vacío)'} disabled readOnly />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valor correcto sugerido <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                className="form-input"
                                value={valorSugerido}
                                onChange={e => setValorSugerido(e.target.value)}
                                placeholder="¿Cuál debería ser el valor correcto?"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Motivo (opcional)</label>
                            <textarea
                                className="form-input"
                                value={motivo}
                                onChange={e => setMotivo(e.target.value)}
                                placeholder="¿Por qué necesita corregirse?"
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-warning" disabled={sending}>
                                {sending ? 'Enviando…' : 'Enviar solicitud'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
