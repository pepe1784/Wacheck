// ============================================
// SISTEMA DE RECOMPENSAS DIARIAS - MODAL
// ============================================
// Sistema mejorado que aparece solo 1 vez al día en index.html
// Progresa día con día sin reiniciarse

const DailyRewardsManager = {
    // Configuración de recompensas (7 días)
    rewards: [
        { 
            day: 1, 
            coins: 50, 
            runes: 5, 
            description: "¡Bienvenido!", 
            icon: "🎁" 
        },
        { 
            day: 2, 
            coins: 75, 
            runes: 10, 
            description: "¡Segundo día!", 
            icon: "💎" 
        },
        { 
            day: 3, 
            coins: 100, 
            runes: 15, 
            specialCoins: 1, 
            description: "¡Vas bien!", 
            icon: "⭐" 
        },
        { 
            day: 4, 
            coins: 150, 
            runes: 20, 
            description: "¡Gran progreso!", 
            icon: "🔥" 
        },
        { 
            day: 5, 
            coins: 200, 
            runes: 25, 
            specialCoins: 2, 
            description: "¡Impresionante!", 
            icon: "💫" 
        },
        { 
            day: 6, 
            coins: 300, 
            runes: 35, 
            specialCoins: 3, 
            description: "¡Casi lo logras!", 
            icon: "🌟" 
        },
        { 
            day: 7, 
            coins: 500, 
            runes: 50, 
            specialCoins: 5, 
            description: "¡MEGA RECOMPENSA!", 
            icon: "🏆" 
        }
    ],

    // Estado del usuario
    state: {
        currentDay: 1,           // Día actual en el ciclo (1-7)
        lastClaimDate: null,     // Última vez que reclamó
        lastShownDate: null,     // Última vez que se mostró el modal
        totalDaysClaimed: 0,     // Total de días reclamados
        currentStreak: 0         // Racha actual consecutiva
    },

    // Flag para evitar doble-claim por click rápido
    _claiming: false,

    // Inicializar sistema
    init() {
        this.loadState();
        this.checkNewDay();
        console.log('✅ Daily Rewards Manager initialized');
    },

    normalizeState(inputState) {
        const toInt = (value, fallback) => {
            const parsed = parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : fallback;
        };
        const normalizeDate = (value) => {
            if (typeof value !== 'string') return null;
            return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
        };

        const normalized = {
            currentDay: Math.min(7, Math.max(1, toInt(inputState?.currentDay, 1))),
            lastClaimDate: normalizeDate(inputState?.lastClaimDate),
            lastShownDate: normalizeDate(inputState?.lastShownDate),
            totalDaysClaimed: Math.max(0, toInt(inputState?.totalDaysClaimed, 0)),
            currentStreak: Math.max(0, toInt(inputState?.currentStreak, 0))
        };

        return normalized;
    },

    // Cargar estado desde localStorage o usuario
    loadState() {
        const user = this.getCurrentUser();
        let loadedState = null;
        
        if (user && user.dailyRewardsData) {
            // Cargar del usuario registrado
            loadedState = user.dailyRewardsData;
        } else {
            // Cargar de localStorage (invitado)
            const saved = localStorage.getItem('wacheck_daily_rewards');
            if (saved) {
                loadedState = JSON.parse(saved);
            }
        }

        if (loadedState) {
            this.state = { ...this.state, ...this.normalizeState(loadedState) };
        }
    },

    // Guardar estado
    saveState() {
        const user = this.getCurrentUser();
        this.state = { ...this.state, ...this.normalizeState(this.state) };
        
        if (user && user.id && user.id !== 0) {
            // Guardar en usuario registrado
            user.dailyRewardsData = this.state;
            localStorage.setItem('wacheck_user', JSON.stringify(user));
            
            // También intentar guardar en servidor
            if (typeof saveProgressToServer === 'function') {
                saveProgressToServer();
            }
        } else {
            // Guardar en localStorage (invitado)
            localStorage.setItem('wacheck_daily_rewards', JSON.stringify(this.state));
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        const saved = localStorage.getItem('wacheck_user');
        return saved ? JSON.parse(saved) : null;
    },

    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim();
        try {
            const parsed = new URL(trimmed, window.location.origin);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                return parsed.href.replace(/"/g, '%22');
            }
        } catch (_) {}
        return '';
    },

    // Verificar si es un nuevo día

    getUserAvatar(user) {
        if (!user || typeof user !== 'object') return '';
        return user.googleAvatar || user.google_avatar || user.avatar || user.avatarUrl || user.picture || '';
    },
    checkNewDay() {
        const today = this.getTodayString();
        const lastClaim = this.state.lastClaimDate;

        // Si nunca ha reclamado, es su primer día
        if (!lastClaim) {
            console.log('🎁 Primer día del usuario');
            return;
        }

        // Verificar si es un día diferente
        if (lastClaim !== today) {
            const lastDate = new Date(lastClaim);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Día consecutivo: avanzar al siguiente día
                this.state.currentStreak++;
                this.state.currentDay++;
                
                // Si completó el ciclo de 7 días, reiniciar
                if (this.state.currentDay > 7) {
                    this.state.currentDay = 1;
                }
                
                console.log(`📅 Nuevo día consecutivo! Día ${this.state.currentDay}/7`);
            } else if (diffDays > 1) {
                // Rompió la racha: reiniciar desde día 1
                this.state.currentStreak = 0;
                this.state.currentDay = 1;
                console.log('💔 Racha rota. Reiniciando desde día 1');
            }

            // En un nuevo día, resetear la fecha de última muestra
            // (se hará null para permitir mostrar hoy)
            this.state.lastShownDate = null;
            this.saveState();
        }
    },

    // Obtener string de fecha de hoy
    getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Verificar si debe mostrar el modal
    shouldShow() {
        const user = this.getCurrentUser();
        
        // Solo mostrar para usuarios registrados o invitados logueados
        if (!user) {
            console.log('ℹ️ Rewards: No hay usuario logueado');
            return false;
        }

        const today = this.getTodayString();

        // No mostrar si ya se mostró hoy
        if (this.state.lastShownDate === today) {
            console.log('ℹ️ Rewards: Ya se mostró hoy', today);
            return false;
        }

        // No mostrar si ya reclamó hoy
        if (this.state.lastClaimDate === today) {
            console.log('ℹ️ Rewards: Ya reclamó hoy', today);
            return false;
        }

        console.log(`✅ Rewards: Puede mostrar! (Día ${this.state.currentDay}/7)`);
        return true;
    },

    // Mostrar modal de recompensa
    show() {
        console.log('🎁 Intentando mostrar modal de recompensas...');
        
        if (!this.shouldShow()) {
            console.log('ℹ️ Modal de recompensa diaria no se muestra');
            return;
        }

        console.log('✅ Mostrando modal de recompensa diaria');

        // Marcar como mostrado hoy con la fecha actual
        this.state.lastShownDate = this.getTodayString();
        this.saveState();

        this.renderModal();
    },

    // Forzar mostrar modal (sin restricciones)
    forceShow() {
        console.log('🔓 forceShow() llamado');
        const user = this.getCurrentUser();
        
        console.log('👤 Usuario actual:', user);
        console.log('🔍 Detalles del usuario:', user ? JSON.stringify(user, null, 2) : 'null');
        
        if (!user) {
            console.error('❌ No hay usuario logueado');
            alert('⚠️ Debes iniciar sesión para ver las recompensas diarias.\n\nPor favor, inicia sesión o juega como invitado primero.');
            return;
        }

        console.log('✅ Usuario válido, renderizando modal...');
        this.renderModal();
    },

    // Renderizar modal
    renderModal() {
        // Evitar duplicados: eliminar modal existente si hay uno
        const existingModal = document.getElementById('dailyRewardModal');
        if (existingModal) existingModal.remove();

        const today = this.getTodayString();
        const normalizedState = this.normalizeState(this.state);
        const safeCurrentDay = normalizedState.currentDay;
        const safeTotalDaysClaimed = normalizedState.totalDaysClaimed;
        const safeCurrentStreak = normalizedState.currentStreak;
        const alreadyClaimed = normalizedState.lastClaimDate === today;

        const currentReward = this.rewards[safeCurrentDay - 1];
        const nextReward = safeCurrentDay < 7 ? this.rewards[safeCurrentDay] : this.rewards[0];

        const user = this.getCurrentUser();
        const avatar = this.sanitizeUrl(this.getUserAvatar(user));
        const displayName = user ? (user.nickname || user.name || 'Explorador ambiental') : 'Explorador ambiental';
        const isLightTheme = document.body.classList.contains('light-theme');

        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'dailyRewardModal';
        modal.className = 'daily-reward-modal';
        modal.setAttribute('data-theme', isLightTheme ? 'light' : 'dark');
        modal.innerHTML = `
            <div class="daily-reward-overlay"></div>
            <div class="daily-reward-container">
                <button class="daily-reward-close">✕</button>
                <div class="daily-reward-header"></div>
                <div class="daily-reward-progress">
                    <div class="progress-label"></div>
                    <div class="progress-bar"><div class="progress-fill"></div></div>
                    <div class="progress-days"></div>
                </div>
                <div class="daily-reward-items"></div>
                <div class="daily-reward-claim-slot"></div>
                <div class="daily-reward-next"></div>
                <div class="daily-reward-stats">
                    <div class="stat-item"><span class="stat-value"></span><span class="stat-label">Días totales</span></div>
                    <div class="stat-item"><span class="stat-value"></span><span class="stat-label">Racha actual</span></div>
                </div>
            </div>
        `;

        const header = modal.querySelector('.daily-reward-header');
        const progressLabel = modal.querySelector('.progress-label');
        const progressFill = modal.querySelector('.progress-fill');
        const progressDays = modal.querySelector('.progress-days');
        const itemsContainer = modal.querySelector('.daily-reward-items');
        const claimSlot = modal.querySelector('.daily-reward-claim-slot');
        const nextContainer = modal.querySelector('.daily-reward-next');
        const statValues = modal.querySelectorAll('.daily-reward-stats .stat-value');

        if (header) {
            const media = document.createElement('div');
            media.className = 'reward-header-media';

            if (avatar) {
                const avatarImg = document.createElement('img');
                avatarImg.src = avatar;
                avatarImg.className = 'reward-user-avatar';
                avatarImg.alt = 'avatar';

                const fallback = document.createElement('div');
                fallback.className = `reward-icon-large reward-icon-day-${safeCurrentDay}`;
                fallback.style.display = 'none';

                avatarImg.addEventListener('error', () => {
                    avatarImg.style.display = 'none';
                    fallback.style.display = 'flex';
                }, { once: true });

                media.appendChild(avatarImg);
                media.appendChild(fallback);
            } else {
                const icon = document.createElement('div');
                icon.className = `reward-icon-large reward-icon-day-${safeCurrentDay}`;
                media.appendChild(icon);
            }

            const copy = document.createElement('div');
            copy.className = 'reward-header-copy';

            const badge = document.createElement('div');
            badge.className = 'reward-status-badge';
            badge.textContent = alreadyClaimed ? 'Recompensa asegurada' : `Racha activa: ${Math.max(1, safeCurrentStreak || 1)} día${Math.max(1, safeCurrentStreak || 1) === 1 ? '' : 's'}`;

            const userLine = document.createElement('p');
            userLine.className = 'reward-user-name';
            userLine.textContent = displayName;

            const title = document.createElement('h2');
            title.className = 'reward-title';
            title.textContent = alreadyClaimed ? 'Recompensa Reclamada' : '¡Recompensa Diaria!';

            const subtitle = document.createElement('p');
            subtitle.className = 'reward-subtitle';
            subtitle.textContent = alreadyClaimed ? 'Ya reclamaste tu recompensa hoy' : currentReward.description;

            copy.appendChild(badge);
            copy.appendChild(userLine);
            copy.appendChild(title);
            copy.appendChild(subtitle);

            header.appendChild(media);
            header.appendChild(copy);
        }

        if (progressLabel) progressLabel.textContent = `Día ${safeCurrentDay} de 7`;
        if (progressFill) progressFill.style.width = `${(safeCurrentDay / 7) * 100}%`;
        if (progressDays) progressDays.appendChild(this.generateDaysDots(safeCurrentDay));

        const addRewardItem = (iconClass, amount, label, isSpecial = false) => {
            if (!amount) return;
            const item = document.createElement('div');
            item.className = isSpecial ? 'reward-item special' : 'reward-item';

            const icon = document.createElement('span');
            icon.className = `reward-item-icon ${iconClass}`;

            const info = document.createElement('div');
            info.className = 'reward-item-info';

            const amountEl = document.createElement('span');
            amountEl.className = 'reward-item-amount';
            amountEl.textContent = String(amount);

            const labelEl = document.createElement('span');
            labelEl.className = 'reward-item-label';
            labelEl.textContent = label;

            info.appendChild(amountEl);
            info.appendChild(labelEl);
            item.appendChild(icon);
            item.appendChild(info);
            itemsContainer.appendChild(item);
        };

        if (itemsContainer) {
            addRewardItem('reward-icon-coins', currentReward.coins, 'Monedas');
            addRewardItem('reward-icon-runes', currentReward.runes, 'Runas');
            addRewardItem('reward-icon-special', currentReward.specialCoins, 'Monedas Especiales', true);
        }

        if (claimSlot) {
            const claimBtn = document.createElement('button');
            claimBtn.className = alreadyClaimed ? 'daily-reward-claim-btn claimed-already' : 'daily-reward-claim-btn';
            if (alreadyClaimed) {
                claimBtn.disabled = true;
                const txt = document.createElement('span');
                txt.className = 'claim-btn-text';
                txt.textContent = '✓ Ya reclamaste hoy — vuelve mañana';
                claimBtn.appendChild(txt);
            } else {
                const icon = document.createElement('span');
                icon.className = 'claim-btn-icon';
                icon.textContent = '🎁';
                const txt = document.createElement('span');
                txt.className = 'claim-btn-text';
                txt.textContent = '¡RECLAMAR RECOMPENSA!';
                claimBtn.appendChild(icon);
                claimBtn.appendChild(txt);
                claimBtn.addEventListener('click', () => this.claim());
            }
            claimSlot.appendChild(claimBtn);
        }

        if (nextContainer) {
            if (safeCurrentDay < 7) {
                nextContainer.className = 'daily-reward-next';
                const nextLabel = document.createElement('p');
                nextLabel.className = 'next-label';
                nextLabel.textContent = 'Mañana recibirás:';

                const nextRewards = document.createElement('div');
                nextRewards.className = 'next-rewards';
                const parts = [];
                if (nextReward.coins) parts.push(`+${nextReward.coins} monedas`);
                if (nextReward.runes) parts.push(`${nextReward.runes} runas`);
                if (nextReward.specialCoins) parts.push(`${nextReward.specialCoins} esp.`);
                nextRewards.textContent = parts.join(' · ');

                nextContainer.appendChild(nextLabel);
                nextContainer.appendChild(nextRewards);
            } else {
                nextContainer.className = 'daily-reward-next complete';
                const nextLabel = document.createElement('p');
                nextLabel.className = 'next-label';
                nextLabel.textContent = '¡Completaste los 7 días!';
                const nextSub = document.createElement('p');
                nextSub.className = 'next-sublabel';
                nextSub.textContent = 'El ciclo se reiniciará mañana';
                nextContainer.appendChild(nextLabel);
                nextContainer.appendChild(nextSub);
            }
        }

        if (statValues[0]) statValues[0].textContent = String(safeTotalDaysClaimed);
        if (statValues[1]) statValues[1].textContent = String(safeCurrentStreak);

        // Agregar estilos si no existen
        if (!document.getElementById('dailyRewardStyles')) {
            this.addStyles();
        }

        // Agregar al DOM
        document.body.appendChild(modal);

        // Helper de cierre que usa la referencia directa al modal (evita problemas con getElementById)
        const closeModal = () => {
            this._claiming = false;
            modal.classList.remove('active');
            setTimeout(() => { if (modal.parentNode) modal.remove(); }, 300);
            const hash = window.location.hash.toLowerCase();
            if (hash === '#rewards' || hash === '#recompensas') {
                history.pushState('', document.title, window.location.pathname + window.location.search);
            }
        };

        // Agregar event listener al botón de cerrar
        const closeBtn = modal.querySelector('.daily-reward-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
        }

        // Cerrar al hacer click en el overlay (fuera del contenedor)
        const overlay = modal.querySelector('.daily-reward-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Animación de entrada
        setTimeout(() => modal.classList.add('active'), 10);

        console.log('🎁 Modal de recompensa diaria mostrado');
    },

    // Generar puntos de progreso
    generateDaysDots(currentDay) {
        const safeCurrentDay = Math.min(7, Math.max(1, parseInt(currentDay, 10) || 1));
        const fragment = document.createDocumentFragment();
        for (let i = 1; i <= 7; i++) {
            const status = i < safeCurrentDay ? 'completed' : 
                          i === safeCurrentDay ? 'current' : 'pending';
            const dot = document.createElement('div');
            dot.className = `progress-dot ${status}`;
            dot.title = `Día ${i}`;
            dot.textContent = String(i);
            fragment.appendChild(dot);
        }
        return fragment;
    },

    // Reclamar recompensa
    claim() {
        // Guard 1: evitar doble-click rápido
        if (this._claiming) return;

        // Guard 2: ya se reclamó hoy
        const today = this.getTodayString();
        if (this.state.lastClaimDate === today) {
            console.warn('⚠️ Intento de reclamar dos veces el mismo día');
            this.close();
            return;
        }

        this._claiming = true;

        // Deshabilitar botón inmediatamente para evitar clicks adicionales
        const btn = document.querySelector('.daily-reward-claim-btn');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.querySelector('.claim-btn-text').textContent = 'Reclamando...';
        }

        const currentReward = this.rewards[this.state.currentDay - 1];

        // Dar recompensas
        this.giveRewards(currentReward);

        // Actualizar estado
        this.state.lastClaimDate = today;
        this.state.totalDaysClaimed++;
        this.saveState();

        // Mostrar animación de éxito
        this.showSuccessAnimation();

        // Cerrar modal después de la animación
        setTimeout(() => this.close(), 2000);

        console.log('✅ Recompensa diaria reclamada:', currentReward);
    },

    // Dar recompensas al usuario
    giveRewards(reward) {
        const user = this.getCurrentUser();
        if (!user) return;

        // Actualizar monedas de cuenta (NO son monedas de juego)
        if (reward.coins) {
            user.coins = (user.coins || 0) + reward.coins;
        }

        // Actualizar runas
        if (reward.runes) {
            user.runes = (user.runes || 0) + reward.runes;
            if (typeof gameState !== 'undefined' && typeof rewardsState !== 'undefined') {
                rewardsState.runes = user.runes;
            }
        }

        // Actualizar monedas especiales
        if (reward.specialCoins) {
            user.specialCoins = (user.specialCoins || 0) + reward.specialCoins;
            if (typeof gameState !== 'undefined') {
                gameState.specialCoins = user.specialCoins;
            }
        }

        // Guardar usuario actualizado
        localStorage.setItem('wacheck_user', JSON.stringify(user));

        // Intentar guardar en servidor
        if (typeof saveProgressToServer === 'function') {
            saveProgressToServer();
        }

        // Actualizar UI si existe
        if (typeof updateUI === 'function') {
            updateUI();
        }
    },

    // Mostrar animación de éxito
    showSuccessAnimation() {
        const modal = document.getElementById('dailyRewardModal');
        if (!modal) return;

        const container = modal.querySelector('.daily-reward-container');
        if (!container) return;

        // Agregar clase de éxito
        container.classList.add('claimed');

        // Crear confeti
        this.createConfetti(container);
    },

    // Crear efecto confeti
    createConfetti(container) {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.background = ['#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)];
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 2000);
        }
    },

    // Cerrar modal
    close() {
        this._claiming = false;
        const modal = document.getElementById('dailyRewardModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }

        // Limpiar hashtag si es #rewards o #recompensas
        const hash = window.location.hash.toLowerCase();
        if (hash === '#rewards' || hash === '#recompensas') {
            history.pushState('', document.title, window.location.pathname + window.location.search);
        }
    },

    // Agregar estilos CSS
    addStyles() {
        const style = document.createElement('style');
        style.id = 'dailyRewardStyles';
        style.textContent = `
            .daily-reward-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .daily-reward-modal.active {
                opacity: 1;
            }

            .daily-reward-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
            }

            .daily-reward-container {
                position: relative;
                z-index: 1;
                background: radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 34%), linear-gradient(145deg, #172033 0%, #0b1220 100%);
                border-radius: 28px;
                padding: 24px;
                max-width: 540px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
                border: 1px solid rgba(56, 189, 248, 0.28);
                animation: slideUp 0.4s ease-out;
            }

            .daily-reward-container::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 36%, transparent 64%, rgba(16, 185, 129, 0.06));
                pointer-events: none;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .daily-reward-container.claimed {
                animation: celebrate 0.5s ease-out;
            }

            @keyframes celebrate {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .daily-reward-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(15, 23, 42, 0.55);
                border: 1px solid rgba(148, 163, 184, 0.18);
                color: white;
                font-size: 20px;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                pointer-events: all;
            }

            .daily-reward-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            .daily-reward-header {
                position: relative;
                display: flex;
                align-items: center;
                gap: 18px;
                margin-bottom: 18px;
                padding: 18px;
                border-radius: 22px;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.4));
                border: 1px solid rgba(148, 163, 184, 0.12);
            }

            .reward-header-media {
                position: relative;
                flex-shrink: 0;
            }

            .reward-header-copy {
                min-width: 0;
                flex: 1;
            }

            .reward-status-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                margin-bottom: 10px;
                border-radius: 999px;
                background: rgba(8, 145, 178, 0.16);
                border: 1px solid rgba(56, 189, 248, 0.24);
                color: #67e8f9;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .reward-user-name {
                margin: 0 0 4px;
                color: #cbd5e1;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 0.02em;
            }

            .reward-user-avatar {
                width: 84px;
                height: 84px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid rgba(56, 189, 248, 0.75);
                box-shadow: 0 0 0 6px rgba(8, 145, 178, 0.14);
                animation: bounce 1s infinite;
                display: block;
            }

            .reward-icon-large {
                font-size: 50px;
                animation: bounce 1s infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .reward-title {
                font-size: 28px;
                font-weight: bold;
                color: white;
                margin: 0 0 6px 0;
                text-shadow: 0 2px 10px rgba(8, 145, 178, 0.5);
                line-height: 1.1;
            }

            .reward-subtitle {
                font-size: 14px;
                color: #94a3b8;
                margin: 0;
            }

            .daily-reward-progress {
                background: rgba(15, 23, 42, 0.52);
                border-radius: 18px;
                padding: 16px;
                margin-bottom: 14px;
                border: 1px solid rgba(148, 163, 184, 0.12);
            }

            .progress-label {
                text-align: center;
                color: #cbd5e1;
                font-size: 12px;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #0891b2 0%, #10b981 100%);
                border-radius: 6px;
                transition: width 0.5s ease;
            }

            .progress-days {
                display: flex;
                justify-content: space-between;
                gap: 5px;
            }

            .progress-dot {
                flex: 1;
                height: 30px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                color: #64748b;
                transition: all 0.3s;
            }

            .progress-dot.completed {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }

            .progress-dot.current {
                background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                color: white;
                box-shadow: 0 0 20px rgba(8, 145, 178, 0.5);
                transform: scale(1.1);
            }

            .daily-reward-items {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 10px;
                margin-bottom: 14px;
            }

            .reward-item {
                background: linear-gradient(180deg, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.72));
                border-radius: 16px;
                padding: 14px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                border: 1px solid rgba(148, 163, 184, 0.12);
                transition: all 0.3s;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
            }

            .reward-item:hover {
                transform: translateY(-5px);
                border-color: rgba(8, 145, 178, 0.5);
            }

            .reward-item.special {
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
                border-color: rgba(251, 191, 36, 0.5);
            }

            .reward-item-icon {
                font-size: 28px;
            }

            .reward-item-info {
                text-align: center;
            }

            .reward-item-amount {
                display: block;
                font-size: 18px;
                font-weight: bold;
                color: white;
            }

            .reward-item-label {
                display: block;
                font-size: 10px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .daily-reward-claim-btn {
                width: 100%;
                padding: 14px 16px;
                background: linear-gradient(135deg, #06b6d4 0%, #0f766e 100%);
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s;
                box-shadow: 0 12px 28px rgba(8, 145, 178, 0.28);
            }

            .daily-reward-claim-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(8, 145, 178, 0.6);
            }

            .daily-reward-claim-btn:active {
                transform: translateY(0);
            }

            .daily-reward-claim-btn.claimed-already {
                background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
                box-shadow: none;
                cursor: default;
                opacity: 0.7;
            }

            .daily-reward-claim-btn.claimed-already:hover {
                transform: none;
                box-shadow: none;
            }

            .claim-btn-icon {
                font-size: 18px;
            }

            .reward-icon-large {
                width: 60px;
                height: 60px;
                margin: 0 auto 8px;
                background: linear-gradient(135deg, #0891b2, #10b981);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                animation: bounce 1s infinite;
            }

            .reward-icon-coins::before { content: '\\1F4B0'; font-size: 22px; }
            .reward-icon-runes::before { content: '\\1FAA8'; font-size: 22px; }
            .reward-icon-special::before { content: '\\2B50'; font-size: 22px; }

            .daily-reward-next {
                text-align: center;
                margin-top: 10px;
                padding: 14px;
                background: rgba(15, 23, 42, 0.48);
                border-radius: 16px;
                border: 1px solid rgba(148, 163, 184, 0.12);
            }

            .daily-reward-next.complete {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
            }

            .next-label {
                font-size: 11px;
                color: #94a3b8;
                margin: 0 0 5px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .next-rewards {
                font-size: 13px;
                color: white;
                font-weight: 600;
            }

            .next-sublabel {
                font-size: 11px;
                color: #10b981;
                margin: 3px 0 0 0;
            }

            .daily-reward-stats {
                display: flex;
                justify-content: space-around;
                gap: 12px;
                margin-top: 14px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .stat-item {
                text-align: center;
                flex: 1;
                padding: 12px;
                border-radius: 14px;
                background: rgba(15, 23, 42, 0.38);
                border: 1px solid rgba(148, 163, 184, 0.1);
            }

            .stat-value {
                display: block;
                font-size: 20px;
                font-weight: bold;
                color: #0891b2;
                margin-bottom: 3px;
            }

            .stat-label {
                display: block;
                font-size: 10px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .daily-reward-modal[data-theme="light"] .daily-reward-container {
                background: radial-gradient(circle at top, rgba(32, 178, 170, 0.2), transparent 34%), linear-gradient(145deg, #ffffff 0%, #eef6f5 100%);
                border-color: rgba(32, 178, 170, 0.2);
                box-shadow: 0 28px 90px rgba(15, 23, 42, 0.18);
            }

            .daily-reward-modal[data-theme="light"] .daily-reward-close {
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(34, 92, 68, 0.14);
                color: #1f2937;
            }

            .daily-reward-modal[data-theme="light"] .daily-reward-header,
            .daily-reward-modal[data-theme="light"] .daily-reward-progress,
            .daily-reward-modal[data-theme="light"] .daily-reward-next,
            .daily-reward-modal[data-theme="light"] .stat-item,
            .daily-reward-modal[data-theme="light"] .reward-item {
                background: rgba(255, 255, 255, 0.82);
                border-color: rgba(34, 92, 68, 0.12);
            }

            .daily-reward-modal[data-theme="light"] .reward-status-badge {
                background: rgba(32, 178, 170, 0.12);
                border-color: rgba(32, 178, 170, 0.22);
                color: #0f766e;
            }

            .daily-reward-modal[data-theme="light"] .reward-title,
            .daily-reward-modal[data-theme="light"] .next-rewards {
                color: #0f172a;
                text-shadow: none;
            }

            .daily-reward-modal[data-theme="light"] .reward-user-name,
            .daily-reward-modal[data-theme="light"] .progress-label {
                color: #334155;
            }

            .daily-reward-modal[data-theme="light"] .reward-subtitle,
            .daily-reward-modal[data-theme="light"] .next-label,
            .daily-reward-modal[data-theme="light"] .stat-label,
            .daily-reward-modal[data-theme="light"] .reward-item-label {
                color: #64748b;
            }

            .daily-reward-modal[data-theme="light"] .reward-item-amount,
            .daily-reward-modal[data-theme="light"] .stat-value {
                color: #0f766e;
            }

            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                animation: confettiFall 2s ease-out forwards;
                pointer-events: none;
            }

            @keyframes confettiFall {
                0% {
                    top: -10%;
                    opacity: 1;
                    transform: rotate(0deg);
                }
                100% {
                    top: 110%;
                    opacity: 0;
                    transform: rotate(720deg);
                }
            }

            @media (max-width: 600px) {
                .daily-reward-container {
                    padding: 18px 15px;
                }

                .daily-reward-header {
                    flex-direction: column;
                    text-align: center;
                    padding-top: 22px;
                }

                .reward-icon-large {
                    font-size: 45px;
                }

                .reward-title {
                    font-size: 24px;
                }

                .daily-reward-items {
                    grid-template-columns: 1fr;
                }

                .daily-reward-stats {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar globalmente
window.DailyRewardsManager = DailyRewardsManager;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DailyRewardsManager.init());
} else {
    DailyRewardsManager.init();
}

// ==========================================
// HASH NAVIGATION - Abrir modal con #rewards
// ==========================================
function handleRewardsHash() {
    const hash = window.location.hash.toLowerCase();
    console.log('🔍 handleRewardsHash llamado');
    console.log('🔍 Hash actual:', hash);
    console.log('🔍 Hash completo (sin lowercase):', window.location.hash);
    
    if (hash === '#rewards' || hash === '#recompensas') {
        console.log('✅ Hash coincide con rewards!');
        console.log('🔍 Tipo de DailyRewardsManager:', typeof DailyRewardsManager);
        
        // Esperar a que DailyRewardsManager esté listo
        const checkManager = () => {
            if (typeof DailyRewardsManager !== 'undefined' && DailyRewardsManager.forceShow) {
                console.log('✅ DailyRewardsManager está listo');
                console.log('🔍 forceShow es:', typeof DailyRewardsManager.forceShow);
                // Pequeño delay para asegurar que todo esté cargado
                setTimeout(() => {
                    console.log('🎁 Ejecutando forceShow()...');
                    DailyRewardsManager.forceShow();
                    console.log('🔗 Modal abierto desde hashtag:', hash);
                }, 300);
            } else {
                console.log('⏳ Esperando a DailyRewardsManager...');
                setTimeout(checkManager, 50);
            }
        };
        checkManager();
    } else {
        console.log('ℹ️ Hash no es rewards:', hash);
    }
}

// Detectar hashtag al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleRewardsHash);
} else {
    handleRewardsHash();
}

// Detectar cambios en el hashtag
window.addEventListener('hashchange', handleRewardsHash);

console.log('🎁 Daily Rewards Manager loaded');
console.log('💡 Tip: Usa #rewards o #recompensas para abrir el modal');
