import { createContext, useContext, useState } from 'react';
import { getCursos } from '../data/dataService';

const CicloLectivoContext = createContext(null);

const CURRENT_YEAR = String(new Date().getFullYear());

export function CicloLectivoProvider({ children }) {
    const [cicloActivo, setCicloActivoState] = useState(() => {
        return localStorage.getItem('ga_u9_ciclo_activo') || CURRENT_YEAR;
    });

    const getCiclosDisponibles = () => {
        const years = getCursos()
            .map(c => c.fecha_inicio?.slice(0, 4))
            .filter(y => y && /^\d{4}$/.test(y));
        return [...new Set([...years, CURRENT_YEAR])].sort().reverse();
    };

    const setCicloActivo = (year) => {
        localStorage.setItem('ga_u9_ciclo_activo', year);
        setCicloActivoState(year);
    };

    return (
        <CicloLectivoContext.Provider value={{ cicloActivo, setCicloActivo, getCiclosDisponibles, CURRENT_YEAR }}>
            {children}
        </CicloLectivoContext.Provider>
    );
}

export function useCicloLectivo() {
    return useContext(CicloLectivoContext);
}
