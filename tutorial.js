// SISTEMA DE TUTORIAL INTERACTIVO
// Tutorial paso a paso para nuevo jugadores de Wacheck

const tutorialSteps = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Wacheck!',
    icon: 'wave',
    message: 'Eres el guardián de una de las últimas fuentes de agua pura del planeta. Tu misión es protegerla de los contaminantes usando defensores ecológicos. ¡Te enseñaré cómo jugar!',
    target: null,
    highlight: null,
    position: 'center',
    buttons: [
      { text: '¡Comenzar Tutorial!', action: 'next' },
      { text: 'Saltar Tutorial', action: 'skip' }
    ]
  },
  {
    id: 'start_game',
    title: 'Comenzar a Jugar',
    icon: 'play',
    message: 'Para empezar, haz clic en el botón "¡Jugar Ahora!" para entrar al campo de batalla.',
    target: '.play-btn',
    highlight: '.play-btn',
    position: 'bottom',
    waitFor: 'game_started',
    buttons: []
  },
  {
    id: 'coins',
    title: 'Monedas',
    icon: 'coin',
    message: 'Estas son tus monedas. Las usas para colocar defensores en el tablero. Ganas más monedas eliminando contaminantes.',
    target: '#coinCount',
    highlight: '.coins',
    position: 'bottom',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'health',
    title: 'Vida de la Isla',
    icon: 'heart',
    message: 'Esta es la salud de tu isla. Si un contaminante llega al lado izquierdo del tablero, perderás vida. ¡No dejes que llegue a 0!',
    target: '#healthCount',
    highlight: '.health',
    position: 'bottom',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'wave',
    title: 'Oleadas',
    icon: 'wave',
    message: 'El juego se divide en oleadas. Entre cada oleada tienes tiempo para preparar tus defensas. La dificultad aumenta con cada oleada.',
    target: '#waveCount',
    highlight: '.wave-info',
    position: 'bottom',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'defenders',
    title: 'Tienda de Defensores',
    icon: 'sword',
    message: 'Aquí están tus defensores disponibles. Cada uno tiene un costo en monedas, daño diferente, y habilidades únicas.',
    target: '#defenderShop',
    highlight: '#defenderShop',
    position: 'top',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'select_defender',
    title: 'Seleccionar Defensor',
    icon: 'target',
    message: 'Haz clic en una carta de defensor para seleccionarlo. El defensor "Chorro" es perfecto para empezar: barato y rápido.',
    target: '.defender-card[data-type="stream"]',
    highlight: '.defender-card[data-type="stream"]',
    position: 'top',
    waitFor: 'defender_selected',
    buttons: []
  },
  {
    id: 'place_defender',
    title: 'Colocar Defensor',
    icon: 'map',
    message: '¡Excelente! Ahora haz clic en una celda del tablero para colocar tu defensor. Los defensores atacan a los contaminantes en su fila.',
    target: '#gameBoard',
    highlight: '#gameBoard',
    position: 'top',
    waitFor: 'defender_placed',
    buttons: []
  },
  {
    id: 'defender_info',
    title: 'Información del Defensor',
    icon: 'info',
    message: 'Algunos defensores tienen un botón de información que te cuenta datos reales sobre conservación del agua. ¡Aprende mientras juegas!',
    target: '.info-btn',
    highlight: '.info-btn',
    position: 'top',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'upgrade',
    title: 'Mejorar Defensores',
    icon: 'arrow-up',
    message: 'Haz clic en un defensor ya colocado para ver el panel de mejora. Puedes aumentar su nivel usando monedas para hacerlo más poderoso.',
    target: null,
    highlight: null,
    position: 'center',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'removal',
    title: 'Herramienta de Eliminación',
    icon: 'cross',
    message: 'Si necesitas remover un defensor, usa la herramienta de eliminación. Recuperarás el 50% de su costo.',
    target: '.removal-tool',
    highlight: '.removal-tool',
    position: 'top',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'pause',
    title: 'Pausar el Juego',
    icon: 'settings',
    message: 'Puedes pausar el juego en cualquier momento con este botón. Úsalo para planear tu estrategia.',
    target: '.pause-btn',
    highlight: '.pause-btn',
    position: 'bottom',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'special_coins',
    title: 'Monedas Especiales',
    icon: 'star',
    message: 'Las monedas especiales se obtienen completando oleadas y logros. Úsalas para desbloquear nuevos defensores en la tienda.',
    target: '#specialCoins',
    highlight: '.special-coins-game',
    position: 'bottom',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'strategy',
    title: 'Estrategia',
    icon: 'lightning',
    message: 'Consejo: Coloca defensores baratos al frente y más poderosos atrás. Los contaminantes rápidos requieren defensores con ataque rápido.',
    target: null,
    highlight: null,
    position: 'center',
    buttons: [{ text: 'Entendido', action: 'next' }]
  },
  {
    id: 'complete',
    title: '¡Listo para Jugar!',
    icon: 'play',
    message: '¡Has completado el tutorial! Recuerda visitar el Modo Historia para misiones especiales y la Calculadora de Agua para aprender a conservar agua en la vida real. ¡Buena suerte, guardián!',
    target: null,
    highlight: null,
    position: 'center',
    buttons: [{ text: '¡A Jugar!', action: 'complete' }]
  }
];

class TutorialManager {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.tutorialCompleted = this.loadProgress();
    this.overlay = null;
    this.tooltip = null;
    this.highlightElements = [];
  }

  loadProgress() {
    const saved = localStorage.getItem('wacheck_tutorial_completed');
    return saved === 'true';
  }

  saveProgress() {
    localStorage.setItem('wacheck_tutorial_completed', 'true');
  }

  shouldShowTutorial() {
    // Mostrar tutorial si nunca se completó
    return !this.tutorialCompleted;
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);

    // Pausar el juego durante el tutorial
    this.pauseGame();
  }

  pauseGame() {
    if (typeof gameState !== 'undefined' && gameState.gameRunning && !gameState.isPaused) {
      gameState.isPaused = true;
    }
  }

  unpauseGame() {
    if (typeof gameState !== 'undefined' && gameState.gameRunning) {
      gameState.isPaused = false;
    }
  }

  createOverlay() {
    // Crear overlay oscuro de fondo
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.display = 'block';
    document.body.appendChild(this.overlay);

    // Crear tooltip que contendrá el mensaje
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    document.body.appendChild(this.tooltip);
  }

  showStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
      this.complete();
      return;
    }

    const step = tutorialSteps[stepIndex];
    this.currentStep = stepIndex;

    // Limpiar highlights anteriores
    this.clearHighlights();

    // Crear highlight si existe target
    if (step.highlight) {
      this.createHighlight(step.highlight);
    }

    // Posicionar y mostrar tooltip
    this.updateTooltip(step);

    // Asegurar que el juego permanezca pausado durante el tutorial
    this.pauseGame();

    // Reproducir sonido de tutorial
    if (typeof playSound === 'function') {
      playSound(800, 0.1, 'sine', 0.15);
    }
  }

  createHighlight(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Agregar clase CSS al elemento original para que mantenga su color y se vea por encima del overlay
      element.classList.add('tutorial-highlighted-element');

      const highlight = document.createElement('div');
      highlight.className = 'tutorial-highlight';

      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      highlight.style.top = `${rect.top + scrollY - 5}px`;
      highlight.style.left = `${rect.left + scrollX - 5}px`;
      highlight.style.width = `${rect.width + 10}px`;
      highlight.style.height = `${rect.height + 10}px`;

      document.body.appendChild(highlight);
      this.highlightElements.push({ highlight, element });
    });
  }

  clearHighlights() {
    this.highlightElements.forEach(({ highlight, element }) => {
      highlight.remove();
      // Remover la clase CSS del elemento original
      element.classList.remove('tutorial-highlighted-element');
    });
    this.highlightElements = [];
  }

  updateTooltip(step) {
    this.tooltip.innerHTML = `
            <div class="tutorial-header">
                <h3>${step.icon ? window.GameSprites.inline(step.icon, 20) + ' ' : ''}${step.title}</h3>
                ${step.id !== 'welcome' ? `<div class="tutorial-progress">${this.currentStep + 1}/${tutorialSteps.length}</div>` : ''}
            </div>
            <div class="tutorial-message">${step.message}</div>
            <div class="tutorial-buttons">
                ${step.buttons.map(btn => `
                    <button class="tutorial-btn ${btn.action === 'skip' ? 'tutorial-btn-secondary' : ''}" 
                            onclick="tutorialManager.handleAction('${btn.action}')">${btn.text}</button>
                `).join('')}
            </div>
        `;

    // Posicionar tooltip después de que se renderice
    // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
    requestAnimationFrame(() => {
      this.positionTooltip(step);
    });
  }

  positionTooltip(step) {
    // Resetear estilos previos
    this.tooltip.style.top = 'auto';
    this.tooltip.style.bottom = 'auto';
    this.tooltip.style.left = 'auto';
    this.tooltip.style.right = 'auto';
    this.tooltip.style.transform = '';

    // Para móviles, usar siempre posición fija inferior
    if (window.innerWidth <= 600) {
      this.tooltip.style.top = 'auto';
      this.tooltip.style.bottom = '20px';
      this.tooltip.style.left = '50%';
      this.tooltip.style.right = 'auto';
      this.tooltip.style.transform = 'translateX(-50%)';
      return;
    }

    if (step.position === 'center') {
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
    } else if (step.target) {
      const targetEl = document.querySelector(step.target);
      if (!targetEl) {
        // Si no encuentra el target, centrar
        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();
      const margin = 20;
      const spacing = 20;

      let top, left;
      let preferredPosition = step.position;

      // Calcular posición inicial basada en la preferencia
      if (preferredPosition === 'bottom') {
        top = rect.bottom + spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;

        // Si se sale por abajo, cambiar a arriba
        if (top + tooltipRect.height > window.innerHeight - margin) {
          top = rect.top - tooltipRect.height - spacing;
          // Si ahora se sale por arriba, centrar verticalmente
          if (top < margin) {
            top = Math.max(margin, (window.innerHeight - tooltipRect.height) / 2);
          }
        }
      } else if (preferredPosition === 'top') {
        top = rect.top - tooltipRect.height - spacing;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;

        // Si se sale por arriba, cambiar a abajo
        if (top < margin) {
          top = rect.bottom + spacing;
          // Si ahora se sale por abajo, centrar verticalmente
          if (top + tooltipRect.height > window.innerHeight - margin) {
            top = Math.max(margin, (window.innerHeight - tooltipRect.height) / 2);
          }
        }
      }

      // Ajustar límites horizontales
      if (left < margin) {
        left = margin;
      } else if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin;
      }

      // Ajuste final vertical (por si acaso)
      if (top < margin) {
        top = margin;
      } else if (top + tooltipRect.height > window.innerHeight - margin) {
        top = window.innerHeight - tooltipRect.height - margin;
      }

      this.tooltip.style.top = `${Math.max(0, top)}px`;
      this.tooltip.style.left = `${Math.max(0, left)}px`;
    }
  }

  handleAction(action) {
    if (action === 'next') {
      this.next();
    } else if (action === 'skip') {
      this.skip();
    } else if (action === 'complete') {
      this.complete();
    }
  }

  next() {
    const currentStepData = tutorialSteps[this.currentStep];

    // Si el paso requiere esperar por una acción del usuario
    if (currentStepData.waitFor) {
      // El paso avanzará cuando se ejecute checkCondition()
      return;
    }

    this.showStep(this.currentStep + 1);
  }

  checkCondition(condition) {
    if (!this.isActive) return;

    const currentStepData = tutorialSteps[this.currentStep];
    if (currentStepData.waitFor === condition) {
      // Pequeño delay para que el usuario vea el resultado de su acción
      setTimeout(() => {
        this.showStep(this.currentStep + 1);
      }, 500);
    }
  }

  skip() {
    if (confirm('¿Estás seguro de que quieres saltar el tutorial? Podrás volver a verlo desde el menú principal.')) {
      this.complete(true);
    }
  }

  complete(skipped = false) {
    this.isActive = false;

    if (!skipped) {
      this.saveProgress();

      // Desbloquear logro de completar tutorial
      if (typeof unlockAchievement === 'function') {
        unlockAchievement('tutorial_complete');
      }
    }

    this.clearHighlights();

    if (this.overlay) this.overlay.remove();
    if (this.tooltip) this.tooltip.remove();

    // Reanudar el juego
    this.unpauseGame();

    // Reproducir sonido de completado
    if (typeof playSound === 'function' && !skipped) {
      playSound(1000, 0.2, 'triangle', 0.3);
    }
  }

  // Método para reiniciar el tutorial manualmente
  reset() {
    localStorage.removeItem('wacheck_tutorial_completed');
    this.tutorialCompleted = false;
    this.start();
  }
}

// Instancia global del tutorial
const tutorialManager = new TutorialManager();

// Integración con eventos del juego
function initTutorial() {
  // Auto-iniciar tutorial si es la primera vez
  if (tutorialManager.shouldShowTutorial()) {
    // Esperar un momento a que la página cargue completamente
    setTimeout(() => {
      tutorialManager.start();
    }, 500);
  }
}

// Continuar tutorial después de que el juego inicie
function continueTutorialAfterGameStart() {
  if (tutorialManager.isActive) {
    tutorialManager.checkCondition('game_started');
  }
}

// Iniciar tutorial cuando la página carga (si corresponde)
// NOTA: Ahora el tutorial se inicia después de cerrar la recompensa diaria en rewards.js
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Ya no iniciamos automáticamente aquí para que aparezca después de la recompensa diaria
    // initTutorial();
  });
}

// Función global para reiniciar tutorial desde el menú
function restartTutorial() {
  tutorialManager.reset();
}

// Exponer función global
window.restartTutorial = restartTutorial;
window.tutorialManager = tutorialManager;
