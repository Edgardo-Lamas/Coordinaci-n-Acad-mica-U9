@echo off
chcp 65001 >nul
echo  Iniciando GEA9 Servidor...
cd /d "%~dp0"
node index.js
pause
