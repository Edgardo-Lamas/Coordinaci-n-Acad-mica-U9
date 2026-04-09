@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   GEA9 — Crear acceso directo        ║
echo  ╚══════════════════════════════════════╝
echo.

:: URL del servidor — cambiar por la URL real de Cloudflare cuando esté lista
set GEA9_URL=https://gea9.u9.com

:: Ruta del ícono personalizado
set ICONO=C:\GEA9\gea9.ico

:: Verificar si existe ícono personalizado, sino usar el de Chrome
if not exist "%ICONO%" (
    set ICONO=C:\Program Files\Google\Chrome\Application\chrome.exe,0
)

:: Detectar Chrome (ruta estándar o ruta por usuario)
set CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" (
    set CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
)
if not exist "%CHROME%" (
    set CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
)
if not exist "%CHROME%" (
    echo  [ERROR] Google Chrome no está instalado.
    echo  Instalalo desde https://www.google.com/chrome
    pause
    exit /b 1
)

echo  [OK] Chrome encontrado.
echo  Creando acceso directo en el escritorio...

:: Crear el acceso directo con PowerShell
powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $sc = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'GEA9.lnk')); ^
   $sc.TargetPath = '%CHROME%'; ^
   $sc.Arguments = '--app=%GEA9_URL% --window-size=1366,768'; ^
   $sc.Description = 'GEA9 - Gestion Academica Unidad 9'; ^
   $sc.IconLocation = '%ICONO%'; ^
   $sc.Save()"

if errorlevel 1 (
    echo  [ERROR] No se pudo crear el acceso directo.
    pause
    exit /b 1
)

echo  [OK] Acceso directo creado en el escritorio.
echo.
echo  ══════════════════════════════════════════
echo  Listo. El icono "GEA9" aparece ahora
echo  en el escritorio. Doble clic para abrir.
echo  ══════════════════════════════════════════
echo.
pause
