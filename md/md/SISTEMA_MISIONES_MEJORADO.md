# 🎯 SISTEMA DE MISIONES MEJORADO

## ✨ Nuevas Características

### 1. **Dos Secciones Separadas**

#### 📋 **Misiones Activas**
- Muestra las 3 misiones actuales disponibles
- Barra de progreso en tiempo real
- Botón "RECLAMAR" cuando se completan
- Se actualizan dinámicamente

#### ✅ **Reclamadas Hoy**
- Muestra todas las misiones que has reclamado hoy
- Contador de misiones reclamadas (badge verde)
- Se resetean automáticamente cada día
- Sirve como historial diario

### 2. **Misiones Dinámicas y Adaptativas**

Las misiones ahora se adaptan **automáticamente** a tu nivel y progreso:

#### 🆕 **Jugadores Nuevos** (Oleada 0-4)
```
✓ Alcanza la oleada 3 → 🔮 5 runas, 💰 50 monedas
✓ Alcanza la oleada 5 → 🔮 10 runas, 💰 100 monedas
✓ Elimina 25 contaminadores → 🔮 12 runas, 💰 120 monedas
✓ Coloca 5 defensores → 🔮 8 runas, 💰 80 monedas
✓ Recolecta 300 monedas → 🔮 10 runas, 💰 75 monedas
```

#### ⚡ **Jugadores Intermedios** (Oleada 5-9)
```
✓ Alcanza la oleada 8 → 🔮 15 runas, 💰 150 monedas
✓ Alcanza la oleada 10 → 🔮 20 runas, 💰 200 monedas
✓ Elimina 35 contaminadores → 🔮 15 runas, 💰 140 monedas
✓ Coloca 8 defensores → 🔮 10 runas, 💰 95 monedas
✓ Recolecta 400 monedas → 🔮 12 runas, 💰 85 monedas
```

#### 🔥 **Jugadores Avanzados** (Oleada 10-14)
```
✓ Alcanza la oleada 12 → 🔮 25 runas, 💰 250 monedas
✓ Alcanza la oleada 15 → 🔮 30 runas, 💰 300 monedas
✓ Elimina 45 contaminadores → 🔮 18 runas, 💰 160 monedas
✓ Coloca 11 defensores → 🔮 13 runas, 💰 110 monedas
✓ Derrota a un jefe → 🔮 25 runas, 💰 250 monedas, ⭐ 1 especial
✓ Completa una oleada sin daño → 🔮 35 runas, ⭐ 2 especiales
```

#### 💎 **Jugadores Expertos** (Oleada 15+)
```
✓ Alcanza la oleada [TU_MEJOR + 2] → Recompensas escaladas
✓ Alcanza la oleada [TU_MEJOR + 5] → Recompensas grandes + monedas especiales
✓ Elimina [50 + NIVEL*15] contaminadores → Recompensas escaladas
✓ Misiones de jefe y sin daño disponibles
```

### 3. **Sistema de Recompensas Escaladas**

Las recompensas aumentan con tu nivel de jugador:

| Nivel del Jugador | Basado en Oleada | Multiplicador de Recompensas |
|-------------------|------------------|------------------------------|
| **Nivel 0** | Oleada 0-4 | x1.0 (base) |
| **Nivel 1** | Oleada 5-9 | x1.3 |
| **Nivel 2** | Oleada 10-14 | x1.6 |
| **Nivel 3** | Oleada 15-19 | x2.0 |
| **Nivel 4+** | Oleada 20+ | x2.5+ |

**Fórmula de nivel**: `Nivel = Oleada Máxima ÷ 5`

### 4. **Generación Automática de Nuevas Misiones**

Cuando reclamas una misión:

1. ✅ **Se mueve a "Reclamadas Hoy"**
2. 🎲 **Se genera una nueva misión adaptada a tu nivel**
3. 🔄 **Aparece en "Misiones Activas"**
4. 💾 **Se guarda automáticamente**

**No más límite de 3 misiones al día** - ¡Puedes reclamar infinitas!

### 5. **Tipos de Misiones Disponibles**

#### 🌊 **Misiones de Oleadas**
- Alcanza una oleada específica
- Escalan con tu progreso
- Dan más runas y monedas

#### 💀 **Misiones de Eliminación**
- Elimina X contaminadores
- Cantidad aumenta con tu nivel
- Buenas para farming de runas

#### 🏗️ **Misiones de Construcción**
- Coloca X defensores
- Fáciles de completar
- Recompensas moderadas

#### 💰 **Misiones de Economía**
- Recolecta X monedas
- Buenas para principiantes
- Fomentan buen manejo de recursos

#### 👑 **Misiones Especiales** (Oleada 10+)
- **Derrota a un jefe**: Gran recompensa + moneda especial
- **Sin daño**: Reto difícil, doble moneda especial

## 🎮 Cómo Funciona

### Flujo de Juego

```
1. Abrir menú de Misiones
   ↓
2. Ver 3 misiones activas adaptadas a tu nivel
   ↓
3. Jugar y completar objetivos
   ↓
4. Hacer clic en "RECLAMAR" (aparece al completar)
   ↓
5. Ver misión moverse a "Reclamadas Hoy"
   ↓
6. Nueva misión aparece automáticamente en "Activas"
   ↓
7. Repetir (sin límite)
```

### Reseteo Diario

**Cada día a las 00:00:**
- ✅ Misiones reclamadas se borran (contador vuelve a 0)
- 🔄 Misiones activas se regeneran (3 nuevas)
- 📊 Tu progreso (mejor oleada) se mantiene

## 📊 Ejemplos Prácticos

### Ejemplo 1: Jugador Nuevo (Primera Partida)
```
Mejor Oleada: 0
Nivel: 0

Misiones Iniciales:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ACTIVAS:
1. Alcanza la oleada 3 → 🔮 5, 💰 50
2. Elimina 25 contaminadores → 🔮 12, 💰 120
3. Coloca 5 defensores → 🔮 8, 💰 80

✅ RECLAMADAS: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ejemplo 2: Jugador con Progreso (Llegó a Oleada 12)
```
Mejor Oleada: 12
Nivel: 2

Misiones Generadas:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ACTIVAS:
1. Alcanza la oleada 14 → 🔮 30, 💰 300
2. Elimina 45 contaminadores → 🔮 18, 💰 160
3. Derrota a un jefe → 🔮 25, 💰 250, ⭐ 1

✅ RECLAMADAS: 5 misiones hoy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ejemplo 3: Jugador Experto (Llegó a Oleada 23)
```
Mejor Oleada: 23
Nivel: 4

Misiones Generadas:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ACTIVAS:
1. Alcanza la oleada 25 → 🔮 40, 💰 400
2. Alcanza la oleada 28 → 🔮 67, 💰 650, ⭐ 1
3. Elimina 110 contaminadores → 🔮 40, 💰 320

✅ RECLAMADAS: 12 misiones hoy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 💡 Consejos Pro

### Maximizar Runas
1. **Completa misiones de oleadas** - Dan más runas
2. **Busca misiones de jefe** - Recompensa grande
3. **Reclama misiones "sin daño"** - Difícil pero da 2 monedas especiales

### Progresión Rápida
1. **Juega a tu límite** - Llega a tu mejor oleada + 2-3
2. **Reclama todas las misiones posibles** - Sin límite diario
3. **Las misiones se adaptan** - Siempre serán desafiantes pero alcanzables

### Farming Eficiente
1. **Misiones de eliminación** - Fáciles de completar en oleadas bajas
2. **Misiones de defensores** - Rápidas de hacer
3. **Combinar misiones** - Coloca defensores MIENTRAS eliminas enemigos

## 🔧 Configuración Técnica

### En `rewards.js`:
```javascript
rewardsState = {
    dailyMissions: [],              // 3 misiones activas
    completedMissions: [],          // IDs de completadas
    claimedMissionsToday: [],       // Misiones reclamadas (histórico del día)
    lastMissionResetDate: null,     // Para reseteo diario
    bestWave: 0                     // Tu mejor oleada (para escalar misiones)
}
```

### En `index.html`:
```html
<div id="missionsContainer">      <!-- Misiones Activas -->
<div id="claimedMissionsContainer"> <!-- Misiones Reclamadas -->
<span id="claimedCountBadge">      <!-- Contador de reclamadas -->
```

## 🐛 Solución de Problemas

### "No aparecen misiones nuevas"
- Asegúrate de haber reclamado una misión completada
- Espera 500ms después de reclamar (delay de animación)
- Refresca la página si persiste

### "Las misiones son muy difíciles"
- Son adaptativas: juega más partidas para alcanzar esa oleada
- Misiones de eliminación y defensores son más fáciles
- Tu mejor oleada se guarda automáticamente

### "Contador de reclamadas en 0"
- Se resetea cada día a las 00:00
- Es normal, es un contador diario

---

**Versión:** 2.0 - Sistema Dinámico  
**Fecha:** 7 de octubre de 2025  
**Autor:** GitHub Copilot
