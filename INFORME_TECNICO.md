# Informe Técnico: Sistema de Gestión y Seguimiento Académico (U9)

## 1. Resumen Ejecutivo
El sistema actual es una aplicación web moderna (SPA) desarrollada en **React** para la gestión de las actividades académicas dentro de la Unidad 9. Está diseñado para funcionar en un entorno de intranet o nube, con un fuerte enfoque en la jerarquía de roles y la facilidad de uso para la carga de datos.

Actualmente, el sistema se encuentra en una **fase de prototipo funcional avanzado (Fase de Mockup/Demo)**. Toda la lógica de negocio y las interfaces están implementadas y son funcionales, pero la persistencia de datos es simulada localmente.

## 2. Stack Tecnológico

### Frontend (Interfaz de Usuario)
-   **Framework**: React 19 (Última versión estable, alto rendimiento).
-   **Build Tool**: Vite (Carga instantánea, optimizado para desarrollo ágil).
-   **Enrutamiento**: React Router v7 (Gestión de navegación robusta).
-   **Estilos**: CSS Nativo con Diseño Responsivo (Adaptable a PC y Tablets).
-   **Iconografía**: Lucide React (Ligera y consistente).
-   **Manejo de Archivos**: SheetJS (`xlsx`) para procesamiento de Excel en el navegador.

### Backend & Datos (Estado Actual)
-   **Base de Datos**: Simulada (`mockData.js`). Los datos son estáticos o volátiles (se reinician al recargar, salvo la sesión).
-   **Autenticación**: Simulación local basada en `localStorage`. Soporta múltiples roles pero no es segura para producción sin un backend real.

## 3. Capacidades Actuales del Sistema

### 3.1 Gestión de Usuarios y Seguridad
-   **Multi-rol**: Soporte nativo para 4 niveles de acceso:
    -   **Administrador / Jefatura**: Acceso total y auditoría.
    -   **Coordinación Académica**: Gestión global de cursos y validaciones.
    -   **Responsable de Sector**: Vista limitada a su pabellón/sector.
    -   **Cargador de Datos (PPL)**: Usuario restringido para carga operativa.
-   **Rutas Protegidas**: El sistema evita accesos no autorizados a secciones críticas según el rol.

### 3.2 Módulos Funcionales
1.  **Dashboard (Panel de Control)**:
    -   Métricas en tiempo real (Internos activos, cursos, certificados).
    -   Vistas diferenciadas según el rol (un Responsable solo ve sus estadísticas).
2.  **Gestión de Internos**:
    -   Base de datos de estudiantes con legajo, ubicación y estado.
    -   **Historial Académico**: Perfil individual con trazabilidad de cursos realizados y notas.
3.  **Gestión de Cursos**:
    -   Ciclo de vida completo: Pendiente → En Curso → Finalizado → Archivado.
    -   Asignación de capacitadores y cupos.
4.  **Inscripciones y Calificaciones**:
    -   Flujo de carga de notas y estados (Aprobado, En Curso, Desaprobado).
    -   Generación automática de **Certificados de Asistencia** (Formato PDF/Imprimible).
5.  **Importación Masiva**:
    -   Módulo para cargar listados de internos desde Excel automáticamente, facilitando la migración de datos.

## 4. Análisis de Escalamiento y Mejoras (Roadmap)

Para llevar este sistema a un entorno de producción real y seguro, se recomiendan las siguientes evoluciones técnicas:

### 4.1 Prioridad Alta: Integración de Backend
-   **Persistencia Real**: Conectar la aplicación a una base de datos real (PostgreSQL o Supabase recomendado). Esto permitirá que los datos guardados no se pierdan.
-   **Autenticación Segura**: Implementar JWT (JSON Web Tokens) o OAuth para validar sesiones de forma segura contra un servidor.

### 4.2 Prioridad Media: Funcionalidades Avanzadas
-   **Auditoría (Logs)**: Registrar cada acción de creación/modificación (quién hizo qué y cuándo) para seguridad interna. El frontend ya tiene la estructura para visualizarlo (`Auditoria` page).
-   **Reportes PDF**: Generar listados de asistencia y actas de examen exportables.
-   **Notificaciones**: Alertas en pantalla para Coordinadores cuando se crea un nuevo curso que requiere aprobación.

### 4.3 Infraestructura
-   **PWA (Progressive Web App)**: Convertir la web en una aplicación instalable en Tablets/Celulares, permitiendo cierto funcionamiento offline (útil para conectividad intermitente en sectores).
-   **Dockerización**: Empaquetar el sistema para facilitar su despliegue en servidores del gobierno o intranet local.

## 5. Conclusión
El sistema cuenta con una **base arquitectónica sólida**. El código es modular, limpio y escalable. La interfaz está muy pulida y la experiencia de usuario (UX) es superior a la media en sistemas de gestión administrativa. 

El siguiente paso natural es la **fase de integración de datos**, donde se reemplazará el motor de simulación por una base de datos real, sin necesidad de descartar el trabajo de interfaz ya realizado.
