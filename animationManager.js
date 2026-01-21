const IDLE_ANIMATIONS = ['anim-bounce', 'anim-wobble', 'anim-spin', 'anim-jump'];

let petElement = null;
let isAnimating = false;
let currentPetType = null;
let petConfig = null;

function initAnimations(element, type, config, stageId = null) {
    petElement = element;
    currentPetType = type;
    petConfig = config;
    
    // Clear old state
    petElement.classList.remove('pet-spritesheet', 'sprite-idle', 'sprite-action');
    
    // Only use spritesheets if NOT in egg stage
    if (petConfig && stageId !== 'egg') {
        petElement.classList.add('pet-spritesheet');
        setSpriteIdle();
    }
    
    startIdleLoop();
}

function setSpriteIdle() {
    if (!petElement || !petConfig) return;
    
    const idleAnim = petConfig.animations.idle;
    const path = `animations/${petConfig.folder}/${idleAnim.name}/${idleAnim.name}.png`;
    
    petElement.style.backgroundImage = `url('${path}')`;
    petElement.style.setProperty('--frames', idleAnim.frames);
    petElement.style.setProperty('--frame-w', idleAnim.frameWidth || 32);
    petElement.style.setProperty('--frame-h', idleAnim.frameHeight || 32);
    
    petElement.classList.remove('sprite-action');
    petElement.classList.add('sprite-idle');
}

function startIdleLoop() {
    const randomInterval = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
    
    setTimeout(() => {
        if (!isAnimating) {
            playRandomIdle();
        }
        startIdleLoop(); // Recurse
    }, randomInterval);
}

function playRandomIdle() {
    // If we have spritesheets, we just let the idle animation run, 
    // or we could trigger a "move" animation if we had one.
    // For now, let's keep the existing logic for non-spritesheet parts
    if (!petConfig) {
        const randomAnim = IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
        playAnimation(randomAnim);
    }
}

function playSpriteAnimation(actionType) {
    if (!petElement || !petConfig) return;
    
    const anim = petConfig.animations[actionType] || petConfig.animations.idle;
    const path = `animations/${petConfig.folder}/${anim.name}/${anim.name}.png`;
    
    petElement.classList.remove('sprite-idle');
    petElement.style.backgroundImage = `url('${path}')`;
    petElement.style.setProperty('--frames', anim.frames);
    petElement.style.setProperty('--frame-w', anim.frameWidth || 32);
    petElement.style.setProperty('--frame-h', anim.frameHeight || 32);
    
    // Trigger reflow
    void petElement.offsetWidth;
    
    petElement.classList.add('sprite-action');
    isAnimating = true;

    // Reset to idle after animation
    const duration = 1000; 
    setTimeout(() => {
        setSpriteIdle();
        isAnimating = false;
    }, duration);
}

function playAnimation(animClass) {
    if (!petElement) return;

    // If it's a spritesheet pet, we might want to map some OLD animations to spritesheet ones
    if (petConfig) {
        if (animClass === 'anim-jump') {
            playSpriteAnimation('play');
            return;
        }
        if (animClass === 'anim-shake') {
            playSpriteAnimation('eat');
            return;
        }
    }

    // Reset current classes but keep base ones
    const baseClasses = ['square-pet', 'pet-spritesheet', 'sprite-idle', 'sprite-action'];
    const currentClasses = Array.from(petElement.classList);
    currentClasses.forEach(c => {
        if (!baseClasses.includes(c) && c.startsWith('anim-')) {
            petElement.classList.remove(c);
        }
    });
    
    // Trigger reflow
    void petElement.offsetWidth;
    
    petElement.classList.add(animClass);
    isAnimating = true;

    const duration = 1000; 
    setTimeout(() => {
        petElement.classList.remove(animClass);
        isAnimating = false;
    }, duration);
}

module.exports = {
    initAnimations,
    playAnimation,
    playSpriteAnimation
};
