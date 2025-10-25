// Game class

import { CONFIG } from './config.js';

export class PongGame {
    constructor(canvas, config, audioManager) {
        // Canvas and config
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.audioManager = audioManager;
        
        // Initialize game state
        this.resetGame();
        
        // Input state
        this.keys = {}; // Keyboard keys object
        this.mouseY = 0;
        
        // Bind key event listeners
        this.setupEventListeners();
    }
    
    // Reset game state to defaults
    resetGame() {
        // Game state
        this.gameMode = CONFIG.GAME_MODES.PVP;
        this.difficulty = 'easy';
        this.pvpMode = CONFIG.PVP_MODES.DEFAULT;
        this.controlMode = CONFIG.CONTROL_MODES.KEYBOARD;
        this.isRunning = false;
        this.scores = { player1: 0, player2: 0 };
        
        // Game objects
        this.ball = {
            x: this.config.CANVAS_WIDTH / 2,
            y: this.config.CANVAS_HEIGHT / 2,
            dx: this.config.BALL_SPEED,
            dy: this.config.BALL_SPEED,
            size: this.config.BALL_SIZE,
            color: this.config.BALL_COLOR
        };
        
        // Paddles reinitialization
        this.paddles = {
            player1: {
                x: this.config.PADDLE_MARGIN,
                y: (this.config.CANVAS_HEIGHT - this.config.PADDLE_HEIGHT) / 2,
                width: this.config.PADDLE_WIDTH,
                height: this.config.PADDLE_HEIGHT,
                tilt: 0,
                maxTilt: 30 // Maximum tilt angle (30 degrees)
            },
            player2: {
                x: this.config.CANVAS_WIDTH - this.config.PADDLE_MARGIN - this.config.PADDLE_WIDTH,
                y: (this.config.CANVAS_HEIGHT - this.config.PADDLE_HEIGHT) / 2,
                width: this.config.PADDLE_WIDTH,
                height: this.config.PADDLE_HEIGHT,
                tilt: 0,
                maxTilt: 30 // Maximum tilt angle (30 degrees)
            }
        };
    }
    
    // Bind key event listeners
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true; // Set key as pressed
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false; // Set key as unpressed
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top; // Center mouse Y position
        });
    }
    
    // Start game
    startGame() {
        this.isRunning = true;
        this.scores = { player1: 0, player2: 0 };
        this.resetBall();
        this.audioManager.playSound('gameStart');
        // Start game loop
        this.gameLoop();
    }
    
    // Reset ball position and direction
    resetBall() {
        this.paddles.player1.tilt = 0; // Reset tilt
        this.paddles.player2.tilt = 0;
        
        // Ball position = center of canvas
        this.ball.x = this.config.CANVAS_WIDTH / 2;
        this.ball.y = this.config.CANVAS_HEIGHT / 2;
        
        // Random direction with some variation
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // Random angle between -45 and 45 degrees
        const direction = Math.random() > 0.5 ? 1 : -1;             // Random direction (1 or -1)
        
        // Ball speed x and y
        this.ball.dx = direction * this.config.BALL_SPEED * Math.cos(angle); // direction * speed * horizontal component
        this.ball.dy = this.config.BALL_SPEED * Math.sin(angle); // speed * vertical component

        // Reset paddles positions
        this.paddles.player2.x = this.config.CANVAS_WIDTH - this.config.PADDLE_MARGIN - this.config.PADDLE_WIDTH;
        this.paddles.player2.y = (this.config.CANVAS_HEIGHT - this.config.PADDLE_HEIGHT) / 2;
        this.paddles.player1.x = this.config.PADDLE_MARGIN;
        this.paddles.player1.y = (this.config.CANVAS_HEIGHT - this.config.PADDLE_HEIGHT) / 2;
    }
    
    // Game tick update
    update() {
        if (!this.isRunning) return; // Game is not running
        
        // Move paddles and ball while checking collisions
        this.movePaddles();
        this.moveBall();
        this.checkCollisions();
        
        // Update AI if in PvC mode
        if (this.gameMode === CONFIG.GAME_MODES.PVC) {
            this.updateAI();
        }
    }
    
    // Paddle movement handler
    movePaddles() {
        // Player 1 controls
        if (this.controlMode === CONFIG.CONTROL_MODES.KEYBOARD) {
            this.handlePlayer1Keyboard();
        } else if (this.controlMode === CONFIG.CONTROL_MODES.MOUSE) {
            // Mouse control for player 1
            if (this.gameMode === CONFIG.GAME_MODES.PVP) {
                this.paddles.player1.y = this.mouseY - this.paddles.player1.height / 2; // Center mouse Y position
            }
        }
        
        // Player 2 controls (only in PvP mode)
        if (this.gameMode === CONFIG.GAME_MODES.PVP) this.handlePlayer2Keyboard();
        
        // Keep paddles within bounds
        this.constrainPaddles();
    }
    
    // Keyboard movement handler for player 1
    handlePlayer1Keyboard() {
        const paddle = this.paddles.player1;
        
        // Classic mode - vertical movement only
        if (this.pvpMode === CONFIG.PVP_MODES.DEFAULT) {
            if (this.keys['w'] || this.keys['W']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['s'] || this.keys['S']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
        }
        // Horizontal movement mode - both vertical and horizontal
        else if (this.pvpMode === CONFIG.PVP_MODES.HORIZONTAL) {
            if (this.keys['w'] || this.keys['W']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['s'] || this.keys['S']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
            if (this.keys['a'] || this.keys['A']) {
                paddle.x -= this.config.PADDLE_SPEED;
            }
            if (this.keys['d'] || this.keys['D']) {
                paddle.x += this.config.PADDLE_SPEED;
            }
        }
        // Tilting mode - vertical movement and tilt
        else if (this.pvpMode === CONFIG.PVP_MODES.TILTING) {
            if (this.keys['w'] || this.keys['W']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['s'] || this.keys['S']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
            if (this.keys['q'] || this.keys['Q']) {
                paddle.tilt = Math.max(-paddle.maxTilt, paddle.tilt - 2); // Tilt up (make sure it doesn't go below -30 degrees)
            }
            if (this.keys['e'] || this.keys['E']) {
                paddle.tilt = Math.min(paddle.maxTilt, paddle.tilt + 2); // Tilt down (make sure it doesn't go above 30 degrees)
            }
        }
    }
    
    // Keyboard movement handler for player 2
    handlePlayer2Keyboard() {
        const paddle = this.paddles.player2;
        
        // Classic mode - vertical movement only
        if (this.pvpMode === CONFIG.PVP_MODES.DEFAULT) {
            if (this.keys['i'] || this.keys['I']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['k'] || this.keys['K']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
        }
        // Horizontal movement mode - both vertical and horizontal
        else if (this.pvpMode === CONFIG.PVP_MODES.HORIZONTAL) {
            if (this.keys['i'] || this.keys['I']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['k'] || this.keys['K']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
            if (this.keys['j'] || this.keys['J']) {
                paddle.x -= this.config.PADDLE_SPEED;
            }
            if (this.keys['l'] || this.keys['L']) {
                paddle.x += this.config.PADDLE_SPEED;
            }
        }
        // Tilting mode - vertical movement and tilt
        else if (this.pvpMode === CONFIG.PVP_MODES.TILTING) {
            if (this.keys['i'] || this.keys['I']) {
                paddle.y -= this.config.PADDLE_SPEED;
            }
            if (this.keys['k'] || this.keys['K']) {
                paddle.y += this.config.PADDLE_SPEED;
            }
            if (this.keys['u'] || this.keys['U']) {
                paddle.tilt = Math.max(-paddle.maxTilt, paddle.tilt - 2); // As above
            }
            if (this.keys['o'] || this.keys['O']) {
                paddle.tilt = Math.min(paddle.maxTilt, paddle.tilt + 2); // As above
            }
        }
    }
    
    // Constrain paddles within the canvas
    constrainPaddles() {
        // VerticalMovements-only mode constraints (fixed x)
        if (this.pvpMode === CONFIG.PVP_MODES.DEFAULT || this.pvpMode === CONFIG.PVP_MODES.TILTING) {
            this.paddles.player1.x = this.config.PADDLE_MARGIN; // Player 1 stays on left side
            this.paddles.player2.x = this.config.CANVAS_WIDTH - this.config.PADDLE_MARGIN - this.config.PADDLE_WIDTH; // Player 2 on right side
        }
        
        // Horizontal mode constraints (half-sided)
        if (this.pvpMode === CONFIG.PVP_MODES.HORIZONTAL) {
            // Player 1 stays on left side, Player 2 on right side
            this.paddles.player1.x = Math.max(0, Math.min(
                this.config.CANVAS_WIDTH / 2 - this.paddles.player1.width, // Player 1 stays on left side but not over the border
                this.paddles.player1.x
            ));
            this.paddles.player2.x = Math.max(
                this.config.CANVAS_WIDTH / 2, 
                Math.min(
                    this.config.CANVAS_WIDTH - this.paddles.player2.width,  // Player 2 stays on right side but not over the border
                    this.paddles.player2.x
                )
            );
        }
        
        // Global vertical constraints (upper and lower borders)
        this.paddles.player1.y = Math.max(0, Math.min(
            this.config.CANVAS_HEIGHT - this.paddles.player1.height, 
            this.paddles.player1.y
        ));
        this.paddles.player2.y = Math.max(0, Math.min(
            this.config.CANVAS_HEIGHT - this.paddles.player2.height, 
            this.paddles.player2.y
        ));
    }
    
    // Ball movement handler
    moveBall() {
        // Basic ball movement
        this.ball.x += this.ball.dx; 
        this.ball.y += this.ball.dy;
        
        // Ball out of bounds (scoring)
        if (this.ball.x < 0) {  // Player 2 scores
            this.scores.player2++;
            this.audioManager.playSound('score');
            this.canvas.style.animation = 'shake 0.5s'; // Shake effect
            setTimeout(() => {this.canvas.style.animation = 'none'}, 500); // Reset animation after 500ms
            
            // PAUSE: Stop game
            this.isRunning = false;
            
            // Resume after 1 second to give player reaction time
            setTimeout(() => {
                if (!this.checkGameOver()) { // Only resume if game isn't over
                    this.isRunning = true;
                    this.resetBall(); // Reset ball position
                    this.gameLoop();
                }
            }, 1000);
            
        } else if (this.ball.x > this.config.CANVAS_WIDTH) { // Player 1 scores
            this.scores.player1++;
            this.audioManager.playSound('score');
            this.canvas.style.animation = 'shake 0.5s'; // Shake effect
            setTimeout(() => {this.canvas.style.animation = 'none'}, 500); // Reset animation after 500ms
            
            // PAUSE: Stop game
            this.isRunning = false;
            
            // Resume after 1 second
            setTimeout(() => {
                if (!this.checkGameOver()) { // Only resume if game isn't over
                    this.isRunning = true;
                    this.resetBall(); // Reset ball position
                    this.gameLoop();
                }
            }, 1000);
        }
        
        // Ball hitting top or bottom, bounce
        if (this.ball.y < 0 || this.ball.y > this.config.CANVAS_HEIGHT) {
            this.ball.dy = -this.ball.dy;
            this.audioManager.playSound('wallHit');
        }
    }
    
    // Collision detection
    checkCollisions() {
        // Ball collision with player1 paddle
        if (this.checkPaddleCollision(this.paddles.player1)) {
            this.handlePaddleHit(this.paddles.player1, 1);
        }
        
        // Ball collision with player2 paddle
        if (this.checkPaddleCollision(this.paddles.player2)) {
            this.handlePaddleHit(this.paddles.player2, -1);
        }
    }
    
    // Check if ball is colliding with paddle 
    checkPaddleCollision(paddle) {
        // AABB
        return (
            this.ball.x - this.ball.size < paddle.x + paddle.width &&   // Left side of ball vs paddle's right edge by coming left
            this.ball.x + this.ball.size > paddle.x &&                  // Right side of ball vs paddle's left edge by coming right
            this.ball.y - this.ball.size < paddle.y + paddle.height &&  // Ball top vs paddle bottom
            this.ball.y + this.ball.size > paddle.y                     // Ball bottom vs paddle top
        );
    }
    
    // Bounce ball off paddle
    handlePaddleHit(paddle, direction) {
        // Reverse X direction
        this.ball.dx = Math.abs(this.ball.dx) * direction;
        // Make sure ball doesn't go into the paddle
        this.ball.x = paddle.x + (direction === 1 ? // Paddle's hit on the right side : on the left side 
            paddle.width + this.ball.size : 
            -this.ball.size
        );
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (this.ball.y - paddle.y) / paddle.height; // Position of the ball on the paddle (0 to 1 with 0 being top and 1 being bottom)
        this.ball.dy = (hitPos - 0.5) * 10; // Change in vertical direction based on the position of collision
        
        // Add tilt effect in tilting mode
        if (this.pvpMode === CONFIG.PVP_MODES.TILTING) {
            this.ball.dy += paddle.tilt * 0.1;
        }
          
        // Slightly increase speed with each hit
        this.ball.dx *= 1.025;
        this.ball.dy *= 1.025;
        
        // Play hit sound
        this.audioManager.playSound('paddleHit');
    }
    
    // AI movement handler
    updateAI() {
        const aiPaddle = this.paddles.player2;
        const ball = this.ball;
        const difficulty = this.config.AI_DIFFICULTY[this.difficulty.toUpperCase()];
        
        // Predict ball position with some inaccuracy based on difficulty
        const predictionError = (1 - difficulty.ACCURACY) * 100; // x100 to scale it to pixels
        const error = (Math.random() - 0.5) * predictionError;  // Random number between -0.5 and 0.5 * predictionError
        const predictedY = ball.y + error; // Predicted Y position with error applied
        
        // Move towards predicted position
        const targetY = predictedY - aiPaddle.height / 2;
        
        // Move towards predicted position
        if (targetY < aiPaddle.y - 5) {  // If predicted position is higher than paddle
            aiPaddle.y -= difficulty.SPEED;
        } else if (targetY > aiPaddle.y + 5) { // If predicted position is lower than paddle
            aiPaddle.y += difficulty.SPEED;
        }
    }
    
    // Game over detection
    checkGameOver() {
        // Check if player 1 or player 2 has won
        if (this.scores.player1 >= this.config.WINNING_SCORE || 
            this.scores.player2 >= this.config.WINNING_SCORE) {
            // Pause game
            this.isRunning = false;
            this.audioManager.playSound('gameOver');
            
            // Determine winner
            let winner;
            // Player 1 is winner
            if (this.scores.player1 > this.scores.player2) {
                winner = 'Player 1';
            // Player 2 is winner
            } else {
                winner = this.gameMode === CONFIG.GAME_MODES.PVP ? 'Player 2' : 'Computer'; // Computer is winner in PvC mode
            }
            
            // Trigger game over event
            document.dispatchEvent(new CustomEvent('gameOver', {
                detail: {
                    winner: winner,
                    player1Score: this.scores.player1,
                    player2Score: this.scores.player2
                }
            }));
            
            return true; // Game is over
        }
        return false; // Game is not over
    }
    
    draw() {
        // Clear canvas with semi-transparent background for slight trail effect and shake effect
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        this.ctx.fillRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
        
        // Draw center line with dash effect
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.CANVAS_WIDTH / 2, 0);
        this.ctx.lineTo(this.config.CANVAS_WIDTH / 2, this.config.CANVAS_HEIGHT);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles with tilt effect
        this.drawPaddle(this.paddles.player1);
        this.drawPaddle(this.paddles.player2);
        
        // Draw ball
        this.drawBall();
    }
    
    // Draw paddles
    drawPaddle(paddle) {
        this.ctx.save();
        
        this.ctx.translate(paddle.x + paddle.width / 2, paddle.y + paddle.height / 2);
        // Apply tilt transformation
        this.ctx.rotate(paddle.tilt * Math.PI / 180);
        
        // Draw paddle with gradient
        const gradient = this.ctx.createLinearGradient(
            -paddle.width / 2, 0, 
            paddle.width / 2, 0
        );
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#6366f1');
        
        // Draw paddle with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            -paddle.width / 2, 
            -paddle.height / 2, 
            paddle.width, 
            paddle.height
        );
        
        // Add paddle border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            -paddle.width / 2, 
            -paddle.height / 2, 
            paddle.width, 
            paddle.height
        );
        
        // Restore previous transformation
        this.ctx.restore();
    }
    
    // Draw ball
    drawBall() {
        // Draw ball with glow effect
        this.ctx.shadowColor = this.ball.color;
        this.ctx.shadowBlur = 15;
        
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    // Game loop
    gameLoop() {
        if (!this.isRunning) return; // Return if game is not running
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Update game settings if customized
    updateSettings(ballColor, ballSize, ballSpeed) {
        this.ball.color = ballColor;
        this.ball.size = ballSize;
        this.config.BALL_SPEED = ballSpeed;
        
        // Update current ball speed while maintaining direction
        const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        if (currentSpeed > 0) {
            const ratio = ballSpeed / currentSpeed;
            this.ball.dx *= ratio;
            this.ball.dy *= ratio;
        }
    }
    
    // Set game mode
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Force classic mode and disable mouse control in PvC mode
        if (mode === CONFIG.GAME_MODES.PVC) {
            this.pvpMode = CONFIG.PVP_MODES.DEFAULT;
            this.controlMode = CONFIG.CONTROL_MODES.KEYBOARD;
        }
    }
    
    // Set difficulty
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    // Set PvP mode
    setPvPMode(mode) {
        this.pvpMode = mode;
    }
    
    // Set control mode
    setControlMode(mode) {
        this.controlMode = mode;
    }
    
    // Get scores
    getScores() {
        return { ...this.scores }; // Return a copy of the scores object
    }
}