// ============================================================
// js/game/projectiles-service.js — Sist. de proyectiles y daño
// Gestiona creación, movimiento, colisión y efectos de proyectiles.
// Depende de: gameState, allDefenderTypes, projectilePool, domUpdateBatcher
// Se inyectan dependencias globales via window cuando se carga.
// ============================================================
(function () {
    'use strict';

    // ============================================
    // SISTEMA DE PARTÍCULAS EFICIENTE
    // ============================================
    const particlePool = {
        pool: [],
        maxSize: 50,

        get() {
            if (this.pool.length > 0) {
                return this.pool.pop();
            }
            return document.createElement('div');
        },

        release(particle) {
            if (this.pool.length < this.maxSize) {
                particle.className = '';
                particle.style.cssText = '';
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                this.pool.push(particle);
            }
        }
    };

    function createExplosionEffect(targetElement, type) {
        const colors = {
            water: '#3b82f6',
            fire: '#f59e0b',
            ice: '#0ea5e9',
            nature: '#10b981',
            energy: '#fbbf24',
            pure: '#a855f7',
            explosion: '#ef4444'
        };

        const color = colors[type] || '#fbbf24';
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const particle = particlePool.get();
            particle.className = 'particle explosion-particle';
            particle.style.background = color;
            particle.style.left = '50%';
            particle.style.top = '50%';

            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 40 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            targetElement.appendChild(particle);

            setTimeout(() => particlePool.release(particle), 600);
        }
    }

    function createImpactEffect(targetElement, type) {
        const particleClass = {
            water: 'splash-particle',
            fire: 'fire-particle',
            ice: 'ice-particle',
            nature: 'splash-particle',
            energy: 'explosion-particle',
            pure: 'explosion-particle'
        };

        const className = particleClass[type] || 'splash-particle';
        const particleCount = 4;

        for (let i = 0; i < particleCount; i++) {
            const particle = particlePool.get();
            particle.className = `particle ${className}`;
            particle.style.left = '50%';
            particle.style.top = '50%';

            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            targetElement.appendChild(particle);

            setTimeout(() => particlePool.release(particle), type === 'fire' ? 700 : 800);
        }
    }

    function removeProjectile(projectileData) {
        const gs = window.gameState;
        const pool = window.projectilePool;

        const index = gs.projectiles.indexOf(projectileData);
        if (index > -1) {
            gs.projectiles.splice(index, 1);
            if (projectileData.element) {
                pool.release(projectileData.element);
            }
        }
    }

    function applyDamageAndEffectsV2(target, damage, statusEffect, isCrit) {
        if (target.status.phasing && Date.now() < target.status.phasing.endTime) return;

        let finalDamage = damage;

        if (damage > 0) {
            target.health -= finalDamage;
            if (typeof window.showFloatingText === 'function') {
                window.showFloatingText(`-${finalDamage}`, target.element, isCrit ? 'crit-hit-effect' : 'hit-effect');
            }
        }

        target.element.classList.add('damaged');
        setTimeout(() => target.element.classList.remove('damaged'), 300);

        // Aplicar efectos de estado
        if (statusEffect) {
            const now = Date.now();
            if (statusEffect.type === 'burn') {
                target.status.burn = { endTime: now + statusEffect.duration, dps: statusEffect.dps };
                target.element.classList.add('burning');
            }
            if (statusEffect.type === 'slow') {
                target.status.slow = { endTime: now + statusEffect.duration, power: statusEffect.power };
                target.element.classList.add('slowed');
            }
        }

        if (typeof window.updateContaminatorHealthBar === 'function') {
            window.updateContaminatorHealthBar(target);
        }

        if (typeof window.playSound === 'function') {
            window.playSound(400, 0.1, 'triangle', 0.08);
        }

        if (target.health <= 0) {
            target.maxHealthBeforeDeath = target.type.health;
            if (typeof window.handleContaminatorDeath === 'function') {
                window.handleContaminatorDeath(target);
            }
        }
    }

    function applyDamageAndEffects(target, damage, statusEffect) {
        applyDamageAndEffectsV2(target, damage, statusEffect, false);
    }

    function hitTarget(projectile, mainTarget) {
        const gs = window.gameState;
        const adt = window.allDefenderTypes;

        const defenderType = adt[projectile.defenderType];

        // Lógica de ataque en cadena
        if (defenderType.chain) {
            let currentTarget = mainTarget;
            let damage = projectile.damage;
            const targetsHit = new Set([currentTarget.id]);

            for (let i = 0; i <= defenderType.chain.jumps; i++) {
                if (!currentTarget) break;
                applyDamageAndEffectsV2(currentTarget, damage, projectile.statusEffect, projectile.critChance);
                damage = Math.floor(damage * defenderType.chain.damageFalloff);

                const nextTarget = gs.contaminators.find(c =>
                    c.health > 0 && !targetsHit.has(c.id) &&
                    Math.abs(c.position - currentTarget.position) < 3 &&
                    c.row === currentTarget.row
                );
                currentTarget = nextTarget;
                if (currentTarget) targetsHit.add(currentTarget.id);
            }
        } else if (projectile.splashRadius) {
            createExplosionEffect(mainTarget.element, defenderType.projectile);

            const targetsInSplash = gs.contaminators.filter(c =>
                c.health > 0 &&
                Math.abs(c.position - mainTarget.position) < projectile.splashRadius &&
                c.row === mainTarget.row
            );

            targetsInSplash.forEach(t => {
                const splashDamage = t === mainTarget ? projectile.damage : Math.floor(projectile.damage * 0.5);
                applyDamageAndEffectsV2(t, splashDamage, projectile.statusEffect, projectile.isCrit);
            });
        } else {
            createImpactEffect(mainTarget.element, defenderType.projectile);
            applyDamageAndEffectsV2(mainTarget, projectile.damage, projectile.statusEffect, projectile.isCrit);
        }
    }

    function shootProjectile(defender, target, currentDamage) {
        const gs = window.gameState;
        const adt = window.allDefenderTypes;
        const pool = window.projectilePool;
        const batcher = window.domUpdateBatcher;

        defender.element.classList.add('attacking');
        setTimeout(() => defender.element.classList.remove('attacking'), 500);

        const defenderCell = document.querySelector(`[data-row="${defender.row}"][data-col="${defender.col}"]`);
        if (!defenderCell) return;

        const projectile = pool.get(adt[defender.type].projectile);

        defenderCell.appendChild(projectile);

        const cellWidth = defenderCell.offsetWidth || 70;
        const cellHeight = defenderCell.offsetHeight || 70;
        const projectileSize = 18;

        const initialTop = (cellHeight - projectileSize) / 2;
        const initialLeft = (cellWidth - projectileSize) / 2;

        projectile.style.top = `${initialTop}px`;
        projectile.style.left = `${initialLeft}px`;
        projectile.style.zIndex = defender.row * 100 + 30;

        const isCrit = window.checkCriticalHit ? window.checkCriticalHit() : false;
        const finalDamage = isCrit ? currentDamage * 2 : currentDamage;

        const projectileData = {
            element: projectile,
            row: defender.row,
            startCol: defender.col,
            targetId: target.id,
            damage: finalDamage,
            speed: 8,
            position: defender.col,
            critChance: defender.critChance,
            isCrit: isCrit,
            statusEffect: adt[defender.type].statusEffect,
            splashRadius: adt[defender.type].splashRadius,
            defenderType: defender.type,
            cellWidth: cellWidth,
            initialTop: initialTop,
            initialLeft: initialLeft
        };

        gs.projectiles.push(projectileData);
    }

    function updateProjectiles() {
        const gs = window.gameState;
        const batcher = window.domUpdateBatcher;

        if (gs.projectiles.length === 0) return;

        for (let i = gs.projectiles.length - 1; i >= 0; i--) {
            const projectileData = gs.projectiles[i];

            projectileData.position += projectileData.speed / 60;

            const target = gs.contaminators.find(c => c.id === projectileData.targetId);

            if (target && target.health > 0) {
                if (!(target.status.phasing && Date.now() < target.status.phasing.endTime)) {
                    if (Math.abs(projectileData.position - target.position) < 0.3) {
                        hitTarget(projectileData, target);
                        removeProjectile(projectileData);
                        continue;
                    }
                }
            }

            if (projectileData.position >= 11) {
                removeProjectile(projectileData);
                continue;
            }

            if (projectileData.element && projectileData.element.parentNode) {
                const offset = (projectileData.position - projectileData.startCol) * projectileData.cellWidth;
                const newLeft = `${projectileData.initialLeft + offset}px`;

                batcher.add(projectileData.element, 'left', newLeft);
            }
        }
    }

    // Exportar al namespace global
    window.WacheckProjectiles = {
        shootProjectile: shootProjectile,
        updateProjectiles: updateProjectiles,
        applyDamageAndEffectsV2: applyDamageAndEffectsV2,
        applyDamageAndEffects: applyDamageAndEffects,
        hitTarget: hitTarget,
        removeProjectile: removeProjectile,
        createExplosionEffect: createExplosionEffect,
        createImpactEffect: createImpactEffect,
        particlePool: particlePool
    };

    console.log('[Projectiles] Service loaded');
})();
