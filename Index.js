// Amina Casino - Clean Main Application Controller
// Cosmic Gaming Experience - Ready for Pera Wallet Integration

console.log('🌌 Amina Casino v2.1 - Initializing Clean Cosmic Systems...');

class AminaCasino {
    constructor() {
        this.version = '2.1.0';
        this.isPeraWalletConnected = false;
        this.userWalletAddress = null;
        this.networkMode = 'testnet';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.backgroundMusicUrl = 'https://youtu.be/NjxNnqTcHhg?si=mRD_yuqPXq9Ajrtt';
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            largestWin: 0,
            sessionStartTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Starting Clean Amina Casino initialization...');
        this.setupCleanCosmicEnvironment();
        this.preparePeraWalletIntegration();
        this.initializeAudioSystem();
        this.setupGameEventListeners();
        this.setupDonationSystem();
        this.displayWelcomeMessage();
        console.log('✨ Amina Casino clean and ready!');
    }
    
    // Donation System Setup
    setupDonationSystem() {
        console.log('💰 Donation system prepared for:', this.donationWallet);
        this.donationReady = true;
    }
    
    // Pera Wallet Integration
    preparePeraWalletIntegration() {
        console.log('🔗 Pera Wallet integration prep...');
        
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            this.checkForPeraWallet();
        } else {
            console.log('💻 Development mode - Demo indicators');
            this.showDemoMode();
        }
        
        this.createWalletConnectButton();
    }
    
    showDemoMode() {
        const demoBar = document.createElement('div');
        demoBar.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; padding: 0.8rem; gap: 1rem; flex-wrap: wrap; font-weight: bold;">
                <span style="font-size: 1.2rem;">🎮</span>
                <span>DEMO MODE - Playing with House Coins</span>
                <span style="opacity: 0.7;">|</span>
                <span>Connect Pera Wallet for real AMINA trading</span>
                <button onclick="alert('Pera Wallet integration ready!')" style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 20px; color: white; padding: 0.4rem 1rem; cursor: pointer;">
                    🔗 Connect Wallet
                </button>
            </div>
        `;
        demoBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(45deg, #FF6B35, #F7931E, #FFD700);
            color: white;
            z-index: 1001;
            box-shadow: 0 2px 20px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(demoBar);
        document.body.style.paddingTop = '70px';
    }
    
    checkForPeraWallet() {
        if (typeof window.PeraWallet !== 'undefined') {
            console.log('✅ Pera Wallet detected');
            this.initPeraWallet();
        } else {
            console.log('ℹ️ Pera Wallet not found - Demo mode');
            setTimeout(() => this.checkForPeraWallet(), 3000);
        }
    }
    
    async initPeraWallet() {
        try {
            console.log('🌟 Initializing Pera Wallet connection...');
            this.isPeraWalletConnected = true;
            this.updateWalletUI();
        } catch (error) {
            console.error('❌ Pera Wallet connection failed:', error);
        }
    }
    
    createWalletConnectButton() {
        const walletBtn = document.createElement('button');
        walletBtn.innerHTML = '🔗 Connect Pera Wallet';
        walletBtn.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            display: none;
            padding: 0.8rem 1.5rem;
            background: linear-gradient(45deg, #8A2BE2, #9370DB);
            border: 2px solid #FFD700;
            border-radius: 25px;
            color: white;
            cursor: pointer;
        `;
        
        walletBtn.addEventListener('click', () => this.connectWallet());
        document.body.appendChild(walletBtn);
    }
    
    // Clean Cosmic Effects (Less Busy)
    setupCleanCosmicEnvironment() {
        this.createSimpleParticleSystem();
        this.addSubtleStars();
    }
    
    createSimpleParticleSystem() {
        const particleCanvas = document.createElement('canvas');
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
        
        // Reduced particle count for cleaner look
        for (let i = 0; i < 25; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.1,
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
    
    addSubtleStars() {
        const starContainer = document.createElement('div');
        starContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        // Reduced star count for less busy look
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.innerHTML = '✦';
            star.style.cssText = `
                position: absolute;
                color: ${Math.random() > 0.7 ? '#FFD700' : '#8A2BE2'};
                font-size: ${Math.random() * 8 + 4}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: gentleTwinkle ${4 + Math.random() * 8}s ease-in-out infinite alternate;
                opacity: ${Math.random() * 0.6 + 0.2};
            `;
            starContainer.appendChild(star);
        }
        
        const starStyle = document.createElement('style');
        starStyle.textContent = `
            @keyframes gentleTwinkle {
                0% { opacity: 0.2; transform: scale(0.9); }
                100% { opacity: 0.7; transform: scale(1.1); }
            }
        `;
        document.head.appendChild(starStyle);
        
        document.body.appendChild(starContainer);
    }
    
    // Audio System with Background Music Support
    initializeAudioSystem() {
        this.audioContext = null;
        this.backgroundAudio = null;
        this.musicPlaying = false;
        
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Cosmic audio system activated');
                console.log('🎵 Background music ready for implementation');
                this.setupBackgroundMusic();
            }
        }, { once: true });
        
        this.sounds = {
            spin: { frequency: 440, duration: 0.3 },
            win: { frequency: 660, duration: 0.6 },
            bigWin: { frequency: 880, duration: 1.0 },
            lose: { frequency: 220, duration: 0.4 },
            click: { frequency: 800, duration: 0.1 },
            coin: { frequency: 1200, duration: 0.2 }
        };
    }
    
    setupBackgroundMusic() {
        // Prepare background music system
        console.log('🎵 Background music system ready');
        console.log('🎵 Music URL ready:', this.backgroundMusicUrl);
        
        // Create audio controls
        this.createAudioControls();
    }
    
    createAudioControls() {
        const audioControls = document.createElement('div');
        audioControls.innerHTML = `
            <button id="musicToggle" class="audio-btn" onclick="aminaCasino.toggleBackgroundMusic()">
                <span class="audio-icon">🎵</span>
            </button>
        `;
        audioControls.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        
        const audioStyle = document.createElement('style');
        audioStyle.textContent = `
            .audio-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(45deg, #8A2BE2, #9370DB);
                border: 2px solid #FFD700;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.3s ease;
                box-shadow: 0 0 15px rgba(138, 43, 226, 0.3);
            }
            
            .audio-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
            }
            
            .audio-icon {
                display: block;
            }
        `;
        document.head.appendChild(audioStyle);
        
        document.body.appendChild(audioControls);
    }
    
    toggleBackgroundMusic() {
        if (!this.musicPlaying) {
            console.log('🎵 Starting background music...');
            alert('🎵 Background music feature ready for implementation!\n\nYour popcorn song will loop here: ' + this.backgroundMusicUrl);
            this.musicPlaying = true;
            document.querySelector('.audio-icon').textContent = '🔇';
        } else {
            console.log('🎵 Stopping background music...');
            this.musicPlaying = false;
            document.querySelector('.audio-icon').textContent = '🎵';
        }
    }
    
    playSound(type, volume = 0.1) {
        if (!this.audioContext || this.audioContext.state !== 'running') return;
        
        const sound = this.sounds[type];
        if (!sound) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    // Game Event Monitoring
    setupGameEventListeners() {
        const originalAddBalance = window.addBalance || function() {};
        window.addBalance = (amount) => {
            originalAddBalance(amount);
            this.recordWin(amount);
        };
        
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
            if (amount > (gameState.currency === 'AMINA' ? 0.01 : 10)) {
                this.celebrateWin(amount);
            }
        }
        this.playSound(amount > 5 ? 'bigWin' : 'win');
    }
    
    celebrateWin(amount) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `🎉 COSMIC WIN! ${amount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency} 🎉`;
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
🌌 Welcome to Clean Amina Casino 🌌
════════════════════════════════════════
🎰 Stellar Slots - Ready
🌌 Quantum Plinko - Mobile Fixed  
♠️  Galaxy Blackjack - Professional
💰 Currency: HC/AMINA Toggle
🔗 Pera Wallet Integration Prepared
💎 Donation System: ${this.donationWallet}
🎵 Background Music: Ready for Implementation
🚀 Clean Cosmic Gaming Experience v${this.version}
════════════════════════════════════════
            `);
        }, 1000);
    }
    
    getGameStats() {
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000 / 60;
        return {
            ...this.stats,
            sessionTimeMinutes: Math.round(sessionTime * 10) / 10
        };
    }
    
    debugInfo() {
        console.log('🔍 Clean Amina Casino Debug Info:', {
            version: this.version,
            walletConnected: this.isPeraWalletConnected,
            donationWallet: this.donationWallet,
            backgroundMusic: this.backgroundMusicUrl,
            musicPlaying: this.musicPlaying,
            currentBalance: gameState?.balance,
            currency: gameState?.currency,
            stats: this.getGameStats()
        });
    }
}

// Initialize Clean Amina Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Make debug function available globally
    window.debugCasino = () => window.aminaCasino.debugInfo();
    
    console.log('🎮 Type debugCasino() in console for debug info');
    console.log('🌟 Clean Amina Casino ready for cosmic gaming!');
});

// Enhanced sound system globally available
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
        console.log('🌟 Welcome back to the clean cosmos!');
    }
});

console.log('🚀 Clean Amina Casino index.js loaded successfully!');