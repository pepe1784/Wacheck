# 🛡️ Sistema Anti-Cheat de Wacheck

## 📋 Descripción

El sistema anti-cheat protege la integridad del juego detectando y penalizando modificaciones ilegales de estadísticas desde el inspector del navegador.

## 🔍 ¿Qué detecta?

### Valores monitorizados:
- **Monedas**: Límite de 10,000 acumuladas
- **Monedas especiales**: Límite de 100 por sesión, 99,999 total
- **Salud del jugador**: Máximo 150 (con mejoras)
- **Daño de defensores**: Máximo 500 (con crítico)
- **Vida de defensores**: Máximo 750 (con mejoras)
- **Rango de defensores**: Máximo 10 casillas
- **Oleada actual**: Máximo razonable 1000

### Tipos de trampa detectados:
1. **Modificación de stats**: Cambiar daño, vida, rango de defensores
2. **Monedas infinitas**: Modificar monedas en el inspector
3. **Salud infinita**: Modificar vida del jugador
4. **Code tampering**: Modificar funciones del juego

## ⚖️ Sistema de Penalizaciones

### Primera violación:
- ⚠️ **Advertencia temporal** (8 segundos en pantalla)
- 🚫 **Bloqueo de recompensas** hasta reiniciar
- 📝 **Registro de la violación**

### Tercera violación o violación crítica:
- 🚫 **BANEO PERMANENTE**
- ❌ **Banner rojo permanente** en la parte superior
- 🔒 **Bloqueo total de recompensas**
- 📊 **Valores ajustados a límites permitidos**
- 💾 **No se guarda progreso en servidor**

## 🎮 Comandos de Consola

Abre la consola del navegador (F12) y usa estos comandos:

### Ver estado del sistema:
```javascript
AntiCheat.violations
// Muestra: count (violaciones), banned (si está baneado), warnings (historial)
```

### Verificar si está limpio:
```javascript
AntiCheat.isClean()
// Retorna: true si no tiene violaciones, false si tiene
```

### Ver límites del sistema:
```javascript
AntiCheat.limits
// Muestra todos los límites máximos permitidos
```

### Validar estado actual del juego:
```javascript
AntiCheat.validateGameState()
// Ejecuta validación inmediata
```

### 🔧 Resetear violaciones (solo para desarrollo/testing):
```javascript
AntiCheat.resetViolations()
// ⚠️ CUIDADO: Esto limpia todas las violaciones y desbanea al usuario
```

### Ver historial de warnings:
```javascript
AntiCheat.violations.warnings
// Muestra array con todas las violaciones registradas
```

## 🛠️ Para Desarrolladores

### Desactivar temporalmente (solo para testing):
```javascript
window.REWARDS_BLOCKED = false;
AntiCheat.resetViolations();
```

### Ajustar límites (en anti-cheat.js):
```javascript
AntiCheat.limits.defenderDamage.withUpgrades = 300; // Nuevo límite
```

### Ver logs en consola:
El sistema registra automáticamente:
- ✅ Iniciación del sistema
- ⚠️ Valores irregulares detectados
- 🚫 Recompensas bloqueadas
- 📊 Validaciones ejecutadas

## 🎯 Valores Máximos Permitidos

### Defensores:
| Stat | Base | Con Mejoras | Con Crítico |
|------|------|-------------|-------------|
| Daño | 150 | 250 | 500 |
| Vida | 500 | 750 | - |
| Rango | 8 | 10 | - |

### Recursos:
| Recurso | Límite |
|---------|--------|
| Monedas por oleada | 500 (con jefe) |
| Monedas acumuladas | 10,000 |
| Monedas especiales/sesión | 100 |
| Monedas especiales totales | 99,999 |

### Jugador:
| Stat | Límite |
|------|--------|
| Salud base | 100 |
| Salud con mejoras | 150 |
| Oleada máxima | 1000 |

## 📊 Cómo Funciona

1. **Monitoreo continuo**: Cada 2 segundos valida el estado del juego
2. **Detección**: Compara valores actuales vs límites permitidos
3. **Registro**: Guarda evidencia de cada violación
4. **Penalización**: Aplica castigos progresivos
5. **Persistencia**: Guarda estado en localStorage

## ✅ Validaciones Implementadas

### Durante el juego:
- ✓ Validación antes de otorgar monedas por eliminar enemigos
- ✓ Validación antes de otorgar monedas especiales de jefes
- ✓ Validación al terminar oleadas
- ✓ Validación en Game Over
- ✓ Monitoreo continuo cada 2 segundos

### En recompensas:
- ✓ Bloqueo de `awardSpecialCoins()`
- ✓ Bloqueo de guardado de progreso
- ✓ Bloqueo de monedas de jefes
- ✓ Validación de montos razonables

## 🔒 Seguridad Adicional

### Hash de integridad:
El sistema puede detectar si funciones críticas fueron modificadas:
```javascript
AntiCheat.validateCodeIntegrity()
```

Detecta patrones sospechosos en el código:
- `999999` (valores infinitos)
- `Infinity`
- Modificaciones de funciones clave

## 📝 Logs y Reportes

El sistema registra en consola:
```
🛡️ Anti-Cheat System initialized
🛡️ Anti-Cheat System loaded
⚠️ ANTI-CHEAT: Valores irregulares detectados
🚫 ANTI-CHEAT: Usuario baneado por violaciones graves
```

## 🎓 Testing

Para probar el sistema:

1. **Simular trampa leve**:
```javascript
gameState.coins = 15000; // Supera límite de 10,000
// Espera 2 segundos para que detecte
```

2. **Simular trampa crítica**:
```javascript
gameState.defenders[0].baseDamage = 9999; // Daño imposible
// Resultado: Baneo inmediato
```

3. **Ver resultado**:
```javascript
AntiCheat.violations
// Verifica el estado
```

## 🌟 Características Clave

- ✅ **No intrusivo**: Solo actúa cuando detecta anomalías
- ✅ **Justo**: Sistema de advertencias progresivas
- ✅ **Persistente**: Guarda estado en localStorage
- ✅ **Visual**: Advertencias claras y llamativas
- ✅ **Configurable**: Fácil ajustar límites
- ✅ **Auditable**: Logs completos de violaciones

## 🚀 Futuras Mejoras

- [ ] Enviar reportes al servidor
- [ ] Dashboard de administración
- [ ] Análisis de patrones de trampa
- [ ] Sistema de apelaciones
- [ ] Integración con base de datos

## ⚠️ IMPORTANTE

Este sistema es efectivo contra trampas casuales desde el inspector del navegador, pero:

- **NO protege contra**: Modificaciones del código fuente, bots avanzados, o herramientas de hacking sofisticadas
- **SÍ protege contra**: Usuarios cambiando valores desde la consola o inspector
- **Recomendado para**: Juegos casuales, educativos, sin competencia seria

Para competencias con premios reales, se requiere validación del lado del servidor adicional.

---

**Desarrollado para Wacheck - Universidad de Colima**
Sistema implementado: Febrero 2026
