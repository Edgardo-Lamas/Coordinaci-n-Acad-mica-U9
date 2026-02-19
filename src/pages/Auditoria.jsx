import { useState } from 'react';
import { AUDIT_LOG, DEMO_USERS } from '../data/mockData';
import { Shield, Search, Filter } from 'lucide-react';

export default function Auditoria() {
    const [search, setSearch] = useState('');
    const [filterAccion, setFilterAccion] = useState('');

    const acciones = [...new Set(AUDIT_LOG.map(l => l.accion))];

    const filtered = AUDIT_LOG.filter(log => {
        const matchSearch = !search ||
            log.detalle.toLowerCase().includes(search.toLowerCase()) ||
            log.accion.toLowerCase().includes(search.toLowerCase());
        const matchAccion = !filterAccion || log.accion === filterAccion;
        return matchSearch && matchAccion;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const getAccionBadge = (accion) => {
        if (accion.includes('LOGIN')) return 'badge-info';
        if (accion.includes('CREAR')) return 'badge-success';
        if (accion.includes('APROBAR')) return 'badge-purple';
        if (accion.includes('EMITIR')) return 'badge-warning';
        if (accion.includes('ELIMINAR') || accion.includes('ANULAR')) return 'badge-danger';
        return 'badge-neutral';
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Shield size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                        Auditoría del Sistema
                    </h1>
                    <p className="page-description">
                        Log completo de todas las acciones realizadas en el sistema
                    </p>
                </div>
            </div>

            {/* Explicación y código de colores */}
            <div className="card" style={{ marginBottom: 'var(--space-4)', background: 'rgba(255,255,255,0.95)', borderLeft: '4px solid var(--primary-500)' }}>
                <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        Este registro muestra <strong>todas las acciones realizadas en el sistema</strong>, ordenadas de la más reciente a la más antigua.
                        Permite rastrear quién realizó cada operación, cuándo y desde qué dirección IP — fundamental para la <strong>trazabilidad institucional</strong>.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código de colores:</span>
                        <span className="badge badge-info">LOGIN</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Inicios de sesión</span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span className="badge badge-success">CREAR</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Nuevos registros</span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span className="badge badge-purple">APROBAR</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Aprobaciones</span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span className="badge badge-warning">EMITIR</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Certificados</span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span className="badge badge-danger">ELIMINAR / ANULAR</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Bajas</span>
                    </div>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en el log de auditoría..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="toolbar-right">
                    <select className="filter-select" value={filterAccion} onChange={(e) => setFilterAccion(e.target.value)}>
                        <option value="">Todas las acciones</option>
                        {acciones.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fecha / Hora</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Entidad</th>
                            <th>Detalle</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(log => {
                            const usuario = DEMO_USERS.find(u => u.id === log.usuario_id);
                            return (
                                <tr key={log.id}>
                                    <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-xs)' }}>
                                        {new Date(log.fecha).toLocaleString('es-AR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{usuario?.nombre || `ID: ${log.usuario_id}`}</td>
                                    <td>
                                        <span className={`badge ${getAccionBadge(log.accion)}`}>
                                            {log.accion}
                                        </span>
                                    </td>
                                    <td>{log.entidad}</td>
                                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>{log.detalle}</td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                                        {log.ip}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
