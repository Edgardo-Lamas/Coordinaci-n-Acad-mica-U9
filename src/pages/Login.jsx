import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { label: 'Administrador', email: 'admin@sistema.gob.ar', password: 'admin123' },
    { label: 'Coordinación', email: 'coord1@sistema.gob.ar', password: 'coord123' },
    { label: 'Resp. AGORA', email: 'resp.agora@sistema.gob.ar', password: 'resp123' },
    { label: 'Resp. CEUSTA', email: 'resp.ceusta@sistema.gob.ar', password: 'resp123' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
        setEmail(account.email);
        setPassword(account.password);
        setError('');
        setLoading(true);
        try {
            await login(account.email, account.password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
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
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ba3b0',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: '2px' }} />
                                    Ingresando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    <div className="login-demo">
                        <div className="login-demo-title">Acceso rápido (Demo)</div>
                        <div className="demo-users">
                            {DEMO_ACCOUNTS.map(account => (
                                <button
                                    key={account.email}
                                    className="demo-user-btn"
                                    onClick={() => handleDemoLogin(account)}
                                    disabled={loading}
                                >
                                    <span className="role-name">{account.label}</span>
                                    <span className="role-email">{account.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
