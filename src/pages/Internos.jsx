import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { INTERNOS, SECTORES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Plus, ChevronLeft, ChevronRight, Eye, Edit, User
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function Internos() {
    const { isResponsable, user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterSector, setFilterSector] = useState(
        isResponsable() ? String(user.sector_id) : ''
    );
    const [filterEstado, setFilterEstado] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        return INTERNOS.filter(interno => {
            const matchSearch = !search ||
                interno.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
                interno.numero_interno.includes(search);
            const matchSector = !filterSector ||
                String(interno.sector_actual) === filterSector;
            const matchEstado = !filterEstado ||
                interno.estado === filterEstado;
            return matchSearch && matchSector && matchEstado;
        });
    }, [search, filterSector, filterEstado]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedInternos = filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Internos</h1>
                    <p className="page-description">
                        Registro central de personas privadas de la libertad
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/internos/nuevo')}>
                    <Plus size={18} /> Nuevo Interno
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o Nº de interno..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
                <div className="toolbar-right">
                    {!isResponsable() && (
                        <select
                            className="filter-select"
                            value={filterSector}
                            onChange={(e) => { setFilterSector(e.target.value); setPage(1); }}
                        >
                            <option value="">Todos los sectores</option>
                            {SECTORES.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    )}
                    <select
                        className="filter-select"
                        value={filterEstado}
                        onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
                    >
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nº Interno</th>
                            <th>Nombre Completo</th>
                            <th>Sector</th>
                            <th>Fecha Ingreso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInternos.length > 0 ? paginatedInternos.map(interno => {
                            const sector = SECTORES.find(s => s.id === interno.sector_actual);
                            return (
                                <tr key={interno.numero_interno}>
                                    <td>
                                        <strong style={{ color: 'var(--primary-700)' }}>
                                            #{interno.numero_interno}
                                        </strong>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: 32, height: 32,
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--primary-50)',
                                                color: 'var(--primary-600)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0
                                            }}>
                                                {interno.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{interno.nombre_completo}</span>
                                        </div>
                                    </td>
                                    <td>{sector?.nombre || '—'}</td>
                                    <td>{new Date(interno.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                                    <td>
                                        <span className={`badge ${interno.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                                            {interno.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                title="Ver ficha"
                                                onClick={() => navigate(`/internos/${interno.numero_interno}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn btn-ghost btn-icon btn-sm" title="Editar">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">
                                        <User size={48} className="empty-icon" />
                                        <div className="empty-title">No se encontraron internos</div>
                                        <div className="empty-text">
                                            Intente con otro término de búsqueda o modifique los filtros.
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {filtered.length > ITEMS_PER_PAGE && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} internos
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                className="pagination-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
