// ====================================
// auth.js - Sistema de Autenticación
// ====================================

// API SEGURA para producción en InfinityFree
const API_URL = 'api/user_handler_SECURE.php';

// Abrir modal de login
function openLoginModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeLoginModal() {
    document.getElementById('authModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearMessages();
}

// Cambiar entre tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
    
    clearMessages();
}

// Limpiar mensajes
function clearMessages() {
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('registerMessage').textContent = '';
}

// Mostrar mensaje
function showMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.color = isError ? '#ef4444' : '#10b981';
}

function extractUserAvatar(data) {
    if (!data || typeof data !== 'object') return '';

    const avatar = data.googleAvatar
        || data.google_avatar
        || data.avatar
        || data.avatarUrl
        || data.picture
        || '';

    return typeof avatar === 'string' ? avatar : '';
}

function normalizeStoredUser(data) {
    const avatar = extractUserAvatar(data);

    return {
        id: data.id,
        name: data.name || data.username || 'Usuario',
        email: data.email || '',
        isGuest: Boolean(data.isGuest),
        googleLogin: Boolean(data.googleLogin || data.google_login || avatar),
        googleAvatar: avatar,
        avatar,
        avatarUrl: avatar,
        hasPassword: typeof data.hasPassword === 'boolean' ? data.hasPassword : !Boolean(data.googleLogin),
        usernameChangedAt: data.usernameChangedAt || data.username_changed_at || null,
        coins: data.coins || 100,
        specialCoins: data.specialCoins || 0,
        runes: data.runes || 0,
        stars: data.stars || 0,
        unlockedDefenders: data.unlockedDefenders || ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"],
        calculatorCompleted: Boolean(data.calculatorCompleted),
        rewardsData: data.rewardsData || {},
        achievementsData: data.achievementsData || {},
        storyProgress: data.storyProgress || {},
        dailyRewardsData: data.dailyRewardsData || data.daily_rewards_data || {},
        nickname: data.nickname || ''
    };
}

// Handle Login
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showMessage('loginMessage', 'Por favor completa todos los campos');
        return;
    }
    
    try {
        showMessage('loginMessage', 'Iniciando sesión...', false);
        
        const response = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Importante para cookies de sesión
            body: JSON.stringify({ name: username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.session) {
            // Login exitoso
            showMessage('loginMessage', '✅ Sesión iniciada correctamente', false);
            
            const userData = normalizeStoredUser(data);
            
            // Guardar en localStorage con la clave correcta
            localStorage.setItem('wacheck_user', JSON.stringify(userData));
            
            console.log('✅ Usuario guardado en localStorage:', userData);
            
            // Cerrar modal y actualizar UI
            setTimeout(() => {
                closeLoginModal();
                // Actualizar UI si SessionManager está disponible
                if (window.SessionManager) {
                    SessionManager.updateIndexUI(userData);
                }
            }, 800);
        } else if (response.status === 403 && data.error === 'Email no verificado') {
            // Email no verificado
            showMessage('loginMessage', 
                `❌ ${data.message}\\n📧 Revisa tu correo: ${data.email}`);
            
            // Mostrar opción de reenviar
            setTimeout(() => {
                if (confirm('¿Quieres que reenviemos el correo de verificación?')) {
                    resendVerification(data.email);
                }
            }, 2000);
        } else {
            // Error de login
            showMessage('loginMessage', data.error || 'Error al iniciar sesión');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Error de conexión con el servidor');
    }
}

// Handle Register
async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value.trim();
    
    // Validaciones
    if (!username || !email || !password || !passwordConfirm) {
        showMessage('registerMessage', 'Por favor completa todos los campos');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage('registerMessage', 'Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 4) {
        showMessage('registerMessage', 'La contraseña debe tener al menos 4 caracteres');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('registerMessage', 'Formato de email inválido');
        return;
    }
    
    // Validar dominio permitido
    const allowedDomains = ['gmail.com', 'ucol.mx', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
        showMessage('registerMessage', `Solo se permiten emails de: ${allowedDomains.join(', ')}`);
        return;
    }
    
    try {
        showMessage('registerMessage', 'Creando cuenta...', false);
        
        const response = await fetch(`${API_URL}?action=create_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, email, password })
        });
        
        const data = await response.json();
        
        if (response.status === 201 || response.ok) {
            // Registro exitoso
            showMessage('registerMessage', 
                `✅ ¡Cuenta creada!\\n📧 Revisa tu email para verificar tu cuenta`, false);
            
            // Limpiar formulario
            document.getElementById('registerUsername').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerPasswordConfirm').value = '';
            
            // Cambiar a tab de login después de 3 segundos
            setTimeout(() => {
                switchAuthTab('login');
                showMessage('loginMessage', 'Verifica tu email antes de iniciar sesión', false);
            }, 3000);
            
        } else {
            // Error en registro
            showMessage('registerMessage', data.error || 'Error al crear cuenta');
        }
        
    } catch (error) {
        console.error('Register error:', error);
        showMessage('registerMessage', 'Error de conexión con el servidor');
    }
}

// Reenviar verificación
async function resendVerification(email) {
    try {
        const response = await fetch(`${API_URL}?action=resend_verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ ' + data.message);
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Resend error:', error);
        alert('Error al reenviar verificación');
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeLoginModal();
    }
};

// Toggle mostrar/ocultar contraseña
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');
    
    if (field.type === 'password') {
        field.type = 'text';
        // Cambiar a icono de ojo cerrado
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        field.type = 'password';
        // Cambiar a icono de ojo abierto
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

// ============================================================
// Google OAuth
// ============================================================

/**
 * Inicia el flujo OAuth de Google.
 * 1. Pide la URL de autorización a nuestro backend (evita exponer CLIENT_ID en JS)
 * 2. Redirige al usuario a Google
 */
async function handleGoogleAuth() {
    const btn = document.getElementById('googleLoginBtn');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.65';
    }

    try {
        const res = await fetch('api/oauth_google.php?action=redirect', {
            credentials: 'include'
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error || 'Error al iniciar sesión con Google';
            showMessage('loginMessage', msg);
            if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            return;
        }

        const { url } = await res.json();
        if (!url) {
            showMessage('loginMessage', 'No se recibió URL de Google');
            if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            return;
        }

        let safeUrl = null;
        try {
            const parsed = new URL(url, window.location.origin);
            const allowedHosts = new Set([
                'accounts.google.com',
                'oauth2.googleapis.com',
                'google.com',
                'www.google.com'
            ]);
            const isGoogleHost = parsed.hostname === 'accounts.google.com'
                || parsed.hostname.endsWith('.google.com')
                || allowedHosts.has(parsed.hostname);
            if (parsed.protocol === 'https:' && isGoogleHost) {
                safeUrl = parsed.href;
            }
        } catch (_) {}

        if (!safeUrl) {
            showMessage('loginMessage', 'URL de redirección no confiable');
            if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            return;
        }

        // Redirigir a Google (no popup — ventana completa para máxima compatibilidad)
        window.location.href = safeUrl;

    } catch (e) {
        console.error('[GoogleAuth]', e);
        showMessage('loginMessage', 'Error de conexión (Google OAuth)');
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
}

/**
 * Procesa el resultado del callback de Google.
 * oauth_google.php redirige a index.html#google_auth=<base64> o
 * index.html?google_error=<reason>
 */
function processGoogleCallback() {
    // Manejar error devuelto por el callback
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get('google_error');
    if (googleError) {
        const msgs = {
            not_configured : 'Google OAuth aún no está configurado.',
            invalid_state  : 'Error de seguridad (state inválido). Intenta de nuevo.',
            no_code        : 'No se recibió código de autorización de Google.',
            no_profile     : 'No se pudo obtener el perfil de Google.',
            db_error       : 'Error interno al guardar tu cuenta.',
            cancelled      : 'Inicio de sesión con Google cancelado.',
        };
        const msg = msgs[googleError] || `Error de Google: ${googleError}`;
        // Limpiar URL y mostrar error
        history.replaceState({}, '', window.location.pathname);
        // El modal puede no estar abierto; abrirlo y mostrar error
        openLoginModal();
        setTimeout(() => showMessage('loginMessage', msg), 100);
        return;
    }

    // Manejar callback exitoso: #google_auth=<base64>
    const hash = window.location.hash;
    if (!hash.startsWith('#google_auth=')) return;

    try {
        const encoded = decodeURIComponent(hash.slice('#google_auth='.length));
        const userData = normalizeStoredUser(JSON.parse(atob(encoded)));

        // Guardar en localStorage con la misma clave que el login normal
        localStorage.setItem('wacheck_user', JSON.stringify(userData));

        // Limpiar hash de la URL
        history.replaceState({}, '', window.location.pathname);

        console.log('[GoogleAuth] Login exitoso:', userData.name);

        // Actualizar UI si el SessionManager ya está listo
        if (window.SessionManager && typeof SessionManager.updateIndexUI === 'function') {
            SessionManager.updateIndexUI(userData);
        } else {
            // Recarga suave para aplicar sesión
            window.location.reload();
        }
    } catch (e) {
        console.error('[GoogleAuth] Error procesando callback:', e);
        history.replaceState({}, '', window.location.pathname);
    }
}

// ============================================================
// Permitir login con Enter + procesar callback de Google
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    const registerConfirm = document.getElementById('registerPasswordConfirm');
    if (registerConfirm) {
        registerConfirm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleRegister();
        });
    }

    // Procesar resultado de Google OAuth (si viene del callback)
    processGoogleCallback();
});
