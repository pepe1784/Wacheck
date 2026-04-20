// ============================================================
// js/game/shop-system.js — Sistema de tienda y desbloques
// Gestiona compra de defensores, desbloqueos y selección pre-partida.
// Depende de: gameState, allDefenderTypes, unlockableDefenders, shopDefenders, purchasedDefenders
// Se inyectan dependencias globales via window cuando se carga.
// ============================================================
(function () {
    'use strict';

    function createDefenderVisual(defenderId, defenderName, imageUrl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'defender-icon';

        if (window.GameSprites) {
            wrapper.innerHTML = window.GameSprites.defender(defenderId);
            return wrapper;
        }

        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = defenderName || defenderId;
            img.className = 'defender-image';
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.objectFit = 'contain';
            img.onerror = function() {
                wrapper.textContent = (defenderName || defenderId || '?').charAt(0).toUpperCase();
            };
            wrapper.appendChild(img);
            return wrapper;
        }

        wrapper.textContent = (defenderName || defenderId || '?').charAt(0).toUpperCase();
        return wrapper;
    }

    function unlockDefender(key) {
        const gs = window.gameState;
        const adt = window.allDefenderTypes;
        const unlockableDefenders = window.unlockableDefenders;

        const cost = unlockableDefenders[key].cost;
        if (gs.specialCoins >= cost && !gs.unlockedDefenders.includes(key)) {
            gs.specialCoins -= cost;
            gs.unlockedDefenders.push(key);

            if (typeof window.saveCurrentUserProgress === 'function') {
                window.saveCurrentUserProgress();
            }

            // Verificar si desbloqueó todos los defensores
            const allUnlockableKeys = Object.keys(unlockableDefenders);
            const allUnlocked = allUnlockableKeys.every(k => gs.unlockedDefenders.includes(k));
            if (allUnlocked && typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('all_defenders');
            }

            if (typeof window.updateUnlockShop === 'function') {
                window.updateUnlockShop();
            }
            
            if (typeof window.playGameSound === 'function') {
                window.playGameSound('unlock');
            }

            if (typeof window.showMessage === 'function') {
                window.showMessage(
                    "¡Desbloqueado!",
                    `Has desbloqueado ${adt[key].name}. ¡Ahora puedes usarlo en el juego!`,
                    [{ text: '¡Genial!', action: typeof window.hideMessage === 'function' ? window.hideMessage : () => {} }]
                );
            }
        }
    }

    function updateDefenderShop() {
        const gs = window.gameState;
        const adt = window.allDefenderTypes;
        const selectedDefendersForGame = window.selectedDefendersForGame;

        const shop = document.getElementById('defenderShop');
        if (!shop) { console.error('[Shop] #defenderShop element not found!'); return; }
        shop.innerHTML = '';

        console.log('[Shop] selectedDefendersForGame:', JSON.stringify(selectedDefendersForGame));
        console.log('[Shop] allDefenderTypes keys:', Object.keys(window.allDefenderTypes || adt));

        // Agregar herramienta de eliminación
        const removalTool = document.createElement('div');
        removalTool.className = 'defender-card removal-tool';
        removalTool.onclick = function() {
            if (typeof window.toggleRemovalMode === 'function') {
                window.toggleRemovalMode();
            }
        };
        removalTool.innerHTML = `
            <div class="defender-icon"></div>
            <div class="defender-name">Eliminar</div>
            <div class="defender-cost">50% </div>
        `;
        shop.appendChild(removalTool);

        // Usar los defensores seleccionados o básicos como fallback
        const _validIds = selectedDefendersForGame.filter(id => !!adt[id]);
        if (_validIds.length === 0) {
            console.warn('[Shop] Ningún ID válido en selectedDefendersForGame – usando básicos como respaldo.');
            window.selectedDefendersForGame = ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
        }

        selectedDefendersForGame.forEach(defenderId => {
            const defenderData = getDefenderData(defenderId);
            if (!defenderData) return;

            const defender = adt[defenderId];
            if (!defender) return;

            const card = document.createElement('div');
            card.className = 'defender-card';
            card.dataset.type = defenderId;

            card.onclick = () => selectDefender(defenderId, defender.cost);

            // Doble clic para modo múltiple
            card.ondblclick = () => {
                if (gs.coins >= defender.cost && !gs.isPaused) {
                    gs.multiPlacementMode = true;
                    gs.selectedDefender = defenderId;
                    gs.selectedCost = defender.cost;
                    gs.removalMode = false;

                    document.querySelectorAll('.defender-card, .removal-tool').forEach(c => {
                        c.classList.remove('selected', 'multi-placement');
                    });
                    card.classList.add('selected', 'multi-placement');

                    if (typeof window.updateCellHoverEffects === 'function') {
                        window.updateCellHoverEffects();
                    }
                    if (typeof window.playGameSound === 'function') {
                        window.playGameSound('selectDefender');
                    }
                }
            };

            card.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectDefender(defenderId, defender.cost);
                }
            };
            card.tabIndex = 0;
            card.setAttribute('role', 'button');

            const mainCardArea = document.createElement('div');
            mainCardArea.className = 'defender-card-main';

            mainCardArea.appendChild(createDefenderVisual(defenderId, defenderData.name, defender.image));

            const nameEl = document.createElement('div');
            nameEl.className = 'defender-name';
            nameEl.textContent = defenderData.name;

            const costEl = document.createElement('div');
            costEl.className = 'defender-cost';
            costEl.textContent = defender.cost;

            mainCardArea.appendChild(nameEl);
            mainCardArea.appendChild(costEl);
            card.appendChild(mainCardArea);

            if (defender.info) {
                const infoBtn = document.createElement('button');
                infoBtn.className = 'info-btn';
                infoBtn.innerHTML = '<i data-lucide="info"></i>';
                infoBtn.onclick = (event) => {
                    event.stopPropagation();
                    if (typeof window.showMessage === 'function') {
                        window.showMessage(defender.name, defender.info, [
                            { text: 'Entendido', action: typeof window.hideMessage === 'function' ? window.hideMessage : () => {} }
                        ]);
                    }
                };
                card.appendChild(infoBtn);
            }

            shop.appendChild(card);
        });
    }

    function updateDefenderHealthBarColor(defender) {
        if (!defender.healthFill) return;

        switch (defender.level) {
            case 1:
                defender.healthFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                defender.healthFill.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.6)';
                break;
            case 2:
                defender.healthFill.style.background = 'linear-gradient(90deg, #14b8a6, #0d9488)';
                defender.healthFill.style.boxShadow = '0 0 8px rgba(20, 184, 166, 0.6)';
                break;
            case 3:
                defender.healthFill.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
                defender.healthFill.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.6)';
                break;
            case 4:
                defender.healthFill.style.background = 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
                defender.healthFill.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0.6)';
                break;
            case 5:
                defender.healthFill.style.background = 'linear-gradient(90deg, #a855f7, #9333ea)';
                defender.healthFill.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.8)';
                break;
        }
    }

    function selectDefender(type, cost) {
        const gs = window.gameState;
        const isTutorialActive = typeof window.tutorialManager !== 'undefined' && window.tutorialManager.isActive;
        const canSelect = (isTutorialActive || !gs.isPaused);

        if (gs.coins >= cost && canSelect) {
            gs.selectedDefender = type;
            gs.selectedCost = cost;
            gs.removalMode = false;
            gs.multiPlacementMode = false;

            document.querySelectorAll('.defender-card, .removal-tool').forEach(card => {
                card.classList.remove('selected', 'multi-placement');
            });
            document.querySelector(`[data-type="${type}"]`).classList.add('selected');

            if (typeof window.playGameSound === 'function') {
                window.playGameSound('selectDefender');
            }
        }
    }

    function openShopMenu() {
        const shopMenu = document.getElementById('shopMenu');
        const globalSoundBtn = document.getElementById('soundToggle');
        const shopBtn = document.querySelector('.shop-toggle-btn');

        if (shopMenu) {
            shopMenu.classList.add('active');
            renderShop();
            updateShopBalance();
        }

        if (globalSoundBtn) globalSoundBtn.style.display = 'none';
        if (shopBtn) shopBtn.style.display = 'none';
    }

    function closeShopMenu() {
        const shopMenu = document.getElementById('shopMenu');
        const globalSoundBtn = document.getElementById('soundToggle');
        const shopBtn = document.querySelector('.shop-toggle-btn');

        if (shopMenu) shopMenu.classList.remove('active');
        if (globalSoundBtn) globalSoundBtn.style.display = 'flex';
        if (shopBtn) shopBtn.style.display = 'flex';
    }

    function closeShopMenuOnOutsideClick(event) {
        if (event.target.id === 'shopMenu') {
            closeShopMenu();
        }
    }

    function renderShop() {
        const unlockGrid = document.getElementById('unlockGrid');
        if (!unlockGrid) {
            console.warn('[Shop] #unlockGrid no encontrado');
            return;
        }

        unlockGrid.innerHTML = '';

        window.shopDefenders.forEach(defender => {
            const isPurchased = window.purchasedDefenders.includes(defender.id);
            const canAfford = window.specialCoins >= defender.cost;

            const itemDiv = document.createElement('div');
            itemDiv.className = `shop-item ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'locked' : ''}`;
            itemDiv.dataset.category = defender.category;
            itemDiv.dataset.cost = defender.cost;
            const defData = window.allDefenderTypes && window.allDefenderTypes[defender.id];
            const shopIconHTML = defData && defData.image
                ? `<img src="${defData.image}" alt="${defender.name}" style="width:40px;height:40px;object-fit:contain;">`
                : (window.GameSprites ? window.GameSprites.defender(defender.id) : defender.name.charAt(0));
            itemDiv.innerHTML = `
                <div class="shop-item-icon">${shopIconHTML}</div>
                <div class="shop-item-name">${defender.name}</div>
                <div class="shop-item-desc">${defender.desc}</div>
                <div class="shop-item-price">
                    ${isPurchased ? 'COMPRADO' : `${defender.cost}`}
                </div>
            `;

            if (!isPurchased && canAfford) {
                itemDiv.onclick = () => purchaseDefender(defender);
            }

            unlockGrid.appendChild(itemDiv);
        });

        // Re-aplicar filtro activo actual
        const activeBtn = document.querySelector('#shopMenu .filter-btn.active');
        if (activeBtn) {
            const m = (activeBtn.getAttribute('onclick') || '').match(/filterShop\('([^']+)'\)/);
            if (m) filterShop(m[1]);
        }
    }

    function filterShop(category) {
        document.querySelectorAll('#shopMenu .filter-btn').forEach(btn => {
            const m = (btn.getAttribute('onclick') || '').match(/filterShop\('([^']+)'\)/);
            btn.classList.toggle('active', !!(m && m[1] === category));
        });

        document.querySelectorAll('#unlockGrid .shop-item').forEach(item => {
            let visible;
            if (category === 'low-cost') {
                visible = parseInt(item.dataset.cost) <= 3;
            } else {
                visible = item.dataset.category === category;
            }
            item.style.display = visible ? '' : 'none';
        });
    }

    // Exponer filterShop globalmente (lo llaman los botones del HTML)
    window.filterShop = filterShop;

    function purchaseDefender(defender) {
        if (window.specialCoins >= defender.cost && !window.purchasedDefenders.includes(defender.id)) {
            window.specialCoins -= defender.cost;
            window.purchasedDefenders.push(defender.id);

            window.gameState.specialCoins = window.specialCoins;
            if (!window.gameState.unlockedDefenders.includes(defender.id)) {
                window.gameState.unlockedDefenders.push(defender.id);
            }

            localStorage.setItem('specialCoins', window.specialCoins);
            localStorage.setItem('purchasedDefenders', JSON.stringify(window.purchasedDefenders));

            if (typeof window.saveCurrentUserProgress === 'function') {
                window.saveCurrentUserProgress();
            }

            updateShopBalance();
            renderShop();

            if (typeof window.showMessage === 'function') {
                window.showMessage(
                    ` ¡${defender.name} comprado!`,
                    `¡Ahora puedes usar a ${defender.name} en tus partidas!`,
                    [{ text: '¡Genial!', action: typeof window.hideMessage === 'function' ? window.hideMessage : () => {} }]
                );
            }
        }
    }

    function updateShopBalance() {
        const balanceElement = document.getElementById('shopSpecialCoins');
        if (balanceElement) {
            balanceElement.textContent = window.specialCoins;
        }
    }

    function awardSpecialCoins(amount) {
        if (window.REWARDS_BLOCKED === true) {
            console.warn(' ANTI-CHEAT: No se pueden otorgar monedas especiales');
            if (typeof window.AntiCheat !== 'undefined' && window.AntiCheat.showRewardBlockedMessage) {
                window.AntiCheat.showRewardBlockedMessage();
            }
            return 0;
        }

        if (typeof window.AntiCheat !== 'undefined' && amount > window.AntiCheat.limits.specialCoins.maxPerSession) {
            console.warn(' ANTI-CHEAT: Monto de monedas especiales sospechoso:', amount);
            amount = Math.min(amount, window.AntiCheat.limits.specialCoins.maxPerSession / 2);
        }

        window.specialCoins += amount;
        window.gameState.specialCoins += amount;
        window.gameState.coinsEarnedThisSession += amount;
        
        localStorage.setItem('specialCoins', window.specialCoins);
        
        updateShopBalance();
        if (typeof window.updateUI === 'function') {
            window.updateUI();
        }
        
        if (typeof window.showMessage === 'function') {
            window.showMessage(` +${amount} Monedas Especiales`, 'reward');
        }
    }

    function showDefenderSelectionModal() {
        const modal = document.getElementById('defenderSelectionModal');
        if (modal) {
            modal.classList.add('active');
            renderDefenderSelection();
        }
    }

    function hideDefenderSelectionModal() {
        const modal = document.getElementById('defenderSelectionModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        const globalSoundBtn = document.getElementById('soundToggle');
        const shopBtn = document.querySelector('.shop-toggle-btn');
        const sidebar = document.querySelector('.left-sidebar');

        if (globalSoundBtn) globalSoundBtn.style.display = 'flex';
        if (shopBtn) shopBtn.style.display = 'flex';
        if (sidebar) sidebar.style.display = 'block';
    }

    function renderDefenderSelection() {
        renderSelectedSlots();
        renderAvailableDefenders();
        updateStartButton();
    }

    function renderSelectedSlots() {
        const selectedDefendersForGame = window.selectedDefendersForGame;
        const slots = document.querySelectorAll('.defender-slot');
        slots.forEach((slot, index) => {
            const defenderId = selectedDefendersForGame[index];
            if (defenderId) {
                const defenderData = getDefenderData(defenderId);
                const slotIcon = defenderData && defenderData.image
                    ? `<img src="${defenderData.image}" alt="${defenderData.name}" style="width:100%;height:100%;object-fit:contain;">`
                    : (defenderData ? (window.GameSprites ? window.GameSprites.defender(defenderId) : defenderData.name.charAt(0)) : '?');
                slot.innerHTML = slotIcon;
                slot.classList.remove('empty');
            } else {
                slot.textContent = '?';
                slot.classList.add('empty');
            }

            slot.onclick = () => {
                if (defenderId) {
                    removeDefenderFromSelection(index);
                }
            };
        });

        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = selectedDefendersForGame.length;
        }
    }

    function renderAvailableDefenders() {
        const gs = window.gameState;
        const grid = document.getElementById('availableGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const allDefendersData = [
            { id: 'filter', name: 'Filtro', icon: 'filter', stats: 'Daño: 25 | Rango: 4' },
            { id: 'plant', name: 'Planta', icon: 'plant', stats: 'Daño: 35 | Auto-cura' },
            { id: 'recycler', name: 'Reciclador', icon: 'recycler', stats: 'Daño: 45 | Rápido' },
            { id: 'cleaner', name: 'Purificador', icon: 'cleaner', stats: 'Daño: 60 | Rango: 5' },
            { id: 'stream', name: 'Chorro', icon: 'stream', stats: 'Daño: 18 | Económico' },
            { id: 'bubble', name: 'Burbuja', icon: 'bubble', stats: 'Daño: 6 | Ralentiza' },
            { id: 'wind', name: 'Viento', icon: 'wind', stats: 'Daño: 18 | Empuje' },
            { id: 'earth', name: 'Tierra', icon: 'earth', stats: 'Daño: 22 | Aturdimiento' }
        ];

        const unlockedDefendersData = allDefendersData.filter(defender => 
            gs.unlockedDefenders.includes(defender.id)
        );
        
        const unlockedShopDefenders = window.shopDefenders.filter(def => 
            gs.unlockedDefenders.includes(def.id)
        );

        const allAvailable = [...unlockedDefendersData, ...unlockedShopDefenders.map(def => ({
            id: def.id,
            name: def.name,
            icon: def.icon,
            stats: `Daño: ${def.stats.damage || 0} | Rango: ${def.stats.range || 0}`
        }))];

        if (allAvailable.length === 0) {
            grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No tienes defensores desbloqueados. Desblóquea algunos en la tienda.</div>';
            return;
        }

        allAvailable.forEach(defender => {
            const selectedDefendersForGame = window.selectedDefendersForGame;
            const isSelected = selectedDefendersForGame.includes(defender.id);
            const isFull = selectedDefendersForGame.length >= 8;

            const card = document.createElement('div');
            card.className = `available-defender-card ${isSelected ? 'selected' : ''} ${isFull && !isSelected ? 'locked' : ''}`;
            const defDataCard = window.allDefenderTypes && window.allDefenderTypes[defender.id];
            const cardIconHTML = defDataCard && defDataCard.image
                ? `<img src="${defDataCard.image}" alt="${defender.name}" style="width:40px;height:40px;object-fit:contain;">`
                : (window.GameSprites ? window.GameSprites.defender(defender.id) : defender.name.charAt(0));
            card.innerHTML = `
                <div class="icon">${cardIconHTML}</div>
                <div class="name">${defender.name}</div>
                <div class="stats">${defender.stats}</div>
            `;

            if (!isSelected && !isFull) {
                card.onclick = () => addDefenderToSelection(defender.id);
            } else if (isSelected) {
                card.onclick = () => removeDefenderFromSelectionById(defender.id);
            }

            grid.appendChild(card);
        });
    }

    function addDefenderToSelection(defenderId) {
        const selectedDefendersForGame = window.selectedDefendersForGame;
        if (selectedDefendersForGame.length < 8 && !selectedDefendersForGame.includes(defenderId)) {
            selectedDefendersForGame.push(defenderId);
            localStorage.setItem('selectedDefendersForGame', JSON.stringify(selectedDefendersForGame));
            renderDefenderSelection();
        }
    }

    function removeDefenderFromSelection(slotIndex) {
        const selectedDefendersForGame = window.selectedDefendersForGame;
        if (slotIndex >= 0 && slotIndex < selectedDefendersForGame.length) {
            selectedDefendersForGame.splice(slotIndex, 1);
            localStorage.setItem('selectedDefendersForGame', JSON.stringify(selectedDefendersForGame));
            renderDefenderSelection();
        }
    }

    function removeDefenderFromSelectionById(defenderId) {
        const selectedDefendersForGame = window.selectedDefendersForGame;
        const index = selectedDefendersForGame.indexOf(defenderId);
        if (index !== -1) {
            removeDefenderFromSelection(index);
        }
    }

    function updateStartButton() {
        const btn = document.getElementById('btnStartGame');
        if (btn) {
            btn.disabled = window.selectedDefendersForGame.length !== 8;
        }
    }

    function confirmDefenderSelection() {
        const selectedDefendersForGame = window.selectedDefendersForGame;
        if (selectedDefendersForGame.length === 8) {
            hideDefenderSelectionModal();

            const globalSoundBtn = document.getElementById('soundToggle');
            const shopBtn = document.querySelector('.shop-toggle-btn');
            const sidebar = document.querySelector('.left-sidebar');

            if (globalSoundBtn) globalSoundBtn.style.display = 'none';
            if (shopBtn) shopBtn.style.display = 'none';
            if (sidebar) sidebar.style.display = 'none';

            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('userPanel').style.display = 'none';
            document.getElementById('settingsPanelToggle').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';

            if (typeof window.closeSettingsPanel === 'function') {
                window.closeSettingsPanel();
            }

            if (typeof window.hideBottomMenu === 'function') {
                window.hideBottomMenu();
            }

            if (typeof window.initAudio === 'function') {
                window.initAudio();
            }

            if (typeof window.initializeGame === 'function') {
                window.initializeGame();
            }

            if (typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('first_game');
            }
        }
    }

    function getDefenderData(defenderId) {
        const adt = window.allDefenderTypes;
        
        if (adt[defenderId]) {
            return {
                id: defenderId,
                name: adt[defenderId].name,
                image: adt[defenderId].image || null,
                icon: adt[defenderId].image
                    ? `<img src="${adt[defenderId].image}" alt="${adt[defenderId].name}" style="width:100%;height:100%;object-fit:contain;">`
                    : (window.GameSprites ? window.GameSprites.defender(defenderId) : adt[defenderId].name.charAt(0))
            };
        }

        return window.shopDefenders.find(def => def.id === defenderId);
    }

    // Exportar al namespace global
    window.WacheckShop = {
        unlockDefender: unlockDefender,
        updateDefenderShop: updateDefenderShop,
        updateDefenderHealthBarColor: updateDefenderHealthBarColor,
        selectDefender: selectDefender,
        openShopMenu: openShopMenu,
        closeShopMenu: closeShopMenu,
        closeShopMenuOnOutsideClick: closeShopMenuOnOutsideClick,
        renderShop: renderShop,
        purchaseDefender: purchaseDefender,
        updateShopBalance: updateShopBalance,
        awardSpecialCoins: awardSpecialCoins,
        showDefenderSelectionModal: showDefenderSelectionModal,
        hideDefenderSelectionModal: hideDefenderSelectionModal,
        renderDefenderSelection: renderDefenderSelection,
        getDefenderData: getDefenderData,
        confirmDefenderSelection: confirmDefenderSelection
    };

    console.log('[Shop] System loaded');
})();
