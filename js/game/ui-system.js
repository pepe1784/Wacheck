// ============================================================
// js/game/ui-system.js — Sistema de UI y actualización visual
// Gestiona render de elementos de juego, mensajes y estados visuales.
// Depende de: gameState, allDefenderTypes, DOM
// Se inyectan dependencias globales via window cuando se carga.
// ============================================================
(function () {
    'use strict';

    function showFloatingText(text, element, className) {
        const floatText = document.createElement('div');
        floatText.className = `floating-text ${className}`;
        floatText.textContent = text;
        // Si el elemento es el body, lo posiciona en el centro. Si no, sobre el elemento.
        const container = element === document.body ? document.body : element;
        container.appendChild(floatText);
        setTimeout(() => floatText.remove(), 2000);
    }

    function updateIslandContamination() {
        const gs = window.gameState;
        const island = document.getElementById('island');
        const level = Math.min(Math.floor(gs.contaminationLevel / 3), 5);

        island.className = 'island';
        if (level > 0) {
            island.classList.add(`contaminated-${level}`);
        }
    }

    function updateWaveStatus(status) {
        const el = document.getElementById('waveStatus');
        if (el) el.textContent = status;
    }

    function updateUI() {
        const gs = window.gameState;
        const adt = window.allDefenderTypes;

        document.getElementById('coinCount').textContent = gs.coins;
        document.getElementById('waveCount').textContent = gs.wave;
        document.getElementById('healthCount').textContent = gs.health;
        
        // CORRECCIÓN: Durante el juego, mostrar monedas ganadas en esta sesión, no el total
        document.getElementById('specialCoins').textContent = gs.coinsEarnedThisSession;

        // Actualizar también los displays en la página principal (mostrar total del usuario)
        const specialCoinsDisplay = document.getElementById('specialCoinsDisplay');
        const specialCoinsDisplay2 = document.getElementById('specialCoinsDisplay2');
        if (specialCoinsDisplay) {
            specialCoinsDisplay.textContent = gs.specialCoins;
        }
        if (specialCoinsDisplay2) {
            specialCoinsDisplay2.textContent = gs.specialCoins;
        }

        document.querySelectorAll('.defender-card').forEach(card => {
            const type = card.dataset.type;
            if (type) { // NEW: Verificar que existe el tipo (excluir removal-tool)
                const cost = adt[type].cost;
                if (gs.coins < cost) {
                    card.classList.add('disabled');
                } else {
                    card.classList.remove('disabled');
                }
            }
        });
    }

    function showMessage(title, text, buttons, timeout = 0) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').innerHTML = text; // Cambiar a innerHTML para interpretar HTML

        const buttonsContainer = document.getElementById('messageButtons');
        buttonsContainer.innerHTML = '';

        if (buttons && buttons.length > 0) {
            buttons.forEach((btnInfo, index) => {
                const button = document.createElement('button');
                button.textContent = btnInfo.text;

                // Mejorar el manejo de acciones
                if (typeof btnInfo.action === 'string') {
                    // Si es una string, evaluar como función
                    button.onclick = () => {
                        try {
                            eval(btnInfo.action);
                        } catch (e) {
                            console.error('Error ejecutando acción:', e);
                            hideMessage();
                        }
                    };
                } else if (typeof btnInfo.action === 'function') {
                    // Si es una función, asignar directamente
                    button.onclick = btnInfo.action;
                } else {
                    // Si no hay acción, solo cerrar el mensaje
                    button.onclick = hideMessage;
                }

                // Añadir clases CSS para estilos
                if (btnInfo.class) {
                    button.className = btnInfo.class;
                } else {
                    // Clases por defecto según el índice
                    if (index === 0 && buttons.length > 1) {
                        button.className = 'success';
                    } else if (index === buttons.length - 1 && buttons.length > 1) {
                        button.className = 'secondary';
                    }
                }

                buttonsContainer.appendChild(button);
            });
        } else {
            // Si no hay botones, crear uno por defecto
            const okButton = document.createElement('button');
            okButton.textContent = '¡Entendido!';
            okButton.className = 'success';
            okButton.onclick = hideMessage;
            buttonsContainer.appendChild(okButton);
        }

        const msgBox = document.getElementById('gameMessage');
        msgBox.style.display = 'flex';
        msgBox.classList.add('show');

        // Si se proporciona un timeout, ocultar el mensaje después de ese tiempo
        if (timeout > 0) {
            setTimeout(() => {
                hideMessage();
            }, timeout);
        }
    }

    function hideMessage() {
        const msgBox = document.getElementById('gameMessage');
        if (msgBox) {
            msgBox.classList.remove('game-over');
            msgBox.classList.remove('show');
            msgBox.classList.add('hiding');

            setTimeout(() => {
                msgBox.style.display = 'none';
                msgBox.classList.remove('hiding');
            }, 300);
        }
    }

    // Exportar al namespace global
    window.WacheckUI = {
        showFloatingText: showFloatingText,
        updateIslandContamination: updateIslandContamination,
        updateWaveStatus: updateWaveStatus,
        updateUI: updateUI,
        showMessage: showMessage,
        hideMessage: hideMessage
    };

    console.log('[UI] System loaded');
})();
