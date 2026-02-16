// ==========================================
// ANTI-CHEAT SYSTEM - Sistema de Detección de Trampas
// ==========================================
// Detecta modificaciones ilegales de estadísticas del juego
// y aplica penalizaciones automáticas

const AntiCheat = {
    // Estado de penalización del usuario
    violations: {
        count: 0,
        banned: false,
        warnings: [],
        timestamp: null
    },

    // Límites máximos calculados según mejoras posibles del juego
    // Estos valores consideran todas las mejoras de runas disponibles
    limits: {
        // DEFENSORES - Valores máximos posibles con todas las mejoras
        defenderDamage: {
            base: 150,      // Daño base máximo (Titán Tsunami)
            withUpgrades: 250,  // Con upgrade de daño nivel 10 (+30%)
            withCritical: 500   // Con crítico 2x
        },
        defenderHealth: {
            base: 500,      // Vida base máxima (Escudo)
            withUpgrades: 750   // Con upgrade de vida nivel 10 (+50%)
        },
        defenderRange: {
            base: 8,        // Rango base máximo
            withUpgrades: 10    // Con mejoras
        },

        // MONEDAS - Límites por oleada
        coinsPerWave: {
            base: 200,      // Monedas máximas por oleada normal
            withBoss: 500,  // Con jefe incluido
            accumulated: 10000  // Máximo acumulado razonable
        },

        // SALUD DEL JUGADOR
        playerHealth: {
            base: 100,
            withUpgrades: 150
        },

        // RECURSOS ESPECIALES
        specialCoins: {
            maxPerSession: 100,  // Máximo por sesión
            maxTotal: 99999      // Máximo total
        },

        // OLEADAS
        wave: {
            maxReasonable: 1000  // Oleada máxima razonable
        }
    },

    // Inicializar sistema
    init() {
        console.log('🛡️ Anti-Cheat System initialized');
        this.loadViolations();
        this.startMonitoring();
        
        // Verificar si el usuario está baneado
        if (this.violations.banned) {
            this.showPermanentWarning();
        }
    },

    // Cargar historial de violaciones
    loadViolations() {
        try {
            const saved = localStorage.getItem('wacheck_violations');
            if (saved) {
                this.violations = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading violations:', e);
        }
    },

    // Guardar violaciones
    saveViolations() {
        try {
            localStorage.setItem('wacheck_violations', JSON.stringify(this.violations));
        } catch (e) {
            console.error('Error saving violations:', e);
        }
    },

    // Iniciar monitoreo continuo
    startMonitoring() {
        // Verificar cada 2 segundos durante el juego
        setInterval(() => {
            if (typeof gameState !== 'undefined' && gameState.gameRunning) {
                this.validateGameState();
            }
        }, 2000);
    },

    // Validar estado completo del juego
    validateGameState() {
        if (this.violations.banned) return; // Si está baneado, no validar más

        const issues = [];

        // 1. VALIDAR MONEDAS
        if (gameState.coins > this.limits.coinsPerWave.accumulated) {
            issues.push({
                type: 'coins',
                value: gameState.coins,
                limit: this.limits.coinsPerWave.accumulated,
                severity: 'high'
            });
        }

        // 2. VALIDAR SALUD
        if (gameState.health > this.limits.playerHealth.withUpgrades) {
            issues.push({
                type: 'health',
                value: gameState.health,
                limit: this.limits.playerHealth.withUpgrades,
                severity: 'medium'
            });
        }

        // 3. VALIDAR OLEADA
        if (gameState.wave > this.limits.wave.maxReasonable) {
            issues.push({
                type: 'wave',
                value: gameState.wave,
                limit: this.limits.wave.maxReasonable,
                severity: 'medium'
            });
        }

        // 4. VALIDAR DEFENSORES
        if (gameState.defenders && gameState.defenders.length > 0) {
            gameState.defenders.forEach((defender, index) => {
                // Validar daño
                if (defender.baseDamage > this.limits.defenderDamage.withCritical) {
                    issues.push({
                        type: 'defender_damage',
                        value: defender.baseDamage,
                        limit: this.limits.defenderDamage.withCritical,
                        severity: 'critical',
                        defender: defender.type
                    });
                }

                // Validar vida
                if (defender.maxHealth > this.limits.defenderHealth.withUpgrades) {
                    issues.push({
                        type: 'defender_health',
                        value: defender.maxHealth,
                        limit: this.limits.defenderHealth.withUpgrades,
                        severity: 'critical',
                        defender: defender.type
                    });
                }

                // Validar rango
                if (defender.range > this.limits.defenderRange.withUpgrades) {
                    issues.push({
                        type: 'defender_range',
                        value: defender.range,
                        limit: this.limits.defenderRange.withUpgrades,
                        severity: 'high',
                        defender: defender.type
                    });
                }
            });
        }

        // 5. VALIDAR MONEDAS ESPECIALES
        if (gameState.specialCoins > this.limits.specialCoins.maxTotal) {
            issues.push({
                type: 'special_coins',
                value: gameState.specialCoins,
                limit: this.limits.specialCoins.maxTotal,
                severity: 'critical'
            });
        }

        // Si hay problemas, aplicar penalización
        if (issues.length > 0) {
            this.applyPenalty(issues);
        }
    },

    // Aplicar penalización por trampas
    applyPenalty(issues) {
        console.warn('⚠️ ANTI-CHEAT: Valores irregulares detectados', issues);

        // Incrementar contador de violaciones
        this.violations.count++;
        this.violations.timestamp = Date.now();
        this.violations.warnings.push({
            time: new Date().toISOString(),
            issues: issues,
            wave: gameState.wave
        });

        // Penalización según gravedad
        const hasCritical = issues.some(i => i.severity === 'critical');
        
        if (hasCritical || this.violations.count >= 3) {
            // BANEO PERMANENTE
            this.violations.banned = true;
            this.blockRewards();
            this.showPermanentWarning();
            this.resetGameProgress();
            
            console.error('🚫 ANTI-CHEAT: Usuario baneado por violaciones graves');
        } else {
            // ADVERTENCIA TEMPORAL
            this.showTemporaryWarning(issues);
            this.blockRewards();
        }

        this.saveViolations();
    },

    // Bloquear obtención de recompensas
    blockRewards() {
        // Marcar flag global
        window.REWARDS_BLOCKED = true;

        // Interceptar funciones de recompensa
        if (typeof awardSpecialCoins === 'function') {
            const originalAwardCoins = window.awardSpecialCoins;
            window.awardSpecialCoins = function(amount) {
                console.warn('⚠️ ANTI-CHEAT: Recompensas bloqueadas');
                AntiCheat.showRewardBlockedMessage();
                return 0; // No dar monedas
            };
        }

        // Interceptar guardado de progreso
        const originalSave = window.saveProgressToServer;
        if (originalSave) {
            window.saveProgressToServer = function() {
                console.warn('⚠️ ANTI-CHEAT: Guardado de progreso bloqueado');
                return Promise.resolve({success: false, blocked: true});
            };
        }
    },

    // Mostrar advertencia permanente en pantalla
    showPermanentWarning() {
        // Crear overlay de advertencia
        let warning = document.getElementById('anticheat-permanent-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'anticheat-permanent-warning';
            warning.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white;
                padding: 15px;
                text-align: center;
                font-weight: bold;
                z-index: 99999;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                border-bottom: 3px solid #991b1b;
                animation: warningPulse 2s infinite;
            `;
            warning.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 24px;">🚫</span>
                    <div>
                        <div style="font-size: 16px;">SISTEMA ANTI-TRAMPA ACTIVADO</div>
                        <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                            Valores irregulares detectados. Las recompensas están bloqueadas. 
                            Violaciones: ${this.violations.count}
                        </div>
                    </div>
                    <span style="font-size: 24px;">⚠️</span>
                </div>
            `;

            // Agregar animación
            const style = document.createElement('style');
            style.textContent = `
                @keyframes warningPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(warning);
        }
    },

    // Mostrar advertencia temporal
    showTemporaryWarning(issues) {
        const issueText = issues.map(i => 
            `${i.type}: ${i.value} (límite: ${i.limit})`
        ).join(', ');

        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: start;">
                <div style="font-size: 32px;">⚠️</div>
                <div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">
                        Advertencia del Sistema
                    </div>
                    <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">
                        Se detectaron valores irregulares en tu sesión. 
                        Las recompensas están temporalmente bloqueadas.
                    </div>
                    <div style="font-size: 11px; margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px;">
                        Violación #${this.violations.count}<br>
                        ${issueText.substring(0, 100)}
                    </div>
                </div>
            </div>
        `;

        // Agregar animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    },

    // Mostrar mensaje cuando se bloquean recompensas
    showRewardBlockedMessage() {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc2626;
            color: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            z-index: 99999;
            text-align: center;
            animation: popIn 0.3s ease-out;
        `;
        msg.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🚫</div>
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">
                Recompensas Bloqueadas
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                No se pueden otorgar recompensas debido a valores irregulares
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    },

    // Resetear progreso del juego (penalización máxima)
    resetGameProgress() {
        if (typeof gameState !== 'undefined') {
            // No resetear todo, solo limitar valores a máximos permitidos
            gameState.coins = Math.min(gameState.coins, this.limits.coinsPerWave.base);
            gameState.specialCoins = Math.min(gameState.specialCoins, this.limits.specialCoins.maxPerSession);
            gameState.health = Math.min(gameState.health, this.limits.playerHealth.base);

            // Limitar stats de defensores
            if (gameState.defenders) {
                gameState.defenders.forEach(defender => {
                    if (defender.baseDamage > this.limits.defenderDamage.withUpgrades) {
                        defender.baseDamage = this.limits.defenderDamage.base;
                    }
                    if (defender.maxHealth > this.limits.defenderHealth.withUpgrades) {
                        defender.maxHealth = this.limits.defenderHealth.base;
                        defender.health = defender.maxHealth;
                    }
                    if (defender.range > this.limits.defenderRange.withUpgrades) {
                        defender.range = this.limits.defenderRange.base;
                    }
                });
            }

            // Actualizar UI
            if (typeof updateUI === 'function') {
                updateUI();
            }
        }

        console.warn('⚠️ ANTI-CHEAT: Valores ajustados a límites permitidos');
    },

    // Verificar si el usuario está limpio
    isClean() {
        return !this.violations.banned && this.violations.count === 0;
    },

    // Obtener información del sistema
    getStatus() {
        const status = {
            active: true,
            clean: this.isClean(),
            banned: this.violations.banned,
            violations: this.violations.count,
            rewardsBlocked: window.REWARDS_BLOCKED === true,
            lastViolation: this.violations.timestamp ? new Date(this.violations.timestamp).toLocaleString() : 'Ninguna',
            warnings: this.violations.warnings.length
        };

        console.log('🛡️ ESTADO DEL SISTEMA ANTI-CHEAT:');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Sistema activo: ${status.active ? 'SÍ' : 'NO'}`);
        console.log(`${status.clean ? '✅' : '❌'} Estado: ${status.clean ? 'LIMPIO' : 'CON VIOLACIONES'}`);
        console.log(`${status.banned ? '🚫' : '✅'} Baneado: ${status.banned ? 'SÍ' : 'NO'}`);
        console.log(`⚠️ Violaciones totales: ${status.violations}`);
        console.log(`🔒 Recompensas bloqueadas: ${status.rewardsBlocked ? 'SÍ' : 'NO'}`);
        console.log(`📅 Última violación: ${status.lastViolation}`);
        console.log(`📝 Warnings registrados: ${status.warnings}`);
        console.log('═══════════════════════════════════════');

        if (!status.clean) {
            console.warn('⚠️ Para limpiar el registro: AntiCheat.resetViolations()');
        }

        return status;
    },

    // Reiniciar violaciones (para debugging o perdón)
    resetViolations() {
        this.violations = {
            count: 0,
            banned: false,
            warnings: [],
            timestamp: null
        };
        this.saveViolations();
        
        // Remover advertencia permanente
        const warning = document.getElementById('anticheat-permanent-warning');
        if (warning) warning.remove();
        
        // Restaurar funciones
        window.REWARDS_BLOCKED = false;
        
        console.log('✅ ANTI-CHEAT: Violaciones reseteadas');
    },

    // Validar hash de integridad (para detectar modificaciones de código)
    validateCodeIntegrity() {
        // Verificar que las funciones críticas no hayan sido modificadas
        const criticalFunctions = [
            'awardSpecialCoins',
            'handleContaminatorDeath',
            'gameOver'
        ];

        const suspicious = [];
        
        criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const funcString = window[funcName].toString();
                
                // Detectar si la función fue modificada con código sospechoso
                if (funcString.includes('999999') || 
                    funcString.includes('Infinity') ||
                    funcString.includes('= 99999')) {
                    suspicious.push(funcName);
                }
            }
        });

        if (suspicious.length > 0) {
            console.warn('⚠️ ANTI-CHEAT: Funciones modificadas detectadas:', suspicious);
            this.applyPenalty([{
                type: 'code_tampering',
                value: suspicious.join(', '),
                limit: 'original code',
                severity: 'critical'
            }]);
        }
    }
};

// Exportar para uso global
window.AntiCheat = AntiCheat;

// ==========================================
// COMANDOS DE CONSOLA RÁPIDOS
// ==========================================
// Comandos helper para facilitar el uso desde la consola

window.acStatus = () => AntiCheat.getStatus();
window.acReset = () => {
    if (confirm('⚠️ ¿Estás seguro de resetear todas las violaciones? Esto limpiará el historial y desbaneará al usuario.')) {
        AntiCheat.resetViolations();
        console.log('✅ Violaciones reseteadas correctamente');
    }
};
window.acLimits = () => {
    console.log('🛡️ LÍMITES DEL SISTEMA:');
    console.log('═══════════════════════════════════════');
    console.table(AntiCheat.limits);
};
window.acViolations = () => {
    console.log('📋 HISTORIAL DE VIOLACIONES:');
    console.log('═══════════════════════════════════════');
    if (AntiCheat.violations.warnings.length === 0) {
        console.log('✅ Sin violaciones registradas');
    } else {
        console.table(AntiCheat.violations.warnings);
    }
};
window.acHelp = () => {
    console.log('%c🛡️ SISTEMA ANTI-CHEAT - COMANDOS DISPONIBLES', 'font-size: 16px; font-weight: bold; color: #0891b2;');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('%cacStatus()%c       - Ver estado completo del sistema', 'color: #10b981; font-weight: bold', 'color: white');
    console.log('%cacReset()%c        - Resetear todas las violaciones', 'color: #f59e0b; font-weight: bold', 'color: white');
    console.log('%cacLimits()%c       - Ver límites máximos permitidos', 'color: #3b82f6; font-weight: bold', 'color: white');
    console.log('%cacViolations()%c   - Ver historial de violaciones', 'color: #ef4444; font-weight: bold', 'color: white');
    console.log('%cacHelp()%c         - Mostrar esta ayuda', 'color: #8b5cf6; font-weight: bold', 'color: white');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('%cMétodos avanzados:%c', 'font-weight: bold', 'font-weight: normal');
    console.log('  AntiCheat.validateGameState()    - Forzar validación inmediata');
    console.log('  AntiCheat.validateCodeIntegrity() - Verificar integridad del código');
    console.log('  AntiCheat.violations              - Objeto completo de violaciones');
    console.log('═══════════════════════════════════════════════════════════════');
};

// Mostrar mensaje de bienvenida con comandos
console.log('%c🛡️ Sistema Anti-Cheat cargado correctamente', 'background: #0891b2; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
console.log('%cEscribe acHelp() para ver comandos disponibles', 'color: #0891b2; font-style: italic;');

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AntiCheat.init());
} else {
    AntiCheat.init();
}

console.log('🛡️ Anti-Cheat System loaded');
