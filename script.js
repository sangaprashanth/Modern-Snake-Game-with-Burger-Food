// Game variables and DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const modal = document.getElementById('gameOverModal');
const finalScoreElement = document.getElementById('finalScore');
const newGameBtn = document.getElementById('newGameBtn');

// Game state variables
let gridSize;
let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let food = {};
let score = 0;
let gameRunning = false;
let gameStarted = false;

// Responsive canvas sizing
function resizeCanvas() {
    const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 200, 500);
    canvas.width = maxSize;
    canvas.height = maxSize;
    gridSize = Math.floor(maxSize / 20); // 20x20 grid
}

// Initialize canvas and add resize listener
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Generate random food position
function generateFood() {
    const maxPos = Math.floor(canvas.width / gridSize) - 1;
    food = {
        x: Math.floor(Math.random() * maxPos),
        y: Math.floor(Math.random() * maxPos)
    };
    
    // Make sure food doesn't spawn on snake
    for(let segment of snake) {
        if(segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw burger (food) with detailed graphics
function drawBurger(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    const size = gridSize * 0.8;
    
    // Burger bun (top)
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size/6, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Lettuce
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(centerX - size/3, centerY - size/8, size * 2/3, size/8);
    
    // Meat patty
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - size/3, centerY, size * 2/3, size/6);
    
    // Burger bun (bottom)
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.arc(centerX, centerY + size/4, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Sesame seeds
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(centerX - size/8, centerY - size/4, 2, 0, Math.PI * 2);
    ctx.arc(centerX + size/8, centerY - size/6, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw snake with gradient effects
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head with bright gradient
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize, segment.y * gridSize,
                (segment.x + 1) * gridSize, (segment.y + 1) * gridSize
            );
            gradient.addColorStop(0, '#32CD32');
            gradient.addColorStop(1, '#228B22');
            ctx.fillStyle = gradient;
        } else {
            // Snake body with softer gradient
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize, segment.y * gridSize,
                (segment.x + 1) * gridSize, (segment.y + 1) * gridSize
            );
            gradient.addColorStop(0, '#90EE90');
            gradient.addColorStop(1, '#32CD32');
            ctx.fillStyle = gradient;
        }
        
        // Draw snake segment with rounded corners
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Add shine effect for 3D appearance
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 8,
            gridSize/3
        );
    });
}

// Main draw function
function draw() {
    // Clear canvas with animated background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a202c');
    gradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawBurger(food.x, food.y);
    drawSnake();
}

// Snake movement logic
function move() {
    if (!gameRunning) return;
    
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Check wall collision
    const maxPos = Math.floor(canvas.width / gridSize) - 1;
    if (head.x < 0 || head.x > maxPos || head.y < 0 || head.y > maxPos) {
        gameOver();
        return;
    }
    
    // Check self collision
    for(let segment of snake) {
        if(head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

// Game over handler
function gameOver() {
    gameRunning = false;
    gameStarted = false;
    finalScoreElement.textContent = score;
    modal.style.display = 'block';
    startBtn.style.display = 'block';
}

// Start game function
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    gameRunning = true;
    
    // Start moving in random direction
    const directions = [
        {x: 1, y: 0}, {x: -1, y: 0},
        {x: 0, y: 1}, {x: 0, y: -1}
    ];
    direction = directions[Math.floor(Math.random() * directions.length)];
    
    startBtn.style.display = 'none';
}

// Reset game to initial state
function resetGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gameStarted = false;
    generateFood();
    modal.style.display = 'none';
    startBtn.style.display = 'block';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Space bar to start game
    if (!gameRunning && !gameStarted && e.code === 'Space') {
        e.preventDefault();
        startGame();
        return;
    }
    
    if (!gameRunning) return;
    
    // Direction controls (Arrow keys and WASD)
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) direction = {x: 1, y: 0};
            break;
    }
});

// Mobile touch controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (!gameRunning) return;
    if (direction.y !== 1) direction = {x: 0, y: -1};
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (!gameRunning) return;
    if (direction.y !== -1) direction = {x: 0, y: 1};
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (!gameRunning) return;
    if (direction.x !== 1) direction = {x: -1, y: 0};
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (!gameRunning) return;
    if (direction.x !== -1) direction = {x: 1, y: 0};
});

// Button event listeners
startBtn.addEventListener('click', startGame);
newGameBtn.addEventListener('click', resetGame);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        resetGame();
    }
});

// Game loop function
function gameLoop() {
    move();
    draw();
}

// Initialize game
generateFood();
draw();

// Start game loop (runs every 150ms for smooth gameplay)
setInterval(gameLoop, 150);
