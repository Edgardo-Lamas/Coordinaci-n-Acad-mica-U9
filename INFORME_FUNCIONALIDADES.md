# Sistema de Gestión Académica — Unidad Penitenciaria N° 9, La Plata
**Informe de funcionalidades para Jefatura**

---

## Acceso al sistema — Control de usuarios

El sistema cuenta con **autenticación por usuario y contraseña**. Cada persona accede únicamente a la información que le corresponde según su rol institucional:

| Perfil | Acceso |
|---|---|
| **Jefatura del Penal** | Vista completa del sistema, sin modificar datos |
| **Coordinación Académica** | Gestión completa de toda la actividad académica |
| **Responsable de Sector** | Solo la actividad de su sector asignado |
| **Cargador de Datos** | Carga limitada dentro de su sector |

**Beneficio:** Cada actor institucional ve solo lo que necesita. La Jefatura puede supervisar el sistema en cualquier momento sin riesgo de modificar datos.

---

## 1. Dashboard — Tablero de control

La pantalla principal muestra en tiempo real:
- **Cantidad de internos activos** en el sistema
- **Cursos en curso y finalizados**
- **Inscripciones totales y aprobados**
- **Certificados emitidos** acumulados
- Gráficos de distribución de cursos por tipo y estado

**Beneficio:** La Jefatura puede ver el pulso de toda la actividad académica de un solo vistazo, sin necesidad de pedir informes manuales.

---

## 2. Gestión de Internos

Lista completa de privados de la libertad con búsqueda por nombre, número de interno o DNI. Cada ficha individual muestra:
- Datos personales (nombre, DNI, sector asignado, fecha de ingreso)
- **Historial completo de inscripciones** a cursos con calificaciones
- **Certificados obtenidos**
- Número de WhatsApp del familiar de contacto (para notificaciones)

**Importación desde Excel:** Los datos que genera Jefatura en planilla se importan directamente al sistema con un solo clic, sin transcripción manual.

**Beneficio:** Elimina la duplicación de registros en papel. La información de cada interno y su trayectoria educativa está centralizada, actualizada y accesible en segundos.

---

## 3. Gestión de Sectores

Vista global de los 10 sectores de la unidad (AGORA, CEUSTA, Talleres 404, Pabellón Iglesia, etc.) con el detalle de actividad académica de cada uno: internos activos, cursos disponibles, inscriptos.

**Beneficio:** Permite comparar la actividad entre sectores e identificar cuáles tienen mayor o menor participación en programas educativos.

---

## 4. Gestión de Cursos

Registro completo de todos los programas educativos:
- Nombre, tipo (taller, curso, seminario, formación profesional)
- Capacitador e institución que lo dicta
- Fechas de inicio y fin, carga horaria, cupo máximo
- Sector al que pertenece
- Estado del curso: Pendiente → En curso → Finalizado

La Coordinación puede **crear, editar y eliminar cursos** directamente desde la pantalla, sin necesidad de modificar archivos del sistema.

**Beneficio:** El catálogo de cursos refleja siempre la realidad institucional. Se puede planificar y registrar la oferta educativa con precisión.

---

## 5. Inscripciones

Registro de qué interno participa en qué curso. Cada inscripción tiene:
- Fechas de inicio y fin efectivas
- **Calificación**: en curso / aprobado / desaprobado / abandono
- Vinculación automática con el certificado correspondiente

**Beneficio:** Permite llevar el seguimiento individual de cada privado de la libertad a lo largo de su recorrido educativo, con trazabilidad completa.

---

## 6. Certificados — Emisión y Verificación

### Emisión
Cuando un interno aprueba un curso, el sistema genera automáticamente un **certificado numerado** (ej: CERT-2025-0012). La Coordinación lo emite con un clic, en forma individual o masiva para todos los aprobados de un curso.

El certificado incluye:
- Nombre completo y DNI del interno
- Nombre del curso, tipo y carga horaria
- Fechas de inicio y finalización
- Nombre del capacitador
- Fecha de emisión oficial
- **Código QR de verificación** y **hash de integridad**

### Exportación
Cada certificado puede descargarse como **PDF** (para imprimir) o como **imagen PNG** (para compartir digitalmente).

### Verificación de autenticidad
Cualquier persona que reciba un certificado puede escanear el QR o ingresar el código en la página pública del sistema. El sistema confirma si el certificado es **auténtico, válido y no fue alterado**.

**Beneficio clave:** Los certificados tienen respaldo institucional verificable. Ante una consulta de un empleador, organismo o institución educativa, la validez se comprueba en segundos. Elimina la posibilidad de falsificación.

---

## 7. Reportes por Período

Panel de estadísticas filtrables por **año** y **sector**:
- Total de certificados emitidos en el período
- Total de inscriptos aprobados
- Horas de programas dictados (cursos únicos)
- Horas de formación recibidas (horas × interno certificado)
- Tabla detallada por curso: inscriptos, aprobados, certificados emitidos, carga horaria

Todos los datos se pueden **exportar a Excel** para incluir en informes oficiales.

**Beneficio:** Proporciona los números exactos que requieren los informes al Servicio Penitenciario Bonaerense, el Ministerio de Justicia u organismos de control, sin trabajo de compilación manual.

---

## 8. Auditoría del Sistema

Registro automático e inalterable de **todas las acciones realizadas en el sistema**:
- Quién inició sesión y cuándo
- Quién creó o modificó un curso
- Quién aprobó una inscripción
- Quién emitió un certificado
- Quién importó datos de internos

**Beneficio:** Garantiza la **trazabilidad institucional**. Ante cualquier consulta o irregularidad, se puede saber exactamente quién hizo qué y en qué momento.

---

## 9. Gestión de Usuarios (Configuración)

El administrador puede **crear, editar y activar/desactivar** usuarios del sistema directamente desde la interfaz, sin asistencia técnica. Incluye asignación de rol y sector.

**Beneficio:** El sistema se adapta a los cambios de personal sin depender de un programador. Si un responsable de sector cambia, se actualiza en minutos.

---

## 10. Búsqueda Global

Barra de búsqueda disponible en todas las pantallas (atajo: `Ctrl+K`). Busca simultáneamente en internos (por nombre, número o DNI) y en cursos (por nombre), y navega directo al resultado.

**Beneficio:** Cualquier operador puede localizar a un interno o un curso en menos de 3 segundos, desde cualquier parte del sistema.

---

## Resumen ejecutivo

| Necesidad institucional | Solución en el sistema |
|---|---|
| ¿Cuántos internos están en programas educativos? | Dashboard + Reportes |
| ¿Qué certificados obtuvo un interno específico? | Ficha del interno |
| ¿Este certificado es auténtico? | Verificación por QR o código |
| ¿Cuántas horas de formación se dictaron este año? | Reportes por período |
| ¿Quién aprobó esta inscripción? | Log de Auditoría |
| ¿Qué sectores tienen más actividad académica? | Vista de Sectores |
| ¿Cómo actualizo la lista de internos cuando llega el Excel? | Importar Excel |

El sistema reemplaza el registro en papel y las planillas dispersas por una **fuente única de verdad**, accesible desde cualquier PC de la unidad, con controles de acceso por rol y respaldo completo de toda la actividad.

---

*Documento generado: marzo 2026*
*Sistema de Gestión Académica — UP N° 9 La Plata*
