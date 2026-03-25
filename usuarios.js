// --- Sistema de Usuarios ---
// Usa la API HYBRID que funciona tanto en web como en APK

// Iniciar sesión
async function handleLogin() {
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    if (!username || !password) {
        showMessage('Error', 'Por favor, ingresa nombre de usuario y contraseña.');
        return;
    }

    try {
        const response = await fetch('api/user_handler_SECURE.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, password: password })
        });
        const user = await response.json();

        if (user.error) {
            throw new Error(user.error);
        }

        login(user);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showMessage('Error de Inicio de Sesión', error.message);
    }
}

// Registrar un nuevo usuario
async function handleRegister() {
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    if (!username || !password) {
        showMessage('Error', 'El nombre de usuario y la contraseña no pueden estar vacíos.');
        return;
    }
    if (password.length < 4) {
        showMessage('Error', 'La contraseña debe tener al menos 4 caracteres.');
        return;
    }

    try {
        const response = await fetch('api/user_handler_SECURE.php?action=create_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, password: password })
        });
        const newUser = await response.json();

        if (newUser.error) {
            throw new Error(newUser.error);
        }

        showMessage('¡Éxito!', 'Usuario creado correctamente. Ahora puedes iniciar sesión.', [], 3000);
        // Opcional: Iniciar sesión automáticamente después del registro
        // login(newUser);
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        showMessage('Error de Registro', error.message);
    }
}

function login(userObject) {
    hideMessage(); // Ocultar el diálogo de selección si estaba abierto
    localStorage.setItem('wacheck_user', JSON.stringify(userObject)); // GUARDAR SESIÓN
    gameState.currentUser = userObject;

    // CORRECCIÓN: Asegurar que los defensores básicos SIEMPRE estén disponibles
    const basicDefenders = ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
    const userUnlocked = userObject.unlockedDefenders || [];
    const allUnlocked = [...new Set([...basicDefenders, ...userUnlocked])]; // Combinar sin duplicados

    // Cargar datos del usuario al estado del juego
    gameState.specialCoins = userObject.specialCoins || 0;
    gameState.unlockedDefenders = allUnlocked; // CORRECCIÓN: Usar lista combinada
    gameState.currentUser.calculatorCompleted = userObject.calculatorCompleted || false;
    
    // NUEVO: Sincronizar defensores comprados de la tienda con la base de datos
    const purchasedFromShop = userUnlocked.filter(def => !basicDefenders.includes(def));
    if (typeof purchasedDefenders !== 'undefined') {
        purchasedDefenders = purchasedFromShop;
        localStorage.setItem('purchasedDefenders', JSON.stringify(purchasedDefenders));
    }
    
    // NUEVO: Sincronizar variable local de specialCoins para la tienda
    if (typeof specialCoins !== 'undefined') {
        specialCoins = gameState.specialCoins;
        localStorage.setItem('specialCoins', specialCoins);
    }
    
    // Cargar progreso de la historia si existe
    if (userObject.storyProgress && typeof storyState !== 'undefined') {
        Object.assign(storyState, userObject.storyProgress);
    }
    
    // Cargar datos de recompensas si existen
    if (userObject.rewardsData && typeof rewardsState !== 'undefined') {
        Object.assign(rewardsState, userObject.rewardsData);
        updateRunesDisplay();
    }
    
    // Cargar datos de logros si existen
    if (userObject.achievementsData && typeof achievementsState !== 'undefined') {
        Object.assign(achievementsState, userObject.achievementsData);
        const achievementsMainDisplay = document.getElementById('achievementsUnlockedMain');
        if (achievementsMainDisplay) {
            achievementsMainDisplay.textContent = achievementsState.unlockedAchievements.length;
        }
    }
    
    // Actualizar UI (null-safe: estos elementos solo existen en la versión antigua del lobby)
    const _ul = document.getElementById('userLogin');
    const _ud = document.getElementById('userDropdown');
    const _upt = document.getElementById('userPanelToggle');
    const userInfoDiv = document.getElementById('userInfo');
    if (_ul)  _ul.style.display  = 'none';
    if (_ud)  _ud.style.display  = 'none';
    if (_upt) _upt.textContent   = '👤';
    if (userInfoDiv) {
        userInfoDiv.style.display = 'block';
        userInfoDiv.textContent = '';

        const pUser = document.createElement('p');
        pUser.append('Usuario: ');
        const strongUser = document.createElement('strong');
        strongUser.textContent = String(userObject.name ?? '');
        pUser.appendChild(strongUser);

        const pId = document.createElement('p');
        pId.append('ID: ');
        const strongId = document.createElement('strong');
        strongId.textContent = String(userObject.id ?? '');
        pId.appendChild(strongId);

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-button';
        logoutBtn.textContent = 'Cambiar Usuario';
        logoutBtn.addEventListener('click', logout);

        userInfoDiv.appendChild(pUser);
        userInfoDiv.appendChild(pId);
        userInfoDiv.appendChild(logoutBtn);
    }

    updateUnlockShop();
}

function logout() {
    localStorage.removeItem('wacheck_user'); // BORRAR SESIÓN
    const _ud  = document.getElementById('userDropdown');
    const _ul  = document.getElementById('userLogin');
    const _ui  = document.getElementById('userInfo');
    const _upt = document.getElementById('userPanelToggle');
    const _ui2 = document.getElementById('usernameInput');
    if (_ud)  _ud.style.display  = 'block';
    if (_ul)  _ul.style.display  = 'block';
    if (_ui)  _ui.style.display  = 'none';
    if (_upt) _upt.textContent   = '➕';
    if (_ui2) _ui2.value         = '';
    loginAsGuest();
}

async function saveProgressToServer() {
    if (!gameState.currentUser || gameState.currentUser.id === 0) return;
    
    // Detectar si es móvil para evitar el problema de InfinityFree
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    // En móviles, solo guardar localmente para evitar problemas con InfinityFree
    if (isMobile) {
        // Guardar solo en localStorage
        gameState.currentUser.specialCoins = gameState.specialCoins;
        gameState.currentUser.unlockedDefenders = gameState.unlockedDefenders;
        localStorage.setItem('wacheck_user', JSON.stringify(gameState.currentUser));
        return; // No intentar guardar en servidor desde móvil
    }

    try {
        const progressData = {
            id: gameState.currentUser.id,
            specialCoins: gameState.specialCoins,
            unlockedDefenders: gameState.unlockedDefenders,
            calculatorCompleted: gameState.currentUser.calculatorCompleted || false,
            rewardsData: typeof rewardsState !== 'undefined' ? rewardsState : {},
            achievementsData: typeof achievementsState !== 'undefined' ? achievementsState : {},
            storyProgress: typeof storyState !== 'undefined' ? {
                currentChapter: storyState.currentChapter,
                currentMission: storyState.currentMission,
                completedChapters: storyState.completedChapters,
                storyCoins: storyState.storyCoins,
                unlockedChapters: storyState.unlockedChapters
            } : {}
        };
        const response = await fetch('api/user_handler_SECURE.php?action=save_progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progressData)
        });
        
        // Obtener el texto de la respuesta para manejar errores correctamente
        const responseText = await response.text();
        
        // Intentar parsear como JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // Falló el parseo, probablemente InfinityFree inyectó contenido
            console.warn('No se pudo guardar en el servidor. El progreso se guardará localmente.');
            console.warn('Respuesta del servidor (primeros 200 chars):', responseText.substring(0, 200));
            return; // Salir silenciosamente
        }
 
        if (result.success) {
            // --- ¡ESTA ES LA CORRECCIÓN CLAVE! ---
            // Actualizar el objeto de usuario en el estado del juego y en localStorage
            gameState.currentUser.specialCoins = gameState.specialCoins;
            gameState.currentUser.unlockedDefenders = gameState.unlockedDefenders;
            localStorage.setItem('wacheck_user', JSON.stringify(gameState.currentUser));
        }
    } catch (error) {
        console.error("Error al guardar el progreso en el servidor:", error);
    }
}

// Función pública y segura para que otros módulos guarden el progreso del usuario.
// Llamará a saveProgressToServer si existe, o hará un guardado local como fallback.
function saveCurrentUserProgress() {
    try {
        // Primero, SIEMPRE guardar localmente
        if (gameState && gameState.currentUser) {
            gameState.currentUser.specialCoins = gameState.specialCoins;
            gameState.currentUser.unlockedDefenders = gameState.unlockedDefenders;
            localStorage.setItem('wacheck_user', JSON.stringify(gameState.currentUser));
            console.log('✅ Progreso guardado localmente:', {
                specialCoins: gameState.specialCoins,
                unlockedDefenders: gameState.unlockedDefenders
            });
        }
        
        // Luego, intentar guardar en servidor si la función existe
        if (typeof saveProgressToServer === 'function') {
            saveProgressToServer().catch(err => {
                console.warn('⚠️ Error al guardar en servidor (guardado local OK):', err);
            });
        }
    } catch (e) {
        console.error('❌ Error en saveCurrentUserProgress():', e);
    }
}

// Exponer globalmente para que script.js y otros puedan llamarla sin ReferenceError
window.saveCurrentUserProgress = saveCurrentUserProgress;

function loginAsGuest() {
    gameState.currentUser = {
        id: 0,
        name: 'Invitado',
        specialCoins: 0,
        unlockedDefenders: ["filter","plant","recycler","cleaner","stream","bubble","wind","earth"],
        calculatorCompleted: false
    };
    gameState.specialCoins = 0;
    gameState.unlockedDefenders = ["filter","plant","recycler","cleaner","stream","bubble","wind","earth"];
    const _ul = document.getElementById('userLogin');
    if (_ul) _ul.style.display = 'block';
    updateUnlockShop();
}