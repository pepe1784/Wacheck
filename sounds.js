// ====================================
// SISTEMA DE SONIDOS PARA WACHECK
// ====================================
// Este archivo gestiona todos los sonidos del juego.
// Puedes usar archivos .mp3 o los sonidos sintéticos por defecto.
//
// OPTIMIZACIONES ANTI-LAG:
// - Pool de audios reutilizables (sin crear/destruir constantemente)
// - Límite de 8 sonidos simultáneos máximo
// - Throttling de 50ms para evitar spam del mismo sonido
// - Volúmenes reducidos en sonidos frecuentes (disparos)
//
// INSTRUCCIONES:
// 1. Coloca tus archivos .mp3 en la carpeta "sounds/"
// 2. Asigna el nombre del archivo a cada sonido en soundFiles
// 3. Si no hay archivo .mp3, el juego usará el sonido sintético
// 4. Ajusta el volumen de cada sonido (0.0 = silencio, 1.0 = máximo)

// ====================================
// CONFIGURACIÓN DE ARCHIVOS DE SONIDO
// ====================================
// 
// 
// INSTRUCCIONES:
// 1. Coloca tu archivo .mp3 en la carpeta "sounds/"
// 2. Cambia null por "nombre_archivo.mp3" (con comillas)
// 3. Si dejas null, usará el sonido sintético (beep)
// 
// Ejemplo:
//   OK null                    -> Usa sonido sintetico (sin archivo .mp3)
//   OK "mi_sonido.mp3"         -> Usa el archivo sounds/mi_sonido.mp3
//   BAD mi_sonido.mp3           -> ERROR (faltan comillas)
//   BAD "mi_sonido"             -> ERROR (falta .mp3)
//
const soundFiles = {
    
    // ==========================================
    // SONIDOS DE INTERFAZ (Menus y botones)
    // ==========================================
    click: "sounds_clicks/Click_mause.mp3",         // Clic en cualquier botón
    hover: "sounds_clicks/Toque.mp3",                 // Pasar el mouse sobre un botón
    back: "sounds_clicks/Aire_regreso.mp3",            // Volver al menú anterior
    
    
    // ==========================================
    // SONIDOS DE DEFENSORES
    // ==========================================
    
    // --- Colocar Defensores ---
    placeDefender: "game_ui/place_defender.mp3",    // Colocar cualquier defensor en el tablero
    
    // --- Seleccionar Defensores ---
    selectDefender: "sounds_clicks/Toque.mp3",     // Hacer clic en un defensor en la tienda
    
    // --- Eliminar Defensores ---
    removeDefender: "game_ui/remove_defender.mp3",  // Eliminar un defensor del tablero (recuperar monedas)
    
    // --- Mejorar Defensores ---
    upgradeDefender: "game_ui/upgrade_defender.mp3", // Subir de nivel un defensor (Nivel 2, 3, 4, 5)
    
    
    // ==========================================
    // SONIDOS DE ATAQUES POR DEFENSOR
    // ==========================================
    
    // --- Ataques Generales (si no quieres sonido específico) ---
    shoot: "game_ui/shoot_generic.mp3",            // Disparo genérico (se usa si no hay específico)
    
    // --- Filtro (Agua) ---
    shootFilter: "sounds_atack/agua/filter.mp3",              // Disparo del Filtro (proyectil de agua azul)
    
    // --- Planta (Naturaleza) ---
    shootPlant: "allDefenderTypes/Nature/nature 2.mp3",  // Disparo de la Planta (proyectil verde)
    
    // --- Reciclador (Energía) ---
    shootRecycler: "allDefenderTypes/energy/energy.mp3",  // Disparo del Reciclador (proyectil amarillo)
    
    // --- Purificador ---
    shootCleaner: "sounds_atack/puro/cleaner.mp3",             // Disparo del Purificador (proyectil blanco)
    
    // --- Cristal ---
    shootCrystal: "sounds_atack/puro/crystal.mp3",             // Disparo del Cristal
    
    // --- Solar ---
    shootSolar: "allDefenderTypes/energy/energy.mp3",     // Disparo del Solar
    
    // --- Coral ---
    shootCoral: "allDefenderTypes/Nature/nature 2.mp3",   // Disparo del Coral
    
    // --- Tornado ---
    shootTornado: "allDefenderTypes/energy/energy.mp3",   // Disparo del Tornado
    
    // --- Ballena ---
    shootWhale: "sounds_atack/agua/whale.mp3",               // Disparo de la Ballena
    
    // --- Cañón Doble ---
    shootDualcannon: "allDefenderTypes/energy/energy.mp3", // Disparo del Cañón Doble (2 disparos rápidos)
    
    // --- Incinerador (Fuego) ---
    shootIncinerator: "allDefenderTypes/fire/fire.mp3",    // Disparo del Incinerador (proyectil de fuego)
    
    // --- Criomante (Hielo) ---
    shootCryomancer: "allDefenderTypes/ice/ice.mp3",       // Disparo del Criomante (proyectil de hielo)
    
    // --- Mortero (Explosión) ---
    shootMortar: "allDefenderTypes/explosion/explosion.mp3", // Disparo del Mortero (bomba que cae)
    
    // --- Chorro ---
    shootStream: "sounds_atack/agua/stream.mp3",              // Disparo del Chorro
    
    // --- Burbuja ---
    shootBubble: "sounds_atack/agua/burbujas.mp3",              // Disparo de Burbuja (ralentiza)
    
    // --- Mago Eléctrico ---
    shootWizard: "allDefenderTypes/energy/energy.mp3",     // Disparo del Mago (cadena eléctrica)
    
    // --- Nutria ---
    shootOtter: "allDefenderTypes/Nature/nature 2.mp3",    // Disparo de la Nutria
    
    // --- Kraken ---
    shootKraken: "sounds_atack/agua/whale.mp3",            // Disparo del Kraken (tentáculos - tipo agua)
    
    // --- Gólem ---
    shootGolem: "sounds_atack/puro/golem.mp3",               // Disparo del Gólem
    
    // --- Antitanque de Área ---
    shootAntiTank: "allDefenderTypes/explosion/explosion.mp3", // Disparo del Antitanque (explosión grande)
    
    
    // ==========================================
    // SONIDOS DE IMPACTOS
    // ==========================================
    hit: "game_ui/hit.mp3",                        // Impacto genérico en contaminante
    critical: "game_ui/critical.mp3",                // Golpe crítico (x2 daño) - efecto especial
    
    
    // ==========================================
    // SONIDOS DE CONTAMINANTES
    // ==========================================
    kill: "game_ui/kill.mp3",                      // Contaminante eliminado (muere)
    hurt: null, // La base recibe daño (sonido sintético — el .mp3 anterior es ahora música de fondo)
    spawn: "game_ui/spawn.mp3",                    // Aparece un contaminante nuevo
    spawnBoss: "allContaminatorTypes/leviatan.mp3",  // Aparece el boss (sonido corto, no la pista larga)
    
    
    // ==========================================
    // SONIDOS DE OLEADAS
    // ==========================================
    waveStart: "game_ui/wave_start.mp3",            // Empieza una nueva oleada
    waveComplete: "game_ui/wave_complete.mp3",       // Oleada completada con éxito
    // NOTE: rutas deben ser relativas al directorio "sounds/" y coincidir con el formato usado en el resto
    // Archivo real ubicado en sounds/sound_spawmob/Ahora_Pienso_Mas_en_Ti.mp3
    gameOver: "sound_spawmob/Ahora_Pienso_Mas_en_Ti.mp3",  // Perdiste el juego (vida = 0)
    victory: "game_ui/victory.mp3",                 // Ganaste el juego (todas las oleadas)
    
    
    // ==========================================
    // SONIDOS ESPECIALES
    // ==========================================
    coin: "game_ui/coin.mp3",                      // Ganar monedas (al matar enemigo o generar)
    unlock: "game_ui/unlock.mp3",                    // Desbloquear nuevo defensor
    achievement: "sounds_clicks/brillos.mp3",         // Logro desbloqueado
    powerup: "sounds_clicks/brillos.mp3",             // Mejora o buff aplicado
    reward: "sounds_clicks/brillos.mp3",              // Recompensa obtenida
    levelUp: "game_ui/upgrade_defender.mp3",          // Defensor sube de nivel
    mission: "game_ui/wave_complete.mp3",             // Misión del modo historia completada
    
    
    // ==========================================
    // SONIDOS DE SPAWN POR TIPO DE CONTAMINANTE
    // ==========================================
    spawnFabrica: "allContaminatorTypes/fabrica.mp3",     // Aparece Fábrica
    spawnPetroleo: "allContaminatorTypes/petroleo.mp3",   // Aparece Petróleo
    spawnNuclear: "allContaminatorTypes/nuclear.mp3",     // Aparece Nuclear
    spawnBasura: "allContaminatorTypes/basura.mp3",       // Aparece Basura
    spawnAuto: "allContaminatorTypes/auto.mp3",           // Aparece Auto
    spawnQuimico: "allContaminatorTypes/quimico.mp3",     // Aparece Químico
    spawnFuego: "allContaminatorTypes/fuego.mp3",         // Aparece Fuego
    spawnToxico: "allContaminatorTypes/toxico.mp3",       // Aparece Tóxico
    spawnHuracan: "allContaminatorTypes/huracan.mp3",     // Aparece Huracán
    spawnDemonio: "allContaminatorTypes/demonio.mp3",     // Aparece Demonio
    spawnFantasma: "allContaminatorTypes/fantasma.mp3",   // Aparece Fantasma
    spawnTanque: "allContaminatorTypes/tanque.mp3",       // Aparece Tanque
    spawnLeviatan: "allContaminatorTypes/leviatan.mp3",   // Aparece Leviatán
};

// ====================================
// CONFIGURACIÓN DE VOLUMEN
// ====================================
// 
//  Ajusta el volumen de cada sonido (0.0 = silencio, 1.0 = máximo)
//
// Recomendaciones:
//   0.1 - 0.2  -> Muy bajo (para sonidos muy frecuentes)
//   0.3 - 0.5  -> Medio (para feedback normal)
//   0.6 - 0.8  -> Alto (para eventos importantes)
//   0.9 - 1.0  -> Maximo (para victoria/derrota)
//
const soundVolumes = {
    
    // INTERFAZ
    click: 0.3,                     // Clic en botón
    hover: 0.15,                    // Hover sobre botón
    back: 0.25,                     // Volver atrás
    
    //  DEFENSORES
    placeDefender: 0.4,             // Colocar defensor
    selectDefender: 0.3,            // Seleccionar defensor
    removeDefender: 0.35,           // Eliminar defensor
    upgradeDefender: 0.5,           // Mejorar defensor
    
    //  ATAQUES (Genéricos y específicos) - REDUCIDOS para evitar lag
    shoot: 0.12,                    // Disparo genérico
    shootFilter: 0.12,              // Disparo de Filtro
    shootPlant: 0.12,               // Disparo de Planta
    shootRecycler: 0.12,            // Disparo de Reciclador
    shootCleaner: 0.12,             // Disparo de Purificador
    shootCrystal: 0.12,             // Disparo de Cristal
    shootSolar: 0.12,               // Disparo de Solar
    shootCoral: 0.12,               // Disparo de Coral
    shootTornado: 0.12,             // Disparo de Tornado
    shootWhale: 0.15,               // Disparo de Ballena
    shootDualcannon: 0.12,          // Disparo de Cañón Doble
    shootIncinerator: 0.15,         // Disparo de Incinerador
    shootCryomancer: 0.12,          // Disparo de Criomante
    shootMortar: 0.18,              // Disparo de Mortero
    shootStream: 0.1,               // Disparo de Chorro
    shootBubble: 0.1,               // Disparo de Burbuja
    shootWizard: 0.15,              // Disparo de Mago
    shootOtter: 0.12,               // Disparo de Nutria
    shootKraken: 0.15,              // Disparo de Kraken
    shootGolem: 0.12,               // Disparo de Gólem
    shootAntiTank: 0.18,            // Disparo de Antitanque
    
    //  IMPACTOS
    hit: 0.25,                      // Impacto en enemigo
    critical: 0.6,                  // Golpe crítico
    
    //  CONTAMINANTES
    kill: 0.4,                      // Contaminante eliminado
    hurt: 0.5,                      // Daño a la base
    spawn: 0.3,                     // Aparece contaminante
    spawnBoss: 0.5,                 // Aparece el boss (El Leviatán )
    
    //  SPAWN POR TIPO DE CONTAMINANTE
    spawnFabrica: 0.3,              // Aparece Fábrica
    spawnPetroleo: 0.3,             // Aparece Petróleo
    spawnNuclear: 0.35,             // Aparece Nuclear
    spawnBasura: 0.25,              // Aparece Basura
    spawnAuto: 0.3,                 // Aparece Auto
    spawnQuimico: 0.3,              // Aparece Químico
    spawnFuego: 0.3,                // Aparece Fuego
    spawnToxico: 0.35,              // Aparece Tóxico
    spawnHuracan: 0.35,             // Aparece Huracán
    spawnDemonio: 0.4,              // Aparece Demonio
    spawnFantasma: 0.3,             // Aparece Fantasma
    spawnTanque: 0.4,               // Aparece Tanque
    spawnLeviatan: 0.5,             // Aparece Leviatán
    
    //  OLEADAS
    waveStart: 0.6,                 // Empieza oleada
    waveComplete: 0.7,              // Oleada completada
    gameOver: 1.0,                  // Perdiste
    victory: 0.8,                   // Ganaste
    
    //  ESPECIALES
    coin: 0.4,                      // Ganar monedas
    unlock: 0.6,                    // Desbloquear defensor
    achievement: 0.7,               // Logro desbloqueado
    powerup: 0.5,                   // Mejora aplicada
    reward: 0.6,                    // Recompensa obtenida
    levelUp: 0.7,                   // Subir de nivel
    mission: 0.7,                   // Misión completada
};

// ====================================
// CONFIGURACIÓN DE SONIDOS SINTÉTICOS (FALLBACK)
// ====================================
// Si no hay archivo .mp3 (valor = null), se usan estos parámetros para
// generar sonidos con beeps (como estaba antes)
// 
// NO NECESITAS EDITAR ESTO, solo si quieres cambiar cómo suenan los beeps
//
const syntheticSounds = {
    
    // INTERFAZ
    click: { frequency: 400, duration: 0.1, waveType: 'square', volume: 0.15 },
    hover: { frequency: 300, duration: 0.05, waveType: 'sine', volume: 0.1 },
    back: { frequency: 300, duration: 0.1, waveType: 'square', volume: 0.15 },
    
    //  DEFENSORES
    placeDefender: { frequency: 500, duration: 0.15, waveType: 'triangle', volume: 0.2 },
    selectDefender: { frequency: 450, duration: 0.1, waveType: 'sine', volume: 0.15 },
    removeDefender: { frequency: 250, duration: 0.2, waveType: 'sawtooth', volume: 0.2 },
    upgradeDefender: { frequency: 700, duration: 0.3, waveType: 'triangle', volume: 0.25 },
    
    //  ATAQUES (todos usan el mismo sonido de disparo por defecto)
    shoot: { frequency: 350, duration: 0.08, waveType: 'square', volume: 0.1 },
    shootFilter: { frequency: 350, duration: 0.08, waveType: 'square', volume: 0.1 },
    shootPlant: { frequency: 400, duration: 0.08, waveType: 'sine', volume: 0.1 },
    shootRecycler: { frequency: 450, duration: 0.08, waveType: 'square', volume: 0.1 },
    shootCleaner: { frequency: 500, duration: 0.08, waveType: 'triangle', volume: 0.1 },
    shootCrystal: { frequency: 600, duration: 0.08, waveType: 'sine', volume: 0.1 },
    shootSolar: { frequency: 550, duration: 0.08, waveType: 'triangle', volume: 0.1 },
    shootCoral: { frequency: 380, duration: 0.08, waveType: 'sine', volume: 0.1 },
    shootTornado: { frequency: 300, duration: 0.1, waveType: 'sawtooth', volume: 0.12 },
    shootWhale: { frequency: 250, duration: 0.12, waveType: 'sine', volume: 0.12 },
    shootDualcannon: { frequency: 450, duration: 0.06, waveType: 'square', volume: 0.1 },
    shootIncinerator: { frequency: 200, duration: 0.1, waveType: 'sawtooth', volume: 0.12 },
    shootCryomancer: { frequency: 600, duration: 0.1, waveType: 'sine', volume: 0.1 },
    shootMortar: { frequency: 150, duration: 0.15, waveType: 'square', volume: 0.15 },
    shootStream: { frequency: 400, duration: 0.06, waveType: 'sine', volume: 0.08 },
    shootBubble: { frequency: 500, duration: 0.08, waveType: 'sine', volume: 0.08 },
    shootWizard: { frequency: 700, duration: 0.1, waveType: 'square', volume: 0.12 },
    shootOtter: { frequency: 420, duration: 0.08, waveType: 'triangle', volume: 0.1 },
    shootKraken: { frequency: 280, duration: 0.12, waveType: 'sawtooth', volume: 0.12 },
    shootGolem: { frequency: 180, duration: 0.15, waveType: 'square', volume: 0.1 },
    shootAntiTank: { frequency: 120, duration: 0.2, waveType: 'square', volume: 0.15 },
    
    //  IMPACTOS
    hit: { frequency: 200, duration: 0.1, waveType: 'sine', volume: 0.12 },
    critical: { frequency: 1200, duration: 0.2, waveType: 'square', volume: 0.3 },
    
    //  CONTAMINANTES
    kill: { frequency: 800, duration: 0.2, waveType: 'triangle', volume: 0.2 },
    hurt: { frequency: 150, duration: 0.3, waveType: 'sawtooth', volume: 0.25 },
    spawn: { frequency: 300, duration: 0.1, waveType: 'sawtooth', volume: 0.15 },
    spawnBoss: { frequency: 120, duration: 0.6, waveType: 'sawtooth', volume: 0.4 },
    
    //  OLEADAS
    waveStart: { frequency: 600, duration: 0.4, waveType: 'triangle', volume: 0.3 },
    waveComplete: { frequency: 800, duration: 0.5, waveType: 'sine', volume: 0.35 },
    gameOver: { frequency: 100, duration: 0.8, waveType: 'sawtooth', volume: 0.4 },
    victory: { frequency: 1000, duration: 0.6, waveType: 'sine', volume: 0.4 },
    
    //  ESPECIALES
    coin: { frequency: 600, duration: 0.15, waveType: 'sine', volume: 0.2 },
    unlock: { frequency: 800, duration: 0.4, waveType: 'triangle', volume: 0.3 },
    achievement: { frequency: 900, duration: 0.5, waveType: 'sine', volume: 0.35 },
    powerup: { frequency: 650, duration: 0.3, waveType: 'triangle', volume: 0.25 },
    reward: { frequency: 750, duration: 0.4, waveType: 'sine', volume: 0.3 },
    levelUp: { frequency: 850, duration: 0.5, waveType: 'triangle', volume: 0.35 },
    mission: { frequency: 900, duration: 0.5, waveType: 'sine', volume: 0.35 },
};

// ====================================
// SISTEMA DE REPRODUCCIÓN OPTIMIZADO
// ====================================

// Caché de audios precargados
const audioCache = {};

// Pool de instancias de audio para reutilización (evita lag)
const audioPools = {};
const MAX_POOL_SIZE = 5; // Máximo de instancias por sonido

// Limitador de sonidos simultáneos (evita saturación)
const activeSounds = {};
const MAX_SIMULTANEOUS_SOUNDS = 8; // Máximo de sonidos a la vez

// Throttling para sonidos repetitivos (anti-spam)
const lastSoundTime = {};
const SOUND_THROTTLE_MS = 50; // Mínimo de ms entre sonidos del mismo tipo

// Variable global para AudioContext (se inicializa al primer uso)
let audioContext = null;

// Función para inicializar el contexto de audio
function initSoundSystem() {
    if (!audioContext) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        } catch (e) {
            // Web Audio API no disponible
        }
    }
}

// Función para crear un pool de audios
function createAudioPool(soundName, fileName) {
    if (!audioPools[soundName]) {
        audioPools[soundName] = [];
    }
    
    // Crear instancias iniciales en el pool
    for (let i = 0; i < 3; i++) {
        const audio = new Audio(`sounds/${fileName}`);
        audio.preload = 'auto';
        audio.volume = soundVolumes[soundName] || 0.5;
        
        // Cuando termine, marcar como disponible
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
        });
        
        audio.onerror = () => {
            // Silencioso: archivo de sonido no encontrado
        };
        
        audioPools[soundName].push(audio);
    }
}

// Función para obtener una instancia de audio del pool
function getAudioFromPool(soundName) {
    const pool = audioPools[soundName];
    if (!pool) return null;
    
    // Buscar un audio que no se esté reproduciendo
    for (let audio of pool) {
        if (audio.paused || audio.ended || audio.currentTime === 0) {
            return audio;
        }
    }
    
    // Si todos están ocupados y no llegamos al límite, crear uno nuevo
    if (pool.length < MAX_POOL_SIZE) {
        const fileName = soundFiles[soundName];
        const audio = new Audio(`sounds/${fileName}`);
        audio.preload = 'auto';
        audio.volume = soundVolumes[soundName] || 0.5;
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
        });
        pool.push(audio);
        return audio;
    }
    
    // Si llegamos al límite, retornar null (se ignora el sonido)
    return null;
}

// Función para precargar un sonido .mp3
function preloadSound(soundName) {
    const fileName = soundFiles[soundName];
    if (!fileName || audioCache[soundName]) return;
    
    // Crear pool en lugar de un solo audio
    createAudioPool(soundName, fileName);
    audioCache[soundName] = true; // Marcar como precargado
}

// Función para precargar todos los sonidos disponibles
function preloadAllSounds() {
    Object.keys(soundFiles).forEach(soundName => {
        if (soundFiles[soundName]) {
            preloadSound(soundName);
        }
    });
}

// Función principal para reproducir un sonido (OPTIMIZADA)
function playGameSound(soundName) {
    // Verificar si los sonidos están habilitados (usar flag global)
    if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) return;

    // No reproducir sonidos del juego mientras está pausado (excepto UI)
    const uiSounds = { click: 1, hover: 1, back: 1, selectDefender: 1 };
    if (window.gameState && window.gameState.isPaused && !uiSounds[soundName]) return;
    
    // Throttling: Ignorar si se reprodujo el mismo sonido hace muy poco
    const now = Date.now();
    const lastTime = lastSoundTime[soundName] || 0;
    if (now - lastTime < SOUND_THROTTLE_MS) {
        return; // Ignorar para evitar spam de sonidos
    }
    lastSoundTime[soundName] = now;
    
    // Inicializar sistema si no está listo
    if (!audioContext) {
        initSoundSystem();
    }
    
    // Limitar sonidos simultáneos (anti-lag)
    const totalActiveSounds = Object.values(activeSounds).reduce((sum, count) => sum + count, 0);
    if (totalActiveSounds >= MAX_SIMULTANEOUS_SOUNDS) {
        return; // Ignorar sonido si hay demasiados
    }
    
    // Verificar si existe el archivo .mp3
    const fileName = soundFiles[soundName];
    
    if (fileName) {
        // Intentar reproducir el archivo .mp3
        playSoundFile(soundName);
    } else {
        // Usar sonido sintético
        playSyntheticSound(soundName);
    }
}

// Función para reproducir archivo .mp3 (OPTIMIZADA)
function playSoundFile(soundName) {
    const fileName = soundFiles[soundName];
    if (!fileName) return;
    
    // Precargar si no está en caché
    if (!audioCache[soundName]) {
        preloadSound(soundName);
    }
    
    // Obtener audio del pool
    const audio = getAudioFromPool(soundName);
    
    // Si no hay audio disponible, usar sonido sintético o ignorar
    if (!audio) {
        // Opción 1: Ignorar (menos lag)
        return;
        // Opción 2: Usar sintético (descomentar si prefieres)
        // playSyntheticSound(soundName);
    }
    
    // Contar sonidos activos
    activeSounds[soundName] = (activeSounds[soundName] || 0) + 1;
    
    // Reproducir
    audio.currentTime = 0;
    audio.volume = (soundVolumes[soundName] || 0.5) * (window.masterVolume ?? 1);
    
    audio.play().catch(err => {
        activeSounds[soundName] = Math.max(0, (activeSounds[soundName] || 1) - 1);
    });
    
    // Limpiar contador cuando termine
    audio.addEventListener('ended', function cleanupHandler() {
        activeSounds[soundName] = Math.max(0, (activeSounds[soundName] || 1) - 1);
        audio.removeEventListener('ended', cleanupHandler);
    }, { once: true });
}

// Función para reproducir sonido sintético (fallback)
function playSyntheticSound(soundName) {
    if (!audioContext) return;
    
    const config = syntheticSounds[soundName];
    if (!config) return;
    
    // Usar la función playSound original si existe
    if (typeof playSound === 'function') {
        playSound(
            config.frequency,
            config.duration,
            config.waveType,
            config.volume
        );
    }
}

// ====================================
// FUNCIONES DE CONVENIENCIA
// ====================================
// Estas funciones facilitan el uso de los sonidos en el código del juego
//
const GameSounds = {
    // INTERFAZ
    click: () => playGameSound('click'),
    hover: () => playGameSound('hover'),
    back: () => playGameSound('back'),
    
    //  DEFENSORES
    placeDefender: () => playGameSound('placeDefender'),
    selectDefender: () => playGameSound('selectDefender'),
    removeDefender: () => playGameSound('removeDefender'),
    upgradeDefender: () => playGameSound('upgradeDefender'),
    
    //  ATAQUES GENÉRICOS
    shoot: () => playGameSound('shoot'),
    
    //  ATAQUES POR DEFENSOR
    shootFilter: () => playGameSound('shootFilter'),
    shootPlant: () => playGameSound('shootPlant'),
    shootRecycler: () => playGameSound('shootRecycler'),
    shootCleaner: () => playGameSound('shootCleaner'),
    shootCrystal: () => playGameSound('shootCrystal'),
    shootSolar: () => playGameSound('shootSolar'),
    shootCoral: () => playGameSound('shootCoral'),
    shootTornado: () => playGameSound('shootTornado'),
    shootWhale: () => playGameSound('shootWhale'),
    shootDualcannon: () => playGameSound('shootDualcannon'),
    shootIncinerator: () => playGameSound('shootIncinerator'),
    shootCryomancer: () => playGameSound('shootCryomancer'),
    shootMortar: () => playGameSound('shootMortar'),
    shootStream: () => playGameSound('shootStream'),
    shootBubble: () => playGameSound('shootBubble'),
    shootWizard: () => playGameSound('shootWizard'),
    shootOtter: () => playGameSound('shootOtter'),
    shootKraken: () => playGameSound('shootKraken'),
    shootGolem: () => playGameSound('shootGolem'),
    shootAntiTank: () => playGameSound('shootAntiTank'),
    
    //  IMPACTOS
    hit: () => playGameSound('hit'),
    critical: () => playGameSound('critical'),
    
    //  CONTAMINANTES
    kill: () => playGameSound('kill'),
    hurt: () => playGameSound('hurt'),
    
    //  SPAWN POR TIPO DE CONTAMINANTE
    spawnFabrica: () => playGameSound('spawnFabrica'),
    spawnPetroleo: () => playGameSound('spawnPetroleo'),
    spawnNuclear: () => playGameSound('spawnNuclear'),
    spawnBasura: () => playGameSound('spawnBasura'),
    spawnAuto: () => playGameSound('spawnAuto'),
    spawnQuimico: () => playGameSound('spawnQuimico'),
    spawnFuego: () => playGameSound('spawnFuego'),
    spawnToxico: () => playGameSound('spawnToxico'),
    spawnHuracan: () => playGameSound('spawnHuracan'),
    spawnDemonio: () => playGameSound('spawnDemonio'),
    spawnFantasma: () => playGameSound('spawnFantasma'),
    spawnTanque: () => playGameSound('spawnTanque'),
    spawnLeviatan: () => playGameSound('spawnLeviatan'),
    
    //  OLEADAS
    waveStart: () => playGameSound('waveStart'),
    waveComplete: () => playGameSound('waveComplete'),
    gameOver: () => playGameSound('gameOver'),
    victory: () => playGameSound('victory'),
    
    //  ESPECIALES
    coin: () => playGameSound('coin'),
    unlock: () => playGameSound('unlock'),
    achievement: () => playGameSound('achievement'),
    powerup: () => playGameSound('powerup'),
    reward: () => playGameSound('reward'),
    levelUp: () => playGameSound('levelUp'),
    mission: () => playGameSound('mission'),
};

// ====================================
// INICIALIZACIÓN AUTOMÁTICA
// ====================================

// Precargar sonidos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    initSoundSystem();
    
    // Precargar sonidos en el primer clic del usuario
    document.addEventListener('click', () => {
        preloadAllSounds();
    }, { once: true });
});

// ====================================
// EXPORTAR PARA USO GLOBAL
// ====================================
window.GameSounds = GameSounds;
window.playGameSound = playGameSound;

// ====================================
// SISTEMA DE MÚSICA DE FONDO
// ====================================
// Reproductor dedicado para música de fondo, separado del sistema
// de pools y de MAX_SIMULTANEOUS_SOUNDS para que nunca se interrumpa.
(function() {
    let bgMusic = null;
    let bgMusicFile = 'sounds/sounds_clicks/Sonido_de_juego_vicioso.mp3';
    let bgMusicVolume = 0.25;
    let bgMusicPlaying = false;

    function createBgMusic() {
        if (bgMusic) return bgMusic;
        bgMusic = new Audio(bgMusicFile);
        bgMusic.loop = true;
        bgMusic.volume = bgMusicVolume * (window.masterVolume ?? 1.0);
        bgMusic.preload = 'auto';
        bgMusic.addEventListener('error', function() {
            console.warn('[BGMusic] Could not load background music file');
        });
        return bgMusic;
    }

    window.playBackgroundMusic = function() {
        if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) return;
        createBgMusic();
        bgMusic.volume = bgMusicVolume * (window.masterVolume ?? 1.0);
        if (bgMusic.paused) {
            bgMusic.play().then(function() {
                bgMusicPlaying = true;
                console.log('[BGMusic] Background music started');
            }).catch(function(e) {
                // Autoplay blocked — will retry on next user interaction
            });
        }
    };

    window.stopBackgroundMusic = function() {
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            bgMusicPlaying = false;
        }
    };

    window.pauseBackgroundMusic = function() {
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            bgMusicPlaying = false;
        }
    };

    window.resumeBackgroundMusic = function() {
        if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) return;
        if (bgMusic && bgMusic.paused && bgMusic.currentTime > 0) {
            bgMusic.play().catch(function() {});
            bgMusicPlaying = true;
        }
    };

    window.isBgMusicPlaying = function() {
        return bgMusicPlaying && bgMusic && !bgMusic.paused;
    };

    window.setBgMusicVolume = function(v) {
        bgMusicVolume = Math.max(0, Math.min(1, v));
        if (bgMusic) bgMusic.volume = bgMusicVolume * (window.masterVolume ?? 1.0);
    };

    // Update bgMusic volume when masterVolume changes
    const origSetMaster = window.setMasterVolume;
    window.setMasterVolume = function(v) {
        if (origSetMaster) origSetMaster(v);
        if (bgMusic) bgMusic.volume = bgMusicVolume * (window.masterVolume ?? 1.0);
    };
})();

// ====================================
// AUTO-PLAY: Iniciar audio al entrar a partida
// ====================================
// Cuando el usuario ya tiene soundEnabled=true y navega a game.php,
// el AudioContext puede estar bloqueado. Este código lo resume en
// la primera interacción y arranca la música de fondo automáticamente.
// SOLO activa la música de fondo en páginas de juego (game-page.html, game.php).
(function() {
    var autoPlayDone = false;
    var isGamePage = /game\.php$/i.test(window.location.pathname);

    function onFirstInteraction() {
        if (autoPlayDone) return;
        autoPlayDone = true;

        // Resume AudioContext if suspended
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (!audioContext) {
            initSoundSystem();
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }

        // Start background music ONLY on game pages
        if (isGamePage && window.soundEnabled) {
            window.playBackgroundMusic();
        }

        // Remove listeners
        document.removeEventListener('click', onFirstInteraction, true);
        document.removeEventListener('touchstart', onFirstInteraction, true);
        document.removeEventListener('keydown', onFirstInteraction, true);
    }

    // If sound is enabled, listen for first interaction to auto-start
    if (window.soundEnabled !== false) {
        document.addEventListener('click', onFirstInteraction, true);
        document.addEventListener('touchstart', onFirstInteraction, true);
        document.addEventListener('keydown', onFirstInteraction, true);
    }

    // Stop music when navigating away from game page
    window.addEventListener('pagehide', function() {
        if (window.stopBackgroundMusic) window.stopBackgroundMusic();
    });
    window.addEventListener('beforeunload', function() {
        if (window.stopBackgroundMusic) window.stopBackgroundMusic();
    });
})();

// ====================================
// FUNCIÓN: Sonido de spawn por tipo de contaminante
// ====================================
// Llama a esta función cuando aparece un contaminante.
// Si el contaminante tiene sonido específico, lo usa;
// si no, usa el sonido genérico de spawn.
//
// Uso: playContaminantSpawnSound('Fabrica');
//      playContaminantSpawnSound(contaminant.icon);
//
function playContaminantSpawnSound(contaminantIcon) {
    const soundMap = {
        'Fabrica':   'spawnFabrica',
        'Petroleo':  'spawnPetroleo',
        'Nuclear':   'spawnNuclear',
        'Basura':    'spawnBasura',
        'Auto':      'spawnAuto',
        'Quimico':   'spawnQuimico',
        'Fuego':     'spawnFuego',
        'Toxico':    'spawnToxico',
        'Huracan':   'spawnHuracan',
        'Demonio':   'spawnDemonio',
        'Fantasma':  'spawnFantasma',
        'Tanque':    'spawnTanque',
        'Leviatan':  'spawnLeviatan'
    };

    const soundName = soundMap[contaminantIcon];
    if (soundName) {
        playGameSound(soundName);
    } else {
        // Fallback al sonido genérico de spawn
        playGameSound('spawn');
    }
}
window.playContaminantSpawnSound = playContaminantSpawnSound;

// ====================================
// CONTROL DE ACTIVACIÓN/DESACTIVACIÓN DE SONIDO
// ====================================
// Inicializar estado global de sonido (usar localStorage si existe)
if (typeof window.soundEnabled === 'undefined') {
    const saved = localStorage.getItem('wacheck_soundEnabled');
    window.soundEnabled = (saved === 'false') ? false : true;
}

// Volumen maestro (0.0 - 1.0)
if (typeof window.masterVolume === 'undefined') {
    const savedVol = localStorage.getItem('wacheck_masterVolume');
    window.masterVolume = savedVol !== null ? parseFloat(savedVol) : 1.0;
}

function setMasterVolume(v) {
    window.masterVolume = Math.max(0, Math.min(1, v));
    localStorage.setItem('wacheck_masterVolume', window.masterVolume);
}
window.setMasterVolume = setMasterVolume;

function initAudio() {
    if (!audioContext) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return;
        audioContext = new AudioContextCtor();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(function() {});
    }
}

function toggleSound() {
    // Alternar el flag global
    window.soundEnabled = !window.soundEnabled;
    // Guardar la preferencia en localStorage
    localStorage.setItem('wacheck_soundEnabled', window.soundEnabled);
    
    // Actualizar ambos botones (global y del juego)
    const globalBtn = document.getElementById('soundToggle');
    const gameBtn   = document.getElementById('gameSoundToggle');
    const lucideIcon = window.soundEnabled ? 'volume-2' : 'volume-x';

    // Actualizar botón global (game.php / index.html style: contiene <i data-lucide>)
    if (globalBtn) {
        const ico = globalBtn.querySelector('[data-lucide]');
        if (ico) {
            ico.setAttribute('data-lucide', lucideIcon);
            if (window.lucide) lucide.createIcons();
        } else {
            globalBtn.textContent = window.soundEnabled ? 'ON' : 'OFF';
        }
    }
    // Actualizar icono de volumen en index.html (#volumeIcon / #volumeBtn)
    const volumeIcon = document.getElementById('volumeIcon');
    if (volumeIcon) {
        volumeIcon.setAttribute('data-lucide', lucideIcon);
        if (window.lucide) lucide.createIcons();
    }
    if (gameBtn) {
        const gameIco = gameBtn.querySelector('[data-lucide]');
        if (gameIco) {
            gameIco.setAttribute('data-lucide', lucideIcon);
            if (window.lucide) lucide.createIcons();
        } else {
            gameBtn.textContent = window.soundEnabled ? 'ON' : 'OFF';
        }
    }

    if (window.soundEnabled) {
        initAudio();
        // Resume background music when sound is re-enabled
        if (window.playBackgroundMusic) window.playBackgroundMusic();
    } else {
        // Stop background music
        if (window.stopBackgroundMusic) window.stopBackgroundMusic();
        // Pausar y resetear todos audios activos en los pools para silenciar inmediatamente
        try {
            Object.keys(audioPools).forEach(name => {
                audioPools[name].forEach(a => {
                    try { a.pause(); a.currentTime = 0; } catch(e) {}
                });
            });
            // También limpiar cualquier referencia global de audios de fallback
            if (window.currentGameOverAudio) {
                try { window.currentGameOverAudio.pause(); window.currentGameOverAudio.currentTime = 0; } catch(e) {}
                window.currentGameOverAudio = null;
            }
        } catch (e) {
            // Silencioso
        }
    }
}

// Función básica playSound para compatibilidad con código antiguo
function playSound(frequency, duration, type = 'sine', volume = 0.1) {
    if ((typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume * (window.masterVolume ?? 1.0);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Exportar funciones de compatibilidad
window.initAudio = initAudio;
window.toggleSound = toggleSound;
window.toggleSoundGlobal = toggleSound; // alias para index.html
window.playSound = playSound;

// Función para detener audios por nombre (ej: 'spawnBoss', 'gameOver')
window.stopGameSound = function(soundName) {
    try {
        // Detener audios en el pool
        if (audioPools[soundName]) {
            audioPools[soundName].forEach((audio, idx) => {
                try {
                    if (!audio.paused) audio.pause();
                    audio.currentTime = 0;
                } catch (e) {
                    // ignore
                }
            });
        }

        // Manejar casos de referencias globales conocidas
        if (soundName === 'gameOver' && window.currentGameOverAudio) {
            try { window.currentGameOverAudio.pause(); window.currentGameOverAudio.currentTime = 0; } catch(e) {}
            window.currentGameOverAudio = null;
        }

        // Intentar detener cualquier variable global que siga el patrón current<CapName>Audio
        const cap = soundName.charAt(0).toUpperCase() + soundName.slice(1);
        const gName = `current${cap}Audio`;
        if (window[gName]) {
            try { window[gName].pause(); window[gName].currentTime = 0; } catch(e) {}
            window[gName] = null;
        }
    } catch (e) {
        // Silencioso
    }
};

// ====================================
// HOOKS DE DEPURACIÓN Y FALLBACK AUTOMÁTICO
// ====================================
// Este código instala interceptores para garantizar que el sonido gameOver
// se reproduzca correctamente incluso si el sistema de pool falla
(function(){
    const HOOK_MARK = '__wacheck_hooked__';
    
    // Variable global para almacenar la instancia de audio de Game Over
    window.currentGameOverAudio = null;

    // Función para detener el sonido de Game Over
    window.stopGameOverSound = function() {
        // Detener el audio del fallback
        if (window.currentGameOverAudio) {
            try {
                window.currentGameOverAudio.pause();
                window.currentGameOverAudio.currentTime = 0;
                window.currentGameOverAudio = null;
            } catch(e) {
                // Silencioso
            }
        }
        
        // Detener audios del pool de gameOver
        if (audioPools['gameOver']) {
            audioPools['gameOver'].forEach((audio) => {
                try {
                    if (!audio.paused) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                } catch(e) {
                    // Silencioso
                }
            });
        }
    };

    // Función para detener TODOS los sonidos del juego
    window.stopAllGameSounds = function() {
        // Detener Game Over específicamente
        window.stopGameOverSound();
        
        // Detener música de fondo
        if (window.stopBackgroundMusic) window.stopBackgroundMusic();
        
        // Detener todos los audios de los pools
        Object.keys(audioPools).forEach(poolName => {
            if (audioPools[poolName]) {
                audioPools[poolName].forEach((audio) => {
                    try {
                        if (!audio.paused) {
                            audio.pause();
                            audio.currentTime = 0;
                        }
                    } catch(e) {
                        // Silencioso
                    }
                });
            }
        });
        
        // Detener cualquier audio HTML5 adicional
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch(e) {
                // Silencioso
            }
        });
    };

    // Función para PAUSAR todos los sonidos del juego (sin resetear posición)
    window.pauseAllGameSounds = function() {
        // Pausar música de fondo
        if (window.pauseBackgroundMusic) window.pauseBackgroundMusic();

        // Pausar todos los audios activos en los pools
        Object.keys(audioPools).forEach(poolName => {
            if (audioPools[poolName]) {
                audioPools[poolName].forEach((audio) => {
                    try {
                        if (!audio.paused) {
                            audio.pause();
                        }
                    } catch(e) {}
                });
            }
        });
    };

    // Función para REANUDAR todos los sonidos del juego pausados
    window.resumeAllGameSounds = function() {
        if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) return;

        // Reanudar música de fondo
        if (window.resumeBackgroundMusic) window.resumeBackgroundMusic();

        // Los sonidos SFX de pools NO se reanudan — son efímeros y es mejor
        // que solo reanude la música de fondo. Los SFX se generan de nuevo
        // naturalmente al continuar el gameloop.
    };

    function installHooksOnce() {
        // Hook playGameSound
        if (typeof window.playGameSound === 'function' && !window.playGameSound[HOOK_MARK]) {
            const _orig = window.playGameSound;
            function wrappedPlayGameSound(name) {
                try { return _orig.apply(this, arguments); } catch (e) { console.error('error en playGameSound original', e); }
            }
            wrappedPlayGameSound[HOOK_MARK] = true;
            window.playGameSound = wrappedPlayGameSound;
        }

        // Hook GameSounds.gameOver con fallback garantizado
        if (window.GameSounds && typeof window.GameSounds.gameOver === 'function' && !window.GameSounds.gameOver[HOOK_MARK]) {
            const _g = window.GameSounds.gameOver;
            function wrappedGameOver() {
                try { _g.apply(this, arguments); } catch (e) { /* silencioso */ }
                // Fallback garantizado de reproducción directa
                try {
                    // Detener cualquier audio de Game Over anterior
                    window.stopGameOverSound();
                    
                    const f = new Audio('sounds/sound_spawmob/Ahora_Pienso_Mas_en_Ti.mp3');
                    f.volume = (typeof soundVolumes !== 'undefined' && soundVolumes.gameOver) ? soundVolumes.gameOver : 1.0;
                    f.muted = false;
                    
                    // Guardar referencia global
                    window.currentGameOverAudio = f;
                    
                    // Limpiar referencia cuando termine
                    f.addEventListener('ended', () => {
                        window.currentGameOverAudio = null;
                    });
                    
                    f.play().catch(err => { /* silencioso */ });
                } catch (err) {
                    // silencioso
                }
            }
            wrappedGameOver[HOOK_MARK] = true;
            window.GameSounds.gameOver = wrappedGameOver;
        }
    }

    function startPatcher() {
        installHooksOnce();
        // Reintentar durante 10s por si las funciones se crean o sobrescriben después
        const iv = setInterval(installHooksOnce, 500);
        setTimeout(() => {
            clearInterval(iv);
        }, 10000);
    }

    // Instalar hooks cuando el DOM esté listo
    if (document.readyState === 'complete') {
        startPatcher();
    } else {
        window.addEventListener('load', startPatcher);
        window.addEventListener('DOMContentLoaded', startPatcher);
    }

    // Observador del DOM para detectar cuando la vida llega a 0 (backup adicional)
    function setupHealthObserver() {
        const healthEl = document.getElementById('healthCount');
        if (healthEl) {
            const obs = new MutationObserver(() => {
                const v = Number(healthEl.textContent || healthEl.innerText);
                if (v <= 0) {
                    try {
                        if (window.GameSounds && typeof window.GameSounds.gameOver === 'function') {
                            window.GameSounds.gameOver();
                        } else if (typeof window.playGameSound === 'function') {
                            window.playGameSound('gameOver');
                        }
                    } catch(e){ console.error(e); }
                    obs.disconnect();
                }
            });
            obs.observe(healthEl, { childList: true, characterData: true, subtree: true });
        }
    }

    // Instalar observador cuando el elemento exista
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupHealthObserver);
    } else {
        setupHealthObserver();
    }
})();
