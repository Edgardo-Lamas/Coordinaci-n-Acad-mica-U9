import { useState } from 'react';
import { SECTORES } from '../data/mockData';
import { getCertificados, getCursos, getInternos, getInscripciones, getCapacitadores } from '../data/dataService';
import { BarChart2, Award, BookOpen, Clock, Download } from 'lucide-react';
import { exportCertificados } from '../utils/exportExcel';

export default function Reportes() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

    const [filterYear, setFilterYear] = useState(String(currentYear));
    const [filterSector, setFilterSector] = useState('');

    const certificados = getCertificados();
    const cursos = getCursos();
    const internos = getInternos();
    const inscripciones = getInscripciones();
    const capacitadores = getCapacitadores();

    // Solo certificados emitidos del año/sector seleccionado
    const certsEmitidos = certificados.filter(cert => {
        if (cert.estado !== 'emitido') return false;
        if (filterYear && !(cert.fecha_emision || '').startsWith(filterYear)) return false;
        if (filterSector) {
            const insc = inscripciones.find(i => i.id === cert.inscripcion_id);
            const curso = insc ? cursos.find(c => c.id === insc.curso_id) : null;
            if (!curso || String(curso.sector_id) !== filterSector) return false;
        }
        return true;
    });

    // Inscripciones aprobadas del período (por fecha_fin_curso o fecha_inscripcion)
    const inscAprobadas = inscripciones.filter(insc => {
        if (insc.calificacion !== 'aprobado') return false;
        const ref = insc.fecha_fin_curso || insc.fecha_inscripcion || '';
        if (filterYear && !ref.startsWith(filterYear)) return false;
        if (filterSector) {
            const curso = cursos.find(c => c.id === insc.curso_id);
            if (!curso || String(curso.sector_id) !== filterSector) return false;
        }
        return true;
    });

    // Cursos con al menos 1 certificado emitido en el período
    const cursosConCert = new Set(certsEmitidos.map(cert => {
        const insc = inscripciones.find(i => i.id === cert.inscripcion_id);
        return insc?.curso_id;
    }).filter(Boolean));

    // Horas de programas dictados (cada curso cuenta una sola vez)
    const totalHorasCursos = [...cursosConCert].reduce((sum, cursoId) => {
        const curso = cursos.find(c => c.id === cursoId);
        return sum + (curso?.carga_horaria || 0);
    }, 0);

    // Horas-persona recibidas (carga_horaria × certs emitidos por curso)
    const totalHorasPersona = certsEmitidos.reduce((sum, cert) => {
        const insc = inscripciones.find(i => i.id === cert.inscripcion_id);
        const curso = insc ? cursos.find(c => c.id === insc.curso_id) : null;
        return sum + (curso?.carga_horaria || 0);
    }, 0);

    // Agrupar por curso
    const resumenPorCurso = cursos
        .filter(c => !filterSector || String(c.sector_id) === filterSector)
        .map(curso => {
            const inscCurso = inscripciones.filter(i => i.curso_id === curso.id);
            const aprobados = inscCurso.filter(i => i.calificacion === 'aprobado').length;
            const certsDelCurso = certsEmitidos.filter(cert => {
                const insc = inscripciones.find(i => i.id === cert.inscripcion_id);
                return insc?.curso_id === curso.id;
            }).length;
            const sector = SECTORES.find(s => s.id === curso.sector_id);
            const cap = capacitadores.find(c => c.id === curso.capacitador_id);
            return {
                curso,
                sector,
                cap,
                inscriptos: inscCurso.length,
                aprobados,
                certsEmitidos: certsDelCurso,
            };
        })
        .filter(r => r.inscriptos > 0 || r.certsEmitidos > 0)
        .sort((a, b) => b.certsEmitidos - a.certsEmitidos);

    const handleExportar = () => {
        exportCertificados(
            certsEmitidos,
            internos, cursos, inscripciones, SECTORES
        );
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-description">Resumen de actividad académica por período</p>
                </div>
                {certsEmitidos.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={handleExportar} title="Exportar a Excel">
                        <Download size={16} /> Exportar
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="toolbar" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="toolbar-left">
                    <select
                        className="filter-select"
                        value={filterYear}
                        onChange={e => setFilterYear(e.target.value)}
                    >
                        <option value="">Todos los años</option>
                        {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                    <select
                        className="filter-select"
                        value={filterSector}
                        onChange={e => setFilterSector(e.target.value)}
                    >
                        <option value="">Todos los sectores</option>
                        {SECTORES.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon green"><Award size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Certificados emitidos</div>
                        <div className="stat-value">{certsEmitidos.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue"><BookOpen size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Inscriptos aprobados</div>
                        <div className="stat-value">{inscAprobadas.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon teal"><Clock size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Hs. de programas dictados</div>
                        <div className="stat-value">{totalHorasCursos}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 2 }}>
                            suma de cursos únicos
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><Clock size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-label">Hs. de formación recibidas</div>
                        <div className="stat-value">{totalHorasPersona}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 2 }}>
                            horas × interno certificado
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla resumen por curso */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Tipo</th>
                            <th>Sector</th>
                            <th>Capacitador</th>
                            <th>Inscriptos</th>
                            <th>Aprobados</th>
                            <th>Certs. emitidos</th>
                            <th>Carga hs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumenPorCurso.length > 0 ? resumenPorCurso.map(r => (
                            <tr key={r.curso.id}>
                                <td style={{ fontWeight: 600 }}>{r.curso.nombre}</td>
                                <td><span className="badge badge-neutral">{r.curso.tipo}</span></td>
                                <td style={{ fontSize: 'var(--text-sm)' }}>{r.sector?.nombre || '—'}</td>
                                <td style={{ fontSize: 'var(--text-sm)' }}>{r.cap?.nombre || '—'}</td>
                                <td style={{ textAlign: 'center' }}>{r.inscriptos}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ color: r.aprobados > 0 ? 'var(--success)' : 'inherit', fontWeight: r.aprobados > 0 ? 600 : 400 }}>
                                        {r.aprobados}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {r.certsEmitidos > 0
                                        ? <span className="badge badge-success">{r.certsEmitidos}</span>
                                        : <span style={{ color: 'var(--gray-400)' }}>0</span>
                                    }
                                </td>
                                <td style={{ textAlign: 'center' }}>{r.curso.carga_horaria || '—'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8}>
                                    <div className="empty-state">
                                        <BarChart2 size={48} className="empty-icon" />
                                        <div className="empty-title">Sin datos para el período seleccionado</div>
                                        <div className="empty-text">
                                            Ajustá los filtros o emití certificados para ver el resumen.
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
