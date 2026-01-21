# 👾 Infotochi

[![Electron](https://img.shields.io/badge/Electron-v13+-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Infotochi** es una mascota virtual interactiva para escritorio diseñada para acompañarte mientras trabajas. Vive en un overlay transparente sobre tus ventanas, permitiéndote cuidar de tu pequeño amigo sin interrumpir tu flujo de trabajo.

## ✨ Características Principales

### 🐣 Evolución Dinámica
Tu mascota no es estática; crece contigo. El ciclo de vida incluye 4 etapas biológicas:
- **Huevo:** El comienzo de todo. Seguro y tranquilo.
- **Bebé:** Requiere atención constante y cuidados intensivos.
- **Niño:** Activo, curioso y con ganas de jugar.
- **Adulto:** Tu compañero definitivo con un ritmo de vida equilibrado.

### 📊 HUD Inteligente y Personalizable
- **Doble Orientación:** Alterna entre una vista **Horizontal** (barras visuales) y **Vertical** (porcentajes compactos).
- **Control de Transparencia:** Ajusta la opacidad de la mascota y del HUD de forma independiente para que no te estorbe.
- **Draggable:** Tanto la mascota como el HUD pueden arrastrarse y colocarse en cualquier lugar de la pantalla.

### 💬 Comunicación Directa
- **Globos de Texto:** El Infotochi te hablará para pedirte comida, un baño o simplemente para saludarte. El sistema detecta automáticamente sus necesidades críticas y las prioriza en el diálogo.

### 💰 Economía y Cuidados
- **Sistema de Tienda:** Usa las monedas que ganas para comprar comida gourmet, juegos o artículos de limpieza.
- **Ingresos:** Gana monedas de forma pasiva por el tiempo jugado o atrapa las **Monedas Caídas** que aparecen aleatoriamente por la pantalla.
- **Venta de Abono:** Mantén el entorno limpio y vende los desechos de tu mascota para obtener ingresos extra.

### 💾 Persistencia de Datos
- Guardado automático local en `savegame.dat`.
- Recuperación instantánea del estado de salud, edad, posición en pantalla y configuraciones de UI.

---

## 🛠️ Instalación y Uso

### Requisitos Previos
Necesitas tener instalado [Node.js](https://nodejs.org/) en tu equipo.

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jarregui92/infotochi.git
   cd infotochi
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación:**
   ```bash
   npm start
   ```

---

## 🎨 Personalización
Puedes editar el archivo `gameData.js` para:
- Agregar nuevos tipos de comida o juegos.
- Modificar el diccionario de frases de la mascota (`PET_MESSAGES`).
- Ajustar los precios y beneficios de los objetos.

---

## 📄 Licencia
Este proyecto es de código abierto. Siéntete libre de clonarlo, mejorarlo y compartirlo.

---

*Cuidar un Infotochi es una responsabilidad... ¡pero una muy divertida!* 🐾
