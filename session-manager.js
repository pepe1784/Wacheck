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
            const user = JSON.parse(saved);
            this.normalizeUserAvatar(user);
            return user;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    },

    getUserAvatar(user) {
        if (!user || user.isGuest) return '';
        return user.googleAvatar || user.google_avatar || user.picture || user.avatar || user.avatarUrl || user.profilePicture || '';
    },

    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim();
        try {
            const parsed = new URL(trimmed, window.location.origin);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                return parsed.href;
            }
        } catch (_) {}
        return '';
    },

    createDefaultAvatarNode() {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('xmlns', svgNS);
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '8');
        circle.setAttribute('r', '4');

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M4 20c0-4 3.6-7 8-7s8 3 8 7');

        svg.appendChild(circle);
        svg.appendChild(path);
        return svg;
    },

    renderUserButton(buttonEl, userName, avatarUrlRaw) {
        if (!buttonEl) return;
        const safeName = this._shortName(userName || 'Usuario');
        const safeAvatarUrl = this.sanitizeUrl(avatarUrlRaw);

        buttonEl.textContent = '';
        if (safeAvatarUrl) {
            const img = document.createElement('img');
            img.src = safeAvatarUrl;
            img.className = 'nav-user-avatar';
            img.alt = '';
            img.addEventListener('error', () => {
                img.remove();
                buttonEl.prepend(this.createDefaultAvatarNode());
            }, { once: true });
            buttonEl.appendChild(img);
        } else {
            buttonEl.appendChild(this.createDefaultAvatarNode());
        }
        const nameSpan = document.createElement('span');
        nameSpan.className = 'nav-user-name';
        nameSpan.textContent = safeName;
        buttonEl.appendChild(nameSpan);
    },

    normalizeUserAvatar(user) {
        if (!user || typeof user !== 'object') return;
        const avatar = this.getUserAvatar(user);
        if (avatar) {
            user.googleAvatar = avatar;
            user.avatar = avatar;
            user.avatarUrl = avatar;
        }
        if (typeof user.email !== 'string') user.email = '';
        if (typeof user.isGuest !== 'boolean') user.isGuest = false;
        if (typeof user.googleLogin !== 'boolean') user.googleLogin = Boolean(user.googleAvatar);
        if (typeof user.hasPassword !== 'boolean') user.hasPassword = !user.googleLogin;
    },

    _setAvatarImage(imageEl, fallbackEl, rawUrl) {
        if (!imageEl || !fallbackEl) return;

        const safeAvatarUrl = this.sanitizeUrl(rawUrl);
        imageEl.onerror = null;

        if (!safeAvatarUrl) {
            imageEl.removeAttribute('src');
            imageEl.style.display = 'none';
            fallbackEl.style.display = 'flex';
            return;
        }

        imageEl.onerror = () => {
            imageEl.removeAttribute('src');
            imageEl.style.display = 'none';
            fallbackEl.style.display = 'flex';
        };
        imageEl.src = safeAvatarUrl;
        imageEl.style.display = 'block';
        fallbackEl.style.display = 'none';
    },

    _getAccountLabel(user) {
        if (!user) return 'Cuenta activa';
        if (user.isGuest) return 'Modo invitado';
        if (user.googleLogin) return 'Cuenta Google';
        return 'Cuenta Wacheck';
    },

    // Restaurar sesión
    restoreSession(user) {
        // Verificar que sea un usuario válido
        if (!user.name) {
            console.warn('Usuario inválido, limpiando sesión');
            this.clearSession();
            return;
        }

        this.normalizeUserAvatar(user);

        // Actualizar gameState si existe
        if (typeof gameState !== 'undefined') {
            gameState.currentUser = user;
            gameState.specialCoins = user.specialCoins || 0;
            // gameState.coins NO se carga desde user.coins — son monedas de juego independientes
            gameState.runes = user.runes || 0;
            gameState.stars = user.stars || 0;
            gameState.unlockedDefenders = user.unlockedDefenders || ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
        }

        console.log('✅ Sesión restaurada:', user.isGuest ? `Invitado: ${user.name}` : user.name);

        // Actualizar UI si estamos en index
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            this.updateIndexUI(user);
        }

        // En segundo plano: refrescar avatar de Google si la sesión cacheada no lo tiene
        this._refreshGoogleAvatarIfMissing(user);
    },

    // Si es un usuario Google sin avatar (sesión cacheada antes del fix), refresca desde servidor
    _refreshGoogleAvatarIfMissing(user) {
        if (!user || user.isGuest || !user.googleLogin || !user.id) return;
        if (this.getUserAvatar(user)) return; // ya tiene avatar, no hace falta

        fetch(`api/user_handler_SECURE.php?action=get_profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId: user.id })
        })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data || !data.user) return;
            const freshAvatar = data.user.googleAvatar || data.user.avatar || '';
            if (!freshAvatar) return;

            // Actualizar el objeto en memoria y en localStorage
            user.googleAvatar = freshAvatar;
            user.avatar       = freshAvatar;
            user.avatarUrl    = freshAvatar;
            localStorage.setItem('wacheck_user', JSON.stringify(user));

            // Re-renderizar avatar en nav button y dropdown sin recargar toda la UI
            const navImgs = document.querySelectorAll('img.nav-user-avatar');
            navImgs.forEach(img => {
                img.src = freshAvatar;
                img.style.display = 'block';
            });
            this._populateMenuAvatar(user);
            const settingsAvatarImg  = document.getElementById('settingsAvatarImg');
            const settingsAvatarFall = document.getElementById('settingsAvatarFallback');
            if (settingsAvatarImg && settingsAvatarFall) {
                this._setAvatarImage(settingsAvatarImg, settingsAvatarFall, freshAvatar);
            }

            console.log('✅ Avatar de Google refrescado desde servidor');
        })
        .catch(() => {/* silencioso */});
    },

    // Actualizar UI en index.html
    updateIndexUI(user) {
        console.log('🔄 Actualizando UI de index.html para usuario:', user.name);
        
        // Cambiar el botón de "Iniciar Sesión" para mostrar el nombre del usuario
        const loginBtn = document.querySelector('.nav-cta');
        const mobileLoginBtn = document.querySelector('.nav-mobile-cta');
        
        if (loginBtn) {
            const avatarUrl = this.getUserAvatar(user);
            this.renderUserButton(loginBtn, user.name, avatarUrl);
            loginBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            
            // Remover atributo onclick del HTML
            loginBtn.removeAttribute('onclick');
            
            // Clonar el botón para remover todos los event listeners
            const newBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newBtn, loginBtn);

            // Re-attachar onerror al img del avatar (cloneNode no copia event listeners)
            const clonedImg = newBtn.querySelector('img.nav-user-avatar');
            if (clonedImg) {
                const sm = this;
                clonedImg.addEventListener('error', () => {
                    clonedImg.remove();
                    newBtn.prepend(sm.createDefaultAvatarNode());
                }, { once: true });
            }

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
            const avatarUrl = this.getUserAvatar(user);
            this.renderUserButton(mobileLoginBtn, user.name, avatarUrl);
            mobileLoginBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            
            // Remover atributo onclick del HTML  
            mobileLoginBtn.removeAttribute('onclick');
            
            // Clonar el botón para remover todos los event listeners
            const newMobileBtn = mobileLoginBtn.cloneNode(true);
            mobileLoginBtn.parentNode.replaceChild(newMobileBtn, mobileLoginBtn);

            // Re-attachar onerror al img del avatar (cloneNode no copia event listeners)
            const clonedMobileImg = newMobileBtn.querySelector('img.nav-user-avatar');
            if (clonedMobileImg) {
                const sm = this;
                clonedMobileImg.addEventListener('error', () => {
                    clonedMobileImg.remove();
                    newMobileBtn.prepend(sm.createDefaultAvatarNode());
                }, { once: true });
            }

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

    // Poblar avatar en el header del dropdown
    _populateMenuAvatar(user) {
        const avatarImg  = document.getElementById('userMenuAvatar');
        const avatarFall = document.getElementById('userMenuAvatarFallback');
        if (!avatarImg || !avatarFall) return;
        this._setAvatarImage(avatarImg, avatarFall, this.getUserAvatar(user));
    },

    // Mostrar menú de usuario invitado
    showGuestMenu(user) {
        const menu = document.getElementById('userDropdownMenu');
        if (!menu) return;

        this._populateMenuAvatar(user);

        // Actualizar header del menú
        const menuName = document.getElementById('userMenuName');
        const menuEmail = document.getElementById('userMenuEmail');
        const menuInfo = document.querySelector('.user-menu-info');
        if (menuName) menuName.textContent = user.name;
        if (menuEmail) menuEmail.textContent = 'Cuenta Invitada';
        if (menuInfo) menuInfo.setAttribute('data-account-label', this._getAccountLabel(user));

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

        this._populateMenuAvatar(user);

        // Actualizar header del menú
        const menuName = document.getElementById('userMenuName');
        const menuEmail = document.getElementById('userMenuEmail');
        const menuInfo = document.querySelector('.user-menu-info');
        const nick = user.nickname || user.name;
        if (menuName) menuName.textContent = nick;
        if (menuEmail) menuEmail.textContent = user.email || (user.googleLogin ? 'Cuenta sincronizada con Google' : 'Cuenta lista para jugar');
        if (menuInfo) menuInfo.setAttribute('data-account-label', this._getAccountLabel(user));

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

        // Botón: Configuración
        const settingsBtn = document.getElementById('menuSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.closeMenu();
                this.openSettings();
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

    // ============================================================
    // PANEL DE CONFIGURACIÓN
    // ============================================================
    openSettings() {
        const panel = document.getElementById('settingsPanel');
        if (!panel) return;
        const user = this.getStoredUser();

        // Populate profile
        if (user) {
            const nameEl  = document.getElementById('settingsProfileName');
            const emailEl = document.getElementById('settingsProfileEmail');
            const avatarImg  = document.getElementById('settingsAvatarImg');
            const avatarFall = document.getElementById('settingsAvatarFallback');
            const profileCard = document.querySelector('.settings-profile-card');
            if (nameEl)  nameEl.textContent  = user.name  || '–';
            if (emailEl) emailEl.textContent = user.email || (user.googleLogin ? 'Cuenta sincronizada con Google' : 'Perfil estándar de Wacheck');
            if (profileCard) profileCard.setAttribute('data-account-label', this._getAccountLabel(user));
            if (avatarImg && avatarFall) this._setAvatarImage(avatarImg, avatarFall, this.getUserAvatar(user));

            // Nickname prefill
            const nickInput = document.getElementById('settingsNickname');
            if (nickInput) nickInput.value = user.nickname || '';

            // Username cooldown
            const cooldownInfo = document.getElementById('settingsUsernameCooldownInfo');
            const saveUsernameBtn = document.getElementById('settingsSaveUsername');
            const lastChange = user.usernameChangedAt ? new Date(user.usernameChangedAt) : null;
            if (lastChange) {
                const daysLeft = Math.ceil(30 - (Date.now() - lastChange.getTime()) / 86400000);
                if (daysLeft > 0) {
                    if (cooldownInfo) cooldownInfo.innerHTML =
                        `<span class="settings-cooldown-badge">⏳ Disponible en ${daysLeft} días</span>`;
                    if (saveUsernameBtn) saveUsernameBtn.disabled = true;
                } else {
                    if (cooldownInfo) cooldownInfo.textContent = 'Puedes cambiarlo (último cambio hace más de 30 días)';
                    if (saveUsernameBtn) saveUsernameBtn.disabled = false;
                }
            }

            // Hide password section for Google-only users
            const pwSection = document.getElementById('settingsPasswordSection');
            const usernameSection = document.getElementById('settingsUsernameSection');
            if (user.googleLogin && !user.hasPassword) {
                if (pwSection) pwSection.style.display = 'none';
            }
            if (user.isGuest) {
                if (usernameSection) usernameSection.style.display = 'none';
                if (pwSection) pwSection.style.display = 'none';
            }
        }

        // Sound slider
        const slider = document.getElementById('settingsVolumeSlider');
        const pct    = document.getElementById('settingsVolumeValue');
        const vol    = Math.round((window.masterVolume ?? 1) * 100);
        if (slider) slider.value = vol;
        if (pct)    pct.textContent = vol + '%';

        const soundChk = document.getElementById('settingsSoundEnabled');
        if (soundChk) soundChk.checked = window.soundEnabled !== false;

        // Theme toggle
        const themeChk = document.getElementById('settingsThemeToggle');
        if (themeChk) themeChk.checked = !document.body.classList.contains('light-theme');

        // Show panel
        panel.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => panel.classList.add('active'), 10);

        this._setupSettingsListeners();
    },

    closeSettings() {
        const panel = document.getElementById('settingsPanel');
        if (!panel) return;
        panel.classList.remove('active');
        setTimeout(() => panel.style.display = 'none', 300);
    },

    _setupSettingsListeners() {
        // Guard: wire only once
        if (this._settingsWired) return;
        this._settingsWired = true;

        // Close button & backdrop
        document.getElementById('settingsPanelClose')?.addEventListener('click',  () => this.closeSettings());
        document.getElementById('settingsPanelBackdrop')?.addEventListener('click', () => this.closeSettings());

        // Tabs
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.settings-tab-content').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.settab;
                const tabEl = document.getElementById('settingsTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
                if (tabEl) tabEl.classList.add('active');
                if (window.lucide) lucide.createIcons();
            });
        });

        // Save nickname (localStorage only)
        document.getElementById('settingsSaveNickname')?.addEventListener('click', () => {
            const val = document.getElementById('settingsNickname')?.value.trim();
            const msg = document.getElementById('settingsNicknameMsg');
            const user = this.getStoredUser();
            if (!user) return;
            user.nickname = val;
            localStorage.setItem('wacheck_user', JSON.stringify(user));
            // Update nav button
            this.updateIndexUI(user);
            if (msg) { msg.textContent = '✓ Apodo guardado'; msg.className = 'settings-msg ok'; }
        });

        // Save username (API)
        document.getElementById('settingsSaveUsername')?.addEventListener('click', async () => {
            const newUser = document.getElementById('settingsNewUsername')?.value.trim();
            const pass    = document.getElementById('settingsUsernamePassword')?.value;
            const msg     = document.getElementById('settingsUsernameMsg');
            const user    = this.getStoredUser();
            if (!user || !newUser || !pass) {
                if (msg) { msg.textContent = 'Rellena todos los campos'; msg.className = 'settings-msg err'; }
                return;
            }
            const btn = document.getElementById('settingsSaveUsername');
            if (btn) btn.disabled = true;
            try {
                const res  = await fetch('api/user_handler_SECURE.php?action=change_username', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify({ userId: user.id, newUsername: newUser, password: pass })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    user.name = data.newUsername;
                    user.usernameChangedAt = new Date().toISOString();
                    localStorage.setItem('wacheck_user', JSON.stringify(user));
                    this.updateIndexUI(user);
                    document.getElementById('settingsProfileName').textContent = data.newUsername;
                    if (msg) { msg.textContent = '✓ Usuario actualizado'; msg.className = 'settings-msg ok'; }
                    if (btn) btn.disabled = true; // block until 30 days pass
                    const info = document.getElementById('settingsUsernameCooldownInfo');
                    if (info) info.innerHTML = '<span class="settings-cooldown-badge">⏳ Disponible en 30 días</span>';
                } else {
                    if (msg) { msg.textContent = data.error || 'Error al cambiar usuario'; msg.className = 'settings-msg err'; }
                    if (btn) btn.disabled = false;
                }
            } catch (e) {
                if (msg) { msg.textContent = 'Error de conexión'; msg.className = 'settings-msg err'; }
                if (btn) btn.disabled = false;
            }
        });

        // Save password (API)
        document.getElementById('settingsSavePassword')?.addEventListener('click', async () => {
            const oldP  = document.getElementById('settingsOldPassword')?.value;
            const newP  = document.getElementById('settingsNewPassword')?.value;
            const confP = document.getElementById('settingsConfirmPassword')?.value;
            const msg   = document.getElementById('settingsPasswordMsg');
            const user  = this.getStoredUser();
            if (!user || !oldP || !newP || !confP) {
                if (msg) { msg.textContent = 'Rellena todos los campos'; msg.className = 'settings-msg err'; }
                return;
            }
            if (newP !== confP) {
                if (msg) { msg.textContent = 'Las contraseñas no coinciden'; msg.className = 'settings-msg err'; }
                return;
            }
            if (newP.length < 8) {
                if (msg) { msg.textContent = 'Mínimo 8 caracteres'; msg.className = 'settings-msg err'; }
                return;
            }
            const btn = document.getElementById('settingsSavePassword');
            if (btn) btn.disabled = true;
            try {
                const res  = await fetch('api/user_handler_SECURE.php?action=change_password', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify({ userId: user.id, oldPassword: oldP, newPassword: newP })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    if (msg) { msg.textContent = '✓ Contraseña cambiada'; msg.className = 'settings-msg ok'; }
                    document.getElementById('settingsOldPassword').value = '';
                    document.getElementById('settingsNewPassword').value = '';
                    document.getElementById('settingsConfirmPassword').value = '';
                } else {
                    if (msg) { msg.textContent = data.error || 'Error al cambiar contraseña'; msg.className = 'settings-msg err'; }
                }
            } catch (e) {
                if (msg) { msg.textContent = 'Error de conexión'; msg.className = 'settings-msg err'; }
            }
            if (btn) btn.disabled = false;
        });

        // Delete account
        document.getElementById('settingsDeleteAccount')?.addEventListener('click', async () => {
            const msg  = document.getElementById('settingsDeleteMsg');
            const user = this.getStoredUser();
            if (!user) return;
            const pass = prompt('Para confirmar, escribe tu contraseña actual:');
            if (!pass) return;
            if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.')) return;
            try {
                const res  = await fetch('api/user_handler_SECURE.php?action=delete_account', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify({ userId: user.id, password: pass })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    this.closeSettings();
                    this.performLogout();
                } else {
                    if (msg) { msg.textContent = data.error || 'Error al eliminar cuenta'; msg.className = 'settings-msg err'; }
                }
            } catch (e) {
                if (msg) { msg.textContent = 'Error de conexión'; msg.className = 'settings-msg err'; }
            }
        });

        // Volume slider
        const slider = document.getElementById('settingsVolumeSlider');
        const pctEl  = document.getElementById('settingsVolumeValue');
        if (slider) {
            slider.addEventListener('input', () => {
                const v = parseInt(slider.value) / 100;
                window.masterVolume = v;
                localStorage.setItem('wacheck_masterVolume', v);
                if (pctEl) pctEl.textContent = slider.value + '%';
                if (typeof window.setMasterVolume === 'function') window.setMasterVolume(v);
            });
        }

        // Test sound
        document.getElementById('settingsTestSound')?.addEventListener('click', () => {
            if (typeof window.playGameSound === 'function') {
                window.soundEnabled = true;
                window.playGameSound('coin');
            }
        });

        // Sound enabled toggle
        document.getElementById('settingsSoundEnabled')?.addEventListener('change', (e) => {
            window.soundEnabled = e.target.checked;
            localStorage.setItem('wacheck_soundEnabled', window.soundEnabled);
            if (typeof toggleSound === 'function') {
                // sync UI icon only, don't re-toggle
            }
        });

        // Theme toggle
        document.getElementById('settingsThemeToggle')?.addEventListener('change', (e) => {
            if (typeof toggleTheme === 'function') toggleTheme();
            else document.body.classList.toggle('light-theme', !e.target.checked);
        });

        // View progress
        document.getElementById('settingsViewProgress')?.addEventListener('click', () => {
            const user = this.getStoredUser();
            if (user) {
                this.closeSettings();
                this.showProgress(user);
            }
        });

        // Check server session
        document.getElementById('settingsCheckSession')?.addEventListener('click', async () => {
            const msg = document.getElementById('settingsSessionMsg');
            try {
                const user = this.getStoredUser();
                const hasLocalUser = user && user.id;
                const res  = await fetch('api/user_handler_SECURE.php?action=ping', { credentials: 'include' });
                const data = await res.json();
                if (msg) {
                    let text = '';
                    let isOk = false;
                    if (data.authenticated && hasLocalUser) {
                        text = '✓ Loggueado en servidor';
                        isOk = true;
                    } else if (hasLocalUser) {
                        text = '✓ Loggueado localmente (Google)';
                        isOk = true;
                    } else {
                        text = '✗ No loggueado';
                        isOk = false;
                    }
                    msg.textContent = text;
                    msg.className = 'settings-msg ' + (isOk ? 'ok' : 'err');
                }
            } catch (e) {
                if (msg) { msg.textContent = 'Error de conexión'; msg.className = 'settings-msg err'; }
            }
        });
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
        // Cerrar el menú dropdown primero para evitar bloqueo de z-index
        this.closeMenu();

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
    },

    // Apodo corto: primera palabra del nombre (máx 14 chars)
    _shortName(name) {
        if (!name) return 'Usuario';
        const first = name.split(/[\s_]+/)[0];
        return first.length > 14 ? first.slice(0, 13) + '…' : first;
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
