import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, XCircle, ExternalLink, Clock, Flag, Trash2 } from 'lucide-react';
import { getCorrectionRequests, resolveCorrectionRequest, addAuditLog, getInscripciones, saveInscripciones } from '../data/dataService';
import { useAuth } from '../contexts/AuthContext';

const ESTADO_CONFIG = {
    pendiente: { label: 'Pendiente', badge: 'badge-warning', icon: Clock },
    resuelta:  { label: 'Resuelta',  badge: 'badge-success', icon: CheckCircle },
    rechazada: { label: 'Rechazada', badge: 'badge-danger',  icon: XCircle },
};

const CAMPO_LABEL = {
    calificacion: 'Calificación',
    observaciones: 'Observaciones',
    eliminar_inscripcion: 'Eliminar inscripción',
};

export default function Correcciones() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState(() => getCorrectionRequests());
    const [filterEstado, setFilterEstado] = useState('pendiente');
    const [toast, setToast] = useState(null);

    const showToast = (msg, tipo = 'success') => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3500);
    };

    const handleResolve = (id, estado) => {
        resolveCorrectionRequest(id, user?.nombre || 'Sin nombre', estado);
        const req = requests.find(r => r.id === id);
        addAuditLog(
            user,
            estado === 'resuelta' ? 'RESOLVER_CORRECCION' : 'RECHAZAR_CORRECCION',
            'Corrección',
            `${estado === 'resuelta' ? 'Resolvió' : 'Rechazó'} solicitud de ${req?.solicitante_nombre || '—'}: ${req?.registro_desc || '—'} (${CAMPO_LABEL[req?.campo] || req?.campo})`
        );
        setRequests(getCorrectionRequests());
        showToast(estado === 'resuelta' ? 'Marcada como resuelta' : 'Solicitud rechazada', estado === 'resuelta' ? 'success' : 'danger');
    };

    const handleEliminarInscripcion = (req) => {
        const inscripciones = getInscripciones();
        const updated = inscripciones.filter(i => String(i.id) !== String(req.registro_id));
        saveInscripciones(updated);
        resolveCorrectionRequest(req.id, user?.nombre || 'Sin nombre', 'resuelta');
        addAuditLog(user, 'ELIMINAR_INSCRIPCION', 'Inscripción', `Eliminó inscripción #${req.registro_id} solicitada por ${req.solicitante_nombre}: ${req.registro_desc}`);
        setRequests(getCorrectionRequests());
        showToast('Inscripción eliminada correctamente');
    };

    const filtered = requests.filter(r =>
        filterEstado === 'todas' ? true : r.estado === filterEstado
    );

    // Navigate to InternoDetalle using registro_desc to find the interno number
    // The registro_id is the inscripcion id; we need to navigate to the internal
    const handleGoToRecord = (req) => {
        // registro_desc is "NombreInterno — CursoNombre"; we can't derive the numero_interno from it.
        // Instead, look at the inscripciones stored in localStorage.
        try {
            const stored = localStorage.getItem('ga_u9_inscripciones');
            if (stored) {
                const inscripciones = JSON.parse(stored);
                const insc = inscripciones.find(i => String(i.id) === String(req.registro_id));
                if (insc?.interno_nro) {
                    navigate(`/internos/${insc.interno_nro}`);
                    return;
                }
            }
        } catch (_) { /* noop */ }
        showToast('No se pudo encontrar el registro', 'danger');
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={22} style={{ color: 'var(--warning)' }} />
                        Solicitudes de Corrección
                    </h1>
                    <p className="page-subtitle">Revisá y resolvé las solicitudes enviadas por los operadores de carga</p>
                </div>
            </div>

            {/* Filtro */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {['pendiente', 'resuelta', 'rechazada', 'todas'].map(estado => (
                            <button
                                key={estado}
                                className={`btn btn-sm ${filterEstado === estado ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setFilterEstado(estado)}
                            >
                                {estado === 'todas' ? 'Todas' : ESTADO_CONFIG[estado]?.label}
                                {estado !== 'todas' && (
                                    <span style={{ marginLeft: 4, opacity: 0.7 }}>
                                        ({requests.filter(r => r.estado === estado).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <CheckCircle size={48} className="empty-icon" style={{ color: 'var(--success)' }} />
                            <div className="empty-title">Sin solicitudes</div>
                            <div className="empty-text">
                                {filterEstado === 'pendiente'
                                    ? 'No hay solicitudes pendientes. ¡Todo al día!'
                                    : 'No hay solicitudes con este estado.'}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {filtered.map(req => {
                        const estadoCfg = ESTADO_CONFIG[req.estado] || ESTADO_CONFIG.pendiente;
                        const EstadoIcon = estadoCfg.icon;
                        return (
                            <div key={req.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                        {/* Info izquierda */}
                                        <div style={{ flex: 1, minWidth: 240 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span className={`badge ${estadoCfg.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <EstadoIcon size={11} /> {estadoCfg.label}
                                                </span>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                                                    #{req.id} · {new Date(req.fecha_solicitud).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{req.registro_desc || `Registro #${req.registro_id}`}</div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-3)' }}>
                                                Solicitó: <strong>{req.solicitante_nombre}</strong>
                                            </div>

                                            {req.campo === 'eliminar_inscripcion' ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: '#dc2626', fontWeight: 600 }}>
                                                    <Flag size={14} /> Solicitud de eliminación de inscripción
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '4px 12px', fontSize: 'var(--text-sm)', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--gray-400)' }}>Campo:</span>
                                                    <span style={{ fontWeight: 500 }}>{CAMPO_LABEL[req.campo] || req.campo}</span>
                                                    <span style={{ color: 'var(--gray-400)' }}>Actual:</span>
                                                    <span className="badge badge-neutral">{req.valor_actual || '(vacío)'}</span>
                                                    <span style={{ color: 'var(--gray-400)' }}>Sugerido:</span>
                                                    <span className="badge badge-info">{req.valor_sugerido || '(vacío)'}</span>
                                                </div>
                                            )}

                                            {req.motivo && (
                                                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                                    "{req.motivo}"
                                                </div>
                                            )}

                                            {req.estado !== 'pendiente' && req.resuelto_por_nombre && (
                                                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                                                    {req.estado === 'resuelta' ? 'Resuelto' : 'Rechazado'} por {req.resuelto_por_nombre} · {new Date(req.fecha_resolucion).toLocaleString('es-AR')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Acciones derecha */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                onClick={() => handleGoToRecord(req)}
                                            >
                                                <ExternalLink size={14} /> Ir al registro
                                            </button>
                                            {req.estado === 'pendiente' && (
                                                <>
                                                    {req.campo === 'eliminar_inscripcion' ? (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                            onClick={() => handleEliminarInscripcion(req)}
                                                        >
                                                            <Trash2 size={14} /> Eliminar inscripción
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                            onClick={() => handleResolve(req.id, 'resuelta')}
                                                        >
                                                            <CheckCircle size={14} /> Marcar resuelta
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: req.campo === 'eliminar_inscripcion' ? 1 : undefined }}
                                                        onClick={() => handleResolve(req.id, 'rechazada')}
                                                    >
                                                        <XCircle size={14} /> Rechazar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 500,
                    background: toast.tipo === 'success' ? '#166534' : '#7f1d1d',
                    color: '#fff',
                    padding: '12px 20px', borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 'var(--text-sm)'
                }}>
                    {toast.tipo === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
