# 📋 Guía de API - Wacheck

## 🔧 Configuración Actual

### Archivos API:
- **`user_handler_HYBRID.php`** ⭐ - API PRINCIPAL (usar este)
- **`api_old/user_handler.php`** - API anterior (solo referencia)

---

## 🚀 Cómo Usar la API Híbrida

### Para XAMPP (Desarrollo Local):
```php
// En user_handler_HYBRID.php línea ~16
$useProduction = false; // ⬅️ Dejar en false
```

### Para Servidor en Producción:
```php
// En user_handler_HYBRID.php línea ~16
$useProduction = true; // ⬅️ Cambiar a true antes de subir
```

---

## 📊 Configuración de Base de Datos

### XAMPP (localhost):
- **Host:** localhost
- **Usuario:** root
- **Contraseña:** (vacío)
- **Base de datos:** wacheck_db

### Producción (InfinityFree):
- **Host:** sql110.infinityfree.com
- **Usuario:** if0_40107414
- **Contraseña:** xJHJWEldhH
- **Base de datos:** if0_40107414_wacheck

---

## 🎯 Endpoints Disponibles

### 1. Ping (verificar disponibilidad)
```
GET api/user_handler_HYBRID.php?action=ping
```

### 2. Crear Usuario
```
POST api/user_handler_HYBRID.php?action=create_user
Body: {
  "name": "usuario",
  "password": "contraseña"
}
```

### 3. Login
```
POST api/user_handler_HYBRID.php?action=login
Body: {
  "name": "usuario",
  "password": "contraseña"
}
```

### 4. Guardar Progreso
```
POST api/user_handler_HYBRID.php?action=save_progress
Body: {
  "id": 1,  // O "userId": 1
  "specialCoins": 100,
  "unlockedDefenders": [...],
  "calculatorCompleted": true,
  "rewardsData": {...},
  "achievementsData": {...},
  "storyProgress": {...}
}
```

---

## ✅ Ventajas de la API Híbrida

1. **Un solo archivo** para web y APK
2. **Detección automática** de peticiones CORS desde APK
3. **Compatibilidad** con nombres de columna de la API anterior
4. **Configuración dual** XAMPP/Producción con un solo switch
5. **PDO** para mayor seguridad
6. **Mapeo automático** entre nombres de columnas (snake_case) y frontend (camelCase)

---

## 🔄 Migración de la API Antigua

La API anterior (`api_old/user_handler.php`) usaba:
- MySQLi en lugar de PDO
- Configuración manual comentada/descomentada
- Nombres de columna inconsistentes

La API Hybrid mejora todo esto manteniendo compatibilidad total.

---

## 🛡️ Seguridad

- Contraseñas hasheadas con `PASSWORD_BCRYPT`
- Validación de entrada
- PDO con prepared statements
- CORS solo cuando es necesario
- Sin exposición de passwords en respuestas

---

## 📝 Notas Importantes

1. **XAMPP:** Asegúrate de tener la base de datos `wacheck_db` creada
2. **Producción:** La tabla se crea automáticamente si no existe
3. **Compatibilidad:** Soporta tanto `id` como `userId` en save_progress
4. **Defensores por defecto:** filter, plant, recycler, cleaner, stream, bubble, wind, earth
