// Centralized Data Service — localStorage persistence for imported data
import { INTERNOS as MOCK_INTERNOS, CURSOS as MOCK_CURSOS, CAPACITADORES as MOCK_CAPACITADORES, INSCRIPCIONES as MOCK_INSCRIPCIONES, CERTIFICADOS as MOCK_CERTIFICADOS } from './mockData';

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

// ═══════════════════════════════════════════
// CERTIFICADOS
// ═══════════════════════════════════════════

const CERTIFICADOS_KEY = 'ga_u9_certificados';
const WHATSAPP_KEY = 'ga_u9_config_whatsapp';

export function getCertificados() {
    try {
        const stored = localStorage.getItem(CERTIFICADOS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading certificados from localStorage:', e);
    }
    return MOCK_CERTIFICADOS;
}

export function saveCertificados(certificados) {
    try {
        localStorage.setItem(CERTIFICADOS_KEY, JSON.stringify(certificados));
    } catch (e) {
        console.error('Error saving certificados to localStorage:', e);
    }
}

/**
 * Crea un certificado en estado 'pendiente' para la inscripción dada.
 * Si ya existe uno para ese inscripcion_id, no crea duplicado.
 */
export function createCertificadoPendiente(inscripcionId) {
    const current = getCertificados();
    const existing = current.find(c => c.inscripcion_id === inscripcionId);
    if (existing) return existing;

    const year = new Date().getFullYear();
    const yearPrefix = `CERT-${year}-`;
    const maxNum = current
        .filter(c => c.codigo && c.codigo.startsWith(yearPrefix))
        .map(c => parseInt(c.codigo.replace(yearPrefix, ''), 10))
        .reduce((max, n) => (isNaN(n) ? max : Math.max(max, n)), 0);

    const codigo = `${yearPrefix}${String(maxNum + 1).padStart(4, '0')}`;

    const nuevo = {
        codigo,
        inscripcion_id: inscripcionId,
        hash_integridad: null,
        fecha_emision: null,
        estado: 'pendiente',
        pdf_url: null
    };

    saveCertificados([...current, nuevo]);
    return nuevo;
}

/**
 * Hash FNV-1a de 32 bits — determinístico, sin dependencias externas.
 * Genera un string hexadecimal de 8 caracteres.
 */
function fnv1a(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}

/**
 * Genera el hash de integridad del certificado a partir de sus datos únicos.
 * Formato: XXXXXXXX-XXXXXXXX-XXXXXXXX (24 chars hex, 3 segmentos de 8)
 */
export function generateHashIntegridad(codigo, inscripcion, fechaEmision) {
    const base = `${codigo}|${inscripcion?.interno_nro || ''}|${inscripcion?.curso_id || ''}|${fechaEmision}`;
    const seg1 = fnv1a(base);
    const seg2 = fnv1a(base + codigo);
    const seg3 = fnv1a(base + String(inscripcion?.interno_nro || '') + fechaEmision);
    return `${seg1}-${seg2}-${seg3}`;
}

/**
 * Emite (bulk) los certificados indicados por sus códigos.
 * Genera el hash_integridad en el momento de emisión.
 */
export function emitirCertificados(codigos) {
    const today = new Date().toISOString().split('T')[0];
    const current = getCertificados();
    const inscripciones = getInscripciones();

    const updated = current.map(c => {
        if (!codigos.includes(c.codigo)) return c;
        const inscripcion = inscripciones.find(i => i.id === c.inscripcion_id);
        const hash = generateHashIntegridad(c.codigo, inscripcion, today);
        return { ...c, estado: 'emitido', fecha_emision: today, hash_integridad: hash };
    });
    saveCertificados(updated);
    return updated;
}

export function getWhatsappConfig() {
    return localStorage.getItem(WHATSAPP_KEY) || '';
}

export function saveWhatsappConfig(number) {
    localStorage.setItem(WHATSAPP_KEY, number.trim());
}
