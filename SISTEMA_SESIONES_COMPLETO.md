# Sistema de Autenticación con Sesiones PHP

## ✅ Cambios Realizados

### 1. API Backend (user_handler_HYBRID.php)
- ✅ Función `loginUser()` crea sesiones PHP con `session_start()`
- ✅ Regenera ID de sesión por seguridad con `session_regenerate_id(true)`
- ✅ Guarda datos en `$_SESSION`: user_id, username, logged_in, login_time
- ✅ Retorna campo `session` en respuesta para compatibilidad con frontend
- ✅ Nueva función `logoutUser()` que destruye sesión y cookies
- ✅ Nuevo caso `'logout'` en el switch de acciones

### 2. Middleware de Sesión (api/check-session.php)
- ✅ Verifica si hay sesión activa (`$_SESSION['logged_in']`)
- ✅ Redirige a `landing.html` si no hay sesión
- ✅ Redirige a `index.php` si ya hay sesión y estás en landing
- ✅ Retorna 401 JSON para peticiones AJAX sin autorización

### 3. Página Principal (index.php)
- ✅ Renombrado de `index.html` a `index.php` para soportar PHP
- ✅ Agregado `<?php require_once 'api/check-session.php'; ?>` al inicio
- ✅ Botón "Cerrar Sesión" en panel de configuración con estilo rojo
- ✅ Backup creado como `index_backup.html`

### 4. JavaScript (menu_config.js)
- ✅ Nueva función `handleLogout()`:
  - Pide confirmación antes de cerrar sesión
  - Hace fetch a `api/user_handler_HYBRID.php?action=logout`
  - Limpia localStorage (currentUser, wacheck-session)
  - Redirige a landing.html
- ✅ Exportada como `window.handleLogout`

### 5. Frontend (js/auth.js)
- ✅ Ya configurado para usar credenciales: 'include' en fetch
- ✅ Guarda datos en localStorage para compatibilidad
- ✅ Redirige a `index.php` después del login exitoso
- ✅ Verifica campo `data.session` en respuesta

## 📋 Flujo Completo

### Registro:
1. Usuario va a `landing.html`
2. Completa formulario de registro (username, email, password)
3. `handleRegister()` envía a `api/user_handler_HYBRID.php?action=create_user`
4. Usuario creado con email opcional y password hasheado

### Login:
1. Usuario completa formulario de login
2. `handleLogin()` envía credenciales
3. Backend verifica password con `password_verify()`
4. Crea sesión PHP y retorna datos de usuario + session ID
5. Frontend guarda en localStorage
6. Redirige a `index.php`

### Protección de Páginas:
1. `index.php` incluye `check-session.php`
2. Si no hay sesión → redirige a `landing.html`
3. Si hay sesión → carga el juego normalmente

### Logout:
1. Usuario hace clic en botón "Cerrar Sesión" en ⚙️ Configuración
2. `handleLogout()` pide confirmación
3. Fetch a `api/user_handler_HYBRID.php?action=logout`
4. Backend destruye sesión PHP
5. Frontend limpia localStorage
6. Redirige a `landing.html`

## 🧪 Cómo Probar

1. **Iniciar XAMPP**:
   - Apache debe estar ejecutándose
   - MySQL debe estar ejecutándose

2. **Abrir Landing**:
   ```
   http://localhost/Wacheck/landing.html
   ```

3. **Probar Registro**:
   - Clic en "Regístrate"
   - Username: `testuser`
   - Email: `test@gmail.com` (dominios permitidos: gmail, ucol.mx, hotmail, outlook, yahoo)
   - Password: `1234` (mínimo 4 caracteres)
   - Confirmar contraseña
   - Clic en "Registrarse"

4. **Probar Login**:
   - Clic en "Iniciar Sesión"
   - Username: `testuser`
   - Password: `1234`
   - Debe redirigir automáticamente a `index.php`

5. **Verificar Sesión**:
   - Una vez en el juego, intenta acceder directamente a `landing.html`
   - Debe redirigirte de vuelta a `index.php` (ya tienes sesión)

6. **Probar Logout**:
   - En el juego, clic en ⚙️ (engranaje superior derecho)
   - Clic en botón rojo "🚪 Cerrar Sesión"
   - Confirmar en el diálogo
   - Debe redirigir a `landing.html`

7. **Verificar Protección**:
   - Después de logout, intenta acceder directamente a:
     ```
     http://localhost/Wacheck/index.php
     ```
   - Debe redirigirte a `landing.html` (no hay sesión)

## ⚠️ Solución de Problemas

### Error "conexión con el servidor"
- ✅ **RESUELTO**: Cambiado de `user_handler_SECURE.php` a `user_handler_HYBRID.php`
- El SECURE requiere nueva estructura de BD con tabla `sessions`
- El HYBRID funciona con la BD actual

### Sesión no persiste
- Verificar que Apache tenga permisos para crear sesiones
- Verificar `session.save_path` en `php.ini`
- En Windows suele ser `C:\xampp\tmp`

### Headers already sent
- No debe haber salida antes de `session_start()`
- No debe haber BOM en archivos PHP
- El `<?php` debe ser lo primero en check-session.php

### Cookies bloqueadas
- En desarrollo, usar `http://localhost` (no IP)
- SameSite: Lax permite cookies en same-origin
- Secure: false en desarrollo (no HTTPS)

## 🔐 Seguridad Implementada

- ✅ Sesiones PHP con regeneración de ID
- ✅ Passwords hasheados con bcrypt (cost: 12)
- ✅ Validación de email con dominios permitidos
- ✅ Headers de seguridad (X-Content-Type-Options, X-Frame-Options)
- ✅ CORS configurado
- ✅ Prepared statements para SQL (PDO)
- ✅ Confirmación antes de logout
- ✅ Limpieza de localStorage al cerrar sesión

## 📦 Archivos Modificados

```
✅ api/user_handler_HYBRID.php    - Login con sesiones, logout
✅ api/check-session.php           - Middleware de protección
✅ index.html → index.php          - Renombrado con verificación
✅ menu_config.js                  - Función handleLogout
✅ js/auth.js                      - Ya estaba listo (sin cambios)
✅ landing.html                    - Ya estaba listo (sin cambios)
```

## 🎯 Próximos Pasos

1. **Probar el sistema completo** (registro → login → juego → logout)
2. **Si funciona**: ¡Listo para desarrollo! 🎉
3. **Si quieres email verification completo**:
   - Importar `wacheck_db_SECURE.sql`
   - Cambiar a `user_handler_SECURE.php` en auth.js
   - Configurar SMTP para envío de emails
