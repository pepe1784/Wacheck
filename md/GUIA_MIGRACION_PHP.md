# 🔄 GUÍA: Actualizar PHP del Sitio Web con Versión APK

## 🎯 SITUACIÓN ACTUAL

Tienes 2 versiones de `user_handler.php`:

### 📄 Versión Sitio Web (Antigua):
- ✅ Funciona en tu sitio web actual
- ❌ Usa mysqli (menos seguro)
- ❌ Sin soporte CORS (no funciona en APK)
- ❌ Código menos organizado

### 📱 Versión APK (Nueva):
- ✅ Usa PDO (más moderno y seguro)
- ✅ Tiene CORS (funciona en APK)
- ✅ Mejor estructura
- ❌ Podría romper código web existente

---

## ✅ SOLUCIÓN: 3 OPCIONES

### **OPCIÓN 1: Versión Híbrida** ⭐ **RECOMENDADA**

**Qué es:**
- Un solo archivo que funciona para **web Y APK**
- Detecta automáticamente si es petición desde APK
- Solo agrega CORS cuando es necesario
- Más seguro y eficiente

**Archivo creado:**
```
api/user_handler_HYBRID.php
```

**Ventajas:**
- ✅ Un solo archivo para ambos
- ✅ Más seguro (CORS selectivo)
- ✅ Compatible con todo
- ✅ Fácil de mantener

**Pasos para implementar:**

1. **Hacer backup del actual:**
   ```bash
   Copiar: api/user_handler.php
   Como: api/user_handler_BACKUP.php
   ```

2. **Reemplazar con híbrido:**
   ```bash
   Renombrar: api/user_handler_HYBRID.php
   Como: api/user_handler.php
   ```

3. **Probar sitio web:**
   - Abrir tu sitio
   - Crear usuario de prueba
   - Hacer login
   - Jugar un poco
   - Verificar que todo funciona

4. **Si funciona:**
   - ✅ Listo! Ahora funciona para web y APK

5. **Si algo falla:**
   - Restaurar backup
   - Revisar errores en consola del navegador

---

### **OPCIÓN 2: Usar versión APK directa**

**Solo si estás seguro de que tu JavaScript es compatible.**

**Pasos:**

1. **Backup:**
   ```bash
   Copiar: api/user_handler.php → api/user_handler_BACKUP.php
   ```

2. **Reemplazar:**
   ```bash
   Copiar: apk/WacheckAPK/api/user_handler.php
   A: api/user_handler.php
   ```

3. **Probar exhaustivamente**

**⚠️ Riesgo:** El CORS abierto (`*`) es menos seguro en producción.

---

### **OPCIÓN 3: Mantener ambos separados** (No recomendado)

**Estructura:**
```
api/
├── user_handler.php        (para sitio web)
└── user_handler_apk.php    (para APK)
```

**Problemas:**
- ❌ Dos archivos diferentes
- ❌ Difícil de mantener
- ❌ Cambios deben hacerse en ambos
- ❌ Riesgo de inconsistencias

---

## 📋 PLAN DE MIGRACIÓN SEGURO

### **PASO 1: Preparación (5 minutos)**

```powershell
# En VS Code Terminal

# 1. Ir a carpeta del proyecto
cd C:\xampp\htdocs\Wacheck\Wacheck

# 2. Crear backup
copy api\user_handler.php api\user_handler_BACKUP.php

# 3. Verificar que el backup existe
dir api\user_handler_BACKUP.php
```

### **PASO 2: Probar en Local (10 minutos)**

1. **Renombrar híbrido:**
   ```powershell
   copy api\user_handler_HYBRID.php api\user_handler_TEST.php
   ```

2. **Modificar JavaScript temporalmente:**
   En `usuarios.js`, cambiar:
   ```javascript
   // Línea ~12
   const API_URL = 'api/user_handler.php';
   // Cambiar temporalmente a:
   const API_URL = 'api/user_handler_TEST.php';
   ```

3. **Probar en navegador:**
   - Abrir `http://localhost/Wacheck/Wacheck`
   - Crear usuario
   - Login
   - Jugar
   - Guardar progreso

4. **Si todo funciona:**
   - ✅ El híbrido es compatible
   - Continúa al Paso 3

5. **Si algo falla:**
   - ❌ Revisar consola del navegador (F12)
   - Anotar errores
   - Preguntar antes de continuar

### **PASO 3: Desplegar a Producción (5 minutos)**

**Solo si el Paso 2 fue exitoso:**

1. **En local:**
   ```powershell
   copy api\user_handler_HYBRID.php api\user_handler.php
   ```

2. **Subir a InfinityFree:**
   - Via FTP o File Manager
   - Reemplazar `api/user_handler.php`
   - (InfinityFree hace backup automático usualmente)

3. **Probar sitio web en producción:**
   - Abrir tu sitio online
   - Crear usuario de prueba
   - Verificar funcionalidad

4. **Probar desde APK:**
   - Cuando tengas la APK
   - Verificar que conecta correctamente

---

## 🔍 DIFERENCIAS TÉCNICAS DETALLADAS

### **mysqli vs PDO:**

```php
// ANTIGUO (mysqli)
$conn = new mysqli($servername, $username, $password_db, $dbname);
$sql = "SELECT * FROM users WHERE name = '$name'"; // ⚠️ Vulnerable a SQL Injection
$result = $conn->query($sql);

// NUEVO (PDO)
$conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
$stmt = $conn->prepare("SELECT * FROM users WHERE name = ?"); // ✅ Seguro
$stmt->execute([$name]);
```

**Ventajas PDO:**
- ✅ Prepared statements por defecto
- ✅ Más seguro
- ✅ Mejor manejo de errores
- ✅ Más portable

### **CORS Headers:**

```php
// VERSIÓN HÍBRIDA (inteligente)
if ($isAPKRequest) {
    header('Access-Control-Allow-Origin: *'); // Solo para APK
}

// vs

// VERSIÓN APK (siempre)
header('Access-Control-Allow-Origin: *'); // Siempre activo
```

**Por qué es importante:**
- 🌐 Web normal: No necesita CORS
- 📱 APK: Necesita CORS para funcionar
- 🔒 Híbrido: Activa CORS solo cuando es necesario

---

## ⚠️ POSIBLES PROBLEMAS Y SOLUCIONES

### **Problema 1: Error "Undefined index"**

**Causa:** Código JavaScript esperaba respuesta mysqli

**Solución:**
```javascript
// Verificar en usuarios.js que uses:
response.error    // no response['error']
response.id       // no response['id']
```

### **Problema 2: CORS error en navegador**

**Causa:** CORS activado para web normal

**Solución:** Usar versión híbrida (detecta automáticamente)

### **Problema 3: "Call to undefined function"**

**Causa:** Servidor no tiene PDO habilitado

**Solución:**
```php
// Verificar en info.php:
<?php phpinfo(); ?>
// Buscar "PDO" debe estar habilitado
```

### **Problema 4: Usuarios no pueden hacer login**

**Causa:** Contraseñas hasheadas diferente

**Solución:**
- Usuarios antiguos necesitan cambiar contraseña
- O migrar hashes manualmente

---

## 🧪 PRUEBAS A REALIZAR

### **Checklist de Pruebas:**

**En Sitio Web:**
- [ ] Crear nuevo usuario
- [ ] Login con usuario existente
- [ ] Guardar progreso
- [ ] Comprar defensor
- [ ] Completar calculadora
- [ ] Ver recompensas
- [ ] Sistema de logros

**En APK (cuando esté lista):**
- [ ] Conectar a servidor
- [ ] Crear usuario desde APK
- [ ] Login desde APK
- [ ] Sincronizar progreso
- [ ] Funciona offline

---

## 📊 RECOMENDACIÓN FINAL

### **Para tu caso específico:**

```
Situación: Sitio web funcionando + APK en desarrollo
Recomendación: Usar VERSIÓN HÍBRIDA

Por qué:
✅ Un solo archivo (fácil de mantener)
✅ Más seguro (CORS selectivo)
✅ Compatible con ambos
✅ No rompe sitio web actual
✅ Lista para APK
```

### **Plan de acción:**

1. **HOY:** Probar versión híbrida en local (Paso 2)
2. **Si funciona:** Desplegar a producción (Paso 3)
3. **Beneficio:** Cuando la APK esté lista, funcionará sin cambios

---

## 🚀 COMANDOS RÁPIDOS

```powershell
# Backup
copy api\user_handler.php api\user_handler_BACKUP.php

# Instalar híbrido
copy api\user_handler_HYBRID.php api\user_handler.php

# Si algo falla, restaurar:
copy api\user_handler_BACKUP.php api\user_handler.php
```

---

## 💬 MI CONSEJO PERSONAL

**Te recomiendo:**

1. **No toques el sitio web en producción aún**
2. **Prueba primero el híbrido en XAMPP local**
3. **Cuando Android Studio termine y compiles la APK, prueba con ambos**
4. **Si todo funciona perfecto, entonces actualiza producción**

**Razón:**
- Tu sitio web ya funciona
- No hay prisa
- Mejor probarlo todo junto cuando la APK esté lista
- Evitas romper algo que funciona

---

## 📞 SIGUIENTE PASO

**¿Quieres que te ayude a:**

A) Probar la versión híbrida en local ahora
B) Esperar a que la APK esté lista
C) Analizar más tu código JavaScript para ver compatibilidad

**¿Qué prefieres?** 😊
