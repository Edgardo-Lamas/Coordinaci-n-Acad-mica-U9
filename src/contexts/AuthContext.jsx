import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, ROLES, ROLE_LABELS, SECTORES } from '../data/mockData';

const AuthContext = createContext(null);

// DEV MODE: Set to false to enable authentication requirement
const DEV_MODE = true;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for saved session
        const savedUser = localStorage.getItem('ga_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('ga_user');
            }
        } else if (DEV_MODE) {
            // Auto-login as admin in dev mode
            const defaultUser = DEMO_USERS.find(u => u.rol === ROLES.ADMIN);
            if (defaultUser) {
                const userData = {
                    id: defaultUser.id,
                    email: defaultUser.email,
                    nombre: defaultUser.nombre,
                    rol: defaultUser.rol,
                    rolLabel: ROLE_LABELS[defaultUser.rol],
                    sector_id: defaultUser.sector_id,
                    sectorNombre: null,
                };
                setUser(userData);
                localStorage.setItem('ga_user', JSON.stringify(userData));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Demo mode: check against mock users
        const found = DEMO_USERS.find(
            u => u.email === email && u.password === password && u.activo
        );

        if (!found) {
            throw new Error('Credenciales inválidas. Verifique email y contraseña.');
        }

        const userData = {
            id: found.id,
            email: found.email,
            nombre: found.nombre,
            rol: found.rol,
            rolLabel: ROLE_LABELS[found.rol],
            sector_id: found.sector_id,
            sectorNombre: found.sector_id
                ? SECTORES.find(s => s.id === found.sector_id)?.nombre
                : null,
        };

        localStorage.setItem('ga_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('ga_user');
        setUser(null);
    };

    const isAdmin = () => user?.rol === ROLES.ADMIN;
    const isCoordinacion = () => user?.rol === ROLES.COORDINACION;
    const isResponsable = () => user?.rol === ROLES.RESPONSABLE;
    const isCargador = () => user?.rol === ROLES.CARGADOR;

    const canAccess = (requiredRoles) => {
        if (!user) return false;
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.includes(user.rol);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAdmin,
            isCoordinacion,
            isResponsable,
            isCargador,
            canAccess,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
