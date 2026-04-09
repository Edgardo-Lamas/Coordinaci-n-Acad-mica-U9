@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   GEA9 — Actualización del Servidor  ║
echo  ╚══════════════════════════════════════╝
echo.
echo  Este proceso descargará la última versión desde GitHub
echo  y actualizará el servidor automáticamente.
echo.
pause

:: Verificar que Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Git no está instalado.
    echo  Descargalo de https://git-scm.com e instalalo primero.
    pause
    exit /b 1
)

:: Verificar conexión a internet
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Sin conexión a internet. Verificá la conexión y volvé a intentar.
    pause
    exit /b 1
)

echo  [OK] Conexión a internet verificada.
echo.

:: Detener el servicio GEA9 si está corriendo
echo  Deteniendo el servidor GEA9...
sc query GEA9Servidor >nul 2>&1
if not errorlevel 1 (
    net stop GEA9Servidor >nul 2>&1
    echo  [OK] Servidor detenido.
) else (
    echo  [INFO] El servicio no estaba corriendo.
)

:: Ir a la carpeta raíz del proyecto (un nivel arriba de server/)
cd /d "%~dp0.."

:: Descargar cambios desde GitHub
echo.
echo  Descargando actualizaciones desde GitHub...
git pull origin main
if errorlevel 1 (
    echo  [ERROR] No se pudo descargar la actualización.
    echo  Verificá la conexión o contactá a soporte: edgardolamas2000@gmail.com
    net start GEA9Servidor >nul 2>&1
    pause
    exit /b 1
)
echo  [OK] Código actualizado.

:: Instalar dependencias nuevas si las hay
echo.
echo  Verificando dependencias...
cd server
npm install --omit=dev
echo  [OK] Dependencias verificadas.

:: Reiniciar el servicio
echo.
echo  Reiniciando el servidor GEA9...
sc query GEA9Servidor >nul 2>&1
if not errorlevel 1 (
    net start GEA9Servidor >nul 2>&1
    echo  [OK] Servidor reiniciado correctamente.
) else (
    echo  [INFO] Iniciá el servidor manualmente con iniciar.bat
)

echo.
echo  ══════════════════════════════════════════
echo  Actualización completada exitosamente.
echo  Versión activa: la más reciente de GitHub
echo  ══════════════════════════════════════════
echo.
pause
