// ============================================================
// js/game/projectiles.js — Object Pool para proyectiles
// Extraído de script.js (eliminado de allí para evitar duplicado).
// Debe cargarse ANTES que script.js.
// ============================================================
(function () {
    'use strict';

    window.projectilePool = {
        _pool: [],
        maxSize: 150,

        get(type) {
            let p;
            if (this._pool.length > 0) {
                p = this._pool.pop();
                p.className = `projectile ${type}`;
            } else {
                p = document.createElement('div');
                p.className = `projectile ${type}`;
            }

            if (type === 'fire') p.classList.add('fire-projectile');
            if (type === 'ice')  p.classList.add('ice-projectile');

            p.style.display = 'block';
            p.style.zIndex  = '10';
            return p;
        },

        release(p) {
            if (this._pool.length < this.maxSize) {
                p.style.display = 'none';
                if (p.parentNode) p.parentNode.removeChild(p);
                // Reset visual estado
                p.style.left = p.style.top = p.style.transform = '';
                this._pool.push(p);
            } else if (p.parentNode) {
                p.parentNode.removeChild(p);
            }
        },

        // Devolver capacidad de reutilización al pool para diagnóstico
        stats() {
            return { pooled: this._pool.length, maxSize: this.maxSize };
        }
    };

    console.log('[Projectiles] Pool initialized');
})();
