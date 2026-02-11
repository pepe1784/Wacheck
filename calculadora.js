// === FUNCIONALIDAD DE LA CALCULADORA ===

// Valores de consumo de agua (realistas para México)
const waterConsumption = {
    shower: 8,  // litros por minuto
    teeth: 2,   // litros por vez
    hands: 0.5, // litros por vez
    dishes: 20, // litros por vez
    cooking: 1, // litros directos
    laundry: 80, // litros por carga
    car: 200,   // litros por lavado con manguera
    carBucket: 40, // litros por lavado con cubetas
    plants: 3   // litros por minuto
};

// Precio del agua en Colima (aproximado)
const waterPricePerLiter = 0.01; // 1 centavo por litro

function showWaterCalculator() {
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('calculatorContainer').style.display = 'block';
    if (typeof initAudio === 'function') initAudio(); // Llama a initAudio si existe
    // Calcular valores iniciales
    calculateWater();
    // Configurar event listeners para recálculo automático
    document.querySelectorAll('#calculatorContainer input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateWater);
    });
}

function backToMainFromCalculator() {
    if (typeof playSound === 'function') playSound(300, 0.1, 'square', 0.15);
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userPanel').style.display = 'block';
    document.getElementById('calculatorContainer').style.display = 'none';
    if (typeof updateUnlockShop === 'function') updateUnlockShop();
}

function calculateWater() {
    const showers = parseInt(document.getElementById('showers').value) || 0;
    const showerMinutes = parseInt(document.getElementById('shower-minutes').value) || 10;
    const teeth = parseInt(document.getElementById('teeth').value) || 0;
    const hands = parseInt(document.getElementById('hands').value) || 0;
    const dishes = parseInt(document.getElementById('dishes').value) || 0;
    const cooking = parseInt(document.getElementById('cooking').value) || 0;
    const laundry = parseInt(document.getElementById('laundry').value) || 0;
    const car = parseInt(document.getElementById('car').value) || 0;
    const plants = parseInt(document.getElementById('plants').value) || 0;

    // Calcular consumos individuales
    const showerTotal = showers * showerMinutes * waterConsumption.shower;
    const teethTotal = teeth * waterConsumption.teeth;
    const handsTotal = hands * waterConsumption.hands;
    const dishesTotal = dishes * waterConsumption.dishes;
    const cookingTotal = cooking * waterConsumption.cooking;
    const laundryTotal = laundry * waterConsumption.laundry;
    const carTotal = (car / 7) * waterConsumption.car; // Dividir por semana
    const plantsTotal = plants * waterConsumption.plants;

    // Actualizar displays individuales
    document.getElementById('shower-total').textContent = showerTotal.toFixed(0);
    document.getElementById('teeth-total').textContent = teethTotal.toFixed(0);
    document.getElementById('hands-total').textContent = handsTotal.toFixed(0);
    document.getElementById('dishes-total').textContent = dishesTotal.toFixed(0);
    document.getElementById('cooking-total').textContent = cookingTotal.toFixed(0);
    document.getElementById('laundry-total').textContent = laundryTotal.toFixed(0);
    document.getElementById('car-total').textContent = Math.round(carTotal);
    document.getElementById('plants-total').textContent = plantsTotal.toFixed(0);

    // Calcular total
    const totalWater = showerTotal + teethTotal + handsTotal + dishesTotal +
        cookingTotal + laundryTotal + carTotal + plantsTotal;

    document.getElementById('total-water').textContent = Math.round(totalWater);

    // Calcular costos
    const dailyCost = totalWater * waterPricePerLiter;
    const monthlyCost = dailyCost * 30;

    document.getElementById('estimated-cost').textContent = dailyCost.toFixed(2);
    document.getElementById('monthly-cost').textContent = monthlyCost.toFixed(2);

    // Clasificar consumo
    let classification = '';
    let classificationClass = '';

    if (totalWater < 100) {
        classification = 'Consumo Bajo - Excelente';
        classificationClass = 'bajo';
    } else if (totalWater < 200) {
        classification = 'Consumo Moderado';
        classificationClass = 'moderado';
    } else if (totalWater < 300) {
        classification = 'Consumo Alto';
        classificationClass = 'alto';
    } else {
        classification = 'Consumo Excesivo';
        classificationClass = 'excesivo';
    }

    const classElement = document.getElementById('classification');
    classElement.textContent = classification;
    classElement.className = `classification ${classificationClass}`;

    // Generar recomendaciones personalizadas
    generatePersonalizedTips(showerTotal, carTotal, dishesTotal, totalWater);
}

function generatePersonalizedTips(showerTotal, carTotal, dishesTotal, totalWater) {
    const tips = [];

    if (showerTotal > 100) {
        tips.push({
            icon: '🚿',
            text: `Tus duchas consumen ${Math.round(showerTotal)} litros. Reducir 2 minutos ahorraría ${Math.round(showerTotal * 0.25)} litros diarios.`
        });
    }

    if (carTotal > 20) {
        tips.push({
            icon: '🚗',
            text: `Lavar el carro con cubetas en vez de manguera te ahorraría ${Math.round(carTotal - (carTotal * 0.2))} litros por lavado.`
        });
    }

    if (dishesTotal > 60) {
        tips.push({
            icon: '🍽️',
            text: `Llenar el fregadero en vez de lavar con grifo abierto puede ahorrar hasta 20 litros por lavado.`
        });
    }

    if (totalWater > 250) {
        tips.push({
            icon: '💧',
            text: `Tu consumo está por encima del promedio. Implementar estos consejos podría reducir tu consumo en un 25%.`
        });
    }

    if (tips.length === 0) {
        tips.push({
            icon: '🌟',
            text: '¡Felicidades! Tu consumo está dentro de rangos eficientes. Sigue así y comparte estos consejos.'
        });
    }

    // Mostrar tips
    const tipsContainer = document.getElementById('personalized-tips');
    tipsContainer.innerHTML = '';

    tips.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <span class="tip-icon">${tip.icon}</span>
            <span>${tip.text}</span>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

function resetCalculator() {
    const inputs = document.querySelectorAll('#calculatorContainer input[type="number"]');
    inputs.forEach(input => {
        if (input.id === 'shower-minutes') input.value = 10;
        else if (input.id === 'teeth') input.value = 3;
        else if (input.id === 'hands') input.value = 8;
        else if (input.id === 'dishes') input.value = 2;
        else if (input.id === 'cooking') input.value = 5;
        else if (input.id === 'plants') input.value = 10;
        else input.value = input.id === 'showers' || input.id === 'laundry' ? 1 : 0;
    });
    calculateWater();
}

function finishCalculator() {
    // Get current water consumption total
    const totalWater = parseInt(document.getElementById('total-water').textContent) || 0;

    // Calculate rewards based on consumption
    const reward = calculateCalculatorReward(totalWater);

    // Save to history
    saveCalculatorHistory(totalWater, reward.tier);

    // Update game coins
    if (typeof gameState !== 'undefined') {
        gameState.coins += reward.coins;
        gameState.specialCoins += reward.specialCoins;
        saveCurrentUserProgress();
        updateUnlockShop();
    }

    // Play reward sound
    if (typeof playSound === 'function') {
        playSound(1000, 0.4, 'triangle', 0.3);
    }

    // Show reward popup
    showCalculatorRewardPopup(reward, totalWater);
}

// Calculate reward based on water consumption and usage patterns
function calculateCalculatorReward(totalLiters) {
    let coins = 0;
    let specialCoins = 0;
    let tier = "";
    let tierMessage = "";
    let bonusMessages = [];

    // Tier-based rewards
    if (totalLiters < 150) {
        tier = "excellent";
        tierMessage = "¡Excelente! 🌟";
        coins = 30;
        specialCoins = 2;
    } else if (totalLiters < 200) {
        tier = "good";
        tierMessage = "¡Muy Bien! 💧";
        coins = 20;
        specialCoins = 1;
    } else if (totalLiters < 250) {
        tier = "moderate";
        tierMessage = "Bien 👍";
        coins = 10;
    } else {
        tier = "high";
        tierMessage = "Puedes Mejorar 💪";
        coins = 5;
    }

    // First-time bonus
    const calcData = getCalculatorData();
    if (!calcData.firstUse) {
        coins += 50;
        specialCoins += 1;
        bonusMessages.push("🎁 Primera vez: +50 💰 +1 ⭐");
        calcData.firstUse = true;
        saveCalculatorData(calcData);
    }

    // Daily bonus
    if (isNewCalculatorDay(calcData)) {
        coins += 15;
        bonusMessages.push("📅 Bonus diario: +15 💰");
    }

    // Streak bonus
    const streakBonus = updateStreak(calcData, tier);
    if (streakBonus.coins > 0) {
        coins += streakBonus.coins;
        bonusMessages.push(`🔥 Racha ${streakBonus.days} días: +${streakBonus.coins} 💰`);
    }

    return {
        coins,
        specialCoins,
        tier,
        tierMessage,
        bonusMessages
    };
}

// Get calculator data from localStorage
function getCalculatorData() {
    const data = localStorage.getItem('calculator_data');
    if (!data) {
        return {
            firstUse: false,
            history: [],
            streak: 0,
            lastDate: null,
            bestStreak: 0
        };
    }
    return JSON.parse(data);
}

// Save calculator data to localStorage
function saveCalculatorData(data) {
    localStorage.setItem('calculator_data', JSON.stringify(data));
}

// Save calculation to history
function saveCalculatorHistory(consumption, tier) {
    const calcData = getCalculatorData();
    const today = new Date().toISOString().split('T')[0];

    calcData.history.push({
        date: today,
        consumption: consumption,
        tier: tier,
        timestamp: Date.now()
    });

    // Keep only last 30 entries
    if (calcData.history.length > 30) {
        calcData.history = calcData.history.slice(-30);
    }

    calcData.lastDate = today;
    saveCalculatorData(calcData);
}

// Check if it's a new day since last calculation
function isNewCalculatorDay(calcData) {
    if (!calcData.lastDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return today !== calcData.lastDate;
}

// Update streak based on good usage
function updateStreak(calcData, tier) {
    const today = new Date().toISOString().split('T')[0];
    let streakBonus = { days: 0, coins: 0 };

    // Only count excellent or good tiers for streak
    if (tier === 'excellent' || tier === 'good') {
        if (calcData.lastDate) {
            const lastDate = new Date(calcData.lastDate);
            const currentDate = new Date(today);
            const diffTime = currentDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                calcData.streak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                calcData.streak = 1;
            }
            // If same day, don't change streak
        } else {
            calcData.streak = 1;
        }

        // Update best streak
        if (calcData.streak > (calcData.bestStreak || 0)) {
            calcData.bestStreak = calcData.streak;
        }

        // Streak rewards
        if (calcData.streak >= 30) {
            streakBonus = { days: 30, coins: 500 };
        } else if (calcData.streak >= 14) {
            streakBonus = { days: 14, coins: 200 };
        } else if (calcData.streak >= 7) {
            streakBonus = { days: 7, coins: 100 };
        } else if (calcData.streak >= 3) {
            streakBonus = { days: 3, coins: 25 };
        }
    } else {
        // Poor usage breaks streak
        calcData.streak = 0;
    }

    saveCalculatorData(calcData);
    return streakBonus;
}

// Show reward popup
function showCalculatorRewardPopup(reward, totalLiters) {
    const message = `
        <div style="text-align: center;">
            <h2 style="color: #2ecc71; margin-bottom: 20px;">${reward.tierMessage}</h2>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        padding: 20px; border-radius: 15px; margin: 15px 0;">
                <div style="font-size: 2em; margin-bottom: 10px;">💧</div>
                <div style="font-size: 1.2em; color: white; margin-bottom: 5px;">
                    Consumo: ${totalLiters} L/día
                </div>
                <div style="font-size: 1em; color: rgba(255,255,255,0.9);">
                    Nivel: ${reward.tier === 'excellent' ? 'Excelente' :
            reward.tier === 'good' ? 'Bueno' :
                reward.tier === 'moderate' ? 'Moderado' : 'Alto'}
                </div>
            </div>
            
            <div style="background: rgba(46, 204, 113, 0.1); 
                        padding: 15px; border-radius: 10px; margin: 15px 0;">
                <div style="font-size: 1.5em; color: #27ae60; margin-bottom: 10px;">
                    🎉 Recompensa
                </div>
                <div style="font-size: 1.2em; color: #2c3e50;">
                    +${reward.coins} 💰
                    ${reward.specialCoins > 0 ? ` +${reward.specialCoins} ⭐` : ''}
                </div>
            </div>
            
            ${reward.bonusMessages.length > 0 ? `
                <div style="background: rgba(52, 152, 219, 0.1); 
                            padding: 10px; border-radius: 10px; margin: 15px 0;">
                    <div style="font-size: 0.9em; color: #3498db;">
                        ${reward.bonusMessages.join('<br>')}
                    </div>
                </div>
            ` : ''}
            
            ${reward.tier === 'high' || reward.tier === 'moderate' ? `
                <div style="background: rgba(243, 156, 18, 0.1); 
                            padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
                    <div style="font-size: 1.1em; color: #e67e22; margin-bottom: 10px;">
                        💡 Consejos para mejorar:
                    </div>
                    <ul style="color: #7f8c8d; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Reduce duchas a 5 minutos</li>
                        <li>Cierra el grifo al cepillarte</li>
                        <li>Lava el carro con cubetas</li>
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    if (typeof showMessage === 'function') {
        showMessage("¡Calculadora Completada!", message, [{
            text: 'Aceptar',
            action: () => {
                hideMessage();
                backToMainFromCalculator();
                // Update coin display if in game
                if (typeof updateUI === 'function') updateUI();
            }
        }]);
    }
}