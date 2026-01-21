const IDLE_ANIMATIONS = ['anim-bounce', 'anim-wobble', 'anim-spin', 'anim-jump'];

let petElement = null;
let isAnimating = false;

function initAnimations(element) {
    petElement = element;
    startIdleLoop();
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
    const randomAnim = IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
    playAnimation(randomAnim);
}

function playAnimation(animClass) {
    if (!petElement) return;

    // Reset current animations
    petElement.className = 'square-pet'; // Keep base class
    
    // Trigger reflow to restart animation if it's the same
    void petElement.offsetWidth;
    
    petElement.classList.add(animClass);
    isAnimating = true;

    // Remove class after animation ends (approx 1s for most)
    // We listen for animationend event ideally, but timeout is safer for now
    // to avoid stuck states if CSS changes
    const duration = 1000; 
    setTimeout(() => {
        petElement.classList.remove(animClass);
        isAnimating = false;
    }, duration);
}

module.exports = {
    initAnimations,
    playAnimation
};
