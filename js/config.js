// Default game configs

export const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    
    // Game settings
    WINNING_SCORE: 11,
    
    // Paddle settings
    PADDLE_WIDTH: 15,
    PADDLE_HEIGHT: 100,
    PADDLE_MARGIN: 20,
    PADDLE_SPEED: 8,
    
    // Ball settings (defaults)
    BALL_SIZE: 10,
    BALL_SPEED: 2,
    BALL_COLOR: "#ffffff",
    
    // Game modes
    GAME_MODES: {
        PVP: 'pvp',
        PVC: 'pvc'
    },
    
    // PvP modes
    PVP_MODES: {
        DEFAULT: 'defaultMode',
        HORIZONTAL: 'xyMode',
        TILTING: 'tiltingMode'
    },
    
    // Control modes
    CONTROL_MODES: {
        KEYBOARD: 'keyboardMode',
        MOUSE: 'mouseControl'
    },
    
    // AI difficulty settings
    AI_DIFFICULTY: {
        EASY: {
            SPEED: 2,
            ACCURACY: 0.5
        },
        MEDIUM: {
            SPEED: 3,
            ACCURACY: 0.6
        },
        HARD: {
            SPEED: 5,
            ACCURACY: 0.7
        }
    }
};