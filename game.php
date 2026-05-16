<?php
// ============================================================
// game.php - Wacheck Tower Defense Game
// Requiere sesión activa (se redirige a inicio si no hay usuario)
// ============================================================
session_start();
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

// Si la API de sesión está disponible, verificar. Si no, dejar pasar
// (el JS se encarga de cargar el usuario desde localStorage).
// No bloqueamos acceso ya que usuarios invitados son válidos.
$fromGamePage = isset($_GET['from']) && $_GET['from'] === 'menu';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0b7d2b">
    <script>
        (function () {
            const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (!isLocal) {
                const noop = function() {};
                console.log = noop;
                console.info = noop;
                console.debug = noop;
            }

            // Guard para beacon de Cloudflare: quita attrs problemáticos y suprime error visual.
            function sanitizeBeaconScript(node) {
                if (!node || node.nodeType !== 1 || node.tagName !== 'SCRIPT') return;
                if (!node.src || node.src.indexOf('static.cloudflareinsights.com') === -1) return;
                node.removeAttribute('integrity');
                node.removeAttribute('crossorigin');
            }

            try {
                document.querySelectorAll('script[src*="static.cloudflareinsights.com"]').forEach(sanitizeBeaconScript);

                var _cfObs = new MutationObserver(function(muts) {
                    muts.forEach(function(m) {
                        m.addedNodes.forEach(sanitizeBeaconScript);
                    });
                });
                _cfObs.observe(document.documentElement, { childList: true, subtree: true });

                window.addEventListener('error', function(ev) {
                    var t = ev && ev.target;
                    if (t && t.tagName === 'SCRIPT' && t.src && t.src.indexOf('static.cloudflareinsights.com') !== -1) {
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                    }
                }, true);
            } catch (e) {}
        })();
    </script>
    <title>Wacheck — Defensores del Agua Pura</title>
    <link rel="shortcut icon" href="./img/vaporeon.jpg" type="image/x-icon">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/game-mobile-layout.css">
    <link rel="stylesheet" href="css/rewards.css">
    <link rel="stylesheet" href="css/tutorial.css">
    <link rel="stylesheet" href="css/menu-config.css">
    <!-- Lucide icons (local) -->
    <script src="js/lucide.min.js"></script>
    <style>
        [data-lucide]{
            display:inline-block;vertical-align:middle;
            width:1.1em;height:1.1em;stroke-width:2;flex-shrink:0;
        }
        .hud-icon { width:1em;height:1em;stroke-width:2.5; }
    </style>
</head>
<body>

<!-- ============================================================
     BOTÓN DE VOLUMEN (esquina superior derecha, siempre visible)
     ============================================================ -->
<button id="soundToggle" class="global-sound-toggle" onclick="toggleSound()" title="Activar/Desactivar Sonido">
    <i data-lucide="volume-2"></i>
</button>

<!-- ============================================================
     PANEL DE USUARIO (esquina superior izquierda)
     ============================================================ -->
<div id="userPanel" class="user-panel">
    <button id="userPanelToggle" class="user-panel-toggle"><i data-lucide="user"></i> <span id="usernameDisplay">Invitado</span></button>
    <div id="userDropdown" class="user-dropdown" style="display:none;">
        <div class="user-dropdown-info">
            <span id="dropdownUsername">Invitado</span>
            <span id="dropdownEmail"></span>
        </div>
        <div class="user-dropdown-stats">
            <span><i data-lucide="gem"></i> <span id="specialCoinsDisplay">0</span> esp.</span>
            <span><i data-lucide="mountain"></i> <span id="runesDisplay">0</span> runas</span>
        </div>
        <button onclick="openLoginModal()" id="loginBtn" class="dropdown-btn"><i data-lucide="key-round"></i> Cambiar cuenta</button>
        <button onclick="handleLogout()" class="dropdown-btn logout-btn"><i data-lucide="log-out"></i> Salir</button>
    </div>
</div>

<!-- ============================================================
     OVERLAY del menú (click fuera cierra menús)
     ============================================================ -->
<div id="menuOverlay" class="menu-overlay" onclick="closeAllMenus()"></div>

<!-- ============================================================
     PÃGINA PRINCIPAL / LOBBY
     ============================================================ -->
<div id="mainPage" class="main-page" style="display:none;">
    <div class="container">
        <div class="main-header">
            <h1 class="main-title">Wacheck</h1>
            <p class="main-subtitle">Defensores del Agua Pura</p>
            <div class="main-balance">
                <span><i data-lucide="gem"></i> <strong id="specialCoinsDisplay2">0</strong></span>
                <span><i data-lucide="mountain"></i> <strong id="runesDisplay2">0</strong></span>
            </div>
        </div>

        <!-- Botones de acción principales -->
        <div class="main-actions">
            <button id="btnStartGame" class="play-btn" onclick="openDefenderSelection()">
                <i data-lucide="play"></i> JUGAR
            </button>
            <button class="story-btn" onclick="showStoryMode()">
                <i data-lucide="book-open"></i> HISTORIA
            </button>
            <button class="calculator-btn" onclick="window.location.href='index.html#calculadora'">
                <i data-lucide="droplets"></i> CALCULADORA
            </button>
        </div>

        <!-- Configuración rápida -->
        <div id="settingsPanelToggle" class="settings-panel-toggle">
            <button onclick="openShop()" title="Tienda"><i data-lucide="shopping-cart"></i></button>
            <button onclick="openUpgradesMenu()" title="Mejoras"><i data-lucide="trending-up"></i></button>
            <button onclick="openMissionsMenu()" title="Misiones"><i data-lucide="clipboard-list"></i></button>
            <button onclick="window.location.href='game-page.html'" title="Menú"><i data-lucide="house"></i></button>
        </div>

        <!-- Formulario de login (in-game, para usuarios que llegan directo) -->
        <div id="inGameLoginSection" class="ingame-login" style="display:none;">
            <input type="text" id="usernameInput" class="auth-input" placeholder="Usuario">
            <input type="password" id="passwordInput" class="auth-input" placeholder="Contraseña">
            <div class="ingame-login-btns">
                <button id="loginBtn_ingame" onclick="handleLogin()" class="auth-button">Iniciar sesión</button>
                <button id="registerBtn" onclick="handleRegister()" class="auth-button">Registrarse</button>
                <button onclick="loginAsGuest()" class="auth-button-guest">Jugar como invitado</button>
            </div>
            <!-- Alias para que script.js encuentre #loginBtn -->
            <span id="loginBtn" style="display:none;"></span>
        </div>
    </div>
</div>

<!-- ============================================================
     MODAL DE SELECCIÓN DE DEFENSORES
     ============================================================ -->
<div id="defenderSelectionModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Selecciona tus Defensores</h2>
            <button class="modal-close" onclick="closeDefenderSelection()">X</button>
        </div>
        <p class="modal-hint">Elige hasta 6 defensores para llevar al campo de batalla</p>
        <p class="modal-selected-info">Seleccionados: <strong id="selectedCount">0</strong> / 6</p>
        <div id="availableGrid" class="available-grid">
            <!-- Llenado dinámicamente por script.js -->
        </div>
        <div class="modal-footer">
            <button id="btnConfirmDefenders" class="play-btn" onclick="startGameWithDefenders()">
                <i data-lucide="swords"></i> ¡A DEFENDER!
            </button>
        </div>
    </div>
</div>

<!-- ============================================================
     CONTENEDOR DEL JUEGO (oculto hasta que comienza la partida)
     ============================================================ -->
<div id="gameContainer" class="game-container" style="display:none;">

    <!-- HUD -->
    <div class="game-header">
        <button onclick="backToMain()" class="game-back-btn" title="Volver"><i data-lucide="arrow-left" class="hud-icon"></i> Volver</button>
        <span class="coins"><i data-lucide="coins" class="hud-icon"></i> <strong id="coinCount">100</strong></span>
        <span class="health"><i data-lucide="heart" class="hud-icon"></i> <strong id="healthCount">100</strong></span>
        <span class="special-coins-game"><i data-lucide="gem" class="hud-icon"></i> <strong id="specialCoins">0</strong></span>
        <span class="hud-wave-pill">Ola&nbsp;<strong id="waveCount">1</strong></span>
        <button onclick="toggleSound()" class="game-sound-toggle" id="gameSoundToggle" title="Sonido"><i data-lucide="volume-2" class="hud-icon"></i></button>
        <button onclick="togglePause()" class="pause-btn" title="Pausar"><i data-lucide="pause" class="hud-icon"></i></button>
    </div>

    <!-- Área de juego -->
    <div class="game-board-container">
        <!-- Banner de estado de oleada (overlay centrado sobre el tablero) -->
        <div id="waveComplete" class="wave-complete-banner" style="display:none;"></div>

        <!-- Tablero del juego: las filas y celdas se generan en script.js -->
        <div id="gameBoard" class="game-board"></div>

        <!-- Isla (zona final que los contaminantes deben alcanzar) -->
        <div id="island" class="island">
            <div class="island-icon"></div>
            <div class="island-health-bar">
                <div id="islandHealthFill" class="island-health-fill" style="width:100%"></div>
            </div>
        </div>
    </div>

    <!-- Tienda de defensores (barra inferior) -->
    <div id="defenderShop" class="shop">
        <!-- Llenado dinámicamente por updateDefenderShop() en script.js -->
    </div>

    <!-- Botones control en juego -->
    <div class="game-controls">
    </div>

</div><!-- /#gameContainer -->

<!-- ============================================================
     MENÚ DE PAUSA
     ============================================================ -->
<div id="pauseMenu" class="pause-menu" style="display:none;" onclick="togglePause()">
    <div class="pause-content" onclick="event.stopPropagation()">
        <div class="pause-header">
            <span class="pause-icon"><i data-lucide="pause-circle"></i></span>
            <h2>PAUSADO</h2>
        </div>
        <div class="pause-divider"></div>
        <div class="pause-actions">
            <button class="pause-btn-continue" onclick="togglePause()"><i data-lucide="play"></i> Continuar</button>
            <button class="pause-btn-retry" onclick="restartCurrentWave()"><i data-lucide="rotate-ccw"></i> Reintentar oleada</button>
            <button class="pause-btn-exit" onclick="backToMain()"><i data-lucide="house"></i> Menú principal</button>
        </div>
    </div>
</div>

<!-- ============================================================
     PANEL DE MEJORA DE DEFENSOR
     ============================================================ -->
<div id="upgradeOverlay" class="upgrade-overlay" style="display:none;" onclick="hideUpgradePanel()">
    <div id="upgradePanel" class="upgrade-panel" onclick="event.stopPropagation()">
        <div class="upgrade-header">
            <div id="upgradeDefenderIcon" class="upgrade-icon"></div>
            <div>
                <div id="upgradeDefenderName" class="upgrade-name">Defensor</div>
                <div id="upgradeDefenderStats" class="upgrade-stats"></div>
            </div>
            <button onclick="hideUpgradePanel()" class="close-upgrade-panel">X</button>
        </div>
        <div id="upgradeNextLevelInfo" class="upgrade-next-info"></div>
        <div class="upgrade-actions">
            <button id="upgradeButton" class="upgrade-btn" onclick="upgradeSelectedDefender()"><i data-lucide="arrow-up-circle"></i> Mejorar</button>
            <button id="groupUpgradeButton" class="upgrade-btn" style="display:none;background:linear-gradient(135deg,#8b5cf6,#7c3aed);" onclick="performGroupUpgrade()"><i data-lucide="arrow-up-circle"></i> Mejorar todos</button>
            <button class="remove-btn" onclick="removeSelectedDefender()"><i data-lucide="trash-2"></i> Eliminar (50%)</button>
        </div>
    </div>
</div>

<!-- ============================================================
     MENSAJE DEL JUEGO (modal de avisos)
     ============================================================ -->
<div id="gameMessage" class="game-message-overlay" style="display:none;">
    <div class="game-message-box">
        <h3 id="messageTitle">Mensaje</h3>
        <div id="messageText" class="game-message-text"></div>
        <div id="messageButtons" class="game-message-buttons"></div>
    </div>
</div>

<!-- ============================================================
     MODO HISTORIA
     ============================================================ -->
<div id="storyContainer" class="story-container" style="display:none;">
    <div class="story-wrapper">
        <div class="story-header">
            <button class="back-btn" onclick="backToMainFromStory()">← Volver</button>
            <h1>Modo Historia</h1>
            <div class="story-coins"><i data-lucide="gem"></i> <span id="storyCoins">0</span></div>
        </div>

        <div class="story-progress">
            Capítulo <span id="currentChapter">1</span> de <span id="totalChapters">5</span>
        </div>

        <div class="story-content">
            <div class="story-mission">
                <div class="mission-banner">
                    <h2 id="missionTitle">Misión I</h2>
                    <p id="missionSubtitle" class="mission-subtitle"></p>
                </div>

                <div id="missionStory" class="mission-story">
                    <!-- Párrafos de historia llenados dinámicamente -->
                </div>

                <div class="mission-objectives">
                    <h3>Objetivos</h3>
                    <div id="objectiveList" class="objective-list">
                        <!-- Llenado dinámicamente -->
                    </div>
                </div>

                <div class="mission-rewards">
                    <h3>Recompensas</h3>
                    <div class="reward-list">
                        <!-- Llenado dinámicamente -->
                    </div>
                </div>

                <div class="mission-educational">
                    <h3> Dato sobre el agua</h3>
                    <div class="educational-content">
                        <!-- Llenado dinámicamente -->
                    </div>
                </div>

                <div class="mission-actions">
                    <p id="educationalWarning" class="educational-warning" style="display:none;">
                         Lee el dato educativo antes de comenzar
                    </p>
                    <button id="startMissionBtn" class="play-btn" onclick="startStoryMission()">
                        <i data-lucide="play"></i> Comenzar Misión
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================================
     MENÚ: TIENDA DE DESBLOQUEO
     ============================================================ -->
<div id="shopMenu" class="side-menu" style="display:none;">
    <div class="side-menu-header">
        <h2><i data-lucide="shopping-cart"></i> Tienda</h2>
        <span> <span id="shopSpecialCoins">0</span></span>
        <button onclick="closeAllMenus()">X</button>
    </div>
    <div class="shop-filters">
        <button id="shopLowCost"  class="filter-btn active" onclick="filterShop('low-cost')">Económicos</button>
        <button id="shopDamage"   class="filter-btn"        onclick="filterShop('damage')">Daño</button>
        <button id="shopTank"     class="filter-btn"        onclick="filterShop('tank')">Tanques</button>
        <button id="shopSpecial"  class="filter-btn"        onclick="filterShop('special')">Especiales</button>
    </div>
    <div id="unlockGrid" class="unlock-grid">
        <!-- Llenado dinámicamente por updateUnlockShop() en script.js -->
    </div>
</div>

<!-- ============================================================
     MENÚ: MEJORAS PERMANENTES
     ============================================================ -->
<div id="upgradesMenu" class="side-menu" style="display:none;">
    <div class="side-menu-header">
        <h2><i data-lucide="trending-up"></i> Mejoras</h2>
        <button onclick="closeAllMenus()">X</button>
    </div>
    <div id="upgradesContainer" class="upgrades-container">
        <!-- Llenado dinámicamente -->
    </div>
</div>

<!-- ============================================================
     MENÚ: RECOMPENSAS Y RACHA
     ============================================================ -->
<div id="rewardsMenu" class="side-menu" style="display:none !important;">
    <div class="side-menu-header">
        <h2>ðŸŽ Recompensas</h2>
        <button onclick="closeAllMenus()">X</button>
    </div>
    <div class="rewards-stats">
        <div> Racha: <strong id="currentStreakDisplay">0</strong> días</div>
        <div> Reclamados: <strong id="claimedDaysDisplay">0</strong></div>
    </div>
    <span id="claimedCountBadge" class="claimed-badge"></span>
    <div id="claimedMissionsContainer" class="claimed-missions"></div>
    <div id="dailyRewardPopup" style="display:none;"></div>
</div>

<!-- ============================================================
     MENÚ: MISIONES
     ============================================================ -->
<div id="missionsMenu" class="side-menu" style="display:none;">
    <div class="side-menu-header">
        <h2><i data-lucide="clipboard-list"></i> Misiones</h2>
        <button onclick="closeAllMenus()">X</button>
    </div>
    <div id="missionsContainer" class="missions-container">
        <!-- Llenado dinámicamente -->
    </div>
</div>

<!-- ============================================================
     MENÚ INFERIOR DE NAVEGACIÓN
     ============================================================ -->
<nav id="bottomMenu" class="bottom-menu" style="display:none;">
    <button onclick="openShop()"><i data-lucide="shopping-cart"></i></button>
    <button onclick="openUpgradesMenu()"><i data-lucide="trending-up"></i></button>
    <button onclick="openMissionsMenu()"><i data-lucide="clipboard-list"></i></button>
    <button onclick="window.location.href='game-page.html'"><i data-lucide="house"></i></button>
</nav>

<!-- ============================================================
     SCRIPTS — Orden de carga:
     1. Audio y utilidades base
     2. Sistema de usuarios legacy (in-game login)
     3. Sistemas de juego (rewards, achievements, tutorial, historia)
     4. Anti-cheat y sesión
     5. Módulos de datos (config, defenders, contaminants, projectiles, ui)
     6. Script principal del juego
     7. Módulo de engine (loop)
     ============================================================ -->
<script src="sounds.js?v=18"></script>
<script src="usuarios.js?v=18"></script>
<script src="rewards.js?v=18"></script>
<script src="achievements.js?v=18"></script>
<script src="tutorial.js?v=18"></script>
<script src="historia.js?v=18"></script>
<script src="anti-cheat.js?v=18"></script>
<script src="session-manager.js?v=18"></script>

<!-- Módulos de datos (antes de script.js para que los globals estén disponibles) --><script src="js/game/sprites.js?v=18"></script><script src="js/game/config.js?v=19"></script>
<script src="js/game/contaminants.js?v=19"></script>
<script src="js/game/projectiles.js?v=18"></script>
<script src="js/game/runtime-state.js?v=18"></script>
<script src="js/game/ui.js?v=18"></script>
<script src="js/game/projectiles-service.js?v=18"></script>
<script src="js/game/ui-system.js?v=18"></script>
<script src="js/game/shop-system.js?v=19"></script>
<script src="js/game/panel-manager.js?v=1"></script>
<script src="js/game/mobile-layout.js?v=1"></script>

<!-- Motor principal — define allDefenderTypes hardcodeado (fallback) -->
<script src="script.js?v=18"></script>

<!-- Módulo de defensores: puede sobreescribir allDefenderTypes con datos del servidor -->
<script src="js/game/defenders.js?v=20"></script>

<!-- Engine loop (después de script.js para que gameLoop ya esté definido) -->
<script src="js/game/engine.js?v=18"></script>

<script>
// ============================================================
// Inicialización específica de game.php
// ============================================================

// Función puente: abre el modal de selección de defensores
// (En script.js, initGame() se llama cuando se confirma la selección)
function openDefenderSelection() {
    const modal = document.getElementById('defenderSelectionModal');
    if (modal) {
        modal.style.display = 'flex';
        if (typeof updateAvailableDefendersGrid === 'function') {
            updateAvailableDefendersGrid();
        }
    }
}

function closeDefenderSelection() {
    const modal = document.getElementById('defenderSelectionModal');
    if (modal) modal.style.display = 'none';
}

function startGameWithDefenders() {
    closeDefenderSelection();
    // Iniciar juego directamente (initGame no existe — es initializeGame en script.js)
    if (typeof startGameDirectly === 'function') {
        startGameDirectly();
    } else if (typeof initializeGame === 'function') {
        document.getElementById('mainPage').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        initializeGame();
    }
}

// Función para abrir la tienda desde el menú
function openShop() {
    if (window.WacheckPanels && typeof window.WacheckPanels.openMenu === 'function') {
        window.WacheckPanels.openMenu('shopMenu', function () {
            if (typeof updateUnlockShop === 'function') updateUnlockShop();
            refreshIcons();
        });
        return;
    }

    if (typeof closeAllMenus === 'function') closeAllMenus();
    const m = document.getElementById('shopMenu');
    if (m) {
        m.classList.add('active');
        const overlay = document.getElementById('menuOverlay');
        if (overlay) overlay.classList.add('active');
        if (typeof updateUnlockShop === 'function') updateUnlockShop();
        refreshIcons();
    }
}

function openUpgradesMenu() {
    if (window.WacheckPanels && typeof window.WacheckPanels.openMenu === 'function') {
        window.WacheckPanels.openMenu('upgradesMenu', function () {
            if (typeof updateRunesDisplay === 'function') updateRunesDisplay();
            if (typeof updateUpgradesUI === 'function') updateUpgradesUI();
            refreshIcons();
        });
        return;
    }

    if (typeof closeAllMenus === 'function') closeAllMenus();
    const m = document.getElementById('upgradesMenu');
    if (m) {
        m.classList.add('active');
        const overlay = document.getElementById('menuOverlay');
        if (overlay) overlay.classList.add('active');
        if (typeof updateRunesDisplay === 'function') updateRunesDisplay();
        if (typeof updateUpgradesUI === 'function') updateUpgradesUI();
        refreshIcons();
    }
}

function openMissionsMenu() {
    if (window.WacheckPanels && typeof window.WacheckPanels.openMenu === 'function') {
        window.WacheckPanels.openMenu('missionsMenu', function () {
            if (typeof updateMissionsUI === 'function') updateMissionsUI();
            refreshIcons();
        });
        return;
    }

    if (typeof closeAllMenus === 'function') closeAllMenus();
    const m = document.getElementById('missionsMenu');
    if (m) {
        m.classList.add('active');
        const overlay = document.getElementById('menuOverlay');
        if (overlay) overlay.classList.add('active');
        if (typeof updateMissionsUI === 'function') updateMissionsUI();
        refreshIcons();
    }
}

// Volver al lobby desde el juego → redirige a game-page.html (el lobby real)
function backToMain() {
    if (gameState) {
        gameState.gameRunning = false;
        gameState.isPaused    = false;
    }
    localStorage.removeItem('wacheck-play-from-game-page');
    if (typeof saveProgressToServer === 'function') saveProgressToServer();
    window.location.href = 'game-page.html';
}

function handleLogout() {
    localStorage.removeItem('wacheck_user');
    if (typeof SessionManager !== 'undefined') SessionManager.clearSession();
    window.location.href = 'index.html';
}

// === AUTO-START: este bloque corre sincrono, despues de todos los scripts ===
(function() {
    var flag      = localStorage.getItem('wacheck-play-from-game-page');
    var defenders = localStorage.getItem('wacheck-selected-defenders');

    if (flag === 'true') {
        // Limpiar flag para que recargar la página muestre el lobby
        localStorage.removeItem('wacheck-play-from-game-page');

        if (defenders) {
            // Validar que al menos 1 ID seleccionado exista en allDefenderTypes
            var basics = ["filter","plant","recycler","cleaner","stream","bubble","wind","earth"];
            try {
                var ids = JSON.parse(defenders);
                var valid = ids.filter(function(id){ return !!allDefenderTypes[id]; });
                if (valid.length === 0) {
                    localStorage.setItem('wacheck-selected-defenders', JSON.stringify(basics));
                    localStorage.setItem('selectedDefendersForGame', JSON.stringify(basics));
                }
            } catch(e) {
                localStorage.setItem('wacheck-selected-defenders', JSON.stringify(basics));
                localStorage.setItem('selectedDefendersForGame', JSON.stringify(basics));
            }
            startGameDirectly();
        } else {
            // Sin defensores seleccionados → volver a selección
            window.location.replace('game-page.html');
        }
    } else {
        // Sin flag de partida activa → redirigir al menú principal
        window.location.replace('game-page.html');
    }
}());

// Refrescar iconos cuando se abran menús dinámicos
window.refreshIcons = function(){ if (typeof lucide !== 'undefined') lucide.createIcons(); };

// Inicializar iconos — esperar a que todo el DOM esté pintado
window.addEventListener('load', function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    // Sincronizar icono de volumen con preferencia guardada
    const savedSound = localStorage.getItem('wacheck_soundEnabled');
    if (savedSound === 'false') {
        const ico = document.querySelector('#soundToggle [data-lucide]');
        if (ico) { ico.setAttribute('data-lucide', 'volume-x'); lucide.createIcons(); }
    }
});
// También llamar de inmediato en caché caliente (load ya habría disparado)
if (document.readyState === 'complete' && typeof lucide !== 'undefined') {
    lucide.createIcons();
}
</script>
</body>
</html>

