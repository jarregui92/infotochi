const { ACHIEVEMENTS } = require('./achievements');

class AchievementManager {
    constructor() {
        this.notificationQueue = [];
        this.isNotifying = false;
    }

    /**
     * Checks if any achievements should be unlocked
     * @param {object} gameState 
     * @param {function} onUnlock Callback when an achievement is unlocked
     */
    checkAchievements(gameState, onUnlock) {
        if (!gameState.stats) gameState.stats = this.initStats();
        if (!gameState.completedAchievements) gameState.completedAchievements = [];
        if (!gameState.claimedAchievements) gameState.claimedAchievements = [];

        ACHIEVEMENTS.forEach(achievement => {
            // Already claimed? Skip.
            if (gameState.claimedAchievements.includes(achievement.id)) return;
            // Already marked as completed? Skip.
            if (gameState.completedAchievements.includes(achievement.id)) return;

            let currentProgress = 0;
            switch (achievement.category) {
                case 'feed': currentProgress = gameState.stats.feedCount || 0; break;
                case 'play': currentProgress = gameState.stats.playCount || 0; break;
                case 'clean': currentProgress = gameState.stats.cleanCount || 0; break;
                case 'sell': currentProgress = gameState.stats.sellCount || 0; break;
                case 'time': currentProgress = gameState.totalPlayTime || 0; break;
                case 'evolution': 
                    const stageMap = { 'egg': 0, 'baby': 1, 'child': 2, 'adult': 3 };
                    currentProgress = stageMap[gameState.currentStage.id] || 0;
                    break;
            }

            if (currentProgress >= achievement.target) {
                this.markCompleted(gameState, achievement, onUnlock);
            }
        });
    }

    markCompleted(gameState, achievement, onUnlock) {
        gameState.completedAchievements.push(achievement.id);
        
        console.log(`✨ LOGRO COMPLETADO (Pendiente Reclamar): ${achievement.name}`);
        
        this.showNotification(achievement);
        
        if (onUnlock) onUnlock(achievement);
    }

    claimReward(gameState, achievementId) {
        if (gameState.claimedAchievements.includes(achievementId)) return false;
        
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return false;

        // Move from completed to claimed
        gameState.claimedAchievements.push(achievementId);
        gameState.completedAchievements = gameState.completedAchievements.filter(id => id !== achievementId);
        
        // Give reward
        gameState.coins += achievement.reward;
        return true;
    }

    showNotification(achievement) {
        this.notificationQueue.push(achievement);
        if (!this.isNotifying) {
            this.processNotificationQueue();
        }
    }

    processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isNotifying = false;
            return;
        }

        this.isNotifying = true;
        const achievement = this.notificationQueue.shift();
        
        const container = document.querySelector('.container');
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="ach-icon">🏆</div>
            <div class="ach-text">
                <div class="ach-title">¡Logro Desbloqueado!</div>
                <div class="ach-name">${achievement.name}</div>
                <div class="ach-reward">+${achievement.reward} 💰</div>
            </div>
        `;

        container.appendChild(notification);

        // Animation duration matches CSS
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                this.processNotificationQueue();
            }, 500);
        }, 4000);
    }

    initStats() {
        return {
            feedCount: 0,
            playCount: 0,
            cleanCount: 0,
            sellCount: 0
        };
    }
}

module.exports = new AchievementManager();
