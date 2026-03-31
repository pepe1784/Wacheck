// ============================================
// SISTEMA DE USUARIO INVITADO MEJORADO
// ============================================
// Permite jugar sin registro y vincular progreso después

const GuestUserManager = {
    escapeHTML(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    safeNumber(value, fallback = 0) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    },

    // Inicializar sistema
    init() {
        this.checkSession();
        console.log('[Guest] Guest User Manager initialized');
    },

    // Verificar si hay sesión activa
    checkSession() {
        const user = this.getStoredUser();
        
        if (user) {
            // Hay sesión guardada, restaurarla
            this.restoreSession(user);
        }
    },

    // Obtener usuario guardado
    getStoredUser() {
        const saved = localStorage.getItem('wacheck_user');
        return saved ? JSON.parse(saved) : null;
    },

    // Restaurar sesión
    restoreSession(user) {
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = user;
            gameState.specialCoins = user.specialCoins || 0;
            gameState.coins = user.coins || 100;
            gameState.unlockedDefenders = user.unlockedDefenders || ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
        }

        console.log('[Guest] Sesion restaurada:', user.isGuest ? 'Invitado' : user.name);

        // Actualizar UI si existe
        if (typeof this.updateLoginUI === 'function') {
            this.updateLoginUI(user);
        }

        // Mostrar banner de invitado en game-page.html
        if (user.isGuest && window.location.pathname.includes('game-page.html')) {
            this.showGuestBanner(user);
        }
    },

    // Mostrar banner de invitado en página del juego
    showGuestBanner(user) {
        // Verificar si ya existe el banner
        if (document.getElementById('guestBanner')) {
            return;
        }

        // Crear el banner
        const banner = document.createElement('div');
        banner.id = 'guestBanner';
        banner.className = 'game-guest-banner';

        const content = document.createElement('div');
        content.className = 'game-guest-banner-content';

        const textWrap = document.createElement('div');
        textWrap.className = 'guest-banner-text';

        const icon = document.createElement('span');
        icon.className = 'guest-banner-icon';
        icon.textContent = '[G]';

        const text = document.createElement('span');
        text.textContent = 'Jugando como: ';

        const name = document.createElement('span');
        name.className = 'guest-banner-name';
        name.textContent = user?.name || 'Invitado';

        text.appendChild(name);
        textWrap.appendChild(icon);
        textWrap.appendChild(text);

        const linkBtn = document.createElement('button');
        linkBtn.className = 'guest-banner-link-btn';
        linkBtn.textContent = 'Guardar mi Progreso';
        linkBtn.addEventListener('click', () => this.showLinkAccountModal());

        content.appendChild(textWrap);
        content.appendChild(linkBtn);
        banner.appendChild(content);

        // Insertar después del header del juego
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.insertAdjacentElement('afterend', banner);
        } else {
            // Si no hay header, insertarlo al principio del body
            document.body.insertBefore(banner, document.body.firstChild);
        }

        console.log('[Guest] Banner de invitado mostrado');
    },

    // Crear usuario invitado
    async createGuest(guestName) {
        if (!guestName || guestName.trim().length === 0) {
            throw new Error('El nombre no puede estar vacío');
        }

        if (guestName.trim().length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres');
        }

        const guest = {
            id: 0, // ID 0 = invitado
            name: guestName.trim(),
            isGuest: true,
            guestSince: new Date().toISOString(),
            coins: 100,
            specialCoins: 0,
            runes: 0,
            stars: 0,
            unlockedDefenders: ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"],
            calculatorCompleted: false,
            rewardsData: {},
            achievementsData: {},
            storyProgress: {},
            dailyRewardsData: {}
        };

        // Guardar en localStorage
        localStorage.setItem('wacheck_user', JSON.stringify(guest));

        // Actualizar gameState
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = guest;
            gameState.specialCoins = 0;
            gameState.coins = 100;
            gameState.unlockedDefenders = guest.unlockedDefenders;
        }

        console.log('[Guest] Usuario invitado creado:', guestName);

        return guest;
    },

    // Vincular cuenta invitada a un correo
    async linkAccount(email, password) {
        const guest = this.getStoredUser();

        if (!guest || !guest.isGuest) {
            throw new Error('No hay cuenta de invitado para vincular');
        }

        // Validar email
        if (!this.validateEmail(email)) {
            throw new Error('Email inválido');
        }

        // Validar contraseña
        if (password.length < 4) {
            throw new Error('La contraseña debe tener al menos 4 caracteres');
        }

        try {
            // Registrar cuenta en el servidor
            const response = await fetch('api/user_handler_SECURE.php?action=create_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: guest.name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Transferir progreso del invitado a la cuenta real
            const newUser = {
                ...result,
                coins: guest.coins,
                specialCoins: guest.specialCoins,
                runes: guest.runes,
                stars: guest.stars,
                unlockedDefenders: guest.unlockedDefenders,
                calculatorCompleted: guest.calculatorCompleted,
                rewardsData: guest.rewardsData,
                achievementsData: guest.achievementsData,
                storyProgress: guest.storyProgress,
                dailyRewardsData: guest.dailyRewardsData,
                isGuest: false
            };

            // Guardar progreso en el servidor
            await this.saveProgressToServer(newUser);

            // Actualizar localStorage
            localStorage.setItem('wacheck_user', JSON.stringify(newUser));

            // Actualizar gameState
            if (typeof gameState !== 'undefined') {
                gameState.currentUser = newUser;
            }

            console.log('[Guest] Cuenta vinculada exitosamente');

            return newUser;

        } catch (error) {
            console.error('Error vinculando cuenta:', error);
            throw error;
        }
    },

    // Guardar progreso en servidor
    async saveProgressToServer(user) {
        try {
            const response = await fetch('api/user_handler_SECURE.php?action=save_progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    specialCoins: user.specialCoins,
                    coins: user.coins,
                    runes: user.runes,
                    stars: user.stars,
                    unlockedDefenders: user.unlockedDefenders,
                    calculatorCompleted: user.calculatorCompleted,
                    rewardsData: user.rewardsData,
                    achievementsData: user.achievementsData,
                    storyProgress: user.storyProgress,
                    dailyRewardsData: user.dailyRewardsData
                })
            });

            const result = await response.json();

            if (!result.success) {
                console.warn('No se pudo guardar el progreso en el servidor');
            }

        } catch (error) {
            console.warn('Error guardando progreso:', error);
        }
    },

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Cerrar sesión
    logout() {
        // Limpiar localStorage
        localStorage.removeItem('wacheck_user');

        // Limpiar gameState
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = null;
            gameState.specialCoins = 0;
            gameState.coins = 100;
        }

        console.log('[Guest] Sesion cerrada');

        // Recargar página
        window.location.reload();
    },

    // Mostrar modal de usuario invitado
    showGuestModal() {
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'guestModal';
        modal.className = 'guest-modal';
        modal.innerHTML = `
            <div class="guest-modal-overlay"></div>
            <div class="guest-modal-container">
                <button class="guest-modal-close" onclick="GuestUserManager.closeGuestModal()">X</button>
                
                <div class="guest-modal-header">
                    <div class="guest-icon">[G]</div>
                    <h2>Jugar como Invitado</h2>
                    <p>Tu progreso se guardará localmente en este dispositivo</p>
                </div>

                <div class="guest-modal-form">
                    <input 
                        type="text" 
                        id="guestNameInput" 
                        placeholder="¿Cómo te llamas?" 
                        maxlength="20"
                        class="guest-input"
                    >
                    <button class="guest-btn-primary" onclick="GuestUserManager.handleCreateGuest()">
                        ¡Empezar a Jugar!
                    </button>
                </div>

                <div class="guest-modal-info">
                    <p class="info-text">
                        <strong>Consejo:</strong> Podras vincular tu progreso a una cuenta de correo mas tarde
                    </p>
                </div>

                <div class="guest-modal-footer">
                    <button class="guest-btn-secondary" onclick="GuestUserManager.closeGuestModal(); openLoginModal();">
                        Ya tengo cuenta
                    </button>
                </div>
            </div>
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('guestModalStyles')) {
            this.addStyles();
        }

        // Agregar al DOM
        document.body.appendChild(modal);

        // Enfocar input
        setTimeout(() => {
            const input = document.getElementById('guestNameInput');
            if (input) input.focus();

            // Enter para enviar
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCreateGuest();
                }
            });
        }, 100);

        // Animación
        setTimeout(() => modal.classList.add('active'), 10);
    },

    // Cerrar modal invitado
    closeGuestModal() {
        const modal = document.getElementById('guestModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Manejar creación de invitado
    async handleCreateGuest() {
        const input = document.getElementById('guestNameInput');
        const name = input?.value?.trim();

        if (!name) {
            alert('Por favor ingresa tu nombre');
            return;
        }

        if (name.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }

        try {
            await this.createGuest(name);
            this.closeGuestModal();

            // Cerrar modal de login si está abierto
            if (typeof closeLoginModal === 'function') {
                closeLoginModal();
            }

            // Redirigir a game-page
            window.location.href = 'game-page.html';

        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // Mostrar modal de vincular cuenta
    showLinkAccountModal() {
        const guest = this.getStoredUser();

        if (!guest || !guest.isGuest) {
            alert('No hay cuenta de invitado para vincular');
            return;
        }

        const safeCoins = this.safeNumber(guest.coins);
        const safeSpecialCoins = this.safeNumber(guest.specialCoins);
        const safeRunes = this.safeNumber(guest.runes);

        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'linkAccountModal';
        modal.className = 'guest-modal';
        modal.innerHTML = `
            <div class="guest-modal-overlay"></div>
            <div class="guest-modal-container">
                <button class="guest-modal-close" onclick="GuestUserManager.closeLinkAccountModal()">X</button>
                
                <div class="guest-modal-header">
                    <div class="guest-icon">[Link]</div>
                    <h2>Vincular Cuenta</h2>
                    <p>Guarda tu progreso creando una cuenta</p>
                </div>

                <div class="guest-modal-progress">
                    <h3>Tu progreso actual:</h3>
                    <div class="progress-items">
                        <div class="progress-item">
                            <span class="progress-icon">[C]</span>
                            <span>${safeCoins} Monedas</span>
                        </div>
                        <div class="progress-item">
                            <span class="progress-icon">[S]</span>
                            <span>${safeSpecialCoins} Especiales</span>
                        </div>
                        <div class="progress-item">
                            <span class="progress-icon">[R]</span>
                            <span>${safeRunes} Runas</span>
                        </div>
                    </div>
                </div>

                <div class="guest-modal-form">
                    <input 
                        type="email" 
                        id="linkEmailInput" 
                        placeholder="Tu correo electrónico"
                        class="guest-input"
                    >
                    <input 
                        type="password" 
                        id="linkPasswordInput" 
                        placeholder="Contraseña (mínimo 4 caracteres)"
                        class="guest-input"
                    >
                    <button class="guest-btn-primary" onclick="GuestUserManager.handleLinkAccount()">
                        Vincular Cuenta
                    </button>
                </div>

                <div class="guest-modal-info">
                    <p class="info-text">
                        Tu progreso se guardara de forma segura y podras acceder desde cualquier dispositivo
                    </p>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(modal);

        // Animación
        setTimeout(() => modal.classList.add('active'), 10);
    },

    // Cerrar modal vincular
    closeLinkAccountModal() {
        const modal = document.getElementById('linkAccountModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    // Manejar vinculación de cuenta
    async handleLinkAccount() {
        const email = document.getElementById('linkEmailInput')?.value?.trim();
        const password = document.getElementById('linkPasswordInput')?.value;

        if (!email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            await this.linkAccount(email, password);
            this.closeLinkAccountModal();

            alert('¡Cuenta vinculada exitosamente! Tu progreso ahora está guardado.');

            // Recargar para actualizar UI
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // Agregar estilos
    addStyles() {
        const style = document.createElement('style');
        style.id = 'guestModalStyles';
        style.textContent = `
            .guest-modal {
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

            .guest-modal.active {
                opacity: 1;
            }

            .guest-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(5px);
            }

            .guest-modal-container {
                position: relative;
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-radius: 20px;
                padding: 40px;
                max-width: 450px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(8, 145, 178, 0.3);
                animation: modalSlideUp 0.3s ease-out;
            }

            @keyframes modalSlideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .guest-modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 24px;
                cursor: pointer;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .guest-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .guest-modal-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .guest-icon {
                font-size: 60px;
                margin-bottom: 15px;
            }

            .guest-modal-header h2 {
                font-size: 28px;
                color: white;
                margin: 0 0 10px 0;
            }

            .guest-modal-header p {
                font-size: 14px;
                color: #94a3b8;
                margin: 0;
            }

            .guest-modal-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 20px;
            }

            .guest-input {
                width: 100%;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: white;
                font-size: 16px;
                transition: all 0.3s;
                box-sizing: border-box;
            }

            .guest-input:focus {
                outline: none;
                border-color: #0891b2;
                background: rgba(255, 255, 255, 0.08);
            }

            .guest-input::placeholder {
                color: #64748b;
            }

            .guest-btn-primary {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(8, 145, 178, 0.3);
            }

            .guest-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(8, 145, 178, 0.5);
            }

            .guest-btn-primary:active {
                transform: translateY(0);
            }

            .guest-btn-secondary {
                width: 100%;
                padding: 12px;
                background: transparent;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .guest-btn-secondary:hover {
                border-color: rgba(255, 255, 255, 0.4);
                background: rgba(255, 255, 255, 0.05);
            }

            .guest-modal-info {
                background: rgba(8, 145, 178, 0.1);
                border-left: 4px solid #0891b2;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .info-text {
                font-size: 13px;
                color: #cbd5e1;
                margin: 0;
                line-height: 1.5;
            }

            .guest-modal-progress {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
            }

            .guest-modal-progress h3 {
                font-size: 16px;
                color: white;
                margin: 0 0 15px 0;
                text-align: center;
            }

            .progress-items {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }

            .progress-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                font-size: 13px;
                color: white;
            }

            .progress-icon {
                font-size: 24px;
            }

            @media (max-width: 600px) {
                .guest-modal-container {
                    padding: 30px 20px;
                }

                .guest-icon {
                    font-size: 50px;
                }

                .guest-modal-header h2 {
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar globalmente
window.GuestUserManager = GuestUserManager;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GuestUserManager.init());
} else {
    GuestUserManager.init();
}

console.log(' Guest User Manager loaded');
