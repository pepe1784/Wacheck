# ============================================================
# INSTALADOR AUTOMATICO DE HERRAMIENTAS WACHECK
# Este script configura tu sistema de forma PERMANENTE
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  WACHECK - INSTALADOR DE HERRAMIENTAS DE DESARROLLO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  IMPORTANTE: Algunas configuraciones requieren permisos de administrador" -ForegroundColor Yellow
    Write-Host ""
    $runAsAdmin = Read-Host "¿Reiniciar como Administrador? (S/N)"
    if ($runAsAdmin -eq "S" -or $runAsAdmin -eq "s") {
        Start-Process PowerShell -Verb RunAs -ArgumentList "-NoExit", "-File", $PSCommandPath
        exit
    }
    Write-Host "Continuando sin permisos de administrador (algunas funciones pueden no estar disponibles)..." -ForegroundColor Yellow
    Write-Host ""
}

# Función para verificar comando
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

Write-Host "📊 Verificando herramientas instaladas..." -ForegroundColor Cyan
Write-Host ""

# Node.js
$hasNode = Test-Command node
if ($hasNode) {
    Write-Host "✅ Node.js: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js NO instalado" -ForegroundColor Red
    Write-Host "   Descarga: https://nodejs.org/" -ForegroundColor Yellow
}

# Cordova
$hasCordova = Test-Command cordova
if ($hasCordova) {
    Write-Host "✅ Cordova: $(cordova --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Cordova NO instalado" -ForegroundColor Red
    if ($hasNode) {
        Write-Host ""
        $installCordova = Read-Host "¿Instalar Cordova ahora? (S/N)"
        if ($installCordova -eq "S" -or $installCordova -eq "s") {
            Write-Host "Instalando Cordova..." -ForegroundColor Green
            npm install -g cordova
            Write-Host "✅ Cordova instalado" -ForegroundColor Green
            $hasCordova = $true
        }
    }
}

# Android SDK
$hasADB = Test-Command adb
if ($hasADB) {
    Write-Host "✅ Android SDK instalado" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK NO instalado" -ForegroundColor Red
    Write-Host "   Instala Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION DE PERFIL DE POWERSHELL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Esta configuración hará que los comandos de Wacheck estén" -ForegroundColor White
Write-Host "disponibles SIEMPRE que abras PowerShell o VS Code." -ForegroundColor White
Write-Host ""

$configProfile = Read-Host "¿Configurar perfil de PowerShell? (S/N)"

if ($configProfile -eq "S" -or $configProfile -eq "s") {
    
    # Crear perfil si no existe
    if (-not (Test-Path $PROFILE)) {
        Write-Host "Creando perfil de PowerShell..." -ForegroundColor Green
        New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    }
    
    # Ruta al script de funciones
    $scriptPath = Join-Path $PSScriptRoot "WacheckTools.ps1"
    
    # Verificar si ya está configurado
    $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    
    if ($profileContent -like "*WacheckTools.ps1*") {
        Write-Host "✅ Perfil ya configurado" -ForegroundColor Green
    } else {
        # Agregar al perfil
        $importLine = ". '$scriptPath'"
        Add-Content -Path $PROFILE -Value "`n# Wacheck Development Tools"
        Add-Content -Path $PROFILE -Value $importLine
        
        Write-Host "✅ Perfil configurado exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Los siguientes comandos estarán disponibles siempre:" -ForegroundColor Cyan
        Write-Host "  - Start-Server (o 'server')        - Iniciar servidor web" -ForegroundColor White
        Write-Host "  - Build-APK (o 'build')            - Compilar APK" -ForegroundColor White
        Write-Host "  - Open-AndroidStudio (o 'studio')  - Abrir Android Studio" -ForegroundColor White
        Write-Host "  - Get-MyIP (o 'ip')                - Ver IP local" -ForegroundColor White
        Write-Host "  - Test-DevTools (o 'check')        - Verificar herramientas" -ForegroundColor White
        Write-Host "  - Get-WacheckHelp                  - Ver todos los comandos" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VARIABLES DE ENTORNO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($isAdmin -and $hasADB) {
    $configEnv = Read-Host "¿Configurar variables de entorno de Android? (S/N)"
    
    if ($configEnv -eq "S" -or $configEnv -eq "s") {
        $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
        
        if (Test-Path $sdkPath) {
            Write-Host "Configurando ANDROID_HOME..." -ForegroundColor Green
            [Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "Machine")
            
            Write-Host "Actualizando PATH..." -ForegroundColor Green
            $path = [Environment]::GetEnvironmentVariable("Path", "Machine")
            
            $pathsToAdd = @(
                "$sdkPath\platform-tools",
                "$sdkPath\cmdline-tools\latest\bin",
                "$sdkPath\tools"
            )
            
            foreach ($pathToAdd in $pathsToAdd) {
                if ($path -notlike "*$pathToAdd*") {
                    $path = "$path;$pathToAdd"
                }
            }
            
            [Environment]::SetEnvironmentVariable("Path", $path, "Machine")
            
            Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  Reinicia PowerShell/VS Code para aplicar cambios" -ForegroundColor Yellow
        } else {
            Write-Host "❌ No se encontró Android SDK en: $sdkPath" -ForegroundColor Red
            Write-Host "   Instala Android Studio primero" -ForegroundColor Yellow
        }
    }
} elseif (-not $isAdmin) {
    Write-Host "⚠️  Ejecuta como administrador para configurar variables de entorno" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CREAR ACCESOS DIRECTOS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$createShortcuts = Read-Host "¿Crear accesos directos en el escritorio? (S/N)"

if ($createShortcuts -eq "S" -or $createShortcuts -eq "s") {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $wshell = New-Object -ComObject WScript.Shell
    
    # Acceso directo al menú de herramientas
    $menuBatPath = Join-Path $PSScriptRoot "HERRAMIENTAS_DEV.bat"
    if (Test-Path $menuBatPath) {
        $shortcut = $wshell.CreateShortcut("$desktopPath\Wacheck Tools.lnk")
        $shortcut.TargetPath = $menuBatPath
        $shortcut.WorkingDirectory = $PSScriptRoot
        $shortcut.Description = "Herramientas de desarrollo Wacheck"
        $shortcut.Save()
        Write-Host "✅ Creado: Wacheck Tools.lnk" -ForegroundColor Green
    }
    
    # Acceso directo a Android Studio (si existe)
    $studioPath = "C:\Program Files\Android\Android Studio\bin\studio64.exe"
    if (Test-Path $studioPath) {
        $shortcut = $wshell.CreateShortcut("$desktopPath\Android Studio.lnk")
        $shortcut.TargetPath = $studioPath
        $shortcut.Description = "Android Studio IDE"
        $shortcut.Save()
        Write-Host "✅ Creado: Android Studio.lnk" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Accesos directos creados en el escritorio" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION VS CODE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Recomendaciones de extensiones para VS Code:" -ForegroundColor White
Write-Host "  - Live Server (servidor con auto-reload)" -ForegroundColor Yellow
Write-Host "  - Cordova Tools (soporte para Cordova)" -ForegroundColor Yellow
Write-Host "  - Android iOS Emulator (ejecutar emuladores)" -ForegroundColor Yellow
Write-Host ""

$installVSCodeExt = Read-Host "¿Abrir VS Code para instalar extensiones? (S/N)"

if ($installVSCodeExt -eq "S" -or $installVSCodeExt -eq "s") {
    code --install-extension ritwickdey.liveserver
    code --install-extension vsmobile.cordova-tools
    Write-Host "✅ Extensiones instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ✅ INSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "PROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""

if (-not $hasNode) {
    Write-Host "1. Instala Node.js: https://nodejs.org/" -ForegroundColor Yellow
}

if (-not $hasCordova -and $hasNode) {
    Write-Host "2. Instala Cordova: npm install -g cordova" -ForegroundColor Yellow
}

if (-not $hasADB) {
    Write-Host "3. Instala Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Para usar los comandos de Wacheck:" -ForegroundColor Cyan
Write-Host "  1. Cierra y abre PowerShell/VS Code" -ForegroundColor White
Write-Host "  2. Escribe: Get-WacheckHelp" -ForegroundColor White
Write-Host "  3. O ejecuta: HERRAMIENTAS_DEV.bat" -ForegroundColor White
Write-Host ""
Write-Host "¡Todo listo para desarrollar! 🚀" -ForegroundColor Green
Write-Host ""

pause
