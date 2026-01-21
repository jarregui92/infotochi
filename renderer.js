const fs = require('fs');
const path = require('path');
const { FOODS, GAMES, CLEANING_ITEMS, PET_MESSAGES, PET_TYPES } = require('./gameData');
const { initAnimations, playAnimation, playSpriteAnimation } = require('./animationManager');
const stageManager = require('./stageManager');
const achievementManager = require('./achievementManager');
const { ACHIEVEMENTS } = require('./achievements');

// ==========================================
// CONFIGURACIÓN (VARIABLES MODIFICABLES)
// ==========================================

const TICK_RATE = 1000; 
const LIFE_DECAY_AMOUNT = 1; 
const FUN_DECAY_AMOUNT = 1;
const DIRT_INCREMENT_RATE = 2; // Sube suciedad cada 10 ticks (approx)

const COIN_RATE = 30000; 
const COIN_AMOUNT = 5; 

// Save file will be set dynamically after getting userData path
let SAVE_FILE = null;

// ==========================================
// ESTADO DEL JUEGO
// ==========================================

let gameState = {
    petName: "Infotochi",
    life: 100,
    maxLife: 100,
    fun: 100,
    maxFun: 100,
    dirt: 0,
    maxDirt: 100,
    coins: 0,
    totalPlayTime: 0, 
    isSleeping: false,
    tickCount: 0,
    petX: null,
    petY: null,
    petOpacity: 0.95, // Pet transparency (0-1)
    hudOpacity: 0.95,  // HUD transparency (0-1)
    hudOrientation: 'horizontal', // 'horizontal' or 'vertical'
    birthTime: null,   // Timestamp de nacimiento (Date.now())
    currentStage: null, 
    petType: null,
    stats: {
        feedCount: 0,
        playCount: 0,
        cleanCount: 0,
        sellCount: 0
    },
    completedAchievements: [],
    claimedAchievements: []
};

// DOM Elements
const lifeBar = document.getElementById('life-bar');
const funBar = document.getElementById('fun-bar');
const dirtBar = document.getElementById('dirt-bar');
const coinDisplay = document.getElementById('coin-display');
const timeDisplay = document.getElementById('time-display');
const pet = document.getElementById('pet');
const speechBubble = document.getElementById('speech-bubble');

// Percentage texts
const lifePct = document.getElementById('life-pct');
const funPct = document.getElementById('fun-pct');
const dirtPct = document.getElementById('dirt-pct');

const eatBtn = document.getElementById('eat-btn');
const playBtn = document.getElementById('play-btn');
const cleanBtn = document.getElementById('clean-btn');
const rotateHudBtn = document.getElementById('rotate-hud-btn');
const settingsBtn = document.getElementById('settings-btn');
const achievementsBtn = document.getElementById('achievements-btn');

const foodMenu = document.getElementById('food-menu');
const gameMenu = document.getElementById('game-menu');
const cleanMenu = document.getElementById('clean-menu');

const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over-screen');

// Manure Elements
const poopBin = document.getElementById('poop-bin');
const sellManureBtn = document.getElementById('sell-manure-btn');

// Settings Modal Elements
const settingsModal = document.getElementById('settings-modal');
const petNameInput = document.getElementById('pet-name-input');
const petOpacitySlider = document.getElementById('pet-opacity-slider');
const petOpacityValue = document.getElementById('pet-opacity-value');
const hudOpacitySlider = document.getElementById('hud-opacity-slider');
const hudOpacityValue = document.getElementById('hud-opacity-value');
const saveGameBtn = document.getElementById('save-game-btn');
const exitGameBtn = document.getElementById('exit-game-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// Initialize - Now async to get userData path first
async function init() {
    // Get userData path from main process
    const userDataPath = await ipcRenderer.invoke('get-user-data-path');
    SAVE_FILE = path.join(userDataPath, 'savegame.dat');
    
    console.log('Save file location:', SAVE_FILE);
    
    loadGame(); 
    
    // Inicializar birthTime si no existe (primera vez)
    if (gameState.birthTime === null) {
        gameState.birthTime = Date.now();
        saveGame();
    }
    
    // Inicializar etapa actual
    updateCurrentStage();
    
    setupMenus();
    updateUI();
    startGameLoop();
    startCoinLoop();
    startFallingCoinLoop();
    
    // Randomize pet if not set
    // Verify or set petType to 'cat'
    if (gameState.petType !== 'cat') {
        gameState.petType = 'cat';
        saveGame();
    }
    
    const currentStage = gameState.currentStage || updateCurrentStage();
    const petConfig = PET_TYPES[gameState.petType];
    initAnimations(pet, gameState.petType, petConfig, currentStage.id); 
    setupInteractiveOverlay();
    setupHUDDragging();
    setupSettingsModal();
    applyHUDOrientation();
    
    // Restore pet position if saved
    if (gameState.petX !== null && gameState.petY !== null) {
        pet.style.transform = 'none';
        pet.style.left = `${gameState.petX}px`;
        pet.style.top = `${gameState.petY}px`;
    }
    
    // Apply saved opacities
    applyOpacities();
    
    // Auto-save
    setInterval(saveGame, 30000);
    window.addEventListener('beforeunload', saveGame);
}

// IPC for Click-Through Logic
const { ipcRenderer } = require('electron');

function setupInteractiveOverlay() {
    // Elements that should capture the mouse
    const interactiveSelectors = [
        '.hud-wrapper', 
        '#pet',
        '#game-over-screen:not(.hidden)',
        '.modal:not(.hidden)',
        '.falling-coin' // Ensure coins are always clickable
    ];

    // Helper to send state
    const setGameInteractive = (interactive) => {
        if (interactive) {
            ipcRenderer.send('set-ignore-mouse-events', false);
        } else {
            ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
        }
    };

    // We can listen to mousemove globally on document because 'forward: true' sends events 
    // to the web contents even when the window is ignoring mouse.
    // CSS 'pointer-events' management helps: body is none, elements are auto.
    
    window.addEventListener('mousemove', (e) => {
        // Check if we are hovering over any interactive element
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;

        // Using 'closest' to see if we are inside a know interactive zone
        const isInteractive = interactiveSelectors.some(selector => el.closest(selector));

        if (isInteractive) {
            setGameInteractive(true);
        } else {
            setGameInteractive(false);
        }
    });
}

// HUD Dragging Logic
function setupHUDDragging() {
    const hudWrapper = document.querySelector('.hud-wrapper');
    let isDraggingHUD = false;
    let hudDragOffset = { x: 0, y: 0 };

    hudWrapper.addEventListener('mousedown', (e) => {
        // Only drag with left button and not on interactive children (buttons, etc)
        if (e.button !== 0) return;
        
        // Don't drag if clicking on a button or menu
        if (e.target.closest('.action-btn-compact') || e.target.closest('.floating-menu')) {
            return;
        }

        isDraggingHUD = true;
        
        const rect = hudWrapper.getBoundingClientRect();
        hudDragOffset.x = e.clientX - rect.left;
        hudDragOffset.y = e.clientY - rect.top;
        
        hudWrapper.style.cursor = 'grabbing';
        
        // Switch from centered (transform) to absolute positioning
        hudWrapper.style.transform = 'none';
        hudWrapper.style.left = `${rect.left}px`;
        hudWrapper.style.top = `${rect.top}px`;
        
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingHUD) return;
        
        const x = e.clientX - hudDragOffset.x;
        const y = e.clientY - hudDragOffset.y;
        
        hudWrapper.style.left = `${x}px`;
        hudWrapper.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDraggingHUD) {
            isDraggingHUD = false;
            hudWrapper.style.cursor = 'move';
        }
    });
}

// Settings Modal Logic
function setupSettingsModal() {
    const hudWrapper = document.querySelector('.hud-wrapper');
    
    // Open modal
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        settingsModal.classList.remove('hidden');
        petNameInput.value = gameState.petName;
        
        // Update slider values
        petOpacitySlider.value = gameState.petOpacity * 100;
        petOpacityValue.textContent = Math.round(gameState.petOpacity * 100) + '%';
        hudOpacitySlider.value = gameState.hudOpacity * 100;
        hudOpacityValue.textContent = Math.round(gameState.hudOpacity * 100) + '%';
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Update pet name on input change
    petNameInput.addEventListener('input', () => {
        const newName = petNameInput.value.trim();
        if (newName) {
            gameState.petName = newName;
        }
    });
    
    // Pet opacity slider
    petOpacitySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        gameState.petOpacity = value;
        petOpacityValue.textContent = Math.round(value * 100) + '%';
        applyOpacities();
    });
    
    // HUD opacity slider
    hudOpacitySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        gameState.hudOpacity = value;
        hudOpacityValue.textContent = Math.round(value * 100) + '%';
        applyOpacities();
    });

    // Manual save
    saveGameBtn.addEventListener('click', () => {
        saveGame();
        // Visual feedback
        const originalText = saveGameBtn.textContent;
        saveGameBtn.textContent = '✅ Guardado!';
        saveGameBtn.style.background = 'rgba(76, 175, 80, 0.8)';
        setTimeout(() => {
            saveGameBtn.textContent = originalText;
            saveGameBtn.style.background = '';
        }, 1500);
    });

    // Exit app
    exitGameBtn.addEventListener('click', () => {
        saveGame();
        window.close();
    });

    // Close modal when clicking outside the content
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Achievement Modal Logic
    const achievementsModal = document.getElementById('achievements-modal');
    const achievementsList = document.getElementById('achievements-list');
    const closeAchievementsBtn = document.getElementById('close-achievements-btn');
    let activeAchievementTab = 'pending'; // 'pending' or 'unlocked'

    achievementsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        renderAchievements();
        achievementsModal.classList.remove('hidden');
    });

    closeAchievementsBtn.addEventListener('click', () => {
        achievementsModal.classList.add('hidden');
    });

    achievementsModal.addEventListener('click', (e) => {
        if (e.target === achievementsModal) {
            achievementsModal.classList.add('hidden');
        }
    });

    // Tab switching logic
    document.querySelectorAll('.achievements-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.achievements-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeAchievementTab = btn.dataset.tab;
            renderAchievements();
        });
    });

    function renderAchievements() {
        achievementsList.innerHTML = '';
        
        // Helper to get progress
        const getProgress = (ach) => {
            switch (ach.category) {
                case 'feed': return gameState.stats.feedCount || 0;
                case 'play': return gameState.stats.playCount || 0;
                case 'clean': return gameState.stats.cleanCount || 0;
                case 'sell': return gameState.stats.sellCount || 0;
                case 'time': return gameState.totalPlayTime || 0;
                case 'evolution': 
                    const stageMap = { 'egg': 0, 'baby': 1, 'child': 2, 'adult': 3 };
                    return stageMap[gameState.currentStage.id] || 0;
                default: return 0;
            }
        };

        // Filter achievements based on tab
        let filteredAch = ACHIEVEMENTS.filter(ach => {
            const isClaimed = gameState.claimedAchievements.includes(ach.id);
            const isCompleted = gameState.completedAchievements.includes(ach.id);
            
            if (activeAchievementTab === 'unlocked') {
                return isClaimed;
            } else {
                // Return those not claimed yet
                return !isClaimed;
            }
        });

        // Sort: for "Logros" tab, those COMPLETED (ready to claim) go FIRST.
        // Then, those with more progress % come next.
        if (activeAchievementTab === 'pending') {
            filteredAch.sort((a, b) => {
                const isCompA = gameState.completedAchievements.includes(a.id);
                const isCompB = gameState.completedAchievements.includes(b.id);
                
                if (isCompA && !isCompB) return -1;
                if (!isCompA && isCompB) return 1;
                
                // If both same completion status, sort by progress %
                const progA = Math.min(100, (getProgress(a) / a.target));
                const progB = Math.min(100, (getProgress(b) / b.target));
                return progB - progA;
            });
        }

        filteredAch.forEach(ach => {
            const isClaimed = gameState.claimedAchievements.includes(ach.id);
            const isCompleted = gameState.completedAchievements.includes(ach.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isClaimed ? 'unlocked' : (isCompleted ? 'completed-pending' : 'locked')}`;
            
            const progress = getProgress(ach);
            const pct = Math.min(100, Math.round((progress / ach.target) * 100));
            
            let actionHtml = '';
            if (isCompleted && !isClaimed) {
                actionHtml = `<button class="claim-btn" data-id="${ach.id}">Reclamar 💰</button>`;
            } else if (isClaimed) {
                actionHtml = `<div class="claimed-tag">Reclamado</div>`;
            }

            item.innerHTML = `
                <div class="ach-card-icon">${isClaimed ? '✅' : (isCompleted ? '⭐' : '🔒')}</div>
                <div class="ach-card-info">
                    <div class="ach-card-name">${ach.name}</div>
                    <div class="ach-card-desc">${ach.description}</div>
                    <div class="ach-card-progress-container">
                        <div class="ach-card-progress-bar" style="width: ${pct}%"></div>
                        <span class="ach-card-pct">${progress}/${ach.target}</span>
                    </div>
                </div>
                <div class="ach-card-reward-zone">
                    <div class="ach-card-reward">${ach.reward} 💰</div>
                    ${actionHtml}
                </div>
            `;
            achievementsList.appendChild(item);
        });

        // Add event listeners for claim buttons
        achievementsList.querySelectorAll('.claim-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = btn.dataset.id;
                if (achievementManager.claimReward(gameState, id)) {
                    renderAchievements();
                    updateUI();
                    saveGame();
                    playAnimation('anim-jump'); // Celebration
                }
            };
        });

        if (filteredAch.length === 0) {
            const empty = document.createElement('div');
            empty.style.textAlign = 'center';
            empty.style.padding = '20px';
            empty.style.color = '#777';
            empty.textContent = activeAchievementTab === 'unlocked' ? 'Aún no has reclamado ningún logro.' : '¡Increíble! Has completado todos los logros.';
            achievementsList.appendChild(empty);
        }
    }
}

// Apply opacity values to pet and HUD
function applyOpacities() {
    pet.style.opacity = gameState.petOpacity;
    document.querySelector('.hud-wrapper').style.opacity = gameState.hudOpacity;
}

// Apply HUD orientation class
function applyHUDOrientation() {
    const hudWrapper = document.querySelector('.hud-wrapper');
    if (gameState.hudOrientation === 'vertical') {
        hudWrapper.classList.add('vertical-hud');
    } else {
        hudWrapper.classList.remove('vertical-hud');
    }
    
    saveGame();
}

// ==========================================
// STAGE MANAGEMENT SYSTEM
// ==========================================

/**
 * Actualiza y retorna la etapa actual basada en totalPlayTime
 * Detecta transiciones de etapa y ejecuta onStageChange
 */
function updateCurrentStage() {
    const age = gameState.totalPlayTime;
    const stage = stageManager.getCurrentStage(age);
    
    // Detectar cambio de etapa
    const previousStageId = gameState.currentStage ? gameState.currentStage.id : null;
    const currentStageId = stage.id;
    
    if (previousStageId !== currentStageId) {
        gameState.currentStage = stage;
        onStageChange(stage, previousStageId);
    } else {
        gameState.currentStage = stage;
    }
    
    return stage;
}

/**
 * Callback cuando cambia la etapa de vida
 */
function onStageChange(newStage, previousStage) {
    console.log(`🎉 Stage changed: ${previousStage || 'none'} → ${newStage.id} (${newStage.name})`);
    
    // Animación de celebración
    playAnimation('anim-jump');
    
    // Actualizar visual inmediatamente
    updatePetVisual();

    // Check achievements for evolution
    achievementManager.checkAchievements(gameState, (ach) => updateUI());
}

const petEmoji = document.getElementById('pet-emoji');

/**
 * Actualiza las propiedades visuales del pet según su etapa actual
 */
function updatePetVisual() {
    const stage = gameState.currentStage || updateCurrentStage();
    const visual = stageManager.getVisualProperties(stage, gameState.totalPlayTime);
    const petConfig = PET_TYPES[gameState.petType];
    const isSpritesheet = petConfig && (stage.id !== 'egg');
    
    // Actualizar tamaño
    if (isSpritesheet) {
        const frameW = parseFloat(pet.style.getPropertyValue('--frame-w')) || 32;
        const frameH = parseFloat(pet.style.getPropertyValue('--frame-h')) || 32;
        const ratio = frameW / frameH;
        
        pet.style.height = `${visual.size}px`;
        pet.style.width = `${visual.size * ratio}px`;
        pet.style.setProperty('--pet-w', visual.size * ratio);
    } else {
        pet.style.width = `${visual.size}px`;
        pet.style.height = `${visual.size}px`;
        pet.style.setProperty('--pet-w', visual.size);
    }
    
    // Toggle background and border based on stage config
    if (visual.showBackground && !isSpritesheet) {
        pet.classList.add('square-pet');
        pet.style.border = ''; // Restore to CSS default
        pet.style.boxShadow = ''; // Restore to CSS default
        
        // Color base (puede ser sobreescrito por suciedad en updateUI)
        if (gameState.dirt <= 50) {
            pet.style.backgroundColor = visual.color;
        }
    } else {
        pet.classList.remove('square-pet');
        pet.style.backgroundColor = 'transparent';
        pet.style.border = 'none';
        pet.style.boxShadow = 'none';
    }

    // Toggle Face Visibility
    if (visual.showFace && !isSpritesheet) {
        pet.classList.add('pet-with-face');
        petEmoji.textContent = ''; // Hide emoji text
        
        // Manage decoration (Bottle for baby)
        let mouth = pet.querySelector('.mouth');
        let existingDeco = mouth.querySelector('.decoration');
        
        if (stage.id === 'baby') {
            if (!existingDeco) {
                let deco = document.createElement('span');
                deco.className = 'decoration';
                deco.textContent = '🍼';
                mouth.appendChild(deco);
            }
        } else if (existingDeco) {
            existingDeco.remove();
        }
    } else {
        pet.classList.remove('pet-with-face');
        
        // Handle spritesheet visibility vs emoji
        const petConfig = PET_TYPES[gameState.petType];
        if (petConfig && (stage.id !== 'egg')) {
            petEmoji.textContent = ''; // Hide emoji if we have a spritesheet pet
            pet.classList.add('pet-spritesheet');
        } else {
            petEmoji.style.fontSize = `${visual.fontSize}px`;
            petEmoji.textContent = visual.emoji;
            pet.classList.remove('pet-spritesheet');
            pet.style.backgroundImage = 'none';
        }
    }

    // Auto-adjust speech bubble position if needed (though CSS handles it)
}

/**
 * Dialogue Management
 */
let dialogueTimer = null;

function showPetMessage(text, duration = 4000) {
    if (dialogueTimer) {
        clearTimeout(dialogueTimer);
    }

    speechBubble.textContent = text;
    speechBubble.classList.remove('hidden');
    // Multi-staged visibility for CSS transition
    setTimeout(() => speechBubble.classList.add('visible'), 10);

    dialogueTimer = setTimeout(() => {
        speechBubble.classList.remove('visible');
        setTimeout(() => speechBubble.classList.add('hidden'), 300);
        dialogueTimer = null;
    }, duration);
}

function updatePeriodicDialogue() {
    // Only speak if alive and no active message
    if (gameState.life <= 0 || dialogueTimer) return;

    // Chance to speak (e.g., 20% every time this is called)
    if (Math.random() > 0.2) return;

    let category = 'idle';
    
    // Check priorities
    if (gameState.life < 30) category = 'hunger';
    else if (gameState.dirt > 70) category = 'dirty';
    else if (gameState.fun < 30) category = 'boredom';

    const messages = PET_MESSAGES[category];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    showPetMessage(message);
}

function setupMenus() {
    // Helper to create buttons
    const createBtn = (item, parent, action) => {
        const btn = document.createElement('div');
        btn.className = 'menu-item-btn';
        btn.textContent = item.icon;
        
        // Add price tag if item has a price
        if (item.price > 0) {
            const priceTag = document.createElement('div');
            priceTag.className = 'menu-item-price';
            priceTag.textContent = `$${item.price}`;
            btn.appendChild(priceTag);
        } else if (item.price === 0 && (item.id === 'quiz' || item.id === 'ball' || item.id === 'mud')) {
            // Optional: show "Free" or nothing for free items
            // For now, let's just keep it clean for free items
        }
        
        // Build title
        let parts = [item.name];
        if (item.price > 0) parts.push(`$${item.price}`);
        else parts.push('Gratis');

        if (item.life) parts.push(`Life ${item.life > 0 ? '+' : ''}${item.life}`);
        if (item.fun) parts.push(`Fun ${item.fun > 0 ? '+' : ''}${item.fun}`);
        if (item.dirt) parts.push(`Dirt +${item.dirt}`);
        if (item.dirtRemoval) parts.push(`Clean ${item.dirtRemoval}`);
        
        btn.title = parts.join(', ');
        btn.onclick = () => action(item);
        parent.appendChild(btn);
    };

    foodMenu.innerHTML = '';
    FOODS.forEach(item => createBtn(item, foodMenu, consumeItem));

    gameMenu.innerHTML = '';
    GAMES.forEach(item => createBtn(item, gameMenu, consumeItem));

    cleanMenu.innerHTML = '';
    CLEANING_ITEMS.forEach(item => createBtn(item, cleanMenu, cleanItem));
}

// Logic for consuming items
function consumeItem(item) {
    if (gameState.life <= 0) return; 
    
    if (item.price > 0 && gameState.coins < item.price) {
        animateNoMoney();
        return;
    }

    if (item.price > 0) gameState.coins -= item.price;

    gameState.life = Math.min(gameState.maxLife, Math.max(0, gameState.life + item.life));
    gameState.fun = Math.min(gameState.maxFun, Math.max(0, gameState.fun + item.fun));
    gameState.dirt = Math.min(gameState.maxDirt, Math.max(0, gameState.dirt + item.dirt));
    
    let anim = 'anim-shake'; // Default eat
    if (GAMES.some(g => g.id === item.id)) {
        // Play acts as "play" or "walk" animation
        playSpriteAnimation('play');
        gameState.stats.playCount = (gameState.stats.playCount || 0) + 1;
        achievementManager.checkAchievements(gameState, (ach) => updateUI());
        updateUI();
        closeAllMenus();
        return; 
    }
    
    // For food
    if (item.life < 0) {
       playAnimation('anim-wobble'); // Sick/Mud
    } else {
       // Food uses "eat" animation (CatLick for cat)
       playSpriteAnimation('eat');
       gameState.stats.feedCount = (gameState.stats.feedCount || 0) + 1;
       achievementManager.checkAchievements(gameState, (ach) => updateUI());
       updateUI();
       closeAllMenus();
       return;
    }
    
    playAnimation(anim);
    updateUI();
    closeAllMenus();
}

function cleanItem(item) {
    if (gameState.life <= 0) return;

    if (item.price > 0 && gameState.coins < item.price) {
        animateNoMoney();
        return;
    }

    if (item.price > 0) gameState.coins -= item.price;

    gameState.dirt = Math.max(0, gameState.dirt - item.dirtRemoval);
    // Cleaning acts as "eat" animation (CatLick) as requested
    playSpriteAnimation('eat');
    gameState.stats.cleanCount = (gameState.stats.cleanCount || 0) + 1;
    achievementManager.checkAchievements(gameState, (ach) => updateUI());
    updateUI();
    closeAllMenus();
}

function animateNoMoney() {
    coinDisplay.style.color = 'red';
    playAnimation('anim-wobble'); // Shake head no
    setTimeout(() => {
        coinDisplay.style.color = '#ffd700';
    }, 500);
}

function closeAllMenus() {
    foodMenu.classList.remove('visible');
    gameMenu.classList.remove('visible');
    cleanMenu.classList.remove('visible');
}

// Persistence Functions
function saveGame() {
    try {
        fs.writeFileSync(SAVE_FILE, JSON.stringify(gameState, null, 2));
    } catch (err) {
        console.error('Error al guardar:', err);
    }
}

function loadGame() {
    // If save file doesn't exist in userData, try to copy template from app directory
    if (!fs.existsSync(SAVE_FILE)) {
        const templatePath = path.join(__dirname, 'savegame.dat');
        if (fs.existsSync(templatePath)) {
            try {
                console.log('Copying initial savegame from template:', templatePath);
                fs.copyFileSync(templatePath, SAVE_FILE);
            } catch (err) {
                console.error('Error copying template savegame:', err);
            }
        }
    }
    
    // Load from userData directory
    if (fs.existsSync(SAVE_FILE)) {
        try {
            const data = fs.readFileSync(SAVE_FILE, 'utf8');
            const loadedState = JSON.parse(data);
            gameState = { ...gameState, ...loadedState };
            console.log('Game loaded from:', SAVE_FILE);
        } catch (err) {
            console.error('Error al cargar:', err);
        }
    } else {
        console.log('No savegame found, starting fresh');
    }
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Update UI
function updateUI() {
    lifeBar.style.width = `${gameState.life}%`;
    funBar.style.width = `${gameState.fun}%`;
    dirtBar.style.width = `${gameState.dirt}%`;
    
    // Update percentages
    lifePct.textContent = `${Math.round(gameState.life)}%`;
    funPct.textContent = `${Math.round(gameState.fun)}%`;
    dirtPct.textContent = `${Math.round(gameState.dirt)}%`;

    coinDisplay.textContent = gameState.coins;
    timeDisplay.textContent = formatTime(gameState.totalPlayTime);

    // Colors
    lifeBar.style.backgroundColor = gameState.life < 30 ? '#ff0000' : '#ff5f5f';
    funBar.style.backgroundColor = gameState.fun < 30 ? '#1e3a8a' : '#3b82f6';

    // Update pet visual based on current stage
    updatePetVisual();

    const stage = gameState.currentStage || updateCurrentStage();
    const visual = stageManager.getVisualProperties(stage, gameState.totalPlayTime);
    const petConfig = PET_TYPES[gameState.petType];
    const isSpritesheet = petConfig && (stage.id !== 'egg');

    if (gameState.life <= 0) {
        gameOverScreen.classList.remove('hidden');
        if (visual.showBackground && !isSpritesheet) pet.style.backgroundColor = '#555'; 
    } else {
        gameOverScreen.classList.add('hidden');
        // Color is managed by updatePetVisual, but dirt overrides if background is shown
        if (gameState.dirt > 50 && visual.showBackground && !isSpritesheet) {
            pet.style.backgroundColor = '#8d6e63';
        }
    }

    // Manure Bin Update
    updateManureBin();
    
    // Low Health Warning (Shake Window)
    if (gameState.life < 20 && !gameState.isSleeping) {
        if (!window._lastShake || Date.now() - window._lastShake > 2000) {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('shake-window');
            window._lastShake = Date.now();
        }
    }
}

function updateManureBin() {
    // Show bin if dirt > 20
    if (gameState.dirt > 20) {
        poopBin.style.display = 'block';
        // Fill level
        if (gameState.dirt > 80) {
            poopBin.textContent = '💩'; // Full pile
            poopBin.classList.add('full');
            poopBin.classList.add('anim-shake-bin');
            if (gameState.life > 0) sellManureBtn.style.display = 'block';
        } else {
            poopBin.textContent = '🗑️';
            poopBin.classList.remove('full');
            poopBin.classList.remove('anim-shake-bin');
            sellManureBtn.style.display = 'none';
        }
    } else {
        poopBin.style.display = 'none';
        sellManureBtn.style.display = 'none';
    }
}

// Game Loop
function startGameLoop() {
    setInterval(() => {
        if (gameState.life > 0) {
            gameState.totalPlayTime += (TICK_RATE / 1000);
            
            gameState.tickCount = (gameState.tickCount || 0) + 1;

            // Check for stage transitions
            updateCurrentStage();

            // Periodic Dialogue every 10 seconds approx
            if (gameState.tickCount % 10 === 0) {
                updatePeriodicDialogue();
            }

            // Decay every 5 seconds (instead of 1)
            if (gameState.tickCount % 5 === 0) {
                decreaseStats();
            }

            // Passive Dirt Accumulation (with stage multiplier)
            if (gameState.tickCount % 10 === 0) { 
                const stage = gameState.currentStage || updateCurrentStage();
                const dirtAmount = 1 * (stage.multipliers.dirtRate || 1);
                gameState.dirt = Math.min(gameState.maxDirt, gameState.dirt + dirtAmount);
            }
        }
        
        // Every 30 seconds check for time achievement
        if (gameState.tickCount % 30 === 0 && gameState.life > 0) {
            achievementManager.checkAchievements(gameState, (ach) => updateUI());
        }

        updateUI();
    }, TICK_RATE);
}

function startCoinLoop() {
    setInterval(() => {
        if (gameState.life > 0) { 
            gameState.coins += COIN_AMOUNT;
            updateUI();
        }
    }, COIN_RATE);
}

// Falling Coin System
function startFallingCoinLoop() {
    // Random span between 15 and 45 seconds
    const loop = () => {
        const time = Math.random() * 40000 + 30000; // 30-70 seconds
        setTimeout(() => {
            if (gameState.life > 0) spawnFallingCoin();
            loop();
        }, time);
    };
    loop();
}

function spawnFallingCoin() {
    const coin = document.createElement('div');
    coin.textContent = '💰';
    coin.className = 'falling-coin';
    
    // Random X position across the entire screen width
    const margin = 50; // Margin from edges
    const randomX = Math.random() * (window.innerWidth - margin * 2) + margin; 
    coin.style.left = `${randomX}px`;

    let collected = false;
    
    coin.onclick = (e) => {
        e.stopPropagation();
        console.log('Coin clicked!'); // Debug
        if (!collected) {
            collected = true;
            const reward = 15;
            gameState.coins += reward;
            updateUI();
            
            // Create reward popup at coin position
            const rewardPopup = document.createElement('div');
            rewardPopup.className = 'reward-popup';
            rewardPopup.textContent = `+${reward}`;
            rewardPopup.style.left = coin.style.left;
            rewardPopup.style.top = coin.getBoundingClientRect().top + 'px';
            
            document.querySelector('.container').appendChild(rewardPopup);
            
            // Remove coin immediately
            coin.remove();
            
            // Remove popup after animation (1s)
            setTimeout(() => {
                if (rewardPopup.parentNode) {
                    rewardPopup.remove();
                }
            }, 1000);
        }
    };

    // Remove after 10 seconds (5s fall + 5s wait at bottom)
    setTimeout(() => {
        if (coin.parentNode && !collected) {
            coin.remove();
        }
    }, 10000);

    document.querySelector('.container').appendChild(coin);
}

function decreaseStats() {
    const stage = gameState.currentStage || updateCurrentStage();
    const mult = stage.multipliers;
    
    // Apply stage multipliers to decay amounts
    const lifeDrain = LIFE_DECAY_AMOUNT * mult.lifeDrain;
    const funDrain = FUN_DECAY_AMOUNT * mult.funDrain;
    
    gameState.life = Math.max(0, gameState.life - lifeDrain);
    gameState.fun = Math.max(0, gameState.fun - funDrain);
}

function resetGame() {
    gameState = {
        petName: "Infotochi",
        life: 100,
        maxLife: 100,
        fun: 100,
        maxFun: 100,
        dirt: 0,
        maxDirt: 100,
        coins: 0,
        totalPlayTime: 0, 
        isSleeping: false,
        tickCount: 0,
        petX: null,
        petY: null,
        petOpacity: 0.95,
        hudOpacity: 0.95,
        birthTime: Date.now(),
        currentStage: null,
        petType: null
    };
    
    updateCurrentStage();
    
    // Randomize pet for new game
    const types = Object.keys(PET_TYPES);
    gameState.petType = types[Math.floor(Math.random() * types.length)];
    const petConfig = PET_TYPES[gameState.petType];
    initAnimations(pet, gameState.petType, petConfig);
    
    saveGame();
    updateUI();
    playAnimation('anim-jump');
    
    // Reset pet position
    pet.style.transform = 'translate(-50%, -50%)';
    pet.style.left = '50%';
    pet.style.top = '50%';
    
    // Reset opacities
    applyOpacities();
}

// Button Actions
restartBtn.addEventListener('click', resetGame);

// Sell Manure
sellManureBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState.dirt > 80) {
        gameState.coins += 12; // Reward for selling manure
        gameState.dirt = 20; // Cleans it a bit but not fully
        
        // Track stats and check achievements
        gameState.stats.sellCount = (gameState.stats.sellCount || 0) + 1;
        achievementManager.checkAchievements(gameState, (ach) => updateUI());
        
        playAnimation('anim-spin');
        updateUI();
    }
});

eatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState.life <= 0) return;
    closeAllMenus();
    foodMenu.classList.toggle('visible');
});

playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState.life <= 0) return;
    closeAllMenus();
    gameMenu.classList.toggle('visible');
});

cleanBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState.life <= 0) return;
    closeAllMenus();
    cleanMenu.classList.toggle('visible');
});

rotateHudBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    gameState.hudOrientation = gameState.hudOrientation === 'vertical' ? 'horizontal' : 'vertical';
    applyHUDOrientation();
});

// Close menus when clicking outside
// Draggable Pet Logic
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

pet.addEventListener('mousedown', (e) => {
    // Only drag with left mouse button
    if (e.button !== 0) return;
    
    isDragging = true;
    
    // Get pet current position (handling transforms is tricky, better to switch to top/left)
    const rect = pet.getBoundingClientRect();
    
    // Calculate offset from mouse to top-left of element
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    pet.style.cursor = 'grabbing';
    
    // Remove transform centering if it exists, to switch to absolute positioning
    // We already moved to absolute in CSS, but check standard inline styles
    // If it has transform translate(-50%, -50%), we need to adjust or remove it
    // For simplicity, let's remove the CSS transform class if present and rely on top/left
    pet.style.transform = 'none';
    pet.style.left = `${rect.left}px`;
    pet.style.top = `${rect.top}px`;
    
    e.stopPropagation(); // Prevent closing menus? Or maybe not needed
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    pet.style.left = `${x}px`;
    pet.style.top = `${y}px`;
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        pet.style.cursor = 'grab';
        
        // Save pet position
        const rect = pet.getBoundingClientRect();
        gameState.petX = rect.left;
        gameState.petY = rect.top;
        saveGame();
    }
});

// Close menus logic update
document.addEventListener('click', (e) => {
    if (isDragging) return; // Don't close if we just finished dragging (mouseup fires click usually, but keep safe)

    // If click is NOT on a button AND NOT on a menu AND NOT on a HUD element (except background)
    // Actually user wants "click outside closes", so clicking on HUD background is fine to keep open? 
    // Usually clicking stats doesn't close menu. Clicking "Eat" toggles it.
    
    const isControl = e.target.closest('.action-btn');
    const isMenu = e.target.closest('.floating-menu');
    
    if (!isControl && !isMenu) {
        closeAllMenus();
        
        // Pet bounce interaction
        if ((e.target.id === 'pet' || e.target.closest('#pet')) && gameState.life > 0) {
            playAnimation('anim-bounce');
        }
    }
});

init();
