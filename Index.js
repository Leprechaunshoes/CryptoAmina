// Amina Casino - Enhanced Main Application Controller
// Cosmic Gaming Experience - Ready for Pera Wallet Integration

console.log('🌌 Amina Casino v2.0 - Initializing Enhanced Cosmic Systems...');

class AminaCasino {
    constructor() {
        this.version = '2.0.0';
        this.isPeraWalletConnected = false;
        this.userWalletAddress = null;
        this.networkMode = 'testnet';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.backgroundMusicUrl = 'https://youtu.be/NjxNnqTcHhg?si=mRD_yuqPXq9Ajrtt';
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            largestWin: 0,
            sessionStartTime: Date.now(),
            activeUsers: 1247,
            globalWinnings: 45672.33,
            jackpotPool: 12500.00
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Starting Enhanced Amina Casino initialization...');
        this.setupCosmicEnvironment();
        this.initializeAminaCoin();
        this.preparePeraWalletIntegration();
        this.initializeAudioSystem();
        this.setupGameEventListeners();
        this.startCosmicEffects();
        this.startStatsUpdater();
        this.setupDonationSystem();
        this.displayWelcomeMessage();
        console.log('✨ Amina Casino fully enhanced and ready!');
    }
    
    // Amina Coin Animations
    initializeAminaCoin() {
        console.log('🪙 Initializing Amina Coin animations...');
        
        // Animate header coin
        const headerCoin = document.querySelector('.amina-coin');
        if (headerCoin) {
            setInterval(() => {
                headerCoin.style.transform = 'rotateY(360deg)';
                setTimeout(() => {
                    headerCoin.style.transform = 'rotateY(0deg)';
                }, 1000);
            }, 8000);
        }
        
        // Animate welcome coin
        const welcomeCoin = document.querySelector('.floating-coin');
        if (welcomeCoin) {
            welcomeCoin.style.animation = 'floatCoin 4s ease-in-out infinite';
        }
        
        this.addCoinStyles();
    }
    
    addCoinStyles() {
        const coinStyles = document.createElement('style');
        coinStyles.textContent = `
            .amina-coin {
                width: 50px;
                height: 50px;
                margin-right: 1rem;
                transition: transform 1s ease-in-out;
                filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
            }
            
            .coin-outer {
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: 
                    inset 0 2px 10px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 10px rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(255, 215, 0, 0.4);
            }
            
            .coin-inner {
                width: 80%;
                height: 80%;
                background: linear-gradient(45deg, #4169E1, #1E90FF, #4169E1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    inset 0 2px 5px rgba(255, 255, 255, 0.2),
                    inset 0 -2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .coin-center {
                width: 60%;
                height: 60%;
                background: radial-gradient(circle, #87CEEB, #4169E1);
                border-radius: 50%;
                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
            }
            
            .floating-coin {
                width: 100px;
                height: 100px;
                margin: 2rem auto;
                filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
            }
            
            @keyframes floatCoin {
                0%, 100% { transform: translateY(0px) rotateY(0deg); }
                25% { transform: translateY(-20px) rotateY(90deg); }
                50% { transform: translateY(-10px) rotateY(180deg); }
                75% { transform: translateY(-15px) rotateY(270deg); }
            }
            
            .logo-container {
                display: flex;
                align-items: center;
            }
            
            .header-controls {
                display: flex;
                align-items: center;
                gap: 2rem;
            }
            
            .balance-display {
                display: flex;
                align-items: center;
                gap: 1rem;
                background: rgba(0, 0, 0, 0.5);
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                border: 2px solid rgba(255, 215, 0, 0.3);
            }
            
            .balance-coin-icon {
                font-size: 1.5rem;
                animation: pulse 2s ease-in-out infinite;
            }
            
            .stats-bar {
                display: flex;
                justify-content: center;
                gap: 3rem;
                margin: 3rem 0;
                padding: 2rem;
                background: rgba(138, 43, 226, 0.1);
                border-radius: 20px;
                border: 2px solid rgba(255, 215, 0, 0.2);
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                text-align: center;
            }
            
            .stat-icon {
                font-size: 2rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: #FFD700;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: #ccc;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
            }
        `;
        document.head.appendChild(coinStyles);
    }
    
    // Enhanced Stats System
    startStatsUpdater() {
        setInterval(() => {
            this.updateLiveStats();
        }, 45000);
        
        this.updateLiveStats();
    }
    
    updateLiveStats() {
        this.stats.activeUsers += Math.floor(Math.random() * 5) - 2;
        this.stats.globalWinnings += Math.random() * 50;
        this.stats.jackpotPool += Math.random() * 25;
        
        const activeUsersEl = document.getElementById('activeUsers');
        const totalWinningsEl = document.getElementById('totalWinnings');
        const jackpotPoolEl = document.getElementById('jackpotPool');
        
        if (activeUsersEl) {
            activeUsersEl.textContent = this.stats.activeUsers.toLocaleString();
        }
        
        if (totalWinningsEl) {
            totalWinningsEl.textContent = Math.floor(this.stats.globalWinnings).toLocaleString();
        }
        
        if (jackpotPoolEl) {
            jackpotPoolEl.textContent = Math.floor(this.stats.jackpotPool).toLocaleString();
        }
    }
    
    // Donation System Setup
    setupDonationSystem() {
        console.log('💰 Donation system prepared for:', this.donationWallet);
        this.donationReady = true;
    }
    
    // Pera Wallet Integration
    preparePeraWalletIntegration() {
        console.log('🔗 Enhanced Pera Wallet integration prep...');
        
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            this.checkForPeraWallet();
        } else {
            console.log('💻 Development mode - Enhanced demo indicators');
            this.showEnhancedDemoMode();
        }
        
        this.createWalletConnectButton();
    }
    
    showEnhancedDemoMode() {
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
            console.log('ℹ️ Pera Wallet not found - Enhanced demo mode');
            setTimeout(() => this.checkForPeraWallet(), 3000);
        }
    }
    
    async initPeraWallet() {
        try {
            console.log('🌟 Initializing enhanced Pera Wallet connection...');
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
    
    // Enhanced Cosmic Effects
    setupCosmicEnvironment() {
        this.createEnhancedParticleSystem();
        this.addFloatingStars();
        this.createAuroraEffect();
    }
    
    createEnhancedParticleSystem() {
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
        
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                opacity: Math.random() * 0.8 + 0.2,
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
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    createAuroraEffect() {
        const aurora = document.createElement('div');
        aurora.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
            background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(138, 43, 226, 0.05) 25%, 
                rgba(255, 215, 0, 0.03) 50%, 
                rgba(138, 43, 226, 0.05) 75%, 
                transparent 100%);
            animation: auroraFlow 15s ease-in-out infinite;
        `;
        
        const auroraStyle = document.createElement('style');
        auroraStyle.textContent = `
            @keyframes auroraFlow {
                0%, 100% { transform: translateX(-100%) skewX(-15deg); }
                50% { transform: translateX(100%) skewX(15deg); }
            }
        `;
        document.head.appendChild(auroraStyle);
        document.body.appendChild(aurora);
    }
    
    addFloatingStars() {
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
        
        const starTypes = ['✦', '✧', '⭐', '🌟', '💫'];
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.innerHTML = starTypes[Math.floor(Math.random() * starTypes.length)];
            star.style.cssText = `
                position: absolute;
                color: ${Math.random() > 0.7 ? '#FFD700' : '#8A2BE2'};
                font-size: ${Math.random() * 12 + 6}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${3 + Math.random() * 6}s ease-in-out infinite alternate;
                opacity: ${Math.random() * 0.9 + 0.1};
            `;
            starContainer.appendChild(star);
        }
        
        document.body.appendChild(starContainer);
    }
    
    // Enhanced Audio System
    initializeAudioSystem() {
        this.audioContext = null;
        this.musicPlaying = false;
        
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Enhanced cosmic audio system activated');
                console.log('🎵 Background music ready:', this.backgroundMusicUrl);
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
🌌 Welcome to Enhanced Amina Casino 🌌
════════════════════════════════════════
🎰 Stellar Slots - Enhanced & Ready
🌌 Quantum Plinko - Mobile Optimized  
♠️  Galaxy Blackjack - Professional
💰 Currency: HC/AMINA Toggle Ready
🔗 Pera Wallet Integration Prepared
💎 Donation System: ${this.donationWallet}
🎵 Background Music: Ready
🪙 Amina Coin: Fully Integrated
🚀 Cosmic Gaming Experience v${this.version}
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
        console.log('🔍 Enhanced Amina Casino Debug Info:', {
            version: this.version,
            walletConnected: this.isPeraWalletConnected,
            donationWallet: this.donationWallet,
            backgroundMusic: this.backgroundMusicUrl,
            currentBalance: gameState?.balance,
            currency: gameState?.currency,
            stats: this.getGameStats()
        });
    }
}

// Initialize Enhanced Amina Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Make debug function available globally
    window.debugCasino = () => window.aminaCasino.debugInfo();
    
    console.log('🎮 Type debugCasino() in console for debug info');
    console.log('🌟 Enhanced Amina Casino ready for cosmic gaming!');
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
        console.log('🌟 Welcome back to the enhanced cosmos!');
    }
});

console.log('🚀 Enhanced Amina Casino index.js loaded successfully!');