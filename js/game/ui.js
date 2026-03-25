// ============================================================
// js/game/ui.js — Funciones de actualización de la interfaz
// Extraído de script.js. Depende de gameState y allDefenderTypes
// que deben existir en el scope global (definidos en script.js).
// Se carga después de los módulos de datos pero antes de script.js.
// ============================================================
(function () {
    'use strict';

    /**
     * Actualiza todos los contadores visibles del HUD.
     * Llamada cada frame desde el game loop.
     */
    window.updateUI = function updateUI() {
        const gs = window.gameState;
        if (!gs) return;

        const el = id => document.getElementById(id);

        const coinEl = el('coinCount');
        const waveEl = el('waveCount');
        const hpEl   = el('healthCount');
        const spEl   = el('specialCoins');

        if (coinEl) coinEl.textContent = gs.coins;
        if (waveEl) waveEl.textContent = gs.wave;
        if (hpEl)   hpEl.textContent   = gs.health;
        if (spEl)   spEl.textContent   = gs.coinsEarnedThisSession;

        const sp1 = el('specialCoinsDisplay');
        const sp2 = el('specialCoinsDisplay2');
        if (sp1) sp1.textContent = gs.specialCoins;
        if (sp2) sp2.textContent = gs.specialCoins;

        // Deshabilitar cartas de defender si no hay suficientes monedas
        const adt = window.allDefenderTypes;
        if (adt) {
            document.querySelectorAll('.defender-card').forEach(card => {
                const type = card.dataset.type;
                if (type && adt[type]) {
                    card.classList.toggle('disabled', gs.coins < adt[type].cost);
                }
            });
        }
    };

    /**
     * Muestra un mensaje modal en el juego.
     */
    window.showMessage = function showMessage(title, text, buttons, timeout) {
        timeout = timeout || 0;
        const titleEl   = document.getElementById('messageTitle');
        const textEl    = document.getElementById('messageText');
        const btnEl     = document.getElementById('messageButtons');
        const msgBox    = document.getElementById('gameMessage');

        if (titleEl) titleEl.textContent = title;
        if (textEl)  textEl.innerHTML    = text;

        if (btnEl) {
            btnEl.innerHTML = '';
            if (buttons && buttons.length > 0) {
                buttons.forEach(btnInfo => {
                    const button = document.createElement('button');
                    button.textContent = btnInfo.text;
                    if (btnInfo.class) button.className = btnInfo.class;
                    if (typeof btnInfo.action === 'string') {
                        button.onclick = () => {
                            try { eval(btnInfo.action); } // eslint-disable-line no-eval
                            catch (e) { console.error('showMessage action:', e); window.hideMessage && window.hideMessage(); }
                        };
                    } else if (typeof btnInfo.action === 'function') {
                        button.onclick = btnInfo.action;
                    }
                    btnEl.appendChild(button);
                });
            }
        }

        if (msgBox) msgBox.style.display = 'flex';

        if (timeout > 0) {
            setTimeout(() => window.hideMessage && window.hideMessage(), timeout);
        }
    };

    /**
     * Oculta el mensaje modal.
     */
    window.hideMessage = function hideMessage() {
        const msgBox = document.getElementById('gameMessage');
        if (msgBox) msgBox.style.display = 'none';
    };

    /**
     * Actualiza el display de oleadas: número actual y estado.
     */
    window.updateWaveStatus = function updateWaveStatus(status) {
        const waveEl = document.getElementById('waveComplete');
        if (waveEl) {
            waveEl.textContent = status;
            waveEl.style.display = status ? 'block' : 'none';
        }
    };

    /**
     * Actualiza la barra de vida de un defensor en el tablero.
     */
    window.updateDefenderHealthBarColor = function updateDefenderHealthBarColor(defender) {
        if (!defender || !defender.element) return;
        const bar = defender.element.querySelector('.health-bar-fill');
        if (!bar) return;
        const pct = (defender.health / defender.maxHealth) * 100;
        bar.style.width = pct + '%';
        bar.style.background =
            pct > 60 ? '#10b981' :
            pct > 30 ? '#f59e0b' : '#ef4444';
    };

    console.log('[UI] Module loaded');
})();
