# 🏆 SISTEMA DE LOGROS - WaCheCK

## 📋 Resumen
Sistema completo de logros desbloqueables que recompensa a los jugadores por sus hazañas en WaCheCK. Los logros otorgan puntos y runas como recompensa.

## 🎯 Categorías de Logros

### 🎮 Primeros Pasos (inicio)
- **Primera Partida** - Juega tu primera partida (10 pts)
- **Primer Defensor** - Coloca tu primer defensor (10 pts)

### 🌊 Oleadas (oleadas)
- **Superviviente** - Alcanza la oleada 5 (20 pts)
- **Veterano** - Alcanza la oleada 10 (50 pts)
- **Maestro de las Olas** - Alcanza la oleada 20 (100 pts)
- **Guardián del Agua** - Alcanza la oleada 50 (250 pts)

### ⚔️ Combate (combate)
- **Exterminador** - Elimina 50 contaminadores (30 pts)
- **Cazador de Contaminantes** - Elimina 250 contaminadores (75 pts)
- **Leyenda del Agua** - Elimina 1000 contaminadores (200 pts)

### 👹 Jefes (jefes)
- **Cazador de Jefes** - Derrota a tu primer jefe (40 pts)
- **Matador de Titanes** - Derrota a 5 jefes (100 pts)

### 💰 Economía (economia)
- **Rico** - Acumula 1000 monedas en una partida (30 pts)
- **Millonario** - Acumula 5000 monedas en una partida (75 pts)
- **Coleccionista** - Consigue 10 monedas especiales (50 pts)

### 🛡️ Defensores (defensores)
- **Constructor** - Coloca 100 defensores (40 pts)
- **Colección Completa** - Desbloquea todos los defensores (150 pts)

### 📊 Upgrades (upgrades)
- **Poder Máximo** - Maximiza cualquier upgrade (100 pts)

### ✓ Misiones (misiones)
- **Completista** - Completa todas las misiones diarias en un día (60 pts)

### ✨ Especiales (especial)
- **Intocable** - Completa una oleada sin recibir daño (50 pts)
- **Defensa Perfecta** - Completa 5 oleadas consecutivas sin daño (150 pts)
- **Dedicado** - Inicia sesión 7 días consecutivos (75 pts)

### 🔒 Secretos (secreto)
- **???** - Logro secreto oculto (100 pts)

## 🎁 Recompensas

Cada logro otorga:
1. **Puntos de Logro** - Para el contador total
2. **Runas** - 50% del valor de puntos en runas (ej: logro de 100 pts = 50 runas)

## 📊 Tipos de Logros

### Simple (`type: 'simple'`)
Se desbloquea al realizar una acción específica una vez.
```javascript
unlockAchievement('first_game');
```

### Progreso (`type: 'progress'`)
Se desbloquea al alcanzar un valor específico.
```javascript
updateAchievementProgress('wave_10', gameState.wave);
```

### Acumulativo (`type: 'cumulative'`)
Se desbloquea al acumular un total a través del tiempo.
```javascript
incrementAchievementProgress('kills_50', 1);
```

### Partida Individual (`type: 'single_game'`)
Se desbloquea al alcanzar un valor en una sola partida.
```javascript
updateAchievementProgress('coins_1000', gameState.coins);
```

## 🔧 Integración

### Archivos Modificados
1. **achievements.js** - Sistema principal de logros (NUEVO)
2. **css/rewards.css** - Estilos para UI de logros (ACTUALIZADO +300 líneas)
3. **index.html** - Menú de logros (NUEVO)
4. **script.js** - Tracking automático de logros (ACTUALIZADO)
5. **rewards.js** - Integración con upgrades y misiones (ACTUALIZADO)
6. **usuarios.js** - Persistencia de logros (ACTUALIZADO)

### Tracking Automático

Los logros se desbloquean automáticamente durante el juego:

**startGame()** → `first_game`
**placeDefender()** → `first_defender`, `place_100`
**startWave()** → `wave_5`, `wave_10`, `wave_20`, `wave_50`
**handleContaminatorDeath()** → `kills_50`, `kills_250`, `kills_1000`, `first_boss`, `boss_5`
**checkWaveComplete()** → `coins_1000`, `coins_5000`, `no_damage_wave`, `special_coins_10`
**unlockDefender()** → `all_defenders`
**purchaseUpgrade()** → `max_upgrade`
**claimDailyReward()** → `daily_streak_7`
**claimMissionReward()** → `all_missions`

## 🎨 UI/UX

### Estadísticas Principales
- **Puntos Totales** - Suma de todos los logros desbloqueados
- **Logros Desbloqueados** - X/Total
- **% Completado** - Porcentaje de logros desbloqueados

### Notificación Emergente
Cuando se desbloquea un logro:
- Animación de entrada desde arriba
- Icono del logro con efecto glow
- Nombre y descripción
- Puntos otorgados
- Sonido de celebración
- Auto-cierre después de 4 segundos

### Tarjetas de Logros
- **Desbloqueado**: Verde, animación de pulso en icono
- **Bloqueado**: Opaco (60%), progreso mostrado
- **Secreto**: Muy opaco (40%), sin descripción

### Progreso Visual
Para logros con requisitos:
- Barra de progreso animada
- Texto "X/Y" debajo
- Color degradado azul-verde

## 💾 Persistencia

Los datos de logros se guardan en:

1. **localStorage** - `wacheck_achievements`
   ```javascript
   {
     unlockedAchievements: ['first_game', 'wave_5', ...],
     progress: { kills_50: 32, wave_10: 8, ... },
     totalPoints: 450,
     lastUnlocked: 'first_boss'
   }
   ```

2. **Servidor (usuarios registrados)** - Campo `achievementsData` en progreso de usuario

3. **gameState.currentUser.achievementsData** - En memoria durante sesión

## 🎯 Estadísticas

- **Total de Logros**: 23
- **Puntos Máximos Posibles**: 1,755 puntos
- **Runas Máximas Posibles**: 877 runas (de logros)
- **Logros Ocultos**: 1

## 🔮 Futuro

Logros potenciales para agregar:
- "Speed Runner" - Completa oleada X en menos de Y segundos
- "Economista" - Termina oleada con 0 monedas gastadas
- "Torre Solitaria" - Completa oleada con un solo defensor
- "Jardín del Edén" - Coloca 10 plantas en una partida
- "Reciclador Maestro" - Gana 1000 monedas de recicladores
- "Rey del Agua" - Alcanza oleada 100
- Easter eggs específicos del juego

## 🐛 Notas Técnicas

- Los logros se verifican en tiempo real durante el juego
- El progreso acumulativo persiste entre partidas
- Los logros "single_game" se resetean al iniciar nueva partida
- La verificación de oleadas sin daño compara `health` con `healthAtWaveStart`
- La verificación de "todos los defensores" solo cuenta los de la tienda de desbloqueo

## ✅ Testing

Para probar logros manualmente en consola del navegador:
```javascript
// Desbloquear logro
unlockAchievement('first_game');

// Actualizar progreso
updateAchievementProgress('wave_10', 10);

// Incrementar acumulativo
incrementAchievementProgress('kills_50', 50);

// Ver estado
console.log(achievementsState);

// Ver porcentaje
console.log(getCompletionPercentage());
```

---

**Versión**: 1.0  
**Autor**: GitHub Copilot  
**Fecha**: 2024  
**Estado**: ✅ Completamente Funcional
