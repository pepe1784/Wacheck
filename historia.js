// === MODO HISTORIA ===

// Estado del modo historia
let storyState = {
    currentChapter: 1,
    currentMission: 1,
    completedChapters: [],
    storyCoins: 0,
    unlockedChapters: [1], // Capítulo 1 desbloqueado por defecto
    missionObjectives: [],
    isStoryMode: false,
    educationalRead: false
};

// Definición de capítulos y misiones
const storyChapters = {
    1: {
        name: "El Despertar",
        description: "Aprende los fundamentos de la defensa acuática",
        unlockRequirement: null,
        missions: [
            {
                id: 1,
                title: "Misión 1: Primeros Pasos",////Primeros Pasos 
                subtitle: "Aprende a usar los defensores básicos",
                story: [
                    "El año es 2030. La contaminación ha alcanzado niveles críticos y las últimas reservas de agua limpia están bajo ataque.",
                    "Tú eres el guardián de una de las últimas islas puras del planeta. Tu misión es proteger esta fuente de agua usando defensores ecológicos."
                ],
                objectives: [
                    { text: "Sobrevive 3 oleadas usando solo Filtros", reward: 1, completed: false },
                    { text: "No pierdas más de 20 puntos de vida", reward: 1, completed: false },
                    { text: "Lee el consejo educativo", reward: 1, completed: false }
                ],
                rewards: {
                    coins: 3,
                    unlocks: ["stream"],
                    educational: true
                },
                educational: {
                    title: "Los filtros de carbón activado",
                    content: "Los filtros de carbón activado pueden eliminar más del 99% de las bacterias y virus del agua, así como químicos nocivos como el cloro y pesticidas. En la vida real, estos filtros se usan en plantas de tratamiento de agua y sistemas domésticos."
                },
                restrictions: {
                    allowedDefenders: ["filter"],
                    maxWaves: 3,
                    startingCoins: 100
                }
            }
        ]
    },
    2: {
        name: "La Naturaleza Contraataca",
        description: "Descubre el poder de los defensores naturales",
        unlockRequirement: { chapter: 1, completed: true },
        missions: [
            {
                id: 2,
                title: "Misión 2: Poder Verde",
                subtitle: "Aprende sobre la bioremediación",
                story: [
                    "Has demostrado tu valía con los filtros básicos. Ahora es momento de aprender sobre el poder de la naturaleza.",
                    "Las plantas no solo son hermosas, sino que son purificadores naturales increíblemente efectivos."
                ],
                objectives: [
                    { text: "Usa al menos 3 Plantas en tu defensa", reward: 2, completed: false },
                    { text: "Sobrevive 5 oleadas", reward: 1, completed: false },
                    { text: "Completa sin usar Filtros", reward: 2, completed: false }
                ],
                rewards: {
                    coins: 5,
                    unlocks: ["coral"],
                    educational: true
                },
                educational: {
                    title: "Bioremediación natural",
                    content: "Las plantas acuáticas y los humedales actúan como filtros biológicos naturales. Absorben nitratos, fosfatos y otros contaminantes del agua, mientras producen oxígeno. Los humedales pueden procesar hasta 1000 litros de agua contaminada por metro cuadrado por día."
                },
                restrictions: {
                    allowedDefenders: ["plant", "filter"],
                    maxWaves: 5,
                    requiredDefenders: { plant: 3 },
                    bannedDefenders: ["filter"] // Para el objetivo bonus
                }
            }
        ]
    },
    3: {
        name: "Tecnología Sostenible",
        description: "Combina tecnología verde con defensa natural",
        unlockRequirement: { chapter: 2, completed: true },
        missions: [
            {
                id: 3,
                title: "Misión 3: Fusión Tecnológica",
                subtitle: "Reciclar para proteger",
                story: [
                    "La crisis se intensifica. Necesitas tecnología más avanzada, pero debe ser sostenible.",
                    "Los recicladores pueden transformar los desechos en energía limpia para fortalecer tus defensas."
                ],
                objectives: [
                    { text: "Construye al menos 5 Recicladores", reward: 2, completed: false },
                    { text: "Genera más de 200 monedas durante la partida", reward: 2, completed: false },
                    { text: "Sobrevive 7 oleadas", reward: 1, completed: false }
                ],
                rewards: {
                    coins: 7,
                    unlocks: ["generator", "solar"],
                    educational: true
                },
                educational: {
                    title: "Economía circular del agua",
                    content: "Los sistemas de reciclaje de agua pueden procesar y reutilizar hasta el 95% del agua residual. Las plantas de tratamiento modernas usan tecnología de membranas y procesos biológicos para producir agua tan limpia que puede volver a ser potable."
                },
                restrictions: {
                    allowedDefenders: ["recycler", "plant", "filter"],
                    maxWaves: 7,
                    requiredDefenders: { recycler: 5 }
                }
            }
        ]
    },
    4: {
        name: "La Purificación Avanzada",
        description: "Domina los sistemas de purificación más avanzados",
        unlockRequirement: { chapter: 3, completed: true },
        missions: [
            {
                id: 4,
                title: "Misión 4: Pureza Absoluta",
                subtitle: "Tecnología de punta para la crisis final",
                story: [
                    "Los contaminantes se han vuelto más resistentes. Necesitas la tecnología más avanzada.",
                    "Los purificadores representan lo mejor de la ingeniería ambiental moderna."
                ],
                objectives: [
                    { text: "Derrota al menos 2 contaminantes 'Tóxicos'", reward: 3, completed: false },
                    { text: "Mantén tu isla 100% pura por 5 oleadas", reward: 2, completed: false },
                    { text: "Usa todos los tipos de defensores disponibles", reward: 2, completed: false }
                ],
                rewards: {
                    coins: 10,
                    unlocks: ["crystal", "wizard"],
                    educational: true
                },
                educational: {
                    title: "Tecnologías de purificación avanzada",
                    content: "Los sistemas de ósmosis inversa pueden eliminar hasta el 99.9% de todos los contaminantes, incluyendo virus, bacterias, metales pesados y químicos. Un sistema doméstico puede procesar 300 litros de agua pura al día usando solo la presión del agua."
                },
                restrictions: {
                    allowedDefenders: ["cleaner", "recycler", "plant", "filter"],
                    maxWaves: 8,
                    minDefenderTypes: 4
                }
            }
        ]
    },
    5: {
        name: "El Guardián Definitivo",
        description: "Enfréntate al desafío final",
        unlockRequirement: { chapter: 4, completed: true },
        missions: [
            {
                id: 5,
                title: "Misión 5: El Último Bastión",
                subtitle: "Protege la última gota de agua pura",
                story: [
                    "Esta es la batalla final. Todos los contaminantes del mundo convergen en tu isla.",
                    "Eres la última esperanza de la humanidad para preservar el agua limpia. No puedes fallar."
                ],
                objectives: [
                    { text: "Derrota al Leviatán (jefe final)", reward: 5, completed: false },
                    { text: "Sobrevive 12 oleadas", reward: 3, completed: false },
                    { text: "Completa sin perder vida", reward: 5, completed: false }
                ],
                rewards: {
                    coins: 15,
                    unlocks: ["kraken", "golem"],
                    educational: true,
                    special: "Título: Guardián del Agua"
                },
                educational: {
                    title: "El futuro del agua",
                    content: "Con la tecnología actual, podríamos purificar toda el agua del planeta. El desafío no es técnico, sino de voluntad política y económica. Cada persona puede marcar la diferencia ahorrando agua, evitando contaminar fuentes naturales y apoyando tecnologías limpias."
                },
                restrictions: {
                    allowedDefenders: "all",
                    maxWaves: 12,
                    bossWave: true
                }
            }
        ]
    }
};

// Funciones principales del modo historia
function showStoryMode() {
    if (typeof playSound === 'function') playSound(400, 0.1, 'square', 0.15);
    
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('settingsPanelToggle').style.display = 'none'; // Ocultar configuración
    document.getElementById('storyContainer').style.display = 'block';
    
    // Cerrar menú desplegable de configuración si está abierto
    if (typeof closeSettingsPanel === 'function') {
        closeSettingsPanel();
    }
    
    loadStoryProgress();
    updateStoryUI();
    loadCurrentMission();
}

function backToMainFromStory() {
    if (typeof playSound === 'function') playSound(300, 0.1, 'square', 0.15);
    
    // Resetear modo historia
    storyState.isStoryMode = false;
    
    // Detener el juego si está corriendo
    if (typeof gameState !== 'undefined' && gameState.gameRunning) {
        gameState.gameRunning = false;
        gameState.waveActive = false;
    }
    
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userPanel').style.display = 'block';
    document.getElementById('settingsPanelToggle').style.display = 'block'; // Volver a mostrar configuración
    document.getElementById('storyContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    
    // Cerrar menú desplegable de configuración si está abierto
    if (typeof closeSettingsPanel === 'function') {
        closeSettingsPanel();
    }
    
    // CORRECCIÓN: Aplicar el estilo de menú guardado en lugar de siempre mostrar el inferior
    if (typeof applyMenuStyle === 'function') {
        const savedStyle = localStorage.getItem('wacheck_menuStyle') || 'bottom';
        applyMenuStyle(savedStyle);
    } else if (typeof showBottomMenu === 'function') {
        showBottomMenu(); // Fallback
    }
    
    saveStoryProgress();
}

function loadStoryProgress() {
    // Verificar si gameState existe
    if (typeof gameState === 'undefined') {
        return;
    }
    
    // Cargar del usuario actual si está logueado
    if (gameState.currentUser && gameState.currentUser.id !== 0) {
        const savedStory = localStorage.getItem(`wacheck_story_${gameState.currentUser.id}`);
        if (savedStory) {
            storyState = { ...storyState, ...JSON.parse(savedStory) };
        }
    } else {
        // Usuario invitado - cargar del localStorage general
        const savedStory = localStorage.getItem('wacheck_story_guest');
        if (savedStory) {
            storyState = { ...storyState, ...JSON.parse(savedStory) };
        }
    }
}

function saveStoryProgress() {
    const saveKey = gameState.currentUser && gameState.currentUser.id !== 0 
        ? `wacheck_story_${gameState.currentUser.id}` 
        : 'wacheck_story_guest';
    
    localStorage.setItem(saveKey, JSON.stringify({
        currentChapter: storyState.currentChapter,
        currentMission: storyState.currentMission,
        completedChapters: storyState.completedChapters,
        storyCoins: storyState.storyCoins,
        unlockedChapters: storyState.unlockedChapters
    }));
}

function updateStoryUI() {
    document.getElementById('currentChapter').textContent = storyState.currentChapter;
    document.getElementById('totalChapters').textContent = Object.keys(storyChapters).length;
    document.getElementById('storyCoins').textContent = storyState.storyCoins;
}

function loadCurrentMission() {
    const chapter = storyChapters[storyState.currentChapter];
    const mission = chapter.missions[storyState.currentMission - 1];
    
    if (!mission) return;
    
    // Actualizar UI de la misión
    document.getElementById('missionTitle').textContent = mission.title;
    document.getElementById('missionSubtitle').textContent = mission.subtitle;
    
    // Historia
    const storyDiv = document.getElementById('missionStory');
    storyDiv.innerHTML = mission.story.map(p => `<p>${p}</p>`).join('');
    
    // Objetivos
    const objectiveList = document.getElementById('objectiveList');
    objectiveList.innerHTML = mission.objectives.map((obj, index) => `
        <div class="objective incomplete" data-obj="${index}">
            <span class="objective-icon">❌</span>
            <span class="objective-text">${obj.text}</span>
            <span class="objective-reward">+${obj.reward} ⭐</span>
        </div>
    `).join('');
    
    // Recompensas
    const rewardsList = mission.rewards;
    document.querySelector('.reward-list').innerHTML = `
        <div class="reward">⭐ ${rewardsList.coins} Monedas Especiales</div>
        ${rewardsList.unlocks ? rewardsList.unlocks.map(def => `<div class="reward">🔓 Desbloquear ${allDefenderTypes[def]?.name || def}</div>`).join('') : ''}
        ${rewardsList.educational ? '<div class="reward">📚 Conocimiento sobre conservación del agua</div>' : ''}
        ${rewardsList.special ? `<div class="reward">🏆 ${rewardsList.special}</div>` : ''}
    `;
    
    // Contenido educativo
    document.querySelector('.educational-content').innerHTML = `
        <p><strong>${mission.educational.title}:</strong> ${mission.educational.content}</p>
        <button class="read-tip-btn" onclick="markEducationalRead()" ${storyState.educationalRead ? 'disabled' : ''}>
            ${storyState.educationalRead ? '✓ Leído' : '✓ He leído esto'}
        </button>
    `;
    
    // Resetear estado de objetivos de la misión
    storyState.missionObjectives = mission.objectives.map(obj => ({ ...obj }));
    storyState.educationalRead = false;
    
    // Bloquear botón de comenzar si hay contenido educativo y no se ha leído
    const startBtn = document.getElementById('startMissionBtn');
    const warningMsg = document.getElementById('educationalWarning');
    
    if (mission.rewards.educational && !storyState.educationalRead) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
        if (warningMsg) warningMsg.style.display = 'block';
    } else {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        if (warningMsg) warningMsg.style.display = 'none';
    }
}

function markEducationalRead() {
    storyState.educationalRead = true;
    const readBtn = document.querySelector('.read-tip-btn');
    readBtn.textContent = '✓ Leído';
    readBtn.disabled = true;
    
    // Desbloquear botón de comenzar misión
    const startBtn = document.getElementById('startMissionBtn');
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
    
    // Ocultar mensaje de advertencia
    const warningMsg = document.getElementById('educationalWarning');
    if (warningMsg) warningMsg.style.display = 'none';
    
    // Mostrar feedback visual
    if (typeof playSound === 'function') playSound(600, 0.1, 'sine', 0.15);
    
    // Completar objetivo educativo si existe
    const educationalObj = storyState.missionObjectives.findIndex(obj => 
        obj.text.toLowerCase().includes('lee') || obj.text.toLowerCase().includes('educativo')
    );
    
    if (educationalObj !== -1 && !storyState.missionObjectives[educationalObj].completed) {
        completeObjective(educationalObj);
    }
}

function startStoryMission() {
    const chapter = storyChapters[storyState.currentChapter];
    const mission = chapter.missions[storyState.currentMission - 1];
    
    if (!mission) return;
    
    // Verificar si hay contenido educativo y no se ha leído
    if (mission.rewards.educational && !storyState.educationalRead) {
        // Mostrar mensaje de advertencia
        const educationalSection = document.querySelector('.educational-content');
        educationalSection.style.border = '3px solid #e74c3c';
        educationalSection.style.animation = 'shake 0.5s';
        
        // Mostrar mensaje temporal
        showMessage(
            '📚 ¡Espera!',
            'Por favor, lee el contenido educativo y haz clic en "✓ He leído esto" antes de continuar.',
            [{ text: 'Entendido', action: 'hideMessage()' }]
        );
        
        if (typeof playSound === 'function') playSound(200, 0.2, 'square', 0.1);
        
        // Quitar el borde después de 2 segundos
        setTimeout(() => {
            educationalSection.style.border = '';
            educationalSection.style.animation = '';
        }, 2000);
        
        return; // No continuar con el inicio de la misión
    }
    
    if (typeof playSound === 'function') playSound(500, 0.15, 'triangle', 0.2);
    
    // Configurar el juego para el modo historia
    storyState.isStoryMode = true;
    
    // Aplicar restricciones de la misión
    applyMissionRestrictions(mission.restrictions);
    
    // Ocultar modo historia y mostrar juego
    document.getElementById('storyContainer').style.display = 'none';
    document.getElementById('userPanel').style.display = 'none'; // Ocultar panel de usuario
    document.getElementById('settingsPanelToggle').style.display = 'none'; // Ocultar configuración
    document.getElementById('gameContainer').style.display = 'block';
    
    // Cerrar menú desplegable de configuración si está abierto
    if (typeof closeSettingsPanel === 'function') {
        closeSettingsPanel();
    }
    
    // Ocultar el menú inferior durante el modo historia
    if (typeof hideBottomMenu === 'function') {
        hideBottomMenu();
    }
    
    // Inicializar el juego con configuración de historia
    initializeStoryGame(mission);
}

function applyMissionRestrictions(restrictions) {
    // Guardar configuración original
    storyState.originalConfig = {
        unlockedDefenders: [...gameState.unlockedDefenders],
        coins: gameState.coins
    };
    
    // Aplicar restricciones
    if (restrictions.allowedDefenders && restrictions.allowedDefenders !== "all") {
        gameState.unlockedDefenders = restrictions.allowedDefenders;
    }
    
    if (restrictions.startingCoins) {
        gameState.coins = restrictions.startingCoins;
    }
}

function initializeStoryGame(mission) {
    // Configuración especial para modo historia
    gameState.selectedDefender = null;
    gameState.selectedCost = 0;
    gameState.defenders = [];
    gameState.contaminators = [];
    gameState.projectiles = [];
    gameState.effects = [];
    gameState.statusEffects = [];
    gameState.gameRunning = false;
    gameState.waveActive = false;
    gameState.wave = 1;
    gameState.health = 100;
    gameState.contaminationLevel = 0;
    gameState.isPaused = false;
    gameState.removalMode = false;
    gameState.selectedDefenderOnBoard = null;
    
    // Aplicar upgrades de salud (si existen)
    if (typeof rewardsState !== 'undefined' && rewardsState.upgrades.healthBoost > 0) {
        gameState.health += rewardsState.upgrades.healthBoost * 5;
    }
    
    // Guardar la salud inicial de la MISIÓN COMPLETA (no solo de la oleada)
    gameState.missionStartHealth = gameState.health;
    
    // Actualizar healthAtWaveStart con la salud inicial (incluyendo upgrades)
    gameState.healthAtWaveStart = gameState.health;
    
    // Configurar restricciones específicas
    if (mission.restrictions.maxWaves) {
        gameState.maxWaves = mission.restrictions.maxWaves;
    }
    
    // Inicializar tablero y UI
    if (typeof initializeGame === 'function') {
        initializeGame();
    }
    
    // Actualizar shop con defensores permitidos
    if (typeof updateDefenderShop === 'function') {
        updateDefenderShop();
    }
    
    // Mostrar mensaje de inicio de misión
    showMessage(
        `🎯 ${mission.title}`,
        `Objetivos: ${mission.objectives.map(obj => obj.text).join(' • ')}`,
        [{ text: '¡Comenzar!', action: 'hideMessage()' }]
    );
}

function completeObjective(objectiveIndex) {
    if (storyState.missionObjectives[objectiveIndex] && !storyState.missionObjectives[objectiveIndex].completed) {
        storyState.missionObjectives[objectiveIndex].completed = true;
        
        // Actualizar UI
        const objectiveElement = document.querySelector(`[data-obj="${objectiveIndex}"]`);
        if (objectiveElement) {
            objectiveElement.classList.remove('incomplete');
            objectiveElement.classList.add('complete');
            objectiveElement.querySelector('.objective-icon').textContent = '✅';
        }
        
        // Mostrar texto flotante
        if (typeof showFloatingText === 'function') {
            showFloatingText(`+${storyState.missionObjectives[objectiveIndex].reward} ⭐`, 
                           document.querySelector('.story-coins'), 'special-coin-effect');
        }
        
        // Agregar recompensa
        const rewardAmount = storyState.missionObjectives[objectiveIndex].reward;
        storyState.storyCoins += rewardAmount;
        
        // CORRECCIÓN: También añadir a specialCoins
        if (typeof gameState !== 'undefined' && gameState.specialCoins !== undefined) {
            gameState.specialCoins += rewardAmount;
            console.log(`✅ Objetivo completado: +${rewardAmount} monedas especiales (Total: ${gameState.specialCoins})`);
        }
        
        if (typeof playSound === 'function') playSound(800, 0.1, 'triangle', 0.3);
        
        checkMissionComplete();
    }
}

function checkMissionComplete() {
    const allObjectivesComplete = storyState.missionObjectives.every(obj => obj.completed);
    
    if (allObjectivesComplete) {
        completeMission();
    }
}

function completeMission() {
    const chapter = storyChapters[storyState.currentChapter];
    const mission = chapter.missions[storyState.currentMission - 1];
    
    // Dar recompensas
    storyState.storyCoins += mission.rewards.coins;
    
    // CORRECCIÓN: También añadir las monedas a specialCoins para que se guarden
    if (typeof gameState !== 'undefined' && gameState.specialCoins !== undefined) {
        gameState.specialCoins += mission.rewards.coins;
        console.log(`✅ Monedas especiales otorgadas: +${mission.rewards.coins} (Total: ${gameState.specialCoins})`);
    }
    
    // Desbloquear defensores
    if (mission.rewards.unlocks) {
        mission.rewards.unlocks.forEach(defenderKey => {
            if (!gameState.unlockedDefenders.includes(defenderKey)) {
                gameState.unlockedDefenders.push(defenderKey);
                console.log(`✅ Defensor desbloqueado: ${defenderKey}`);
            }
        });
    }
    
    // Marcar capítulo como completado
    if (!storyState.completedChapters.includes(storyState.currentChapter)) {
        storyState.completedChapters.push(storyState.currentChapter);
    }
    
    // Desbloquear siguiente capítulo
    const nextChapter = storyState.currentChapter + 1;
    if (storyChapters[nextChapter] && !storyState.unlockedChapters.includes(nextChapter)) {
        storyState.unlockedChapters.push(nextChapter);
    }
    
    // Guardar progreso del modo historia
    saveStoryProgress();
    
    // Guardar progreso del usuario (para que se guarden los defensores desbloqueados Y las monedas)
    if (typeof saveCurrentUserProgress === 'function') {
        saveCurrentUserProgress();
    } else if (gameState.currentUser) {
        // Guardado manual en localStorage si la función no está disponible
        gameState.currentUser.unlockedDefenders = gameState.unlockedDefenders;
        gameState.currentUser.specialCoins = gameState.specialCoins;
        const saveKey = gameState.currentUser.id !== 0 
            ? 'wacheck_user' 
            : 'wacheck_guest';
        localStorage.setItem(saveKey, JSON.stringify(gameState.currentUser));
    }
    
    // Restaurar configuración original del juego
    if (storyState.originalConfig) {
        // NO restaurar unlockedDefenders aquí, ya que queremos mantener los nuevos desbloqueados
        gameState.coins = storyState.originalConfig.coins;
    }
    
    // Resetear modo historia
    storyState.isStoryMode = false;
    
    // Actualizar UI del modo historia para reflejar las nuevas monedas
    updateStoryUI();
    
    // Mostrar mensaje de misión completada
    showMessage(
        '🎉 ¡Misión Completada!',
        `Has ganado ${mission.rewards.coins} monedas especiales y desbloqueado nuevos defensores.`,
        [
            { text: 'Continuar', action: 'hideMessage(); proceedToNextMission();' },
            { text: 'Volver al Menú', action: 'hideMessage(); backToMainFromStory();' }
        ]
    );
}

function proceedToNextMission() {
    // Avanzar a siguiente capítulo
    storyState.currentChapter++;
    storyState.currentMission = 1;
    
    if (storyChapters[storyState.currentChapter]) {
        backToMainFromStory();
        setTimeout(() => showStoryMode(), 500);
    } else {
        // Historia completa
        showMessage(
            '🏆 ¡Historia Completada!',
            '¡Felicidades! Has completado todas las misiones y te has convertido en el Guardián Definitivo del Agua.',
            [{ text: 'Volver al Menú', action: 'hideMessage(); backToMainFromStory();' }]
        );
    }
}

function skipStoryMission() {
    if (confirm('¿Estás seguro de que quieres saltar esta misión? No recibirás recompensas.')) {
        storyState.currentChapter++;
        storyState.currentMission = 1;
        
        if (storyChapters[storyState.currentChapter]) {
            loadCurrentMission();
        } else {
            backToMainFromStory();
        }
    }
}

// Funciones de verificación de objetivos durante el juego
function checkStoryObjectives() {
    if (!storyState.isStoryMode) return;
    
    const chapter = storyChapters[storyState.currentChapter];
    const mission = chapter.missions[storyState.currentMission - 1];
    
    if (!mission) return;
    
    // Verificar objetivos específicos según la misión
    mission.objectives.forEach((objective, index) => {
        if (storyState.missionObjectives[index] && storyState.missionObjectives[index].completed) return;
        
        const text = objective.text.toLowerCase();
        
        // Objetivo: Sobrevivir X oleadas
        if (text.includes('sobrevive') && text.includes('oleadas')) {
            const waves = parseInt(text.match(/\d+/)[0]);
            if (gameState.wave > waves) {
                completeObjective(index);
            }
        }
        
        // Objetivo: No perder más de X vida
        if (text.includes('no pierdas') && text.includes('vida')) {
            const maxLoss = parseInt(text.match(/\d+/)[0]);
            // Usar la salud inicial de la misión completa, no de cada oleada
            const initialHealth = gameState.missionStartHealth || (100 + (rewardsState?.upgrades?.healthBoost || 0) * 5);
            const currentLoss = initialHealth - gameState.health;
            
            if (currentLoss <= maxLoss) {
                completeObjective(index);
            }
        }
        
        // Objetivo: Usar X defensores de tipo Y
        if (text.includes('usa') && text.includes('menos')) {
            const requiredCount = parseInt(text.match(/\d+/)[0]);
            
            if (text.includes('filtros')) {
                const filterCount = gameState.defenders.filter(d => d.type === 'filter').length;
                if (filterCount >= requiredCount) {
                    completeObjective(index);
                }
            } else if (text.includes('plantas')) {
                const plantCount = gameState.defenders.filter(d => d.type === 'plant').length;
                if (plantCount >= requiredCount) {
                    completeObjective(index);
                }
            } else if (text.includes('recicladores')) {
                const recyclerCount = gameState.defenders.filter(d => d.type === 'recycler').length;
                if (recyclerCount >= requiredCount) {
                    completeObjective(index);
                }
            }
        }
        
        // Objetivo: Construir X defensores
        if (text.includes('construye') && text.includes('menos')) {
            const requiredCount = parseInt(text.match(/\d+/)[0]);
            
            if (text.includes('recicladores')) {
                const recyclerCount = gameState.defenders.filter(d => d.type === 'recycler').length;
                if (recyclerCount >= requiredCount) {
                    completeObjective(index);
                }
            }
        }
        
        // Objetivo: Generar X monedas
        if (text.includes('genera') && text.includes('monedas')) {
            const requiredCoins = parseInt(text.match(/\d+/)[0]);
            const startingCoins = mission.restrictions.startingCoins || 100;
            const earnedCoins = gameState.coins - startingCoins + (gameState.coinsEarned || 0);
            if (earnedCoins >= requiredCoins) {
                completeObjective(index);
            }
        }
        
        // Objetivo: Mantener isla pura
        if (text.includes('mantén') && text.includes('pura')) {
            if (gameState.wave >= 5 && gameState.contaminationLevel === 0) {
                completeObjective(index);
            }
        }
        
        // Objetivo: Usar todos los tipos de defensores
        if (text.includes('todos los tipos')) {
            const availableTypes = mission.restrictions.allowedDefenders || gameState.unlockedDefenders;
            const usedTypes = [...new Set(gameState.defenders.map(d => d.type))];
            if (usedTypes.length >= availableTypes.length) {
                completeObjective(index);
            }
        }
        
        // Objetivo: Completar sin usar cierto defensor
        if (text.includes('completa sin usar')) {
            if (text.includes('filtros')) {
                const filterCount = gameState.defenders.filter(d => d.type === 'filter').length;
                if (gameState.wave >= 3 && filterCount === 0) {
                    completeObjective(index);
                }
            }
        }
        
        // Objetivo: No perder vida (perfecto)
        if (text.includes('sin perder vida') || text.includes('completa sin perder')) {
            // Usar la salud inicial de la misión completa
            const initialHealth = gameState.missionStartHealth || (100 + (rewardsState?.upgrades?.healthBoost || 0) * 5);
            
            if (gameState.health === initialHealth) {
                completeObjective(index);
            }
        }
    });
}

// Función para rastrear monedas ganadas durante la partida
function trackCoinsEarned(coinsGained) {
    if (storyState.isStoryMode) {
        if (!gameState.coinsEarned) gameState.coinsEarned = 0;
        gameState.coinsEarned += coinsGained;
        
        // Verificar objetivos después de ganar monedas
        setTimeout(() => checkStoryObjectives(), 100);
    }
}

// Integración con el sistema de juego principal
function onStoryWaveComplete() {
    // Verificación robusta: solo continuar si REALMENTE estamos en modo historia
    if (!storyState.isStoryMode) return;
    
    const chapter = storyChapters[storyState.currentChapter];
    const mission = chapter.missions[storyState.currentMission - 1];
    
    // Verificar que la misión existe
    if (!mission) return;
    
    // Verificar si se alcanzó el máximo de oleadas
    if (mission.restrictions.maxWaves && gameState.wave >= mission.restrictions.maxWaves) {
        // Detener el juego inmediatamente
        gameState.gameRunning = false;
        gameState.waveActive = false;
        
        // Completar objetivo de supervivencia si existe
        mission.objectives.forEach((objective, index) => {
            if (objective.text.toLowerCase().includes('sobrevive') && !storyState.missionObjectives[index].completed) {
                completeObjective(index);
            }
        });
        
        // Verificar todos los objetivos una última vez
        checkStoryObjectives();
        
        // Dar tiempo para que se procesen todos los objetivos antes de evaluar
        setTimeout(() => {
            // Verificar nuevamente que seguimos en modo historia antes de mostrar el mensaje
            if (!storyState.isStoryMode) return;
            
            // Verificar una última vez antes de decidir
            checkStoryObjectives();
            
            if (storyState.missionObjectives.every(obj => obj.completed)) {
                completeMission();
            } else {
                showMessage(
                    'Misión Incompleta',
                    'No completaste todos los objetivos. ¿Quieres intentar de nuevo?',
                    [
                        { text: 'Reintentar', action: 'hideMessage(); startStoryMission();' },
                        { text: 'Volver al Menú', action: 'hideMessage(); backToMainFromStory();' }
                    ]
                );
            }
        }, 500); // Aumentado a 500ms para dar más tiempo
    } else {
        // Si no es la última oleada, solo verificar objetivos
        checkStoryObjectives();
    }
}

// Función para verificar cuando se mata a un contaminante específico
function onStoryContaminatorKilled(contaminator) {
    if (!storyState.isStoryMode) return;
    
    // Verificar objetivos de eliminar contaminantes específicos
    storyState.missionObjectives.forEach((objective, index) => {
        if (objective.completed) return;
        
        const text = objective.text.toLowerCase();
        if (text.includes('derrota') && text.includes('tóxico') && contaminator.name === 'Tóxico') {
            // Contar eliminaciones de tóxicos
            if (!storyState.toxicKills) storyState.toxicKills = 0;
            storyState.toxicKills++;
            
            const required = parseInt(text.match(/\d+/)[0]);
            if (storyState.toxicKills >= required) {
                completeObjective(index);
            }
        }
        
        if (text.includes('leviatán') && contaminator.name === 'El Leviatán') {
            completeObjective(index);
        }
    });
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar progreso del modo historia
    loadStoryProgress();
    
    // Verificar si gameState existe
    if (typeof gameState !== 'undefined') {
        // Asegurar que gameState tiene las propiedades necesarias
        if (!gameState.currentUser) {
            gameState.currentUser = { id: 0, name: 'Invitado' };
        }
    }
});

// Funciones adicionales para el modo historia
function restartStoryMission() {
    hideMessage();
    startStoryMission();
}

function showChapterSelection() {
    document.getElementById('currentStoryMission').style.display = 'none';
    document.getElementById('chapterSelection').style.display = 'block';
    
    const chapterGrid = document.getElementById('chapterGrid');
    chapterGrid.innerHTML = '';
    
    Object.entries(storyChapters).forEach(([chapterNum, chapter]) => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        
        const isUnlocked = storyState.unlockedChapters.includes(parseInt(chapterNum));
        const isCompleted = storyState.completedChapters.includes(parseInt(chapterNum));
        
        if (!isUnlocked) {
            chapterCard.classList.add('locked');
        }
        if (isCompleted) {
            chapterCard.classList.add('completed');
        }
        
        chapterCard.innerHTML = `
            <div class="chapter-number">${chapterNum}</div>
            <div class="chapter-name">${chapter.name}</div>
            <div class="chapter-status">
                ${!isUnlocked ? '🔒 Bloqueado' : isCompleted ? '✅ Completado' : '📖 Disponible'}
            </div>
        `;
        
        if (isUnlocked) {
            chapterCard.onclick = () => selectChapter(parseInt(chapterNum));
        }
        
        chapterGrid.appendChild(chapterCard);
    });
}

function selectChapter(chapterNum) {
    if (!storyState.unlockedChapters.includes(chapterNum)) return;
    
    storyState.currentChapter = chapterNum;
    storyState.currentMission = 1;
    
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('currentStoryMission').style.display = 'block';
    
    loadCurrentMission();
}

function hideChapterSelection() {
    if (typeof playSound === 'function') playSound(300, 0.1, 'square', 0.15);
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('currentStoryMission').style.display = 'block';
}

function hideChapterSelection() {
    if (typeof playSound === 'function') playSound(300, 0.1, 'square', 0.15);
    
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('currentStoryMission').style.display = 'block';
}