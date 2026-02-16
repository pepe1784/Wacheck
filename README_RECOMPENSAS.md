# 🎁 Sistema de Recompensas Diarias y Usuario Invitado

## 📋 Resumen de Mejoras Implementadas

Se han implementado 4 sistemas nuevos que mejoran significativamente la experiencia de usuario:

1. **🎁 Recompensas Diarias Persistentes**
2. **👤 Usuario Invitado con Vinculación de Cuenta**
3. **🔐 Sesión Persistente**
4. **📧 Sistema de Correos Configurado**

---

## 🎁 1. Sistema de Recompensas Diarias

### Características:
- ✅ **Progresa día con día** sin reiniciarse
- ✅ **No se resetea** al llegar al día 7 (mantiene el progreso)
- ✅ **Aparece solo 1 vez al día** al entrar al index.html
- ✅ **Solo para usuarios logueados** (registrados o invitados)
- ✅ **Se reclama automáticamente** al siguiente día
- ✅ **Racha consecutiva** con bonus por mantenerla

### Funcionamiento:

#### Ciclo de 7 Días:
```
Día 1: 💰 50 monedas + 🔮 5 runas
Día 2: 💰 75 monedas + 🔮 10 runas
Día 3: 💰 100 monedas + 🔮 15 runas + ⭐ 1 especial
Día 4: 💰 150 monedas + 🔮 20 runas
Día 5: 💰 200 monedas + 🔮 25 runas + ⭐ 2 especiales
Día 6: 💰 300 monedas + 🔮 35 runas + ⭐ 3 especiales
Día 7: 💰 500 monedas + 🔮 50 runas + ⭐ 5 especiales (MEGA!)
```

Después del día 7, **el ciclo se reinicia** pero se mantiene la racha.

### Racha Consecutiva:
- Si entras **todos los días consecutivos**, se mantiene la racha
- Si **faltas 1 día**, la racha se resetea al día 1
- El **contador de días totales** nunca se resetea

### Aparición del Modal:
El modal **solo aparece**:
- ✅ Cuando es un **nuevo día** (no se ha reclamado hoy)
- ✅ Para usuarios **registrados o invitados**
- ✅ Al entrar a **index.html** 
- ❌ **NO aparece** si ya reclamaste hoy
- ❌ **NO aparece** en otras páginas

### Comandos de Consola:
```javascript
// Ver estado del sistema
DailyRewardsManager.state

// Forzar mostrar modal (para testing)
DailyRewardsManager.show()

// Reiniciar progreso (para testing)
localStorage.removeItem('wacheck_daily_rewards')
```

---

## 👤 2. Usuario Invitado Mejorado

### Características:
- ✅ **Jugar sin registro** con solo un nombre
- ✅ **Progreso guardado localmente**
- ✅ **Vincular a cuenta de correo** después
- ✅ **Transferencia completa** de progreso al vincular
- ✅ **Sesión persistente** igual que usuarios registrados

### Flujo de Usuario Invitado:

#### 1. Crear Invitado:
1. Usuario hace clic en "Jugar como Invitado"
2. Ingresa solo su **nombre** (3+ caracteres)
3. Comienza a jugar inmediatamente
4. Todo el progreso se guarda en `localStorage`

#### 2. Durante el Juego:
- El invitado tiene acceso a **todas las funcionalidades**
- Su progreso se guarda automáticamente
- Aparece como: **👤 [Nombre]** en la UI
- Puede ver sus **recompensas diarias**
- Puede reclamar **logros y misiones**

#### 3. Vincular Cuenta:
Cuando el invitado quiera **guardar su progreso en la nube**:

1. Click en su nombre → "🔗 Vincular Cuenta"
2. Ingresa **correo electrónico** y **contraseña**
3. Se crea la cuenta automáticamente
4. **Todo el progreso se transfiere**:
   - 💰 Monedas
   - ⭐ Monedas especiales
   - 🔮 Runas
   - 🏅 Estrellas
   - 🛡️ Defensores desbloqueados
   - 🎁 Recompensas diarias reclamadas
   - 🏆 Logros
   - 📜 Progreso de historia
5. Recibe **email de verficación**
6. Ahora puede jugar desde **cualquier dispositivo**

### Comandos de Consola:
```javascript
// Crear usuario invitado
GuestUserManager.createGuest('NombreAqui')

// Mostrar modal de vincular cuenta
GuestUserManager.showLinkAccountModal()

// Ver usuario actual
GuestUserManager.getStoredUser()
```

---

## 🔐 3. Sesión Persistente

### Características:
- ✅ **Sesión NO se cierra** al actualizar página
- ✅ **Sesión NO se cierra** al cerrar navegador
- ✅ **Persiste en todo el sitio** (index, game-page, etc.)
- ✅ **Auto-guardado cada 30 segundos**
- ✅ **Guardado antes de cerrar** pestaña
- ✅ **Sincronización automática** con servidor

### Funcionamiento:

#### Al Entrar al Sitio:
1. `SessionManager` verifica si hay sesión en `localStorage`
2. Si existe, la **restaura automáticamente**
3. Actualiza la **UI** con el nombre del usuario
4. Carga sus **estadísticas** y progreso
5. Si está en index.html, muestra **recompensas diarias** (si corresponde)

#### Durante la Sesión:
- Cada **30 segundos** guarda progreso automáticamente
- Al cerrar/actualizar página, **guarda antes de salir**
- Para usuarios registrados, intenta **sincronizar con servidor**
- Para invitados, guarda solo en **localStorage**

#### UI Actualizada:
En **index.html**, el botón de "Iniciar Sesión" cambia a:
- **Para registrados**: `👋 [Nombre]`
- **Para invitados**: `👤 [Nombre]`

Al hacer click, muestra un **menú dropdown**:

**Para Registrados:**
- 🎮 Ir al Juego
- 🎁 Ver Recompensas
- 📊 Mi Progreso
- 🚪 Cerrar Sesión

**Para Invitados:**
- 🎮 Ir al Juego
- 🔗 Vincular Cuenta
- 🚪 Cerrar Sesión

### Cerrar Sesión:
- Click en el usuario → "🚪 Cerrar Sesión"
- Confirma la acción
- Limpia **localStorage** y **gameState**
- Recarga la página

### Comandos de Consola:
```javascript
// Ver sesión actual
SessionManager.getStoredUser()

// Forzar guardado
SessionManager.autoSave()

// Cerrar sesión
SessionManager.logout()
```

---

## 📧 4. Sistema de Correos

### Configuración:
Ver archivo completo: **[CONFIGURAR_CORREOS_XAMPP.md](CONFIGURAR_CORREOS_XAMPP.md)**

### Resumen:
1. Configurar **Gmail con contraseña de aplicación**
2. Editar `php.ini` y `sendmail.ini` en XAMPP
3. Reiniciar Apache
4. Probar con `test-email.php`

### Funcionalidades que Usan Email:
- ✅ **Registro de usuarios** →  Email de verificación
- ✅ **Vincular cuenta invitada** → Confirmación por email
- ✅ **Recuperación de contraseña** (futuro)

---

## 📁 Archivos Nuevos Creados

| Archivo | Descripción |
|---------|-------------|
| `daily-rewards-modal.js` | Sistema de recompensas diarias |
| `guest-user-manager.js` | Gestión de usuarios invitados |
| `session-manager.js` | Persistencia de sesión |
| `CONFIGURAR_CORREOS_XAMPP.md` | Guía de configuración de emails |
| `README_RECOMPENSAS.md` | Este archivo |

---

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | + Scripts de sistemas nuevos<br>+ Botón "Jugar como Invitado" |
| `game-page.html` | + Scripts de sistemas nuevos |
| `css/auth-modal.css` | + Estilos para botón invitado<br>+ Divisor "o" |

---

## 🎮 Flujo Completo de Usuario

### 👤 Usuario Invitado:

```
1. Entra a index.html
   ↓
2. Click "Jugar como Invitado"
   ↓
3. Ingresa nombre
   ↓
4. Juega y gana progreso
   ↓
5. Ve recompensas diarias cada día
   ↓
6. [OPCIONAL] Vincula cuenta
   ↓
7. Ahora es usuario registrado
```

### 👨‍💻 Usuario Registrado:

```
1. Entra a index.html
   ↓
2. Sesión restaurada automáticamente
   ↓
3. Aparece modal de recompensa (si es nuevo día)
   ↓
4. Reclama recompensa
   ↓
5. Continúa jugando
   ↓
6. Progreso se guarda automáticamente cada 30s
```

---

## 🔧 Testing

### Probar Recompensas Diarias:

```javascript
// 1. Resetear progreso
localStorage.removeItem('wacheck_daily_rewards')

// 2. Recargar página
location.reload()

// 3. Debería aparecer modal con Día 1

// 4. Para simular otro día:
const state = JSON.parse(localStorage.getItem('wacheck_daily_rewards'))
state.lastClaimDate = '2026-02-14' // Un día antes
localStorage.setItem('wacheck_daily_rewards', JSON.stringify(state))
location.reload()
```

### Probar Usuario Invitado:

```javascript
// 1. Limpiar sesión
localStorage.removeItem('wacheck_user')

// 2. Recargar
location.reload()

// 3. Click "Jugar como Invitado"
// 4. Ingresar nombre
// 5. Jugar y ganar progreso
// 6. Verificar que se guarde:
JSON.parse(localStorage.getItem('wacheck_user'))

// 7. Vincular cuenta
GuestUserManager.showLinkAccountModal()
```

### Probar Persistencia de Sesión:

```javascript
// 1. Iniciar sesión
// 2. Actualizar página (F5)
// 3. Verificar que sigue logueado
// 4. Ir a game-page.html
// 5. Volver a index.html
// 6. Verificar que sigue logueado
```

---

## ⚙️ Configuración

### Customizar Recompensas:

Edita `daily-rewards-modal.js`:

```javascript
rewards: [
    { 
        day: 1, 
        coins: 50,            // Monedas
        runes: 5,             // Runas
        specialCoins: 0,      // Monedas especiales (opcional)
        description: "¡Bienvenido!", 
        icon: "🎁" 
    },
    // ... más días
]
```

### Customizar Auto-guardado:

Edita `session-manager.js`:

```javascript
// Cambiar intervalo de auto-guardado (default: 30 segundos)
setInterval(() => {
    this.autoSave();
}, 60000); // Cambiar a 60 segundos (1 minuto)
```

---

## 🐛 Troubleshooting

### El modal de recompensas no aparece:
```javascript
// Verificar estado
DailyRewardsManager.state

// Verificar si debe aparecer
DailyRewardsManager.shouldShow() // true/false

// Forzar aparecer
DailyRewardsManager.show()
```

### La sesión no persiste:
```javascript
// Verificar usuario guardado
localStorage.getItem('wacheck_user')

// Verificar SessionManager
SessionManager.getStoredUser()

// Restaurar sesión
SessionManager.checkAndRestoreSession()
```

### No se pueden vincular cuentas:
1. Verifica que el servidor esté corriendo
2. Verifica la configuración de correos (XAMPP)
3. Revisa la consola del navegador:
```javascript
// Ver último error
console.log(window.lastError)
```

---

## 📊 Datos Guardados

### Usuario Invitado (`localStorage`):
```json
{
    "id": 0,
    "name": "NombreInvitado",
    "isGuest": true,
    "guestSince": "2026-02-15T...",
    "coins": 100,
    "specialCoins": 0,
    "runes": 0,
    "stars": 0,
    "unlockedDefenders": [...],
    "dailyRewardsData": {
        "currentDay": 1,
        "lastClaimDate": "2026-2-15",
        "totalDaysClaimed": 1,
        "currentStreak": 1
    },
    "rewardsData": {},
    "achievementsData": {},
    "storyProgress": {}
}
```

### Recompensas Diarias (`localStorage`):
```json
{
    "currentDay": 3,
    "lastClaimDate": "2026-2-15",
    "totalDaysClaimed": 10,
    "currentStreak": 3,
    "showedToday": true
}
```

---

## ✨ Funcionalidades Futuras

Ideas para expandir el sistema:

- [ ] **Recompensas por racha larga** (7, 14, 30 días)
- [ ] **Calendario visual** de días reclamados
- [ ] **Bonus de fin de semana** (Sábado/Domingo)
- [ ] **Recompensas especiales** por eventos
- [ ] **Sistema de referidos** para invitados
- [ ] **Transferencia de cuenta** entre dispositivos
- [ ] **Modo offline** con sincronización posterior
- [ ] **Notificaciones push** de recompensas

---

## 🎯 Comandos Útiles

```javascript
// === RECOMPENSAS DIARIAS ===
DailyRewardsManager.state              // Ver estado
DailyRewardsManager.show()             // Mostrar modal
DailyRewardsManager.shouldShow()       // ¿Debe mostrarse?
DailyRewardsManager.claim()            // Reclamar

// === USUARIO INVITADO ===
GuestUserManager.createGuest('Nombre') // Crear invitado
GuestUserManager.showGuestModal()      // Mostrar modal
GuestUserManager.showLinkAccountModal() // Vincular cuenta
GuestUserManager.getStoredUser()       // Ver usuario actual

// === SESIÓN ===
SessionManager.getStoredUser()         // Ver sesión actual
SessionManager.autoSave()              // Guardar ahora
SessionManager.logout()                // Cerrar sesión

// === LIMPIAR TODO (RESET COMPLETO) ===
localStorage.clear()
location.reload()
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa la consola** del navegador (F12)
2. **Verifica localStorage**: `localStorage.getItem('wacheck_user')`
3. **Prueba los comandos** de arriba
4. **Revisa los logs** del servidor
5. **Reinicia Apache** (XAMPP)

---

**¡Sistema completo y funcionando!** 🎉

Ahora tienes:
- ✅ Recompensas diarias que progresan
- ✅ Usuarios invitados con vinculación
- ✅ Sesiones persistentes
- ✅ Correos configurados

**Próximos pasos sugeridos:**
1. Configurar correos en XAMPP (ver archivo de configuración)
2. Probar el flujo completo
3. Agregar más recompensas personalizadas
4. Implementar funcionalidades futuras

---

*Desarrollado para Wacheck - Universidad de Colima*  
*Febrero 2026*
