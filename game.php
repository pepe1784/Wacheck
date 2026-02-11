<?php
// Verificar sesión antes de cargar la página
require_once 'api/check-session.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Defensores del Agua</title>
    <link rel="stylesheet" href="css/main.css?v=3.2">
    <link rel="stylesheet" href="css/rewards.css?v=1.1">
    <link rel="stylesheet" href="css/menu-config.css?v=1.4">
    <link rel="stylesheet" href="css/tutorial.css?v=1.0">
    <link rel="shortcut icon" href="./img/vaporeon.jpg" type="image/x-icon">
</head>

<body>
    <!-- Botón de volumen GLOBAL (fuera del juego) -->
    <button class="global-sound-toggle" onclick="toggleSound()" id="soundToggle">🔊</button>

    <!-- Botón de Tienda (inferior derecha) -->
    <button class="shop-toggle-btn" onclick="openShopMenu()">🏪</button>

    <!-- Panel Lateral Izquierdo -->
    <div class="left-sidebar">
        <!-- Panel de Usuario -->
        <div class="user-panel" id="userPanel">
            <button class="user-panel-toggle" id="userPanelToggle">👤</button>
            <div class="user-info-dropdown" id="userDropdown">
                <div id="userLogin">
                    <h3>Ingresa tu nombre</h3>
                    <input type="text" id="usernameInput" placeholder="Nombre de usuario..." class="login-input"
                        autocomplete="username">
                    <input type="password" id="passwordInput" placeholder="Contraseña (mín. 4 car.)" class="login-input"
                        autocomplete="current-password">
                    <button id="loginBtn" class="login-button">Iniciar Sesión</button>
                    <button id="registerBtn" class="login-button"
                        style="background: #3498db; margin-top: 5px;">Registrar Nuevo</button>
                </div>
                <div id="userInfo" style="display: none;"></div>
            </div>
        </div>

        <!-- Botón de Configuración del Menú -->
        <div class="settings-panel-toggle" id="settingsPanelToggle">
            <button class="settings-btn" onclick="toggleSettingsPanel()">⚙️</button>
        </div>

        <!-- Menú Vertical Desplegable -->
        <div class="vertical-menu-dropdown" id="verticalMenuDropdown">
            <h3 style="margin: 0 0 15px 0; color: #ecf0f1; text-align: center;">⚙️ Configuración</h3>

            <!-- Estilo de Menú -->
            <div class="settings-section">
                <h4>📱 Estilo de Menú</h4>
                <div class="menu-style-options-vertical">
                    <button class="menu-style-btn active" onclick="changeMenuStyle('bottom')" data-style="bottom">
                        <div class="style-preview">
                            <div class="preview-bar bottom"></div>
                        </div>
                        <span>Barra Inferior</span>
                    </button>
                    <button class="menu-style-btn" onclick="changeMenuStyle('floating')" data-style="floating">
                        <div class="style-preview">
                            <div class="preview-dot"></div>
                            <div class="preview-menu vertical"></div>
                        </div>
                        <span>Menú Flotante</span>
                    </button>
                </div>
            </div>

            <!-- Cerrar Sesión -->
            <div class="settings-section" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                <button class="logout-btn" onclick="handleLogout()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                    <span style="font-size: 20px;">🚪</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>

        <!-- Menú Flotante Integrado -->
        <div class="floating-menu-integrated" id="floatingMenuContainer" style="display: none;">
            <button class="floating-menu-toggle-integrated" id="floatingMenuToggle" onclick="toggleFloatingMenu()">
                <span class="menu-icon">☰</span>
            </button>
            <div class="floating-menu-buttons-integrated" id="floatingMenuButtons">
                <button class="floating-menu-btn-integrated" onclick="openRewardsMenu(); closeFloatingMenu();"
                    title="Recompensas Diarias">
                    <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
                    </svg>
                    <span class="btn-text">Recompensas</span>
                    <div class="notification-dot" id="rewardsDotFloating" style="display: none;"></div>
                </button>
                <button class="floating-menu-btn-integrated" onclick="openMissionsMenu(); closeFloatingMenu();"
                    title="Misiones Diarias">
                    <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M9 11L12 14L22 4" />
                        <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" />
                    </svg>
                    <span class="btn-text">Misiones</span>
                    <div class="notification-dot" id="missionsDotFloating" style="display: none;"></div>
                </button>
                <button class="floating-menu-btn-integrated" onclick="openUpgradesMenu(); closeFloatingMenu();"
                    title="Mejoras Permanentes">
                    <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M12 20V10" />
                        <path d="M18 20V4" />
                        <path d="M6 20V16" />
                        <circle cx="12" cy="10" r="2" />
                        <circle cx="18" cy="4" r="2" />
                        <circle cx="6" cy="16" r="2" />
                    </svg>
                    <span class="btn-text">Mejoras</span>
                </button>
                <button class="floating-menu-btn-integrated" onclick="openAchievementsMenu(); closeFloatingMenu();"
                    title="Logros">
                    <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <circle cx="12" cy="8" r="7" />
                        <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" />
                    </svg>
                    <span class="btn-text">Logros</span>
                    <div class="notification-dot" id="achievementsDotFloating" style="display: none;"></div>
                </button>
            </div>
        </div>
    </div>

    <div class="container" style="display: none;">
        <div class="main-page" id="mainPage" style="display: none;">
            <!-- Banner Institucional -->
            <div class="institutional-banner">
                <a href="https://www.ucol.mx/" target="_blank" rel="noopener" class="logo-link">
                    <img src="./IMG_institucion/EscudoPNG2Lizq/PNG 2L izq/UdeC_2L izq Verde 364.png" alt="Universidad de Colima" class="ucol-logo">
                </a>
                <div class="institutional-info">
                    <h2 class="institutional-title">Universidad de Colima</h2>
                    <a href="https://portal.ucol.mx/bach25/" target="_blank" rel="noopener" class="bach-link">
                        <span class="bach-name">Bachillerato 25</span>
                    </a>
                    <p class="project-subtitle">🌍 Proyecto de Educación Ambiental</p>
                </div>
            </div>
            
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-icon">💧</div><!--🌊-->
                <h1 class="hero-title">Wacheck</h1>
                <p class="hero-subtitle">Defensores del Agua</p>
                <p class="hero-description">
                    Únete a la misión de proteger nuestras fuentes de agua de los contaminantes.
                    <br>¡Defiende tu isla y salva el planeta!
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="play-btn primary" onclick="openShopMenu()">
                    <span class="btn-icon">🎮</span>
                    <span class="btn-text">¡Jugar Ahora!</span>
                    <span class="btn-shine"></span>
                </button>
                <button class="story-btn" onclick="showStoryMode()">
                    <span class="btn-icon">📖</span>
                    <span class="btn-text">Modo Historia</span>
                </button>
                <button class="calculator-btn" onclick="showWaterCalculator()">
                    <span class="btn-icon">💧</span>
                    <span class="btn-text">Calculadora de Agua</span>
                </button>
                <button class="tutorial-button" onclick="restartTutorial()">
                    <span class="btn-icon">📚</span>
                    <span class="btn-text">Tutorial del Juego</span>
                </button>
            </div>

            <!-- Footer Institucional -->
            <div class="institutional-footer">
                <p class="footer-text">
                    © 2025 Universidad de Colima - Bachillerato 25 | Todos los derechos reservados
                </p>
                <p class="footer-links">
                    <a href="https://www.ucol.mx/" target="_blank" rel="noopener">Sitio UdeC</a> | 
                    <a href="https://portal.ucol.mx/bach25/" target="_blank" rel="noopener">Portal Bachillerato 25</a>
                </p>
            </div>

        </div>
    </div>

    <!-- NUEVA SECCIÓN: Calculadora de Agua -->
    <div class="calculator-container" id="calculatorContainer">
        <div class="calculator-header">
            <button class="back-btn" onclick="backToMainFromCalculator()">← Volver</button>
            <h1>🌊 Calculadora de Consumo de Agua 🌊</h1>
        </div>

        <div class="calculator-content">
            <div class="activity-section">
                <div class="activity-header">
                    <span class="activity-icon">🚿</span>
                    <span class="activity-title">Ducha</span>
                </div>
                <div class="activity-inputs">
                    <label>Duchas por día:</label>
                    <input type="number" id="showers" min="0" max="10" value="1">
                    <span class="water-amount">= <span id="shower-total">80</span> litros</span>
                </div>
                <div class="activity-inputs">
                    <label>Minutos por ducha:</label>
                    <input type="number" id="shower-minutes" min="1" max="30" value="10">
                    <span></span>
                </div>
                <div class="tips">
                    <div class="tips-title">💡 Consejos de ahorro:</div>
                    <div>• Reduce el tiempo de ducha a 5 minutos • Cierra el agua mientras te enjabonas • Usa regadera
                        de bajo flujo</div>
                </div>
            </div>

            <div class="activity-section">
                <div class="activity-header">
                    <span class="activity-icon">🦷</span>
                    <span class="activity-title">Higiene Personal</span>
                </div>
                <div class="activity-inputs">
                    <label>Lavarse los dientes (veces):</label>
                    <input type="number" id="teeth" min="0" max="5" value="3">
                    <span class="water-amount">= <span id="teeth-total">6</span> litros</span>
                </div>
                <div class="activity-inputs">
                    <label>Lavarse las manos (veces):</label>
                    <input type="number" id="hands" min="0" max="20" value="8">
                    <span class="water-amount">= <span id="hands-total">4</span> litros</span>
                </div>
                <div class="tips">
                    <div class="tips-title">💡 Consejos de ahorro:</div>
                    <div>• Cierra el grifo mientras te cepillas • Usa un vaso con agua • Lávate las manos solo el tiempo
                        necesario</div>
                </div>
            </div>

            <div class="activity-section">
                <div class="activity-header">
                    <span class="activity-icon">🍽️</span>
                    <span class="activity-title">Cocina</span>
                </div>
                <div class="activity-inputs">
                    <label>Lavar platos (veces):</label>
                    <input type="number" id="dishes" min="0" max="5" value="2">
                    <span class="water-amount">= <span id="dishes-total">40</span> litros</span>
                </div>
                <div class="activity-inputs">
                    <label>Cocinar/Beber (litros):</label>
                    <input type="number" id="cooking" min="0" max="20" value="5">
                    <span class="water-amount">= <span id="cooking-total">5</span> litros</span>
                </div>
                <div class="tips">
                    <div class="tips-title">💡 Consejos de ahorro:</div>
                    <div>• Llena el fregadero con agua en vez del grifo abierto • Reutiliza agua de cocción para plantas
                        • Usa lavavajillas lleno</div>
                </div>
            </div>

            <div class="activity-section">
                <div class="activity-header">
                    <span class="activity-icon">👕</span>
                    <span class="activity-title">Lavandería</span>
                </div>
                <div class="activity-inputs">
                    <label>Cargas de lavadora:</label>
                    <input type="number" id="laundry" min="0" max="3" value="1">
                    <span class="water-amount">= <span id="laundry-total">80</span> litros</span>
                </div>
                <div class="tips">
                    <div class="tips-title">💡 Consejos de ahorro:</div>
                    <div>• Lava cargas completas • Usa ciclo corto cuando sea posible • Lavadora eficiente ahorra 40% de
                        agua</div>
                </div>
            </div>

            <div class="activity-section">
                <div class="activity-header">
                    <span class="activity-icon">🚗</span>
                    <span class="activity-title">Limpieza</span>
                </div>
                <div class="activity-inputs">
                    <label>Lavar carro (veces/semana):</label>
                    <input type="number" id="car" min="0" max="7" value="0">
                    <span class="water-amount">= <span id="car-total">0</span> litros</span>
                </div>
                <div class="activity-inputs">
                    <label>Regar plantas (minutos):</label>
                    <input type="number" id="plants" min="0" max="60" value="10">
                    <span class="water-amount">= <span id="plants-total">30</span> litros</span>
                </div>
                <div class="tips">
                    <div class="tips-title">💡 Consejos de ahorro:</div>
                    <div>• Lava el carro con cubetas (40L vs 200L) • Riega plantas temprano o tarde • Usa agua reciclada
                        para limpiar</div>
                </div>
            </div>

            <div class="calculator-controls">
                <button class="btn" onclick="calculateWater()">🔄 Recalcular</button>
                <button class="btn reset" onclick="resetCalculator()">🗑️ Limpiar</button>
            </div>

            <div class="calculator-results" id="calculator-results">
                <div class="total-consumption">
                    <span id="total-water">245</span> litros/día
                </div>
                <div class="cost-estimate">
                    Costo estimado: $<span id="estimated-cost">2.45</span> pesos/día
                </div>
                <div class="cost-estimate">
                    Costo mensual: $<span id="monthly-cost">73.50</span> pesos
                </div>
                <div class="classification moderado" id="classification">
                    Consumo Moderado
                </div>
            </div>

            <div class="savings-tips" id="savings-tips">
                <h3>🌱 Recomendaciones Personalizadas</h3>
                <div id="personalized-tips">
                    <!-- Se llenarán dinámicamente -->
                </div>
            </div>

            <div class="calculator-finish">
                <button class="finish-btn" onclick="finishCalculator()" id="finishBtn">✅ Finalizar Cálculo</button>
            </div>
        </div>
    </div>
    <!-- FIN CALCULADORA -->

    <!-- NUEVA SECCIÓN: Modo Historia -->
    <div class="story-container" id="storyContainer" style="display: none;">
        <div class="story-wrapper">
            <div class="story-header">
                <button class="story-back-btn" onclick="backToMainFromStory()">← Volver</button>
                <h1>📖 Modo Historia: La Crisis del Agua 🌊</h1>
            </div>

            <div class="story-content">
                <div class="story-progress">
                    <div class="chapter-indicator">
                        Capítulo <span id="currentChapter">1</span> de <span id="totalChapters">5</span>
                    </div>
                    <div class="story-coins">🏆 Recompensas: <span id="storyCoins">0</span></div>
                </div>

                <div class="story-mission" id="currentStoryMission">
                    <div class="mission-banner">
                        <div class="mission-title" id="missionTitle">Misión 1: El Despertar</div>
                        <div class="mission-subtitle" id="missionSubtitle">Aprende los fundamentos de la defensa
                            acuática</div>
                    </div>

                    <div class="mission-story" id="missionStory">
                        <p>El año es 2030. La contaminación ha alcanzado niveles críticos y las últimas reservas de agua
                            limpia están bajo ataque. Tú eres el guardián de una de las últimas islas puras del planeta.
                        </p>
                        <p>Tu misión es simple pero vital: proteger esta fuente de agua usando defensores ecológicos
                            mientras aprendes sobre la conservación del agua.</p>
                    </div>

                    <div class="mission-objectives" id="missionObjectives">
                        <h3>🎯 Objetivos:</h3>
                        <div class="objective-list" id="objectiveList">
                            <div class="objective incomplete" data-obj="0">
                                <span class="objective-icon">❌</span>
                                <span class="objective-text">Sobrevive 3 oleadas usando solo Filtros</span>
                                <span class="objective-reward">+1 ⭐</span>
                            </div>
                            <div class="objective incomplete" data-obj="1">
                                <span class="objective-icon">❌</span>
                                <span class="objective-text">No pierdas más de 20 puntos de vida</span>
                                <span class="objective-reward">+1 ⭐</span>
                            </div>
                            <div class="objective incomplete" data-obj="2">
                                <span class="objective-icon">❌</span>
                                <span class="objective-text">Lee el consejo educativo</span>
                                <span class="objective-reward">+1 ⭐</span>
                            </div>
                        </div>
                    </div>

                    <div class="mission-rewards" id="missionRewards">
                        <h3>🏆 Recompensas por Completar:</h3>
                        <div class="reward-list">
                            <div class="reward">⭐ 3 Monedas Especiales</div>
                            <div class="reward">🔓 Desbloquear nuevo defensor</div>
                            <div class="reward">📚 Conocimiento sobre filtración de agua</div>
                        </div>
                    </div>

                    <div class="mission-educational" id="missionEducational">
                        <h3>💡 ¿Sabías que...?</h3>
                        <div class="educational-content">
                            <p><strong>Los filtros de carbón activado</strong> pueden eliminar más del 99% de las
                                bacterias y virus del agua, así como químicos nocivos como el cloro y pesticidas.</p>
                            <p>En la vida real, estos filtros se usan en plantas de tratamiento de agua y sistemas
                                domésticos para proporcionar agua potable segura.</p>
                            <button class="read-tip-btn" onclick="markEducationalRead()">✓ He leído esto</button>
                        </div>
                    </div>

                    <div class="mission-actions">
                        <button class="start-mission-btn" onclick="startStoryMission()" id="startMissionBtn">🚀 Comenzar
                            Misión</button>
                        <span class="educational-warning" id="educationalWarning" style="display:none;">
                            ⚠️ Primero debes leer el contenido educativo y hacer clic en "✓ He leído esto"
                        </span>
                        <button class="skip-mission-btn" onclick="skipStoryMission()" id="skipMissionBtn"
                            style="display:none;">⏭️ Saltar (sin recompensas)</button>
                        <button class="chapter-select-btn" onclick="showChapterSelection()" id="chapterSelectBtn">📚
                            Seleccionar Capítulo</button>
                    </div>
                </div>

                <div class="chapter-selection" id="chapterSelection" style="display:none;">
                    <button class="story-back-btn" onclick="hideChapterSelection()">← Volver</button>
                    <h2>Seleccionar Capítulo</h2>
                    <div class="chapter-grid" id="chapterGrid">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- FIN MODO HISTORIA -->

    <div class="game-container" id="gameContainer" style="display: block;">
        <div class="game-header">
            <button class="game-back-btn" onclick="window.location.href='game-page.html'">← Volver</button>
            <button class="pause-btn" onclick="togglePause()">⏸️ Pausa</button>
            <button class="restart-wave-btn" onclick="restartCurrentWave()">🔄 Reiniciar Oleada</button>
            <button class="game-sound-toggle" onclick="toggleSound()" id="gameSoundToggle">🔊</button>
            <div class="coins">💰 <span id="coinCount">100</span></div>
            <div class="special-coins-game" title="Monedas especiales ganadas en esta partida">⭐ <span id="specialCoins">0</span></div>
            <div class="health">🏝️ <span id="healthCount">100</span></div>
        </div>

        <div class="wave-info">
            <div>Oleada: <span id="waveCount">1</span></div>
            <div class="wave-status" id="waveStatus">Preparando...</div>
        </div>

        <div class="shop" id="defenderShop">
            <!-- Se llenarán con JavaScript -->
        </div>

        <div class="game-board-container">
            <div class="island" id="island">🏝️</div>
            <div class="game-board" id="gameBoard"></div>
        </div>
    </div>

    <div class="message" id="gameMessage">
        <span class="close-message" onclick="hideMessage()">&times;</span>
        <h2 id="messageTitle"></h2>
        <p id="messageText"></p>
        <div id="messageButtons"></div>
    </div>

    <!-- NUEVO: Overlay para cerrar el panel de mejora al hacer clic fuera -->
    <div class="upgrade-overlay" id="upgradeOverlay" onclick="hideUpgradePanel()" style="display: none;"></div>

    <!-- NUEVO: Panel de Mejora de Defensor (la verdadera tienda de mejoras en el juego) -->
    <div class="upgrade-panel" id="upgradePanel">
        <div class="upgrade-header">
            <span id="upgradeDefenderIcon"></span>
            <h3 id="upgradeDefenderName"></h3>
            <button class="close-upgrade-panel" onclick="hideUpgradePanel()">&times;</button>
        </div>
        <div class="upgrade-stats" id="upgradeDefenderStats"></div>
        <div class="upgrade-next-level" id="upgradeNextLevelInfo"></div>
        <button class="upgrade-button" id="upgradeButton" onclick="upgradeSelectedDefender()">Mejorar</button>
        <button class="upgrade-button group-upgrade" id="groupUpgradeButton" onclick="massUpgradeDefenders()">Mejora
            Grupal</button>
    </div>
    <!-- FIN Panel de Mejora -->

    <div class="pause-menu" id="pauseMenu">
        <h2>Juego en Pausa</h2>
        <div class="pause-buttons">
            <button class="pause-btn-continue" onclick="togglePause()">Continuar</button>
            <button class="pause-btn-retry" onclick="restartCurrentWave()">Reintentar Ola</button>
            <button class="pause-btn-exit" onclick="backToMain()">Salir</button>
        </div>
    </div>

    <div class="wave-complete" id="waveComplete"></div>
    </div>

    <!-- MENU INFERIOR CON ICONOS -->
    <div class="bottom-menu" id="bottomMenu" style="display: none !important;">
        <button class="menu-icon-btn" onclick="openRewardsMenu()" id="rewardsBtn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
            <div class="notification-dot" id="rewardsDot" style="display: none;"></div>
        </button>

        <button class="menu-icon-btn" onclick="openMissionsMenu()">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11L12 14L22 4" />
                <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" />
            </svg>
            <div class="notification-dot" id="missionsDot" style="display: none;"></div>
        </button>

        <button class="menu-icon-btn" onclick="openUpgradesMenu()">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20V16" />
                <circle cx="12" cy="10" r="2" />
                <circle cx="18" cy="4" r="2" />
                <circle cx="6" cy="16" r="2" />
            </svg>
        </button>

        <button class="menu-icon-btn" onclick="openAchievementsMenu()" id="achievementsBtn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="7" />
                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" />
            </svg>
            <div class="notification-dot" id="achievementsDot" style="display: none;"></div>
        </button>
    </div>

    <!-- OVERLAY PARA MENUS -->
    <div class="menu-overlay" id="menuOverlay" onclick="closeAllMenus()"></div>

    <!-- MENU RECOMPENSAS DIARIAS -->
    <div class="slide-menu" id="rewardsMenu">
        <div class="menu-header">
            <h2><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
                </svg> Recompensas Diarias</h2>
            <button class="menu-close-btn" onclick="closeAllMenus()">✕</button>
        </div>
        <div class="menu-content">
            <div class="runes-display">
                <span style="font-size: 24px;">🔮</span>
                <span>Runas:</span>
                <span id="runesDisplay">0</span>
            </div>
            <p style="color: #95a5a6; margin-bottom: 20px;">
                Inicia sesión cada día para reclamar recompensas increíbles. ¡El día 7 desbloqueas el Antitanque de
                Área!
            </p>
            <button class="claim-reward-btn" onclick="showDailyRewardPopup(true)" style="margin-bottom: 20px;">
                🎁 Ver Racha de Días
            </button>
            <div
                style="background: rgba(52, 152, 219, 0.2); border: 2px solid rgba(52, 152, 219, 0.4); border-radius: 12px; padding: 15px; margin-top: 15px;">
                <h3 style="color: #ecf0f1; margin: 0 0 10px 0; font-size: 16px;">📊 Tu Progreso</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;" id="currentStreakDisplay">0
                        </div>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">Racha Actual</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;" id="claimedDaysDisplay">0</div>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">Días Reclamados</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MENU MISIONES -->
    <div class="slide-menu" id="missionsMenu">
        <div class="menu-header">
            <h2><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    style="vertical-align: middle;">
                    <path d="M9 11L12 14L22 4" />
                    <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" />
                </svg> Misiones Diarias</h2>
            <button class="menu-close-btn" onclick="closeAllMenus()">✕</button>
        </div>
        <div class="menu-content">
            <p style="color: #95a5a6; margin-bottom: 20px;">
                Completa misiones adaptadas a tu progreso para ganar runas y monedas especiales.
            </p>

            <!-- SECCIÓN: Misiones Activas -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #3498db; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">📋</span> Misiones Activas
                </h3>
                <div id="missionsContainer">
                    <!-- Se llenará con JavaScript -->
                </div>
            </div>

            <!-- SECCIÓN: Misiones Reclamadas -->
            <div>
                <h3 style="color: #2ecc71; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">✅</span> Reclamadas Hoy
                    <span id="claimedCountBadge"
                        style="background: #27ae60; padding: 2px 10px; border-radius: 12px; font-size: 14px; margin-left: auto;">0</span>
                </h3>
                <div id="claimedMissionsContainer">
                    <!-- Se llenará con JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- MENU UPGRADES -->
    <div class="slide-menu" id="upgradesMenu">
        <div class="menu-header">
            <h2><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    style="vertical-align: middle;">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20V16" />
                    <circle cx="12" cy="10" r="2" />
                    <circle cx="18" cy="4" r="2" />
                    <circle cx="6" cy="16" r="2" />
                </svg> Mejoras Permanentes</h2>
            <button class="menu-close-btn" onclick="closeAllMenus()">✕</button>
        </div>
        <div class="menu-content">
            <div class="runes-display">
                <span style="font-size: 24px;">🔮</span>
                <span>Runas:</span>
                <span id="runesDisplay2">0</span>
            </div>
            <p style="color: #95a5a6; margin-bottom: 20px;">
                Usa runas para mejorar tus habilidades permanentemente.
            </p>
            <div id="upgradesContainer">
                <!-- Se llenará con JavaScript -->
            </div>
        </div>
    </div>

    <!-- MENU LOGROS/ACHIEVEMENTS -->
    <div class="slide-menu" id="achievementsMenu">
        <div class="menu-header">
            <h2><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    style="vertical-align: middle;">
                    <circle cx="12" cy="8" r="7" />
                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" />
                </svg> Logros</h2>
            <button class="menu-close-btn" onclick="closeAllMenus()">✕</button>
        </div>
        <div class="menu-content">
            <div class="achievements-stats">
                <div class="achievement-stat">
                    <div class="stat-value" id="achievementsTotalPoints">0</div>
                    <div class="stat-label">Puntos Totales</div>
                </div>
                <div class="achievement-stat">
                    <div class="stat-value"><span id="achievementsUnlocked">0</span>/<span
                            id="achievementsTotal">0</span></div>
                    <div class="stat-label">Logros Desbloqueados</div>
                </div>
                <div class="achievement-stat">
                    <div class="stat-value"><span id="achievementsPercentage">0</span>%</div>
                    <div class="stat-label">Completado</div>
                </div>
            </div>
            <div id="achievementsContainer">
                <!-- Se llenará con JavaScript -->
            </div>
        </div>
    </div>

    <!-- NUEVA TIENDA DE DEFENSORES -->
    <div class="slide-menu shop-menu" id="shopMenu" onclick="closeShopMenuOnOutsideClick(event)">
        <div class="menu-header">
            <h2>🏪 Tienda de Defensores</h2>
            <button class="menu-close-btn" onclick="closeShopMenu()">✕</button>
        </div>
        <div class="menu-content">
            <div class="shop-balance">
                <span class="balance-label">⭐ Monedas Especiales:</span>
                <span class="balance-value" id="shopSpecialCoins">0</span>
            </div>

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

    <!-- MODAL DE SELECCIÓN DE DEFENSORES PRE-PARTIDA -->
    <div class="defender-selection-modal" id="defenderSelectionModal">
        <div class="selection-container">
            <div class="selection-header">
                <h2>⚔️ Selecciona tus Defensores</h2>
                <button class="selection-close-btn" onclick="hideDefenderSelectionModal()" title="Volver al menú">✕</button>
            </div>
            <div class="selection-subheader">
                <p>Elige exactamente 8 defensores para esta partida</p>
            </div>

            <div class="selection-content">
                <div class="selected-defenders-area">
                    <h3>✅ Seleccionados (<span id="selectedCount">0</span>/8)</h3>
                    <div class="selected-grid" id="selectedGrid">
                        <div class="defender-slot empty" data-slot="0">?</div>
                        <div class="defender-slot empty" data-slot="1">?</div>
                        <div class="defender-slot empty" data-slot="2">?</div>
                        <div class="defender-slot empty" data-slot="3">?</div>
                        <div class="defender-slot empty" data-slot="4">?</div>
                        <div class="defender-slot empty" data-slot="5">?</div>
                        <div class="defender-slot empty" data-slot="6">?</div>
                        <div class="defender-slot empty" data-slot="7">?</div>
                    </div>
                    <button class="btn-start-game" onclick="confirmDefenderSelection()" disabled id="btnStartGame">
                        🎮 Comenzar Partida
                    </button>
                </div>

                <div class="available-defenders-area">
                    <h3>📦 Disponibles</h3>
                    <div class="available-grid" id="availableGrid"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="sounds.js?v=1.6"></script>
    <script src="menu_config.js?v=1.7"></script>
    <script src="usuarios.js?v=1.3"></script>
    <script src="calculadora.js?v=1.2"></script>
    <script src="historia.js?v=1.3"></script>
    <script src="rewards.js?v=1.0"></script>
    <script src="achievements.js?v=1.0"></script>
    <script src="tutorial.js?v=1.0"></script>
    <script src="script.js?v=3.6"></script>
    
    <!-- Auto-start para modo historia y game-page -->
    <script>
        // Detectar si viene del modo historia con auto-start o desde game-page.html
        window.addEventListener('DOMContentLoaded', function() {
            const autoStart = localStorage.getItem('wacheck-auto-start');
            const playFromGamePage = localStorage.getItem('wacheck-play-from-game-page');
            const hash = window.location.hash;
            
            if (autoStart === 'true' && hash.startsWith('#auto-start-wave-')) {
                // Extraer número de oleada del hash
                const wave = parseInt(hash.replace('#auto-start-wave-', ''));
                
                // Obtener datos del modo historia
                const storyData = localStorage.getItem('wacheck-story-mode');
                const selectedDefenders = localStorage.getItem('wacheck-selected-defenders');
                
                console.log('🎮 Auto-iniciando modo historia:', { wave, storyData, selectedDefenders });
                
                // Limpiar la bandera de auto-start
                localStorage.removeItem('wacheck-auto-start');
                
                // Esperar a que el juego esté listo
                setTimeout(() => {
                    if (typeof window.startGame === 'function') {
                        // Cargar defensores seleccionados
                        if (selectedDefenders) {
                            try {
                                const defenders = JSON.parse(selectedDefenders);
                                if (window.selectedDefendersForGame) {
                                    window.selectedDefendersForGame = defenders;
                                }
                                localStorage.setItem('selectedDefendersForGame', selectedDefenders);
                                console.log('🛡️ Defensores cargados para modo historia:', defenders);
                            } catch (e) {
                                console.error('Error parsing defenders:', e);
                            }
                        }
                        
                        // Configurar oleada inicial
                        if (typeof window.currentWave !== 'undefined') {
                            window.currentWave = wave - 1; // Se incrementará al iniciar
                        }
                        
                        // Si hay datos de historia, configurar modo historia
                        if (storyData) {
                            try {
                                const story = JSON.parse(storyData);
                                if (window.gameState) {
                                    window.gameState.storyMode = {
                                        active: true,
                                        chapter: story.chapter,
                                        wave: story.wave,
                                        isBoss: story.isBoss,
                                        chapterTitle: story.chapterTitle,
                                        boss: story.boss
                                    };
                                    console.log('📖 Modo historia activado:', window.gameState.storyMode);
                                }
                            } catch (e) {
                                console.error('Error parsing story data:', e);
                            }
                        }
                        
                        // Si hay defensores seleccionados, configurarlos
                        if (selectedDefenders) {
                            try {
                                const defenders = JSON.parse(selectedDefenders);
                                console.log('🛡️ Defensores pre-seleccionados:', defenders);
                                // Aquí podrías pre-seleccionar los defensores si tu juego lo permite
                            } catch (e) {
                                console.error('Error parsing defenders:', e);
                            }
                        }
                        
                        // Iniciar el juego automáticamente
                        window.startGame();
                    } else {
                        console.warn('startGame function no disponible aún');
                    }
                }, 1000); // Esperar 1 segundo para que todo esté cargado
            }
            
            // Detectar regreso desde game-page.html con defensores seleccionados
            if (playFromGamePage === 'true') {
                const selectedDefenders = localStorage.getItem('wacheck-selected-defenders');
                
                console.log('🎮 Regresando desde game-page.html con defensores:', selectedDefenders);
                
                // Limpiar la bandera
                localStorage.removeItem('wacheck-play-from-game-page');
                
                // Esperar a que el juego esté listo e iniciarlo automáticamente
                setTimeout(() => {
                    if (typeof window.startGameDirectly === 'function') {
                        window.startGameDirectly();
                    } else {
                        console.warn('startGameDirectly no disponible');
                    }
                }, 500);
            }
        });
    </script>
</body>

</html>