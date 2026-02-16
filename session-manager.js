// ============================================
// SESSION MANAGER - Gestión de Sesión Persistente
// ============================================
// Mantiene la sesión activa incluso al actualizar la página

const SessionManager = {
    // Inicializar
    init() {
        this.checkAndRestoreSession();
        this.setupAutoSave();
        this.setupMenuListeners();
        this.ensureMenuHidden();
        console.log('🔐 Session Manager initialized');
    },

    // Asegurar que el menú esté oculto al iniciar
    ensureMenuHidden() {
        const menu = document.getElementById('userDropdownMenu');
        if (menu) {
            menu.classList.remove('active');
            menu.style.display = 'none';
        }
    },

    // Verificar y restaurar sesión
    checkAndRestoreSession() {
        const user = this.getStoredUser();
        
        console.log('🔍 Verificando sesión guardada...');
        console.log('👤 Usuario encontrado:', user ? (user.isGuest ? `Invitado: ${user.name}` : user.name) : 'Ninguno');

        if (user) {
            // Hay usuario guardado, restaurar sesión
            this.restoreSession(user);

            // Si estamos en index.html y el usuario está logueado, mostrar recompensas
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                console.log('📍 Estamos en index.html, verificando recompensas...');
                this.handleDailyRewards(user);
            }
        } else {
            console.log('❌ No hay sesión guardada');
        }
    },

    // Obtener usuario guardado
    getStoredUser() {
        const saved = localStorage.getItem('wacheck_user');
        if (!saved) return null;

        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    },

    // Restaurar sesión
    restoreSession(user) {
        // Verificar que sea un usuario válido
        if (!user.name) {
            console.warn('Usuario inválido, limpiando sesión');
            this.clearSession();
            return;
        }

        // Actualizar gameState si existe
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = user;
            gameState.specialCoins = user.specialCoins || 0;
            gameState.coins = user.coins || 100;
            gameState.runes = user.runes || 0;
            gameState.stars = user.stars || 0;
            gameState.unlockedDefenders = user.unlockedDefenders || ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
        }

        console.log('✅ Sesión restaurada:', user.isGuest ? `Invitado: ${user.name}` : user.name);

        // Actualizar UI si estamos en index
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            this.updateIndexUI(user);
        }
    },

    // Actualizar UI en index.html
    updateIndexUI(user) {
        console.log('🔄 Actualizando UI de index.html para usuario:', user.name);
        
        // Cambiar el botón de "Iniciar Sesión" para mostrar el nombre del usuario
        const loginBtn = document.querySelector('.nav-cta');
        const mobileLoginBtn = document.querySelector('.nav-mobile-cta');
        
        if (loginBtn) {
            loginBtn.textContent = user.isGuest ? `👤 ${user.name}` : `👤 ${user.name}`;
            loginBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            
            // Remover atributo onclick del HTML
            loginBtn.removeAttribute('onclick');
            
            // Clonar el botón para remover todos los event listeners
            const newBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newBtn, loginBtn);
            
            // Agregar nuevo event listener
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (user.isGuest) {
                    this.showGuestMenu(user);
                } else {
                    this.showUserMenu(user);
                }
            });
            
            console.log('✅ Botón de login actualizado');
        }
        
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = user.isGuest ? `👤 ${user.name}` : `👤 ${user.name}`;
            mobileLoginBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            
            // Remover atributo onclick del HTML  
            mobileLoginBtn.removeAttribute('onclick');
            
            // Clonar el botón para remover todos los event listeners
            const newMobileBtn = mobileLoginBtn.cloneNode(true);
            mobileLoginBtn.parentNode.replaceChild(newMobileBtn, mobileLoginBtn);
            
            // Agregar nuevo event listener
            newMobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (user.isGuest) {
                    this.showGuestMenu(user);
                } else {
                    this.showUserMenu(user);
                }
            });
        }

        console.log('✅ UI actualizada correctamente');
    },

    // Mostrar menú de usuario invitado
    showGuestMenu(user) {
        const menu = document.getElementById('userDropdownMenu');
        if (!menu) return;

        // Actualizar header del menú
        const menuName = document.getElementById('userMenuName');
        const menuEmail = document.getElementById('userMenuEmail');
        if (menuName) menuName.textContent = user.name;
        if (menuEmail) menuEmail.textContent = 'Cuenta Invitada';

        // Mostrar botón de vincular cuenta
        const linkBtn = document.getElementById('menuLinkAccount');
        if (linkBtn) linkBtn.style.display = 'block';

        // Mostrar menú
        menu.style.display = 'flex';
        setTimeout(() => menu.classList.add('active'), 10);
    },

    // Mostrar menú de usuario registrado
    showUserMenu(user) {
        const menu = document.getElementById('userDropdownMenu');
        if (!menu) return;

        // Actualizar header del menú
        const menuName = document.getElementById('userMenuName');
        const menuEmail = document.getElementById('userMenuEmail');
        if (menuName) menuName.textContent = user.name;
        if (menuEmail) menuEmail.textContent = user.email || '';

        // Ocultar botón de vincular cuenta
        const linkBtn = document.getElementById('menuLinkAccount');
        if (linkBtn) linkBtn.style.display = 'none';

        // Mostrar menú
        menu.style.display = 'flex';
        setTimeout(() => menu.classList.add('active'), 10);
    },

    // Cerrar menú dropdown
    closeMenu() {
        const menu = document.getElementById('userDropdownMenu');
        if (!menu) return;

        menu.classList.remove('active');
        setTimeout(() => menu.style.display = 'none', 300);
    },

    // Configurar event listeners del menú
    setupMenuListeners() {
        // Botón: Ir al Juego
        const goToGameBtn = document.getElementById('menuGoToGame');
        if (goToGameBtn) {
            goToGameBtn.addEventListener('click', () => {
                window.location.href = 'game-page.html';
            });
        }

        // Botón: Ver Recompensas
        const viewRewardsBtn = document.getElementById('menuViewRewards');
        if (viewRewardsBtn) {
            viewRewardsBtn.addEventListener('click', () => {
                this.closeMenu();
                window.location.hash = 'rewards';
            });
        }

        // Botón: Mi Progreso
        const myProgressBtn = document.getElementById('menuMyProgress');
        if (myProgressBtn) {
            myProgressBtn.addEventListener('click', () => {
                const user = this.getStoredUser();
                if (user) this.showProgress(user);
                this.closeMenu();
            });
        }

        // Botón: Vincular Cuenta
        const linkAccountBtn = document.getElementById('menuLinkAccount');
        if (linkAccountBtn) {
            linkAccountBtn.addEventListener('click', () => {
                this.closeMenu();
                if (typeof GuestUserManager !== 'undefined') {
                    GuestUserManager.showLinkAccountModal();
                }
            });
        }

        // Botón: Cerrar Sesión
        const logoutBtn = document.getElementById('menuLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Cerrar al hacer click en overlay
        const overlay = document.getElementById('userMenuOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
    },

    // Mostrar progreso del usuario
    showProgress(user) {
        const modal = document.getElementById('progressModal');
        if (!modal) return;

        // Actualizar datos
        const userName = document.getElementById('progressUserName');
        const coins = document.getElementById('progressCoins');
        const specialCoins = document.getElementById('progressSpecialCoins');
        const runes = document.getElementById('progressRunes');
        const stars = document.getElementById('progressStars');
        const defenders = document.getElementById('progressDefenders');

        if (userName) userName.textContent = user.name || 'Usuario';
        if (coins) coins.textContent = (user.coins || 0).toLocaleString();
        if (specialCoins) specialCoins.textContent = (user.specialCoins || 0).toLocaleString();
        if (runes) runes.textContent = (user.runes || 0).toLocaleString();
        if (stars) stars.textContent = (user.stars || 0).toLocaleString();
        if (defenders) defenders.textContent = (user.unlockedDefenders?.length || 8);

        // Mostrar modal
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        // Configurar event listeners si no existen ya
        const closeBtn = document.getElementById('progressModalClose');
        const overlay = document.getElementById('progressOverlay');
        
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };

        if (closeBtn && !closeBtn.hasAttribute('data-listener')) {
            closeBtn.addEventListener('click', closeModal);
            closeBtn.setAttribute('data-listener', 'true');
        }

        if (overlay && !overlay.hasAttribute('data-listener')) {
            overlay.addEventListener('click', closeModal);
            overlay.setAttribute('data-listener', 'true');
        }
    },

    // Manejar recompensas diarias
    handleDailyRewards(user) {
        // Solo para usuarios registrados o invitados
        if (!user) return;

        // Esperar a que DailyRewardsManager esté listo
        const checkRewards = () => {
            if (typeof DailyRewardsManager !== 'undefined') {
                // Pequeño delay para que todo cargue
                setTimeout(() => {
                    if (DailyRewardsManager.shouldShow()) {
                        DailyRewardsManager.show();
                    }
                }, 1000);
            } else {
                setTimeout(checkRewards, 100);
            }
        };

        checkRewards();
    },

    // Configurar auto-guardado
    setupAutoSave() {
        // Guardar progreso cada 30 segundos
        setInterval(() => {
            this.autoSave();
        }, 30000);

        // Guardar antes de cerrar/recargar página
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    },

    // Auto-guardar progreso
    autoSave() {
        const user = this.getStoredUser();
        if (!user) return;

        // Si es usuario registrado, intentar guardar en servidor
        if (user.id && user.id !== 0 && !user.isGuest) {
            if (typeof saveProgressToServer === 'function') {
                saveProgressToServer();
            }
        }

        // Siempre guardar en localStorage
        localStorage.setItem('wacheck_user', JSON.stringify(user));
    },

    // Cerrar sesión
    logout() {
        const modal = document.getElementById('confirmModal');
        if (!modal) {
            // Fallback a confirm si no hay modal
            if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                return;
            }
            this.performLogout();
            return;
        }

        // Mostrar modal de confirmación
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        // Configurar event listeners
        const confirmYes = document.getElementById('confirmYes');
        const confirmCancel = document.getElementById('confirmCancel');
        const confirmOverlay = document.getElementById('confirmOverlay');

        const closeConfirmModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };

        // Remover listeners anteriores si existen
        if (confirmYes) {
            const newConfirmYes = confirmYes.cloneNode(true);
            confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
            newConfirmYes.addEventListener('click', () => {
                closeConfirmModal();
                this.performLogout();
            });
        }

        if (confirmCancel) {
            const newConfirmCancel = confirmCancel.cloneNode(true);
            confirmCancel.parentNode.replaceChild(newConfirmCancel, confirmCancel);
            newConfirmCancel.addEventListener('click', closeConfirmModal);
        }

        if (confirmOverlay) {
            const newConfirmOverlay = confirmOverlay.cloneNode(true);
            confirmOverlay.parentNode.replaceChild(newConfirmOverlay, confirmOverlay);
            newConfirmOverlay.addEventListener('click', closeConfirmModal);
        }
    },

    // Ejecutar el logout
    performLogout() {
        // Limpiar localStorage
        localStorage.removeItem('wacheck_user');
        localStorage.removeItem('wacheck-session');

        // Limpiar gameState si existe
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = null;
            gameState.specialCoins = 0;
            gameState.coins = 100;
        }

        console.log('👋 Sesión cerrada');

        // Recargar página
        window.location.reload();
    },

    // Limpiar sesión
    clearSession() {
        localStorage.removeItem('wacheck_user');
        localStorage.removeItem('wacheck-session');

        if (typeof gameState !== 'undefined') {
            gameState.currentUser = null;
        }
    }
};

// Exportar globalmente
window.SessionManager = SessionManager;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SessionManager.init());
} else {
    SessionManager.init();
}

console.log('🔐 Session Manager loaded');
