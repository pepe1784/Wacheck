// ============================================================
// js/game/config.js — Configuración del juego desde el servidor
// Cargado antes que script.js. Llena window.WacheckConfig con
// los valores del admin panel; si falla, usa valores por defecto.
// ============================================================
(function () {
    'use strict';

    // Valores por defecto (idénticos a los hardcodeados en script.js anteriormente)
    const DEFAULTS = {
        grid_rows: 5,
        grid_cols: 9,
        starting_coins: 100,
        starting_health: 100,
        wave_count: 30,
        wave_interval_ms: 3000,
        contaminator_speed_multiplier: 1.0,
        coin_multiplier: 1.0,
        health_multiplier: 1.0
    };

    // Exponer globalmente antes de la carga async para que script.js
    // siempre tenga un WacheckConfig disponible desde el primer frame.
    window.WacheckConfig = Object.assign({}, DEFAULTS);

    async function loadConfig() {
        try {
            const res = await fetch('api/admin_handler.php?action=get_game_config', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data && data.config) {
                // Merge: los valores del servidor sobreescriben los defaults
                window.WacheckConfig = Object.assign({}, DEFAULTS, data.config);
                console.log('[Config] Loaded from server:', window.WacheckConfig);
            } else if (data && !data.error) {
                window.WacheckConfig = Object.assign({}, DEFAULTS, data);
                console.log('[Config] Loaded from server (flat):', window.WacheckConfig);
            } else {
                console.warn('[Config] Server returned error, using defaults:', data?.error);
            }
        } catch (err) {
            console.warn('[Config] Could not reach server, using defaults:', err.message);
        }

        // Disparar evento para que otros módulos sepan que la config está lista
        window.dispatchEvent(new CustomEvent('wacheckConfigReady', {
            detail: window.WacheckConfig
        }));
    }

    // Iniciar carga en cuanto el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfig);
    } else {
        loadConfig();
    }
})();
