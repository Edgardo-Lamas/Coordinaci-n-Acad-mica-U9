// Centralized Data Service — localStorage persistence for imported data
import { INTERNOS as MOCK_INTERNOS } from './mockData';

const STORAGE_KEY = 'ga_u9_internos';

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
