// Main game file

import { CONFIG } from './config.js';
import { AudioManager } from './audio.js';
import { PongGame } from './game.js';
import { MenuManager } from './menu.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game components
    const canvas = document.getElementById('gameCanvas');
    const audioManager = new AudioManager();
    
    // Set canvas dimensions
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    
    // Create game instance
    const game = new PongGame(canvas, CONFIG, audioManager);
    
    // Create menu manager
    const menuManager = new MenuManager(game);
    
    // Update score display during gameplay
    const originalUpdate = game.update;
    game.update = function() {
        originalUpdate.call(this);
        menuManager.updateScore(this.scores.player1, this.scores.player2);
    };
    
    console.log("Pong game initialized successfully!");
    
    // Add keyboard controls info
    document.addEventListener('keydown', (e) => {
        // Escape key to exit existing game
        if (e.key === 'Escape') {
            if (game.isRunning) {
                game.isRunning = false;
                menuManager.showStartMenu();
            }
        }
    });
});