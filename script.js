// Audio: Las funciones de audio ahora están en sounds.js
// (audioContext, initAudio, playSound, toggleSound)

// Función para obtener el tamaño de celda según el ancho de pantalla
function getCellSize() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 420) {
        // Mobile devices (390x844 y similares)
        return { width: 34, height: 34, gap: 2 };
    } else if (screenWidth <= 600) {
        // Extra small devices
        return { width: 42, height: 42, gap: 2 };
    } else if (screenWidth <= 768) {
        // Small devices
        return { width: 50, height: 50, gap: 2 };
    } else if (screenWidth <= 992) {
        // Medium devices
        return { width: 60, height: 60, gap: 3 };
    } else if (screenWidth <= 1200) {
        // Large devices
        return { width: 70, height: 70, gap: 3 };
    } else {
        // Extra large devices
        return { width: 75, height: 75, gap: 4 };
    }
}

// Función para obtener el ancho total de una celda (incluyendo gap)
function getCellWidthWithGap() {
    const cellSize = getCellSize();
    return cellSize.width + cellSize.gap;
}

// Función para obtener la altura total de una celda (incluyendo gap)
function getCellHeightWithGap() {
    const cellSize = getCellSize();
    return cellSize.height + cellSize.gap;
}




// Datos del juego
const runtime = window.WacheckGameRuntime;
let gameState = runtime.state;

// Tipos de defensores (incluye los desbloqueables)
// Usar var (no const) para que js/game/defenders.js pueda sobreescribir vía window.allDefenderTypes
var allDefenderTypes = window.allDefenderTypes || {
    // Básicos (siempre disponibles)
    filter: { icon: '🔵', image: "./img/filter.png", damage: 25, cost: 25, shootInterval: 1200, range: 4, health: 50, name: 'Filtro', projectile: 'water', info: "Los filtros de carbón activado se usan en la vida real para eliminar impurezas químicas del agua, haciéndola segura para beber." },
    plant: { icon: '🌱', image: "./img/plant.png", damage: 35, cost: 40, shootInterval: 1200, range: 4, health: 100, name: 'Planta', projectile: 'nature', selfHeal: { amount: 5, interval: 5000 }, info: "Las plantas acuáticas y los humedales son filtros biológicos naturales que limpian nuestros ríos absorbiendo nitratos y otros contaminantes." },
    recycler: { icon: '♻️', image: "./img/recycler.png", damage: 45, cost: 60, shootInterval: 800, range: 3, health: 70, name: 'Reciclador', projectile: 'energy' },
    cleaner: { icon: '🧽', damage: 60, cost: 100, shootInterval: 1000, range: 5, health: 100, name: 'Purificador', projectile: 'pure' },
    stream: { icon: '💧', damage: 18, cost: 20, shootInterval: 1000, range: 6, health: 150, name: 'Chorro', projectile: 'water' }, // Coste 15, Daño 12
    bubble: { icon: '🫧', damage: 6, cost: 30, shootInterval: 1800, range: 6, health: 150, name: 'Burbuja', projectile: 'water', statusEffect: { type: 'slow', power: 0.3, duration: 1500 }, shots: 2, shotDelay: 100 }, // Coste 10, 2 disparos
        wind: { icon: '💨', damage: 18, cost: 20, shootInterval: 900, range: 4, health: 60, name: 'Viento', projectile: 'energy', info: "Ataque rápido con efecto de empuje" },
    earth: { icon: '🪨', damage: 22, cost: 25, shootInterval: 1500, range: 3, health: 80, name: 'Tierra', projectile: 'pure', info: "Daño sólido con posibilidad de aturdimiento" },

    // Desbloqueables
    crystal: { icon: '💎', damage: 80, cost: 120, shootInterval: 1800, range: 6, health: 120, name: 'Cristal', projectile: 'pure' },
    solar: { icon: '☀️', damage: 70, cost: 100, shootInterval: 900, range: 4, health: 90, name: 'Solar', projectile: 'energy' },
    coral: { icon: '🪸', image: "./img/squirtle.png", damage: 55, cost: 120, shootInterval: 1100, range: 5, health: 110, name: 'Coral', projectile: 'nature', supportAura: { type: 'damage_reduction', power: 0.15, range: 1 } },
    shield: { icon: '🛡️', damage: 40, cost: 200, shootInterval: 2000, range: 3, health: 500, name: 'Escudo', projectile: 'water' },
    tornado: { icon: '🌪️', damage: 90, cost: 140, shootInterval: 2200, range: 7, health: 80, name: 'Tornado', projectile: 'energy' }, // Daño alto, muy lento
    whale: { icon: '🐋', damage: 100, cost: 180, shootInterval: 2500, range: 8, health: 150, name: 'Ballena', projectile: 'water' }, // El más caro y potente
    // --- NUEVOS DEFENSORES ---
    dualcannon: { icon: '🔫', damage: 20, cost: 130, shootInterval: 1500, range: 5, health: 90, name: 'Cañón Doble', projectile: 'energy', shots: 2, shotDelay: 150 }, // Dispara 2 veces
    incinerator: { icon: '🔥', damage: 10, cost: 150, shootInterval: 2000, range: 4, health: 100, name: 'Incinerador', projectile: 'fire', statusEffect: { type: 'burn', dps: 15, duration: 3000 } }, // Aplica quemadura
    cryomancer: { icon: '❄️', damage: 15, cost: 110, shootInterval: 1800, range: 6, health: 80, name: 'Criomante', projectile: 'ice', statusEffect: { type: 'slow', power: 0.6, duration: 2000 } }, // Ralentiza
    generator: { icon: '💰', cost: 75, health: 60, name: 'Generador', generate: 20, interval: 5000, isGenerator: true }, // Genera monedas
    mortar: { icon: '💣', damage: 50, cost: 170, shootInterval: 4000, range: 8, health: 70, name: 'Mortero', projectile: 'explosion', splashRadius: 1.5 }, // Daño en área
    // --- NUEVOS DEFENSORES DE BAJO COSTE Y APOYO ---
    
    amplifier: { icon: '🔊', cost: 90, health: 80, name: 'Amplificador', isSupport: true, buff: { type: 'damage', power: 1.25 } }, // Aumenta daño en fila
    // --- 4 NUEVOS DEFENSORES ---
    wizard: { icon: '🧙', damage: 40, cost: 160, shootInterval: 2000, range: 5, health: 90, name: 'Mago Eléctrico', projectile: 'energy', chain: { jumps: 2, damageFalloff: 0.5 } },
    otter: { icon: '🦦', damage: 60, cost: 140, shootInterval: 1300, range: 4, health: 130, name: 'Nutria', projectile: 'nature' },
    kraken: { icon: '🐙', damage: 70, cost: 220, shootInterval: 2800, range: 7, health: 200, name: 'Kraken', projectile: 'water', chain: { jumps: 3, damageFalloff: 0.6 } },
    golem: { icon: '🗿', damage: 30, cost: 180, shootInterval: 2500, range: 3, health: 400, name: 'Gólem', projectile: 'pure' },
    // --- DEFENSOR ESPECIAL DE RECOMPENSA ---
    antiTankArea: { icon: '🎯', damage: 150, cost: 250, shootInterval: 3000, range: 6, health: 180, name: 'Antitanque de Área', projectile: 'explosion', splashRadius: 2, bidirectional: true, info: "¡Recompensa especial! Ataca hacia adelante Y hacia atrás. Daño masivo en área." },

    // --- DEFENSORES DEL MENÚ DE SELECCIÓN (game-page.html) ---
    // Estos IDs provienen de game-page.js y deben coincidir aquí para que aparezcan en la tienda del juego
    'water-shield':  { icon: '🛡️', damage: 15,  cost: 50,  shootInterval: 2000, range: 1, health: 100, name: 'Gota Escudo',      projectile: 'water',  info: "Defensor básico con escudo. Barato y resistente." },
    'rain-cloud':    { icon: '☁️',  damage: 20,  cost: 75,  shootInterval: 1200, range: 3, health: 60,  name: 'Nube Lluviosa',    projectile: 'water',  info: "Ataca con lluvia a distancia. Apoyo desde atrás." },
    'water-cannon':  { icon: '💦',  damage: 45,  cost: 150, shootInterval: 1000, range: 4, health: 80,  name: 'Aqua Cañón',       projectile: 'water',  info: "Chorros de agua a alta presión. Gran alcance y daño." },
    'ice-crystal':   { icon: '❄️',  damage: 35,  cost: 125, shootInterval: 1800, range: 3, health: 70,  name: 'Cristal de Hielo', projectile: 'ice',    statusEffect: { type: 'slow', power: 0.5, duration: 2000 }, info: "Congela y ralentiza contaminantes." },
    'wave-warrior':  { icon: '🌊',  damage: 30,  cost: 200, shootInterval: 2000, range: 1, health: 250, name: 'Guerrero Ola',     projectile: 'water',  info: "Tanque pesado. Aguanta oleadas enteras." },
    'water-lily':    { icon: '🪷',  cost: 100, health: 80,  name: 'Lirio Acuático',  generate: 15, interval: 6000, isGenerator: true, info: "Genera recursos adicionales pasivamente." },
    'coral-reef':    { icon: '🪸',  damage: 25,  cost: 175, shootInterval: 1200, range: 2, health: 120, name: 'Coral Dorado',     projectile: 'nature', supportAura: { type: 'damage_reduction', power: 0.2, range: 1 }, info: "Aura que aumenta el daño de defensores adyacentes." },
    'tsunami-giant': { icon: '🗿',  damage: 150, cost: 300, shootInterval: 3000, range: 6, health: 180, name: 'Titán Tsunami',    projectile: 'explosion', splashRadius: 2, info: "Defensor legendario. Daño en área masivo." },

};

// Tipos de contaminantes — var para permitir override desde js/game/contaminants.js
var allContaminatorTypes = window.allContaminatorTypes || [
    { icon: '🏭', health: 60, speed: 1, coins: 15, name: 'Fábrica' },
    { icon: '🛢️', health: 90, speed: 0.8, coins: 25, name: 'Petróleo' },
    { icon: '☢️', health: 120, speed: 0.6, coins: 40, name: 'Nuclear' },
    { icon: '🚮', health: 40, speed: 1.2, coins: 10, name: 'Basura' },
    { icon: '🚗', health: 80, speed: 1.1, coins: 20, name: 'Auto' },
    { icon: '⚗️', health: 120, speed: 0.9, coins: 30, name: 'Químico' },
    { icon: '🔥', health: 90, speed: 1.3, coins: 22, name: 'Fuego' },
    { icon: '💀', health: 350, speed: 0.7, coins: 50, name: 'Tóxico' },
    { icon: '🌪️', health: 110, speed: 1.4, coins: 28, name: 'Huracán' },
    { icon: '👹', health: 250, speed: 0.5, coins: 60, name: 'Demonio' },
    // --- NUEVOS CONTAMINANTES ---
    { icon: '👻', health: 80, speed: 1.5, coins: 35, name: 'Fantasma', ability: { type: 'phase', chance: 0.2, duration: 1500 } }, // Puede volverse intangible
    { icon: '🚛', health: 800, speed: 0.4, coins: 70, name: 'Tanque' }, // Lento pero muy resistente
    // --- JEFE ---
    { icon: '🦑', health: 1500, speed: 0.5, coins: 300, name: 'El Leviatán', isBoss: true, ability: { type: 'lane_change', cooldown: 8000, lastUsed: 0 } } // Jefe que cambia de carril
];

// Defensores desbloqueables — var para permitir override desde js/game/defenders.js
var unlockableDefenders = window.unlockableDefenders || {
    crystal: { cost: 2, description: "Cristal purificador de gran alcance" },
    solar: { cost: 3, description: "Panel solar con ataque rápido" },
    coral: { cost: 2, description: "Coral regenerativo y resistente" },
    shield: { cost: 4, description: "Escudo ultra resistente" },
    tornado: { cost: 5, description: "Tornado de largo alcance" },
    whale: { cost: 6, description: "Ballena poderosa y tanque" },
    // --- NUEVOS DESBLOQUEABLES ---
    dualcannon: { cost: 4, description: "Cañón que dispara ráfagas dobles" },
    incinerator: { cost: 5, description: "Aplica quemaduras que dañan con el tiempo" },
    cryomancer: { cost: 3, description: "Lanza hielo que ralentiza a los enemigos" },
    generator: { cost: 2, description: "Genera monedas extra durante la partida" },
    mortar: { cost: 6, description: "Causa daño en un área pequeña" },
    amplifier: { cost: 4, description: "Aumenta el daño de los defensores en su fila" },
    // --- NUEVOS DESBLOQUEABLES DE BAJO COSTE ---
    stream: { cost: 1, description: "Dispara un chorro rápido de bajo daño" },
    bubble: { cost: 1, description: "Lanza burbujas que ralentizan enemigos" },
    wizard: { cost: 5, description: "Ataque en cadena que salta a enemigos" },
    otter: { cost: 4, description: "Defensor balanceado y resistente" },
    kraken: { cost: 7, description: "Ataque en cadena de gran alcance" },
    golem: { cost: 6, description: "Tanque con mucha vida pero poco daño" }
};

// Servicios compartidos extraídos a módulos dedicados
const projectilePool = window.projectilePool;
const domUpdateBatcher = runtime.services.domUpdateBatcher;

function getAvailableDefenders() {
    const available = {};

    // Añadir los defensores que el usuario ha desbloqueado
    gameState.unlockedDefenders.forEach(key => {
        if (allDefenderTypes[key]) {
            available[key] = allDefenderTypes[key];
        }
    });

    return available;
}

function getAvailableContaminators() {
    // Excluir al jefe de la aparición normal
    const normalContaminators = allContaminatorTypes.filter(c => !c.isBoss);
    const maxTypes = Math.min(4 + Math.floor(gameState.wave / 2), normalContaminators.length);
    if (gameState.wave % 10 === 0 && gameState.wave > 0) {
        return allContaminatorTypes.filter(c => c.isBoss); // En oleada de jefe, solo aparece el jefe
    }
    return allContaminatorTypes.slice(0, maxTypes);
}

function updateUnlockShop() {
    // Ya no se usa - la tienda ahora está en el menú lateral
}

function toggleRemovalMode() {
    gameState.removalMode = !gameState.removalMode;
    gameState.selectedDefender = null;
    gameState.multiPlacementMode = false; // NUEVO: Desactivar modo múltiple

    // Deseleccionar todas las cartas
    document.querySelectorAll('.defender-card, .removal-tool').forEach(card => {
        card.classList.remove('selected', 'multi-placement');
    });

    // Si se activa el modo de eliminación, seleccionar la herramienta
    if (gameState.removalMode) {
        document.querySelector('.removal-tool').classList.add('selected');
        playSound(400, 0.1, 'square', 0.1); // Sonido de selección de herramienta
    }

    updateCellHoverEffects();
}

// NEW: Actualizar los efectos hover de las celdas
function updateCellHoverEffects() {
    document.querySelectorAll('.cell').forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const defender = gameState.defenders.find(d => d.row === row && d.col === col && d.health > 0);

        if (gameState.removalMode && defender) {
            cell.classList.add('can-remove');
        } else {
            cell.classList.remove('can-remove');
        }
    });
}

// NEW: Función para eliminar defensor y obtener reembolso
function removeDefender(row, col) {
    const defenderIndex = gameState.defenders.findIndex(d => d.row === row && d.col === col && d.health > 0);

    if (defenderIndex === -1) return false;

    const defender = gameState.defenders[defenderIndex];
    const defenderType = allDefenderTypes[defender.type];
    const refund = Math.floor(defenderType.cost * 0.5); // 50% de reembolso

    // Añadir reembolso a las monedas
    gameState.coins += refund;

    // Eliminar defensor del DOM y del array
    if (defender.element && defender.element.parentNode) {
        defender.element.remove();
    }
    gameState.defenders.splice(defenderIndex, 1);

    // Efecto visual de reembolso
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const refundEffect = document.createElement('div');
    refundEffect.className = 'refund-effect';
    refundEffect.textContent = `+${refund} 💰`;
    cell.appendChild(refundEffect);

    setTimeout(() => {
        if (refundEffect.parentNode) {
            refundEffect.remove();
        }
    }, 1500);

    // Sonido de eliminación y reembolso
    playSound(350, 0.2, 'triangle', 0.12);

    updateUI();
    updateCellHoverEffects();
    return true;
}

function startGame() {
    // Redirigir a game-page.html para selección de defensores
    window.location.href = 'game-page.html';
}

// Función para iniciar juego directamente sin modal (usado desde game-page.html)
function startGameDirectly() {
    // Cargar defensores seleccionados desde game-page.html
    const gamePageDefenders = localStorage.getItem('wacheck-selected-defenders');
    if (gamePageDefenders) {
        try {
            const parsed = JSON.parse(gamePageDefenders);
            if (Array.isArray(parsed) && parsed.length > 0) {
                window.selectedDefendersForGame = parsed;
                localStorage.setItem('selectedDefendersForGame', JSON.stringify(parsed));
            }
        } catch (e) {
            console.error('Error parsing defenders:', e);
        }
    }
    // Garantizar que siempre haya defensores — nunca arrancar con shop vacío
    if (!window.selectedDefendersForGame || window.selectedDefendersForGame.length === 0) {
        window.selectedDefendersForGame = ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
    }

    // Garantizar que gameState.currentUser esté cargado.
    // session-manager.js corre antes que script.js, así que su restauración
    // no encuentra gameState todavía. Lo cargamos aquí manualmente si falta.
    if (!gameState.currentUser) {
        try {
            const savedUser = localStorage.getItem('wacheck_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                gameState.currentUser = user;
                gameState.specialCoins = user.specialCoins || 0;
                // gameState.coins se mantiene en 100 (monedas de juego, independientes de las de cuenta)
                gameState.unlockedDefenders = user.unlockedDefenders ||
                    ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
            }
        } catch (e) {
            console.error('[startGameDirectly] Error loading user from localStorage:', e);
        }
    }
    
    // Ocultar botones globales y sidebar
    const globalSoundBtn = document.getElementById('soundToggle');
    const shopBtn = document.querySelector('.shop-toggle-btn');
    const sidebar = document.querySelector('.left-sidebar');

    if (globalSoundBtn) globalSoundBtn.style.display = 'none';
    if (shopBtn) shopBtn.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';

    // Iniciar el juego directamente
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('settingsPanelToggle').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    if (typeof closeSettingsPanel === 'function') {
        closeSettingsPanel();
    }

    hideBottomMenu();
    initAudio();
    initializeGame();

    if (typeof unlockAchievement === 'function') {
        unlockAchievement('first_game');
    }
}

// Hacer funciones accesibles globalmente
window.startGame = startGame;
window.startGameDirectly = startGameDirectly;

function backToMain() {
    playSound(300, 0.1, 'square', 0.15); // Sonido de clic inmediato

    // Mostrar botones globales y sidebar de nuevo
    const globalSoundBtn = document.getElementById('soundToggle');
    const shopBtn = document.querySelector('.shop-toggle-btn');
    const sidebar = document.querySelector('.left-sidebar');

    if (globalSoundBtn) globalSoundBtn.style.display = 'flex';
    if (shopBtn) shopBtn.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'block';

    // Detener TODOS los sonidos, incluyendo Game Over
    if (typeof window.stopGameOverSound === 'function') {
        window.stopGameOverSound();
    }
    if (typeof stopAllGameSounds === 'function') {
        stopAllGameSounds();
    }

    hideMessage();
    document.getElementById('pauseMenu').style.display = 'none';
    gameState.isPaused = false;
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userPanel').style.display = 'block';
    document.getElementById('settingsPanelToggle').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';

    // Cerrar menú desplegable de configuración si está abierto
    if (typeof closeSettingsPanel === 'function') {
        closeSettingsPanel();
    }

    // Aplicar el estilo de menú guardado
    if (typeof applyMenuStyle === 'function') {
        const savedStyle = localStorage.getItem('wacheck_menuStyle') || 'bottom';
        applyMenuStyle(savedStyle);
    } else {
        showBottomMenu();
    }

    gameState.gameRunning = false;
    clearAllIntervals();
    updateUnlockShop();
}

function initializeGame() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    // Limpiar defensores y contaminantes existentes del DOM
    gameState.defenders.forEach(d => d.element.remove());
    gameState.contaminators.forEach(c => c.element.remove());

    // Crear el tablero 5x10
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.onclick = () => handleCellClick(row, col); // NEW: Cambiar a función unificada
            board.appendChild(cell);
        }
    }

    // Guardar los datos que deben persistir entre partidas
    // NOTA: currentUser puede ser null si no hay sesión iniciada (jugador invitado sin localStorage)
    const _cu = gameState.currentUser || null;
    const persistentData = {
        currentUser: _cu,
        specialCoins: _cu ? (_cu.specialCoins || 0) : 0,
        unlockedDefenders: gameState.unlockedDefenders
    };

    // CORRECCIÓN: Asegurar que los defensores básicos SIEMPRE estén disponibles
    const basicDefenders = runtime.constants.basicDefenders;
    const userUnlocked = (_cu && _cu.unlockedDefenders) ? _cu.unlockedDefenders : [];
    const allUnlocked = [...new Set([...basicDefenders, ...userUnlocked])]; // Combinar sin duplicados

    // Restablecer completamente el estado del juego sin romper la referencia compartida
    runtime.resetGameState(gameState, {
        // Datos que persisten entre partidas
        specialCoins: persistentData.specialCoins,
        currentUser: persistentData.currentUser,
        unlockedDefenders: allUnlocked,

        // Datos reiniciados para una nueva partida
        coins: 100,
        health: 100,
        wave: 1,
        coinsEarnedThisSession: 0,
        gameRunning: true,
        waveActive: false,
        contaminatorsSpawned: 0,
        contaminatorsToSpawn: 0,
        contaminationLevel: 0,
        coinsAtWaveStart: 100,
        healthAtWaveStart: 100,
        isPaused: false,
        defendersAtWaveStart: [],
        removalMode: false,
        selectedDefenderOnBoard: null,
        multiPlacementMode: false
    });

    // Aplicar upgrades permanentes
    applyGameUpgrades();

    updateDefenderShop();
    updateUI();
    updateIslandContamination();
    updateCellHoverEffects(); // NEW: Actualizar efectos hover
    startWaveCountdown();

    // Continuar tutorial si estaba activo (después de hacer clic en "Jugar")
    if (typeof continueTutorialAfterGameStart === 'function') {
        continueTutorialAfterGameStart();
    }
}

// --- FUNCIÓN UNIFICADA PARA MANEJAR CLICS EN CELDAS (VERSIÓN CORREGIDA Y FINAL) ---
function handleCellClick(row, col) {
    if (!gameState.gameRunning || gameState.isPaused) return;

    const defenderOnCell = gameState.defenders.find(d => d.row === row && d.col === col && d.health > 0);

    if (gameState.removalMode) {
        // MODO ELIMINACIÓN: Si hay un defensor, lo elimina.
        if (defenderOnCell) {
            removeDefender(row, col);
            toggleRemovalMode(); // Desactiva el modo después de usarlo.
        }
    } else if (defenderOnCell) {
        // MODO NORMAL: Si hay un defensor en la celda, muestra el panel de mejora.
        showUpgradePanel(defenderOnCell);
    } else if (gameState.selectedDefender) {
        // MODO NORMAL: Si la celda está vacía y tienes un defensor seleccionado, lo coloca.
        placeDefender(row, col);
    }
}


function placeDefender(row, col) {
    // Permitir colocación durante el tutorial incluso si el juego está pausado
    const isTutorialActive = typeof tutorialManager !== 'undefined' && tutorialManager.isActive;

    if (!gameState.selectedDefender || (!gameState.gameRunning && !isTutorialActive)) return false;

    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell.querySelector('.defender')) return;

    if (gameState.coins >= gameState.selectedCost) {
        gameState.coins -= gameState.selectedCost;

        const defenderType = allDefenderTypes[gameState.selectedDefender];
        const defenderElement = document.createElement('div');
        defenderElement.className = 'defender';

        // --- NUEVO: Invertir el icono del cañón doble ---
        if (gameState.selectedDefender === 'dualcannon') {
            defenderElement.classList.add('flipped');
        }

        // Si es generador, no animar pulso de ataque
        if (defenderType.isGenerator) {
            defenderElement.classList.add('generator');
        }

        // Determinar si usar imagen o icono
        if (defenderType.image) {
            const img = document.createElement('img');
            img.src = defenderType.image;
            img.alt = defenderType.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            defenderElement.appendChild(img);
        } else {
            defenderElement.textContent = defenderType.icon;
        }

        // Barra de salud del defensor
        const healthBar = document.createElement('div');
        healthBar.className = 'defender-health';
        const healthFill = document.createElement('div');
        healthFill.className = 'defender-health-fill';
        healthFill.style.width = '100%';
        healthBar.appendChild(healthFill);
        defenderElement.appendChild(healthBar);

        cell.appendChild(defenderElement);

        // Calcular un tiempo inicial aleatorio para que no todos disparen al mismo tiempo
        const now = Date.now();
        const randomOffset = Math.random() * (defenderType.shootInterval || 1000);

        const newDefender = {
            row: row,
            col: col,
            type: gameState.selectedDefender,
            element: defenderElement,
            healthFill: healthFill,
            level: 1,
            damage: defenderType.damage || 0, // Asegurar que siempre tenga un valor
            health: defenderType.health,
            maxHealth: defenderType.health,
            shootInterval: defenderType.shootInterval || 1000,
            range: defenderType.range || 3,
            critChance: 0,
            lastShot: now - randomOffset, // Iniciar con offset aleatorio para disparos escalonados
            lastHeal: 0,
            lastAction: now - (Math.random() * (defenderType.interval || 1000)), // También aleatorizar para generadores
            lastDamageReceived: 0, // Timestamp del último daño recibido
            canHealOnKill: false, // Flag para nivel 3: si puede curarse al matar
            healingCanceled: false // Flag: si la curación fue cancelada (esperar a nivel 5)
        };

        gameState.defenders.push(newDefender);

        // Aplicar color inicial de la barra de vida
        updateDefenderHealthBarColor(newDefender);

        // Z-Index para 2.5D: Fila más baja (mayor Y) = mayor Z
        defenderElement.style.zIndex = row * 100 + 10;

        updateUI();
        updateCellHoverEffects(); // NEW: Actualizar efectos hover

        // Actualizar progreso de misiones
        if (typeof updateMissionProgress === 'function') {
            updateMissionProgress('place_defenders', 1);
        }

        // Actualizar logros
        if (typeof unlockAchievement === 'function') {
            unlockAchievement('first_defender');
        }
        if (typeof incrementAchievementProgress === 'function') {
            incrementAchievementProgress('place_100', 1);
        }

        // Verificar objetivos del modo historia
        if (typeof checkStoryObjectives === 'function') {
            checkStoryObjectives();
        }

        // Notificar al tutorial que se colocó un defensor
        if (typeof tutorialManager !== 'undefined') {
            tutorialManager.checkCondition('defender_placed');
        }

        // NUEVO: Solo deseleccionar si NO está en modo de colocación múltiple
        if (!gameState.multiPlacementMode) {
            gameState.selectedDefender = null;
            document.querySelectorAll('.defender-card').forEach(card => {
                card.classList.remove('selected');
            });
        } else {
            // En modo múltiple, mantener la selección visual
            const selectedCard = document.querySelector(`[data-type="${gameState.selectedDefender}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected', 'multi-placement');
            }
        }

        playSound(440, 0.1, 'triangle', 0.15); // Sonido de colocación: triángulo corto
        return true;
    }
}

function startWaveCountdown() {
    if (!gameState.gameRunning) return;

    updateWaveStatus("Preparando oleada...");

    // Guardar monedas y salud actuales para un posible reinicio de oleada
    gameState.coinsAtWaveStart = gameState.coins;
    gameState.healthAtWaveStart = gameState.health;
    // Guardar una copia COMPLETA de los defensores para poder restaurarlos correctamente
    gameState.defendersAtWaveStart = gameState.defenders.map(d => ({
        type: d.type,
        row: d.row,
        col: d.col,
        health: d.health,
        maxHealth: d.maxHealth,
        damage: d.damage,
        range: d.range,
        shootInterval: d.shootInterval,
        interval: d.interval, // Para generadores
        level: d.level || 1,
        critChance: d.critChance || 0,
        canHealOnKill: d.canHealOnKill || false
    }));

    setTimeout(() => {
        if (gameState.gameRunning) {
            startWave();
        }
    }, 3000);
}

function startWave() {
    if (!gameState.gameRunning) return;

    // Lógica de Jefe
    if (gameState.wave % 10 === 0 && gameState.wave > 0) {
        gameState.contaminatorsToSpawn = 1; // Solo un jefe
    } else {
        gameState.contaminatorsToSpawn = Math.min(3 + gameState.wave * 2, 20);
    }
    gameState.waveActive = true;
    gameState.contaminatorsSpawned = 0;

    updateWaveStatus(`Oleada ${gameState.wave} - ${gameState.contaminatorsToSpawn} contaminantes`);

    // Actualizar progreso de misiones
    if (typeof updateMissionProgress === 'function') {
        updateMissionProgress('wave', gameState.wave);
    }

    // Actualizar logros de oleadas
    if (typeof updateAchievementProgress === 'function') {
        updateAchievementProgress('wave_5', gameState.wave);
        updateAchievementProgress('wave_10', gameState.wave);
        updateAchievementProgress('wave_20', gameState.wave);
        updateAchievementProgress('wave_50', gameState.wave);
    }

    playSound(880, 0.4, 'square', 0.2); // Sonido de inicio de oleada: cuadrado más agudo
    spawnContaminators();
}

function spawnContaminators() {
    if (!gameState.gameRunning || !gameState.waveActive) return;

    const spawnsPerTick = 1 + Math.floor(gameState.wave / 5); // A partir de la oleada 5, spawnea 2 a la vez, etc.
    const intervalTime = Math.max(1800 - gameState.wave * 60, 500);

    // Guardar el ID del intervalo para poder limpiarlo después
    gameState.spawnIntervalId = setInterval(() => {
        // --- CORRECCIÓN: No spawnear si el juego está en pausa, pero continuar el intervalo ---
        if (gameState.isPaused) return; // Solo salta esta iteración, no detiene el intervalo

        // Verificar si ya se completó el spawn antes de intentar más spawns
        if (gameState.contaminatorsSpawned >= gameState.contaminatorsToSpawn) {
            clearInterval(gameState.spawnIntervalId);
            checkWaveComplete();
            return;
        }

        // Verificar si la oleada sigue activa
        if (!gameState.waveActive) {
            clearInterval(gameState.spawnIntervalId);
            return;
        }

        // Spawn de múltiples enemigos por tick
        for (let i = 0; i < spawnsPerTick && gameState.contaminatorsSpawned < gameState.contaminatorsToSpawn; i++) {
            spawnContaminator();
            gameState.contaminatorsSpawned++;
        }
    }, intervalTime);
}

function spawnContaminator() {
    const row = Math.floor(Math.random() * 5);
    const availableTypes = getAvailableContaminators();
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Escalado de vida mejorado
    let healthMultiplier = 1 + (gameState.wave * 0.1);

    // Los jefes escalan mucho más
    if (type.isBoss) {
        healthMultiplier = 1 + (gameState.wave * 0.25);
    }

    const maxHealth = Math.floor(type.health * healthMultiplier);

    // Aumentar probabilidad de enemigos raros en oleadas altas
    let finalType = type;
    if (gameState.wave >= 15 && Math.random() < 0.25) { // 25% de probabilidad
        const rareTypes = allContaminatorTypes.slice(-3); // Toma los últimos 3 como "raros"
        finalType = rareTypes[Math.floor(Math.random() * rareTypes.length)];
    }

    const contaminator = {
        id: Date.now() + Math.random(),
        row: row,
        col: 9,
        position: 10.5, // Empezar fuera del tablero por la derecha
        health: maxHealth,
        maxHealth: maxHealth,
        type: finalType,
        element: null,
        speed: finalType.speed,
        originalSpeed: finalType.speed, // Para efectos de ralentización
        lastAttack: 0,
        status: {}, // Para efectos como quemadura, ralentización
        ability: finalType.ability ? { ...finalType.ability, lastUsed: 0 } : null, // Copia de la habilidad
        needsUpdate: true // OPTIMIZACIÓN: Flag para actualización de posición
    };

    const contaminatorElement = document.createElement('div');
    contaminatorElement.className = 'contaminator';
    contaminatorElement.textContent = type.icon;

    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'health-fill';
    healthFill.style.width = '100%';
    healthBar.appendChild(healthFill);
    contaminatorElement.appendChild(healthBar);

    const gameBoard = document.getElementById('gameBoard');
    contaminator.element = contaminatorElement;
    contaminator.healthFill = healthFill;

    // --- POSICIONAMIENTO INICIAL CON TRANSFORM PARA MEJOR RENDIMIENTO ---
    const cellHeight = getCellHeightWithGap();
    const cellWidth = getCellWidthWithGap();
    contaminator.element.style.top = (row * cellHeight) + 'px';
    contaminator.element.style.left = '0px';
    contaminator.element.style.transform = `translate3d(${contaminator.position * cellWidth}px, 0, 0)`;
    contaminator.element.style.transform = `translate3d(${contaminator.position * cellWidth}px, 0, 0)`;
    // Z-Index para 2.5D
    contaminator.element.style.zIndex = row * 100 + 20;
    contaminator.element.style.willChange = 'transform'; // Optimización de rendimiento

    gameBoard.appendChild(contaminatorElement); // Añadir al tablero principal, no a la celda
    gameState.contaminators.push(contaminator);

    // Reproducir sonido de aparición
    if (type.isBoss && typeof playGameSound === 'function') {
        playGameSound('spawnBoss'); // Sonido especial para el boss
    } else {
        playSound(300, 0.1, 'sawtooth', 0.05); // Sonido genérico
    }
}

// --- NUEVA FUNCIÓN PARA PROCESAR EFECTOS DE ESTADO ---
function processStatusEffects() {
    if (gameState.contaminators.length === 0) return;

    const now = Date.now();
    // OPTIMIZACIÓN: Usar bucle for tradicional
    for (let i = gameState.contaminators.length - 1; i >= 0; i--) {
        const contaminator = gameState.contaminators[i];

        if (contaminator.health <= 0) continue;

        // Procesar quemadura (burn)
        if (contaminator.status.burn && now < contaminator.status.burn.endTime) {
            if (now - (contaminator.status.burn.lastTick || 0) > 1000) {
                const dps = contaminator.status.burn.dps;
                contaminator.health -= dps;
                contaminator.status.burn.lastTick = now;
                // Efecto visual de daño por quemadura
                const hitEffect = document.createElement('div');
                hitEffect.className = 'hit-effect burn';
                hitEffect.textContent = `-${dps}`;
                contaminator.element.appendChild(hitEffect);
                setTimeout(() => hitEffect.remove(), 1000);
                updateContaminatorHealthBar(contaminator);
            }
        } else if (contaminator.status.burn) {
            delete contaminator.status.burn; // Limpiar efecto
            contaminator.element.classList.remove('burning');
        }

        // Procesar ralentización (slow)
        if (contaminator.status.slow && now < contaminator.status.slow.endTime) {
            contaminator.speed = contaminator.originalSpeed * (1 - contaminator.status.slow.power);
        } else if (contaminator.status.slow) {
            contaminator.speed = contaminator.originalSpeed; // Restaurar velocidad
            delete contaminator.status.slow; // Limpiar efecto
            contaminator.element.classList.remove('slowed');
        }

        if (contaminator.health <= 0) {
            handleContaminatorDeath(contaminator);
        }
    }
}

function moveContaminators() {
    if (!gameState.gameRunning || gameState.contaminators.length === 0) return;

    // OPTIMIZACIÓN: Usar bucle for tradicional (más rápido que forEach)
    const cellWidth = getCellWidthWithGap(); // Cachear fuera del bucle

    for (let i = gameState.contaminators.length - 1; i >= 0; i--) {
        const contaminator = gameState.contaminators[i];

        if (contaminator.health <= 0) continue;

        // Atacar defensores en el camino
        // --- LÓGICA DE HABILIDADES DE CONTAMINANTES ---
        if (contaminator.ability) {
            // Habilidad de Jefe: Cambiar de carril
            if (contaminator.ability.type === 'lane_change' && Date.now() - contaminator.ability.lastUsed > contaminator.ability.cooldown) {
                const possibleMoves = [-1, 1].filter(move => {
                    const newRow = contaminator.row + move;
                    return newRow >= 0 && newRow < 5;
                });
                if (possibleMoves.length > 0) {
                    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    contaminator.row += move;
                    const cellHeight = getCellHeightWithGap();
                    contaminator.element.style.top = (contaminator.row * cellHeight) + 'px';
                    contaminator.ability.lastUsed = Date.now();
                }
            }
            // Habilidad de Fantasma: Intangibilidad
            if (contaminator.ability.type === 'phase' && Math.random() < (contaminator.ability.chance / 60)) { // Chance por frame
                contaminator.status.phasing = { endTime: Date.now() + contaminator.ability.duration };
                contaminator.element.classList.add('phasing');
            }
        }
        const nextCol = Math.floor(contaminator.position - 0.1); // Mirar un poco hacia adelante
        let isBlocked = false;

        // Primero, verificamos si hay un defensor bloqueando el camino.
        if (nextCol >= 0 && nextCol < 10) {
            const defender = gameState.defenders.find(d =>
                d.row === contaminator.row &&
                d.col === nextCol &&
                d.health > 0
            );

            if (defender) {
                isBlocked = true;
                // Ahora, si está bloqueado, verificamos si puede atacar.
                if (Date.now() - contaminator.lastAttack > 1000) {
                    contaminatorAttackDefender(contaminator, defender);
                    contaminator.lastAttack = Date.now();
                }
            }
        }

        if (!isBlocked) {
            // Usar delta time en lugar de asumir 60 FPS
            // speed es celdas por segundo, multiplicamos por deltaTime
            const oldPosition = contaminator.position;
            contaminator.position -= contaminator.speed * deltaTime;

            // OPTIMIZACIÓN: Solo actualizar DOM si el cambio es significativo (>0.5px)
            const positionChange = Math.abs((oldPosition - contaminator.position) * cellWidth);
            if (positionChange > 0.5) {
                contaminator.needsUpdate = true;
            }
        }

        if (contaminator.position <= -0.5) {
            // ¡AQUÍ ES DONDE DEBE CAUSAR DAÑO! Al llegar al extremo izquierdo
            gameState.health -= 25;
            gameState.contaminationLevel++;
            updateUI();
            updateIslandContamination();
            removeContaminator(contaminator);

            playSound(100, 0.6, 'sawtooth', 0.2); // Sonido de impacto en la isla: diente de sierra grave

            if (gameState.health <= 0) {
                gameOver();
            }
        } else if (contaminator.needsUpdate && contaminator.element) {
            // OPTIMIZACIÓN: Usar transform con translate3d para aceleración GPU
            const leftPos = contaminator.position * cellWidth;
            const transformValue = `translate3d(${leftPos.toFixed(1)}px, 0, 0)`;

            // Batch update para mejor rendimiento
            domUpdateBatcher.add(contaminator.element, 'transform', transformValue);
            contaminator.needsUpdate = false;
        }
    }
}

function contaminatorAttackDefender(contaminator, defender) {
    let damage = 15 + gameState.wave * 2;

    // --- NUEVO: APLICAR AURA DE REDUCCIÓN DE DAÑO (CORAL) ---
    const adjacentDefenders = gameState.defenders.filter(d =>
        d.health > 0 && Math.abs(d.row - defender.row) + Math.abs(d.col - defender.col) === 1
    );
    const coralAuras = adjacentDefenders.concat(defender).filter(d => allDefenderTypes[d.type]?.supportAura?.type === 'damage_reduction');

    if (coralAuras.length > 0) {
        // Aplicar el buff del coral más cercano (no se acumulan por ahora)
        const buff = coralAuras[0]; // Tomamos el primero que encontremos
        const reduction = allDefenderTypes[buff.type].supportAura.power;
        damage = Math.floor(damage * (1 - reduction));
    }

    // --- NUEVO: Habilidad de Golpe Crítico del Jefe ---
    if (contaminator.type.isBoss && Math.random() < 0.30) { // 30% de probabilidad de crítico
        // El crítico hace un 30% de la vida máxima del defensor como daño
        damage = Math.floor(defender.maxHealth * 0.30);
        // Podríamos añadir un efecto visual especial para el crítico aquí
    }

    defender.health -= damage; // Usar la vida individual del defensor
    defender.lastDamageReceived = Date.now(); // Registrar cuándo recibió daño

    // Cancelar curación de nivel 3 si estaba activa
    if (defender.canHealOnKill && defender.level >= 3) {
        defender.canHealOnKill = false;
        defender.healingCanceled = true; // No puede volver a curarse hasta nivel 5
    }

    contaminator.element.classList.add('attacking');
    defender.element.classList.add('damaged');

    setTimeout(() => {
        contaminator.element.classList.remove('attacking');
        defender.element.classList.remove('damaged');
    }, 500);

    // Actualizar barra de salud del defensor
    const healthPercent = Math.max(0, (defender.health / defender.maxHealth) * 100); // Usar vida individual
    defender.healthFill.style.width = `${healthPercent}%`;

    // Efecto de daño
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-effect';
    hitEffect.textContent = `-${damage}`;
    defender.element.appendChild(hitEffect);

    setTimeout(() => hitEffect.remove(), 1000);

    playSound(150, 0.1, 'square', 0.1); // Sonido de ataque de contaminante: cuadrado grave

    if (defender.health <= 0) {
        destroyDefender(defender); // El enemigo destruye al defensor, sin reembolso
        updateCellHoverEffects(); // NEW: Actualizar efectos hover cuando se destruye un defensor
    }
}

// Función para cuando un defensor es destruido (sin reembolso)
function destroyDefender(defender) {
    const index = gameState.defenders.indexOf(defender);
    if (index > -1) {
        gameState.defenders.splice(index, 1);
        if (defender.element && defender.element.parentNode) {
            defender.element.remove();
        }
    }
}

// --- NUEVO: PROCESAR HABILIDADES PASIVAS DE DEFENSORES ---
function processDefenderAbilities() {
    const now = Date.now();
    gameState.defenders.forEach(defender => {
        if (defender.health <= 0) return;

        const defenderType = allDefenderTypes[defender.type];
        if (!defenderType) return;

        // Habilidad de autocuración (Planta)
        if (defenderType.selfHeal) {
            if (now - (defender.lastHeal || 0) > defenderType.selfHeal.interval) {
                if (defender.health < defender.maxHealth) { // Usar vida individual
                    defender.health = Math.min(defender.maxHealth, defender.health + defenderType.selfHeal.amount);
                    defender.lastHeal = now;

                    // OPTIMIZACIÓN: Actualizar barra de vida con batching
                    const healthPercent = (defender.health / defender.maxHealth) * 100;
                    domUpdateBatcher.add(defender.healthFill, 'width', `${healthPercent}%`);
                }
            }
        }
    });
}

function updateContaminatorHealthBar(contaminator) {
    const healthPercent = Math.max(0, (contaminator.health / contaminator.maxHealth) * 100);
    if (contaminator.healthFill) {
        // OPTIMIZACIÓN: Usar batching para actualizar barras de vida
        domUpdateBatcher.add(contaminator.healthFill, 'width', `${healthPercent}%`);
    }
}

function removeContaminator(contaminator) {
    const index = gameState.contaminators.indexOf(contaminator);
    if (index > -1) {
        gameState.contaminators.splice(index, 1);
        if (contaminator.element && contaminator.element.parentNode) {
            contaminator.element.remove();
        }
    }
}

function shoot() {
    if (!gameState.gameRunning) return;

    const availableDefenders = getAvailableDefenders();

    gameState.defenders.forEach(defender => {
        if (defender.health <= 0) return;

        const defenderType = availableDefenders[defender.type];
        // Comprobación de seguridad: si el tipo de defensor no está disponible, no hacer nada.
        if (!defenderType) return;

        const now = Date.now();

        // --- LÓGICA PARA GENERADORES DE MONEDAS ---
        if (defenderType.isGenerator) {
            if (now - defender.lastAction >= defenderType.interval) {
                gameState.coins += defenderType.generate;
                defender.lastAction = now;
                // Efecto visual de moneda
                showFloatingText(`+${defenderType.generate}💰`, defender.element, 'coin-effect');
                updateUI();
            }
            return; // Los generadores no atacan
        }
        // --- LÓGICA PARA BUFFERS DE APOYO ---
        if (defenderType.isSupport) {
            // Los de apoyo no atacan por sí mismos
            // Su lógica se aplica en el cálculo de daño de otros defensores
            defender.element.classList.add('attacking'); // Animación de pulso de apoyo
            setTimeout(() => defender.element.classList.remove('attacking'), 500);
            return;
        }

        let currentRange = defender.range;
        // CORRECCIÓN: Si defender.damage es undefined, obtener del tipo
        const baseDamage = defender.damage !== undefined ? defender.damage : (defenderType.damage || 0);
        let currentDamage = getDamageWithUpgrade(baseDamage); // Aplicar upgrade de daño
        let currentInterval = defender.shootInterval;

        // --- NUEVO: Habilidad de Nivel 5 para el Filtro ---
        if (defender.type === 'filter' && defender.level >= 5) {
            const plantsInFront = gameState.defenders.filter(d =>
                d.row === defender.row && d.col > defender.col
            ).length;

            if (plantsInFront >= 2) {
                currentRange = 6; // Rango fijo a 6
            }
        } else {
            currentRange = defender.range; // Volver al rango normal si no se cumple la condición
        }

        // --- NUEVO: APLICAR BUFFS DE AMPLIFICADORES ---
        const amplifiersInRow = gameState.defenders.filter(d =>
            d.type === 'amplifier' && d.row === defender.row && d.col < defender.col && d.health > 0
        );
        if (amplifiersInRow.length > 0) {
            // Aplicar el buff del primer amplificador encontrado (no se acumulan por ahora)
            const buff = allDefenderTypes.amplifier.buff;
            if (buff.type === 'damage') currentDamage *= buff.power;
            // Podríamos añadir un efecto visual al defensor buffeado aquí
        }

        if (now - defender.lastShot >= currentInterval) {
            const targets = gameState.contaminators.filter(c =>
                c.row === defender.row &&
                c.health > 0 &&
                c.position >= defender.col &&
                c.position - defender.col <= currentRange
            );

            targets.sort((a, b) => a.position - b.position);
            const target = targets[0];

            if (target) {
                // --- LÓGICA PARA DISPARO MÚLTIPLE ---
                const shots = defenderType.shots || 1;
                const shotDelay = defenderType.shotDelay || 0;
                const damageToUse = currentDamage; // Capturar el valor en el closure

                // Reproducir sonido específico del defensor
                playDefenderShootSound(defender.type);

                for (let i = 0; i < shots; i++) {
                    setTimeout(() => {
                        // Volver a comprobar si el objetivo sigue vivo y en rango
                        const currentTarget = gameState.contaminators.find(c => c.id === target.id && c.health > 0);
                        if (currentTarget) {
                            shootProjectile(defender, currentTarget, damageToUse);
                        }
                    }, i * shotDelay);
                }

                defender.lastShot = now; // Marcar el disparo para el cooldown
            }
        }
    });
}

// ====================================
// FUNCIONES DE PROYECTILES (importadas de projectiles-service.js)
// Aliases para mantener compatibilidad
// ====================================
const shootProjectile = window.WacheckProjectiles.shootProjectile;
const updateProjectiles = window.WacheckProjectiles.updateProjectiles;
const hitTarget = window.WacheckProjectiles.hitTarget;
const applyDamageAndEffectsV2 = window.WacheckProjectiles.applyDamageAndEffectsV2;
const applyDamageAndEffects = window.WacheckProjectiles.applyDamageAndEffects;
const removeProjectile = window.WacheckProjectiles.removeProjectile;
const createExplosionEffect = window.WacheckProjectiles.createExplosionEffect;
const createImpactEffect = window.WacheckProjectiles.createImpactEffect;

function checkWaveComplete() {
    const checkComplete = () => {
        if (!gameState.waveActive) return;

        if (gameState.contaminators.length === 0 &&
            gameState.contaminatorsSpawned >= gameState.contaminatorsToSpawn) {

            gameState.waveActive = false;
            const bonusCoins = 30 + gameState.wave * 20;
            gameState.coins += bonusCoins;

            // Rastrear bonus de monedas para el modo historia
            if (typeof trackCoinsEarned === 'function') {
                trackCoinsEarned(bonusCoins);
            }

            // Bonus de monedas por jefe
            if ((gameState.wave - 1) % 10 === 0 && (gameState.wave - 1) > 0) {
                const bossBonus = 250;
                gameState.coins += bossBonus;
                if (typeof trackCoinsEarned === 'function') {
                    trackCoinsEarned(bossBonus);
                }
            }

            // Moneda especial cada 5 oleadas
            if (gameState.wave % 5 === 0) {
                gameState.specialCoins++;
                saveCurrentUserProgress(); // Guardar datos del usuario actual

                const specialEffect = document.createElement('div');
                specialEffect.className = 'special-coin-effect';
                specialEffect.textContent = '+1 ⭐';
                document.body.appendChild(specialEffect);
                setTimeout(() => specialEffect.remove(), 2000);

                // Actualizar logro de monedas especiales
                if (typeof incrementAchievementProgress === 'function') {
                    incrementAchievementProgress('special_coins_10', 1);
                }
            }

            // Actualizar logros de monedas acumuladas
            if (typeof updateAchievementProgress === 'function') {
                updateAchievementProgress('coins_1000', gameState.coins);
                updateAchievementProgress('coins_5000', gameState.coins);
            }

            // Verificar oleada sin daño
            if (gameState.health === gameState.healthAtWaveStart) {
                if (typeof unlockAchievement === 'function') {
                    unlockAchievement('no_damage_wave');
                }
                // Actualizar progreso de misión de "sin daño"
                if (typeof updateMissionProgress === 'function') {
                    updateMissionProgress('no_damage', 1);
                }
            }

            gameState.wave++;
            gameState.healthAtWaveStart = gameState.health; // Resetear para próxima oleada
            updateUI();
            showWaveComplete(bonusCoins);

            // Verificar objetivos del modo historia
            if (typeof onStoryWaveComplete === 'function') {
                onStoryWaveComplete();
            }

            playSound(700, 0.7, 'sine', 0.2); // Sonido de oleada completada: seno agradable

            setTimeout(() => {
                if (gameState.gameRunning) {
                    startWaveCountdown();
                }
            }, 4000);
        } else {
            setTimeout(checkComplete, 500);
        }
    };

    setTimeout(checkComplete, 1000);
}

// --- NUEVO: SISTEMA DE CURACIÓN POR MATAR CONTAMINANTES ---
function healDefendersOnKill(contaminator) {
    const now = Date.now();
    const contaminatorMaxHealth = contaminator.maxHealthBeforeDeath || contaminator.type.health;

    gameState.defenders.forEach(defender => {
        if (defender.health <= 0) return;

        const timeSinceLastDamage = now - (defender.lastDamageReceived || 0);
        const hasNotReceivedDamageRecently = timeSinceLastDamage >= 10000; // 10 segundos

        // --- NIVEL 3: CURACIÓN GRADUAL AL MATAR ---
        if (defender.level >= 3 && defender.level < 5) {
            const healthPercent = (defender.health / defender.maxHealth) * 100;

            // Activar curación si: vida < 30%, no ha recibido daño por 10s, y no fue cancelada
            if (healthPercent < 30 && hasNotReceivedDamageRecently && !defender.healingCanceled) {
                defender.canHealOnKill = true;
            }

            // Si puede curarse, hacerlo gradualmente
            if (defender.canHealOnKill) {
                const targetHealth = defender.maxHealth * 0.80; // 80% de vida máxima
                if (defender.health < targetHealth) {
                    // Curar 10% de vida máxima por kill
                    const healAmount = Math.floor(defender.maxHealth * 0.10);
                    defender.health = Math.min(targetHealth, defender.health + healAmount);

                    // Actualizar barra de vida
                    const healthPercent = (defender.health / defender.maxHealth) * 100;
                    defender.healthFill.style.width = `${healthPercent}%`;

                    // Mostrar texto de curación
                    showFloatingText(`+${healAmount} 💚`, defender.element, 'heal-effect');

                    // Si ya llegó al 80%, desactivar curación
                    if (defender.health >= targetHealth) {
                        defender.canHealOnKill = false;
                    }
                }
            }
        }

        // --- NIVEL 5: CURACIÓN POR VIDA DEL CONTAMINANTE ---
        if (defender.level >= 5) {
            // Resetear flag de curación cancelada al llegar a nivel 5
            defender.healingCanceled = false;

            if (hasNotReceivedDamageRecently) {
                // Curar 5% de la vida del contaminante eliminado
                const healAmount = Math.floor(contaminatorMaxHealth * 0.05);

                if (defender.health < defender.maxHealth && healAmount > 0) {
                    defender.health = Math.min(defender.maxHealth, defender.health + healAmount);

                    // Actualizar barra de vida
                    const healthPercent = (defender.health / defender.maxHealth) * 100;
                    defender.healthFill.style.width = `${healthPercent}%`;

                    // Mostrar texto de curación
                    showFloatingText(`+${healAmount} 💚`, defender.element, 'heal-effect');
                }
            }
        }
    });
}

function handleContaminatorDeath(contaminator) {
    // ANTI-CHEAT: Verificar si las recompensas están bloqueadas
    if (window.REWARDS_BLOCKED === true) {
        console.warn('⚠️ ANTI-CHEAT: Recompensas bloqueadas, no se otorgan monedas');
        removeContaminator(contaminator);
        return;
    }

    const coinsGained = getCoinsWithMultiplier(contaminator.type.coins);
    gameState.coins += coinsGained;

    // Rastrear monedas ganadas para el modo historia
    if (typeof trackCoinsEarned === 'function') {
        trackCoinsEarned(coinsGained);
    }

    // Verificar objetivos del modo historia
    if (typeof onStoryContaminatorKilled === 'function') {
        onStoryContaminatorKilled(contaminator);
    }

    // Actualizar progreso de misiones
    if (typeof updateMissionProgress === 'function') {
        updateMissionProgress('kill_enemies', 1);
        updateMissionProgress('collect_coins', coinsGained);
    }

    // Actualizar logros de eliminaciones
    if (typeof incrementAchievementProgress === 'function') {
        incrementAchievementProgress('kills_50', 1);
        incrementAchievementProgress('kills_250', 1);
        incrementAchievementProgress('kills_1000', 1);
    }

    // --- NUEVO: SISTEMA DE CURACIÓN POR MATAR CONTAMINANTES ---
    healDefendersOnKill(contaminator);

    // Si es un jefe, da una moneda especial y actualiza misión
    if (contaminator.type.isBoss) {
        // ANTI-CHEAT: Solo otorgar si no está bloqueado
        if (window.REWARDS_BLOCKED !== true) {
            gameState.specialCoins++;
            saveCurrentUserProgress();
            showFloatingText('+1 ⭐', document.body, 'special-coin-effect');
        } else {
            console.warn('⚠️ ANTI-CHEAT: Moneda especial de jefe bloqueada');
        }

        if (typeof updateMissionProgress === 'function') {
            updateMissionProgress('boss', 1);
        }

        // Actualizar logros de jefes
        if (typeof unlockAchievement === 'function') {
            unlockAchievement('first_boss');
        }
        if (typeof incrementAchievementProgress === 'function') {
            incrementAchievementProgress('boss_5', 1);
        }
    }
    updateUI();
    removeContaminator(contaminator);
}

function showWaveComplete(bonus) {
    const waveComplete = document.getElementById('waveComplete');
    let message = `¡Oleada ${gameState.wave - 1} Completada! 🎉<br>+${bonus} 💰`;

    if ((gameState.wave - 1) % 10 === 0 && (gameState.wave - 1) > 0) {
        message += `<br>¡Jefe Derrotado! +250 💰 extra`;
    }
    if ((gameState.wave - 1) % 5 === 0) {
        message += `<br>¡Moneda especial obtenida! +1 ⭐`;
    }

    waveComplete.innerHTML = message;
    waveComplete.style.display = 'block';

    setTimeout(() => {
        waveComplete.style.display = 'none';
    }, 3000);
}

// ====================================
// FUNCIONES DE UI (importadas de ui-system.js)
// Aliases para mantener compatibilidad
// ====================================
const showFloatingText = window.WacheckUI.showFloatingText;
const updateIslandContamination = window.WacheckUI.updateIslandContamination;
const updateWaveStatus = window.WacheckUI.updateWaveStatus;
const updateUI = window.WacheckUI.updateUI;
const showMessage = window.WacheckUI.showMessage;
const hideMessage = window.WacheckUI.hideMessage;

// ====================================
// FUNCIONES DE TIENDA (importadas de shop-system.js)
// Aliases para mantener compatibilidad
// ====================================
const unlockDefender = window.WacheckShop.unlockDefender;
const updateDefenderShop = window.WacheckShop.updateDefenderShop;
const updateDefenderHealthBarColor = window.WacheckShop.updateDefenderHealthBarColor;
const selectDefender = window.WacheckShop.selectDefender;
const openShopMenu = window.WacheckShop.openShopMenu;
const closeShopMenu = window.WacheckShop.closeShopMenu;
const closeShopMenuOnOutsideClick = window.WacheckShop.closeShopMenuOnOutsideClick;
const renderShop = window.WacheckShop.renderShop;
const purchaseDefender = window.WacheckShop.purchaseDefender;
const updateShopBalance = window.WacheckShop.updateShopBalance;
const awardSpecialCoins = window.WacheckShop.awardSpecialCoins;
const showDefenderSelectionModal = window.WacheckShop.showDefenderSelectionModal;
const hideDefenderSelectionModal = window.WacheckShop.hideDefenderSelectionModal;
const getDefenderData = window.WacheckShop.getDefenderData;
const confirmDefenderSelection = window.WacheckShop.confirmDefenderSelection;

// --- NUEVO: SISTEMA DE NIVELES ---

function getUpgradeCost(level) {
    return 50 + (level * level * 25); // Coste incremental: 75, 150, 275, 450...
}

function showUpgradePanel(defender) {
    if (!defender) return;
    gameState.selectedDefenderOnBoard = defender;

    const panel = document.getElementById('upgradePanel');
    const defenderType = allDefenderTypes[defender.type];

    const iconElement = document.getElementById('upgradeDefenderIcon');
    // Determinar si usar imagen o icono
    if (defenderType.image) {
        iconElement.innerHTML = `<img src="${defenderType.image}" alt="${defenderType.name}" style="width: 50px; height: 50px; object-fit: contain;">`;
    } else {
        iconElement.textContent = defenderType.icon;
    }
    document.getElementById('upgradeDefenderName').textContent = `${defenderType.name} (Nivel ${defender.level})`;

    const statsDiv = document.getElementById('upgradeDefenderStats');
    statsDiv.innerHTML = `
                <p><strong>Vida:</strong> ${defender.health.toFixed(0)} / ${defender.maxHealth.toFixed(0)}</p>
                <p><strong>Daño:</strong> ${defender.damage.toFixed(1)}</p>
                <p><strong>Cadencia:</strong> ${(1000 / defender.shootInterval).toFixed(2)}/s</p>
                <p><strong>Alcance:</strong> ${defender.range}</p>
                ${defender.critChance > 0 ? `<p><strong>Crítico:</strong> ${(defender.critChance * 100)}%</p>` : ''}
            `;

    const nextLevelInfo = document.getElementById('upgradeNextLevelInfo');
    const upgradeButton = document.getElementById('upgradeButton');

    if (defender.level >= 5) {
        nextLevelInfo.innerHTML = "<p>¡Nivel Máximo Alcanzado!</p>";
        upgradeButton.style.display = 'none';
    } else {
        const cost = getUpgradeCost(defender.level);
        let bonusText = '';
        switch (defender.level + 1) {
            case 2: bonusText = "Mejora: +25% Vida Máxima<br><small>💚 Curación instantánea: +25% de vida al mejorar</small>"; break;
            case 3: bonusText = "Mejora: +20% Daño<br><small>🩹 Curación: Al matar recupera vida si está <30% HP y no recibió daño por 10s (hasta 80% HP máx.)</small>"; break;
            case 4: bonusText = "Mejora: +20% Prob. de Crítico (x2 Daño)"; break;
            case 5: bonusText = "Mejora: Habilidad Final<br><small>💚 Curación mejorada: Al matar recupera 5% de la vida del enemigo (sin daño por 10s)</small>"; break;
            default: bonusText = "Mejora: +15% Cadencia de Disparo"; break; // Nivel 1
        }
        nextLevelInfo.innerHTML = `<p><strong>Siguiente Nivel:</strong> ${bonusText}</p>`;
        upgradeButton.textContent = `Mejorar (${cost} 💰)`;
        upgradeButton.style.display = 'block';
        upgradeButton.disabled = gameState.coins < cost;
    }

    panel.style.display = 'block';

    // Mostrar el overlay para permitir cerrar al hacer clic fuera
    document.getElementById('upgradeOverlay').style.display = 'block';

    // --- NUEVO: Lógica para la Mejora Grupal ---
    const groupUpgradeButton = document.getElementById('groupUpgradeButton');
    const sameTypeDefenders = gameState.defenders.filter(d => d.type === defender.type && d.health > 0);

    if (sameTypeDefenders.length > 1) {
        // Encontrar el nivel más bajo entre este tipo de defensores
        const minLevel = Math.min(...sameTypeDefenders.map(d => d.level));
        const defendersToUpgrade = sameTypeDefenders.filter(d => d.level === minLevel);

        // Solo mostrar si hay al menos un defensor para mejorar y no están en el nivel máximo
        if (defendersToUpgrade.length > 0 && minLevel < 5) {
            const count = defendersToUpgrade.length;
            const individualCost = getUpgradeCost(minLevel);
            const totalCost = Math.floor(individualCost * count * 0.8); // 20% de descuento

            groupUpgradeButton.innerHTML = `Mejorar ${count} a Nv. ${minLevel + 1} (${totalCost} 💰)`;
            groupUpgradeButton.style.display = 'block';
            groupUpgradeButton.disabled = gameState.coins < totalCost;
        } else {
            groupUpgradeButton.style.display = 'none';
        }
    } else {
        groupUpgradeButton.style.display = 'none';
    }
}

function hideUpgradePanel() {
    document.getElementById('upgradePanel').style.display = 'none';
    document.getElementById('upgradeOverlay').style.display = 'none'; // Ocultar el overlay
    gameState.selectedDefenderOnBoard = null;
}

function upgradeSelectedDefender() {
    const defender = gameState.selectedDefenderOnBoard;
    if (!defender) return;

    // Llamar a la función de mejora individual
    performUpgrade(defender);
}

// --- NUEVO: Función para la mejora grupal ---
function massUpgradeDefenders() {
    const mainDefender = gameState.selectedDefenderOnBoard;
    if (!mainDefender) return;

    const sameTypeDefenders = gameState.defenders.filter(d => d.type === mainDefender.type && d.health > 0);
    const minLevel = Math.min(...sameTypeDefenders.map(d => d.level));
    const defendersToUpgrade = sameTypeDefenders.filter(d => d.level === minLevel);

    const count = defendersToUpgrade.length;
    const individualCost = getUpgradeCost(minLevel);
    const totalCost = Math.floor(individualCost * count * 0.8);

    if (gameState.coins >= totalCost && minLevel < 5) {
        gameState.coins -= totalCost;
        defendersToUpgrade.forEach(def => performUpgrade(def, false)); // Mejorar sin coste individual

        playSound(1400, 0.3, 'triangle', 0.25); // Sonido especial para mejora grupal
        updateUI();
        showUpgradePanel(mainDefender); // Refrescar el panel
    }
}

// --- NUEVO: Función centralizada para realizar una mejora ---
function performUpgrade(defender, chargeCost = true) {
    if (!defender || defender.level >= 5) return;

    const cost = getUpgradeCost(defender.level);
    if (!chargeCost || gameState.coins >= cost) {
        if (chargeCost) {
            gameState.coins -= cost;
        }
        defender.level++;

        switch (defender.level) {
            case 1: // Este caso no se da, ya que empiezan en 1, pero es para la mejora a nivel 2
                defender.shootInterval *= 0.85; // +15% cadencia
                break;
            case 2:
                // Aumentar vida máxima y curar proporcionalmente
                const oldMaxHealth = defender.maxHealth;
                defender.maxHealth *= 1.25; // +25% vida máxima

                // Curar 25% de la vida máxima (la nueva)
                const healAmount = Math.floor(defender.maxHealth * 0.25);
                defender.health = Math.min(defender.maxHealth, defender.health + healAmount);
                break;
            case 3:
                defender.damage *= 1.20; // +20% daño
                // Inicializar sistema de curación
                if (!defender.hasOwnProperty('lastDamageReceived')) {
                    defender.lastDamageReceived = 0;
                }
                if (!defender.hasOwnProperty('canHealOnKill')) {
                    defender.canHealOnKill = false;
                }
                if (!defender.hasOwnProperty('healingCanceled')) {
                    defender.healingCanceled = false;
                }
                break;
            case 4:
                defender.critChance = 0.20; // 20% de crítico
                break;
            case 5:
                // Resetear flag de curación cancelada
                defender.healingCanceled = false;
                // La habilidad se activa por código en la función `healDefendersOnKill`
                break;
        }

        // Actualizar la barra de vida en el DOM
        const healthPercent = (defender.health / defender.maxHealth) * 100;
        defender.healthFill.style.width = `${healthPercent}%`;

        // Cambiar color de la barra según el nivel
        updateDefenderHealthBarColor(defender);

        if (chargeCost) { // Solo hacer esto si es una mejora individual
            playSound(1200, 0.2, 'triangle', 0.2);
            updateUI();
            showUpgradePanel(defender); // Refrescar el panel con los nuevos stats
        }
    }
}


// ============================================
// MENSAJES EDUCATIVOS SOBRE EL AGUA
// ============================================
const waterEducationMessages = [
    "💧 El 71% de la Tierra es agua, pero solo el 2.5% es dulce y disponible para consumo humano.",
    "🌊 Una persona puede sobrevivir un mes sin comida, pero solo una semana sin agua.",
    "🚿 Una ducha de 5 minutos consume aproximadamente 100 litros de agua.",
    "💦 El 70% del agua dulce del planeta se utiliza en agricultura.",
    "🌍 Más de 2 mil millones de personas en el mundo no tienen acceso a agua potable segura.",
    "🐋 Los océanos producen más del 50% del oxígeno que respiramos.",
    "🏭 La contaminación industrial es responsable del 70% de la contaminación del agua en los países en desarrollo.",
    "🌱 Un solo árbol puede filtrar hasta 450 litros de agua al día a través de sus raíces.",
    "❄️ El 68.7% del agua dulce del mundo está congelada en glaciares y capas de hielo.",
    "💧 Cerrar el grifo mientras te cepillas los dientes puede ahorrar hasta 12 litros de agua al día.",
    "🌊 Los humedales actúan como 'riñones' naturales, filtrando contaminantes del agua.",
    "🐠 El 80% de las aguas residuales del mundo se vierten sin tratamiento.",
    "💰 Cada dólar invertido en agua y saneamiento genera $4.3 en beneficios económicos.",
    "🌏 Para 2025, dos tercios de la población mundial podría enfrentar escasez de agua.",
    "🚰 Una llave goteando puede desperdiciar hasta 30 litros de agua al día.",
    "🌿 Las plantas nativas requieren hasta un 50% menos agua que las especies exóticas.",
    "⚡ Se necesitan aproximadamente 140 litros de agua para producir una taza de café.",
    "🍔 Producir 1 kg de carne de res requiere 15,000 litros de agua.",
    "🌊 Los arrecifes de coral protegen las costas y filtran el agua del océano.",
    "💧 El cuerpo humano está compuesto de aproximadamente 60% de agua."
];

function getRandomWaterMessage() {
    const randomIndex = Math.floor(Math.random() * waterEducationMessages.length);
    return waterEducationMessages[randomIndex];
}

function gameOver() {
    gameState.gameRunning = false;
    gameState.waveActive = false;
    clearAllIntervals();

    playSound(120, 1.2, 'sawtooth', 0.3); // Sonido de Game Over: diente de sierra muy grave y largo

    // ANTI-CHEAT: Validar estado del juego antes de otorgar recompensas
    if (typeof AntiCheat !== 'undefined') {
        AntiCheat.validateGameState();
    }

    // Otorgar monedas especiales según oleada alcanzada
    const coinsEarned = Math.floor(gameState.wave / 5) + 1; // 1 moneda cada 5 oleadas + 1 base
    awardSpecialCoins(coinsEarned);

    // Generar mensaje educativo aleatorio
    const educationalMessage = getRandomWaterMessage();
    document.getElementById('gameMessage').classList.add('game-over');

    showMessage(
        "¡Isla Contaminada!",
        `Llegaste hasta la oleada ${gameState.wave}.<br><br><strong>⭐ +${coinsEarned} Monedas Especiales</strong><br><br><strong>💧 ¿Sabías que...?</strong><br>${educationalMessage}<br><br>¡Visita la tienda para desbloquear nuevos defensores!`,
        [
            { text: 'Volver al Lobby', action: backToMain, class: 'secondary' },
            { text: 'Reiniciar', action: restartGame }
        ]
    );
}

function restartGame() {
    // Detener el sonido de Game Over si está reproduciéndose
    if (typeof window.stopGameOverSound === 'function') {
        window.stopGameOverSound();
    }

    hideMessage();
    initializeGame();
}

function restartCurrentWave() {
    if (!gameState.gameRunning) return;

    // Detener TODOS los sonidos, incluyendo Game Over
    if (typeof window.stopGameOverSound === 'function') {
        window.stopGameOverSound();
    }
    if (typeof stopAllGameSounds === 'function') {
        stopAllGameSounds();
    }

    hideMessage(); // Asegurarse de que cualquier mensaje esté oculto
    document.getElementById('pauseMenu').style.display = 'none'; // Ocultar menú de pausa
    gameState.isPaused = false; // Reanudar el estado del juego


    // Eliminar todos los contaminantes del DOM y del array
    gameState.contaminators.forEach(c => {
        if (c.element && c.element.parentNode) {
            c.element.remove();
        }
    });
    gameState.contaminators = [];

    // Eliminar todos los proyectiles del DOM y del array
    gameState.projectiles.forEach(p => {
        if (p.element && p.element.parentNode) {
            p.element.remove();
        }
    });
    gameState.projectiles = [];

    // Eliminar todos los defensores actuales del tablero
    gameState.defenders.forEach(d => {
        if (d.element && d.element.parentNode) {
            d.element.remove();
        }
    });
    gameState.defenders = [];

    // Restaurar los defensores al estado que tenían al inicio de la oleada
    gameState.defendersAtWaveStart.forEach(defData => {
        // Re-colocar el defensor en el tablero sin coste
        const defenderType = allDefenderTypes[defData.type];
        const cell = document.querySelector(`[data-row="${defData.row}"][data-col="${defData.col}"]`);
        if (cell && defenderType) {
            const defenderElement = document.createElement('div');
            defenderElement.className = 'defender';
            defenderElement.textContent = defenderType.icon;

            const healthBar = document.createElement('div');
            healthBar.className = 'defender-health';
            const healthFill = document.createElement('div');
            healthFill.className = 'defender-health-fill';
            healthFill.style.width = '100%';
            healthBar.appendChild(healthFill);
            defenderElement.appendChild(healthBar);
            cell.appendChild(defenderElement);

            // Restaurar defensor con todas sus propiedades guardadas
            const now = Date.now();
            const restoredDefender = {
                type: defData.type,
                row: defData.row,
                col: defData.col,
                damage: defData.damage !== undefined ? defData.damage : (defenderType.damage || 0), // CORRECCIÓN: Asegurar damage válido
                range: defData.range !== undefined ? defData.range : (defenderType.range || 3),
                shootInterval: defData.shootInterval !== undefined ? defData.shootInterval : (defenderType.shootInterval || 1000),
                interval: defData.interval,
                level: defData.level || 1,
                critChance: defData.critChance || 0,
                // Inicializar tiempos para permitir acción inmediata
                lastShot: now - (defData.shootInterval || defenderType.shootInterval || 1000),
                lastAction: now - (defData.interval || 5000),
                // Referencias al DOM
                element: defenderElement,
                healthFill: healthFill,
                // Estado de salud
                health: defData.health || defenderType.health,
                maxHealth: defData.maxHealth || defenderType.health,
                // Propiedades adicionales
                lastDamageReceived: 0,
                canHealOnKill: defData.canHealOnKill || false,
                healingCanceled: false
            };
            gameState.defenders.push(restoredDefender);
        }
    });

    // Restablecer el estado del juego para la oleada actual
    gameState.coins = gameState.coinsAtWaveStart;
    gameState.health = gameState.healthAtWaveStart;
    gameState.contaminationLevel = 0;
    gameState.waveActive = false; // Se establecerá a true por startWave
    gameState.contaminatorsSpawned = 0;
    gameState.contaminatorsToSpawn = 0; // Se recalculará por startWave
    gameState.removalMode = false; // NEW: Resetear modo de eliminación

    updateUI();
    updateIslandContamination();
    updateCellHoverEffects(); // NEW: Actualizar efectos hover
    clearAllIntervals(); // Limpiar cualquier intervalo persistente (ej. spawnInterval)
    startWaveCountdown(); // Reiniciar la cuenta atrás para la oleada actual

    playSound(500, 0.3, 'square', 0.15); // Sonido de reiniciar oleada
}

function clearAllIntervals() {
    // --- CORRECCIÓN: Limpiar el intervalo de spawn de enemigos ---
    if (gameState.spawnIntervalId) {
        clearInterval(gameState.spawnIntervalId);
        gameState.spawnIntervalId = null;
    }
}

// Variables para delta time
let lastFrameTime = performance.now();
let deltaTime = 0;

function gameLoop(currentTime) {
    // Calcular delta time (tiempo transcurrido desde el último frame)
    deltaTime = (currentTime - lastFrameTime) / 1000; // En segundos
    lastFrameTime = currentTime;

    // Limitar delta time para evitar saltos grandes (ej: cuando se cambia de pestaña)
    deltaTime = Math.min(deltaTime, 0.1);

    if (gameState.gameRunning && !gameState.isPaused) {
        moveContaminators();
        updateProjectiles(); // OPTIMIZACIÓN: Actualizar todos los proyectiles en un solo bucle
        shoot();
        processStatusEffects(); // NUEVO: Procesar quemaduras, ralentizaciones, etc.
        processDefenderAbilities(); // NUEVO: Procesar habilidades de defensores (curación, auras)
    }
    requestAnimationFrame(gameLoop);
}

// Inicializar
function togglePause() {
    if (!gameState.gameRunning) return;

    gameState.isPaused = !gameState.isPaused;
    const pauseMenu = document.getElementById('pauseMenu');

    if (gameState.isPaused) {
        pauseMenu.style.display = 'flex';
        playSound(200, 0.1, 'square', 0.1);
    } else {
        pauseMenu.style.display = 'none';
        playSound(400, 0.1, 'square', 0.1);
    }
}


// Event Listeners para el login y registro
document.getElementById('loginBtn').addEventListener('click', handleLogin); // de usuarios.js
document.getElementById('registerBtn').addEventListener('click', handleRegister); // de usuarios.js

// Permitir login con la tecla Enter
document.getElementById('passwordInput').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});
document.getElementById('userPanelToggle').addEventListener('click', () => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});


// Revisa si hay una sesión guardada en localStorage al cargar la página
function initializeSession() {
    const savedUserJSON = localStorage.getItem('wacheck_user');
    if (savedUserJSON) {
        try {
            const user = JSON.parse(savedUserJSON);
            login(user); // Inicia sesión con el usuario guardado
        } catch (e) {
            console.error("Fallo al parsear datos de usuario guardados", e);
            loginAsGuest(); // Si falla, inicia como invitado
        }
    } else {
        loginAsGuest(); // Si no hay usuario guardado, inicia como invitado
    }
}

// Revisa la configuración de sonido guardada
function initializeSound() {
    const savedSoundSetting = localStorage.getItem('wacheck_soundEnabled');
    // Si no hay nada guardado, lo dejamos activado por defecto.
    // Si está guardado como "false", lo desactivamos.
    if (savedSoundSetting === 'false') {
        window.soundEnabled = false;
    } else {
        window.soundEnabled = true;
    }
    document.getElementById('soundToggle').textContent = window.soundEnabled ? '🔊' : '🔇';
}

// Inicializar
initializeSound(); // Cargar configuración de sonido
try { initializeSession(); } catch(e) { console.warn('[Wacheck] session init error:', e); } // siempre continúa
updateUnlockShop(); // Actualizar displays de monedas especiales
requestAnimationFrame(gameLoop); // Iniciar con timestamp correcto — SIEMPRE debe ejecutarse
if (window.soundEnabled) initAudio(); // Inicializar audio solo si está activado

// ============================================
// FUNCIONES DE CONTROL DE MENÚS
// ============================================

function openRewardsMenu() {
    closeAllMenus();
    document.getElementById('rewardsMenu').classList.add('active');
    document.getElementById('menuOverlay').classList.add('active');
    updateRunesDisplay();

    // Actualizar progreso de racha
    if (typeof rewardsState !== 'undefined') {
        const streakDisplay = document.getElementById('currentStreakDisplay');
        const claimedDisplay = document.getElementById('claimedDaysDisplay');

        if (streakDisplay) streakDisplay.textContent = rewardsState.dailyStreak;
        if (claimedDisplay) claimedDisplay.textContent = rewardsState.claimedDays.length;
    }
}

function openMissionsMenu() {
    closeAllMenus();
    document.getElementById('missionsMenu').classList.add('active');
    document.getElementById('menuOverlay').classList.add('active');
    updateMissionsUI();
}

function openUpgradesMenu() {
    closeAllMenus();
    document.getElementById('upgradesMenu').classList.add('active');
    document.getElementById('menuOverlay').classList.add('active');
    updateRunesDisplay();
    updateUpgradesUI();
}

function closeAllMenus() {
    document.querySelectorAll('.slide-menu').forEach(menu => {
        menu.classList.remove('active');
    });
    document.getElementById('menuOverlay').classList.remove('active');
}

function showBottomMenu() {
    document.getElementById('bottomMenu').style.display = 'flex';
}

function hideBottomMenu() {
    document.getElementById('bottomMenu').style.display = 'none';
}

// Aplicar estilo de menú guardado al cargar la página principal
window.addEventListener('load', () => {
    // Aplicar estilo de menú en la página principal
    const mainPage = document.getElementById('mainPage');
    if (mainPage && mainPage.style.display !== 'none') {
        if (typeof applyMenuStyle === 'function') {
            const savedStyle = localStorage.getItem('wacheck_menuStyle') || 'bottom';
            applyMenuStyle(savedStyle);
        } else {
            showBottomMenu(); // Fallback si no existe la función
        }
    }
});

// ============================================
// INTEGRACIÓN CON SISTEMA DE RECOMPENSAS
// ============================================

// Actualizar progreso de misiones durante el juego
function trackMissionProgress() {
    // Rastrear oleadas
    if (typeof updateMissionProgress === 'function') {
        updateMissionProgress('wave', gameState.wave);
    }
}

// Aplicar upgrades al inicio del juego
function applyGameUpgrades() {
    if (typeof rewardsState === 'undefined') return;

    // Aplicar monedas iniciales
    if (rewardsState.upgrades.startingCoins > 0) {
        gameState.coins += rewardsState.upgrades.startingCoins * 25;
    }

    // Aplicar boost de salud
    if (rewardsState.upgrades.healthBoost > 0) {
        gameState.health += rewardsState.upgrades.healthBoost * 5;
    }

    // Actualizar healthAtWaveStart después de aplicar upgrades
    gameState.healthAtWaveStart = gameState.health;

    updateUI();
}

// Aplicar multiplicador de monedas al ganar
function getCoinsWithMultiplier(baseCoins) {
    if (typeof rewardsState === 'undefined') return baseCoins;

    const multiplier = 1 + (rewardsState.upgrades.coinMultiplier * 0.1);
    return Math.floor(baseCoins * multiplier);
}

// Aplicar boost de daño a defensores
function getDamageWithUpgrade(baseDamage) {
    if (typeof rewardsState === 'undefined') return baseDamage;

    const boost = 1 + (rewardsState.upgrades.defenderDamage * 0.05);
    return Math.floor(baseDamage * boost);
}

// Verificar golpe crítico
function checkCriticalHit() {
    if (typeof rewardsState === 'undefined') return false;

    const critChance = rewardsState.upgrades.criticalChance * 0.03; // 3% por nivel
    return Math.random() < critChance;
}

// Reproducir sonido específico del defensor al atacar
function playDefenderShootSound(defenderType) {
    // Mapeo de tipos de defensores a nombres de sonido
    const soundMap = {
        'filter': 'shootFilter',
        'plant': 'shootPlant',
        'recycler': 'shootRecycler',
        'cleaner': 'shootCleaner',
        'crystal': 'shootCrystal',
        'solar': 'shootSolar',
        'coral': 'shootCoral',
        'shield': 'shoot',
        'tornado': 'shootTornado',
        'whale': 'shootWhale',
        'dualcannon': 'shootDualcannon',
        'incinerator': 'shootIncinerator',
        'cryomancer': 'shootCryomancer',
        'generator': null, // Generador no dispara
        'mortar': 'shootMortar',
        'stream': 'shootStream',
        'bubble': 'shootBubble',
        'amplifier': null, // Amplificador no dispara
        'wizard': 'shootWizard',
        'otter': 'shootOtter',
        'kraken': 'shootKraken',
        'golem': 'shootGolem',
        'antiTankArea': 'shootAntiTank'
    };

    const soundName = soundMap[defenderType];

    if (soundName && typeof playGameSound === 'function') {
        playGameSound(soundName);
    } else if (soundName === undefined) {
        // Si no hay mapeo específico, usar sonido genérico
        if (typeof playGameSound === 'function') {
            playGameSound('shoot');
        }
    }
}

// Actualizar display de runas (ambos lugares)
function updateRunesDisplay() {
    if (typeof rewardsState !== 'undefined') {
        const display1 = document.getElementById('runesDisplay');
        const display2 = document.getElementById('runesDisplay2');
        if (display1) display1.textContent = rewardsState.runes;
        if (display2) display2.textContent = rewardsState.runes;
    }
}

// ====================================
// SISTEMA DE TIENDA DE DEFENSORES
// ====================================

// Estructura de la tienda (defensores desbloqueables con monedas especiales)
// NOTA: stream, bubble, wind, earth NO están aquí porque ya vienen desbloqueados por defecto
window.shopDefenders = [
    // DAÑO BAJO-MEDIO
    { id: 'crystal', category: 'damage', name: 'Cristal', icon: '💎', cost: 2, desc: 'Cristal purificador de gran alcance', stats: { damage: 80, range: 6, shootInterval: 1800 } },
    { id: 'coral', category: 'damage', name: 'Coral', icon: '🪸', cost: 2, desc: 'Coral regenerativo y resistente', stats: { damage: 55, range: 5, shootInterval: 1100 } },
    { id: 'generator', category: 'special', name: 'Generador', icon: '💰', cost: 2, desc: 'Genera monedas extra durante la partida', stats: { damage: 0, range: 0, shootInterval: 0 } },
    { id: 'solar', category: 'damage', name: 'Solar', icon: '☀️', cost: 3, desc: 'Panel solar con ataque rápido', stats: { damage: 70, range: 4, shootInterval: 900 } },
    { id: 'cryomancer', category: 'damage', name: 'Criomante', icon: '❄️', cost: 3, desc: 'Lanza hielo que ralentiza a los enemigos', stats: { damage: 15, range: 6, shootInterval: 1800 } },
    
    // DAÑO MEDIO-ALTO
    { id: 'otter', category: 'damage', name: 'Nutria', icon: '🦦', cost: 4, desc: 'Defensor balanceado y resistente', stats: { damage: 60, range: 4, shootInterval: 1300 } },
    { id: 'dualcannon', category: 'damage', name: 'Cañón Doble', icon: '🔫', cost: 4, desc: 'Cañón que dispara ráfagas dobles', stats: { damage: 20, range: 5, shootInterval: 1500 } },
    { id: 'amplifier', category: 'special', name: 'Amplificador', icon: '🔊', cost: 4, desc: 'Aumenta el daño de los defensores en su fila', stats: { damage: 0, range: 0, shootInterval: 0 } },
    { id: 'shield', category: 'tank', name: 'Escudo', icon: '🛡️', cost: 4, desc: 'Escudo ultra resistente', stats: { damage: 40, range: 3, shootInterval: 2000, health: 500 } },
    
    // ALTO DAÑO
    { id: 'incinerator', category: 'damage', name: 'Incinerador', icon: '🔥', cost: 5, desc: 'Aplica quemaduras que dañan con el tiempo', stats: { damage: 10, range: 4, shootInterval: 2000 } },
    { id: 'tornado', category: 'damage', name: 'Tornado', icon: '🌪️', cost: 5, desc: 'Tornado de largo alcance', stats: { damage: 90, range: 7, shootInterval: 2200 } },
    { id: 'wizard', category: 'damage', name: 'Mago Eléctrico', icon: '🧙', cost: 5, desc: 'Ataque en cadena que salta a enemigos', stats: { damage: 40, range: 5, shootInterval: 2000 } },
    { id: 'mortar', category: 'damage', name: 'Mortero', icon: '💣', cost: 6, desc: 'Causa daño en un área pequeña', stats: { damage: 50, range: 8, shootInterval: 4000 } },
    { id: 'whale', category: 'damage', name: 'Ballena', icon: '🐋', cost: 6, desc: 'Ballena poderosa y tanque', stats: { damage: 100, range: 8, shootInterval: 2500 } },
    { id: 'golem', category: 'tank', name: 'Gólem', icon: '🗿', cost: 6, desc: 'Tanque con mucha vida pero poco daño', stats: { damage: 30, range: 3, shootInterval: 2500, health: 400 } },
    { id: 'kraken', category: 'damage', name: 'Kraken', icon: '🐙', cost: 7, desc: 'Ataque en cadena de gran alcance', stats: { damage: 70, range: 7, shootInterval: 2800 } }
];

// Estado de la tienda (qué defensores ha comprado el jugador)
// NOTA: var en lugar de let para evitar TDZ cuando login() los lee antes de esta línea
var purchasedDefenders = JSON.parse(localStorage.getItem('purchasedDefenders')) || [];
var specialCoins = parseInt(localStorage.getItem('specialCoins')) || 0;

// ====================================
// SISTEMA DE SELECCIÓN DE DEFENSORES PRE-PARTIDA
// ====================================

// CORRECCIÓN: Inicializar con los 8 defensores básicos si está vacío
window.selectedDefendersForGame = JSON.parse(localStorage.getItem('selectedDefendersForGame')) || ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];









// ====================================
// EXPORTAR FUNCIONES GLOBALMENTE
// ====================================
window.backToMain = backToMain;
window.togglePause = togglePause;
window.restartCurrentWave = restartCurrentWave;
window.hideMessage = hideMessage;
window.hideUpgradePanel = hideUpgradePanel;
window.upgradeSelectedDefender = upgradeSelectedDefender;
window.massUpgradeDefenders = massUpgradeDefenders;
window.showUpgradePanel = showUpgradePanel;
window.performUpgrade = performUpgrade;
window.gameState = gameState;

