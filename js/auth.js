// ====================================
// auth.js - Sistema de Autenticación
// ====================================

// Usar HYBRID por ahora (compatible con tu BD actual)
// Cambia a 'api/user_handler_SECURE.php' después de importar wacheck_db_SECURE.sql
const API_URL = 'api/user_handler_HYBRID.php';

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
            
            // Guardar datos en localStorage para compatibilidad
            localStorage.setItem('currentUser', JSON.stringify(data));
            localStorage.setItem('wacheck-session', JSON.stringify({
                id: data.id,
                name: data.name,
                authenticated: true
            }));
            
            // Redirigir al juego protegido
            setTimeout(() => {
                window.location.href = 'game-page.html';
            }, 1000);
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

// Permitir login con Enter
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
});
