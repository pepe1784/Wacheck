# 📐 Plan de Reorganización Completa de UI

## 🎯 Objetivos

1. ✅ Eliminar scroll del juego
2. ✅ Botón de volumen independiente (fuera del juego)
3. ✅ Nueva tienda de defensores en el index (estilo recompensas)
4. ✅ Sistema de selección de 8 defensores pre-partida
5. ✅ Tutorial interactivo para nuevos jugadores
6. ✅ Sistema de defensores regalados post-partida

---

## 📦 PASO 1: Reorganizar Layout del Juego

### Problema Actual:
- Al quitar scroll, las celdas del tablero desaparecen
- El `game-container` está centrado pero su contenido no se ajusta

### Solución:

```css
.game-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.game-header {
    flex-shrink: 0;  /* No se comprime */
    padding: 10px 15px;
    margin-bottom: 0;
}

.game-content {
    flex: 1;
    display: flex;
    gap: 10px;
    min-height: 0;  /* Importante para flex */
}

.game-board-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.game-board {
    /* Ajustar tamaño dinámicamente */
    grid-template-columns: repeat(10, minmax(50px, 70px));
    grid-template-rows: repeat(5, minmax(50px, 70px));
}

.defender-selector {
    flex-shrink: 0;
    width: 250px;
    overflow-y: auto;
}
```

---

## 🔊 PASO 2: Botón de Volumen Independiente

### Cambios en HTML (index.html):

```html
<body>
    <!-- Botón de volumen FUERA del juego -->
    <button class="global-sound-toggle" onclick="toggleSound()" id="soundToggle">🔊</button>
    
    <div class="container">
        <!-- Resto del contenido -->
    </div>
</body>
```

### CSS:

```css
.global-sound-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 3px solid white;
    font-size: 28px;
    cursor: pointer;
    z-index: 10000;  /* Siempre encima */
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: transform 0.2s;
}

.global-sound-toggle:hover {
    transform: scale(1.1);
}
```

---

## 🏪 PASO 3: Tienda de Defensores en Index

### HTML (agregar en main-page):

```html
<div class="main-page" id="mainPage">
    <!-- Contenido existente -->
    
    <!-- NUEVA TIENDA -->
    <button class="shop-toggle-btn" onclick="openShopMenu()">
        🏪 Tienda
    </button>
</div>

<!-- PANEL DE TIENDA (estilo slide-menu de recompensas) -->
<div class="slide-menu shop-menu" id="shopMenu">
    <div class="menu-header">
        <h2>🏪 Tienda de Defensores</h2>
        <button class="menu-close-btn" onclick="closeShopMenu()">✕</button>
    </div>
    <div class="menu-content">
        <div class="shop-balance">
            <span>⭐ Monedas Especiales:</span>
            <span id="shopSpecialCoins">0</span>
        </div>
        
        <!-- CATEGORÍAS -->
        <div class="shop-category">
            <h3>⚔️ Defensores de Bajo Coste</h3>
            <div class="shop-grid" id="shopLowCost"></div>
        </div>
        
        <div class="shop-category">
            <h3>🔥 Defensores de Daño</h3>
            <div class="shop-grid" id="shopDamage"></div>
        </div>
        
        <div class="shop-category">
            <h3>🛡️ Defensores Tanque</h3>
            <div class="shop-grid" id="shopTank"></div>
        </div>
        
        <div class="shop-category">
            <h3>✨ Defensores Especiales</h3>
            <div class="shop-grid" id="shopSpecial"></div>
        </div>
    </div>
</div>
```

### CSS (Reusa estilo de recompensas):

```css
.shop-toggle-btn {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-size: 1.2em;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    margin: 20px;
}

.shop-menu {
    /* Reusar estilos de .slide-menu */
}

.shop-category {
    margin-bottom: 30px;
}

.shop-category h3 {
    color: #1e293b;
    margin-bottom: 15px;
    font-size: 1.3em;
}

.shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
}

.shop-item {
    background: white;
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.shop-item:hover {
    transform: translateY(-5px);
}

.shop-item.locked {
    opacity: 0.6;
    position: relative;
}

.shop-item.locked::after {
    content: '🔒';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
}
```

---

## 🎮 PASO 4: Sistema de Selección de 8 Defensores

### HTML:

```html
<!-- MODAL DE SELECCIÓN PRE-PARTIDA -->
<div class="defender-selection-modal" id="defenderSelectionModal">
    <div class="selection-container">
        <div class="selection-header">
            <h2>⚔️ Selecciona tus Defensores</h2>
            <p>Elige 8 defensores para esta partida (mínimo 8, máximo 8)</p>
        </div>
        
        <div class="selection-content">
            <!-- DEFENSORES SELECCIONADOS -->
            <div class="selected-defenders-area">
                <h3>✅ Defensores Seleccionados (<span id="selectedCount">0</span>/8)</h3>
                <div class="selected-grid" id="selectedGrid">
                    <!-- 8 slots vacíos -->
                    <div class="defender-slot empty" data-slot="0"></div>
                    <div class="defender-slot empty" data-slot="1"></div>
                    <div class="defender-slot empty" data-slot="2"></div>
                    <div class="defender-slot empty" data-slot="3"></div>
                    <div class="defender-slot empty" data-slot="4"></div>
                    <div class="defender-slot empty" data-slot="5"></div>
                    <div class="defender-slot empty" data-slot="6"></div>
                    <div class="defender-slot empty" data-slot="7"></div>
                </div>
            </div>
            
            <!-- DEFENSORES DISPONIBLES -->
            <div class="available-defenders-area">
                <h3>📦 Defensores Disponibles</h3>
                <div class="available-grid" id="availableGrid">
                    <!-- Se llena con JavaScript -->
                </div>
            </div>
        </div>
        
        <div class="selection-footer">
            <button class="btn-start-game" onclick="confirmDefenderSelection()" disabled id="btnStartGame">
                🎮 Comenzar Partida
            </button>
        </div>
    </div>
</div>
```

### CSS:

```css
.defender-selection-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.selection-container {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 20px;
    padding: 30px;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.selection-content {
    display: flex;
    gap: 30px;
    margin: 30px 0;
}

.selected-defenders-area {
    flex: 1;
    background: rgba(255,255,255,0.15);
    padding: 20px;
    border-radius: 15px;
}

.selected-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-top: 20px;
}

.defender-slot {
    width: 80px;
    height: 80px;
    background: rgba(255,255,255,0.2);
    border: 3px dashed rgba(255,255,255,0.5);
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    cursor: pointer;
    transition: all 0.3s;
}

.defender-slot.filled {
    background: rgba(16, 185, 129, 0.3);
    border: 3px solid #10b981;
    border-style: solid;
}

.available-defenders-area {
    flex: 1;
    background: rgba(255,255,255,0.1);
    padding: 20px;
    border-radius: 15px;
}

.available-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.available-defender-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}

.available-defender-card:hover {
    transform: scale(1.05);
}

.available-defender-card.selected {
    opacity: 0.5;
    pointer-events: none;
}
```

### JavaScript:

```javascript
// Guardar selección de defensores
let selectedDefenders = [];
const MAX_DEFENDERS = 8;

function showDefenderSelectionModal() {
    // Cargar selección anterior si existe
    const saved = localStorage.getItem('wacheck_selected_defenders');
    if (saved) {
        selectedDefenders = JSON.parse(saved);
    } else {
        // Primera vez: defensores por defecto
        selectedDefenders = ['filter', 'plant', 'recycler', 'cleaner', 'crystal', 'solar', 'coral', 'shield'];
    }
    
    document.getElementById('defenderSelectionModal').style.display = 'flex';
    renderDefenderSelection();
}

function renderDefenderSelection() {
    // Renderizar slots seleccionados
    selectedDefenders.forEach((type, index) => {
        const slot = document.querySelector(`[data-slot="${index}"]`);
        const defType = allDefenderTypes[type];
        slot.classList.add('filled');
        slot.classList.remove('empty');
        slot.textContent = defType.icon;
        slot.dataset.type = type;
    });
    
    // Renderizar disponibles
    const availableGrid = document.getElementById('availableGrid');
    availableGrid.innerHTML = '';
    
    const unlockedTypes = gameState.unlockedDefenders;
    unlockedTypes.forEach(type => {
        const defType = allDefenderTypes[type];
        const card = document.createElement('div');
        card.className = 'available-defender-card';
        if (selectedDefenders.includes(type)) {
            card.classList.add('selected');
        }
        card.innerHTML = `
            <div class="defender-icon">${defType.icon}</div>
            <div class="defender-name">${defType.name}</div>
            <div class="defender-cost">${defType.cost} 💰</div>
        `;
        card.onclick = () => toggleDefenderSelection(type);
        availableGrid.appendChild(card);
    });
    
    updateStartButton();
}

function toggleDefenderSelection(type) {
    const index = selectedDefenders.indexOf(type);
    if (index > -1) {
        // Deseleccionar
        selectedDefenders.splice(index, 1);
    } else {
        // Seleccionar si hay espacio
        if (selectedDefenders.length < MAX_DEFENDERS) {
            selectedDefenders.push(type);
        }
    }
    renderDefenderSelection();
}

function updateStartButton() {
    const btn = document.getElementById('btnStartGame');
    const count = selectedDefenders.length;
    document.getElementById('selectedCount').textContent = count;
    
    if (count === MAX_DEFENDERS) {
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

function confirmDefenderSelection() {
    // Guardar selección
    localStorage.setItem('wacheck_selected_defenders', JSON.stringify(selectedDefenders));
    
    // Cerrar modal
    document.getElementById('defenderSelectionModal').style.display = 'none';
    
    // Iniciar juego con los defensores seleccionados
    startGameWithSelectedDefenders();
}

function startGameWithSelectedDefenders() {
    // Filtrar allDefenderTypes para solo mostrar los seleccionados
    // en el selector de defensores durante la partida
    // ... código existente de startGame() pero adaptado
}
```

---

## 📚 PASO 5: Tutorial Interactivo

### JavaScript:

```javascript
const tutorialSteps = [
    {
        target: '.coins',
        title: '💰 Monedas',
        message: 'Usa monedas para colocar defensores. Ganas más al derrotar enemigos.',
        position: 'bottom'
    },
    {
        target: '.cell',
        title: '🎯 Celdas',
        message: 'Haz click en una celda para colocar un defensor. Doble click para modo de colocación múltiple.',
        position: 'top',
        highlight: true
    },
    {
        target: '.defender-card',
        title: '⚔️ Defensores',
        message: 'Selecciona un defensor y luego haz click en una celda para colocarlo.',
        position: 'left'
    },
    // ... más pasos
];

function startTutorial() {
    const isNewUser = !localStorage.getItem('wacheck_tutorial_completed');
    if (!isNewUser) return;
    
    // Mostrar cada paso del tutorial
    showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
        completeTutorial();
        return;
    }
    
    const step = tutorialSteps[stepIndex];
    const target = document.querySelector(step.target);
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-spotlight" style="${getSpotlightStyle(target)}"></div>
        <div class="tutorial-tooltip" style="${getTooltipStyle(target, step.position)}">
            <h3>${step.title}</h3>
            <p>${step.message}</p>
            <div class="tutorial-controls">
                <button onclick="skipTutorial()">Saltar</button>
                <button onclick="nextTutorialStep()">Siguiente (${stepIndex + 1}/${tutorialSteps.length})</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}
```

---

## 🎁 PASO 6: Sistema de Defensores Regalados

### JavaScript:

```javascript
function showDefenderReward(defenderType) {
    const defType = allDefenderTypes[defenderType];
    
    showMessage(
        `🎉 ¡Nuevo Defensor Desbloqueado!`,
        `
            <div class="reward-defender-display">
                <div class="reward-icon">${defType.icon}</div>
                <h3>${defType.name}</h3>
                <div class="reward-story">
                    ${getDefenderStory(defenderType)}
                </div>
                <div class="reward-description">
                    <strong>Habilidades:</strong>
                    <ul>
                        <li>Daño: ${defType.damage}</li>
                        <li>Rango: ${defType.range}</li>
                        <li>Coste: ${defType.cost}</li>
                    </ul>
                </div>
            </div>
        `,
        [{ text: 'Continuar', action: hideMessage }]
    );
    
    // Agregar a desbloqueados
    if (!gameState.unlockedDefenders.includes(defenderType)) {
        gameState.unlockedDefenders.push(defenderType);
        saveUserProgress();
    }
}

function getDefenderStory(type) {
    const stories = {
        filter: "Este filtro de carbón activado ha luchado contra la contaminación química durante años. Especialista en neutralizar toxinas industriales.",
        plant: "Una planta acuática milenaria que ha protegido ríos sagrados. Combate los nitratos y fosfatos con su sistema de raíces.",
        // ... más historias
    };
    return stories[type] || "Un valiente defensor del agua.";
}

// Llamar después de completar oleada X
function checkDefenderRewards(waveNumber) {
    const rewards = {
        3: 'dualcannon',
        5: 'incinerator',
        7: 'cryomancer',
        10: 'generator',
        15: 'mortar',
        20: 'wizard'
    };
    
    if (rewards[waveNumber]) {
        showDefenderReward(rewards[waveNumber]);
    }
}
```

---

## 📝 Orden de Implementación

### Fase 1 (Urgente - 2-3 horas):
1. ✅ Ajustar CSS del game-container para usar flexbox
2. ✅ Mover botón de sonido a posición fija global
3. ✅ Ajustar tamaño del game-board dinámicamente

### Fase 2 (Importante - 3-4 horas):
4. ✅ Crear tienda de defensores en index
5. ✅ Implementar categorías en la tienda
6. ✅ Conectar sistema de compra

### Fase 3 (Core Feature - 4-5 horas):
7. ✅ Modal de selección de 8 defensores
8. ✅ Sistema de slots y drag & drop
9. ✅ Guardar/cargar selección

### Fase 4 (Polish - 3-4 horas):
10. ✅ Tutorial paso a paso
11. ✅ Sistema de defensores regalados
12. ✅ Historias de defensores

---

¿Quieres que empiece a implementar la **Fase 1** ahora mismo?
