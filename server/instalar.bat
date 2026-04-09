@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   GEA9 — Instalación del Servidor    ║
echo  ║   Gestión Académica · Unidad 9        ║
echo  ╚══════════════════════════════════════╝
echo.

:: Verificar que Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js no está instalado.
    echo  Descargalo de https://nodejs.org - versión LTS recomendada.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo  [OK] Node.js %%v encontrado.

:: Instalar dependencias
echo.
echo  Instalando dependencias...
npm install
if errorlevel 1 (
    echo  [ERROR] Falló la instalación de dependencias.
    pause
    exit /b 1
)
echo  [OK] Dependencias instaladas.

:: Registrar como servicio de Windows con NSSM
echo.
echo  Registrando GEA9 como servicio de Windows...
set NSSM=C:\GEA9\herramientas\nssm.exe
set NODE_PATH=
for /f "tokens=*" %%i in ('where node') do set NODE_PATH=%%i
set SERVER_PATH=%~dp0index.js

if not exist "%NSSM%" (
    echo  [AVISO] nssm.exe no encontrado en C:\GEA9\herramientas\
    echo  El servidor NO se registró como servicio automático.
    echo  Podés iniciarlo manualmente con: iniciar.bat
    goto :fin
)

"%NSSM%" install GEA9Servidor "%NODE_PATH%" "%SERVER_PATH%"
"%NSSM%" set GEA9Servidor AppDirectory "%~dp0"
"%NSSM%" set GEA9Servidor DisplayName "GEA9 - Servidor Central"
"%NSSM%" set GEA9Servidor Description "Servidor de la aplicacion Gestion Academica Unidad 9"
"%NSSM%" set GEA9Servidor Start SERVICE_AUTO_START
"%NSSM%" start GEA9Servidor

echo  [OK] Servicio GEA9Servidor instalado y arrancado.

:fin
echo.
echo  ══════════════════════════════════════════
echo  Instalación completada.
echo  El servidor estará disponible en:
echo  http://localhost:3001
echo  ══════════════════════════════════════════
echo.
pause
