// ============================================
// CONFIGURACIÓN DEL SISTEMA DE RECOMPENSAS
// v1.0 - Valores configurables para balanceo
// ============================================

// Para modificar el sistema, edita estos valores aquí
// No es necesario tocar rewards.js a menos que añadas nuevas funciones

const REWARDS_CONFIG = {
    // ===== RECOMPENSAS DIARIAS =====
    dailyRewards: [
        { day: 1, coins: 50, runes: 5 },
        { day: 2, coins: 75, runes: 8 },
        { day: 3, coins: 100, runes: 12, specialCoins: 1 },
        { day: 4, coins: 150, runes: 15 },
        { day: 5, coins: 200, runes: 20, specialCoins: 2 },
        { day: 6, coins: 300, runes: 30, specialCoins: 3 },
        { day: 7, coins: 500, runes: 50, specialCoins: 5, antiTank: true }
    ],
    
    // ===== MISIONES =====
    missions: {
        // Oleadas
        wave_5: { requirement: 5, runes: 10, coins: 100 },
        wave_10: { requirement: 10, runes: 20, coins: 200 },
        wave_15: { requirement: 15, runes: 30, coins: 300 },
        
        // Jefes
        kill_boss: { requirement: 1, runes: 25, coins: 250, specialCoins: 1 },
        
        // Defensores
        place_defenders: { requirement: 10, runes: 15, coins: 150 },
        
        // Enemigos
        kill_enemies: { requirement: 50, runes: 20, coins: 200 },
        
        // Sin daño
        no_damage: { requirement: 1, runes: 35, specialCoins: 2 },
        
        // Monedas
        collect_coins: { requirement: 500, runes: 15, coins: 100 }
    },
    
    // ===== UPGRADES =====
    upgrades: {
        coinMultiplier: {
            maxLevel: 10,
            baseCost: 50,
            costIncrease: 25,
            effect: 0.10, // 10% por nivel
            description: '+10% de monedas por eliminación'
        },
        
        healthBoost: {
            maxLevel: 20,
            baseCost: 40,
            costIncrease: 20,
            effect: 5, // +5 salud por nivel
            description: '+5 de salud máxima'
        },
        
        defenderDamage: {
            maxLevel: 15,
            baseCost: 60,
            costIncrease: 30,
            effect: 0.05, // 5% por nivel
            description: '+5% de daño para todos los defensores'
        },
        
        startingCoins: {
            maxLevel: 10,
            baseCost: 45,
            costIncrease: 22,
            effect: 25, // +25 monedas por nivel
            description: '+25 monedas al inicio de cada oleada'
        },
        
        criticalChance: {
            maxLevel: 5,
            baseCost: 70,
            costIncrease: 35,
            effect: 0.03, // 3% por nivel
            description: '+3% de probabilidad de golpe crítico',
            critMultiplier: 2 // Daño x2 en crítico
        }
    },
    
    // ===== DEFENSOR ESPECIAL =====
    specialDefender: {
        id: 'antiTankArea',
        unlockDay: 7,
        stats: {
            icon: '',
            damage: 150,
            cost: 250,
            shootInterval: 3000,
            range: 6,
            health: 180,
            splashRadius: 2,
            bidirectional: true
        },
        description: '¡Recompensa especial! Ataca hacia adelante Y hacia atrás. Daño masivo en área.'
    },
    
    // ===== BALANCEO GENERAL =====
    balance: {
        // Runas por semana completa (todos los días + misiones promedio)
        expectedRunesPerWeek: 593,
        
        // Coste total para maximizar todos los upgrades
        totalCostAllUpgrades: 11745,
        
        // Semanas estimadas para maximizar todo
        weeksToMaxAll: 20,
        
        // Misiones diarias simultáneas
        dailyMissionsCount: 3,
        
        // Días consecutivos para resetear racha
        streakResetAfterDays: 2
    },
    
    // ===== NOTIFICACIONES =====
    notifications: {
        // Mostrar popup de recompensa diaria al login
        showDailyRewardPopup: true,
        
        // Mostrar notificación al completar misión
        showMissionComplete: true,
        
        // Duración de notificaciones (ms)
        notificationDuration: 3000,
        
        // Mostrar puntos rojos en menú
        showMenuBadges: true
    },
    
    // ===== UI =====
    ui: {
        // Colores principales
        colors: {
            runes: '#8e44ad',
            missions: '#3498db',
            rewards: '#f1c40f',
            critical: '#fbbf24',
            completed: '#2ecc71'
        },
        
        // Animaciones
        animations: {
            menuSlide: '0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            cardHover: '0.3s ease',
            notification: '0.5s ease'
        }
    }
};

// ============================================
// FUNCIONES HELPER PARA ACCEDER A LA CONFIG
// ============================================

function getUpgradeCost(upgradeType, currentLevel) {
    const config = REWARDS_CONFIG.upgrades[upgradeType];
    return config.baseCost + (currentLevel * config.costIncrease);
}

function getUpgradeEffect(upgradeType, level) {
    const config = REWARDS_CONFIG.upgrades[upgradeType];
    return config.effect * level;
}

function getDailyReward(day) {
    return REWARDS_CONFIG.dailyRewards.find(r => r.day === day);
}

function getMissionConfig(missionType) {
    return REWARDS_CONFIG.missions[missionType];
}

// ============================================
// NOTAS PARA DESARROLLADORES
// ============================================

/*
CÓMO MODIFICAR EL BALANCEO:

1. HACER MÁS GENEROSO:
   - Aumenta coins/runes en dailyRewards
   - Reduce baseCost en upgrades
   - Aumenta runes en missions

2. HACER MÁS DIFÍCIL:
   - Reduce coins/runes en dailyRewards
   - Aumenta baseCost en upgrades
   - Aumenta requirement en missions

3. AGREGAR NUEVAS MISIONES:
   - Añade entrada en MISSION_TEMPLATES (rewards.js)
   - Añade config en missions aquí
   - Implementa rastreo en script.js

4. AGREGAR NUEVOS UPGRADES:
   - Añade entrada en upgrades aquí
   - Implementa efecto en script.js
   - Actualiza UI en rewards.js

5. CAMBIAR DEFENSOR ESPECIAL:
   - Modifica specialDefender.stats
   - Actualiza allDefenderTypes en script.js
   - Cambia unlockDay si quieres otro día

ARCHIVOS A MODIFICAR:
- config.js (este archivo) → Valores de balanceo
- rewards.js → Lógica del sistema
- script.js → Integración con el juego
- usuarios.js → Guardado en servidor

TESTING:
- Usa console.log(rewardsState) para ver estado actual
- Usa localStorage.clear() para resetear todo
- Modifica rewardsState.dailyStreak manualmente para testing
*/

// Exportar configuración si se usa como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = REWARDS_CONFIG;
}
