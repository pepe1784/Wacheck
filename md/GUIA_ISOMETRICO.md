# 🎮 Guía Completa: Conversión a Vista Isométrica

## 📋 Índice
1. [Qué es la Vista Isométrica](#qué-es)
2. [Ventajas y Desventajas](#ventajas)
3. [Assets Necesarios](#assets)
4. [Implementación Técnica](#implementación)
5. [Alternativas y Recursos](#alternativas)

---

## 🎯 Qué es la Vista Isométrica {#qué-es}

La vista isométrica es una proyección 3D donde:
- Los ejes X, Y, Z forman ángulos de 120°
- Las líneas paralelas permanecen paralelas
- No hay perspectiva (objetos lejos no se ven más pequeños)
- Ángulo típico: 30° en los lados

**Ejemplo de referencia:** Plants vs Zombies NO es isométrico, usa vista lateral 2D. Para isométrico verdadero mira: Age of Empires, Diablo, SimCity.

---

## ✅ Ventajas y ❌ Desventajas {#ventajas}

### ✅ Ventajas
- Aspecto más profesional y 3D
- Mayor profundidad visual
- Más inmersivo
- Se ve más "premium"

### ❌ Desventajas
- **Requiere MUCHOS assets nuevos:**
  - Mínimo 8 direcciones por enemigo (si giran)
  - O 1 sprite isométrico fijo por elemento
  - Proyectiles isométricos
  - Tablero/background isométrico
- Más complejo de programar
- Mayor tamaño de archivos
- Puede ser más lento en móviles antiguos

---

## 🎨 Assets Necesarios {#assets}

### 1. **Tablero Isométrico**
```
tablero_isometrico.png (1200x800px aprox)
├── Playa con perspectiva isométrica
├── Celdas delimitadas (5 filas x 10 columnas)
├── Agua a la izquierda
└── Isla/base a la derecha
```

### 2. **Defensores Isométricos** (17 defensores x 1-8 sprites)

**Opción A: Sprites Fijos (Más Fácil)**
- 1 sprite por defensor en vista 3/4
- Tamaño: 64x64px o 128x128px
- Formato: PNG con transparencia

**Opción B: Sprites Animados (Profesional)**
- 8 direcciones de vista por defensor
- 4-8 frames de animación por dirección
- Ejemplo: `defender_filtro_N_frame1.png` hasta `defender_filtro_SO_frame8.png`

### 3. **Contaminantes Isométricos** (13 enemigos)
- Mismas consideraciones que defensores
- Animación de caminar opcional
- Sprites de daño/muerte

### 4. **Proyectiles Isométricos**
- Ajustar trayectoria para seguir el eje isométrico
- 6 tipos: agua, naturaleza, energía, puro, fuego, hielo
- Tamaño: 32x32px

### 5. **Efectos Isométricos**
- Explosiones vistas desde ángulo isométrico
- Sombras proyectadas
- Efectos de impacto

---

## 💻 Implementación Técnica {#implementación}

### Paso 1: Convertir Coordenadas

```javascript
// Convertir coordenadas de grid (row, col) a isométricas (x, y)
function gridToIso(row, col) {
    const TILE_WIDTH = 64;  // Ancho del tile
    const TILE_HEIGHT = 32; // Alto del tile
    
    const x = (col - row) * (TILE_WIDTH / 2);
    const y = (col + row) * (TILE_HEIGHT / 2);
    
    return { x, y };
}

// Convertir coordenadas isométricas a grid
function isoToGrid(x, y) {
    const TILE_WIDTH = 64;
    const TILE_HEIGHT = 32;
    
    const col = Math.floor((x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2);
    const row = Math.floor((y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2);
    
    return { row, col };
}
```

### Paso 2: Renderizar Tablero

```javascript
// En lugar de celdas CSS, usar Canvas o imagen de fondo
function createIsometricBoard() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Dibujar imagen de fondo isométrica
    const boardImg = new Image();
    boardImg.src = 'img/tablero_isometrico.png';
    boardImg.onload = () => {
        ctx.drawImage(boardImg, 0, 0);
    };
    
    // Dibujar grid invisible para clicks
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            const { x, y } = gridToIso(row, col);
            // Guardar coordenadas para detección de clicks
            cells[row][col] = { x, y, row, col };
        }
    }
}
```

### Paso 3: Colocar Defensores

```javascript
function placeDefender(row, col, defenderType) {
    const { x, y } = gridToIso(row, col);
    
    const defenderSprite = document.createElement('img');
    defenderSprite.src = `img/defensores_iso/${defenderType}.png`;
    defenderSprite.style.position = 'absolute';
    defenderSprite.style.left = `${x}px`;
    defenderSprite.style.top = `${y}px`;
    defenderSprite.style.width = '64px';
    defenderSprite.style.height = '64px';
    defenderSprite.style.zIndex = Math.floor(row + col); // Z-ordering
    
    gameCanvas.appendChild(defenderSprite);
}
```

### Paso 4: Z-Index Correcto (Muy Importante)

```javascript
// Los objetos más cercanos (row+col mayor) deben estar encima
function updateZIndex(element, row, col) {
    element.style.zIndex = (row + col) * 10;
}
```

### Paso 5: Movimiento de Enemigos

```javascript
function moveEnemyIsometric(enemy) {
    // En lugar de mover solo en X, calcular posición isométrica
    enemy.col -= enemy.speed * deltaTime;
    
    const { x, y } = gridToIso(enemy.row, enemy.col);
    enemy.element.style.left = `${x}px`;
    enemy.element.style.top = `${y}px`;
    enemy.element.style.zIndex = Math.floor(enemy.row + enemy.col) * 10;
}
```

---

## 🎨 Alternativas y Recursos {#alternativas}

### Opción 1: Usar Biblioteca Isométrica
```javascript
// Instalar: npm install phaser
// Phaser tiene soporte isométrico integrado
import Phaser from 'phaser';

const config = {
    type: Phaser.WEBGL,
    plugins: {
        scene: [{
            key: 'IsoPlugin',
            plugin: Phaser.Plugin.Isometric,
            mapping: 'iso'
        }]
    }
};
```

### Opción 2: Herramientas de Diseño

**Para crear assets:**
1. **Aseprite** ($20) - Pixel art, exporta spritesheet isométrico
2. **Blender** (Gratis) - 3D, renderiza a isométrico
3. **GIMP/Photoshop** - Edición manual con guías isométricas

**Generadores Online:**
- https://www.isometricland.com/ (tiles gratis)
- https://kenney.nl/assets (assets isométricos gratuitos)
- https://itch.io/game-assets/tag-isometric (muchos assets gratis/pagos)

### Opción 3: IA para Generar Sprites

```
Prompt para Midjourney/DALL-E:
"isometric pixel art sprite of [defensor/enemigo], 
64x64 pixels, transparent background, 
game asset, clean lines, colorful"
```

---

## 📝 Pasos Recomendados para Empezar

### Fase 1: Prototipo (1-2 semanas)
1. ✅ Crear tablero isométrico simple en Photoshop/GIMP
2. ✅ Convertir 3-4 defensores a sprites isométricos básicos
3. ✅ Implementar funciones de conversión de coordenadas
4. ✅ Probar colocación y movimiento básico

### Fase 2: Assets Completos (2-4 semanas)
1. ⏳ Diseñar todos los defensores isométricos
2. ⏳ Diseñar todos los contaminantes isométricos
3. ⏳ Crear proyectiles y efectos
4. ⏳ Ajustar z-index y ordenamiento

### Fase 3: Pulido (1-2 semanas)
1. ⏳ Animaciones de ataque/movimiento
2. ⏳ Efectos de partículas isométricas
3. ⏳ Sombras dinámicas
4. ⏳ Optimización de rendimiento

---

## 🚀 Decisión Final

### ¿Vale la pena?

**SÍ, si:**
- Tienes tiempo (1-2 meses)
- Presupuesto para contratar artista (~$500-$2000)
- O habilidad en diseño gráfico
- Quieres un juego muy pulido

**NO, si:**
- Quieres lanzar pronto (< 1 mes)
- Presupuesto limitado
- El juego actual funciona bien
- Prioridad es gameplay sobre gráficos

### Mi Recomendación:
1. **Corto plazo:** Quédate con vista actual pero mejora sprites (emoji → PNG bonitos)
2. **Medio plazo:** Crea versión 2.0 con vista isométrica
3. **Usa IA/Assets gratuitos** de Kenney.nl para acelerar
4. **Empieza con un solo nivel isométrico** como "demo" antes de convertir todo

---

## 📚 Recursos Útiles

- **Tutorial Canvas Isométrico:** https://www.youtube.com/watch?v=04C3hq_0i4M
- **Assets Kenney:** https://kenney.nl/assets/isometric-blocks
- **Calculadora Isométrica:** https://clintbellanger.net/articles/isometric_math/
- **Phaser Isométrico:** https://github.com/sebashwa/phaser-plugin-isometric

---

¿Quieres que te ayude a crear el prototipo del tablero isométrico o prefieres enfocarte primero en otras mejoras del juego actual?
