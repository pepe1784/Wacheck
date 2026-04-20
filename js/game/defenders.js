// ============================================================
// js/game/defenders.js — Tipos de defensores desde el servidor
// Cargado antes que script.js. Llena window.allDefenderTypes y
// window.unlockableDefenders; fallback a los valores hardcodeados
// que ya existen en script.js si la API no responde.
// ============================================================
(function () {
    'use strict';

    // Indicador para que script.js sepa si ya fueron cargados por este módulo
    window._defendersLoadedFromAPI = false;

    function normalizeImagePath(imageValue, fallbackPath) {
        const raw = (imageValue || '').toString().trim();
        if (!raw) return fallbackPath;
        if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
        if (raw.startsWith('./')) return raw;
        return `./${raw}`;
    }

    async function loadDefenders() {
        try {
            const res = await fetch('api/admin_handler.php?action=list_defenders', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Game-Client': 'wacheck-web'
                }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data && Array.isArray(data.defenders) && data.defenders.length > 0) {
                // Construir objeto allDefenderTypes desde la respuesta del servidor.
                // Cada entrada tiene: id, name, damage, cost, health, range,
                // shoot_interval, projectile, unlock_cost, description, icon
                const apiDefenders = {};
                const apiUnlockable = {};

                data.defenders.forEach(d => {
                    const id = (d.key || d.id || '').toString().trim();
                    if (!id) return;
                    const explicitImage = (d.image || d.icon_url || '').toString().trim();

                    apiDefenders[id] = {
                        icon:           d.icon   || '',
                        image:          explicitImage ? normalizeImagePath(explicitImage, '') : '',
                        name:           d.name   || id,
                        damage:         Number(d.damage)         || 25,
                        cost:           Number(d.cost)           || 50,
                        shootInterval:  Number(d.shoot_interval) || 1200,
                        range:          Number(d.range)          || 4,
                        health:         Number(d.health)         || 100,
                        projectile:     d.projectile             || 'water',
                        info:           d.description            || '',
                        // Propiedades especiales opcionales
                        ...(d.is_generator  ? { isGenerator: true,   generate: Number(d.generate) || 20, interval: Number(d.gen_interval) || 5000 } : {}),
                        ...(d.is_support    ? { isSupport: true,     buff: d.buff } : {}),
                        ...(d.shots         ? { shots: Number(d.shots), shotDelay: Number(d.shot_delay) || 150 } : {}),
                        ...(d.self_heal     ? { selfHeal: { amount: Number(d.self_heal_amount) || 5, interval: Number(d.self_heal_interval) || 5000 } } : {}),
                        ...(d.support_aura  ? { supportAura: d.support_aura } : {}),
                        ...(d.status_effect ? { statusEffect: d.status_effect } : {}),
                        ...(d.chain         ? { chain: d.chain } : {}),
                        ...(d.splash_radius ? { splashRadius: Number(d.splash_radius) } : {}),
                        ...(d.bidirectional ? { bidirectional: true } : {})
                    };

                    if (d.unlock_cost > 0) {
                        apiUnlockable[id] = {
                            cost: Number(d.unlock_cost),
                            description: d.description || ''
                        };
                    }
                });

                // Merge into existing object so hardcoded entries (and front-end-only
                // IDs like 'water-shield') are never wiped by the API response.
                if (window.allDefenderTypes && typeof window.allDefenderTypes === 'object') {
                    Object.assign(window.allDefenderTypes, apiDefenders);
                } else {
                    window.allDefenderTypes = apiDefenders;
                }
                if (window.unlockableDefenders && typeof window.unlockableDefenders === 'object') {
                    Object.assign(window.unlockableDefenders, apiUnlockable);
                } else {
                    window.unlockableDefenders = apiUnlockable;
                }
                window._defendersLoadedFromAPI = true;
                console.log('[Defenders] Loaded from server:', Object.keys(apiDefenders).length, 'types');
            } else {
                console.warn('[Defenders] No data from server, keeping hardcoded fallback');
            }
        } catch (err) {
            console.warn('[Defenders] Could not reach server, using hardcoded fallback:', err.message);
        }

        window.dispatchEvent(new CustomEvent('wacheckDefendersReady'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDefenders);
    } else {
        loadDefenders();
    }
})();
