const ACHIEVEMENTS = [
    // FEEDING
    { id: 'feed_1', category: 'feed', target: 1, name: 'Primer Bocado', description: 'Dale de comer 1 vez', reward: 10 },
    { id: 'feed_10', category: 'feed', target: 10, name: 'Gourmet Junior', description: 'Dale de comer 10 veces', reward: 50 },
    { id: 'feed_50', category: 'feed', target: 50, name: 'Chef de Mascotas', description: 'Dale de comer 50 veces', reward: 150 },
    { id: 'feed_100', category: 'feed', target: 100, name: 'Hambre Insaciable', description: 'Dale de comer 100 veces', reward: 300 },
    { id: 'feed_200', category: 'feed', target: 200, name: 'Crítico Gastronómico', description: 'Dale de comer 200 veces', reward: 500 },
    { id: 'feed_500', category: 'feed', target: 500, name: 'Banquete Real', description: 'Dale de comer 500 veces', reward: 1000 },
    { id: 'feed_1000', category: 'feed', target: 1000, name: 'Dios de la Gula', description: 'Dale de comer 1000 veces', reward: 2500 },

    // PLAYING
    { id: 'play_1', category: 'play', target: 1, name: 'Primer Juego', description: 'Juega 1 vez', reward: 10 },
    { id: 'play_10', category: 'play', target: 10, name: 'Amigo de Juegos', description: 'Juega 10 veces', reward: 50 },
    { id: 'play_50', category: 'play', target: 50, name: 'Entrenador Junior', description: 'Juega 50 veces', reward: 150 },
    { id: 'play_100', category: 'play', target: 100, name: 'Energía Pura', description: 'Juega 100 veces', reward: 300 },
    { id: 'play_200', category: 'play', target: 200, name: 'Atleta Olímpico', description: 'Juega 200 veces', reward: 500 },
    { id: 'play_500', category: 'play', target: 500, name: 'Campeón Mundial', description: 'Juega 500 veces', reward: 1000 },
    { id: 'play_1000', category: 'play', target: 1000, name: 'Leyenda del Juego', description: 'Juega 1000 veces', reward: 2500 },

    // CLEANING
    { id: 'clean_1', category: 'clean', target: 1, name: 'Higiene Básica', description: 'Limpia 1 vez', reward: 10 },
    { id: 'clean_10', category: 'clean', target: 10, name: 'Baño Semanal', description: 'Limpia 10 veces', reward: 50 },
    { id: 'clean_50', category: 'clean', target: 50, name: 'Experto en Burbujas', description: 'Limpia 50 veces', reward: 150 },
    { id: 'clean_100', category: 'clean', target: 100, name: 'Brillo Extremo', description: 'Limpia 100 veces', reward: 300 },
    { id: 'clean_200', category: 'clean', target: 200, name: 'Obsesión por la Limpieza', description: 'Limpia 200 veces', reward: 500 },
    { id: 'clean_500', category: 'clean', target: 500, name: 'Maestro del Jabón', description: 'Limpia 500 veces', reward: 1000 },
    { id: 'clean_1000', category: 'clean', target: 1000, name: 'Sanitizador Supremo', description: 'Limpia 1000 veces', reward: 2500 },

    // MANURE SALES
    { id: 'sell_1', category: 'sell', target: 1, name: 'Pequeño Comerciante', description: 'Vende abono 1 vez', reward: 20 },
    { id: 'sell_10', category: 'sell', target: 10, name: 'Negocio de Abono', description: 'Vende abono 10 veces', reward: 100 },
    { id: 'sell_50', category: 'sell', target: 50, name: 'Magnate del Fertilizante', description: 'Vende abono 50 veces', reward: 300 },
    { id: 'sell_100', category: 'sell', target: 100, name: 'Imperio de Cacas', description: 'Vende abono 100 veces', reward: 600 },

    // EVOLUTION
    { id: 'evo_baby', category: 'evolution', target: 1, name: '¡Ha Nacido!', description: 'Llega a la etapa Bebé', reward: 50 },
    { id: 'evo_child', category: 'evolution', target: 2, name: 'Creciendo Rápido', description: 'Llega a la etapa Niño', reward: 100 },
    { id: 'evo_adult', category: 'evolution', target: 3, name: 'Madurez', description: 'Llega a la etapa Adulto', reward: 200 },

    // TIME
    { id: 'time_1h', category: 'time', target: 3600, name: 'Primera Hora', description: 'Juega durante 1 hora', reward: 100 },
    { id: 'time_10h', category: 'time', target: 36000, name: 'Dedicación', description: 'Juega durante 10 horas', reward: 500 },
    { id: 'time_50h', category: 'time', target: 180000, name: 'Vida Plena', description: 'Juega durante 50 horas', reward: 2000 }
];

module.exports = { ACHIEVEMENTS };
