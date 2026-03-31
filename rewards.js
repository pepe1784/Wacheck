// ============================================
// SISTEMA DE RECOMPENSAS DIARIAS Y PROGRESIÓN
// v1.0 - Sistema completo de rewards, upgrades y misiones
// ============================================

// Estado del sistema de recompensas
let rewardsState = {
    dailyStreak: 0, // Días consecutivos de inicio de sesión
    lastLoginDate: null, // Última fecha de inicio de sesión
    claimedDays: [], // Días reclamados (1-7)
    weeklyRewardsClaimed: false, // Si ya reclamó todas las recompensas de la semana
    dailyMissions: [],
    completedMissions: [],
    claimedMissionsToday: [], // NUEVO: Misiones reclamadas hoy (se muestra en sección separada)
    lastMissionResetDate: null, // NUEVO: Para resetear misiones reclamadas cada día
    // Nuevo: mejor oleada alcanzada (para generar misiones basadas en performance)
    bestWave: 0,
    runes: 0, // Moneda para upgrades
    upgrades: {
        coinMultiplier: 1, // Nivel de multiplicador de monedas
        healthBoost: 0, // Salud adicional
        defenderDamage: 0, // Daño adicional para defensores
        startingCoins: 0, // Monedas al inicio de cada oleada
        criticalChance: 0, // Probabilidad de crítico
        areaAntiTank: false // Desbloqueo especial del antitanque de área
    }
};

// Recompensas por día (7 días)
const DAILY_REWARDS = [
    { day: 1, coins: 50, runes: 5, description: "Bienvenida" },
    { day: 2, coins: 75, runes: 8, description: "Día 2" },
    { day: 3, coins: 100, runes: 12, specialCoins: 1, description: "Día 3" },
    { day: 4, coins: 150, runes: 15, description: "Día 4" },
    { day: 5, coins: 200, runes: 20, specialCoins: 2, description: "Día 5" },
    { day: 6, coins: 300, runes: 30, specialCoins: 3, description: "Día 6" },
    { day: 7, coins: 500, runes: 50, specialCoins: 5, antiTank: true, description: "¡GRAN PREMIO!" }
];

// Misiones diarias (se generan aleatoriamente)
const MISSION_TEMPLATES = [
    { id: "reach_wave_5", name: "Alcanza la oleada 5", requirement: 5, type: "wave", reward: { runes: 10, coins: 100 } },
    { id: "reach_wave_10", name: "Alcanza la oleada 10", requirement: 10, type: "wave", reward: { runes: 20, coins: 200 } },
    { id: "reach_wave_15", name: "Alcanza la oleada 15", requirement: 15, type: "wave", reward: { runes: 30, coins: 300 } },
    { id: "reach_wave_3", name: "Alcanza la oleada 3", requirement: 3, type: "wave", reward: { runes: 5, coins: 50 } },
    { id: "kill_boss", name: "Derrota a un jefe", requirement: 1, type: "boss", reward: { runes: 25, coins: 250, specialCoins: 1 } },
    { id: "place_10_defenders", name: "Coloca 10 defensores", requirement: 10, type: "place_defenders", reward: { runes: 15, coins: 150 } },
    { id: "place_5_defenders", name: "Coloca 5 defensores", requirement: 5, type: "place_defenders", reward: { runes: 8, coins: 80 } },
    { id: "kill_50_enemies", name: "Elimina 50 contaminadores", requirement: 50, type: "kill_enemies", reward: { runes: 20, coins: 200 } },
    { id: "kill_25_enemies", name: "Elimina 25 contaminadores", requirement: 25, type: "kill_enemies", reward: { runes: 12, coins: 120 } },
    { id: "win_without_damage", name: "Completa una oleada sin daño", requirement: 1, type: "no_damage", reward: { runes: 35, specialCoins: 2 } },
    { id: "collect_500_coins", name: "Recolecta 500 monedas", requirement: 500, type: "collect_coins", reward: { runes: 15, coins: 100 } },
    { id: "collect_300_coins", name: "Recolecta 300 monedas", requirement: 300, type: "collect_coins", reward: { runes: 10, coins: 75 } }
];

// Costos de upgrades (aumentan por nivel)
const UPGRADE_COSTS = {
    coinMultiplier: (level) => 50 + (level * 25),
    healthBoost: (level) => 40 + (level * 20),
    defenderDamage: (level) => 60 + (level * 30),
    startingCoins: (level) => 45 + (level * 22),
    criticalChance: (level) => 70 + (level * 35)
};

const UPGRADE_MAX_LEVELS = {
    coinMultiplier: 10,
    healthBoost: 20,
    defenderDamage: 15,
    startingCoins: 10,
    criticalChance: 5
};

// ============================================
// FUNCIONES DE RECOMPENSAS DIARIAS
// ============================================

function initializeRewardsSystem() {
    // Cargar desde el usuario o localStorage
    if (gameState.currentUser && gameState.currentUser.rewardsData) {
        Object.assign(rewardsState, gameState.currentUser.rewardsData);
    } else {
        const savedRewards = localStorage.getItem('wacheck_rewards');
        if (savedRewards) {
            Object.assign(rewardsState, JSON.parse(savedRewards));
        }
    }

    // Verificar si es un nuevo día
    checkDailyLogin();

    // Generar misiones diarias si no existen
    if (rewardsState.dailyMissions.length === 0) {
        generateDailyMissions();
    }
}

function checkDailyLogin() {
    const today = new Date().toDateString();

    if (rewardsState.lastLoginDate !== today) {
        const lastDate = rewardsState.lastLoginDate ? new Date(rewardsState.lastLoginDate) : null;
        const todayDate = new Date();

        // Verificar si es consecutivo
        if (lastDate) {
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Día consecutivo
                rewardsState.dailyStreak++;
            } else if (diffDays > 1) {
                // Se rompió la racha
                rewardsState.dailyStreak = 1;
                rewardsState.claimedDays = [];
                rewardsState.weeklyRewardsClaimed = false;
            }
        } else {
            // Primer login
            rewardsState.dailyStreak = 1;
        }

        rewardsState.lastLoginDate = today;

        // Resetear misiones diarias
        rewardsState.dailyMissions = [];
        rewardsState.completedMissions = [];
        generateDailyMissions();

        saveRewardsState();

        // Mostrar ventana de recompensa diaria
        showDailyRewardPopup();
    } else {
        // NUEVO: Si no es un nuevo día (no se muestra popup), verificar si debe mostrar tutorial
        if (typeof tutorialManager !== 'undefined' && tutorialManager.shouldShowTutorial()) {
            setTimeout(() => {
                tutorialManager.start();
            }, 500);
        }
    }

    // NUEVO: Resetear misiones reclamadas cada día
    if (rewardsState.lastMissionResetDate !== today) {
        rewardsState.claimedMissionsToday = [];
        rewardsState.lastMissionResetDate = today;
        saveRewardsState();
    }
}

function showDailyRewardPopup(forceShow = false) {
    const currentDay = Math.min(rewardsState.dailyStreak, 7);

    // Si no es forzado y ya reclamó hoy, no mostrar
    if (!forceShow && rewardsState.claimedDays.includes(currentDay)) {
        return; // Ya reclamó hoy
    }

    const reward = DAILY_REWARDS[currentDay - 1];
    const alreadyClaimed = rewardsState.claimedDays.includes(currentDay);

    const popup = document.createElement('div');
    popup.className = 'daily-reward-popup';
    popup.id = 'dailyRewardPopup';

    // Cerrar al hacer clic en el fondo (fuera del contenido)
    popup.onclick = (e) => {
        if (e.target === popup) {
            closeDailyRewardPopup();
        }
    };

    popup.innerHTML = `
        <div class="daily-reward-content" onclick="event.stopPropagation()">
            <button class="popup-close-btn" onclick="closeDailyRewardPopup()">X</button>
            
            <div class="daily-reward-header">
                <div class="daily-reward-icon">${window.GameSprites.inline('gift', 48)}</div>
                <h2>${alreadyClaimed ? '¡Recompensa Reclamada!' : '¡Recompensa Diaria!'}</h2>
                <p>Día ${currentDay} de 7</p>
            </div>
            
            <div class="daily-reward-streak">
                <div class="streak-days">
                    ${generateStreakDays(currentDay)}
                </div>
            </div>
            
            <div class="daily-reward-items">
                ${reward.coins ? `<div class="reward-item"><span class="reward-icon">${window.GameSprites.inline('coin', 20)}</span>${reward.coins} Monedas</div>` : ''}
                ${reward.runes ? `<div class="reward-item"><span class="reward-icon">${window.GameSprites.inline('rune', 20)}</span>${reward.runes} Runas</div>` : ''}
                ${reward.specialCoins ? `<div class="reward-item"><span class="reward-icon">${window.GameSprites.inline('star', 20)}</span>${reward.specialCoins} Monedas Especiales</div>` : ''}
                ${reward.antiTank ? `<div class="reward-item special"><span class="reward-icon">${window.GameSprites.inline('target', 20)}</span>¡Antitanque de Área Desbloqueado!</div>` : ''}
            </div>
            
            ${!alreadyClaimed ? `
                <button class="claim-reward-btn" onclick="claimDailyReward(${currentDay})">
                    ¡RECLAMAR!
                </button>
            ` : `
                <div style="text-align: center; color: #2ecc71; font-size: 18px; font-weight: bold; padding: 15px; background: rgba(46, 204, 113, 0.2); border-radius: 12px; margin-top: 10px;">
                    ${window.GameSprites.inline('check', 18)} Ya reclamaste esta recompensa hoy
                </div>
            `}
            
            ${currentDay < 7 && !alreadyClaimed ? `<p class="next-reward-hint">Vuelve mañana para el Día ${currentDay + 1}</p>` : ''}
            ${alreadyClaimed && currentDay < 7 ? `<p class="next-reward-hint">Vuelve mañana para el Día ${currentDay + 1}</p>` : ''}
            
            <p class="close-hint">Haz clic fuera, en la X o ESC para cerrar</p>
        </div>
    `;

    document.body.appendChild(popup);

    // Animación de entrada
    setTimeout(() => popup.classList.add('show'), 10);

    // Cerrar con tecla ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeDailyRewardPopup();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function closeDailyRewardPopup() {
    const popup = document.getElementById('dailyRewardPopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();

            // NUEVO: Después de cerrar la recompensa diaria, verificar si debe mostrar el tutorial
            if (typeof tutorialManager !== 'undefined' && tutorialManager.shouldShowTutorial()) {
                setTimeout(() => {
                    tutorialManager.start();
                }, 300);
            }
        }, 300);
    }
}

function generateStreakDays(currentDay) {
    let html = '';
    for (let i = 1; i <= 7; i++) {
        const isClaimed = rewardsState.claimedDays.includes(i);
        const isCurrent = i === currentDay;
        const reward = DAILY_REWARDS[i - 1];

        html += `
            <div class="streak-day ${isClaimed ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${i > currentDay ? 'locked' : ''}">
                <div class="day-number">Día ${i}</div>
                <div class="day-icon">${reward.antiTank ? window.GameSprites.inline('target', 24) : isClaimed ? window.GameSprites.inline('check', 24) : i === 7 ? window.GameSprites.inline('crown', 24) : window.GameSprites.inline('gift', 24)}</div>
                ${isCurrent && !isClaimed ? '<div class="day-pulse"></div>' : ''}
            </div>
        `;
    }
    return html;
}

function claimDailyReward(day) {
    const reward = DAILY_REWARDS[day - 1];

    // Otorgar recompensas
    if (reward.coins) gameState.coins += reward.coins;
    if (reward.runes) rewardsState.runes += reward.runes;
    if (reward.specialCoins) gameState.specialCoins += reward.specialCoins;

    // Desbloquear antitanque de área (día 7)
    if (reward.antiTank) {
        rewardsState.upgrades.areaAntiTank = true;
        if (!gameState.unlockedDefenders.includes('antiTankArea')) {
            gameState.unlockedDefenders.push('antiTankArea');
        }
        playSound(800, 0.3, 'square', 0.2);
    }

    // Marcar como reclamado
    rewardsState.claimedDays.push(day);

    // Desbloquear logro de racha de 7 días
    if (rewardsState.dailyStreak >= 7 && typeof unlockAchievement === 'function') {
        unlockAchievement('daily_streak_7');
    }

    // Actualizar UI
    if (typeof updateCoins === 'function') updateCoins();
    if (typeof updateSpecialCoins === 'function') updateSpecialCoins();
    updateRunesDisplay();
    saveRewardsState();
    if (typeof saveCurrentUserProgress === 'function') saveCurrentUserProgress();

    // Cerrar popup usando la nueva función
    closeDailyRewardPopup();

    if (typeof playSound === 'function') playSound(600, 0.2);

    // Si completó la semana, mostrar mensaje especial
    if (day === 7) {
        setTimeout(() => {
            if (typeof showMessage === 'function') {
                showMessage('¡SEMANA COMPLETADA!',
                    '¡Has completado los 7 días! Ahora recibirás recompensas menores cada día. El antitanque de área es tuyo para siempre.',
                    [], 5000);
            }
        }, 500);
    }
}

// ============================================
// SISTEMA DE MISIONES DIARIAS
// ============================================

function generateDailyMissions() {
    const playerBestWave = rewardsState.bestWave || 0;

    // Filtrar plantillas apropiadas según el nivel del jugador
    let suitableTemplates = MISSION_TEMPLATES.filter(t => {
        // Para misiones de oleadas, ajustar según bestWave
        if (t.type === 'wave') {
            if (playerBestWave < 3) {
                return t.requirement <= 5; // Jugadores nuevos: solo hasta ola 5
            }
            if (playerBestWave < 10) {
                return t.requirement <= 10; // Jugadores intermedios: hasta ola 10
            }
            return true; // Jugadores avanzados: cualquier misión
        }

        // Misiones de jefe solo si el jugador ha llegado a ola 10+
        if (t.type === 'boss') {
            return playerBestWave >= 10;
        }

        // Otras misiones siempre disponibles
        return true;
    });

    // Si no hay suficientes misiones adecuadas, usar todas
    if (suitableTemplates.length < 3) {
        suitableTemplates = [...MISSION_TEMPLATES];
    }

    // Seleccionar 3 misiones aleatorias de las apropiadas
    const shuffled = [...suitableTemplates].sort(() => Math.random() - 0.5);
    rewardsState.dailyMissions = shuffled.slice(0, 3).map(mission => ({
        ...mission,
        progress: 0,
        completed: false
    }));

    saveRewardsState();
}

function updateMissionProgress(type, value = 1) {
    if (!rewardsState.dailyMissions) return;
    // Si el tipo es 'wave', interpretamos el value como la ola alcanzada y tomamos el máximo
    rewardsState.dailyMissions.forEach(mission => {
        if (mission.type === type && !mission.completed) {
            if (type === 'wave') {
                // value es la ola alcanzada; usar el mayor valor
                mission.progress = Math.max(mission.progress || 0, value);
                // Actualizar la mejor ola alcanzada globalmente
                rewardsState.bestWave = Math.max(rewardsState.bestWave || 0, mission.progress);
            } else {
                mission.progress = (mission.progress || 0) + value;
            }

            // Verificar si se completó
            if (mission.progress >= mission.requirement) {
                mission.progress = mission.requirement;
                mission.completed = true;

                // Mostrar notificación
                showMissionCompleteNotification(mission);
            }

            updateMissionsUI();
            saveRewardsState();
        }
    });
}

// Genera una nueva misión basada en datos del jugador (mejor ola, monedas, etc.)
function generateMissionForUser() {
    const playerBestWave = rewardsState.bestWave || 0;
    const playerLevel = Math.floor(playerBestWave / 5); // Nivel del jugador: 0, 1, 2, 3...

    // Crear misiones dinámicas basadas en el progreso
    const dynamicMissions = [];

    // 1. MISIONES DE OLEADAS (adaptativas)
    if (playerBestWave < 5) {
        // Jugadores nuevos: oleadas 3-5
        dynamicMissions.push(
            { id: `wave_${Date.now()}_1`, name: "Alcanza la oleada 3", requirement: 3, type: "wave", reward: { runes: 5, coins: 50 } },
            { id: `wave_${Date.now()}_2`, name: "Alcanza la oleada 5", requirement: 5, type: "wave", reward: { runes: 10, coins: 100 } }
        );
    } else if (playerBestWave < 10) {
        // Jugadores intermedios: oleadas 8-10
        dynamicMissions.push(
            { id: `wave_${Date.now()}_1`, name: "Alcanza la oleada 8", requirement: 8, type: "wave", reward: { runes: 15, coins: 150 } },
            { id: `wave_${Date.now()}_2`, name: "Alcanza la oleada 10", requirement: 10, type: "wave", reward: { runes: 20, coins: 200 } }
        );
    } else if (playerBestWave < 15) {
        // Jugadores avanzados: oleadas 12-15
        dynamicMissions.push(
            { id: `wave_${Date.now()}_1`, name: "Alcanza la oleada 12", requirement: 12, type: "wave", reward: { runes: 25, coins: 250 } },
            { id: `wave_${Date.now()}_2`, name: "Alcanza la oleada 15", requirement: 15, type: "wave", reward: { runes: 30, coins: 300 } }
        );
    } else {
        // Jugadores expertos: oleadas progresivas
        const nextWave = playerBestWave + 2;
        const challengeWave = playerBestWave + 5;
        dynamicMissions.push(
            { id: `wave_${Date.now()}_1`, name: `Alcanza la oleada ${nextWave}`, requirement: nextWave, type: "wave", reward: { runes: 20 + (playerLevel * 5), coins: 200 + (playerLevel * 50) } },
            { id: `wave_${Date.now()}_2`, name: `Alcanza la oleada ${challengeWave}`, requirement: challengeWave, type: "wave", reward: { runes: 35 + (playerLevel * 8), coins: 350 + (playerLevel * 75), specialCoins: 1 } }
        );
    }

    // 2. MISIONES DE ELIMINACIÓN (escalan con nivel)
    const baseKills = 25 + (playerLevel * 10);
    const hardKills = 50 + (playerLevel * 15);
    dynamicMissions.push(
        { id: `kill_${Date.now()}_1`, name: `Elimina ${baseKills} contaminadores`, requirement: baseKills, type: "kill_enemies", reward: { runes: 12 + playerLevel * 3, coins: 120 + playerLevel * 20 } },
        { id: `kill_${Date.now()}_2`, name: `Elimina ${hardKills} contaminadores`, requirement: hardKills, type: "kill_enemies", reward: { runes: 20 + playerLevel * 5, coins: 200 + playerLevel * 30 } }
    );

    // 3. MISIONES DE COLOCACIÓN DE DEFENSORES (escalan con nivel)
    const baseDefenders = 5 + Math.floor(playerLevel / 2);
    const manyDefenders = 10 + playerLevel;
    dynamicMissions.push(
        { id: `place_${Date.now()}_1`, name: `Coloca ${baseDefenders} defensores`, requirement: baseDefenders, type: "place_defenders", reward: { runes: 8 + playerLevel * 2, coins: 80 + playerLevel * 15 } },
        { id: `place_${Date.now()}_2`, name: `Coloca ${manyDefenders} defensores`, requirement: manyDefenders, type: "place_defenders", reward: { runes: 15 + playerLevel * 3, coins: 150 + playerLevel * 25 } }
    );

    // 4. MISIONES DE MONEDAS (escalan con nivel)
    const baseCoins = 300 + (playerLevel * 100);
    const manyCoins = 500 + (playerLevel * 150);
    dynamicMissions.push(
        { id: `coins_${Date.now()}_1`, name: `Recolecta ${baseCoins} monedas`, requirement: baseCoins, type: "collect_coins", reward: { runes: 10 + playerLevel * 2, coins: 75 + playerLevel * 10 } },
        { id: `coins_${Date.now()}_2`, name: `Recolecta ${manyCoins} monedas`, requirement: manyCoins, type: "collect_coins", reward: { runes: 15 + playerLevel * 3, coins: 100 + playerLevel * 15 } }
    );

    // 5. MISIONES ESPECIALES (desbloquean con progreso)
    if (playerBestWave >= 10) {
        dynamicMissions.push(
            { id: `boss_${Date.now()}`, name: "Derrota a un jefe", requirement: 1, type: "boss", reward: { runes: 25 + playerLevel * 5, coins: 250 + playerLevel * 50, specialCoins: 1 } },
            { id: `no_damage_${Date.now()}`, name: "Completa una oleada sin daño", requirement: 1, type: "no_damage", reward: { runes: 35 + playerLevel * 5, specialCoins: 2 } }
        );
    }

    // Remover misiones ya presentes
    const existingIds = new Set(rewardsState.dailyMissions.map(m => m.id));
    const filtered = dynamicMissions.filter(m => !existingIds.has(m.id));

    // Si todas ya están presentes, usar pool completo
    const finalPool = filtered.length > 0 ? filtered : dynamicMissions;

    // Seleccionar una misión aleatoria
    const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
    return { ...picked, progress: 0, completed: false };
}

// Animación corta y reemplazo de misión reclamada
function animateAndReplaceMission(missionId) {
    // Encontrar el elemento en el DOM por el id (usamos atributo data-mission-id)
    const container = document.getElementById('missionsContainer');
    if (!container) return;

    const card = container.querySelector(`[data-mission-id="${missionId}"]`);
    if (!card) {
        // Si no existe el atributo (vintage), redibujar y salir
        updateMissionsUI();
        return;
    }

    card.classList.add('claiming');
    // Animación: deslizar hacia abajo y disminuir opacidad
    card.style.transition = 'transform 400ms ease, opacity 400ms ease';
    card.style.transform = 'translateY(20px) scale(0.98)';
    card.style.opacity = '0.4';

    setTimeout(() => {
        // Reemplazar la misión en data después de la animación
        // Eliminar la misión reclamada del estado y añadir una nueva
        const idx = rewardsState.dailyMissions.findIndex(m => m.id === missionId);
        if (idx > -1) {
            rewardsState.dailyMissions.splice(idx, 1);
            const newMission = generateMissionForUser();
            rewardsState.dailyMissions.push(newMission);
            saveRewardsState();
        }

        // Redibujar UI
        updateMissionsUI();
    }, 420);
}

function showMissionCompleteNotification(mission) {
    const notification = document.createElement('div');
    notification.className = 'mission-notification';
    notification.innerHTML = `
        <div class="mission-notif-icon">${window.GameSprites.inline('check', 24)}</div>
        <div class="mission-notif-text">
            <strong>¡Misión Completada!</strong>
            <p>${mission.name}</p>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    playSound(700, 0.2);
}

function claimMissionReward(missionId) {
    const mission = rewardsState.dailyMissions.find(m => m.id === missionId);
    if (!mission || !mission.completed) return;

    // Otorgar recompensas
    if (mission.reward.coins) gameState.coins += mission.reward.coins;
    if (mission.reward.runes) rewardsState.runes += mission.reward.runes;
    if (mission.reward.specialCoins) gameState.specialCoins += mission.reward.specialCoins;

    // Marcar como reclamada
    rewardsState.completedMissions.push(missionId);

    // NUEVO: Añadir a la lista de misiones reclamadas hoy
    rewardsState.claimedMissionsToday.push({
        ...mission,
        claimedAt: Date.now()
    });

    // IMPORTANTE: Guardar inmediatamente el estado
    saveRewardsState();
    saveCurrentUserProgress();

    // Verificar si se completaron todas las misiones del día
    const allCompleted = rewardsState.dailyMissions.every(m =>
        rewardsState.completedMissions.includes(m.id)
    );
    if (allCompleted && typeof unlockAchievement === 'function') {
        unlockAchievement('all_missions');
    }

    // Actualizar UI (monedas y runas)
    updateCoins();
    updateRunesDisplay();
    updateSpecialCoins();

    // Actualizar UI de misiones INMEDIATAMENTE forzando el repintado
    updateMissionsUI();

    playSound(600, 0.2);

    // NUEVO: Generar una nueva misión basada en el progreso del jugador
    setTimeout(() => {
        const newMission = generateMissionForUser();

        // Reemplazar la misión reclamada con la nueva
        const idx = rewardsState.dailyMissions.findIndex(m => m.id === missionId);
        if (idx > -1) {
            rewardsState.dailyMissions[idx] = newMission;
            saveRewardsState();
            updateMissionsUI();
        }
    }, 500); // Delay para animación suave
}

// ============================================
// SISTEMA DE UPGRADES CON RUNAS
// ============================================

function purchaseUpgrade(upgradeType) {
    const currentLevel = rewardsState.upgrades[upgradeType] || 0;
    const maxLevel = UPGRADE_MAX_LEVELS[upgradeType];

    if (currentLevel >= maxLevel) {
        showMessage('Nivel Máximo', 'Este upgrade ya está al máximo.', [], 2000);
        return;
    }

    const cost = UPGRADE_COSTS[upgradeType](currentLevel);

    if (rewardsState.runes < cost) {
        showMessage('Runas Insuficientes', `Necesitas ${cost} runas para este upgrade.`, [], 2000);
        return;
    }

    // Aplicar upgrade
    rewardsState.runes -= cost;
    rewardsState.upgrades[upgradeType]++;

    // Verificar si alcanzó el nivel máximo
    if (rewardsState.upgrades[upgradeType] >= maxLevel) {
        if (typeof unlockAchievement === 'function') {
            unlockAchievement('max_upgrade');
        }
    }

    // Aplicar efectos inmediatos si el juego está activo
    applyUpgradeEffects();

    // Actualizar UI
    updateRunesDisplay();
    updateUpgradesUI();
    saveRewardsState();
    saveCurrentUserProgress();

    playSound(750, 0.2);
    showMessage('¡Upgrade Adquirido!', getUpgradeDescription(upgradeType), [], 2000);
}

function applyUpgradeEffects() {
    // Aplicar multiplicador de monedas
    if (rewardsState.upgrades.coinMultiplier > 0) {
        // Se aplicará cuando se ganen monedas
    }

    // Aplicar boost de salud
    if (rewardsState.upgrades.healthBoost > 0 && gameState.gameRunning) {
        const healthBoost = rewardsState.upgrades.healthBoost * 5;
        gameState.health = Math.min(gameState.health + healthBoost, 100 + healthBoost);
        updateHealth();
    }

    // Los demás efectos se aplican en tiempo real durante el juego
}

function getUpgradeDescription(upgradeType) {
    const descriptions = {
        coinMultiplier: `+10% de monedas por cada eliminación`,
        healthBoost: `+5 de salud máxima`,
        defenderDamage: `+5% de daño para todos los defensores`,
        startingCoins: `+25 monedas al inicio de cada oleada`,
        criticalChance: `+3% de probabilidad de golpe crítico`
    };
    return descriptions[upgradeType] || '';
}

// ============================================
// FUNCIONES DE GUARDADO Y UI
// ============================================

function saveRewardsState() {
    localStorage.setItem('wacheck_rewards', JSON.stringify(rewardsState));

    // También guardar en el usuario si existe
    if (gameState.currentUser && gameState.currentUser.id !== 0) {
        gameState.currentUser.rewardsData = rewardsState;
    }
}

function updateRunesDisplay() {
    const display = document.getElementById('runesDisplay');
    if (display) {
        display.textContent = rewardsState.runes;
    }
}

function updateMissionsUI() {
    // SECCIÓN 1: Misiones Activas
    const container = document.getElementById('missionsContainer');
    if (container) {
        const activeMissions = rewardsState.dailyMissions.filter(m =>
            !rewardsState.completedMissions.includes(m.id)
        );

        if (activeMissions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #95a5a6;">
                    <span>${window.GameSprites.inline('sparkle', 48)}</span>
                    <p style="margin-top: 10px;">¡Todas las misiones completadas!</p>
                    <p style="font-size: 14px; opacity: 0.8;">Vuelve mañana para más misiones</p>
                </div>
            `;
        } else {
            container.innerHTML = activeMissions.map(mission => {
                const progress = Math.min(mission.progress, mission.requirement);
                const percentage = (progress / mission.requirement) * 100;
                const isClaimed = rewardsState.completedMissions.includes(mission.id);

                return `
                    <div class="mission-card ${mission.completed ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}" data-mission-id="${mission.id}">
                        <div class="mission-header">
                            <span class="mission-icon">${getMissionIcon(mission.type)}</span>
                            <h4>${mission.name}</h4>
                        </div>
                        <div class="mission-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="progress-text">${progress}/${mission.requirement}</span>
                        </div>
                        <div class="mission-rewards">
                            ${mission.reward.coins ? `<span>${window.GameSprites.inline('coin', 14)} ${mission.reward.coins}</span>` : ''}
                            ${mission.reward.runes ? `<span>${window.GameSprites.inline('rune', 14)} ${mission.reward.runes}</span>` : ''}
                            ${mission.reward.specialCoins ? `<span>${window.GameSprites.inline('star', 14)} ${mission.reward.specialCoins}</span>` : ''}
                        </div>
                        ${mission.completed && !isClaimed ?
                        `<button class="claim-mission-btn" onclick="claimMissionReward('${mission.id}')">RECLAMAR</button>` :
                        ''}
                    </div>
                `;
            }).join('');
        }
    }

    // SECCIÓN 2: Misiones Reclamadas
    const claimedContainer = document.getElementById('claimedMissionsContainer');
    if (claimedContainer) {
        const claimedMissions = rewardsState.claimedMissionsToday || [];

        // Actualizar badge de contador
        const badge = document.getElementById('claimedCountBadge');
        if (badge) badge.textContent = claimedMissions.length;

        if (claimedMissions.length === 0) {
            claimedContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #7f8c8d; font-size: 14px;">
                    <span style="opacity: 0.5;">${window.GameSprites.inline('scroll', 32)}</span>
                    <p style="margin-top: 8px;">Aún no has reclamado ninguna misión</p>
                </div>
            `;
        } else {
            claimedContainer.innerHTML = claimedMissions.map(mission => {
                return `
                    <div class="mission-card claimed" style="opacity: 0.8;">
                        <div class="mission-header">
                            <span class="mission-icon">${getMissionIcon(mission.type)}</span>
                            <h4>${mission.name}</h4>
                        </div>
                        <div class="mission-rewards" style="margin-top: 10px;">
                            ${mission.reward.coins ? `<span>${window.GameSprites.inline('coin', 14)} ${mission.reward.coins}</span>` : ''}
                            ${mission.reward.runes ? `<span>${window.GameSprites.inline('rune', 14)} ${mission.reward.runes}</span>` : ''}
                            ${mission.reward.specialCoins ? `<span>${window.GameSprites.inline('star', 14)} ${mission.reward.specialCoins}</span>` : ''}
                        </div>
                        <div class="claimed-badge">${window.GameSprites.inline('check', 14)} Reclamada</div>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateUpgradesUI() {
    const container = document.getElementById('upgradesContainer');
    if (!container) return;

    const upgrades = [
        { type: 'coinMultiplier', name: 'Multiplicador de Monedas', icon: 'coin', desc: '+10% monedas' },
        { type: 'healthBoost', name: 'Aumento de Salud', icon: 'heart', desc: '+5 salud máxima' },
        { type: 'defenderDamage', name: 'Poder de Defensores', icon: 'sword', desc: '+5% daño' },
        { type: 'startingCoins', name: 'Economía Inicial', icon: 'coins', desc: '+25 monedas iniciales' },
        { type: 'criticalChance', name: 'Golpe Crítico', icon: 'explosion', desc: '+3% probabilidad' }
    ];

    container.innerHTML = upgrades.map(upgrade => {
        const currentLevel = rewardsState.upgrades[upgrade.type] || 0;
        const maxLevel = UPGRADE_MAX_LEVELS[upgrade.type];
        const cost = currentLevel < maxLevel ? UPGRADE_COSTS[upgrade.type](currentLevel) : 0;
        const isMaxed = currentLevel >= maxLevel;

        return `
            <div class="upgrade-card ${isMaxed ? 'maxed' : ''}">
                <div class="upgrade-icon">${window.GameSprites.inline(upgrade.icon, 24)}</div>
                <div class="upgrade-info">
                    <h4>${upgrade.name}</h4>
                    <p>${upgrade.desc}</p>
                    <div class="upgrade-level">Nivel: ${currentLevel}/${maxLevel}</div>
                </div>
                ${!isMaxed ?
                `<button class="upgrade-btn ${rewardsState.runes < cost ? 'disabled' : ''}" 
                        onclick="purchaseUpgrade('${upgrade.type}')"
                        ${rewardsState.runes < cost ? 'disabled' : ''}>
                        <span class="upgrade-cost">${window.GameSprites.inline('rune', 14)} ${cost}</span>
                    </button>` :
                `<div class="max-badge">MAX</div>`}
            </div>
        `;
    }).join('');
}

function getMissionIcon(type) {
    const icons = {
        wave: 'wave',
        boss: 'sword',
        place_defenders: 'shield-icon',
        kill_enemies: 'explosion',
        no_damage: 'shield-icon',
        collect_coins: 'coin'
    };
    return window.GameSprites.inline(icons[type] || 'target', 20);
}

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // No mostrar popup de recompensas diarias en game.php (solo en index.html)
        const isGamePage = window.location.pathname.includes('game.php');
        if (isGamePage) {
            // Solo inicializar datos (misiones, estado), sin popup
            if (gameState.currentUser && gameState.currentUser.rewardsData) {
                Object.assign(rewardsState, gameState.currentUser.rewardsData);
            } else {
                const savedRewards = localStorage.getItem('wacheck_rewards');
                if (savedRewards) {
                    try { Object.assign(rewardsState, JSON.parse(savedRewards)); } catch(e) {}
                }
            }
            if (rewardsState.dailyMissions.length === 0) {
                generateDailyMissions();
            }
        } else {
            initializeRewardsSystem();
        }
    });
}
