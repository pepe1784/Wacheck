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

    // Inicializar sistema
    init() {
        this.loadState();
        this.checkNewDay();
        console.log('✅ Daily Rewards Manager initialized');
    },

    // Cargar estado desde localStorage o usuario
    loadState() {
        const user = this.getCurrentUser();
        
        if (user && user.dailyRewardsData) {
            // Cargar del usuario registrado
            this.state = { ...this.state, ...user.dailyRewardsData };
        } else {
            // Cargar de localStorage (invitado)
            const saved = localStorage.getItem('wacheck_daily_rewards');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        }
    },

    // Guardar estado
    saveState() {
        const user = this.getCurrentUser();
        
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

    // Verificar si es un nuevo día
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

        const currentReward = this.rewards[this.state.currentDay - 1];
        const nextReward = this.state.currentDay < 7 ? this.rewards[this.state.currentDay] : this.rewards[0];

        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'dailyRewardModal';
        modal.className = 'daily-reward-modal';
        modal.innerHTML = `
            <div class="daily-reward-overlay"></div>
            <div class="daily-reward-container">
                <button class="daily-reward-close">✕</button>
                
                <div class="daily-reward-header">
                    <div class="reward-icon-large">${currentReward.icon}</div>
                    <h2 class="reward-title">¡Recompensa Diaria!</h2>
                    <p class="reward-subtitle">${currentReward.description}</p>
                </div>

                <div class="daily-reward-progress">
                    <div class="progress-label">Día ${this.state.currentDay} de 7</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.state.currentDay / 7) * 100}%"></div>
                    </div>
                    <div class="progress-days">
                        ${this.generateDaysDots()}
                    </div>
                </div>

                <div class="daily-reward-items">
                    ${currentReward.coins ? `
                        <div class="reward-item">
                            <span class="reward-item-icon">💰</span>
                            <div class="reward-item-info">
                                <span class="reward-item-amount">${currentReward.coins}</span>
                                <span class="reward-item-label">Monedas</span>
                            </div>
                        </div>
                    ` : ''}
                    ${currentReward.runes ? `
                        <div class="reward-item">
                            <span class="reward-item-icon">🔮</span>
                            <div class="reward-item-info">
                                <span class="reward-item-amount">${currentReward.runes}</span>
                                <span class="reward-item-label">Runas</span>
                            </div>
                        </div>
                    ` : ''}
                    ${currentReward.specialCoins ? `
                        <div class="reward-item special">
                            <span class="reward-item-icon">⭐</span>
                            <div class="reward-item-info">
                                <span class="reward-item-amount">${currentReward.specialCoins}</span>
                                <span class="reward-item-label">Monedas Especiales</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <button class="daily-reward-claim-btn" onclick="DailyRewardsManager.claim()">
                    <span class="claim-btn-icon">🎁</span>
                    <span class="claim-btn-text">¡RECLAMAR RECOMPENSA!</span>
                </button>

                ${this.state.currentDay < 7 ? `
                    <div class="daily-reward-next">
                        <p class="next-label">Mañana recibirás:</p>
                        <div class="next-rewards">
                            ${nextReward.coins ? `💰 ${nextReward.coins}` : ''}
                            ${nextReward.runes ? ` 🔮 ${nextReward.runes}` : ''}
                            ${nextReward.specialCoins ? ` ⭐ ${nextReward.specialCoins}` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="daily-reward-next complete">
                        <p class="next-label">🏆 ¡Completaste los 7 días!</p>
                        <p class="next-sublabel">El ciclo se reiniciará mañana</p>
                    </div>
                `}

                <div class="daily-reward-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.state.totalDaysClaimed}</span>
                        <span class="stat-label">Días totales</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.state.currentStreak}</span>
                        <span class="stat-label">Racha actual</span>
                    </div>
                </div>
            </div>
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('dailyRewardStyles')) {
            this.addStyles();
        }

        // Agregar al DOM
        document.body.appendChild(modal);

        // Agregar event listener al botón de cerrar
        const closeBtn = modal.querySelector('.daily-reward-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer click en el overlay
        const overlay = modal.querySelector('.daily-reward-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // Animación de entrada
        setTimeout(() => modal.classList.add('active'), 10);

        console.log('🎁 Modal de recompensa diaria mostrado');
    },

    // Generar puntos de progreso
    generateDaysDots() {
        let html = '';
        for (let i = 1; i <= 7; i++) {
            const status = i < this.state.currentDay ? 'completed' : 
                          i === this.state.currentDay ? 'current' : 'pending';
            html += `<div class="progress-dot ${status}" title="Día ${i}">${i}</div>`;
        }
        return html;
    },

    // Reclamar recompensa
    claim() {
        const currentReward = this.rewards[this.state.currentDay - 1];
        
        // Dar recompensas
        this.giveRewards(currentReward);

        // Actualizar estado
        this.state.lastClaimDate = this.getTodayString();
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

        // Actualizar monedas
        if (reward.coins) {
            user.coins = (user.coins || 0) + reward.coins;
            if (typeof gameState !== 'undefined') {
                gameState.coins = user.coins;
            }
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
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-radius: 20px;
                padding: 20px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(8, 145, 178, 0.3);
                animation: slideUp 0.4s ease-out;
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
                top: 12px;
                right: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 20px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .daily-reward-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            .daily-reward-header {
                text-align: center;
                margin-bottom: 12px;
            }

            .reward-icon-large {
                font-size: 50px;
                margin-bottom: 8px;
                animation: bounce 1s infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .reward-title {
                font-size: 22px;
                font-weight: bold;
                color: white;
                margin: 0 0 5px 0;
                text-shadow: 0 2px 10px rgba(8, 145, 178, 0.5);
            }

            .reward-subtitle {
                font-size: 13px;
                color: #94a3b8;
                margin: 0;
            }

            .daily-reward-progress {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 12px;
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
                gap: 8px;
                margin-bottom: 12px;
            }

            .reward-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 12px 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s;
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
                padding: 12px;
                background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(8, 145, 178, 0.4);
            }

            .daily-reward-claim-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(8, 145, 178, 0.6);
            }

            .daily-reward-claim-btn:active {
                transform: translateY(0);
            }

            .claim-btn-icon {
                font-size: 18px;
            }

            .daily-reward-next {
                text-align: center;
                margin-top: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
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
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .stat-item {
                text-align: center;
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

                .reward-icon-large {
                    font-size: 45px;
                }

                .reward-title {
                    font-size: 20px;
                }

                .daily-reward-items {
                    grid-template-columns: 1fr;
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
