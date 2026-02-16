// Mock Data for Demo Mode
// This data simulates the Supabase backend for development/demo purposes

export const ROLES = {
  ADMIN: 'administrador',
  COORDINACION: 'coordinacion',
  RESPONSABLE: 'responsable',
  CARGADOR: 'cargador_datos'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador / Jefatura',
  [ROLES.COORDINACION]: 'Coordinación Académica',
  [ROLES.RESPONSABLE]: 'Responsable de Sector',
  [ROLES.CARGADOR]: 'Cargador de Datos (PPL)'
};

export const SECTORES = [
  { id: 1, nombre: 'AGORA', descripcion: 'Sector Agora' },
  { id: 2, nombre: 'CEUSTA', descripcion: 'Centro de Estudios Universitarios' },
  { id: 3, nombre: 'TALLERES 404', descripcion: 'Talleres de Formación 404' },
  { id: 4, nombre: 'PABELLÓN IGLESIA', descripcion: 'Pabellón Iglesia' },
  { id: 5, nombre: 'COM. EDUCATIVA JUANA MANSO', descripcion: 'Comunidad Educativa Juana Manso' },
  { id: 6, nombre: 'CENTRO CULTURAL FREIRE', descripcion: 'Centro Cultural Freire' },
  { id: 7, nombre: 'COMITÉ POR LA TORTURA', descripcion: 'Comité por la Tortura' },
  { id: 8, nombre: 'SANIDAD', descripcion: 'Sector Sanidad' },
  { id: 9, nombre: 'RESERVA 1', descripcion: 'Sector de Reserva 1' },
  { id: 10, nombre: 'RESERVA 2', descripcion: 'Sector de Reserva 2' },
];

export const DEMO_USERS = [
  // Administradores
  {
    id: 1,
    email: 'admin@sistema.gob.ar',
    password: 'admin123',
    nombre: 'Carlos Mendoza',
    rol: ROLES.ADMIN,
    sector_id: null,
    activo: true
  },
  // Coordinadores académicos
  {
    id: 2,
    email: 'coord1@sistema.gob.ar',
    password: 'coord123',
    nombre: 'María López',
    rol: ROLES.COORDINACION,
    sector_id: null,
    activo: true
  },
  {
    id: 3,
    email: 'coord2@sistema.gob.ar',
    password: 'coord123',
    nombre: 'Ana García',
    rol: ROLES.COORDINACION,
    sector_id: null,
    activo: true
  },
  {
    id: 4,
    email: 'coord3@sistema.gob.ar',
    password: 'coord123',
    nombre: 'Patricia Ruiz',
    rol: ROLES.COORDINACION,
    sector_id: null,
    activo: true
  },
  // Responsables de sector
  {
    id: 5,
    email: 'resp.agora@sistema.gob.ar',
    password: 'resp123',
    nombre: 'Roberto Díaz',
    rol: ROLES.RESPONSABLE,
    sector_id: 1,
    activo: true
  },
  {
    id: 6,
    email: 'resp.ceusta@sistema.gob.ar',
    password: 'resp123',
    nombre: 'Laura Fernández',
    rol: ROLES.RESPONSABLE,
    sector_id: 2,
    activo: true
  },
  {
    id: 7,
    email: 'resp.talleres@sistema.gob.ar',
    password: 'resp123',
    nombre: 'Pedro Martínez',
    rol: ROLES.RESPONSABLE,
    sector_id: 3,
    activo: true
  },
  // Cargadores de datos por sector (2 PPL por sector)
  // AGORA (Sector 1)
  {
    id: 8,
    email: 'carga.agora.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Juan Carlos Vera',
    rol: ROLES.CARGADOR,
    sector_id: 1,
    activo: true
  },
  {
    id: 9,
    email: 'carga.agora.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Miguel Ángel González',
    rol: ROLES.CARGADOR,
    sector_id: 1,
    activo: true
  },
  // CEUSTA (Sector 2)
  {
    id: 10,
    email: 'carga.ceusta.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Sebastián López',
    rol: ROLES.CARGADOR,
    sector_id: 2,
    activo: true
  },
  {
    id: 11,
    email: 'carga.ceusta.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Fernando Romero',
    rol: ROLES.CARGADOR,
    sector_id: 2,
    activo: true
  },
  // TALLERES 404 (Sector 3)
  {
    id: 12,
    email: 'carga.talleres.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Matías García',
    rol: ROLES.CARGADOR,
    sector_id: 3,
    activo: true
  },
  {
    id: 13,
    email: 'carga.talleres.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Ricardo Flores',
    rol: ROLES.CARGADOR,
    sector_id: 3,
    activo: true
  },
  // PABELLÓN IGLESIA (Sector 4)
  {
    id: 14,
    email: 'carga.iglesia.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Daniel Muñoz',
    rol: ROLES.CARGADOR,
    sector_id: 4,
    activo: true
  },
  {
    id: 15,
    email: 'carga.iglesia.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Gustavo Sánchez',
    rol: ROLES.CARGADOR,
    sector_id: 4,
    activo: true
  },
  // COM. EDUCATIVA JUANA MANSO (Sector 5)
  {
    id: 16,
    email: 'carga.manso.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Alejandro Ponce',
    rol: ROLES.CARGADOR,
    sector_id: 5,
    activo: true
  },
  {
    id: 17,
    email: 'carga.manso.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Oscar Castillo',
    rol: ROLES.CARGADOR,
    sector_id: 5,
    activo: true
  },
  // CENTRO CULTURAL FREIRE (Sector 6)
  {
    id: 18,
    email: 'carga.freire.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Lucas Martín',
    rol: ROLES.CARGADOR,
    sector_id: 6,
    activo: true
  },
  {
    id: 19,
    email: 'carga.freire.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Andrés Vasquez',
    rol: ROLES.CARGADOR,
    sector_id: 6,
    activo: true
  },
  // COMITÉ POR LA TORTURA (Sector 7)
  {
    id: 20,
    email: 'carga.tortura.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Javier Quintero',
    rol: ROLES.CARGADOR,
    sector_id: 7,
    activo: true
  },
  {
    id: 21,
    email: 'carga.tortura.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Felipe Navarro',
    rol: ROLES.CARGADOR,
    sector_id: 7,
    activo: true
  },
  // SANIDAD (Sector 8)
  {
    id: 22,
    email: 'carga.sanidad.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Claudio Rioja',
    rol: ROLES.CARGADOR,
    sector_id: 8,
    activo: true
  },
  {
    id: 23,
    email: 'carga.sanidad.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Roberto Salazar',
    rol: ROLES.CARGADOR,
    sector_id: 8,
    activo: true
  },
  // RESERVA 1 (Sector 9)
  {
    id: 24,
    email: 'carga.reserva1.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Marcelo Bravo',
    rol: ROLES.CARGADOR,
    sector_id: 9,
    activo: true
  },
  {
    id: 25,
    email: 'carga.reserva1.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Héctor Fuentes',
    rol: ROLES.CARGADOR,
    sector_id: 9,
    activo: true
  },
  // RESERVA 2 (Sector 10)
  {
    id: 26,
    email: 'carga.reserva2.1@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Víctor Manuel Díaz',
    rol: ROLES.CARGADOR,
    sector_id: 10,
    activo: true
  },
  {
    id: 27,
    email: 'carga.reserva2.2@sistema.gob.ar',
    password: 'carga123',
    nombre: 'Raúl Escobar',
    rol: ROLES.CARGADOR,
    sector_id: 10,
    activo: true
  },
];

export const CAPACITADORES = [
  { id: 1, nombre: 'Prof. Juan Pérez', dni: '28456789', institucion: 'Universidad Nacional' },
  { id: 2, nombre: 'Lic. Susana Gómez', dni: '31234567', institucion: 'Instituto de Formación' },
  { id: 3, nombre: 'Ing. Marcos Torres', dni: '29876543', institucion: 'Centro de Capacitación Técnica' },
  { id: 4, nombre: 'Dra. Patricia Ruiz', dni: '27654321', institucion: 'Universidad Tecnológica' },
];

export const TIPOS_CURSO = [
  'Taller',
  'Capacitación',
  'Formación Profesional',
  'Educación Formal',
  'Seminario',
  'Curso Corto'
];

export const ESTADOS_CURSO = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  ARCHIVADO: 'archivado'
};

export const ESTADOS_CURSO_LABELS = {
  [ESTADOS_CURSO.PENDIENTE]: 'Pendiente',
  [ESTADOS_CURSO.APROBADO]: 'Aprobado',
  [ESTADOS_CURSO.EN_CURSO]: 'En Curso',
  [ESTADOS_CURSO.FINALIZADO]: 'Finalizado',
  [ESTADOS_CURSO.ARCHIVADO]: 'Archivado'
};

export const ESTADOS_CURSO_BADGES = {
  [ESTADOS_CURSO.PENDIENTE]: 'badge-warning',
  [ESTADOS_CURSO.APROBADO]: 'badge-info',
  [ESTADOS_CURSO.EN_CURSO]: 'badge-success',
  [ESTADOS_CURSO.FINALIZADO]: 'badge-neutral',
  [ESTADOS_CURSO.ARCHIVADO]: 'badge-neutral'
};

// Generate sample internos
const NOMBRES = [
  'ABEDALE MONTAÑO GUIDO', 'ABELLA BRAVO MARCELINO', 'ABEDI JULIAN ELVIS',
  'ACEVEDO MORALES GUILLERMO', 'ACEVEDO N.N. ALEXANDER', 'ACOSTA DI MARCO MIGUEL',
  'ACOSTA DÍAZ ALEJANDRO', 'ACOSTA GODOY DANIEL', 'ACOSTA HERRERA ARIEL',
  'ACOSTA KONOVALCHUK ALEJANDRO', 'ACOSTA MANZANELLI MARCOS', 'ACOSTA MOLINA ESTEBAN',
  'AGUIRRE LÓPEZ RAMÓN', 'ALARCÓN MEDINA FACUNDO', 'ALBORNOZ RÍOS CRISTIAN',
  'ALVAREZ CASTRO SERGIO', 'AMAYA QUIROGA DIEGO', 'ANDRADA PEREYRA LUCAS',
  'ARCE VILLALBA NICOLÁS', 'ARIAS DOMÍNGUEZ FERNANDO'
];

function generateInternos() {
  const internos = [];
  for (let i = 0; i < NOMBRES.length; i++) {
    const sectorId = (i % 10) + 1;
    internos.push({
      numero_interno: String(130000 + i * 137 + Math.floor(Math.random() * 100)),
      nombre_completo: NOMBRES[i],
      sector_actual: sectorId,
      fecha_ingreso: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      estado: i < 18 ? 'activo' : 'inactivo'
    });
  }
  return internos;
}

export const INTERNOS = generateInternos();

export const CURSOS = [
  {
    id: 1,
    nombre: 'Electricidad Básica',
    tipo: 'Formación Profesional',
    capacitador_id: 1,
    programa: 'Fundamentos de electricidad domiciliaria e industrial. Seguridad eléctrica.',
    carga_horaria: 120,
    fecha_inicio: '2025-03-01',
    fecha_fin: '2025-06-30',
    cupo_maximo: 25,
    estado: ESTADOS_CURSO.EN_CURSO,
    sector_id: 1
  },
  {
    id: 2,
    nombre: 'Alfabetización Digital',
    tipo: 'Capacitación',
    capacitador_id: 2,
    programa: 'Uso de computadora, procesador de texto, planilla de cálculo e Internet.',
    carga_horaria: 80,
    fecha_inicio: '2025-03-15',
    fecha_fin: '2025-07-15',
    cupo_maximo: 30,
    estado: ESTADOS_CURSO.EN_CURSO,
    sector_id: 2
  },
  {
    id: 3,
    nombre: 'Carpintería',
    tipo: 'Taller',
    capacitador_id: 3,
    programa: 'Trabajo en madera, herramientas manuales y eléctricas, construcción de muebles.',
    carga_horaria: 160,
    fecha_inicio: '2025-02-01',
    fecha_fin: '2025-08-31',
    cupo_maximo: 15,
    estado: ESTADOS_CURSO.EN_CURSO,
    sector_id: 3
  },
  {
    id: 4,
    nombre: 'Derechos Humanos y Ciudadanía',
    tipo: 'Seminario',
    capacitador_id: 4,
    programa: 'Marco legal, derechos fundamentales, participación ciudadana.',
    carga_horaria: 40,
    fecha_inicio: '2025-04-01',
    fecha_fin: '2025-05-15',
    cupo_maximo: 40,
    estado: ESTADOS_CURSO.APROBADO,
    sector_id: 5
  },
  {
    id: 5,
    nombre: 'Panadería y Pastelería',
    tipo: 'Formación Profesional',
    capacitador_id: 1,
    programa: 'Elaboración de pan, facturas, tortas y productos de pastelería.',
    carga_horaria: 100,
    fecha_inicio: '2025-01-15',
    fecha_fin: '2025-04-15',
    cupo_maximo: 20,
    estado: ESTADOS_CURSO.FINALIZADO,
    sector_id: 1
  },
  {
    id: 6,
    nombre: 'Teatro y Expresión Corporal',
    tipo: 'Taller',
    capacitador_id: 2,
    programa: 'Técnicas de actuación, improvisación, expresión corporal y vocal.',
    carga_horaria: 60,
    fecha_inicio: '2025-05-01',
    fecha_fin: '2025-07-31',
    cupo_maximo: 20,
    estado: ESTADOS_CURSO.PENDIENTE,
    sector_id: 6
  },
];

// Generate inscriptions with audit trail
export const INSCRIPCIONES = [
  { id: 1, interno_nro: INTERNOS[0].numero_interno, curso_id: 1, calificacion: 'en_curso', observaciones: '', fecha_inscripcion: '2025-03-01', fecha_inicio_curso: '2025-03-01', fecha_fin_curso: '2025-06-30', usuario_cargador_id: 8, fecha_carga: '2025-03-01T10:30:00' },
  { id: 2, interno_nro: INTERNOS[1].numero_interno, curso_id: 2, calificacion: 'en_curso', observaciones: '', fecha_inscripcion: '2025-03-15', fecha_inicio_curso: '2025-03-15', fecha_fin_curso: '2025-07-15', usuario_cargador_id: 10, fecha_carga: '2025-03-15T09:45:00' },
  { id: 3, interno_nro: INTERNOS[2].numero_interno, curso_id: 1, calificacion: 'en_curso', observaciones: 'Buen desempeño', fecha_inscripcion: '2025-03-01', fecha_inicio_curso: '2025-03-01', fecha_fin_curso: '2025-06-30', usuario_cargador_id: 9, fecha_carga: '2025-03-01T11:15:00' },
  { id: 4, interno_nro: INTERNOS[3].numero_interno, curso_id: 3, calificacion: 'en_curso', observaciones: '', fecha_inscripcion: '2025-02-01', fecha_inicio_curso: '2025-02-01', fecha_fin_curso: '2025-08-31', usuario_cargador_id: 12, fecha_carga: '2025-02-01T08:30:00' },
  { id: 5, interno_nro: INTERNOS[0].numero_interno, curso_id: 5, calificacion: 'aprobado', observaciones: 'Excelente rendimiento', fecha_inscripcion: '2025-01-15', fecha_inicio_curso: '2025-01-15', fecha_fin_curso: '2025-04-15', usuario_cargador_id: 8, fecha_carga: '2025-01-15T14:20:00' },
  { id: 6, interno_nro: INTERNOS[4].numero_interno, curso_id: 2, calificacion: 'en_curso', observaciones: '', fecha_inscripcion: '2025-03-15', fecha_inicio_curso: '2025-03-15', fecha_fin_curso: '2025-07-15', usuario_cargador_id: 10, fecha_carga: '2025-03-15T10:00:00' },
  { id: 7, interno_nro: INTERNOS[5].numero_interno, curso_id: 3, calificacion: 'en_curso', observaciones: '', fecha_inscripcion: '2025-02-01', fecha_inicio_curso: '2025-02-01', fecha_fin_curso: '2025-08-31', usuario_cargador_id: 13, fecha_carga: '2025-02-01T09:30:00' },
  { id: 8, interno_nro: INTERNOS[6].numero_interno, curso_id: 1, calificacion: 'desaprobado', observaciones: 'Abandonó', fecha_inscripcion: '2025-03-01', fecha_inicio_curso: '2025-03-01', fecha_fin_curso: '2025-06-30', usuario_cargador_id: 8, fecha_carga: '2025-03-01T10:45:00' },
];

export const CERTIFICADOS = [
  {
    codigo: 'CERT-2025-0001',
    inscripcion_id: 5,
    hash_integridad: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    fecha_emision: '2025-04-20',
    estado: 'emitido',
    pdf_url: null
  }
];

export const AUDIT_LOG = [
  { id: 1, usuario_id: 1, accion: 'LOGIN', entidad: 'usuarios', detalle: 'Inicio de sesión exitoso', fecha: '2025-02-14T10:00:00', ip: '192.168.1.1' },
  { id: 2, usuario_id: 2, accion: 'CREAR_CURSO', entidad: 'cursos', detalle: 'Creó curso "Electricidad Básica"', fecha: '2025-02-14T10:15:00', ip: '192.168.1.2' },
  { id: 3, usuario_id: 2, accion: 'APROBAR_CURSO', entidad: 'cursos', detalle: 'Aprobó curso "Electricidad Básica"', fecha: '2025-02-14T10:30:00', ip: '192.168.1.2' },
  { id: 4, usuario_id: 8, accion: 'CARGAR_INSCRIPCION', entidad: 'inscripciones', detalle: 'Cargó inscripción: interno #130000 en "Electricidad Básica"', fecha: '2025-03-01T10:30:00', ip: '192.168.1.50' },
  { id: 5, usuario_id: 2, accion: 'EMITIR_CERTIFICADO', entidad: 'certificados', detalle: 'Emitió certificado CERT-2025-0001', fecha: '2025-04-20T14:00:00', ip: '192.168.1.2' },
  { id: 6, usuario_id: 10, accion: 'CARGAR_INSCRIPCION', entidad: 'inscripciones', detalle: 'Cargó inscripción: interno #130200 en "Alfabetización Digital"', fecha: '2025-03-15T09:45:00', ip: '192.168.1.51' },
  { id: 7, usuario_id: 9, accion: 'CARGAR_INSCRIPCION', entidad: 'inscripciones', detalle: 'Cargó inscripción: interno #130400 en "Electricidad Básica"', fecha: '2025-03-01T11:15:00', ip: '192.168.1.52' },
  { id: 8, usuario_id: 4, accion: 'REVISAR_INSCRIPCIONES', entidad: 'inscripciones', detalle: 'Reviewed inscriptions cargadas en sector AGORA', fecha: '2025-03-01T15:00:00', ip: '192.168.1.55' },
  { id: 9, usuario_id: 2, accion: 'REVISAR_INSCRIPCIONES', entidad: 'inscripciones', detalle: 'Reviewed todas las inscripciones de la coordinación', fecha: '2025-03-02T10:00:00', ip: '192.168.1.2' },
];
