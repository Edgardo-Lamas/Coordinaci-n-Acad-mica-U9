import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCicloLectivo } from '../contexts/CicloLectivoContext';
import { ROLES } from '../data/mockData';
import { getCorrectionRequests } from '../data/dataService';
import {
    LayoutDashboard, Users, Building2, BookOpen, ClipboardList,
    Award, Shield, Settings, LogOut, Menu, X, GraduationCap,
    FileSpreadsheet, BarChart2, ArrowLeft, AlertCircle, Calendar
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

// Rutas "raíz" donde el botón atrás no tiene sentido
const ROOT_PATHS = ['/', '/internos', '/cursos', '/inscripciones', '/sectores',
    '/mi-sector', '/certificados', '/reportes', '/auditoria', '/importar', '/configuracion', '/correcciones'];

const NAV_CONFIG = [
    {
        section: 'PRINCIPAL',
        items: [
            { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: null },
        ]
    },
    {
        section: 'GESTIÓN',
        items: [
            { path: '/internos', label: 'Internos', icon: Users, roles: null },
            { path: '/sectores', label: 'Sectores', icon: Building2, roles: [ROLES.ADMIN, ROLES.COORDINACION] },
            { path: '/mi-sector', label: 'Mi Sector', icon: Building2, roles: [ROLES.RESPONSABLE, ROLES.CARGADOR] },
            { path: '/cursos', label: 'Cursos', icon: BookOpen, roles: null },
            { path: '/inscripciones', label: 'Inscripciones', icon: ClipboardList, roles: null },
        ]
    },
    {
        section: 'CERTIFICACIÓN',
        items: [
            { path: '/certificados', label: 'Certificados', icon: Award, roles: [ROLES.ADMIN, ROLES.COORDINACION, ROLES.JEFE] },
            { path: '/reportes', label: 'Reportes', icon: BarChart2, roles: [ROLES.ADMIN, ROLES.COORDINACION, ROLES.JEFE] },
        ]
    },
    {
        section: 'ADMINISTRACIÓN',
        items: [
            { path: '/correcciones', label: 'Correcciones', icon: AlertCircle, roles: [ROLES.ADMIN, ROLES.COORDINACION, ROLES.JEFE], badge: true },
            { path: '/importar', label: 'Importar Excel', icon: FileSpreadsheet, roles: [ROLES.ADMIN, ROLES.COORDINACION] },
            { path: '/auditoria', label: 'Auditoría', icon: Shield, roles: [ROLES.ADMIN, ROLES.COORDINACION] },
            { path: '/configuracion', label: 'Configuración', icon: Settings, roles: [ROLES.ADMIN] },
        ]
    }
];

export default function Layout() {
    const { user, logout } = useAuth();
    const { cicloActivo, setCicloActivo, getCiclosDisponibles } = useCicloLectivo();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const ciclos = getCiclosDisponibles();

    const pendingCorrections = getCorrectionRequests().filter(r => r.estado === 'pendiente').length;

    const showBackButton = !ROOT_PATHS.includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const filteredNav = NAV_CONFIG.map(section => ({
        ...section,
        items: section.items.filter(item =>
            !item.roles || item.roles.includes(user?.rol)
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="app-layout">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <GraduationCap size={24} />
                    </div>
                    <div className="brand-text">
                        <div className="brand-title">Gestión Académica</div>
                        <div className="brand-subtitle">Unidad 9 — La Plata</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {filteredNav.map(section => (
                        <div className="nav-section" key={section.section}>
                            <div className="nav-section-title">{section.section}</div>
                            {section.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="nav-icon" size={20} />
                                    {item.label}
                                    {item.badge && pendingCorrections > 0 && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: 'var(--danger, #dc2626)',
                                            color: '#fff',
                                            borderRadius: 9999,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            minWidth: 18,
                                            height: 18,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 5px',
                                        }}>
                                            {pendingCorrections}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">{getInitials(user?.nombre || '')}</div>
                        <div className="user-info">
                            <div className="user-name">{user?.nombre}</div>
                            <div className="user-role">{user?.rolLabel}</div>
                        </div>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="main-area">
                <header className="header">
                    <div className="header-left">
                        <button
                            className="hamburger-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        {showBackButton && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => navigate(-1)}
                                style={{ color: 'rgba(255,255,255,0.7)', gap: 4 }}
                                title="Volver a la pantalla anterior"
                            >
                                <ArrowLeft size={16} /> Volver
                            </button>
                        )}
                    </div>
                    <GlobalSearch />
                    <div className="header-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                            <select
                                value={cicloActivo}
                                onChange={e => setCicloActivo(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    borderRadius: 6,
                                    color: 'white',
                                    padding: '3px 8px',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {ciclos.map(y => (
                                    <option key={y} value={y} style={{ background: '#1e40af', color: 'white' }}>{y}</option>
                                ))}
                            </select>
                        </div>
                        {user?.sectorNombre && (
                            <span className="badge badge-info">{user.sectorNombre}</span>
                        )}
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
