// Game menu handler
import { CONFIG } from './config.js';

// Menu class
export class MenuManager {
    // Menu constructor
    constructor(game) {
        this.game = game;
        // Base elements
        this.startMenu = document.getElementById('startMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.canvas = document.getElementById('gameCanvas');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        
        // Game mode buttons
        this.pvpButton = document.getElementById('pvpMode');
        this.pvcButton = document.getElementById('pvcMode');
        
        // Difficulty buttons
        this.easyButton = document.getElementById('easyMode');
        this.mediumButton = document.getElementById('mediumMode');
        this.hardButton = document.getElementById('hardMode');
        
        // Dropdowns
        this.pvpModeSelect = document.getElementById('pvpModeSelect');
        this.controlModeSelect = document.getElementById('controlModeSelect');
        
        // Ball settings
        this.ballColor = document.getElementById('ballColor');
        this.ballSize = document.getElementById('ballSize');
        this.ballSpeed = document.getElementById('ballSpeed');
        this.ballSizeValue = document.getElementById('ballSizeValue');
        this.ballSpeedValue = document.getElementById('ballSpeedValue');
        
        // Action buttons
        this.startButton = document.getElementById('startGame');
        this.restartButton = document.getElementById('restartGame');
        this.backToMenuButton = document.getElementById('backToMenu');
        
        // Game over display
        this.winnerText = document.getElementById('winnerText');
        this.finalScore1 = document.getElementById('finalScore1');
        this.finalScore2 = document.getElementById('finalScore2');
        
        // In-game score display
        this.player1Score = document.getElementById('player1Score');
        this.player2Score = document.getElementById('player2Score');
        
        // Setup key event listeners
        this.setupEventListeners();
        // Update slider values along with player input
        this.updateSliderValues();
        
        // Initialize UI state
        this.updateUIForGameMode('pvp');
    }
    
    setupEventListeners() {
        // Game mode selection
        this.pvpButton.addEventListener('click', () => {            // PVP mode
            this.setActiveButton(this.pvpButton, [this.pvcButton]);
            this.game.setGameMode(CONFIG.GAME_MODES.PVP);
            this.updateUIForGameMode('pvp');
        });
        this.pvcButton.addEventListener('click', () => {            // PVC mode
            this.setActiveButton(this.pvcButton, [this.pvpButton]);
            this.game.setGameMode(CONFIG.GAME_MODES.PVC);
            this.updateUIForGameMode('pvc');
        });
        
        // Difficulty selection
        this.easyButton.addEventListener('click', () => {
            this.setActiveButton(this.easyButton, [this.mediumButton, this.hardButton]);
            this.game.setDifficulty('easy');
        });
        this.mediumButton.addEventListener('click', () => {
            this.setActiveButton(this.mediumButton, [this.easyButton, this.hardButton]);
            this.game.setDifficulty('medium');
        }); 
        this.hardButton.addEventListener('click', () => {
            this.setActiveButton(this.hardButton, [this.easyButton, this.mediumButton]);
            this.game.setDifficulty('hard');
        });
        
        // Dropdown changes
        this.pvpModeSelect.addEventListener('change', (e) => {
            this.game.setPvPMode(e.target.value);
        });
        
        this.controlModeSelect.addEventListener('change', (e) => {
            this.game.setControlMode(e.target.value);
        });
        
        // Ball color changes
        this.ballColor.addEventListener('input', () => {
            this.updateGameSettings();
        });
        
        // Ball size changes
        this.ballSize.addEventListener('input', () => {
            this.updateSliderValues();
            this.updateGameSettings();
        });
        
        // Ball speed changes
        this.ballSpeed.addEventListener('input', () => {
            this.updateSliderValues();
            this.updateGameSettings();
        });
        
        // Start game
        this.startButton.addEventListener('click', () => {
            this.hideStartMenu();
            this.showGame();
            this.updateGameSettings();
            this.game.startGame();
        });
        
        // Restart game
        this.restartButton.addEventListener('click', () => {
            this.hideGameOverMenu();
            this.showGame();
            this.updateGameSettings();
            this.game.startGame();
        });
        
        // Back to menu
        this.backToMenuButton.addEventListener('click', () => {
            this.hideGameOverMenu();
            this.showStartMenu();
        });
        
        // Game over event
        document.addEventListener('gameOver', (e) => {
            this.showGameOverMenu(e.detail);
        });
    }
    
    // Update UI for selected game mode
    updateUIForGameMode(mode) {
        const pvpSelector = document.getElementById('pvpSelector');
        const controlSelector = document.getElementById('controlSelector');
        const difficultySelector = document.getElementById('diffcultySelector');
        
        if (mode === 'pvp') {
            // Show PvP options and control settings, hide difficulty
            pvpSelector.style.display = 'block';
            controlSelector.style.display = 'block';
            difficultySelector.style.display = 'none';
        } else if (mode === 'pvc') {
            // Hide PvP options, force classic mode and keyboard controls
            pvpSelector.style.display = 'none';
            controlSelector.style.display = 'none';
            difficultySelector.style.display = 'block';
            
            // Force classic mode and keyboard controls
            this.game.setPvPMode(CONFIG.PVP_MODES.DEFAULT);
            this.game.setControlMode(CONFIG.CONTROL_MODES.KEYBOARD);
            this.pvpModeSelect.value = CONFIG.PVP_MODES.DEFAULT;
            this.controlModeSelect.value = CONFIG.CONTROL_MODES.KEYBOARD;
        }
    }
    
    // Set active button and remove active class from other buttons
    setActiveButton(activeButton, otherButtons) {
        activeButton.classList.add('active');
        otherButtons.forEach(button => button.classList.remove('active'));
    }
    
    // Update ball size and speed values as user slider input
    updateSliderValues() {
        this.ballSizeValue.textContent = this.ballSize.value;
        this.ballSpeedValue.textContent = this.ballSpeed.value;
    }
    
    // Update game settings
    updateGameSettings() {
        this.game.updateSettings(
            this.ballColor.value,
            parseInt(this.ballSize.value),
            parseInt(this.ballSpeed.value)
        );
    }
    
    // Hide start menu
    hideStartMenu() {
        this.startMenu.classList.remove('activeMenu');
    }
    
    // Show start menu
    showStartMenu() {
        this.startMenu.classList.add('activeMenu');
        this.hideGame();
    }
    
    // Hide game over menu
    hideGameOverMenu() {
        this.gameOverMenu.classList.remove('activeMenu');
    }
    
    // Show game over menu
    showGameOverMenu(gameOverData) {
        this.hideGame();
        this.gameOverMenu.classList.add('activeMenu');
        
        this.winnerText.textContent = `${gameOverData.winner} Wins!`;
        this.finalScore1.textContent = gameOverData.player1Score;
        this.finalScore2.textContent = gameOverData.player2Score;
    }
    
    // Hide game canvas
    hideGame() {
        this.canvas.style.display = 'none';
        this.scoreDisplay.style.display = 'none';
    }
    
    // Show game canvas
    showGame() {
        this.canvas.style.display = 'block';
        this.scoreDisplay.style.display = 'flex';
        
        // Update score display
        this.player1Score.textContent = '0';
        this.player2Score.textContent = '0';
    }
    
    // Update score display
    updateScore(player1, player2) {
        this.player1Score.textContent = player1;
        this.player2Score.textContent = player2;
    }
}