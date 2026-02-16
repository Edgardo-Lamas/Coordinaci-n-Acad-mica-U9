import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, Building2, BookOpen, ClipboardList,
    Award, Shield, Settings, LogOut, Menu, X, GraduationCap,
    FileSpreadsheet, UserCog
} from 'lucide-react';

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
            { path: '/mi-sector', label: 'Mi Sector', icon: Building2, roles: [ROLES.RESPONSABLE] },
            { path: '/cursos', label: 'Cursos', icon: BookOpen, roles: null },
            { path: '/inscripciones', label: 'Inscripciones', icon: ClipboardList, roles: null },
        ]
    },
    {
        section: 'CERTIFICACIÓN',
        items: [
            { path: '/certificados', label: 'Certificados', icon: Award, roles: [ROLES.ADMIN, ROLES.COORDINACION] },
        ]
    },
    {
        section: 'ADMINISTRACIÓN',
        items: [
            { path: '/importar', label: 'Importar Excel', icon: FileSpreadsheet, roles: [ROLES.ADMIN, ROLES.COORDINACION] },
            { path: '/auditoria', label: 'Auditoría', icon: Shield, roles: [ROLES.ADMIN] },
            { path: '/configuracion', label: 'Configuración', icon: Settings, roles: [ROLES.ADMIN] },
        ]
    }
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    </div>
                    <div className="header-right">
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
