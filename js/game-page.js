// ==========================================
// Game Page JavaScript
// ==========================================

// Data structures
const defenders = [
    // Defensores básicos del juego (siempre disponibles)
    { id: "filter", name: "Filtro", emoji: "filter", category: "low-cost", cost: 25, damage: 25, health: 50, range: 4, description: "Defensor básico que filtra contaminantes a distancia media." },
    { id: "plant", name: "Planta", emoji: "plant", category: "special", cost: 40, damage: 35, health: 100, range: 4, description: "Planta purificadora que se auto-cura con el tiempo." },
    { id: "recycler", name: "Reciclador", emoji: "recycler", category: "damage", cost: 60, damage: 45, health: 70, range: 3, description: "Ataque rápido que recicla los desechos en energía." },
    { id: "cleaner", name: "Purificador", emoji: "cleaner", category: "damage", cost: 100, damage: 60, health: 100, range: 5, description: "Limpiador de alto alcance que elimina contaminantes a distancia." },
    { id: "stream", name: "Chorro", emoji: "stream", category: "low-cost", cost: 20, damage: 18, health: 150, range: 6, description: "Económico y eficiente. Ideal para defensa temprana." },
    { id: "bubble", name: "Burbuja", emoji: "bubble", category: "special", cost: 30, damage: 6, health: 150, range: 6, description: "Ralentiza a los enemigos con burbujas adhesivas." },
    { id: "wind", name: "Viento", emoji: "wind", category: "special", cost: 20, damage: 18, health: 60, range: 4, description: "Empuja a los contaminantes hacia atrás." },
    { id: "earth", name: "Tierra", emoji: "earth", category: "tank", cost: 25, damage: 22, health: 80, range: 3, description: "Muro de tierra con gran resistencia que aturde al impactar." },
    
    // Defensores especiales desbloqueables
    { id: "water-shield", name: "Gota Escudo", emoji: "shield", category: "low-cost", cost: 50, damage: 15, health: 100, range: 1, description: "Defensor básico con escudo. Barato y resistente para las primeras líneas." },
    { id: "rain-cloud", name: "Nube Lluviosa", emoji: "rain-cloud", category: "low-cost", cost: 75, damage: 20, health: 60, range: 3, description: "Ataca con lluvia a distancia. Ideal para apoyo desde atrás." },
    { id: "water-cannon", name: "Aqua Cañón", emoji: "water-cannon", category: "damage", cost: 150, damage: 45, health: 80, range: 4, description: "Dispara chorros de agua a alta presión. Gran alcance y daño." },
    { id: "ice-crystal", name: "Cristal de Hielo", emoji: "cryomancer", category: "damage", cost: 125, damage: 35, health: 70, range: 3, description: "Congela y ralentiza a los contaminantes. Perfecto para control." },
    { id: "wave-warrior", name: "Guerrero Ola", emoji: "wave-warrior", category: "tank", cost: 200, damage: 30, health: 250, range: 1, description: "Tanque pesado con enorme resistencia. Aguanta oleadas enteras." },
    { id: "water-lily", name: "Lirio Acuático", emoji: "water-lily", category: "special", cost: 100, damage: 10, health: 80, range: 2, description: "Genera recursos adicionales y cura a defensores cercanos." },
    { id: "coral-reef", name: "Coral Dorado", emoji: "coral", category: "special", cost: 175, damage: 25, health: 120, range: 2, description: "Aura especial que aumenta el daño de defensores adyacentes." },
    { id: "tsunami-giant", name: "Titán Tsunami", emoji: "golem", category: "special", cost: 300, damage: 150, health: 180, range: 6, description: "Defensor legendario. Daño en área masivo que arrasa oleadas." },
];

const storyChapters = [
    {
        chapter: 1,
        title: "El Despertar del Río",
        description: "El río de Colima está en peligro. Las fábricas han comenzado a verter residuos tóxicos y los contaminantes avanzan sin control. Como nuevo guardián del agua, debes organizar tu primera línea de defensa usando las gotas escudo que te ha encomendado el Consejo del Agua.",
        levels: [
            { name: "Primera Oleada", wave: 1, playable: true },
            { name: "Los Desechos Avanzan", wave: 3, playable: true },
            { name: "Jefe: Petróleo Oscuro", wave: 5, isBoss: true, playable: true }
        ],
        boss: {
            icon: "Petróleo",
            name: "Petróleo Oscuro",
            description: "Un tanque masivo de petróleo crudo que mancha todo a su paso. Su resistencia es legendaria y deja un rastro tóxico.",
            health: 800,
            coins: 100
        },
        rewards: { coins: 150, stars: 3, unlockDefender: null },
        unlocked: true,
        bgColor: "linear-gradient(135deg, #1e5a46 0%, #2c7a63 50%)",
        bgImage: "river"
    },
    {
        chapter: 2,
        title: "El Lago Olvidado",
        description: "Un antiguo lago sagrado ha sido descubierto bajo la ciudad. Pero las tuberías rotas filtran contaminantes industriales. Nuevos defensores acuáticos se unen a tu causa: el Cristal de Hielo y el Aqua Cañón te ayudarán a proteger estas aguas ancestrales.",
        levels: [
            { name: "Filtraciones", wave: 6, playable: true },
            { name: "Tormenta Ácida", wave: 8, playable: true },
            { name: "Jefe: Mercurio Vivo", wave: 10, isBoss: true, playable: true }
        ],
        boss: {
            icon: "Nuclear",
            name: "Mercurio Vivo",
            description: "Metal líquido radioactivo que cambia de forma. Extremadamente tóxico y puede atravesar defensas débiles con facilidad.",
            health: 1200,
            coins: 150
        },
        rewards: { coins: 250, stars: 5, unlockDefender: "cryomancer" },
        unlocked: true,
        bgColor: "linear-gradient(135deg, #1e3a5a 0%, #2c5a7a 50%)",
        bgImage: "lake"
    },
    {
        chapter: 3,
        title: "La Bahía Contaminada",
        description: "La bahía de Manzanillo enfrenta su mayor amenaza. Plásticos y químicos amenazan la vida marina. El Guerrero Ola y el Coral Dorado se unen a tus filas para esta épica batalla por los océanos.",
        levels: [
            { name: "Marea de Plástico", wave: 11, playable: true },
            { name: "Derrame Químico", wave: 13, playable: true },
            { name: "Jefe: Leviatán Tóxico", wave: 15, isBoss: true, playable: true }
        ],
        boss: {
            icon: "El Leviatán",
            name: "El Leviatán",
            description: "Una criatura colosal nacida de la contaminación marina. Puede cambiar de carril y tiene una resistencia brutal. El jefe más peligroso hasta ahora.",
            health: 2000,
            coins: 250
        },
        rewards: { coins: 400, stars: 8, unlockDefender: "whale" },
        unlocked: false,
        bgColor: "linear-gradient(135deg, #0e4a5a 0%, #1e6a7a 50%)",
        bgImage: "bay"
    },
    {
        chapter: 4,
        title: "El Acuífero Profundo",
        description: "Las aguas subterráneas de Comala están siendo drenadas y contaminadas. En las profundidades, el legendario Titán Tsunami aguarda a un guardián digno. ¿Podrás llegar hasta él y salvar el último acuífero?",
        levels: [
            { name: "Grietas en la Tierra", wave: 16, playable: true },
            { name: "Invasión Subterránea", wave: 18, playable: true },
            { name: "Jefe Final: Rey Contaminante", wave: 20, isBoss: true, playable: true }
        ],
        boss: {
            icon: "Demonio",
            name: "Rey Contaminante",
            description: "El origen de toda la contaminación. Un demonio ancestral que corrompe todo lo que toca. Solo los defensores más poderosos pueden detenerlo.",
            health: 3000,
            coins: 500
        },
        rewards: { coins: 1000, stars: 15, unlockDefender: "tsunami-giant" },
        unlocked: false,
        bgColor: "linear-gradient(135deg, #2a1a3a 0%, #4a2a5a 50%)",
        bgImage: "underground"
    },
];

const tutorialSteps = [
    {
        icon: "target",
        title: "Objetivo del Juego",
        content: "Tu misión es proteger las fuentes de agua de Colima de los agentes contaminantes. Los enemigos avanzan por carriles hacia tu fuente de agua — ¡no dejes que lleguen!",
    },
    {
        icon: "shield-icon",
        title: "Colocar Defensores",
        content: "Toca una celda vacía en el campo de batalla para colocar un defensor. Cada defensor cuesta monedas, así que elige estratégicamente. Los defensores atacan automáticamente a los enemigos en su rango.",
    },
    {
        icon: "coin",
        title: "Economía y Recursos",
        content: "Ganas monedas al eliminar contaminantes y al pasar oleadas. Usa las monedas para comprar más defensores. El Lirio Acuático genera recursos extra pasivamente.",
    },
    {
        icon: "arrow-up",
        title: "Mejoras y Evoluciones",
        content: "Toca un defensor ya colocado para mejorarlo. Las mejoras aumentan su daño, velocidad de ataque y salud. Las mejoras permanentes se compran con runas en el menú de progresión.",
    },
    {
        icon: "wave",
        title: "Oleadas y Jefes",
        content: "Cada nivel tiene múltiples oleadas de contaminantes. La dificultad aumenta progresivamente. Al final de cada capítulo hay un jefe con habilidades especiales — ¡prepárate!",
    },
    {
        icon: "star",
        title: "Recompensas y Progresión",
        content: "Completa misiones diarias para ganar runas y monedas especiales. Inicia sesión cada día para reclamar recompensas. ¡El día 7 desbloqueas al Titán Tsunami!",
    },
];

const shopItems = [
    { id: "damage-boost", icon: "sword", name: "Impulso de Daño", type: "damage", cost: 50, description: "+10% de daño a todos los defensores" },
    { id: "health-boost", icon: "heart", name: "Salud Mejorada", type: "defense", cost: 50, description: "+15% de vida a todos los defensores" },
    { id: "range-boost", icon: "target", name: "Alcance Extendido", type: "special", cost: 75, description: "+1 casilla de alcance a defensores de rango" },
    { id: "speed-boost", icon: "lightning", name: "Ataque Veloz", type: "damage", cost: 60, description: "+20% de velocidad de ataque" },
    { id: "shield-boost", icon: "shield-icon", name: "Escudo Reforzado", type: "defense", cost: 70, description: "Los defensores absorben 10% del daño" },
    { id: "gold-multiplier", icon: "coins", name: "Multiplicador de Oro", type: "special", cost: 100, description: "+25% de monedas ganadas en batalla" },
    { id: "critical-hit", icon: "explosion", name: "Golpe Crítico", type: "damage", cost: 80, description: "15% de probabilidad de crítico (2x daño)" },
    { id: "regeneration", icon: "green-heart", name: "Regeneración", type: "defense", cost: 90, description: "Defensores regeneran 1% vida por segundo" },
];

// State
let selectedDefenders = [];
let currentShopFilter = 'all';

const basicDefenderIds = ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
const staticDefenderById = Object.fromEntries(defenders.map(d => [d.id, d]));

function inferCategory(def) {
    if (def.category) return def.category;
    if (Number(def.health || 0) >= 180) return 'tank';
    if (Number(def.damage || 0) >= 45) return 'damage';
    if (Number(def.cost || 0) <= 30) return 'low-cost';
    return 'special';
}

function getDefenderCatalog() {
    if (!window.allDefenderTypes || typeof window.allDefenderTypes !== 'object' || Object.keys(window.allDefenderTypes).length === 0) {
        return defenders;
    }

    const merged = new Map(defenders.map(d => [d.id, { ...d }]));

    Object.entries(window.allDefenderTypes).forEach(([id, data]) => {
        const base = merged.get(id) || staticDefenderById[id] || { id, emoji: id };
        merged.set(id, {
            id,
            name: data.name || base.name || id,
            emoji: base.emoji || id,
            category: base.category || inferCategory(data),
            cost: Number(data.cost ?? base.cost ?? 50),
            damage: Number(data.damage ?? base.damage ?? 20),
            health: Number(data.health ?? base.health ?? 80),
            range: Number(data.range ?? base.range ?? 4),
            description: data.info || data.description || base.description || 'Defensor especializado para proteger el agua.'
        });
    });

    return Array.from(merged.values());
}

function showGamePageDialog(title, message, type = 'info') {
    let overlay = document.getElementById('gamePageDialogOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gamePageDialogOverlay';
        overlay.className = 'game-page-dialog-overlay';
        overlay.innerHTML = `
            <div class="game-page-dialog" role="dialog" aria-modal="true" aria-labelledby="gamePageDialogTitle">
                <h3 id="gamePageDialogTitle" class="game-page-dialog-title"></h3>
                <div id="gamePageDialogMessage" class="game-page-dialog-message"></div>
                <div class="game-page-dialog-actions">
                    <button id="gamePageDialogOk" class="game-page-dialog-btn">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#gamePageDialogOk').addEventListener('click', () => {
            overlay.classList.remove('active');
        });
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    }

    const titleEl = document.getElementById('gamePageDialogTitle');
    const messageEl = document.getElementById('gamePageDialogMessage');
    const dialogEl = overlay.querySelector('.game-page-dialog');

    titleEl.textContent = title;
    messageEl.innerHTML = message;
    dialogEl.classList.remove('type-success', 'type-error', 'type-info');
    dialogEl.classList.add(`type-${type}`);
    overlay.classList.add('active');
}

function getStoredUser() {
    const candidateKeys = ['wacheck_user', 'currentUser'];

    for (const key of candidateKeys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        try {
            const user = JSON.parse(raw);
            if (user && typeof user === 'object') {
                return user;
            }
        } catch (error) {
            console.warn(` Invalid user JSON in ${key}:`, error);
        }
    }

    return null;
}

function saveStoredUser(user) {
    if (!user || typeof user !== 'object') return;

    localStorage.setItem('wacheck_user', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Definición mínima de logros si achievements.js no está cargado
if (typeof ACHIEVEMENTS === 'undefined') {
    window.ACHIEVEMENTS = {
        first_game: {
            id: 'first_game',
            name: 'Primera Partida',
            description: 'Juega tu primera partida',
            icon: '',
            points: 10,
            category: 'inicio'
        },
        wave_5: {
            id: 'wave_5',
            name: 'Superviviente',
            description: 'Alcanza la oleada 5',
            icon: '',
            points: 20,
            requirement: 5,
            category: 'oleadas'
        },
        wave_10: {
            id: 'wave_10',
            name: 'Veterano',
            description: 'Alcanza la oleada 10',
            icon: 'tornado',
            points: 50,
            requirement: 10,
            category: 'oleadas'
        },
        kills_50: {
            id: 'kills_50',
            name: 'Exterminador',
            description: 'Elimina 50 contaminadores',
            icon: '',
            points: 30,
            requirement: 50,
            category: 'eliminaciones'
        }
    };
}

// ==========================================
// Tab Navigation
// ==========================================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({}, '', url);
    });
});

// Check URL for initial tab
const urlParams = new URLSearchParams(window.location.search);
const initialTab = urlParams.get('tab');
if (initialTab && ['jugar', 'historia', 'tutorial', 'tienda', 'mejoras', 'logros'].includes(initialTab)) {
    const targetButton = document.querySelector(`[data-tab="${initialTab}"]`);
    if (targetButton) {
        targetButton.click();
    }
}

// ==========================================
// Render Defenders
// ==========================================
function renderDefenders() {
    const grid = document.getElementById('defendersGrid');
    grid.innerHTML = '';
    const catalog = getDefenderCatalog();
    
    // Defensores básicos SIEMPRE disponibles
    const basicDefenders = basicDefenderIds;
    
    // Obtener defensores adicionales desbloqueados del usuario
    let unlockedDefenders = [...basicDefenders]; // Siempre incluir los básicos
    try {
        const user = getStoredUser();
        if (user) {
            const userUnlocked = user.unlockedDefenders || [];
            unlockedDefenders = [...new Set([...basicDefenders, ...userUnlocked])];
            console.log(' Defensores disponibles:', unlockedDefenders);
        }
    } catch (error) {
        console.error('Error loading unlocked defenders:', error);
    }
    
    // Filtrar solo defensores disponibles
    const availableDefenders = catalog.filter(d => unlockedDefenders.includes(d.id));
    
    if (availableDefenders.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999; font-size: 18px;">No tienes defensores desbloqueados. ¡Visita la tienda para desbloquear algunos! </div>';
        return;
    }
    
    availableDefenders.forEach(defender => {
        const isSelected = selectedDefenders.includes(defender.id);
        
        const card = document.createElement('div');
        card.className = `defender-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => toggleDefender(defender.id);
        
        const defDataGP = window.allDefenderTypes && window.allDefenderTypes[defender.id];
        const defImage = (defDataGP && defDataGP.image) || `./models/allDefenderTypes/${defender.id}/${defender.id}.png`;
        const gpIconHTML = window.GameSprites
            ? window.GameSprites.defender(defender.id)
            : `<img src="${defImage}" alt="${defender.name}" loading="lazy" style="width:40px;height:40px;object-fit:contain;background:#1e293b;border-radius:6px;" onerror="this.outerHTML='';">`;
        card.innerHTML = `
            <div class="defender-header">
                <div class="defender-icon">${gpIconHTML}</div>
                <div class="defender-info">
                    <div class="defender-name">${defender.name}</div>
                    <span class="defender-category category-${defender.category}">
                        ${getCategoryName(defender.category)}
                    </span>
                </div>
                <div class="defender-cost">${defender.cost}</div>
            </div>
            <p class="defender-description">${defender.description}</p>
            <div class="defender-stats">
                <div class="stat-row">
                    <span class="stat-label">Daño</span>
                    <span class="stat-value">${defender.damage}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Vida</span>
                    <span class="stat-value">${defender.health}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Alcance</span>
                    <span class="stat-value">${defender.range}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Categoría</span>
                    <span class="stat-value">${getCategoryEmoji(defender.category)}</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function getCategoryName(category) {
    const names = {
        'low-cost': 'Bajo Costo',
        'damage': 'Daño',
        'tank': 'Tanque',
        'special': 'Especial'
    };
    return names[category] || category;
}

function getCategoryEmoji(category) {
    const emojis = {
        'low-cost': '',
        'damage': '',
        'tank': '',
        'special': ''
    };
    return emojis[category] || '';
}

function toggleDefender(id) {
    if (selectedDefenders.includes(id)) {
        selectedDefenders = selectedDefenders.filter(d => d !== id);
    } else {
        if (selectedDefenders.length < 8) {
            selectedDefenders.push(id);
        }
    }
    
    saveSelectedDefenders(); // persistir selección inmediatamente
    updateSelectedSlots();
    renderDefenders();
}

function updateSelectedSlots() {
    const slots = document.querySelectorAll('.defender-slot');
    const countElement = document.getElementById('selected-count');
    const startButton = document.getElementById('startGameButton');
    const catalog = getDefenderCatalog();
    
    countElement.textContent = selectedDefenders.length;
    
    // Habilitar/deshabilitar botón de inicio
    if (startButton) {
        if (selectedDefenders.length > 0) {
            startButton.disabled = false;
            startButton.style.opacity = '1';
            startButton.style.cursor = 'pointer';
        } else {
            startButton.disabled = true;
            startButton.style.opacity = '0.5';
            startButton.style.cursor = 'not-allowed';
        }
    }
    
    slots.forEach((slot, index) => {
        // Limpiar eventos previos
        slot.onclick = null;
        slot.style.cursor = 'default';
        
        if (selectedDefenders[index]) {
            const defender = catalog.find(d => d.id === selectedDefenders[index]);
            if (!defender) {
                slot.textContent = '?';
                slot.classList.add('empty');
                slot.classList.remove('filled');
                slot.title = 'Slot vacío';
                return;
            }
            const defDataSlot = window.allDefenderTypes && window.allDefenderTypes[defender.id];
            const slotImage = (defDataSlot && defDataSlot.image) || `./models/allDefenderTypes/${defender.id}/${defender.id}.png`;
            const slotIconHTML = window.GameSprites
                ? window.GameSprites.defender(defender.id)
                : `<img src="${slotImage}" alt="${defender.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='';">`;
            slot.innerHTML = slotIconHTML;
            slot.classList.remove('empty');
            slot.classList.add('filled');
            
            // Hacer clickeable para quitar
            slot.style.cursor = 'pointer';
            slot.onclick = () => removeDefenderByIndex(index);
            slot.title = `Clic para quitar ${defender.name}`;
        } else {
            slot.textContent = '?';
            slot.classList.add('empty');
            slot.classList.remove('filled');
            slot.title = 'Slot vacío';
        }
    });
}

// Función para quitar defensor por índice del slot
function removeDefenderByIndex(index) {
    if (index >= 0 && index < selectedDefenders.length) {
        selectedDefenders.splice(index, 1);
        saveSelectedDefenders();
        updateSelectedSlots();
        renderDefenders();
    }
}

// ==========================================
// Render Story Chapters
// ==========================================
function renderStoryChapters() {
    const container = document.getElementById('storyChapters');
    if (!container) {
        console.warn('[GamePage] storyChapters container not found; skipping dynamic story render');
        return;
    }
    container.innerHTML = '';
    
    storyChapters.forEach(chapter => {
        const card = document.createElement('div');
        card.className = `story-chapter ${chapter.unlocked ? '' : 'locked'}`;
        card.style.background = chapter.bgColor;
        
        const levelsHTML = chapter.levels.map(level => {
            const clickable = chapter.unlocked && level.playable;
            const bossClass = level.isBoss ? 'boss-level' : '';
            return `
                <div class="level-badge ${bossClass} ${clickable ? 'level-clickable' : ''}" 
                     ${clickable ? `onclick="playStoryLevel(${chapter.chapter}, ${level.wave}, ${level.isBoss})"` : ''}>
                    ${level.isBoss ? ' ' : ''}${level.name}
                </div>
            `;
        }).join('');
        
        card.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-number">${chapter.chapter}</span>
                <span class="chapter-badge ${chapter.unlocked ? 'badge-unlocked' : 'badge-locked'}">
                    ${chapter.unlocked ? ' Desbloqueado' : ' Bloqueado'}
                </span>
            </div>
            <h3 class="chapter-title">${chapter.title}</h3>
            <p class="chapter-description">${chapter.description}</p>
            
            ${chapter.boss ? `
                <div class="boss-info">
                    <div class="boss-header">
                        <span class="boss-icon">${window.GameSprites ? window.GameSprites.contaminant(chapter.boss.icon) : (() => { const ct = window.allContaminatorTypes && window.allContaminatorTypes.find(c => c.icon === chapter.boss.icon); const bossImg = (ct && ct.image) || './models/allContaminatorTypes/' + chapter.boss.icon + '/' + chapter.boss.icon + '.png'; return `<img src="${bossImg}" alt="${chapter.boss.name}" style="width:40px;height:40px;object-fit:contain;" onerror="this.outerHTML='';">`; })()}</span>
                        <div>
                            <div class="boss-name">${chapter.boss.name}</div>
                            <div class="boss-stats">
                                <span> ${chapter.boss.health}</span>
                                <span> ${chapter.boss.coins}</span>
                            </div>
                        </div>
                    </div>
                    <p class="boss-description">${chapter.boss.description}</p>
                </div>
            ` : ''}
            
            <div class="chapter-levels">
                ${levelsHTML}
            </div>
            
            ${chapter.rewards ? `
                <div class="chapter-rewards">
                    <div class="rewards-title"> Recompensas al completar:</div>
                    <div class="rewards-list">
                        <span> ${chapter.rewards.coins} monedas</span>
                        <span> ${chapter.rewards.stars} estrellas</span>
                        ${chapter.rewards.unlockDefender ? `<span> Desbloquea defensor</span>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
}

function playStoryLevel(chapterNum, wave, isBoss) {
    const chapter = storyChapters.find(c => c.chapter === chapterNum);
    
    // Guardar información de la misión en localStorage
    localStorage.setItem('wacheck-story-mode', JSON.stringify({
        chapter: chapterNum,
        wave: wave,
        isBoss: isBoss,
        timestamp: Date.now(),
        chapterTitle: chapter?.title,
        boss: chapter?.boss
    }));
    
    // Guardar que debe auto-iniciar el juego
    localStorage.setItem('wacheck-auto-start', 'true');
    
    // Redirigir directamente al juego
    window.location.href = `index.html#auto-start-wave-${wave}`;
}

// ==========================================
// Render Tutorial Steps
// ==========================================
function renderTutorialSteps() {
    const container = document.getElementById('tutorialSteps');
    container.innerHTML = '';
    
    tutorialSteps.forEach(step => {
        const card = document.createElement('div');
        card.className = 'tutorial-card';
        
        card.innerHTML = `
            <div class="tutorial-icon">${window.GameSprites ? window.GameSprites.ui(step.icon) : ''}</div>
            <h3 class="tutorial-title">${step.title}</h3>
            <p class="tutorial-content">${step.content}</p>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// Shop System
// ==========================================
function renderShopItems(filter = 'all') {
    const container = document.getElementById('shopItems');
    if (!container) {
        console.error(' shopItems container not found');
        return;
    }
    
    console.log(' Rendering shop with filter:', filter);
    container.innerHTML = '';
    
    const basicDefenders = basicDefenderIds;
    const catalog = getDefenderCatalog();
    
    // Obtener defensores desbloqueados del usuario
    let unlockedDefenders = [...basicDefenders];
    let userCoins = 0;
    try {
        const user = getStoredUser();
        if (user) {
            const userUnlocked = user.unlockedDefenders || [];
            unlockedDefenders = [...new Set([...basicDefenders, ...userUnlocked])];
            userCoins = user.coins || 0;
            console.log(' User unlocked defenders:', unlockedDefenders);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
    
    const filteredItems = filter === 'all'
        ? catalog
        : catalog.filter(defender => defender.category === filter);
    
    if (filteredItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-muted-foreground);">No hay defensores en esta categoría</p>';
        return;
    }
    
    filteredItems.forEach(defender => {
        const isUnlocked = unlockedDefenders.includes(defender.id);
        const canAfford = userCoins >= defender.cost;
        
        const card = document.createElement('div');
        card.className = `shop-item ${isUnlocked ? 'unlocked' : ''}`;
        
        const defDataShop = window.allDefenderTypes && window.allDefenderTypes[defender.id];
        const shopImage = (defDataShop && defDataShop.image) || `./models/allDefenderTypes/${defender.id}/${defender.id}.png`;
        const shopIconImg = window.GameSprites
            ? window.GameSprites.defender(defender.id)
            : `<img src="${shopImage}" alt="${defender.name}" loading="lazy" style="width:64px;height:64px;object-fit:contain;background:#1e293b;border-radius:8px;" onerror="this.outerHTML='';">`;
        card.innerHTML = `
            <div class="shop-item-header">
                <div class="defender-icon" style="width: 64px; height: 64px; margin: 0;">${shopIconImg}</div>
                <span class="shop-item-cost">${isUnlocked ? 'Desbloqueado' : `${defender.cost}`}</span>
            </div>
            <h3 class="shop-item-title">${defender.name}</h3>
            <span class="defender-category category-${defender.category}" style="margin-bottom: 0.75rem; display: inline-block;">
                ${getCategoryName(defender.category)}
            </span>
            <p class="shop-item-description">${defender.description}</p>
            
            <div class="shop-defender-stats">
                <div class="shop-stat">
                    <span class="shop-stat-label">Daño</span>
                    <span class="shop-stat-value">${defender.damage}</span>
                </div>
                <div class="shop-stat">
                    <span class="shop-stat-label">Vida</span>
                    <span class="shop-stat-value">${defender.health}</span>
                </div>
                <div class="shop-stat">
                    <span class="shop-stat-label">Alcance</span>
                    <span class="shop-stat-value">${defender.range}</span>
                </div>
            </div>
            
            <button class="shop-buy-button ${isUnlocked ? 'disabled' : ''} ${!canAfford && !isUnlocked ? 'insufficient' : ''}" 
                    onclick="buyShopItem('${defender.id}')" 
                    ${isUnlocked ? 'disabled' : ''}>
                ${isUnlocked ? 'Ya Desbloqueado' : (canAfford ? 'Comprar Defensor' : 'Insuficiente')}
            </button>
        `;
        
        container.appendChild(card);
    });
}

function buyShopItem(defenderId) {
    const defender = getDefenderCatalog().find(d => d.id === defenderId);
    if (!defender) return;

    const currentCoins = parseInt(document.getElementById('coins').textContent) || 0;
    
    if (currentCoins >= defender.cost) {
        const newCoins = currentCoins - defender.cost;
        document.getElementById('coins').textContent = newCoins;
        saveGameCoins(newCoins);

        const user = getStoredUser() || {};
        const unlocked = Array.isArray(user.unlockedDefenders) ? user.unlockedDefenders : [];
        if (!unlocked.includes(defender.id)) {
            unlocked.push(defender.id);
            user.unlockedDefenders = unlocked;
            user.coins = newCoins;
            saveStoredUser(user);
        }

        renderShopItems(currentShopFilter);
        renderDefenders();

        showGamePageDialog(
            ` ${defender.name} desbloqueado`,
            `${defender.description}<br><br> Daño: <strong>${defender.damage}</strong><br> Vida: <strong>${defender.health}</strong><br> Alcance: <strong>${defender.range}</strong>`,
            'success'
        );
    } else {
        showGamePageDialog(
            ' No tienes suficientes monedas',
            `Necesitas:  <strong>${defender.cost}</strong><br>Tienes:  <strong>${currentCoins}</strong>`,
            'error'
        );
    }
}

// Shop Filters
const shopFilters = document.querySelectorAll('.shop-filter-btn');
shopFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        shopFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        const filterType = filter.dataset.filter;
        currentShopFilter = filterType;
        renderShopItems(filterType);
    });
});

// ==========================================
// Load Real Game Stats
// ==========================================
function loadGameStats() {
    // Intentar cargar desde localStorage (datos del juego principal)
    try {
        const user = getStoredUser();
        if (user) {
            if (user.coins !== undefined) {
                document.getElementById('coins').textContent = user.coins;
            }

            if (user.stars !== undefined) {
                document.getElementById('stars').textContent = user.stars || 0;
            }

            const userRunes = user.rewardsData?.runes ?? user.runes;
            if (userRunes !== undefined) {
                document.getElementById('runes').textContent = userRunes || 0;
            }

            // console.log(' Game stats loaded:', user);
        }
    } catch (error) {
        console.error('Error loading game stats:', error);
    }
}

// Guardar monedas actualizadas
function saveGameCoins(newCoins) {
    try {
        const user = getStoredUser();
        if (user) {
            user.coins = newCoins;
            saveStoredUser(user);
        }
    } catch (error) {
        console.error('Error saving coins:', error);
    }
}

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // loadSelectedDefenders() ya hace la validación y limpieza
    loadSelectedDefenders();
    
    renderDefenders();
    renderStoryChapters();
    renderTutorialSteps();
    renderShopItems();
    renderUpgrades();
    renderAchievements();
    updateSelectedSlots();
    loadGameStats();
    
    // Recargar stats cada 10 segundos (evita spam de consola)
    setInterval(loadGameStats, 10000);

    window.addEventListener('wacheckDefendersReady', () => {
        renderDefenders();
        renderShopItems(currentShopFilter);
        updateSelectedSlots();
    });

    window.addEventListener('wacheckContaminantsReady', () => {
        renderStoryChapters();
    });
    
    console.log(' Game page initialized');
});

// ==========================================
// Save/Load Selected Defenders
// ==========================================
function saveSelectedDefenders() {
    localStorage.setItem('wacheck-selected-defenders', JSON.stringify(selectedDefenders));
}

function loadSelectedDefenders() {
    const saved = localStorage.getItem('wacheck-selected-defenders');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            const catalogIds = new Set(getDefenderCatalog().map(d => d.id));
            // Solo cargar defensores que existen actualmente
            selectedDefenders = parsed.filter(id => catalogIds.has(id));
            
            // Si hay diferencia, actualizar localStorage
            if (selectedDefenders.length !== parsed.length) {
                console.log(' Limpiando defensores inválidos:', parsed.filter(id => !catalogIds.has(id)));
                if (selectedDefenders.length === 0) {
                    localStorage.removeItem('wacheck-selected-defenders');
                } else {
                    localStorage.setItem('wacheck-selected-defenders', JSON.stringify(selectedDefenders));
                }
            }
            
            updateSelectedSlots();
            renderDefenders();
        } catch (error) {
            console.error('Error loading defenders:', error);
            selectedDefenders = [];
            localStorage.removeItem('wacheck-selected-defenders');
        }
    }
}

// (auto-save now built directly into toggleDefender above)

// ==========================================
// Start Game from Page
// ==========================================
function startGameFromPage() {
    if (selectedDefenders.length === 0) {
        showGamePageDialog(' Selección requerida', 'Selecciona al menos 1 defensor para comenzar.', 'info');
        return;
    }
    
    // Guardar defensores seleccionados
    saveSelectedDefenders();
    
    // Marcar que venimos de game-page.html
    localStorage.setItem('wacheck-play-from-game-page', 'true');
    
    // Redirigir a game.php
    console.log(' Iniciando juego con defensores:', selectedDefenders);
    window.location.href = 'game.php';
}

// Hacer función global
window.startGameFromPage = startGameFromPage;

// ==========================================
// Upgrades System
// ==========================================
const UPGRADE_COSTS = {
    coinMultiplier: (level) => 50 + (level * 25),
    healthBoost: (level) => 40 + (level * 20),
    defenderDamage: (level) => 60 + (level * 30),
    startingCoins: (level) => 45 + (level * 22),
    criticalChance: (level) => 70 + (level * 35)
};

const UPGRADE_MAX_LEVELS = {
    coinMultiplier: 10,
    healthBoost: 20,
    defenderDamage: 15,
    startingCoins: 10,
    criticalChance: 5
};

const UPGRADE_INFO = {
    coinMultiplier: {
        name: 'Multiplicador de Monedas',
        icon: 'generator',
        description: 'Gana +10% más monedas por eliminación'
    },
    healthBoost: {
        name: 'Salud Adicional',
        icon: '',
        description: 'Empieza cada partida con +5 HP'
    },
    defenderDamage: {
        name: 'Daño de Defensores',
        icon: '',
        description: 'Todos los defensores hacen +5% más daño'
    },
    startingCoins: {
        name: 'Monedas Iniciales',
        icon: '',
        description: 'Comienza cada partida con +25 monedas'
    },
    criticalChance: {
        name: 'Probabilidad Crítica',
        icon: '',
        description: '+3% de probabilidad de golpe crítico (2x daño)'
    }
};

function renderUpgrades() {
    const grid = document.getElementById('upgradesContainer') || document.getElementById('upgradesGrid');
    if (!grid) {
        console.error(' upgrades container not found');
        return;
    }
    
    console.log(' Rendering upgrades...');
    grid.innerHTML = '';
    
    let userRunes = 0;
    let upgrades = {};
    
    try {
        const user = getStoredUser();
        if (user) {
            userRunes = user.rewardsData?.runes ?? user.runes ?? 0;

            if (user.rewardsData && user.rewardsData.upgrades) {
                upgrades = user.rewardsData.upgrades;
            }
            console.log(' User runes:', userRunes, 'Upgrades:', upgrades);
        }
    } catch (error) {
        console.error('Error loading upgrades:', error);
    }
    
    Object.keys(UPGRADE_INFO).forEach(upgradeId => {
        const info = UPGRADE_INFO[upgradeId];
        const currentLevel = upgrades[upgradeId] || 0;
        const maxLevel = UPGRADE_MAX_LEVELS[upgradeId];
        const cost = UPGRADE_COSTS[upgradeId](currentLevel);
        const canAfford = userRunes >= cost;
        const isMaxed = currentLevel >= maxLevel;
        
        const card = document.createElement('div');
        card.className = `upgrade-card ${isMaxed ? 'maxed' : ''}`;
        
        card.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-icon">${window.GameSprites ? window.GameSprites.ui(info.icon) : ''}</div>
                <div class="upgrade-level">Nivel ${currentLevel}/${maxLevel}</div>
            </div>
            <h3 class="upgrade-title">${info.name}</h3>
            <p class="upgrade-description">${info.description}</p>
            <div class="upgrade-progress">
                <div class="upgrade-progress-bar" style="width: ${(currentLevel / maxLevel) * 100}%"></div>
            </div>
            <button class="upgrade-buy-button ${isMaxed ? 'disabled' : ''} ${!canAfford && !isMaxed ? 'insufficient' : ''}" 
                    onclick="buyUpgrade('${upgradeId}')"
                    ${isMaxed ? 'disabled' : ''}>
                ${isMaxed ? ' Nivel Máximo' : (canAfford ? `Mejorar ( ${cost})` : ` Insuficiente ( ${cost})`)}
            </button>
        `;
        
        grid.appendChild(card);
    });
}

function buyUpgrade(upgradeId) {
    console.log(' Intentando comprar mejora:', upgradeId);
    showGamePageDialog(
        ' Mejora disponible en partida',
        'Las mejoras se compran en el menú de Mejoras del juego principal (boton de mejora en el menu flotante).',
        'info'
    );
}

// ==========================================
// Achievements System
// ==========================================
function renderAchievements(filter = 'all') {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) {
        console.error(' achievementsGrid container not found');
        return;
    }
    
    console.log(' Rendering achievements with filter:', filter);
    grid.innerHTML = '';
    
    let unlockedAchievements = [];
    let achievementProgress = {};
    
    try {
        const user = getStoredUser();
        if (user && user.achievementsData) {
            unlockedAchievements = user.achievementsData.unlockedAchievements || [];
            achievementProgress = user.achievementsData.progress || {};
            console.log(' Unlocked achievements:', unlockedAchievements);
        }
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
    
    // Cargar logros desde ACHIEVEMENTS
    if (typeof ACHIEVEMENTS === 'undefined') {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No se pudieron cargar los logros</p>';
        console.error(' ACHIEVEMENTS no está definido');
        return;
    }
    
    console.log(' ACHIEVEMENTS loaded:', Object.keys(ACHIEVEMENTS).length, 'achievements');
    
    const achievementsList = Object.values(ACHIEVEMENTS);
    const normalizedFilter = filter === 'eliminaciones' ? 'combate' : filter;
    const filtered = normalizedFilter === 'all'
        ? achievementsList
        : achievementsList.filter(a => a.category === normalizedFilter);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--color-muted-foreground);">No hay logros en esta categoría</p>';
        return;
    }
    
    filtered.forEach(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const progress = achievementProgress[achievement.id] || 0;
        const progressPercent = achievement.requirement ? (progress / achievement.requirement) * 100 : 0;
        
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
        
        card.innerHTML = `
            <div class="achievement-icon ${isUnlocked ? '' : 'locked'}">${isUnlocked ? (window.GameSprites ? window.GameSprites.ui(achievement.icon || 'trophy') : '') : (window.GameSprites ? window.GameSprites.ui('lock') : '')}</div>
            <div class="achievement-info">
                <h3 class="achievement-title">${achievement.name}</h3>
                <p class="achievement-description">${achievement.description}</p>
                ${achievement.requirement ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                        <span class="achievement-progress-text">${progress}/${achievement.requirement}</span>
                    </div>
                ` : ''}
            </div>
            <div class="achievement-points ${isUnlocked ? 'earned' : ''}">
                ${isUnlocked ? '' : ''} ${achievement.points} pts
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Filtros de logros
document.addEventListener('DOMContentLoaded', () => {
    const achievementFilters = document.querySelectorAll('.achievement-filter-btn');
    achievementFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            achievementFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAchievements(btn.dataset.filter);
        });
    });
});
