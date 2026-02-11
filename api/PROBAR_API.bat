@echo off
echo ========================================
echo   Prueba de API HYBRID - Wacheck
echo ========================================
echo.

REM Verificar si XAMPP esta corriendo
echo [1/3] Verificando si Apache esta corriendo...
curl -s http://localhost > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Apache no esta corriendo. Inicia XAMPP primero.
    pause
    exit /b
)
echo [OK] Apache esta corriendo

echo.
echo [2/3] Verificando API Hybrid...
curl -s "http://localhost/Wacheck/api/user_handler_HYBRID.php?action=ping"
echo.

echo.
echo [3/3] Instrucciones:
echo.
echo 1. Si ves {"status":"ok","source":"web-apk-hybrid"} entonces la API funciona!
echo 2. Si ves un error de base de datos:
echo    - Abre phpMyAdmin (http://localhost/phpmyadmin)
echo    - Crea una base de datos llamada "wacheck_db"
echo    - La tabla se creara automaticamente
echo.
echo 3. Para probar desde el juego:
echo    - Abre index.html en el navegador
echo    - Intenta registrarte o iniciar sesion
echo.
echo 4. IMPORTANTE: Para subir a produccion, cambia $useProduction = true
echo    en el archivo user_handler_HYBRID.php (linea 18)
echo.
echo ========================================
pause
