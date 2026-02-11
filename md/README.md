# 🔊 Carpeta de Sonidos - Wacheck

Esta carpeta contiene los archivos de audio `.mp3` para el juego.

## 📁 Cómo Agregar Sonidos

1. **Coloca tus archivos .mp3** en esta carpeta
2. **Abre el archivo `sounds.js`** en la raíz del proyecto
3. **Busca la sección `soundFiles`** y asigna el nombre del archivo:

```javascript
const soundFiles = {
    click: "click.mp3",           // ← Nombre del archivo
    placeDefender: "place.mp3",
    shoot: "shoot.mp3",
    // ... etc
};
```

4. **¡Listo!** El juego usará automáticamente tus sonidos

## 🎵 Sonidos Disponibles

### 🖱️ Interfaz
- `click` - Clic en botón
- `hover` - Pasar el ratón sobre botón
- `back` - Volver atrás en menú

### 🎮 Juego
- `placeDefender` - Colocar defensor
- `selectDefender` - Seleccionar defensor
- `removeDefender` - Eliminar defensor
- `upgradeDefender` - Mejorar defensor

### ⚔️ Combate
- `shoot` - Disparo de defensor
- `hit` - Impacto en contaminante
- `kill` - Eliminar contaminante
- `hurt` - Daño a la base

### 🌊 Oleadas
- `waveStart` - Inicio de oleada
- `waveComplete` - Oleada completada
- `gameOver` - Derrota
- `victory` - Victoria

### ✨ Especiales
- `coin` - Ganar monedas
- `unlock` - Desbloquear contenido
- `achievement` - Logro desbloqueado
- `powerup` - Mejora aplicada
- `critical` - Golpe crítico

### 🎁 Recompensas
- `reward` - Recompensa obtenida
- `levelUp` - Subir de nivel
- `mission` - Misión completada

## ⚙️ Ajustar Volumen

En `sounds.js`, busca la sección `soundVolumes` para ajustar el volumen de cada sonido:

```javascript
const soundVolumes = {
    click: 0.3,        // 0.0 = silencio, 1.0 = máximo
    shoot: 0.2,
    gameOver: 0.8,
    // ...
};
```

## 🎵 Sin Sonidos .mp3?

No te preocupes! Si no colocas archivos .mp3, el juego usará **sonidos sintéticos** automáticamente.

## 📝 Ejemplo de Nombres Recomendados

Puedes nombrar tus archivos como quieras, pero aquí hay sugerencias:

- `click.mp3`
- `place_defender.mp3`
- `shoot_water.mp3`
- `enemy_death.mp3`
- `wave_start.mp3`
- `game_over.mp3`
- `victory.mp3`
- `achievement_unlock.mp3`

## 🔄 Formato Recomendado

- **Formato**: .mp3
- **Calidad**: 128 kbps (buena calidad, tamaño pequeño)
- **Duración**: Cortos (0.1 - 2 segundos para efectos)
- **Volumen**: Normalizado (no demasiado alto ni bajo)
