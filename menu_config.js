// ========================================
// SISTEMA DE CONFIGURACIÓN DEL MENÚ
// ========================================

// Cargar configuración guardada al iniciar
let menuConfig = {
    style: localStorage.getItem('wacheck_menuStyle') || 'bottom' // 'bottom' o 'floating'
};

// Inicializar configuración al cargar la página
function initializeMenuConfig() {
    // Aplicar estilo guardado
    applyMenuStyle(menuConfig.style);
    
    // Actualizar botones de estilo activos
    updateStyleButtons();
    
    // Forzar aplicación después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        applyMenuStyle(menuConfig.style);
    }, 100);
}

// Cambiar estilo del menú
function changeMenuStyle(style) {
    menuConfig.style = style;
    localStorage.setItem('wacheck_menuStyle', style);
    applyMenuStyle(style);
    updateStyleButtons();
    
    // NO cerrar el panel - mantenerlo abierto para cambiar rápidamente
    // toggleSettingsPanel();
}

// Aplicar el estilo del menú
function applyMenuStyle(style) {
    const bottomMenu = document.getElementById('bottomMenu');
    const floatingMenu = document.getElementById('floatingMenuContainer');
    
    if (style === 'bottom') {
        // Mostrar menú inferior con flex para que los botones se distribuyan
        if (bottomMenu) {
            bottomMenu.style.setProperty('display', 'flex', 'important');
        }
        if (floatingMenu) {
            floatingMenu.style.setProperty('display', 'none', 'important');
        }
    } else if (style === 'floating') {
        // Mostrar menú flotante como block
        if (bottomMenu) {
            bottomMenu.style.setProperty('display', 'none', 'important');
        }
        if (floatingMenu) {
            floatingMenu.style.setProperty('display', 'block', 'important');
        }
    }
    
    // Sincronizar notificaciones
    syncNotificationDots();
}

// Actualizar botones de estilo activos
function updateStyleButtons() {
    document.querySelectorAll('.menu-style-btn').forEach(btn => {
        const style = btn.getAttribute('data-style');
        if (style === menuConfig.style) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Sincronizar puntos de notificación entre menús
function syncNotificationDots() {
    // Recompensas
    const rewardsDot = document.getElementById('rewardsDot');
    const rewardsDotFloating = document.getElementById('rewardsDotFloating');
    if (rewardsDot && rewardsDotFloating) {
        const display = rewardsDot.style.display;
        rewardsDotFloating.style.display = display;
    }
    
    // Misiones
    const missionsDot = document.getElementById('missionsDot');
    const missionsDotFloating = document.getElementById('missionsDotFloating');
    if (missionsDot && missionsDotFloating) {
        const display = missionsDot.style.display;
        missionsDotFloating.style.display = display;
    }
    
    // Logros
    const achievementsDot = document.getElementById('achievementsDot');
    const achievementsDotFloating = document.getElementById('achievementsDotFloating');
    if (achievementsDot && achievementsDotFloating) {
        const display = achievementsDot.style.display;
        achievementsDotFloating.style.display = display;
    }
}

// Toggle del panel de configuración vertical
function toggleSettingsPanel() {
    const dropdown = document.getElementById('verticalMenuDropdown');
    
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Toggle del menú flotante
function toggleFloatingMenu() {
    const buttons = document.getElementById('floatingMenuButtons');
    const toggle = document.getElementById('floatingMenuToggle');
    const isOpen = buttons.classList.contains('open');
    
    if (isOpen) {
        buttons.classList.remove('open');
        toggle.classList.remove('active');
    } else {
        buttons.classList.add('open');
        toggle.classList.add('active');
    }
}

// Cerrar menú flotante
function closeFloatingMenu() {
    const buttons = document.getElementById('floatingMenuButtons');
    const toggle = document.getElementById('floatingMenuToggle');
    if (buttons) buttons.classList.remove('open');
    if (toggle) toggle.classList.remove('active');
}

// Cerrar panel de configuración al hacer clic fuera
document.addEventListener('click', (e) => {
    const settingsPanel = document.getElementById('settingsPanelToggle');
    const dropdown = document.getElementById('verticalMenuDropdown');
    const leftSidebar = document.querySelector('.left-sidebar');
    
    // Si el clic fue fuera de toda la barra lateral y el menú está abierto
    if (leftSidebar && dropdown && !leftSidebar.contains(e.target)) {
        if (dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    }
});

// Cerrar menú flotante al hacer clic fuera
document.addEventListener('click', (e) => {
    const floatingMenu = document.getElementById('floatingMenuContainer');
    const buttons = document.getElementById('floatingMenuButtons');
    const toggle = document.getElementById('floatingMenuToggle');
    
    if (floatingMenu && !floatingMenu.contains(e.target)) {
        if (buttons && buttons.classList.contains('open')) {
            buttons.classList.remove('open');
            toggle.classList.remove('active');
        }
    }
});

// Exportar funciones globalmente
window.toggleSettingsPanel = toggleSettingsPanel;
window.changeMenuStyle = changeMenuStyle;
// Función para cerrar el menú desplegable vertical
function closeSettingsPanel() {
    const dropdown = document.getElementById('verticalMenuDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

window.toggleFloatingMenu = toggleFloatingMenu;
window.closeFloatingMenu = closeFloatingMenu;
window.closeSettingsPanel = closeSettingsPanel; // Hacer accesible globalmente
window.initializeMenuConfig = initializeMenuConfig;
window.syncNotificationDots = syncNotificationDots;

// Función para cerrar sesión
async function handleLogout() {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        return;
    }

    try {
        const API_URL = 'api/user_handler_SECURE.php';
        
        const response = await fetch(`${API_URL}?action=logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) {
            // Limpiar localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('wacheck-session');
            
            // Redirigir a landing
            window.location.href = 'index.html';
        } else {
            alert('Error al cerrar sesión. Intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error en logout:', error);
        alert('Error de conexión. Intenta de nuevo.');
    }
}

window.handleLogout = handleLogout;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenuConfig);
} else {
    initializeMenuConfig();
}
