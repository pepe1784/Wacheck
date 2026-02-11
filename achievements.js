// ============================================
// SISTEMA DE LOGROS/ACHIEVEMENTS
// v1.0 - Sistema completo de logros desbloqueables
// ============================================

// Estado del sistema de logros
let achievementsState = {
    unlockedAchievements: [], // IDs de logros desbloqueados
    progress: {}, // Progreso de cada logro
    totalPoints: 0, // Puntos totales de logros
    lastUnlocked: null // Último logro desbloqueado
};

// Definición de todos los logros
const ACHIEVEMENTS = {
    // Logros de Inicio
    first_game: {
        id: 'first_game',
        name: 'Primera Partida',
        description: 'Juega tu primera partida',
        icon: '🎮',
        points: 10,
        type: 'simple',
        category: 'inicio'
    },

    first_defender: {
        id: 'first_defender',
        name: 'Primer Defensor',
        description: 'Coloca tu primer defensor',
        icon: '🛡️',
        points: 10,
        type: 'simple',
        category: 'inicio'
    },

    tutorial_complete: {
        id: 'tutorial_complete',
        name: '🎓 Estudiante Dedicado',
        description: 'Completa el tutorial del juego',
        icon: '📚',
        points: 15,
        type: 'simple',
        category: 'inicio'
    },

    // Logros de Oleadas
    wave_5: {
        id: 'wave_5',
        name: 'Superviviente',
        description: 'Alcanza la oleada 5',
        icon: '🌊',
        points: 20,
        type: 'progress',
        requirement: 5,
        category: 'oleadas'
    },

    wave_10: {
        id: 'wave_10',
        name: 'Veterano',
        description: 'Alcanza la oleada 10',
        icon: '🌀',
        points: 50,
        type: 'progress',
        requirement: 10,
        category: 'oleadas'
    },

    wave_20: {
        id: 'wave_20',
        name: 'Maestro de las Olas',
        description: 'Alcanza la oleada 20',
        icon: '🌊',
        points: 100,
        type: 'progress',
        requirement: 20,
        category: 'oleadas'
    },

    wave_50: {
        id: 'wave_50',
        name: 'Guardián del Agua',
        description: 'Alcanza la oleada 50',
        icon: '👑',
        points: 250,
        type: 'progress',
        requirement: 50,
        category: 'oleadas'
    },

    // Logros de Eliminaciones
    kills_50: {
        id: 'kills_50',
        name: 'Exterminador',
        description: 'Elimina 50 contaminadores',
        icon: '💀',
        points: 30,
        type: 'cumulative',
        requirement: 50,
        category: 'combate'
    },

    kills_250: {
        id: 'kills_250',
        name: 'Cazador de Contaminantes',
        description: 'Elimina 250 contaminadores',
        icon: '⚔️',
        points: 75,
        type: 'cumulative',
        requirement: 250,
        category: 'combate'
    },

    kills_1000: {
        id: 'kills_1000',
        name: 'Leyenda del Agua',
        description: 'Elimina 1000 contaminadores',
        icon: '🏆',
        points: 200,
        type: 'cumulative',
        requirement: 1000,
        category: 'combate'
    },

    // Logros de Jefes
    first_boss: {
        id: 'first_boss',
        name: 'Cazador de Jefes',
        description: 'Derrota a tu primer jefe',
        icon: '👹',
        points: 40,
        type: 'simple',
        category: 'jefes'
    },

    boss_5: {
        id: 'boss_5',
        name: 'Matador de Titanes',
        description: 'Derrota a 5 jefes',
        icon: '⚡',
        points: 100,
        type: 'cumulative',
        requirement: 5,
        category: 'jefes'
    },

    // Logros de Economía
    coins_1000: {
        id: 'coins_1000',
        name: 'Rico',
        description: 'Acumula 1000 monedas en una partida',
        icon: '💰',
        points: 30,
        type: 'single_game',
        requirement: 1000,
        category: 'economia'
    },

    coins_5000: {
        id: 'coins_5000',
        name: 'Millonario',
        description: 'Acumula 5000 monedas en una partida',
        icon: '💎',
        points: 75,
        type: 'single_game',
        requirement: 5000,
        category: 'economia'
    },

    special_coins_10: {
        id: 'special_coins_10',
        name: 'Coleccionista',
        description: 'Consigue 10 monedas especiales',
        icon: '⭐',
        points: 50,
        type: 'cumulative',
        requirement: 10,
        category: 'economia'
    },

    // Logros de Defensores
    place_100: {
        id: 'place_100',
        name: 'Constructor',
        description: 'Coloca 100 defensores',
        icon: '🏗️',
        points: 40,
        type: 'cumulative',
        requirement: 100,
        category: 'defensores'
    },

    all_defenders: {
        id: 'all_defenders',
        name: 'Colección Completa',
        description: 'Desbloquea todos los defensores',
        icon: '🎁',
        points: 150,
        type: 'simple',
        category: 'defensores'
    },

    max_upgrade: {
        id: 'max_upgrade',
        name: 'Poder Máximo',
        description: 'Maximiza cualquier upgrade',
        icon: '⚡',
        points: 100,
        type: 'simple',
        category: 'upgrades'
    },

    // Logros Especiales
    no_damage_wave: {
        id: 'no_damage_wave',
        name: 'Intocable',
        description: 'Completa una oleada sin recibir daño',
        icon: '🛡️',
        points: 50,
        type: 'simple',
        category: 'especial'
    },

    perfect_defense: {
        id: 'perfect_defense',
        name: 'Defensa Perfecta',
        description: 'Completa 5 oleadas consecutivas sin daño',
        icon: '✨',
        points: 150,
        type: 'progress',
        requirement: 5,
        category: 'especial'
    },

    daily_streak_7: {
        id: 'daily_streak_7',
        name: 'Dedicado',
        description: 'Inicia sesión 7 días consecutivos',
        icon: '🔥',
        points: 75,
        type: 'simple',
        category: 'especial'
    },

    all_missions: {
        id: 'all_missions',
        name: 'Completista',
        description: 'Completa todas las misiones diarias en un día',
        icon: '✓',
        points: 60,
        type: 'simple',
        category: 'misiones'
    },

    // Logros Ocultos
    easter_egg: {
        id: 'easter_egg',
        name: '???',
        description: 'Descubre el easter egg secreto',
        icon: '🥚',
        points: 100,
        type: 'simple',
        category: 'secreto',
        hidden: true
    }
};

// Categorías de logros
const ACHIEVEMENT_CATEGORIES = {
    inicio: { name: 'Primeros Pasos', icon: '🎮', color: '#3498db' },
    oleadas: { name: 'Oleadas', icon: '🌊', color: '#00b894' },
    combate: { name: 'Combate', icon: '⚔️', color: '#e74c3c' },
    jefes: { name: 'Jefes', icon: '👹', color: '#9b59b6' },
    economia: { name: 'Economía', icon: '💰', color: '#f1c40f' },
    defensores: { name: 'Defensores', icon: '🛡️', color: '#3498db' },
    upgrades: { name: 'Upgrades', icon: '📊', color: '#8e44ad' },
    misiones: { name: 'Misiones', icon: '✓', color: '#2ecc71' },
    especial: { name: 'Especiales', icon: '✨', color: '#e67e22' },
    secreto: { name: 'Secretos', icon: '🔒', color: '#95a5a6' }
};

// ============================================
// FUNCIONES DE LOGROS
// ============================================

function initializeAchievements() {
    // Cargar desde el usuario o localStorage
    if (gameState.currentUser && gameState.currentUser.achievementsData) {
        Object.assign(achievementsState, gameState.currentUser.achievementsData);
    } else {
        const savedAchievements = localStorage.getItem('wacheck_achievements');
        if (savedAchievements) {
            Object.assign(achievementsState, JSON.parse(savedAchievements));
        }
    }

    // Inicializar progreso de logros acumulativos si no existe
    Object.keys(ACHIEVEMENTS).forEach(id => {
        if (!achievementsState.progress[id]) {
            achievementsState.progress[id] = 0;
        }
    });
}

function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    // Verificar si ya está desbloqueado
    if (achievementsState.unlockedAchievements.includes(achievementId)) {
        return;
    }

    // Desbloquear
    achievementsState.unlockedAchievements.push(achievementId);
    achievementsState.totalPoints += achievement.points;
    achievementsState.lastUnlocked = achievementId;

    // Guardar
    saveAchievementsState();

    // Mostrar notificación
    showAchievementUnlocked(achievement);

    // Sonido
    if (typeof playSound === 'function') {
        playSound(800, 0.3, 'square', 0.2);
    }

    // Recompensa de runas
    if (typeof rewardsState !== 'undefined') {
        const runesReward = Math.floor(achievement.points / 2);
        rewardsState.runes += runesReward;
        if (typeof saveRewardsState === 'function') saveRewardsState();
    }
}

function updateAchievementProgress(achievementId, value) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    // Si ya está desbloqueado, no actualizar
    if (achievementsState.unlockedAchievements.includes(achievementId)) return;

    // Actualizar progreso
    achievementsState.progress[achievementId] = value;

    // Verificar si se completó
    if (achievement.type === 'progress' || achievement.type === 'cumulative' || achievement.type === 'single_game') {
        if (value >= achievement.requirement) {
            unlockAchievement(achievementId);
        }
    }

    saveAchievementsState();
}

function incrementAchievementProgress(achievementId, amount = 1) {
    if (!achievementsState.progress[achievementId]) {
        achievementsState.progress[achievementId] = 0;
    }

    achievementsState.progress[achievementId] += amount;
    updateAchievementProgress(achievementId, achievementsState.progress[achievementId]);
}

function showAchievementUnlocked(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notif-content">
            <div class="achievement-notif-header">
                <span class="achievement-notif-trophy">🏆</span>
                <strong>¡LOGRO DESBLOQUEADO!</strong>
            </div>
            <div class="achievement-notif-body">
                <span class="achievement-notif-icon">${achievement.icon}</span>
                <div class="achievement-notif-text">
                    <strong>${achievement.name}</strong>
                    <p>${achievement.description}</p>
                    <span class="achievement-notif-points">+${achievement.points} puntos</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function getAchievementsByCategory(category) {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

function getAchievementProgress(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return 0;

    const progress = achievementsState.progress[achievementId] || 0;

    if (achievement.type === 'simple') {
        return achievementsState.unlockedAchievements.includes(achievementId) ? 1 : 0;
    }

    if (achievement.requirement) {
        return Math.min(progress, achievement.requirement);
    }

    return progress;
}

function isAchievementUnlocked(achievementId) {
    return achievementsState.unlockedAchievements.includes(achievementId);
}

function getCompletionPercentage() {
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = achievementsState.unlockedAchievements.length;
    return Math.floor((unlocked / total) * 100);
}

function saveAchievementsState() {
    localStorage.setItem('wacheck_achievements', JSON.stringify(achievementsState));

    // También guardar en el usuario si existe
    if (gameState.currentUser && gameState.currentUser.id !== 0) {
        gameState.currentUser.achievementsData = achievementsState;
        if (typeof saveCurrentUserProgress === 'function') {
            saveCurrentUserProgress();
        }
    }
}

// ============================================
// FUNCIONES DE UI
// ============================================

function updateAchievementsUI() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;

    let html = '';

    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(categoryKey => {
        const category = ACHIEVEMENT_CATEGORIES[categoryKey];
        const categoryAchievements = getAchievementsByCategory(categoryKey);

        if (categoryAchievements.length === 0) return;

        html += `
            <div class="achievement-category">
                <div class="category-header">
                    <span class="category-icon" style="color: ${category.color}">${category.icon}</span>
                    <h3>${category.name}</h3>
                    <span class="category-progress">${categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length}/${categoryAchievements.length}</span>
                </div>
                <div class="achievements-grid">
                    ${categoryAchievements.map(achievement => {
            const unlocked = isAchievementUnlocked(achievement.id);
            const progress = getAchievementProgress(achievement.id);
            const requirement = achievement.requirement || 1;
            const percentage = (progress / requirement) * 100;

            // Ocultar logros secretos no desbloqueados
            if (achievement.hidden && !unlocked) {
                return `
                                <div class="achievement-card locked hidden">
                                    <div class="achievement-icon">🔒</div>
                                    <div class="achievement-info">
                                        <h4>???</h4>
                                        <p>Logro secreto</p>
                                    </div>
                                </div>
                            `;
            }

            return `
                            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-info">
                                    <h4>${achievement.name}</h4>
                                    <p>${achievement.description}</p>
                                    ${!unlocked && achievement.requirement ? `
                                        <div class="achievement-progress-bar">
                                            <div class="achievement-progress-fill" style="width: ${percentage}%"></div>
                                        </div>
                                        <div class="achievement-progress-text">${progress}/${requirement}</div>
                                    ` : ''}
                                    <div class="achievement-points">
                                        ${unlocked ? '✓' : ''} ${achievement.points} puntos
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openAchievementsMenu() {
    if (typeof closeAllMenus === 'function') closeAllMenus();

    document.getElementById('achievementsMenu').classList.add('active');
    document.getElementById('menuOverlay').classList.add('active');

    // Actualizar estadísticas
    document.getElementById('achievementsTotalPoints').textContent = achievementsState.totalPoints;
    document.getElementById('achievementsUnlocked').textContent = achievementsState.unlockedAchievements.length;
    document.getElementById('achievementsTotal').textContent = Object.keys(ACHIEVEMENTS).length;
    document.getElementById('achievementsPercentage').textContent = getCompletionPercentage();

    updateAchievementsUI();
}

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        initializeAchievements();

        // Actualizar contador en index
        const achievementsMainDisplay = document.getElementById('achievementsUnlockedMain');
        if (achievementsMainDisplay) {
            achievementsMainDisplay.textContent = achievementsState.unlockedAchievements.length;
        }
    });
}
