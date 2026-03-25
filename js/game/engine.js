// ============================================================
// js/game/engine.js — Game loop con requestAnimationFrame
// Extraído y limpiado de script.js.
// El loop llama a las funciones del juego que viven en script.js;
// este módulo solo gestiona el timing y delta time.
// DEBE cargarse después de script.js.
// ============================================================
(function () {
    'use strict';

    // Delta time state
    let lastFrameTime = 0;
    window.deltaTime  = 0;

    // DOM batcher compartido: reutilizar la misma instancia para todos los módulos
    window.domUpdateBatcher = window.domUpdateBatcher || {
        updates: [],
        isScheduled: false,

        add(element, property, value) {
            this.updates.push({ element, property, value });
            if (!this.isScheduled) {
                this.isScheduled = true;
                requestAnimationFrame(() => this.flush());
            }
        },

        flush() {
            for (const update of this.updates) {
                if (update.property === 'transform') {
                    update.element.style.transform = update.value;
                } else if (update.property === 'left') {
                    update.element.style.left = update.value;
                } else if (update.property === 'width') {
                    update.element.style.width = update.value;
                } else if (update.property === 'top') {
                    update.element.style.top = update.value;
                }
            }
            this.updates.length = 0;
            this.isScheduled = false;
        }
    };

    /**
     * Tick principal del juego.
     * Llama a las funciones globales definidas en script.js.
     * Si script.js reemplaza window.gameLoop, su versión tiene prioridad.
     */
    function engineLoop(currentTime) {
        // Calcular delta time en segundos; limitar a 100 ms para evitar
        // saltos grandes cuando el usuario cambia de pestaña.
        window.deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = currentTime;

        const gs = window.gameState;
        if (gs && gs.gameRunning && !gs.isPaused) {
            if (typeof window.moveContaminators    === 'function') window.moveContaminators();
            if (typeof window.updateProjectiles    === 'function') window.updateProjectiles();
            if (typeof window.shoot                === 'function') window.shoot();
            if (typeof window.processStatusEffects === 'function') window.processStatusEffects();
            if (typeof window.processDefenderAbilities === 'function') window.processDefenderAbilities();
        }

        requestAnimationFrame(engineLoop);
    }

    // Iniciar el loop solo cuando todo esté listo.
    // Si script.js llama a requestAnimationFrame(gameLoop) por su cuenta,
    // ese loop tendrá precedencia; este módulo no arranca automáticamente
    // para no duplicar ticks.
    window._startEngineLoop = function () {
        lastFrameTime = performance.now();
        requestAnimationFrame(engineLoop);
        console.log('[Engine] RAF loop started');
    };

    console.log('[Engine] Module loaded. Call window._startEngineLoop() to begin.');
})();
