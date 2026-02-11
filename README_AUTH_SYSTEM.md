# 🔐 Sistema de Autenticación Seguro - Wacheck

## ✅ Implementación Completa

### 📋 Archivos Creados/Modificados

#### 🆕 Archivos Nuevos:
1. **wacheck_db_SECURE.sql** - Base de datos actualizada con sistema de emails
2. **verify-email.php** - Página de verificación de correo
3. **check-session.php** - Middleware de autenticación
4. **index.php** - Página del juego protegida con sesiones
5. **game.html** - Copia del juego (HTML puro)
6. **logout.php** - Cierre de sesión
7. **js/auth.js** - Sistema de login/registro
8. **css/auth-modal.css** - Estilos del modal

#### 🔄 Archivos Actualizados:
1. **api/user_handler_SECURE.php** - API segura con verificación de email
2. **landing.html** - Modal de login/registro
3. **api/.env** - Configuración con APP_URL

---

## 🚀 Instalación Rápida

### 1️⃣ Configurar Base de Datos

```sql
-- Importar en phpMyAdmin
wacheck_db_SECURE.sql
```

Esto crea 3 tablas:
- `users` - Usuarios con verificación de email
- `sessions` - Sesiones activas
- `activity_log` - Auditoría de seguridad

### 2️⃣ Configurar Variables de Entorno

Edita `api/.env`:

```env
# DESARROLLO (XAMPP)
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost/Wacheck

DB_HOST=localhost
DB_NAME=wacheck_db
DB_USER=root
DB_PASS=

# PRODUCCIÓN (comentadas, descomentar cuando subas)
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://wacheck.gamer.gd
# DB_HOST=sql110.infinityfree.com
# DB_NAME=if0_40107414_wacheck
# DB_USER=if0_40107414
# DB_PASS=xJHJWEldhH
```

### 3️⃣ Configurar PHP Mail

Para desarrollo local con XAMPP, instala **Fake Sendmail**:

1. Descarga: https://github.com/rnwood/smtp4dev
2. O configura SMTP en `php.ini`:

```ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
sendmail_from = tu_email@gmail.com
sendmail_path = "\"C:\\xampp\\sendmail\\sendmail.exe\" -t"
```

**Para producción**: El servidor de InfinityFree ya tiene `mail()` configurado.

---

## 🔑 Flujo de Autenticación

### Registro de Usuario:

1. Usuario abre `landing.html`
2. Click en "Iniciar Sesión" → Tab "Registrarse"
3. Completa formulario (username, email, contraseña)
4. Sistema valida:
   - ✅ Email válido (@gmail.com, @ucol.mx, @hotmail.com, @outlook.com, @yahoo.com)
   - ✅ Usuario único
   - ✅ Contraseña mínimo 4 caracteres
5. Se crea cuenta con `email_verified = 0`
6. **Se envía email de verificación** con token único (expira en 24h)

### Verificación:

1. Usuario recibe correo con enlace:
   ```
   http://localhost/Wacheck/verify-email.php?token=abc123...
   ```
2. Al hacer click:
   - ✅ Token válido → `email_verified = 1`
   - ❌ Token inválido/expirado → Error

### Login:

1. Usuario ingresa username + contraseña en `landing.html`
2. Sistema verifica:
   - ✅ Usuario existe
   - ✅ **Email verificado** (si no, muestra error)
   - ✅ Contraseña correcta
   - ✅ Cuenta no bloqueada (5 intentos fallidos = 30 min block)
3. Si todo OK:
   - Crea sesión PHP segura
   - Guarda datos en localStorage
   - Redirige a `index.php` (juego protegido)

### Acceso al Juego:

- **index.php** incluye `check-session.php`
- Verifica sesión activa cada request
- Si no hay sesión → redirige a `landing.html`
- Sesión expira después de 2 horas de inactividad

---

## 🔒 Seguridad Implementada

### ✅ Sistema Completo:

| Característica | Estado | Descripción |
|---|---|---|
| **Verificación Email** | ✅ | Tokens únicos de 64 caracteres, expiración 24h |
| **Password Hashing** | ✅ | Argon2id (cost: 65536, time: 4) + bcrypt fallback |
| **Sesiones Seguras** | ✅ | HTTPOnly, SameSite, regeneración cada 30 min |
| **Rate Limiting** | ✅ | 1000 req/hora (dev), 100 req/hora (prod) |
| **Account Lockout** | ✅ | 5 intentos → 30 min bloqueo |
| **SQL Injection** | ✅ | Prepared statements en todas las queries |
| **XSS Protection** | ✅ | Sanitización de inputs, headers de seguridad |
| **CSRF Protection** | ✅ | Tokens en forms, validación de origen |
| **Validación Email** | ✅ | Solo dominios permitidos (gmail, ucol.mx, etc.) |
| **Auditoría** | ✅ | Tabla `activity_log` con IPs y user agents |

### 🔐 Headers de Seguridad:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📧 Configurar Email de Verificación

### Opción 1: Gmail SMTP (Desarrollo)

```ini
; php.ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
auth_username = tu_email@gmail.com
auth_password = tu_contraseña_de_aplicación
```

**Nota**: Necesitas crear una "contraseña de aplicación" en Google:
1. https://myaccount.google.com/security
2. Verificación en 2 pasos → Contraseñas de aplicaciones

### Opción 2: InfinityFree (Producción)

**Ya está configurado** ✅ - InfinityFree usa `mail()` por defecto.

Verifica en `user_handler_SECURE.php` línea ~85:

```php
function sendVerificationEmail($email, $username, $token) {
    $appUrl = EnvLoader::get('APP_URL', 'http://localhost/Wacheck');
    $verifyUrl = "$appUrl/verify-email.php?token=$token";
    
    // ... código del email HTML ...
    
    return mail($email, $subject, $message, $headers);
}
```

---

## 🧪 Probar el Sistema

### Test 1: Registro Completo

```bash
# Abre en navegador:
http://localhost/Wacheck/landing.html

# 1. Click "Iniciar Sesión"
# 2. Tab "Registrarse"
# 3. Completa:
#    - Username: testuser
#    - Email: tu_email@gmail.com
#    - Password: test1234
# 4. Click "Crear Cuenta"
# 5. Revisa tu email
# 6. Click en el enlace de verificación
```

### Test 2: Login Sin Verificar

```bash
# Intenta login sin verificar email
# Debe mostrar: "Email no verificado"
# Opción de reenviar email
```

### Test 3: Login Verificado

```bash
# Después de verificar email:
# 1. Login con username + password
# 2. Debe redirigir a index.php
# 3. Muestra el juego con badge verde: "✅ testuser [Cerrar Sesión]"
```

### Test 4: Protección de Rutas

```bash
# Intenta acceder directo:
http://localhost/Wacheck/index.php

# Sin sesión → redirige a landing.html
# Con sesión → carga el juego
```

### Test 5: Rate Limiting

```bash
# Haz 15 intentos de login fallidos rápidamente
# Debe bloquear temporalmente (429 Too Many Requests)
```

---

## 🌐 Despliegue a Producción

### 1️⃣ Preparar Archivos

```bash
# Subir a InfinityFree via FTP:
/htdocs/
├── landing.html
├── index.php
├── game.html
├── verify-email.php
├── check-session.php
├── logout.php
├── api/
│   ├── user_handler_SECURE.php
│   ├── Security.php
│   ├── EnvLoader.php
│   └── .env  # ⚠️ IMPORTANTE: Configurar con datos de producción
├── js/
│   └── auth.js
└── css/
    └── auth-modal.css
```

### 2️⃣ Configurar .env en Producción

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://wacheck.gamer.gd

DB_HOST=sql110.infinityfree.com
DB_NAME=if0_40107414_wacheck
DB_USER=if0_40107414
DB_PASS=xJHJWEldhH

# Generar claves únicas con GENERAR_CLAVES.bat
APP_SECRET_KEY=... (64 hex)
ENCRYPTION_KEY=... (32 bytes base64)
JWT_SECRET=... (64 bytes base64)

RATE_LIMIT_REQUESTS=100
SESSION_COOKIE_SECURE=true
```

### 3️⃣ Importar Base de Datos

```sql
-- En phpMyAdmin de InfinityFree:
-- Importar: wacheck_db_SECURE.sql
```

### 4️⃣ Probar en Producción

```bash
https://wacheck.gamer.gd/landing.html
```

---

## 🔧 Configuración Avanzada

### Cambiar Dominios Permitidos

Edita `user_handler_SECURE.php` línea ~236:

```php
$allowedDomains = ['gmail.com', 'ucol.mx', 'hotmail.com', 'outlook.com', 'yahoo.com'];
// Agregar más:
$allowedDomains = ['gmail.com', 'ucol.mx', 'midominio.mx'];
```

### Ajustar Tiempo de Sesión

Edita `check-session.php` línea ~21:

```php
// Cambiar de 2 horas (7200) a 4 horas:
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > 14400) {
```

### Cambiar Rate Limit

Edita `.env`:

```env
RATE_LIMIT_REQUESTS=200  # Aumentar a 200 requests
RATE_LIMIT_WINDOW=3600   # Por hora
```

---

## 🐛 Troubleshooting

### ❌ "No se envían emails"

**Causa**: PHP mail() no configurado

**Solución**:
1. Verifica `php.ini`: `SMTP = smtp.gmail.com`
2. O usa SMTP4dev para testing: https://github.com/rnwood/smtp4dev
3. En producción (InfinityFree) debe funcionar automáticamente

### ❌ "Session no se crea"

**Causa**: Cookies bloqueadas

**Solución**:
1. Verifica en `.env`: `SESSION_COOKIE_SECURE=false` (desarrollo)
2. En producción con HTTPS: `SESSION_COOKIE_SECURE=true`
3. Limpia cookies del navegador

### ❌ "Token inválido" al verificar email

**Causa**: Token expiró (24h)

**Solución**:
1. En login, hay opción "Reenviar verificación"
2. O desde API: `POST /api/user_handler_SECURE.php?action=resend_verification`

### ❌ "Too many requests"

**Causa**: Rate limit activado

**Solución**:
1. Espera 1 hora
2. O ajusta `RATE_LIMIT_REQUESTS` en `.env`
3. O limpia sesión: cierra el navegador

---

## 📊 Monitoreo

### Ver Logs

```php
// api/logs/api.log
[2026-02-10 15:30:45] LOGIN_SUCCESS: User testuser (192.168.1.100)
[2026-02-10 15:31:12] REGISTER_USER: testuser2 - tu@gmail.com
[2026-02-10 15:32:05] EMAIL_VERIFIED: testuser2
```

### Consultar Actividad

```sql
SELECT * FROM activity_log 
WHERE action = 'LOGIN_SUCCESS' 
ORDER BY created_at DESC 
LIMIT 50;
```

### Sesiones Activas

```sql
SELECT u.username, s.ip_address, s.expires_at 
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW();
```

---

## 📚 API Endpoints

### `POST /api/user_handler_SECURE.php`

#### `?action=create_user`
```json
{
  "name": "username",
  "email": "user@gmail.com",
  "password": "password123"
}
```
**Response**: Usuario creado + email enviado

#### `?action=login`
```json
{
  "name": "username",
  "password": "password123"
}
```
**Response**: Datos de usuario + sesión creada

#### `?action=verify_email`
```json
{
  "token": "abc123..."
}
```
**Response**: Email verificado

#### `?action=resend_verification`
```json
{
  "email": "user@gmail.com"
}
```
**Response**: Nuevo email enviado

---

## ✅ Checklist de Producción

- [ ] Importar `wacheck_db_SECURE.sql`
- [ ] Subir archivos a servidor
- [ ] Configurar `.env` con credenciales reales
- [ ] Generar claves únicas con `GENERAR_CLAVES.bat`
- [ ] Cambiar `APP_ENV=production`
- [ ] Cambiar `APP_DEBUG=false`
- [ ] Cambiar `SESSION_COOKIE_SECURE=true`
- [ ] Verificar HTTPS activo
- [ ] Probar registro completo
- [ ] Probar login
- [ ] Verificar recepción de emails
- [ ] Probar sesiones
- [ ] Verificar rate limiting

---

## 🎉 ¡Listo!

Tu sistema de autenticación está completamente implementado y seguro para producción.

**Próximos pasos opcionales**:
- Agregar recuperación de contraseña (reset password)
- Implementar 2FA (autenticación de dos factores)
- Panel de administración
- Estadísticas de usuarios

---

## 📞 Soporte

Si tienes dudas, revisa:
1. `api/README_SECURITY.md` - Documentación completa de seguridad
2. Logs en `api/logs/api.log`
3. Tabla `activity_log` en la base de datos
