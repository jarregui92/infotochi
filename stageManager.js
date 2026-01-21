/**
 * STAGE MANAGER MODULE
 * 
 * Gestiona la lógica de las etapas de vida de la mascota.
 * Provee métodos para determinar la etapa actual, obtener multiplicadores
 * y calcular propiedades visuales basadas en la edad.
 */

const { LIFE_STAGES } = require('./lifeStages');

class StageManager {
  /**
   * Obtiene la etapa de vida correspondiente a una edad dada
   * @param {number} age - Edad en segundos (totalPlayTime)
   * @returns {object} Etapa de vida actual
   */
  getCurrentStage(age) {
    const stage = LIFE_STAGES.find(stage => 
      age >= stage.minAge && age < stage.maxAge
    );
    
    // Si no encuentra etapa (por algún error), retornar la última
    return stage || LIFE_STAGES[LIFE_STAGES.length - 1];
  }

  /**
   * Obtiene los multiplicadores de stats de una etapa
   * @param {object} stage - Etapa de vida
   * @returns {object} Multiplicadores { lifeDrain, funDrain, dirtRate }
   */
  getStageMultipliers(stage) {
    return stage.multipliers;
  }

  /**
   * Calcula las propiedades visuales del pet según la etapa y edad
   * @param {object} stage - Etapa actual
   * @param {number} age - Edad en segundos
   * @returns {object} Propiedades visuales { size, color, emoji, fontSize }
   */
  getVisualProperties(stage, age) {
    let size = stage.visual.baseSize;
    
    // Para etapas con crecimiento continuo (growthRate)
    if (stage.visual.growthRate) {
      const timeInStage = age - stage.minAge;
      size += timeInStage * stage.visual.growthRate;
      
      // Límite máximo de tamaño (para no crecer infinitamente)
      size = Math.min(size, 200);
    }
    
    return {
      size: Math.round(size),
      color: stage.visual.color || '#61dafb',
      emoji: stage.emoji,
      fontSize: stage.visual.fontSize || 48,
      showBackground: stage.visual.showBackground !== false, // Default true
      showFace: stage.visual.showFace === true // Default false (for egg)
    };
  }

  /**
   * Obtiene todas las etapas disponibles (útil para debug/UI)
   * @returns {array} Array con todas las etapas
   */
  getAllStages() {
    return LIFE_STAGES;
  }

  /**
   * Formatea la edad en un string legible
   * @param {number} age - Edad en segundos
   * @returns {string} Edad formateada (ej: "2h 15m")
   */
  formatAge(age) {
    const hours = Math.floor(age / 3600);
    const minutes = Math.floor((age % 3600) / 60);
    const seconds = Math.floor(age % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Exportar una instancia única (singleton)
module.exports = new StageManager();
