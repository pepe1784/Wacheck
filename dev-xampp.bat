@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     Wacheck — Modo LOCAL (XAMPP)         ║
echo  ╚══════════════════════════════════════════╝
echo.

REM ── Verificar que XAMPP esté corriendo ──────────────────────────
echo [1/3] Verificando XAMPP...
tasklist /fi "imagename eq httpd.exe" 2>nul | find /i "httpd.exe" >nul
if errorlevel 1 (
    echo  XAMPP no esta corriendo. Iniciando Apache y MySQL...
    start "" "C:\xampp\xampp-control.exe"
    echo  Abre XAMPP Control Panel y pulsa Start en Apache y MySQL.
    pause
)

REM ── Activar .env local ──────────────────────────────────────────
echo [2/3] Activando entorno local...
if not exist "api\.env.prod" (
    copy "api\.env" "api\.env.prod" >nul
    echo  Backup de produccion guardado en api\.env.prod
)
copy ".env.xampp" "api\.env" >nul
echo  api/.env ahora apunta a localhost^/wacheck_dev

REM ── Crear DB si no existe ───────────────────────────────────────
echo [3/3] Creando base de datos wacheck_dev (si no existe)...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS wacheck_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if errorlevel 1 (
    echo  No se pudo conectar a MySQL. Asegurate de que MySQL este corriendo en XAMPP.
) else (
    "C:\xampp\mysql\bin\mysql.exe" -u root wacheck_dev < "wacheck_db_v3.sql" 2>nul
    echo  Schema importado en wacheck_dev.
)

echo.
echo  ✓ Listo. Abre en el navegador:
echo    http://localhost/Wacheck%%20-%%20copia/Wacheck/
echo    http://localhost/Wacheck%%20-%%20copia/Wacheck/admin/
echo.
echo  Para volver a produccion ejecuta: restore-prod.bat
echo.
pause
