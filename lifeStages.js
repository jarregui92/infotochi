/**
 * LIFE STAGES CONFIGURATION
 * 
 * Define aquí todas las etapas de vida de la mascota.
 * Cada etapa tiene:
 * - Rango de edad (en segundos de totalPlayTime)
 * - Multiplicadores de consumo de stats
 * - Propiedades visuales (tamaño, color, emoji)
 */

const LIFE_STAGES = [
  {
    id: 'egg',
    name: 'Huevo',
    emoji: '🥚',
    minAge: 0,              // segundos
    maxAge: 600,            // 10 minutos
    multipliers: {
      lifeDrain: 0,         // No consume vida
      funDrain: 0,          // No consume diversión
      dirtRate: 0.1         // Se ensucia muy lentamente (10% normal)
    },
    visual: {
      baseSize: 80,         // Tamaño en px
      color: '#f5f5dc',     // Beige (color huevo)
      fontSize: 48,          // Tamaño del emoji
      showBackground: false  // Solo emoji, sin fondo
    }
  },
  {
    id: 'baby',
    name: 'Bebé',
    emoji: '🍼',
    minAge: 600,            // 10 minutos
    maxAge: 7200,           // 2 horas (120 minutos)
    multipliers: {
      lifeDrain: 2.0,       // Consume el doble de vida
      funDrain: 1.5,        // Consume 50% más diversión
      dirtRate: 2.0         // Se ensucia el doble
    },
    visual: {
      baseSize: 30,         // Empieza muy pequeño
      growthRate: 0.015,    // Crece rápido (aprox 1.5px por minuto)
      color: '#ffc0cb',     // Rosa bebé
      fontSize: 20,         // Font size for decoration
      showBackground: true, 
      showFace: true        // Mostrar ojos y boca (biberón)
    }
  },
  {
    id: 'child',
    name: 'Niño',
    emoji: '🎮',
    minAge: 7200,           // 2 horas
    maxAge: 21600,          // 6 horas
    multipliers: {
      lifeDrain: 1.2,       // Consume un poco más de vida (activo)
      funDrain: 1.3,        // Necesita más entretenimiento
      dirtRate: 1.5         // Se ensucia más (juega mucho)
    },
    visual: {
      baseSize: 115,
      color: '#87ceeb',     // Azul cielo
      fontSize: 70,
      showBackground: true,
      showFace: true
    }
  },
  {
    id: 'adult',
    name: 'Adulto',
    emoji: '🎯',
    minAge: 21600,          // 6 horas
    maxAge: Infinity,       // Sin límite
    multipliers: {
      lifeDrain: 1.0,       // Consumo normal
      funDrain: 1.0,        // Consumo normal
      dirtRate: 1.0         // Suciedad normal
    },
    visual: {
      baseSize: 120,        // Tamaño base adulto
      color: '#2b87a0ff',     // Azul característico
      fontSize: 80,
      growthRate: 0.0008,   // Crece lentamente con el tiempo (px por segundo)
      showBackground: true,
      showFace: true
    }
  }
];

module.exports = { LIFE_STAGES };
