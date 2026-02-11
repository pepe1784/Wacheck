# 🔊 GUÍA RÁPIDA - Sistema de Sonidos

## 📋 ¿Cómo Funciona?

El sistema de sonidos busca primero archivos `.mp3` en la carpeta `sounds/`. Si no los encuentra, usa sonidos sintéticos automáticamente.

---

## 🚀 Uso Rápido (Para el Código del Juego)

### Opción 1: Usar funciones específicas (RECOMENDADO)
```javascript
// Fácil de leer y entender
GameSounds.click();           // Clic de botón
GameSounds.placeDefender();   // Colocar defensor
GameSounds.shoot();           // Disparo
GameSounds.kill();            // Matar enemigo
GameSounds.waveStart();       // Iniciar oleada
GameSounds.achievement();     // Logro desbloqueado
```

### Opción 2: Usar función genérica
```javascript
// Usando el nombre del sonido
playGameSound('click');
playGameSound('shoot');
playGameSound('gameOver');
```

---

## 🎯 Dónde Reemplazar los Sonidos Actuales

### 1. Reemplazar `playSound()` por `GameSounds`

**ANTES:**
```javascript
playSound(400, 0.1, 'square', 0.15);  // ❌ Difícil de entender
```

**AHORA:**
```javascript
GameSounds.click();  // ✅ Fácil de entender
```

### 2. Ejemplos de Reemplazo

#### Botones y Clics
```javascript
// ANTES
onclick="playSound(400, 0.1, 'square', 0.15)"

// AHORA
onclick="GameSounds.click()"
```

#### Colocar Defensor
```javascript
// ANTES
playSound(500, 0.15, 'triangle', 0.2);

// AHORA
GameSounds.placeDefender();
```

#### Disparos
```javascript
// ANTES
playSound(350, 0.08, 'square', 0.1);

// AHORA
GameSounds.shoot();
```

#### Matar Enemigo
```javascript
// ANTES
playSound(800, 0.2, 'triangle', 0.2);

// AHORA
GameSounds.kill();
```

#### Game Over
```javascript
// ANTES
playSound(100, 0.8, 'sawtooth', 0.4);

// AHORA
GameSounds.gameOver();
```

---

## 📁 Agregar Archivos .mp3

### Paso 1: Conseguir los sonidos
- Descarga sonidos de sitios como:
  - [Freesound.org](https://freesound.org)
  - [Zapsplat.com](https://www.zapsplat.com)
  - [Pixabay](https://pixabay.com/sound-effects/)

### Paso 2: Colocar en la carpeta
1. Guarda los archivos `.mp3` en la carpeta `sounds/`
2. Ejemplo de estructura:
```
sounds/
  ├── click.mp3
  ├── shoot.mp3
  ├── place_defender.mp3
  ├── game_over.mp3
  └── victory.mp3
```

### Paso 3: Configurar en sounds.js
Abre `sounds.js` y busca la sección `soundFiles`:

```javascript
const soundFiles = {
    click: "click.mp3",              // ← Agrega el nombre del archivo
    placeDefender: "place_defender.mp3",
    shoot: "shoot.mp3",
    gameOver: "game_over.mp3",
    victory: "victory.mp3",
    // ... resto de sonidos
};
```

### Paso 4: ¡Listo!
El juego usará automáticamente tus archivos .mp3

---

## 🎚️ Ajustar Volumen

En `sounds.js`, busca `soundVolumes`:

```javascript
const soundVolumes = {
    click: 0.3,        // 30% volumen
    shoot: 0.2,        // 20% volumen
    gameOver: 0.8,     // 80% volumen
    // 0.0 = silencio
    // 1.0 = volumen máximo
};
```

---

## 🎵 Lista Completa de Sonidos

### 🖱️ Interfaz (3)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `click` | Clic en botón | `GameSounds.click()` |
| `hover` | Pasar ratón | `GameSounds.hover()` |
| `back` | Volver atrás | `GameSounds.back()` |

### 🎮 Juego (4)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `placeDefender` | Colocar defensor | `GameSounds.placeDefender()` |
| `selectDefender` | Seleccionar defensor | `GameSounds.selectDefender()` |
| `removeDefender` | Eliminar defensor | `GameSounds.removeDefender()` |
| `upgradeDefender` | Mejorar defensor | `GameSounds.upgradeDefender()` |

### ⚔️ Combate (4)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `shoot` | Disparo | `GameSounds.shoot()` |
| `hit` | Impacto | `GameSounds.hit()` |
| `kill` | Matar enemigo | `GameSounds.kill()` |
| `hurt` | Daño a base | `GameSounds.hurt()` |

### 🌊 Oleadas (4)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `waveStart` | Iniciar oleada | `GameSounds.waveStart()` |
| `waveComplete` | Completar oleada | `GameSounds.waveComplete()` |
| `gameOver` | Derrota | `GameSounds.gameOver()` |
| `victory` | Victoria | `GameSounds.victory()` |

### ✨ Especiales (5)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `coin` | Ganar monedas | `GameSounds.coin()` |
| `unlock` | Desbloquear | `GameSounds.unlock()` |
| `achievement` | Logro | `GameSounds.achievement()` |
| `powerup` | Mejora | `GameSounds.powerup()` |
| `critical` | Crítico | `GameSounds.critical()` |

### 🎁 Recompensas (3)
| Nombre | Cuándo se usa | Función |
|--------|---------------|---------|
| `reward` | Recompensa | `GameSounds.reward()` |
| `levelUp` | Subir nivel | `GameSounds.levelUp()` |
| `mission` | Misión completa | `GameSounds.mission()` |

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si no pongo archivos .mp3?
No pasa nada. El juego usará los sonidos sintéticos actuales.

### ¿Puedo usar solo algunos sonidos .mp3?
Sí. Puedes agregar solo los que quieras. Los demás usarán sonidos sintéticos.

### ¿Qué formato debo usar?
`.mp3` es el recomendado. También puedes usar `.wav` o `.ogg` si modificas el código.

### ¿Cómo pruebo si funciona?
1. Abre la consola del navegador (F12)
2. Escribe: `GameSounds.click()`
3. Deberías escuchar el sonido

### ¿Los archivos .mp3 deben tener un nombre específico?
No, puedes nombrarlos como quieras. Solo asegúrate de poner el nombre correcto en `soundFiles`.

---

## 🔧 Ejemplo Completo

```javascript
// EN EL ARCHIVO sounds.js

const soundFiles = {
    click: "button_click.mp3",      // Tu archivo personalizado
    shoot: "laser_shot.mp3",        // Tu archivo personalizado
    gameOver: null,                 // Usará sonido sintético
    // ... resto
};

// EN TU CÓDIGO DEL JUEGO

function clickButton() {
    GameSounds.click();  // Reproduce "button_click.mp3"
}

function shootProjectile() {
    GameSounds.shoot();  // Reproduce "laser_shot.mp3"
}

function endGame() {
    GameSounds.gameOver();  // Usa sonido sintético (no hay .mp3)
}
```

---

## 📝 Checklist para Implementar

- [ ] Crear carpeta `sounds/` (ya está creada)
- [ ] Agregar `sounds.js` al HTML (ya está agregado)
- [ ] Conseguir archivos .mp3
- [ ] Colocar archivos en `sounds/`
- [ ] Configurar nombres en `soundFiles` (en sounds.js)
- [ ] Reemplazar `playSound()` por `GameSounds.xxx()` en el código
- [ ] Ajustar volúmenes si es necesario
- [ ] ¡Probar y disfrutar!

---

¡Ya está todo listo para usar! 🎉
