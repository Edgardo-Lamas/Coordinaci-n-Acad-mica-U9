// Centralized Data Service — localStorage persistence for imported data
import { INTERNOS as MOCK_INTERNOS, CURSOS as MOCK_CURSOS, CAPACITADORES as MOCK_CAPACITADORES, INSCRIPCIONES as MOCK_INSCRIPCIONES } from './mockData';

const STORAGE_KEY = 'ga_u9_internos';
const CURSOS_KEY = 'ga_u9_cursos';
const CAPACITADORES_KEY = 'ga_u9_capacitadores';
const INSCRIPCIONES_KEY = 'ga_u9_inscripciones';

/**
 * Get the list of internos.
 * Returns imported data from localStorage if available, otherwise falls back to mock data.
 */
export function getInternos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading internos from localStorage:', e);
    }
    return MOCK_INTERNOS;
}

/**
 * Save the full list of internos to localStorage.
 */
export function saveInternos(internos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(internos));
    } catch (e) {
        console.error('Error saving internos to localStorage:', e);
        throw new Error('No se pudieron guardar los datos. Verifique el espacio de almacenamiento.');
    }
}

/**
 * Import internos from parsed Excel rows.
 * Returns { imported, skipped, errors[] }
 */
export function importInternosFromExcel(rows, idColumn, nameColumn, dniColumn) {
    const importErrors = [];
    const validInternos = [];
    let skipped = 0;

    rows.forEach((row, index) => {
        const id = idColumn ? String(row[idColumn]).trim() : '';
        const nombre = nameColumn ? String(row[nameColumn]).trim() : '';
        const dni = dniColumn ? String(row[dniColumn]).trim() : '';

        if (!id || !nombre) {
            importErrors.push(`Fila ${index + 2}: Datos incompletos (ID: "${id}", Nombre: "${nombre}")`);
            skipped++;
        } else {
            validInternos.push({
                numero_interno: id,
                nombre_completo: nombre,
                dni: dni || null,
                sector_actual: null,
                fecha_ingreso: new Date().toISOString().split('T')[0],
                estado: 'activo'
            });
        }
    });

    // Save to localStorage
    saveInternos(validInternos);

    return {
        total: rows.length,
        imported: validInternos.length,
        skipped,
        errors: importErrors.slice(0, 20) // Show first 20 errors
    };
}

/**
 * Check if there are imported internos in localStorage.
 */
export function hasImportedData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Clear imported data — revert to mock data.
 */
export function clearImportedInternos() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the count of internos for quick dashboard access.
 */
export function getInternosCount() {
    return getInternos().filter(i => i.estado === 'activo').length;
}

// ═══════════════════════════════════════════
// CURSOS
// ═══════════════════════════════════════════

/**
 * Get the list of cursos.
 * Returns data from localStorage if available, otherwise mock data.
 */
export function getCursos() {
    try {
        const stored = localStorage.getItem(CURSOS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading cursos from localStorage:', e);
    }
    return MOCK_CURSOS;
}

/**
 * Save the full list of cursos to localStorage.
 */
export function saveCursos(cursos) {
    try {
        localStorage.setItem(CURSOS_KEY, JSON.stringify(cursos));
    } catch (e) {
        console.error('Error saving cursos to localStorage:', e);
    }
}

// ═══════════════════════════════════════════
// CAPACITADORES
// ═══════════════════════════════════════════

/**
 * Get the list of capacitadores.
 */
export function getCapacitadores() {
    try {
        const stored = localStorage.getItem(CAPACITADORES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading capacitadores from localStorage:', e);
    }
    return MOCK_CAPACITADORES;
}

/**
 * Add a new capacitador and persist.
 * Returns the new capacitador with generated ID.
 */
export function addCapacitador(nombre, institucion) {
    const current = getCapacitadores();
    const maxId = current.reduce((max, c) => Math.max(max, c.id), 0);
    const nuevo = {
        id: maxId + 1,
        nombre: nombre.trim(),
        dni: '',
        institucion: (institucion || '').trim()
    };
    const updated = [...current, nuevo];
    try {
        localStorage.setItem(CAPACITADORES_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Error saving capacitadores to localStorage:', e);
    }
    return nuevo;
}

// ═══════════════════════════════════════════
// INSCRIPCIONES
// ═══════════════════════════════════════════

/**
 * Get the list of inscripciones.
 * Returns data from localStorage if available, otherwise mock data.
 */
export function getInscripciones() {
    try {
        const stored = localStorage.getItem(INSCRIPCIONES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading inscripciones from localStorage:', e);
    }
    return MOCK_INSCRIPCIONES;
}

/**
 * Save the full list of inscripciones to localStorage.
 */
export function saveInscripciones(inscripciones) {
    try {
        localStorage.setItem(INSCRIPCIONES_KEY, JSON.stringify(inscripciones));
    } catch (e) {
        console.error('Error saving inscripciones to localStorage:', e);
    }
}
