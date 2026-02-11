# 🔒 Wacheck API Segura - Guía de Producción

## ⚠️ IMPORTANTE - ANTES DE IR A PRODUCCIÓN

Esta API tiene **TODAS** las medidas de seguridad necesarias para producción:

### ✅ Características de Seguridad Implementadas

1. **Variables de Entorno (.env)**
   - Credenciales sensibles fuera del código
   - Nunca se suben a GitHub

2. **Prepared Statements**
   - 100% protección contra SQL Injection
   - Validación de tipos de datos

3. **Encriptación AES-256-GCM**
   - Datos sensibles encriptados
   - Clave única por instalación

4. **Password Hashing**
   - Argon2id (más seguro que bcrypt)
   - Fallback automático a bcrypt si no disponible
   - Cost factor configurable

5. **Rate Limiting**
   - Protección contra fuerza bruta
   - Límite configurable de requests

6. **Bloqueo de Cuentas**
   - Bloqueo automático después de 5 intentos fallidos
   - Desbloqueo automático después de 30 minutos

7. **Headers de Seguridad**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection
   - Content-Security-Policy
   - HSTS (en producción)
   - Referrer-Policy
   - Permissions-Policy

8. **Validación y Sanitización**
   - Todos los inputs son sanitizados
   - Validación estricta de tipos
   - Prevención XSS

9. **CORS Seguro**
   - Whitelist de orígenes permitidos
   - No permite '*' en producción

10. **Logging**
    - Registro de errores y eventos
    - No expone información sensible

11. **Sesiones Seguras**
    - HTTPOnly cookies
    - Secure flag en producción
    - SameSite Strict
    - Regeneración periódica de IDs

---

## 📋 Instrucciones de Instalación

### Paso 1: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Paso 2: Editar .env con Tus Credenciales

```env
# IMPORTANTE: Genera claves seguras con estos comandos:

# Para APP_SECRET_KEY (64 caracteres hex):
php -r "echo bin2hex(random_bytes(32));"

# Para ENCRYPTION_KEY (32 bytes base64):
openssl rand -base64 32

# Para JWT_SECRET:
openssl rand -base64 64
```

Edita `.env` y rellena:

```env
# Producción
APP_ENV=production
APP_DEBUG=false

# Tu base de datos
DB_HOST=tu-host.com
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASS=tu_contraseña_segura

# Claves generadas
APP_SECRET_KEY=tu_clave_secreta_de_64_caracteres_hex
ENCRYPTION_KEY=tu_clave_encriptacion_base64
JWT_SECRET=tu_jwt_secret

# Rate limiting (ajustar según necesidad)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# CORS (tus dominios permitidos)
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

# Session (IMPORTANTE: true en producción con HTTPS)
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Strict
```

### Paso 3: Configurar Permisos

```bash
# Crear carpeta de logs
mkdir -p ../logs
chmod 755 ../logs

# Permisos del .env (solo lectura para propietario)
chmod 600 .env

# Permisos de archivos PHP
chmod 644 *.php
```

### Paso 4: Verificar Requisitos del Servidor

**PHP Mínimo: 7.4** (Recomendado: 8.0+)

Extensiones necesarias:
```bash
php -m | grep -E "pdo|pdo_mysql|openssl|json|mbstring"
```

Debe mostrar:
- pdo
- pdo_mysql
- openssl
- json
- mbstring

### Paso 5: Probar la API

```bash
# Ping test
curl https://tu-dominio.com/api/user_handler_SECURE.php?action=ping

# Debe responder:
{"status":"ok","message":"Wacheck API is running (SECURE)"}
```

---

## 🔧 Configuración del Frontend

Actualiza tu código JavaScript para usar la nueva API:

```javascript
// usuarios.js - Cambiar el endpoint
const API_URL = 'https://tu-dominio.com/api/user_handler_SECURE.php';

// El resto del código funciona igual
```

---

## 🛡️ Checklist de Seguridad Pre-Producción

Antes de ir a producción, verifica:

- [ ] `.env` configurado con credenciales reales
- [ ] `APP_ENV=production` en .env
- [ ] `APP_DEBUG=false` en .env
- [ ] Claves únicas generadas (no usar las del ejemplo)
- [ ] `SESSION_COOKIE_SECURE=true` (requiere HTTPS)
- [ ] CORS configurado con dominios reales (no '*')
- [ ] Permisos de archivos correctos (644 para PHP, 600 para .env)
- [ ] Carpeta `logs/` creada con permisos 755
- [ ] `.env` en `.gitignore` (verificar que no se suba a git)
- [ ] Certificado SSL/TLS instalado (HTTPS obligatorio)
- [ ] Firewall configurado (solo puertos 80/443 abiertos)
- [ ] Base de datos con usuario limitado (no usar root)
- [ ] Backups automáticos configurados
- [ ] Monitoreo de logs configurado

---

## 🚀 Migración desde API Antigua

### Opción 1: Migración Gradual

```php
// En user_handler_HYBRID.php, redirigir a la nueva API
header('Location: user_handler_SECURE.php?' . $_SERVER['QUERY_STRING']);
exit();
```

### Opción 2: Migración Directa

1. Renombrar archivo viejo:
```bash
mv user_handler_HYBRID.php user_handler_HYBRID.php.bak
```

2. Renombrar nuevo archivo:
```bash
mv user_handler_SECURE.php user_handler_HYBRID.php
```

3. Actualizar referencias en el frontend si es necesario

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs

```bash
# Logs de la API
tail -f ../logs/api.log

# Logs del servidor web
tail -f /var/log/apache2/error.log  # Apache
tail -f /var/log/nginx/error.log    # Nginx
```

### Rotación de Logs

Crear `/etc/logrotate.d/wacheck`:

```
/ruta/a/Wacheck/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
}
```

### Actualizar Claves Periódicamente

Cada 6 meses o después de una brecha de seguridad:

```bash
# Generar nuevas claves
php -r "echo bin2hex(random_bytes(32));"
openssl rand -base64 32

# Actualizar .env
nano .env

# Reiniciar servidor web
sudo systemctl restart apache2  # o nginx
```

---

## 🐛 Troubleshooting

### Error: "Encryption key not set"
**Solución**: Verifica que `ENCRYPTION_KEY` esté en `.env` y sea base64 válido

### Error: "Database connection failed"
**Solución**: Verifica credenciales en `.env` y que la BD exista

### Error 429: "Too many requests"
**Solución**: Aumenta `RATE_LIMIT_REQUESTS` en `.env`

### Session no persiste
**Solución**: Si usas HTTPS, asegura `SESSION_COOKIE_SECURE=true`

### CORS error
**Solución**: Agrega tu dominio a `CORS_ALLOWED_ORIGINS` en `.env`

---

## 📞 Soporte

Para reportar problemas de seguridad:
1. **NO** crear issue público en GitHub
2. Contactar directamente al equipo de desarrollo
3. Esperar respuesta antes de divulgar

---

## 📝 Changelog de Seguridad

### v2.0.0 (Secure) - 2026-02-10
- ✅ Variables de entorno implementadas
- ✅ Prepared statements para todas las queries
- ✅ Encriptación AES-256-GCM
- ✅ Rate limiting por IP
- ✅ Bloqueo de cuentas por intentos fallidos
- ✅ Headers de seguridad completos
- ✅ Validación y sanitización robusta
- ✅ Logging de eventos
- ✅ Sesiones seguras
- ✅ Password hashing con Argon2id

### v1.0.0 (Hybrid) - Anterior
- ⚠️ Solo para desarrollo/prototipo
- ⚠️ Credenciales hardcodeadas
- ⚠️ Sin rate limiting
- ⚠️ Sin encriptación de datos

---

## ⚖️ Licencia

Copyright © 2026 Wacheck. Todos los derechos reservados.
