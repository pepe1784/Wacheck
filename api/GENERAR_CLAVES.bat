@echo off
REM ====================================
REM Generador de claves de seguridad
REM ====================================

echo ====================================
echo   GENERADOR DE CLAVES SEGURAS
echo   Wacheck API
echo ====================================
echo.

REM Detectar PHP en XAMPP
set PHP_PATH=
if exist "C:\xampp\php\php.exe" set PHP_PATH=C:\xampp\php\php.exe
if exist "%~dp0..\..\..\php\php.exe" set PHP_PATH=%~dp0..\..\..\php\php.exe
if exist "%PROGRAMFILES%\xampp\php\php.exe" set PHP_PATH=%PROGRAMFILES%\xampp\php\php.exe

if "%PHP_PATH%"=="" (
    echo [ERROR] No se encontro PHP en XAMPP.
    echo Intentando con PowerShell como alternativa...
    echo.
    goto POWERSHELL_METHOD
)

echo Usando PHP: %PHP_PATH%
echo Generando claves...
echo.

echo ============================================================
echo APP_SECRET_KEY (64 caracteres hex):
echo ============================================================
"%PHP_PATH%" -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
echo.

echo ============================================================
echo ENCRYPTION_KEY (32 bytes base64):
echo ============================================================
"%PHP_PATH%" -r "echo base64_encode(random_bytes(32)) . PHP_EOL;"
echo.

echo ============================================================
echo JWT_SECRET (64 bytes base64):
echo ============================================================
"%PHP_PATH%" -r "echo base64_encode(random_bytes(64)) . PHP_EOL;"
echo.

goto END_SCRIPT

:POWERSHELL_METHOD
echo Generando claves con PowerShell...
echo.

echo ============================================================
echo APP_SECRET_KEY (64 caracteres hex):
echo ============================================================
powershell -Command "$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); -join ($bytes | ForEach-Object {$_.ToString('x2')})"
echo.

echo ============================================================
echo ENCRYPTION_KEY (32 bytes base64):
echo ============================================================
powershell -Command "$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"
echo.

echo ============================================================
echo JWT_SECRET (64 bytes base64):
echo ============================================================
powershell -Command "$bytes = New-Object byte[] 64; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"
echo.

:END_SCRIPT

echo ====================================
echo IMPORTANTE:
echo 1. Copia estas claves al archivo .env
echo 2. NUNCA compartas estas claves
echo 3. Genera nuevas claves cada 6 meses
echo 4. NO uses estas claves si ya las mostraste a alguien
echo ====================================
echo.

pause
