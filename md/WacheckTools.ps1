# ========================================
# WACHECK - FUNCIONES DE DESARROLLO
# Importa este archivo en tu perfil de PowerShell
# ========================================

# Función para iniciar servidor web
function Start-Server {
    param(
        [int]$Port = 8080
    )
    
    Write-Host "🚀 Iniciando servidor en puerto $Port..." -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "  - http://localhost:$Port"
    
    # Obtener IP local
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress
    if ($ip) {
        Write-Host "  - http://${ip}:$Port (para celular)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Gray
    Write-Host ""
    
    python -m http.server $Port
}

# Función para ver IP local
function Get-MyIP {
    Write-Host "🌐 Tu información de red:" -ForegroundColor Cyan
    Write-Host ""
    
    $adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
    
    foreach ($adapter in $adapters) {
        Write-Host "  Adaptador: $($adapter.InterfaceAlias)" -ForegroundColor Green
        Write-Host "  IP: $($adapter.IPAddress)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Función para compilar APK
function Build-APK {
    param(
        [switch]$Release
    )
    
    Write-Host "📦 Compilando APK..." -ForegroundColor Green
    
    if ($Release) {
        cordova build android --release
        $outputPath = "platforms\android\app\build\outputs\apk\release"
    } else {
        cordova build android
        $outputPath = "platforms\android\app\build\outputs\apk\debug"
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ APK compilada exitosamente!" -ForegroundColor Green
        Write-Host "📂 Ubicación: $outputPath" -ForegroundColor Yellow
        
        # Abrir carpeta
        if (Test-Path $outputPath) {
            explorer $outputPath
        }
    } else {
        Write-Host ""
        Write-Host "❌ Error al compilar APK" -ForegroundColor Red
    }
}

# Función para crear proyecto Cordova
function New-CordovaProject {
    param(
        [string]$Name,
        [string]$Package,
        [string]$DisplayName
    )
    
    if (-not $Name) {
        $Name = Read-Host "Nombre del proyecto (ej: MiApp)"
    }
    if (-not $Package) {
        $Package = Read-Host "Package ID (ej: com.miapp.game)"
    }
    if (-not $DisplayName) {
        $DisplayName = Read-Host "Titulo de la app"
    }
    
    Write-Host "🆕 Creando proyecto Cordova..." -ForegroundColor Green
    cordova create $Name $Package $DisplayName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Proyecto creado: $Name" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Cyan
        Write-Host "  1. cd $Name"
        Write-Host "  2. Add-AndroidPlatform"
        Write-Host "  3. Build-APK"
    }
}

# Función para agregar plataforma Android
function Add-AndroidPlatform {
    Write-Host "📱 Agregando plataforma Android..." -ForegroundColor Green
    cordova platform add android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Plataforma Android agregada" -ForegroundColor Green
    }
}

# Función para abrir Android Studio
function Open-AndroidStudio {
    param(
        [string]$ProjectPath = "platforms\android"
    )
    
    $studioPath = "C:\Program Files\Android\Android Studio\bin\studio64.exe"
    
    if (Test-Path $studioPath) {
        Write-Host "🚀 Abriendo Android Studio..." -ForegroundColor Green
        
        if (Test-Path $ProjectPath) {
            Start-Process $studioPath -ArgumentList $ProjectPath
        } else {
            Start-Process $studioPath
        }
    } else {
        Write-Host "❌ Android Studio no encontrado en: $studioPath" -ForegroundColor Red
    }
}

# Función para verificar herramientas
function Test-DevTools {
    Write-Host "🔍 Verificando herramientas instaladas..." -ForegroundColor Cyan
    Write-Host ""
    
    # Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host "✅ Node.js: $(node --version)" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js NO instalado" -ForegroundColor Red
    }
    
    # NPM
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "✅ NPM: $(npm --version)" -ForegroundColor Green
    } else {
        Write-Host "❌ NPM NO instalado" -ForegroundColor Red
    }
    
    # Cordova
    if (Get-Command cordova -ErrorAction SilentlyContinue) {
        Write-Host "✅ Cordova: $(cordova --version)" -ForegroundColor Green
    } else {
        Write-Host "❌ Cordova NO instalado" -ForegroundColor Red
    }
    
    # Java
    if (Get-Command java -ErrorAction SilentlyContinue) {
        $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
        Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Java NO instalado" -ForegroundColor Red
    }
    
    # ADB
    if (Get-Command adb -ErrorAction SilentlyContinue) {
        Write-Host "✅ Android SDK (ADB): instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ Android SDK NO instalado" -ForegroundColor Red
    }
    
    # ANDROID_HOME
    if ($env:ANDROID_HOME) {
        Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
    } else {
        Write-Host "❌ ANDROID_HOME no configurado" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Función para instalar dependencias
function Install-Dependencies {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Green
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    }
}

# Función para limpiar proyecto
function Clear-CordovaBuild {
    Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Green
    cordova clean
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Proyecto limpio" -ForegroundColor Green
        
        $rebuild = Read-Host "¿Recompilar ahora? (S/N)"
        if ($rebuild -eq "S" -or $rebuild -eq "s") {
            Build-APK
        }
    }
}

# Función para listar dispositivos
function Get-AndroidDevices {
    Write-Host "📱 Dispositivos Android conectados:" -ForegroundColor Cyan
    Write-Host ""
    adb devices
    Write-Host ""
    Write-Host "Si no aparece tu dispositivo:" -ForegroundColor Yellow
    Write-Host "  1. Activa 'Depuración USB' en opciones de desarrollador"
    Write-Host "  2. Conecta el cable USB"
    Write-Host "  3. Autoriza la computadora en tu teléfono"
}

# Función para aceptar licencias Android
function Accept-AndroidLicenses {
    Write-Host "📄 Aceptando licencias de Android SDK..." -ForegroundColor Green
    Write-Host "Escribe 'y' y presiona Enter para cada licencia" -ForegroundColor Yellow
    Write-Host ""
    
    sdkmanager --licenses
}

# Función para configurar variables de entorno (requiere admin)
function Set-AndroidEnvironment {
    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host "❌ Esta función requiere ejecutar PowerShell como Administrador" -ForegroundColor Red
        return
    }
    
    Write-Host "⚙️ Configurando variables de entorno..." -ForegroundColor Green
    
    $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
    
    # ANDROID_HOME
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "Machine")
    Write-Host "✅ ANDROID_HOME configurado: $sdkPath" -ForegroundColor Green
    
    # PATH
    $path = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($path -notlike "*$sdkPath\platform-tools*") {
        [Environment]::SetEnvironmentVariable("Path", "$path;$sdkPath\platform-tools;$sdkPath\cmdline-tools\latest\bin", "Machine")
        Write-Host "✅ PATH actualizado" -ForegroundColor Green
    } else {
        Write-Host "✅ PATH ya estaba configurado" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "⚠️ IMPORTANTE: Reinicia PowerShell/VS Code para aplicar cambios" -ForegroundColor Yellow
}

# Función de ayuda
function Get-WacheckHelp {
    Write-Host ""
    Write-Host "🎮 WACHECK - Comandos disponibles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "SERVIDOR:" -ForegroundColor Yellow
    Write-Host "  Start-Server [puerto]         - Iniciar servidor web (default: 8080)"
    Write-Host "  Get-MyIP                      - Ver tu IP local"
    Write-Host ""
    Write-Host "CORDOVA/APK:" -ForegroundColor Yellow
    Write-Host "  New-CordovaProject            - Crear nuevo proyecto Cordova"
    Write-Host "  Add-AndroidPlatform           - Agregar plataforma Android"
    Write-Host "  Build-APK                     - Compilar APK debug"
    Write-Host "  Build-APK -Release            - Compilar APK release"
    Write-Host "  Clear-CordovaBuild            - Limpiar y recompilar"
    Write-Host ""
    Write-Host "ANDROID STUDIO:" -ForegroundColor Yellow
    Write-Host "  Open-AndroidStudio            - Abrir Android Studio"
    Write-Host "  Get-AndroidDevices            - Listar dispositivos conectados"
    Write-Host "  Accept-AndroidLicenses        - Aceptar licencias Android SDK"
    Write-Host ""
    Write-Host "UTILIDADES:" -ForegroundColor Yellow
    Write-Host "  Test-DevTools                 - Verificar herramientas instaladas"
    Write-Host "  Install-Dependencies          - Instalar dependencias (npm install)"
    Write-Host "  Set-AndroidEnvironment        - Configurar variables de entorno (requiere admin)"
    Write-Host ""
    Write-Host "ATAJOS:" -ForegroundColor Yellow
    Write-Host "  server                        - Alias de Start-Server"
    Write-Host "  ip                            - Alias de Get-MyIP"
    Write-Host "  build                         - Alias de Build-APK"
    Write-Host "  studio                        - Alias de Open-AndroidStudio"
    Write-Host "  check                         - Alias de Test-DevTools"
    Write-Host ""
}

# Crear alias cortos
Set-Alias -Name server -Value Start-Server
Set-Alias -Name ip -Value Get-MyIP
Set-Alias -Name build -Value Build-APK
Set-Alias -Name studio -Value Open-AndroidStudio
Set-Alias -Name check -Value Test-DevTools

# Mensaje de bienvenida
Write-Host ""
Write-Host "✅ Funciones de Wacheck cargadas" -ForegroundColor Green
Write-Host "Escribe 'Get-WacheckHelp' para ver comandos disponibles" -ForegroundColor Cyan
Write-Host ""
