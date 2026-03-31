// ==========================================
// Wacheck Landing Page - Interactive JavaScript
// ==========================================

// ==========================================
// Session Check for Play Buttons
// ==========================================
function handlePlayButton() {
    // Verificar si hay sesión activa
    const userDataStr = localStorage.getItem('wacheck_user');
    
    if (userDataStr) {
        try {
            const userData = JSON.parse(userDataStr);
            if (userData && userData.id !== undefined) {
                // Hay sesión activa, ir directamente al juego
                console.log('[Landing] Sesion activa detectada, redirigiendo al juego...');
                window.location.href = 'game-page.html';
                return;
            }
        } catch (e) {
            console.error('Error al verificar sesión:', e);
        }
    }
    
    // No hay sesión, abrir modal de login
    console.log('[Landing] No hay sesion activa, abriendo modal...');
    openLoginModal();
}

// Exportar al scope global
window.handlePlayButton = handlePlayButton;


// ==========================================
// Navbar Scroll Effect
// ==========================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// Mobile Menu Toggle
// ==========================================
const navHamburger = document.getElementById('navHamburger');
const navMobile = document.getElementById('navMobile');
const hamburgerIcon = document.getElementById('hamburgerIcon');

navHamburger.addEventListener('click', () => {
    navMobile.classList.toggle('active');
    
    // Change hamburger icon to X
    if (navMobile.classList.contains('active')) {
        hamburgerIcon.setAttribute('d', 'M18 6L6 18M6 6l12 12');
    } else {
        hamburgerIcon.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
    }
});

// Close mobile menu when clicking on a link
const mobileLinks = document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta');
mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Cerrar el menú móvil
        navMobile.classList.remove('active');
        hamburgerIcon.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
        
        // Si es un enlace a rewards, no hacer nada más (dejar que el hash funcione)
        const href = link.getAttribute('href');
        if (href && (href.toLowerCase() === '#rewards' || href.toLowerCase() === '#recompensas')) {
            // No hacer nada, dejar que el hashchange lo maneje
            console.log('[Landing] Enlace de recompensas detectado, hash sera:', href);
        }
    });
});

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Hashtags especiales que NO deben usar smooth scroll (son para modales)
        const specialHashes = ['#rewards', '#recompensas'];
        const isSpecialHash = specialHashes.includes(href.toLowerCase());
        
        // Only prevent default if it's not just "#" and not a special hash
        if (href !== '#' && href !== '#inicio' && !isSpecialHash) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==========================================
// Intersection Observer for Fade-in Animations
// ==========================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in classes
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
});

// ==========================================
// Water Calculator
// ==========================================
const COST_PER_LITRE = 0.0158; // CIAPACOV 2025 tariff

const activities = [
    {
        id: 'shower',
        icon: 'droplets',
        name: 'Ducha',
        question: '¿Cuántas veces te duchas al día?',
        litresPerUse: 80,
        timesPerDay: 1,
        unit: 'veces/día',
        source: 'Una ducha de ~8 min gasta aprox. 80 litros (OMS)',
        hasToggle: false
    },
    {
        id: 'toilet',
        icon: 'droplet',
        name: 'Ir al baño (WC)',
        question: '¿Cuántas veces jalas la cadena del WC al día?',
        litresPerUse: 6,
        timesPerDay: 5,
        unit: 'veces/día',
        source: 'Cada descarga usa aprox. 6 litros (CONAGUA)',
        hasToggle: false
    },
    {
        id: 'teeth',
        icon: 'sparkles',
        name: 'Cepillado de dientes',
        question: '¿Cuántas veces te cepillas los dientes al día?',
        litresPerUse: 1,
        timesPerDay: 3,
        unit: 'veces/día',
        source: 'Con la llave cerrada ~1L; abierta ~12L (CONAGUA)',
        hasToggle: true,
        toggleLabel: '¿Dejas la llave abierta?',
        toggleMultiplier: 12,
        toggleActive: false
    },
    {
        id: 'dishes',
        icon: 'utensils',
        name: 'Lavar platos',
        question: '¿Cuántas veces lavas los platos al día?',
        litresPerUse: 20,
        timesPerDay: 2,
        unit: 'veces/día',
        source: 'A mano con llave abierta ~20L por lavada (SEMARNAT)',
        hasToggle: false
    },
    {
        id: 'laundry',
        icon: 'shirt',
        name: 'Lavadora',
        question: '¿Cuántas cargas de lavadora pones por semana?',
        litresPerUse: 50,
        timesPerDay: 3,
        unit: 'cargas/semana',
        source: 'Una carga promedio usa ~50 litros (PROFECO)',
        hasToggle: false
    }
];

function renderCalculatorActivities() {
    const container = document.getElementById('calculatorActivities');
    if (!container) return;
    
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        const litres = getLitresForActivity(activity);
        
        card.innerHTML = `
            <div class="activity-main">
                <span class="activity-icon"><i data-lucide="${activity.icon}"></i></span>
                <div class="activity-info">
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-question">${activity.question}</div>
                </div>
                <div class="activity-controls">
                    <button class="activity-btn" onclick="updateActivityTimes('${activity.id}', -1)">−</button>
                    <span class="activity-value" id="${activity.id}-value">${activity.timesPerDay}</span>
                    <button class="activity-btn" onclick="updateActivityTimes('${activity.id}', 1)">+</button>
                    <span class="activity-unit">${activity.unit}</span>
                </div>
                <div class="activity-result">
                    <div class="activity-result-value" id="${activity.id}-litres">${Math.round(litres)}L</div>
                    <div class="activity-result-label">por día</div>
                </div>
            </div>
            ${activity.hasToggle ? `
                <div class="activity-toggle">
                    <div class="toggle-switch ${activity.toggleActive ? 'active' : ''}" id="${activity.id}-toggle" onclick="toggleActivity('${activity.id}')">
                        <div class="toggle-knob"></div>
                    </div>
                    <span class="toggle-label">${activity.toggleLabel}</span>
                    ${activity.toggleActive ? '<span class="toggle-warning">¡Gastas 12x más!</span>' : ''}
                </div>
            ` : ''}
            <div class="activity-source"><i data-lucide="bar-chart-2" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>${activity.source}</div>
        `;
        
        container.appendChild(card);
    });
    
    updateCalculatorResults();
    if (window.lucide) lucide.createIcons();
}

function updateActivityTimes(activityId, change) {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    
    activity.timesPerDay = Math.max(0, activity.timesPerDay + change);
    
    // Update UI
    const valueElement = document.getElementById(`${activityId}-value`);
    if (valueElement) {
        valueElement.textContent = activity.timesPerDay;
    }
    
    const litres = getLitresForActivity(activity);
    const litresElement = document.getElementById(`${activityId}-litres`);
    if (litresElement) {
        litresElement.textContent = Math.round(litres) + 'L';
    }
    
    updateCalculatorResults();
}

function toggleActivity(activityId) {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || !activity.hasToggle) return;
    
    activity.toggleActive = !activity.toggleActive;
    
    // Re-render to update UI
    renderCalculatorActivities();
}

function getLitresForActivity(activity) {
    const multiplier = activity.hasToggle && activity.toggleActive ? activity.toggleMultiplier : 1;
    const effectiveLitres = activity.hasToggle ? multiplier : activity.litresPerUse;
    const isWeekly = activity.unit.includes('semana');
    const dailyUses = isWeekly ? activity.timesPerDay / 7 : activity.timesPerDay;
    return effectiveLitres * dailyUses;
}

function updateCalculatorResults() {
    // Calculate totals
    const totalDaily = activities.reduce((sum, a) => sum + getLitresForActivity(a), 0);
    const totalMonthly = totalDaily * 30;
    const costMonthly = totalMonthly * COST_PER_LITRE;
    
    // Update daily
    const dailyElement = document.getElementById('totalDaily');
    if (dailyElement) {
        animateNumber(dailyElement, parseFloat(dailyElement.textContent) || 0, totalDaily, 500);
    }
    
    // Update monthly
    const monthlyElement = document.getElementById('totalMonthly');
    if (monthlyElement) {
        animateNumber(monthlyElement, parseFloat(monthlyElement.textContent) || 0, totalMonthly, 500);
    }
    
    // Update cost
    const costElement = document.getElementById('costMonthly');
    if (costElement) {
        animateNumber(costElement, parseFloat(costElement.textContent.replace('$', '')) || 0, costMonthly, 500, true);
    }
    
    // Update level
    updateConsumptionLevel(totalDaily);
}

function updateConsumptionLevel(totalDaily) {
    const levelBadge = document.getElementById('levelBadge');
    const levelMessage = document.getElementById('levelMessage');
    
    if (!levelBadge || !levelMessage) return;
    
    let level, message, className;
    
    if (totalDaily < 100) {
        level = ' Excelente';
        message = '¡Felicidades! Tu consumo es muy eficiente. Sigue así y motiva a otros a cuidar el agua.';
        className = 'level-excellent';
    } else if (totalDaily < 200) {
        level = ' Bien';
        message = 'Tu consumo está dentro del promedio. Pequeños cambios como cerrar la llave al cepillarte pueden hacer la diferencia.';
        className = 'level-good';
    } else if (totalDaily < 350) {
        level = ' Regular';
        message = 'Tu consumo es alto. Intenta reducir el tiempo de ducha y cierra la llave mientras te enjabonas.';
        className = 'level-regular';
    } else {
        level = ' Alto consumo';
        message = '¡Alerta! Estás gastando mucha agua. Revisa cada hábito: duchas más cortas, reparar fugas y usar la lavadora con carga completa puede ahorrar miles de litros al mes.';
        className = 'level-high';
    }
    
    levelBadge.textContent = level;
    levelBadge.className = `level-badge ${className}`;
    levelMessage.textContent = message;
}

function calculateWater() {
    updateCalculatorResults();
}

// ==========================================
// Animate Number Function
// ==========================================
function animateNumber(element, start, end, duration, isCurrency = false) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        if (isCurrency) {
            element.textContent = '$' + Math.round(current);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// ==========================================
// Parallax Effect for Hero Section
// ==========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ==========================================
// Add dynamic water drops effect
// ==========================================
function createWaterDrop() {
    const waterElements = document.querySelector('.hero-water-elements');
    if (!waterElements) return;
    
    const drop = document.createElement('span');
    drop.textContent = '';
    drop.className = 'water-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDuration = (8 + Math.random() * 4) + 's';
    drop.style.animationDelay = '0s';
    drop.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
    
    waterElements.appendChild(drop);
    
    // Remove drop after animation
    setTimeout(() => {
        drop.remove();
    }, 12000);
}

// Add drops periodically
setInterval(createWaterDrop, 3000);

// ==========================================
// Feature Cards Hover Effect
// ==========================================
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==========================================
// Prevent Calculator Default on Enter
// ==========================================
const calculatorInputs = document.querySelectorAll('.calculator-input');
calculatorInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateWater();
        }
    });
});

// ==========================================
// Loading Animation on Page Load
// ==========================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease-out';
    }
});

// ==========================================
// Navbar Active Link Highlight
// ==========================================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');
    
    let current = '';
    const scrollPosition = window.pageYOffset + navbar.offsetHeight + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);
window.addEventListener('load', updateActiveNavLink);

// ==========================================
// Console Welcome Message
// ==========================================
console.log('%c Wacheck - Defensores del Agua', 'color: #20b2aa; font-size: 20px; font-weight: bold;');
console.log('%c Proyecto educativo del Bachillerato 25 - Universidad de Colima', 'color: #225c44; font-size: 14px;');
console.log('%c ¡Juntos por la conservación del agua!', 'color: #3a9980; font-size: 12px;');

// ==========================================
// Easter Egg: Konami Code
// ==========================================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    alert(' ¡Código secreto activado! Has desbloqueado el modo "Lluvia de agua" ');
    
    // Create rain effect
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createWaterDrop(), i * 100);
    }
    
    console.log('%c ¡Secreto desbloqueado!', 'color: gold; font-size: 16px; font-weight: bold;');
}

// ==========================================
// Performance: Debounce scroll events
// ==========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    updateActiveNavLink();
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// ==========================================
// Accessibility: Skip to content
// ==========================================
const skipLink = document.createElement('a');
skipLink.href = '#inicio';
skipLink.className = 'skip-to-content';
skipLink.textContent = 'Saltar al contenido';
skipLink.style.cssText = `
    position: absolute;
    top: -100px;
    left: 10px;
    z-index: 9999;
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: top 0.3s;
`;

skipLink.addEventListener('focus', () => {
    skipLink.style.top = '10px';
});

skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-100px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ==========================================
// Initialize on DOMContentLoaded
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log(' Landing page initialized');
    
    // Initialize calculator
    renderCalculatorActivities();
    
    // Add loading complete class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});
