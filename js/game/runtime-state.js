// ============================================================
// js/game/runtime-state.js — Estado compartido y utilidades base
// Centraliza el estado mutable del juego para que los módulos
// consuman una sola referencia estable.
// ============================================================
(function () {
    'use strict';

    const BASIC_DEFENDERS = [
        'filter',
        'plant',
        'recycler',
        'cleaner',
        'stream',
        'bubble',
        'wind',
        'earth'
    ];

    function createDefaultGameState(overrides) {
        const state = {
            coins: 100,
            health: 100,
            wave: 1,
            selectedDefender: null,
            selectedCost: 0,
            defenders: [],
            contaminators: [],
            gameRunning: false,
            waveActive: false,
            contaminatorsSpawned: 0,
            contaminatorsToSpawn: 0,
            projectiles: [],
            effects: [],
            statusEffects: [],
            currentUser: null,
            specialCoins: 0,
            coinsEarnedThisSession: 0,
            unlockedDefenders: [...BASIC_DEFENDERS],
            contaminationLevel: 0,
            coinsAtWaveStart: 100,
            isPaused: false,
            healthAtWaveStart: 100,
            defendersAtWaveStart: [],
            removalMode: false,
            selectedDefenderOnBoard: null,
            multiPlacementMode: false
        };

        return Object.assign(state, overrides || {});
    }

    function createDomUpdateBatcher() {
        return {
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
    }

    function resetGameState(target, overrides) {
        const nextState = createDefaultGameState(overrides);

        Object.keys(target).forEach(key => {
            delete target[key];
        });

        Object.assign(target, nextState);
        window.gameState = target;
        return target;
    }

    const runtime = window.WacheckGameRuntime || {};

    runtime.constants = runtime.constants || {};
    runtime.constants.basicDefenders = [...BASIC_DEFENDERS];

    runtime.createDefaultGameState = createDefaultGameState;
    runtime.resetGameState = resetGameState;
    runtime.state = (window.gameState && typeof window.gameState === 'object')
        ? window.gameState
        : createDefaultGameState();

    runtime.services = runtime.services || {};
    runtime.services.domUpdateBatcher = window.domUpdateBatcher || runtime.services.domUpdateBatcher || createDomUpdateBatcher();

    window.domUpdateBatcher = runtime.services.domUpdateBatcher;
    window.gameState = runtime.state;
    window.WacheckGameRuntime = runtime;
})();
