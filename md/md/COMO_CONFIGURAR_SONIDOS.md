# 🔊 Cómo Configurar los Sonidos - GUÍA SIMPLE

## 📝 Instrucciones Básicas

### 1️⃣ Conseguir los archivos .mp3
- Descárgalos de internet (Freesound, Zapsplat, etc.)
- O créalos tú mismo

### 2️⃣ Guardar en la carpeta sounds/
```
sounds/
  ├── disparo_agua.mp3
  ├── disparo_planta.mp3
  ├── victoria.mp3
  └── ...
```

### 3️⃣ Abrir sounds.js y configurar
Busca la sección **soundFiles** (línea ~18) y cambia los `null`:

```javascript
// ANTES (usa beep sintético)
shootFilter: null,

// DESPUÉS (usa tu archivo .mp3)
shootFilter: "disparo_agua.mp3",
```

---

## 🎯 Todos los Sonidos Disponibles

### 🖱️ INTERFAZ (Menús)
```javascript
click: null,              // Clic en botón
hover: null,              // Pasar mouse sobre botón
back: null,               // Volver al menú
```

### 🎮 DEFENSORES (Acciones)
```javascript
placeDefender: null,      // Colocar defensor
selectDefender: null,     // Seleccionar defensor
removeDefender: null,     // Eliminar defensor
upgradeDefender: null,    // Mejorar defensor
```

### 💧 DISPAROS DE CADA DEFENSOR
```javascript
shoot: null,              // Disparo genérico (si no hay específico)

shootFilter: null,        // 🔵 Filtro (agua azul)
shootPlant: null,         // 🌱 Planta (naturaleza verde)
shootRecycler: null,      // ♻️ Reciclador (energía amarilla)
shootCleaner: null,       // 🧽 Purificador (agua blanca)
shootCrystal: null,       // 💎 Cristal
shootSolar: null,         // ☀️ Solar
shootCoral: null,         // 🪸 Coral
shootTornado: null,       // 🌪️ Tornado
shootWhale: null,         // 🐋 Ballena
shootDualcannon: null,    // 🔫 Cañón Doble (2 disparos)
shootIncinerator: null,   // 🔥 Incinerador (fuego)
shootCryomancer: null,    // ❄️ Criomante (hielo)
shootMortar: null,        // 💣 Mortero (bomba)
shootStream: null,        // 💧 Chorro
shootBubble: null,        // 🫧 Burbuja
shootWizard: null,        // 🧙 Mago Eléctrico
shootOtter: null,         // 🦦 Nutria
shootKraken: null,        // 🐙 Kraken
shootGolem: null,         // 🗿 Gólem
shootAntiTank: null,      // 🎯 Antitanque
```

### 💥 IMPACTOS
```javascript
hit: null,                // Impacto normal en enemigo
critical: null,           // Golpe crítico (x2 daño)
```

### 🎯 CONTAMINANTES
```javascript
kill: null,               // Contaminante eliminado
hurt: null,               // Base recibe daño
```

### 🌊 OLEADAS
```javascript
waveStart: null,          // Empieza oleada
waveComplete: null,       // Oleada completada
gameOver: null,           // Perdiste
victory: null,            // Ganaste
```

### 💰 ESPECIALES
```javascript
coin: null,               // Ganar monedas
unlock: null,             // Desbloquear defensor
achievement: null,        // Logro desbloqueado
powerup: null,            // Mejora aplicada
reward: null,             // Recompensa obtenida
levelUp: null,            // Subir de nivel
mission: null,            // Misión completada
```

---

## 📋 Ejemplo Completo

### Quiero poner sonidos solo a algunos defensores:

```javascript
const soundFiles = {
    // Interfaz (sin sonidos .mp3, usa beeps)
    click: null,
    hover: null,
    back: null,
    
    // Defensores (sin sonidos .mp3)
    placeDefender: null,
    selectDefender: null,
    removeDefender: null,
    upgradeDefender: null,
    
    // Disparos - Solo algunos tienen .mp3
    shoot: null,
    
    shootFilter: "agua.mp3",           // ✅ Usa archivo
    shootPlant: "planta.mp3",          // ✅ Usa archivo
    shootRecycler: null,               // ❌ Usa beep
    shootCleaner: null,                // ❌ Usa beep
    shootCrystal: "cristal.mp3",       // ✅ Usa archivo
    shootSolar: null,                  // ❌ Usa beep
    shootCoral: null,                  // ❌ Usa beep
    shootTornado: "viento.mp3",        // ✅ Usa archivo
    shootWhale: "ballena.mp3",         // ✅ Usa archivo
    // ... resto null (usan beep)
    
    // Eventos importantes con .mp3
    victory: "victoria.mp3",           // ✅ Usa archivo
    gameOver: "derrota.mp3",           // ✅ Usa archivo
    achievement: "logro.mp3",          // ✅ Usa archivo
    
    // Resto sin archivo
    hit: null,
    critical: null,
    kill: null,
    hurt: null,
    // ...
};
```

---

## 🎚️ Ajustar Volumen

Si un sonido está muy alto o muy bajo, busca **soundVolumes** (línea ~165):

```javascript
const soundVolumes = {
    shootFilter: 0.2,     // 20% volumen
    shootPlant: 0.3,      // 30% volumen
    victory: 0.8,         // 80% volumen
    // ...
};
```

**Escala:**
- `0.0` = 🔇 Silencio
- `0.2` = 🔈 Bajo
- `0.5` = 🔉 Medio
- `0.8` = 🔊 Alto
- `1.0` = 🔊 Máximo

---

## ✅ Reglas Simples

### ✅ CORRECTO
```javascript
shootFilter: null                    // Usa beep
shootFilter: "agua.mp3"              // Usa archivo
shootFilter: "disparo_filtro.mp3"   // Cualquier nombre
```

### ❌ INCORRECTO
```javascript
shootFilter: agua.mp3                // Sin comillas ❌
shootFilter: "agua"                  // Sin .mp3 ❌
shootFilter: agua                    // Sin nada ❌
```

---

## 🧪 Cómo Probar

1. Abre tu juego
2. Presiona **F12**
3. En la consola escribe:

```javascript
// Probar disparo de filtro
GameSounds.shootFilter()

// Probar disparo de planta
GameSounds.shootPlant()

// Probar victoria
GameSounds.victory()
```

---

## 💡 Consejos

✅ **Deja null lo que no tengas** - funcionará con beeps  
✅ **Empieza con pocos** - agrega más después  
✅ **Nombres descriptivos** - usa nombres que entiendas  
✅ **Prueba en el juego** - no solo en consola  
✅ **Un defensor a la vez** - configura y prueba uno por uno  

---

## ❓ Preguntas Frecuentes

**¿Qué pasa si dejo todo en null?**  
→ El juego funciona normal con beeps sintéticos (como antes)

**¿Puedo poner el mismo archivo para varios defensores?**  
→ Sí, sin problema:
```javascript
shootFilter: "laser.mp3",
shootCleaner: "laser.mp3",  // Mismo archivo
```

**¿Los nombres de archivo distinguen mayúsculas?**  
→ Sí, `agua.mp3` ≠ `Agua.mp3` ≠ `AGUA.mp3`

**¿Puedo usar .wav o .ogg?**  
→ Solo .mp3 está configurado. Otros formatos necesitan cambios en el código.

**¿Dónde pongo exactamente el archivo?**  
→ En la carpeta `sounds/` que está al mismo nivel que `sounds.js`

---

## 🎯 Resumen en 3 Pasos

1. **Guarda** tu archivo .mp3 en `sounds/`
2. **Abre** `sounds.js` y busca `const soundFiles`
3. **Cambia** `null` por `"nombre_archivo.mp3"`

¡Listo! 🎉
