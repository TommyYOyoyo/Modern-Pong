// Audio manager class

// Audio based on Web Audio API and are of constant frequency

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.init();
    }
    
    init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn("Web Audio API not supported :(", e);
        }
    }
    
    // Create sounds objects
    createSounds() {
        this.sounds = {
            paddleHit: this.createBeep(300, 0.1, "sawtooth"),
            wallHit: this.createBeep(200, 0.1, "sine"),
            score: this.createBeep(500, 0.3, "square"),
            gameStart: this.createBeep(400, 0.5, "sine"),
            gameOver: this.createBeep(150, 1, "sine")
        };
    }
    
    // Create a beep sound based on frequency, duration and type
    createBeep(frequency, duration, type) {
        return {
            frequency,
            duration,
            type,
            play: () => this.playBeep(frequency, duration, type) // Play sound
        };
    }
    
    // Play a beep sound (using oscillator and gain node since it's a constant frequency and I don't want to load assets)
    playBeep(frequency, duration, type) {
        if (!this.audioContext) return; // Return if audio context is not initialized
        
        // Create oscillator and gain/volume node
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Connect oscillator and gain/volume node
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set frequency and type
        oscillator.frequency.value = frequency;
        oscillator.type = type;
       
        // Set gain to 0.3 and ramp to 0.01 over duration
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        // Start and stop oscillator
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Play a sound
    playSound(soundName) {
        // Play sound if it exists
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}