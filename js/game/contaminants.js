// ============================================================
// js/game/contaminants.js — Tipos de contaminantes
// Extraído de script.js. Puede ser sobreescrito por la API
// cuando admin_handler.php?action=list_contaminants responda.
// ============================================================
(function () {
    'use strict';

    function normalizeModelPath(pathValue) {
        if (!pathValue || typeof pathValue !== 'string') return pathValue;
        return pathValue
            .replace('/allDefenderTypes/', '/alldefendertypes/')
            .replace('/allContaminatorTypes/', '/allcontaminatortypes/');
    }

    function normalizeImagePath(imageValue, fallbackPath) {
        const raw = (imageValue || '').toString().trim();
        if (!raw) return normalizeModelPath(fallbackPath);
        if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
        if (raw.startsWith('./')) return normalizeModelPath(raw);
        return normalizeModelPath(`./${raw}`);
    }

    function normalizeIconKey(value) {
        const raw = (value || '').toString().trim();
        if (!raw) return '';
        return raw
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .replace(/^El/i, '')
            .replace(/[^a-zA-Z0-9_-]/g, '');
    }

    // Datos base — mismos valores que tenía script.js
    const BASE_CONTAMINANTS = [
        { icon: 'Fabrica', image: './models/allContaminatorTypes/Fabrica/Fabrica.png', health: 60,   speed: 1.0, coins: 15, name: 'Fábrica' },
        { icon: 'Petroleo', image: './models/allContaminatorTypes/Petroleo/Petroleo.png', health: 90,   speed: 0.8, coins: 25, name: 'Petróleo' },
        { icon: 'Nuclear', image: './models/allContaminatorTypes/Nuclear/Nuclear.png', health: 120,  speed: 0.6, coins: 40, name: 'Nuclear' },
        { icon: 'Basura', image: './models/allContaminatorTypes/Basura/Basura.png', health: 40,   speed: 1.2, coins: 10, name: 'Basura' },
        { icon: 'Auto', image: './models/allContaminatorTypes/Auto/Auto.png', health: 80,   speed: 1.1, coins: 20, name: 'Auto' },
        { icon: 'Quimico', image: './models/allContaminatorTypes/Quimico/Quimico.png', health: 120,  speed: 0.9, coins: 30, name: 'Químico' },
        { icon: 'Fuego', image: './models/allContaminatorTypes/Fuego/Fuego.png', health: 90,   speed: 1.3, coins: 22, name: 'Fuego' },
        { icon: 'Toxico', image: './models/allContaminatorTypes/Toxico/Toxico.png', health: 350,  speed: 0.7, coins: 50, name: 'Tóxico' },
        { icon: 'Huracan', image: './models/allContaminatorTypes/Huracan/Huracan.png', health: 110,  speed: 1.4, coins: 28, name: 'Huracán' },
        { icon: 'Demonio', image: './models/allContaminatorTypes/Demonio/Demonio.png', health: 250,  speed: 0.5, coins: 60, name: 'Demonio' },
        { icon: 'Fantasma', image: './models/allContaminatorTypes/Fantasma/Fantasma.png', health: 80,   speed: 1.5, coins: 35, name: 'Fantasma',
          ability: { type: 'phase', chance: 0.2, duration: 1500 } },
        { icon: 'Tanque', image: './models/allContaminatorTypes/Tanque/Tanque.png', health: 800,  speed: 0.4, coins: 70, name: 'Tanque' },
        { icon: 'Leviatan', image: './models/allContaminatorTypes/Leviatan/Leviatan.png', health: 1500, speed: 0.5, coins: 300, name: 'El Leviatán',
          isBoss: true,
          ability: { type: 'lane_change', cooldown: 8000, lastUsed: 0 } }
    ];

    // Exponer globalmente como fallback (script.js ya define allContaminatorTypes,
    // pero lo hace DESPUÉS de este módulo en el orden de carga).
    // Si script.js no redefine la variable, este módulo provee el array.
    if (!window.allContaminatorTypes) {
        window.allContaminatorTypes = BASE_CONTAMINANTS.map(c => Object.assign({}, c));
    }

    async function loadContaminants() {
        try {
            const res = await fetch('api/admin_handler.php?action=list_contaminants', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Game-Client': 'wacheck-web'
                }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data && Array.isArray(data.contaminants) && data.contaminants.length > 0) {
                window.allContaminatorTypes = data.contaminants.map(c => {
                    const icon = normalizeIconKey(c.icon || c.key || c.name) || 'Nuclear';
                    const fallbackImage = `./models/allContaminatorTypes/${icon}/${icon}.png`;
                    return {
                        icon:   icon,
                        image:  normalizeImagePath(c.image || c.icon_url, fallbackImage),
                        health: Number(c.health) || 100,
                        speed:  Number(c.speed)  || 1.0,
                        coins:  Number(c.coins)  || 20,
                        name:   c.name   || 'Contaminante',
                        ...(c.is_boss    ? { isBoss: true } : {}),
                        ...(c.ability    ? { ability: c.ability } : {})
                    };
                });
                console.log('[Contaminants] Loaded from server:', window.allContaminatorTypes.length, 'types');
            } else {
                console.warn('[Contaminants] No data from server, using base values');
            }
        } catch (err) {
            console.warn('[Contaminants] Could not reach server:', err.message);
        }

        window.dispatchEvent(new CustomEvent('wacheckContaminantsReady'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContaminants);
    } else {
        loadContaminants();
    }
})();
