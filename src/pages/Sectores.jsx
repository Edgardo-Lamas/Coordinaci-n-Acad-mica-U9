import { useNavigate } from 'react-router-dom';
import { SECTORES, DEMO_USERS, ROLES, ESTADOS_CURSO } from '../data/mockData';
import { getInternos, getCursos } from '../data/dataService';
import { Building2, Users, BookOpen, UserCheck } from 'lucide-react';

const SECTOR_COLORS = [
    'linear-gradient(135deg, #3b69b4, #2b5399)',
    'linear-gradient(135deg, #00c1ab, #00877c)',
    'linear-gradient(135deg, #7c3aed, #5b21b6)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
];

export default function Sectores() {
    const navigate = useNavigate();
    const INTERNOS = getInternos();
    const CURSOS = getCursos();

    const sectoresData = SECTORES.map((sector, i) => {
        const internosCount = INTERNOS.filter(
            int => int.sector_actual === sector.id && int.estado === 'activo'
        ).length;
        const cursosActivos = CURSOS.filter(
            c => c.sector_id === sector.id && (c.estado === ESTADOS_CURSO.EN_CURSO || c.estado === ESTADOS_CURSO.APROBADO)
        ).length;
        const responsables = DEMO_USERS.filter(
            u => u.rol === ROLES.RESPONSABLE && u.sector_id === sector.id
        );

        return {
            ...sector,
            internosCount,
            cursosActivos,
            responsables,
            color: SECTOR_COLORS[i % SECTOR_COLORS.length]
        };
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sectores</h1>
                    <p className="page-description">
                        Los 10 sectores de la unidad con sus internos y cursos asignados
                    </p>
                </div>
            </div>

            <div className="sector-grid">
                {sectoresData.map(sector => (
                    <div
                        key={sector.id}
                        className="sector-card"
                        onClick={() => navigate(`/sectores/${sector.id}`)}
                    >
                        <div className="sector-card-header">
                            <div>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                    background: sector.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 'var(--space-3)'
                                }}>
                                    <Building2 size={20} color="white" />
                                </div>
                                <div className="sector-card-name">{sector.nombre}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 2 }}>
                                    {sector.descripcion}
                                </div>
                            </div>
                        </div>

                        <div className="sector-card-stats">
                            <div className="sector-stat">
                                <div className="sector-stat-value">{sector.internosCount}</div>
                                <div className="sector-stat-label">Internos</div>
                            </div>
                            <div className="sector-stat">
                                <div className="sector-stat-value">{sector.cursosActivos}</div>
                                <div className="sector-stat-label">Cursos</div>
                            </div>
                            <div className="sector-stat">
                                <div className="sector-stat-value">{sector.responsables.length}</div>
                                <div className="sector-stat-label">Responsables</div>
                            </div>
                        </div>

                        {sector.responsables.length > 0 && (
                            <div style={{
                                marginTop: 'var(--space-4)',
                                paddingTop: 'var(--space-3)',
                                borderTop: '1px solid var(--gray-100)'
                            }}>
                                {sector.responsables.map(resp => (
                                    <div key={resp.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                        fontSize: 'var(--text-xs)', color: 'var(--gray-500)',
                                        marginBottom: 4
                                    }}>
                                        <UserCheck size={12} />
                                        {resp.nombre}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
