document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const playerScoreEl = document.getElementById('player-score');
    const cpuScoreEl = document.getElementById('cpu-score');
    const gameOverTitle = document.getElementById('game-over-title');
    const finalScoreEl = document.getElementById('final-score');
    const powerupIndicator = document.getElementById('powerup-indicator');
    const powerupTimerEl = document.getElementById('powerup-timer');

    function resizeCanvas() {
        const minWidth = 800;
        const minHeight = 500;
        
        canvas.width = Math.max(minWidth, window.innerWidth * 0.9);
        canvas.height = Math.max(minHeight, window.innerHeight * 0.75);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let gameRunning = false;
    let animationFrameId;
    let playerScore = 0;
    let cpuScore = 0;
    let hitCount = 0;
    let powerModeActive = false;
    let powerModeEndTime = 0;
    let particles = [];
    
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 5,
        color: '#00f2fe'
    };
    
    const playerPaddle = {
        x: 30,
        y: canvas.height / 2 - 50,
        width: 15,
        height: 100,
        speed: 8,
        color: '#fe53bb'
    };
    
    const cpuPaddle = {
        x: canvas.width - 45,
        y: canvas.height / 2 - 50,
        width: 15,
        height: 100,
        speed: 5,
        color: '#00f2fe'
    };
    
    const keys = {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false
    };
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (gameRunning) {
            const rect = canvas.getBoundingClientRect();
            const canvasY = e.clientY - rect.top;
            playerPaddle.y = canvasY - playerPaddle.height / 2;
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const canvasY = e.touches[0].clientY - rect.top;
            playerPaddle.y = canvasY - playerPaddle.height / 2;
        }
    }, { passive: false });

    function startGame() {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        resetGame();
        gameRunning = true;
        animate();
    }
    
    function restartGame() {
        playerScore = 0;
        cpuScore = 0;
        updateScore();
        gameOverScreen.style.display = 'none';
        resetGame();
        gameRunning = true;
        animate();
    }
    
    function resetGame() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ball.speedY = (Math.random() * 4 - 2);
        ball.color = '#00f2fe';
        hitCount = 0;
        powerModeActive = false;
        powerupIndicator.style.opacity = '0';
        playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
        cpuPaddle.y = canvas.height / 2 - cpuPaddle.height / 2;
    }
    
    function endGame(winner) {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        
        gameOverTitle.textContent = winner === 'player' ? 'DOMINATION ACHIEVED' : 'SYSTEM FAILURE';
        gameOverTitle.style.background = winner === 'player' 
            ? 'linear-gradient(to right, #0fff50, #00f2fe)' 
            : 'linear-gradient(to right, #fe53bb, #8921ff)';
        
        finalScoreEl.innerHTML = `
            <div class="score" style="margin: 20px 0;">FINAL SCORE</div>
            <div class="score">PLAYER: ${playerScore}</div>
            <div class="score" style="margin-top: 10px;">CPU: ${cpuScore}</div>
        `;
        
        gameOverScreen.style.display = 'flex';
    }
    
    function updateScore() {
        playerScoreEl.textContent = playerScore;
        cpuScoreEl.textContent = cpuScore;
    }
    
    function createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 3 + 1,
                color: color || getRandomNeonColor(),
                speedX: Math.random() * 6 - 3,
                speedY: Math.random() * 6 - 3,
                life: 30 + Math.random() * 30
            });
        }
    }
    
    function getRandomNeonColor() {
        const colors = ['#00f2fe', '#fe53bb', '#8921ff', '#0fff50'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function animate() {
        if (!gameRunning) return;
        
        animationFrameId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawGrid();
        
        updateGame();
        
        drawGame();
        
        updateParticles();
    }
    
    function drawGrid() {
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    function updateGame() {
        if ((keys.w || keys.ArrowUp) && playerPaddle.y > 0) {
            playerPaddle.y -= playerPaddle.speed;
        }
        if ((keys.s || keys.ArrowDown) && playerPaddle.y < canvas.height - playerPaddle.height) {
            playerPaddle.y += playerPaddle.speed;
        }
        
        const cpuPaddleCenter = cpuPaddle.y + cpuPaddle.height / 2;
        if (cpuPaddleCenter < ball.y - 10) {
            cpuPaddle.y += cpuPaddle.speed;
        } else if (cpuPaddleCenter > ball.y + 10) {
            cpuPaddle.y -= cpuPaddle.speed;
        }
        
        if (cpuPaddle.y < 0) cpuPaddle.y = 0;
        if (cpuPaddle.y > canvas.height - cpuPaddle.height) {
            cpuPaddle.y = canvas.height - cpuPaddle.height;
        }
        
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.speedY = -ball.speedY;
            createParticles(ball.x, ball.y, 5, ball.color);
            
            if (powerModeActive) {
                ball.speedY *= 1.2;
                createParticles(ball.x, ball.y, 15, ball.color);
            }
        }
        
        if (
            ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
            ball.x + ball.radius > playerPaddle.x &&
            ball.y + ball.radius > playerPaddle.y &&
            ball.y - ball.radius < playerPaddle.y + playerPaddle.height
        ) {
            const relativeIntersectY = (playerPaddle.y + (playerPaddle.height / 2)) - ball.y;
            const normalizedRelativeIntersectionY = relativeIntersectY / (playerPaddle.height / 2);
            const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 3);
            
            ball.speedX = Math.abs(ball.speedX) * 1.05;
            ball.speedY = -Math.sin(bounceAngle) * (Math.abs(ball.speedX) + 2);
            
            hitCount++;
            
            if (hitCount % 5 === 0) {
                activatePowerMode();
            }
            
            ball.color = getRandomNeonColor();
            
            createParticles(ball.x, ball.y, 10, ball.color);
            
            if (powerModeActive) {
                createParticles(ball.x, ball.y, 30, ball.color);
                ball.speedX *= 1.2;
            }
        }
        
        if (
            ball.x + ball.radius > cpuPaddle.x &&
            ball.x - ball.radius < cpuPaddle.x + cpuPaddle.width &&
            ball.y + ball.radius > cpuPaddle.y &&
            ball.y - ball.radius < cpuPaddle.y + cpuPaddle.height
        ) {
            const relativeIntersectY = (cpuPaddle.y + (cpuPaddle.height / 2)) - ball.y;
            const normalizedRelativeIntersectionY = relativeIntersectY / (cpuPaddle.height / 2);
            const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 3);
            
            ball.speedX = -Math.abs(ball.speedX) * 1.05;
            ball.speedY = -Math.sin(bounceAngle) * (Math.abs(ball.speedX) + 2);
            
            ball.color = getRandomNeonColor();
            
            createParticles(ball.x, ball.y, 10, ball.color);
            
            if (powerModeActive) {
                createParticles(ball.x, ball.y, 30, ball.color);
                ball.speedX *= 1.2;
            }
        }
        
        if (ball.x - ball.radius < 0) {
            cpuScore++;
            updateScore();
            if (cpuScore >= 11) {
                endGame('cpu');
            } else {
                resetBall();
            }
        } else if (ball.x + ball.radius > canvas.width) {
            playerScore++;
            updateScore();
            if (playerScore >= 11) {
                endGame('player');
            } else {
                resetBall();
            }
        }
        
        if (powerModeActive) {
            const timeLeft = Math.max(0, (powerModeEndTime - Date.now()) / 1000);
            powerupTimerEl.textContent = timeLeft.toFixed(1);
            
            if (timeLeft <= 0) {
                powerModeActive = false;
                powerupIndicator.style.opacity = '0';
                ball.color = '#00f2fe';
            }
        }
    }
    
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ball.speedY = (Math.random() * 4 - 2);
        hitCount = 0;
    }
    
    function activatePowerMode() {
        powerModeActive = true;
        powerModeEndTime = Date.now() + 5000;
        powerupIndicator.style.opacity = '1';
        createPowerExplosion(ball.x, ball.y);
    }
    
    function createPowerExplosion(x, y) {
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 4 + 2,
                color: getRandomNeonColor(),
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                life: 40 + Math.random() * 30
            });
        }
    }
    
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.life--;
            
            const opacity = p.life / 60;
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, opacity);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        ctx.globalAlpha = 1;
    }
    
    function drawGame() {
        ctx.shadowColor = playerPaddle.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = playerPaddle.color;
        ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
        
        ctx.shadowColor = cpuPaddle.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = cpuPaddle.color;
        ctx.fillRect(cpuPaddle.x, cpuPaddle.y, cpuPaddle.width, cpuPaddle.height);
        
        ctx.shadowBlur = 0;
        
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        if (powerModeActive) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
            
            const pulseSize = 5 * Math.sin(Date.now() / 100);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 15 + pulseSize, 0, Math.PI * 2);
            ctx.stroke();
            
            if (Math.random() > 0.7) {
                createParticles(ball.x, ball.y, 3, ball.color);
            }
        }
    }
});