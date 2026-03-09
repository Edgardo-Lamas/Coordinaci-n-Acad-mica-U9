import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, AlertCircle, Eye, EyeOff, Building2, GraduationCap as CoordIcon, Shield, Settings } from 'lucide-react';

const DEMO_ACCOUNTS = [
    {
        label: 'Administrador',
        desc: 'Gestión de usuarios y configuración',
        email: 'admin@sistema.gob.ar',
        password: 'admin123',
        icon: Settings,
        color: '#dc2626',
        badge: 'Admin'
    },
    {
        label: 'Jefatura del Penal',
        desc: 'Vista general — solo lectura',
        email: 'jefe@u9.gob.ar',
        password: 'jefe2025',
        icon: Shield,
        color: '#7c3aed',
        badge: 'Vista completa'
    },
    {
        label: 'Coordinación Académica',
        desc: 'Gestión completa del sistema',
        email: 'coord1@sistema.gob.ar',
        password: 'coord123',
        icon: CoordIcon,
        color: '#0ea5e9',
        badge: 'Acceso total'
    },
    {
        label: 'Responsable de Sector',
        desc: 'Solo sector AGORA',
        email: 'resp.agora@sistema.gob.ar',
        password: 'resp123',
        icon: Building2,
        color: '#10b981',
        badge: 'Acceso sectorial'
    },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (account) => {
        setError('');
        setLoadingAccount(account.email);
        try {
            await login(account.email, account.password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingAccount(null);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: 480, width: '100%', padding: '0 16px' }}>
                <div className="login-card">
                    {/* Logo / Header */}
                    <div className="login-logo">
                        <div className="logo-icon">
                            <GraduationCap size={32} color="white" />
                        </div>
                        <h1>Gestión Académica</h1>
                        <p>Sistema de Seguimiento — Unidad 9 La Plata</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="usuario@sistema.gob.ar"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '8px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: '#9ba3b0', padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading || !!loadingAccount}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: '2px' }} /> Ingresando...</>
                            ) : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Accesos rápidos para presentación */}
                    <div className="login-demo">
                        <div className="login-demo-title">Accesos de demostración</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {DEMO_ACCOUNTS.map(account => {
                                const Icon = account.icon;
                                const isThisLoading = loadingAccount === account.email;
                                return (
                                    <button
                                        key={account.email}
                                        onClick={() => handleDemoLogin(account)}
                                        disabled={loading || !!loadingAccount}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '12px 16px', borderRadius: 10,
                                            border: `1.5px solid ${account.color}22`,
                                            background: `${account.color}08`,
                                            cursor: loading || loadingAccount ? 'not-allowed' : 'pointer',
                                            opacity: (loading || (loadingAccount && !isThisLoading)) ? 0.5 : 1,
                                            transition: 'all 0.15s',
                                            textAlign: 'left', width: '100%',
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                            background: `${account.color}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {isThisLoading
                                                ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: '2px', borderColor: `${account.color}40`, borderTopColor: account.color }} />
                                                : <Icon size={20} color={account.color} />
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', lineHeight: 1.3 }}>
                                                {account.label}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>
                                                {account.desc}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, padding: '3px 8px',
                                            borderRadius: 20, background: `${account.color}18`,
                                            color: account.color, whiteSpace: 'nowrap', flexShrink: 0
                                        }}>
                                            {account.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
                            Entorno de demostración — datos de prueba
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
