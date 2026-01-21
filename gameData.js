const petConfig = require('./petConfig.json');

module.exports = {
    PET_TYPES: petConfig.PET_TYPES,
    FOODS: [
        { id: 'cookie', icon: '🍪', name: 'Galleta', life: 10, fun: 0, dirt: 5, price: 5 },
        { id: 'icecream', icon: '🍦', name: 'Helado', life: 20, fun: 10, dirt: 5, price: 20 },
        { id: 'meat', icon: '🥩', name: 'Carne', life: 40, fun: 0, dirt: 10, price: 40 }
    ],
    GAMES: [
        { id: 'ball', icon: '🎾', name: 'Pelota', life: 0, fun: 15, dirt: 5, price: 0 },
        { id: 'mud', icon: '🐷', name: 'Barro', life: -5, fun: 30, dirt: 40, price: 0 },
        { id: 'quiz', icon: '🧩', name: 'Puzzle', life: 0, fun: 35, dirt: 0, price: 25 }
    ],
    CLEANING_ITEMS: [
        { id: 'wipe', icon: '🧻', name: 'Toallita', dirtRemoval: 20, price: 5 },
        { id: 'water', icon: '🚿', name: 'Agua', dirtRemoval: 50, price: 15 },
        { id: 'bath', icon: '🛁', name: 'Bañera', dirtRemoval: 100, price: 35 }
    ],
    PET_MESSAGES: {
        hunger: [
            "¡Tengo mucha hambre!",
            "¿Me das algo de comer?",
            "¡Mi pancita hace ruido!",
            "¡Necesito comida pronto!"
        ],
        boredom: [
            "¡Estoy muy aburrido!",
            "¿Jugamos a algo?",
            "¡Quiero divertirme!",
            "¿Me pones un juego?"
        ],
        dirty: [
            "¡Me siento muy sucio!",
            "¡Necesito un buen baño!",
            "¿Me puedes limpiar?",
            "¡Huelo un poco mal...!"
        ],
        idle: [
            "¡Hola, qué tal!",
            "Me gusta estar contigo.",
            "¡Hoy es un gran día!",
            "Zzz... oh, hola!",
            "¡Qué divertido es esto!"
        ]
    }
};
