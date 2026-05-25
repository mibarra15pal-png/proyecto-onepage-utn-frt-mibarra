// Obtención de elementos del DOM
const canvas = document.getElementById('canvasGrowth');
const ctx = canvas.getContext('2d');
const angleSlider = document.getElementById('angleSlider');

// Configuración de dimensiones y anclaje inicial
const startX = canvas.width / 2;
const startY = canvas.height - 20;
const initialLength = 90;
const initialAngle = -Math.PI / 2; // Dirección: Recto hacia arriba
const maxDepth = 8; // Niveles de ramificación recursiva

// Variables para controlar la animación del crecimiento
let currentMaxDepth = 0; // Nivel de profundidad que se está animando actualmente
let lastTime = 0;
const growthSpeed = 200; // Tiempo en milisegundos entre la aparición de cada nivel de ramas

// Función recursiva de dibujo (Dibuja solo hasta la profundidad permitida en la animación)
function drawGrowthSystem(x, y, length, angle, depth, angleOffset, allowedDepth) {
    // Si llegamos al final del árbol o superamos el límite actual de la animación, frenamos
    if (depth === 0 || (maxDepth - depth) > allowedDepth) return;

    const endX = x + length * Math.cos(angle);
    const endY = y + length * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    
    // Paleta de color Adaptogenia
    const greenTone = 60 + (depth * 15);
    ctx.strokeStyle = `rgb(46, ${greenTone}, 56)`; 
    ctx.lineWidth = depth * 1.8; 
    ctx.stroke();

    const reduction = 0.78;

    // Ramificación recursiva binaria
    drawGrowthSystem(endX, endY, length * reduction, angle - angleOffset, depth - 1, angleOffset, allowedDepth);
    drawGrowthSystem(endX, endY, length * reduction, angle + angleOffset, depth - 1, angleOffset, allowedDepth);
}

// Bucle de animación (Game Loop elemental)
function animateGrowth(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    // Si pasó el tiempo configurado, habilitamos un nuevo nivel de ramas
    if (elapsed > growthSpeed && currentMaxDepth < maxDepth) {
        currentMaxDepth++;
        lastTime = timestamp;
    }

    // Limpiar lienzo y redibujar la estructura hasta el nivel actual
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentAngleOffset = parseFloat(angleSlider.value);
    drawGrowthSystem(startX, startY, initialLength, initialAngle, maxDepth, currentAngleOffset, currentMaxDepth);

    // Si la animación no terminó, seguir pidiendo fotogramas al navegador
    if (currentMaxDepth < maxDepth) {
        requestAnimationFrame(animateGrowth);
    }
}

// Función encargada de reiniciar la animación cuando el usuario mueva el slider
function resetAndAnimate() {
    currentMaxDepth = 0;
    lastTime = 0;
    requestAnimationFrame(animateGrowth);
}

// Escuchador de eventos para interactividad
angleSlider.addEventListener('input', resetAndAnimate);

// Iniciar la animación por primera vez al cargar el sitio web
resetAndAnimate();
