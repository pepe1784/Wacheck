# 📧 Configuración de Correos en XAMPP

## 🎯 Objetivo
Configurar XAMPP para enviar correos electrónicos reales desde `localhost`, necesarios para:
- Verificación de cuentas nuevas
- Recuperación de contraseñas  
- Notificaciones del sistema

## 📋 Prerequisitos
- XAMPP instalado
- Una cuenta de Gmail (recomendado) o cualquier otro proveedor SMTP
- Acceso a configuración de tu cuenta de correo

---

## 🔧 Método 1: Usar Gmail con SMTP (Recomendado)

### Paso 1: Configurar cuenta de Gmail

1. **Crear una contraseña de aplicación:**
   - Ve a [Cuenta de Google](https:myaccount.google.com/)
   - **Seguridad** → **Verificación en dos pasos** (activar si no lo está)
   - **Seguridad** → **Contraseñas de aplicaciones**
   - Selecciona "Aplicación personalizada" → escribe "XAMPP Wacheck"
   - Copia la contraseña de 16 caracteres que te da

### Paso 2: Configurar php.ini

1. Abre `C:\xampp\php\php.ini`

2. Busca la sección `[mail function]` y modifica:

```ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
sendmail_from = tu-email@gmail.com
sendmail_path = "\"C:\xampp\sendmail\sendmail.exe\" -t"
```

3. Guarda el archivo

### Paso 3: Configurar sendmail.ini

1. Abre `C:\xampp\sendmail\sendmail.ini`

2. Modifica estas líneas:

```ini
[sendmail]

smtp_server=smtp.gmail.com
smtp_port=587
error_logfile=error.log
debug_logfile=debug.log

auth_username=tu-email@gmail.com
auth_password=contraseña-de-aplicacion-16-caracteres
force_sender=tu-email@gmail.com

hostname=localhost
```

⚠️ **IMPORTANTE:**
- Reemplaza `tu-email@gmail.com` con tu correo real
- Usa la **contraseña de aplicación** de 16 caracteres, NO tu contraseña normal
- NO compartas este archivo en repositorios públicos

### Paso 4: Reiniciar Apache

1. Abre el Panel de Control de XAMPP
2. Detén Apache
3. Inicia Apache de nuevo

---

## 🧪 Probar la Configuración

### Crear archivo de prueba: `test-email.php`

```php
<?php
$to = "tu-correo-de-prueba@gmail.com";
$subject = "Prueba de correo desde XAMPP";
$message = "¡Si recibes este correo, la configuración funciona correctamente!";
$headers = "From: noreply@wacheck.local\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo "✅ Correo enviado correctamente";
} else {
    echo "❌ Error al enviar correo";
}
?>
```

Abre `http://localhost/test-email.php` en tu navegador.

---

## 🔧 Método 2: Usar Outlook/Hotmail

Si prefieres usar Outlook:

### sendmail.ini para Outlook:
```ini
smtp_server=smtp-mail.outlook.com
smtp_port=587
auth_username=tu-email@outlook.com
auth_password=tu-contraseña
force_sender=tu-email@outlook.com
```

---

## 🔧 Método 3: Usar SendGrid (Profesional)

Para producción real, SendGrid es mejor opción:

1. Regístrate en [SendGrid](https://sendgrid.com/)
2. Obtén tu API Key
3. Usa la librería de SendGrid para PHP:

```bash
composer require sendgrid/sendgrid
```

4. En tu código PHP:

```php
<?php
require 'vendor/autoload.php';

$email = new \SendGrid\Mail\Mail();
$email->setFrom("noreply@wacheck.com", "Wacheck");
$email->setSubject("Test Email");
$email->addTo("destinatario@email.com", "Usuario");
$email->addContent("text/html", "<p>Contenido del correo</p>");

$sendgrid = new \SendGrid('TU-API-KEY-AQUI');

try {
    $response = $sendgrid->send($email);
    echo "✅ Email enviado: " . $response->statusCode();
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

---

## 🐛 Solución de Problemas

### Error: "SMTP connect() failed"
- Verifica que hayas activado "Aplicaciones menos seguras" o uses contraseña de aplicación
- Revisa que el puerto sea 587 (TLS) o 465 (SSL)
- Verifica tu conexión a internet

### Error: "Could not authenticate"
- Confirma que estés usando la contraseña de aplicación de 16 caracteres
- Verifica que el email sea correcto
- Asegúrate de haber activado la verificación en dos pasos

### Los correos no llegan:
1. Revisa la carpeta de SPAM
2. Verifica los logs:
   - `C:\xampp\sendmail\error.log`
   - `C:\xampp\sendmail\debug.log`

### Ver logs en tiempo real:
```bash
# En PowerShell:
Get-Content C:\xampp\sendmail\error log -Wait
```

---

## ✅ Verificar que Funciona en Wacheck

1. Abre `http://localhost/Wacheck/index.html`
2. Haz clic en "Crear Cuenta"
3. Ingresa:
   - Nombre de usuario
   - Tu email (real)
   - Contraseña
4. Envía el formulario
5. Deberías recibir un email de verificación en 1-2 minutos

---

## 📚 Integración con el Sistema de Wacheck

El archivo `api/user_handler_SECURE.php` ya incluye la función de envío de emails:

```php
function sendVerificationEmail($email, $username, $token) {
    $appUrl = EnvLoader::get('APP_URL', 'http://localhost/Wacheck');
    $verifyUrl = "$appUrl/verify-email.php?token=$token";
    
    // ... código de envío ...
    
    return mail($email, $subject, $message, $headers);
}
```

Solo necesitas configurar XAMPP como se indicó arriba.

---

## 🔐 Seguridad

### NO hagas esto:
❌ Subir `sendmail.ini` con tu contraseña a GitHub
❌ Usar tu contraseña principal de Gmail
❌ Compartir tu archivo `.env` con credenciales

### SÍ debes hacer esto:
✅ Usar contraseñas de aplicación
✅ Agregar `sendmail.ini` al `.gitignore`
✅ Usar variables de entorno para producción
✅ Rotar contraseñas regularmente

---

## 📝 Ejemplo de .gitignore

Agrega estas líneas a tu `.gitignore`:

```
# Configuración local
sendmail.ini
php.ini
.env

# Logs
*.log
error.log
debug.log
```

---

## 🚀 Para Producción (Hosting Real)

Cuando subas a un hosting real (como InfinityFree o similar):

1. **No necesitas configurar sendmail** - el hosting ya tiene su propio servidor SMTP
2. El código PHP `mail()` funcionará automáticamente
3. Solo asegúrate de que `user_handler_SECURE.php` use el dominio correcto

Ejemplo para `.env` en producción:
```
APP_URL=https://wacheck.gamer.gd
SMTP_FROM=noreply@wacheck.gamer.gd
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en `C:\xampp\sendmail\`
2. Verifica que Apache esté reiniciado
3. Prueba con el script `test-email.php` primero
4. Confirma que tu firewall no esté bloqueando el puerto 587

---

## ✨ Funcionalidades que Usarán Email

Con esto configurado, funcionarán:

1. ✅ **Registro de usuarios** - Email de verificación
2. ✅ **Recuperación de contraseña** - Envío de código
3. ✅ **Vincular cuenta de invitado** - Confirmación por email
4. ✅ **Notificaciones de logros** (futuro)

---

**¡Listo!** Con esto tu sistema de correos estará funcionando perfectamente en XAMPP. 🎉

Para cualquier duda, revisa los logs o prueba con el script de prueba primero.
