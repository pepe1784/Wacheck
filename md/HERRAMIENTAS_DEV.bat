@echo off
REM ========================================
REM WACHECK - MENU PRINCIPAL DE DESARROLLO
REM Herramientas para cualquier proyecto
REM ========================================

:MENU
cls
echo.
echo ================================================
echo   WACHECK - HERRAMIENTAS DE DESARROLLO
echo   Menu Principal
echo ================================================
echo.
echo  SERVIDOR Y PRUEBAS:
echo  [1] Iniciar servidor local (puerto 8080)
echo  [2] Iniciar servidor local (puerto 3000)
echo  [3] Abrir en navegador (localhost)
echo  [4] Ver mi IP local
echo.
echo  CORDOVA/APK:
echo  [5] Crear nuevo proyecto Cordova
echo  [6] Agregar plataforma Android
echo  [7] Compilar APK (debug)
echo  [8] Compilar APK (release - firmada)
echo  [9] Abrir proyecto en Android Studio
echo.
echo  UTILIDADES:
echo  [10] Instalar dependencias (npm install)
echo  [11] Actualizar Cordova
echo  [12] Limpiar cache y rebuild
echo  [13] Ver version de herramientas
echo.
echo  ANDROID STUDIO:
echo  [14] Abrir Android Studio
echo  [15] Abrir SDK Manager
echo  [16] Verificar licencias Android
echo  [17] Listar dispositivos conectados
echo.
echo  CONFIGURACION:
echo  [18] Configurar variables de entorno
echo  [19] Instalar todas las herramientas
echo  [20] Verificar instalaciones
echo.
echo  [0] Salir
echo.
set /p opcion="Selecciona una opcion: "

if "%opcion%"=="1" goto SERVIDOR_8080
if "%opcion%"=="2" goto SERVIDOR_3000
if "%opcion%"=="3" goto ABRIR_NAVEGADOR
if "%opcion%"=="4" goto VER_IP
if "%opcion%"=="5" goto CREAR_CORDOVA
if "%opcion%"=="6" goto AGREGAR_ANDROID
if "%opcion%"=="7" goto BUILD_DEBUG
if "%opcion%"=="8" goto BUILD_RELEASE
if "%opcion%"=="9" goto ABRIR_ANDROID_STUDIO_PROJECT
if "%opcion%"=="10" goto NPM_INSTALL
if "%opcion%"=="11" goto UPDATE_CORDOVA
if "%opcion%"=="12" goto CLEAN_BUILD
if "%opcion%"=="13" goto VER_VERSIONES
if "%opcion%"=="14" goto ABRIR_ANDROID_STUDIO
if "%opcion%"=="15" goto ABRIR_SDK_MANAGER
if "%opcion%"=="16" goto VERIFICAR_LICENCIAS
if "%opcion%"=="17" goto LISTAR_DISPOSITIVOS
if "%opcion%"=="18" goto CONFIG_VARIABLES
if "%opcion%"=="19" goto INSTALAR_TODO
if "%opcion%"=="20" goto VERIFICAR_TODO
if "%opcion%"=="0" goto SALIR

echo Opcion invalida
pause
goto MENU

REM ========================================
REM SERVIDOR Y PRUEBAS
REM ========================================

:SERVIDOR_8080
cls
echo Iniciando servidor en puerto 8080...
echo.
echo Servidor corriendo en:
echo - http://localhost:8080
echo - http://127.0.0.1:8080
echo.
ipconfig | findstr /i "IPv4"
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
python -m http.server 8080
goto MENU

:SERVIDOR_3000
cls
echo Iniciando servidor en puerto 3000...
echo.
echo Servidor corriendo en:
echo - http://localhost:3000
echo - http://127.0.0.1:3000
echo.
ipconfig | findstr /i "IPv4"
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
python -m http.server 3000
goto MENU

:ABRIR_NAVEGADOR
cls
echo Abriendo navegador...
start http://localhost:8080
echo.
echo Si el puerto 8080 no funciona, prueba:
echo http://localhost:3000
echo.
pause
goto MENU

:VER_IP
cls
echo ================================================
echo   TU INFORMACION DE RED
echo ================================================
echo.
ipconfig
echo.
echo Tu IP local (IPv4) es la que necesitas para
echo acceder desde tu celular.
echo.
pause
goto MENU

REM ========================================
REM CORDOVA/APK
REM ========================================

:CREAR_CORDOVA
cls
echo ================================================
echo   CREAR NUEVO PROYECTO CORDOVA
echo ================================================
echo.
set /p nombre="Nombre del proyecto (ej: MiApp): "
set /p package="Package ID (ej: com.miapp.game): "
set /p titulo="Titulo de la app: "
echo.
echo Creando proyecto...
cordova create %nombre% %package% "%titulo%"
echo.
echo Proyecto creado en: %cd%\%nombre%
echo.
pause
goto MENU

:AGREGAR_ANDROID
cls
echo ================================================
echo   AGREGAR PLATAFORMA ANDROID
echo ================================================
echo.
echo Asegurate de estar en la carpeta del proyecto Cordova
echo.
cordova platform add android
echo.
pause
goto MENU

:BUILD_DEBUG
cls
echo ================================================
echo   COMPILAR APK DEBUG
echo ================================================
echo.
echo Compilando...
cordova build android
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   APK COMPILADA EXITOSAMENTE!
    echo ================================================
    echo.
    echo Ubicacion:
    echo platforms\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Abriendo carpeta...
    start explorer "platforms\android\app\build\outputs\apk\debug"
) else (
    echo.
    echo ERROR al compilar. Verifica:
    echo - Android SDK instalado
    echo - Variables de entorno configuradas
    echo - Licencias aceptadas
)
echo.
pause
goto MENU

:BUILD_RELEASE
cls
echo ================================================
echo   COMPILAR APK RELEASE (FIRMADA)
echo ================================================
echo.
echo Esta APK estara optimizada y lista para distribuir
echo.
cordova build android --release
echo.
if %ERRORLEVEL% EQU 0 (
    echo APK Release creada en:
    echo platforms\android\app\build\outputs\apk\release\
    start explorer "platforms\android\app\build\outputs\apk\release"
)
pause
goto MENU

:ABRIR_ANDROID_STUDIO_PROJECT
cls
echo Abriendo proyecto en Android Studio...
echo.
if exist "platforms\android" (
    start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "platforms\android"
    echo.
    echo Proyecto Android abierto en Android Studio
) else (
    echo ERROR: No se encontro la carpeta platforms\android
    echo.
    echo Asegurate de:
    echo 1. Estar en un proyecto Cordova
    echo 2. Haber ejecutado: cordova platform add android
)
echo.
pause
goto MENU

REM ========================================
REM UTILIDADES
REM ========================================

:NPM_INSTALL
cls
echo Instalando dependencias de Node.js...
echo.
npm install
echo.
echo Dependencias instaladas
pause
goto MENU

:UPDATE_CORDOVA
cls
echo Actualizando Cordova...
echo.
npm update -g cordova
echo.
echo Cordova actualizado
cordova --version
pause
goto MENU

:CLEAN_BUILD
cls
echo Limpiando cache y reconstruyendo...
echo.
cordova clean
echo.
echo Cache limpiado
echo.
set /p rebuild="Deseas recompilar ahora? (S/N): "
if /i "%rebuild%"=="S" (
    cordova build android
)
pause
goto MENU

:VER_VERSIONES
cls
echo ================================================
echo   VERSIONES DE HERRAMIENTAS INSTALADAS
echo ================================================
echo.
echo Node.js:
node --version
echo.
echo NPM:
npm --version
echo.
echo Cordova:
cordova --version
echo.
echo Java:
java -version
echo.
echo Android Debug Bridge (ADB):
adb version
echo.
echo SDK Manager:
sdkmanager --version
echo.
pause
goto MENU

REM ========================================
REM ANDROID STUDIO
REM ========================================

:ABRIR_ANDROID_STUDIO
cls
echo Abriendo Android Studio...
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe"
echo.
echo Android Studio iniciado
pause
goto MENU

:ABRIR_SDK_MANAGER
cls
echo Abriendo SDK Manager...
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" sdk
echo.
echo SDK Manager iniciado
pause
goto MENU

:VERIFICAR_LICENCIAS
cls
echo ================================================
echo   ACEPTAR LICENCIAS DE ANDROID SDK
echo ================================================
echo.
echo Se te pedira aceptar cada licencia.
echo Escribe 'y' y presiona Enter para cada una.
echo.
pause
sdkmanager --licenses
echo.
echo Licencias actualizadas
pause
goto MENU

:LISTAR_DISPOSITIVOS
cls
echo ================================================
echo   DISPOSITIVOS ANDROID CONECTADOS
echo ================================================
echo.
adb devices
echo.
echo Si no aparece tu dispositivo:
echo 1. Activa Depuracion USB en tu Android
echo 2. Conecta el cable USB
echo 3. Autoriza la computadora en tu telefono
echo.
pause
goto MENU

REM ========================================
REM CONFIGURACION
REM ========================================

:CONFIG_VARIABLES
cls
echo ================================================
echo   CONFIGURAR VARIABLES DE ENTORNO
echo ================================================
echo.
echo Este script configurara automaticamente:
echo - ANDROID_HOME
echo - JAVA_HOME
echo - PATH (platform-tools, cmdline-tools)
echo.
echo IMPORTANTE: Necesitas ejecutar PowerShell como Administrador
echo.
pause

echo.
echo Abriendo PowerShell como Administrador...
echo Ejecuta este comando:
echo.
echo $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
echo [Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "Machine")
echo $path = [Environment]::GetEnvironmentVariable("Path", "Machine")
echo [Environment]::SetEnvironmentVariable("Path", "$path;$sdkPath\platform-tools;$sdkPath\cmdline-tools\latest\bin", "Machine")
echo.
powershell -Command "Start-Process PowerShell -Verb RunAs"
pause
goto MENU

:INSTALAR_TODO
cls
echo ================================================
echo   INSTALAR TODAS LAS HERRAMIENTAS
echo ================================================
echo.
echo Este proceso instalara:
echo - Node.js (si no esta instalado)
echo - Cordova
echo - Gradle (para compilar Android)
echo.
set /p confirmar="Continuar? (S/N): "
if /i not "%confirmar%"=="S" goto MENU

echo.
echo Instalando Cordova...
npm install -g cordova
echo.
echo Verificando instalacion...
cordova --version
echo.
echo Instalacion completada
pause
goto MENU

:VERIFICAR_TODO
cls
echo ================================================
echo   VERIFICACION DE INSTALACIONES
echo ================================================
echo.
echo Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js instalado
    node --version
) else (
    echo [X] Node.js NO instalado
)
echo.
echo Verificando NPM...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] NPM instalado
    npm --version
) else (
    echo [X] NPM NO instalado
)
echo.
echo Verificando Cordova...
where cordova >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Cordova instalado
    cordova --version
) else (
    echo [X] Cordova NO instalado
)
echo.
echo Verificando Java...
where java >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Java instalado
    java -version
) else (
    echo [X] Java NO instalado
)
echo.
echo Verificando Android SDK...
where adb >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Android SDK instalado
    adb version
) else (
    echo [X] Android SDK NO instalado
)
echo.
echo Verificando ANDROID_HOME...
if defined ANDROID_HOME (
    echo [OK] ANDROID_HOME: %ANDROID_HOME%
) else (
    echo [X] ANDROID_HOME no configurado
)
echo.
pause
goto MENU

:SALIR
cls
echo.
echo Gracias por usar las herramientas de Wacheck!
echo.
exit

