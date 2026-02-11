# 🛠️ HERRAMIENTAS PERMANENTES DE DESARROLLO

## 🎯 ¿Qué acabamos de crear?

He creado un **sistema de herramientas permanente** para que NUNCA más tengas que escribir comandos complicados en la terminal. Todo funcionará con **UN SOLO CLICK** o comandos simples.

---

## 📦 Archivos Creados

### 1. **HERRAMIENTAS_DEV.bat** (Menú Visual)
**Ubicación:** `C:\xampp\htdocs\Wacheck\Wacheck\`

**Qué hace:**
- Menú interactivo con 20+ opciones
- Iniciar servidores
- Compilar APKs
- Abrir Android Studio
- Ver dispositivos conectados
- Y mucho más...

**Cómo usar:**
```
Doble click en: HERRAMIENTAS_DEV.bat
```

---

### 2. **WacheckTools.ps1** (Funciones de PowerShell)
**Ubicación:** `C:\xampp\htdocs\Wacheck\Wacheck\`

**Qué hace:**
- Define funciones que puedes usar en CUALQUIER terminal
- Una vez instalado, los comandos están disponibles SIEMPRE

**Comandos disponibles:**
- `server` → Inicia servidor web
- `build` → Compila APK
- `studio` → Abre Android Studio
- `ip` → Muestra tu IP local
- `check` → Verifica herramientas instaladas

---

### 3. **INSTALAR_HERRAMIENTAS.ps1** (Instalador Automático)
**Ubicación:** `C:\xampp\htdocs\Wacheck\Wacheck\`

**Qué hace:**
- Configura TODO de forma automática
- Agrega comandos a tu perfil de PowerShell
- Configura variables de entorno
- Crea accesos directos en el escritorio

**Cómo usar:**
```powershell
# Click derecho en: INSTALAR_HERRAMIENTAS.ps1
# → "Ejecutar con PowerShell"
```

---

## 🚀 INSTALACIÓN (SOLO UNA VEZ)

### Opción 1: Instalador Automático (RECOMENDADO)

1. **Abrir PowerShell como Administrador:**
   - Presiona `Win + X`
   - Click en "Windows PowerShell (Admin)"

2. **Ejecutar instalador:**
   ```powershell
   cd C:\xampp\htdocs\Wacheck\Wacheck
   .\INSTALAR_HERRAMIENTAS.ps1
   ```

3. **Seguir el asistente:**
   - Responde "S" a todo
   - El script hará todo automáticamente

4. **Reiniciar VS Code**

5. **¡Listo!** Ahora puedes usar comandos simples

---

### Opción 2: Instalación Manual

Si prefieres hacerlo manual:

#### A) Configurar perfil de PowerShell:

```powershell
# 1. Abrir perfil de PowerShell
notepad $PROFILE

# 2. Agregar esta línea al final:
. "C:\xampp\htdocs\Wacheck\Wacheck\WacheckTools.ps1"

# 3. Guardar y cerrar

# 4. Reiniciar PowerShell/VS Code
```

#### B) Configurar variables de entorno (PowerShell como Admin):

```powershell
# Configurar ANDROID_HOME
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "Machine")

# Agregar al PATH
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
[Environment]::SetEnvironmentVariable("Path", "$path;$sdkPath\platform-tools;$sdkPath\cmdline-tools\latest\bin", "Machine")
```

---

## 🎮 CÓMO USAR - 3 FORMAS

### Forma 1: Menú Visual (.bat)

**Más fácil para principiantes**

1. Doble click en: `HERRAMIENTAS_DEV.bat`
2. Verás un menú con opciones numeradas
3. Escribe el número y presiona Enter

```
================================================
   WACHECK - HERRAMIENTAS DE DESARROLLO
================================================

 SERVIDOR Y PRUEBAS:
 [1] Iniciar servidor local (puerto 8080)
 [2] Iniciar servidor local (puerto 3000)
 [3] Abrir en navegador
 [4] Ver mi IP local

 CORDOVA/APK:
 [5] Crear nuevo proyecto Cordova
 [6] Agregar plataforma Android
 [7] Compilar APK (debug)
 ...
```

---

### Forma 2: Comandos de PowerShell

**Más rápido para usuarios avanzados**

Abre la terminal de VS Code y escribe:

```powershell
# Iniciar servidor
server
# o
Start-Server 8080

# Ver IP local
ip
# o
Get-MyIP

# Compilar APK
build
# o
Build-APK

# Compilar APK release
Build-APK -Release

# Abrir Android Studio
studio
# o
Open-AndroidStudio

# Verificar herramientas
check
# o
Test-DevTools

# Ver ayuda con todos los comandos
Get-WacheckHelp
```

---

### Forma 3: Accesos Directos

**Si instalaste con el instalador automático**

En tu escritorio tendrás:
- `Wacheck Tools.lnk` → Abre el menú
- `Android Studio.lnk` → Abre Android Studio

---

## 📚 LISTA COMPLETA DE COMANDOS

### Servidor y Pruebas:
```powershell
Start-Server           # Servidor en puerto 8080
Start-Server 3000      # Servidor en puerto 3000
Get-MyIP               # Ver IP local
```

### Cordova/APK:
```powershell
New-CordovaProject                    # Crear proyecto nuevo
Add-AndroidPlatform                   # Agregar Android
Build-APK                             # Compilar debug
Build-APK -Release                    # Compilar release
Clear-CordovaBuild                    # Limpiar y rebuild
```

### Android Studio:
```powershell
Open-AndroidStudio                    # Abrir Android Studio
Open-AndroidStudio "ruta/proyecto"    # Abrir proyecto específico
Get-AndroidDevices                    # Listar dispositivos
Accept-AndroidLicenses                # Aceptar licencias SDK
```

### Utilidades:
```powershell
Test-DevTools                         # Verificar instalaciones
Install-Dependencies                  # npm install
Set-AndroidEnvironment                # Config variables (requiere admin)
Get-WacheckHelp                       # Ver ayuda completa
```

### Alias (atajos):
```powershell
server      →  Start-Server
ip          →  Get-MyIP
build       →  Build-APK
studio      →  Open-AndroidStudio
check       →  Test-DevTools
```

---

## 🎯 EJEMPLOS DE USO COMÚN

### Ejemplo 1: Probar tu juego en el celular
```powershell
# En VS Code terminal:
cd C:\xampp\htdocs\Wacheck\Wacheck
server

# O desde cualquier carpeta con el menú:
# Doble click en HERRAMIENTAS_DEV.bat → Opción [1]
```

### Ejemplo 2: Compilar APK
```powershell
# En VS Code terminal:
cd C:\xampp\htdocs\Wacheck\Wacheck\apk\WacheckAPK
build

# O desde el menú:
# HERRAMIENTAS_DEV.bat → Opción [7]
```

### Ejemplo 3: Crear nuevo proyecto
```powershell
# En VS Code terminal:
cd C:\xampp\htdocs\MisProyectos
New-CordovaProject

# Te preguntará:
# - Nombre del proyecto
# - Package ID
# - Título de la app
```

### Ejemplo 4: Abrir proyecto en Android Studio
```powershell
# Desde la carpeta del proyecto Cordova:
cd C:\xampp\htdocs\Wacheck\Wacheck\apk\WacheckAPK
studio

# O desde el menú:
# HERRAMIENTAS_DEV.bat → Opción [9]
```

---

## 🔄 USAR EN OTROS PROYECTOS

### ¿Estos comandos funcionan en CUALQUIER proyecto?

**SÍ**, una vez instalados, los comandos están disponibles SIEMPRE y en CUALQUIER carpeta.

**Ejemplos:**

```powershell
# Proyecto 1
cd C:\MiApp1
server

# Proyecto 2
cd C:\MiApp2
server

# Proyecto 3
cd C:\JuegoNuevo\www
server 3000
```

### Usar el menú .bat en otros proyectos:

**Opción A:** Copiar el archivo
```powershell
# Copiar HERRAMIENTAS_DEV.bat a tu nuevo proyecto
copy C:\xampp\htdocs\Wacheck\Wacheck\HERRAMIENTAS_DEV.bat C:\MiNuevoProyecto\
```

**Opción B:** Crear acceso directo
```powershell
# Click derecho en HERRAMIENTAS_DEV.bat
# → Enviar a → Escritorio (crear acceso directo)
```

---

## 🔧 PERSONALIZACIÓN

### Cambiar puerto por defecto:

Edita `WacheckTools.ps1`:
```powershell
function Start-Server {
    param(
        [int]$Port = 3000  # ← Cambia 8080 a tu puerto favorito
    )
    ...
}
```

### Agregar tus propios comandos:

Edita `WacheckTools.ps1` y agrega:
```powershell
function Mi-Comando {
    Write-Host "Haciendo algo..." -ForegroundColor Green
    # Tu código aquí
}

# Crear alias
Set-Alias -Name micomando -Value Mi-Comando
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No se reconoce el comando"

**Solución:**
1. Verifica que ejecutaste el instalador
2. Reinicia PowerShell/VS Code
3. Verifica el perfil:
   ```powershell
   notepad $PROFILE
   ```
   Debe contener: `. "C:\xampp\htdocs\Wacheck\Wacheck\WacheckTools.ps1"`

---

### "No se puede cargar el archivo porque la ejecución de scripts está deshabilitada"

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### "Android Studio no se abre"

**Solución:**
Verifica la ruta en `WacheckTools.ps1`:
```powershell
$studioPath = "C:\Program Files\Android\Android Studio\bin\studio64.exe"
```
Ajústala si Android Studio está en otra ubicación.

---

## 📊 VENTAJAS DE ESTE SISTEMA

### ✅ Una sola instalación
No necesitas configurar nada cada vez que creas un proyecto

### ✅ Funciona en cualquier carpeta
Los comandos están disponibles SIEMPRE

### ✅ Fácil de usar
Menú visual o comandos simples

### ✅ Reutilizable
Sirve para TODOS tus proyectos futuros

### ✅ Ahorra tiempo
No más copiar y pegar comandos largos

### ✅ Sin conocimientos técnicos
El menú .bat es perfecto para principiantes

---

## 🎓 PARA ANDROID STUDIO

Una vez que instales Android Studio, estos comandos harán tu vida más fácil:

```powershell
# Abrir proyecto actual en Android Studio
cd C:\tu\proyecto\cordova
studio

# Ver dispositivos conectados
Get-AndroidDevices

# Aceptar licencias (necesario la primera vez)
Accept-AndroidLicenses

# Compilar APK sin abrir Android Studio
build
```

---

## 🚀 PRÓXIMOS PASOS

### Ahora mismo:
1. **Ejecuta el instalador:**
   ```powershell
   .\INSTALAR_HERRAMIENTAS.ps1
   ```

2. **Reinicia VS Code**

3. **Prueba un comando:**
   ```powershell
   check
   ```

### Después de instalar Android Studio:
1. **Configura variables:**
   ```powershell
   Set-AndroidEnvironment
   ```

2. **Acepta licencias:**
   ```powershell
   Accept-AndroidLicenses
   ```

3. **Compila tu APK:**
   ```powershell
   cd C:\xampp\htdocs\Wacheck\Wacheck\apk\WacheckAPK
   build
   ```

---

## 🎉 RESUMEN

**Has obtenido:**
- ✅ Menú visual interactivo
- ✅ Comandos simples en PowerShell
- ✅ Sistema permanente (no se borra)
- ✅ Funciona en TODOS tus proyectos
- ✅ Ahorra HORAS de trabajo
- ✅ No necesitas memorizar comandos

**Todo con UN SOLO CLICK o comandos de 1 palabra.**

¡Disfruta de tus nuevas herramientas! 🚀
