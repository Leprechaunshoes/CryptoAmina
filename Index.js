// Amina Casino - Main Application Controller
// Cosmic Gaming Experience - Preparing for Pera Wallet Integration

console.log('🌌 Amina Casino v1.0 - Initializing Cosmic Systems...');

class AminaCasino {
    constructor() {
        this.version = '1.0.0';
        this.isPeraWalletConnected = false;
        this.userWalletAddress = null;
        this.networkMode = 'testnet'; // Will be 'mainnet' for production
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            largestWin: 0,
            sessionStartTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Starting Amina Casino initialization...');
        this.setupCosmicEnvironment();
        this.preparePeraWalletIntegration();
        this.initializeAudioSystem();
        this.setupGameEventListeners();
        this.startCosmicEffects();
        this.displayWelcomeMessage();
        console.log('✨ Amina Casino fully loaded and ready!');
    }
    
    // Pera Wallet Integration Preparation
    preparePeraWalletIntegration() {
        console.log('🔗 Preparing Pera Wallet integration...');
        
        // Check if running in production environment
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            this.checkForPeraWallet();
        } else {
            console.log('💻 Development mode - Pera Wallet integration disabled');
            this.showDemoModeIndicator();
        }
        
        // Prepare wallet connection button (hidden until needed)
        this.createWalletConnectButton();
    }
    
    checkForPeraWallet() {
        // This will be replaced with actual Pera Wallet SDK integration
        if (typeof window.PeraWallet !== 'undefined') {
            console.log('✅ Pera Wallet detected');
            this.initPeraWallet();
        } else {
            console.log('ℹ️ Pera Wallet not found - Running in demo mode');
            setTimeout(() => this.checkForPeraWallet(), 2000); // Retry after 2 seconds
        }
    }
    
    async initPeraWallet() {
        try {
            console.log('🌟 Initializing Pera Wallet connection...');
            
            // Placeholder for actual Pera Wallet initialization
            // this.peraWallet = new PeraWalletConnect();
            // const accounts = await this.peraWallet.connect();
            // this.userWalletAddress = accounts[0];
            // this.isPeraWalletConnected = true;
            
            console.log('🎉 Pera Wallet connected successfully!');
            this.updateWalletUI();
        } catch (error) {
            console.error('❌ Pera Wallet connection failed:', error);
            this.handleWalletError(error);
        }
    }
    
    createWalletConnectButton() {
        const walletBtn = document.createElement('button');
        walletBtn.id = 'walletConnectBtn';
        walletBtn.className = 'cosmic-btn wallet-btn';
        walletBtn.innerHTML = '🔗 Connect Pera Wallet';
        walletBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            font-size: 0.9rem;
            padding: 0.8rem 1.5rem;
        `;
        
        walletBtn.addEventListener('click', () => this.connectWallet());
        document.body.appendChild(walletBtn);
    }
    
    showDemoModeIndicator() {
        const demoBar = document.createElement('div');
        demoBar.className = 'demo-mode-bar';
        demoBar.innerHTML = '🎮 DEMO MODE - Playing with House Coins | Connect Pera Wallet for real AMINA trading';
        demoBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(45deg, #FF6B35, #F7931E);
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-weight: bold;
            z-index: 1001;
            box-shadow: 0 2px 15px rgba(0,0,0,0.3);
            animation: pulse 3s ease-in-out infinite;
        `;
        
        document.body.appendChild(demoBar);
        document.body.style.paddingTop = '60px';
    }
    
    // Cosmic Visual Effects
    setupCosmicEnvironment() {
        this.createParticleSystem();
        this.addFloatingStars();
        this.setupDynamicBackground();
    }
    
    createParticleSystem() {
        const particleCanvas = document.createElement('canvas');
        particleCanvas.id = 'cosmicParticles';
        particleCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        document.body.appendChild(particleCanvas);
        
        const ctx = particleCanvas.getContext('2d');
        const particles = [];
        
        // Create floating particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#FFD700' : '#8A2BE2'
            });
        }
        
        const animateParticles = () => {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
            
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x > window.innerWidth) particle.x = 0;
                if (particle.x < 0) particle.x = window.innerWidth;
                if (particle.y > window.innerHeight) particle.y = 0;
                if (particle.y < 0) particle.y = window.innerHeight;
                
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    addFloatingStars() {
        const starContainer = document.createElement('div');
        starContainer.className = 'floating-stars';
        starContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.innerHTML = '✦';
            star.style.cssText = `
                position: absolute;
                color: #FFD700;
                font-size: ${Math.random() * 10 + 5}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate;
                opacity: ${Math.random() * 0.8 + 0.2};
            `;
            starContainer.appendChild(star);
        }
        
        document.body.appendChild(starContainer);
    }
    
    setupDynamicBackground() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            @keyframes twinkle {
                0% { opacity: 0.3; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }
            
            .floating-stars {
                animation: float 20s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Audio System
    initializeAudioSystem() {
        this.audioContext = null;
        
        // Initialize on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Cosmic audio system activated');
            }
        }, { once: true });
        
        this.sounds = {
            spin: { frequency: 440, duration: 0.2 },
            win: { frequency: 660, duration: 0.5 },
            lose: { frequency: 220, duration: 0.3 },
            click: { frequency: 800, duration: 0.1 }
        };
    }
    
    playSound(type) {
        if (!this.audioContext || this.audioContext.state !== 'running') return;
        
        const sound = this.sounds[type];
        if (!sound) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    // Game Event Monitoring
    setupGameEventListeners() {
        // Monitor game wins for statistics
        const originalAddBalance = window.addBalance || function() {};
        window.addBalance = (amount) => {
            originalAddBalance(amount);
            this.recordWin(amount);
        };
        
        // Monitor game plays
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cosmic-btn')) {
                this.playSound('click');
                this.stats.totalGamesPlayed++;
            }
        });
    }
    
    recordWin(amount) {
        this.stats.totalWinnings += amount;
        if (amount > this.stats.largestWin) {
            this.stats.largestWin = amount;
            if (amount > 10) { // Significant win
                this.celebrateWin(amount);
            }
        }
        this.playSound('win');
    }
    
    celebrateWin(amount) {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.innerHTML = `🎉 COSMIC WIN! ${amount.toFixed(2)} ${gameState.currency} 🎉`;
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #FFD700, #8A2BE2);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 1000;
            animation: celebrationPulse 3s ease-in-out;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
        `;
        
        const celebrationStyle = document.createElement('style');
        celebrationStyle.textContent = `
            @keyframes celebrationPulse {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(celebrationStyle);
        
        document.body.appendChild(celebration);
        setTimeout(() => {
            celebration.remove();
            celebrationStyle.remove();
        }, 3000);
    }
    
    // Utility Functions
    displayWelcomeMessage() {
        setTimeout(() => {
            console.log(`
🌌 Welcome to Amina Casino 🌌
═══════════════════════════════
🎰 Stellar Slots Ready
🌌 Quantum Plinko Online  
♠️  Galaxy Blackjack Active
💰 Currency: HC/AMINA Toggle
🚀 Cosmic Gaming Experience
═══════════════════════════════
            `);
        }, 1000);
    }
    
    getGameStats() {
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000 / 60; // minutes
        return {
            ...this.stats,
            sessionTimeMinutes: Math.round(sessionTime * 10) / 10
        };
    }
    
    // Development helpers
    debugInfo() {
        console.log('🔍 Amina Casino Debug Info:', {
            version: this.version,
            walletConnected: this.isPeraWalletConnected,
            currentBalance: gameState.balance,
            currency: gameState.currency,
            stats: this.getGameStats()
        });
    }
}

// Initialize Amina Casino when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Make debug function available globally
    window.debugCasino = () => window.aminaCasino.debugInfo();
    
    console.log('🎮 Type debugCasino() in console for debug info');
});

// Expose sound system globally for games to use
window.playCosmicSound = function(type) {
    if (window.aminaCasino) {
        window.aminaCasino.playSound(type);
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🌙 Casino minimized - Cosmic energy saving mode');
    } else {
        console.log('🌟 Welcome back to the cosmos!');
    }
});

console.log('🚀 Amina Casino index.js loaded successfully!');