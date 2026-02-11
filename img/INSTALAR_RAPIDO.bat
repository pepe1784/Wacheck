@echo off
REM ===================================================
REM INSTALADOR RAPIDO DE HERRAMIENTAS WACHECK
REM ===================================================

echo.
echo ===================================================
echo   INSTALADOR DE HERRAMIENTAS WACHECK
echo ===================================================
echo.

echo Verificando instalaciones...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js instalado
) else (
    echo [X] Node.js NO instalado
    echo     Descarga: https://nodejs.org/
)

REM Verificar Cordova
where cordova >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Cordova instalado
) else (
    echo [X] Cordova NO instalado
)

echo.
echo ===================================================
echo   CONFIGURACION DE PERFIL POWERSHELL
echo ===================================================
echo.

set /p config="Configurar comandos permanentes? (S/N): "
if /i not "%config%"=="S" goto SKIP_CONFIG

echo.
echo Agregando comandos al perfil de PowerShell...
echo.

REM Obtener ruta del perfil
for /f "tokens=*" %%a in ('powershell -command "echo $PROFILE"') do set PROFILE_PATH=%%a

REM Crear carpeta del perfil si no existe
powershell -command "if (!(Test-Path (Split-Path '%PROFILE_PATH%'))) { New-Item -Path (Split-Path '%PROFILE_PATH%') -ItemType Directory -Force | Out-Null }"

REM Crear perfil si no existe
if not exist "%PROFILE_PATH%" (
    echo # PowerShell Profile > "%PROFILE_PATH%"
)

REM Agregar import de WacheckTools
powershell -command "$scriptPath = Join-Path '%~dp0' 'WacheckTools.ps1'; $profileContent = Get-Content '%PROFILE_PATH%' -Raw -ErrorAction SilentlyContinue; if (-not ($profileContent -like '*WacheckTools.ps1*')) { Add-Content '%PROFILE_PATH%' \"`n# Wacheck Development Tools`n. '$scriptPath'\"; Write-Host 'Perfil configurado' -ForegroundColor Green } else { Write-Host 'Perfil ya estaba configurado' -ForegroundColor Yellow }"

echo.
echo [OK] Comandos agregados al perfil de PowerShell
echo.
echo Los siguientes comandos estaran disponibles SIEMPRE:
echo   - server          (iniciar servidor web)
echo   - build           (compilar APK)
echo   - studio          (abrir Android Studio)
echo   - ip              (ver IP local)
echo   - check           (verificar herramientas)
echo   - Get-WacheckHelp (ver todos los comandos)
echo.

:SKIP_CONFIG

echo.
echo ===================================================
echo   ACCESOS DIRECTOS
echo ===================================================
echo.

set /p shortcuts="Crear accesos directos en el escritorio? (S/N): "
if /i not "%shortcuts%"=="S" goto SKIP_SHORTCUTS

REM Crear acceso directo al menu
powershell -command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Wacheck Tools.lnk'); $Shortcut.TargetPath = '%~dp0HERRAMIENTAS_DEV.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Save()"

echo [OK] Acceso directo creado: Wacheck Tools.lnk

:SKIP_SHORTCUTS

echo.
echo ===================================================
echo   INSTALACION COMPLETADA
echo ===================================================
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Cierra y abre VS Code (para aplicar cambios)
echo 2. En la terminal escribe: check
echo 3. O ejecuta: HERRAMIENTAS_DEV.bat
echo.
echo Para ver todos los comandos: Get-WacheckHelp
echo.

pause
