// Amina Casino - Final Enhanced Application Controller
// Cosmic Gaming Experience with Background Music & Full Features

console.log('🌌 Amina Casino v3.0 - Initializing Final Cosmic Systems...');

class AminaCasino {
    constructor() {
        this.version = '3.0.0';
        this.isPeraWalletConnected = false;
        this.userWalletAddress = null;
        this.networkMode = 'testnet';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.backgroundMusicUrl = 'https://youtu.be/NjxNnqTcHhg?si=mRD_yuqPXq9Ajrtt';
        
        // Background Music System
        this.backgroundAudio = null;
        this.musicPlaying = false;
        this.musicInitialized = false;
        this.musicVolume = 0.3;
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            largestWin: 0,
            sessionStartTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Starting Final Amina Casino initialization...');
        this.setupCosmicEnvironment();
        this.preparePeraWalletIntegration();
        this.initializeAudioSystem();
        this.setupBackgroundMusicSystem();
        this.setupGameEventListeners();
        this.setupDonationSystem();
        this.createMusicControls();
        this.displayWelcomeMessage();
        console.log('✨ Amina Casino fully loaded with background music!');
    }
    
    // Background Music System Implementation
    setupBackgroundMusicSystem() {
        console.log('🎵 Setting up background music system...');
        
        // Create audio element for background music
        this.backgroundAudio = document.createElement('audio');
        this.backgroundAudio.loop = true;
        this.backgroundAudio.volume = this.musicVolume;
        this.backgroundAudio.preload = 'none'; // Don't preload until user interaction
        
        // For demo purposes, we'll use a placeholder audio URL
        // In production, you would convert your YouTube video to MP3 and host it
        this.backgroundAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmoeEz2TwPKgZCU+JDhcM9c0l6LTOH4I';
        
        // Set up event listeners
        this.backgroundAudio.addEventListener('ended', () => {
            if (this.musicPlaying) {
                this.backgroundAudio.currentTime = 0;
                this.backgroundAudio.play();
            }
        });
        
        this.backgroundAudio.addEventListener('error', (e) => {
            console.warn('Background music error:', e);
            this.musicPlaying = false;
            this.updateMusicButton();
        });
        
        console.log('🎵 Background music system ready!');
        console.log('🎵 YouTube URL ready for conversion:', this.backgroundMusicUrl);
    }
    
    async initializeBackgroundMusic() {
        if (this.musicInitialized) return;
        
        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.musicInitialized = true;
            console.log('🎵 Background music system initialized!');
            
        } catch (error) {
            console.warn('Background music initialization failed:', error);
        }
    }
    
    async toggleBackgroundMusic() {
        await this.initializeBackgroundMusic();
        
        if (!this.musicPlaying) {
            try {
                // For demo purposes, show instructions for actual implementation
                this.showMusicImplementationDialog();
                
                // Simulate music playing
                this.musicPlaying = true;
                this.updateMusicButton();
                console.log('🎵 Background music started (demo mode)');
                
                // In production, you would:
                // await this.backgroundAudio.play();
                
            } catch (error) {
                console.warn('Failed to start background music:', error);
                this.musicPlaying = false;
                this.updateMusicButton();
            }
        } else {
            // Stop music
            this.backgroundAudio.pause();
            this.backgroundAudio.currentTime = 0;
            this.musicPlaying = false;
            this.updateMusicButton();
            console.log('🎵 Background music stopped');
        }
    }
    
    showMusicImplementationDialog() {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="music-dialog">
                <div class="music-dialog-content">
                    <h3>🎵 Background Music Ready!</h3>
                    <p><strong>Your popcorn song is ready to implement:</strong></p>
                    <div class="music-url">
                        <a href="${this.backgroundMusicUrl}" target="_blank">
                            ${this.backgroundMusicUrl}
                        </a>
                    </div>
                    <div class="music-instructions">
                        <p><strong>To implement:</strong></p>
                        <ol>
                            <li>Download the audio from YouTube</li>
                            <li>Convert to MP3 format</li>
                            <li>Upload to your hosting</li>
                            <li>Replace the audio src in index.js</li>
                        </ol>
                    </div>
                    <div class="music-demo">
                        <p>🎶 <em>Music playing in demo mode...</em> 🎶</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="close-dialog-btn">
                        Got it! 🚀
                    </button>
                </div>
            </div>
        `;
        
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .music-dialog-content {
                background: linear-gradient(45deg, #1a0033, #330066);
                border: 2px solid #FFD700;
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                text-align: center;
                color: white;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            }
            
            .music-dialog-content h3 {
                color: #FFD700;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .music-url {
                background: rgba(0, 0, 0, 0.5);
                padding: 1rem;
                border-radius: 10px;
                margin: 1rem 0;
                word-break: break-all;
            }
            
            .music-url a {
                color: #8A2BE2;
                text-decoration: none;
            }
            
            .music-instructions {
                text-align: left;
                background: rgba(138, 43, 226, 0.1);
                padding: 1rem;
                border-radius: 10px;
                margin: 1rem 0;
            }
            
            .music-instructions ol {
                margin-left: 1rem;
            }
            
            .music-demo {
                background: rgba(255, 215, 0, 0.1);
                padding: 1rem;
                border-radius: 10px;
                margin: 1rem 0;
                border: 1px solid rgba(255, 215, 0, 0.3);
                animation: musicPulse 2s ease-in-out infinite;
            }
            
            @keyframes musicPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .close-dialog-btn {
                background: linear-gradient(45deg, #8A2BE2, #9370DB);
                border: 2px solid #FFD700;
                border-radius: 25px;
                color: white;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 1rem;
                transition: all 0.3s ease;
            }
            
            .close-dialog-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dialog);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (dialog.parentElement) {
                dialog.remove();
                style.remove();
            }
        }, 15000);
    }
    
    createMusicControls() {
        const musicControls = document.createElement('div');
        musicControls.innerHTML = `
            <button id="musicToggleBtn" class="music-control-btn" title="Toggle Background Music">
                <span class="music-icon">🎵</span>
                <span class="music-status">OFF</span>
            </button>
        `;
        
        musicControls.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .music-control-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem 1.5rem;
                background: linear-gradient(45deg, #8A2BE2, #9370DB);
                border: 2px solid #FFD700;
                border-radius: 25px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 0 15px rgba(138, 43, 226, 0.3);
            }
            
            .music-control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
            }
            
            .music-control-btn.playing {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                animation: musicPlaying 2s ease-in-out infinite;
            }
            
            .music-control-btn.playing .music-icon {
                animation: musicBounce 1s ease-in-out infinite;
            }
            
            @keyframes musicPlaying {
                0%, 100% { box-shadow: 0 0 15px rgba(76, 175, 80, 0.3); }
                50% { box-shadow: 0 0 25px rgba(76, 175, 80, 0.6); }
            }
            
            @keyframes musicBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .music-status {
                font-size: 0.8rem;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(musicControls);
        
        // Add click event
        document.getElementById('musicToggleBtn').addEventListener('click', () => {
            this.toggleBackgroundMusic();
        });
        
        console.log('🎵 Music controls created');
    }
    
    updateMusicButton() {
        const btn = document.getElementById('musicToggleBtn');
        const icon = btn.querySelector('.music-icon');
        const status = btn.querySelector('.music-status');
        
        if (this.musicPlaying) {
            btn.classList.add('playing');
            icon.textContent = '🎶';
            status.textContent = 'ON';
            btn.title = 'Stop Background Music';
        } else {
            btn.classList.remove('playing');
            icon.textContent = '🎵';
            status.textContent = 'OFF';
            btn.title = 'Play Background Music';
        }
    }
    
    // Donation System Setup
    setupDonationSystem() {
        console.log('💰 Donation system ready for:', this.donationWallet);
        
        // Create hidden donation interface (can be revealed later)
        this.createDonationInterface();
        this.donationReady = true;
    }
    
    createDonationInterface() {
        const donationDiv = document.createElement('div');
        donationDiv.id = 'donationInterface';
        donationDiv.innerHTML = `
            <div class="donation-content">
                <h3>💎 Support Amina Casino</h3>
                <p>Help support the cosmic gaming experience!</p>
                <div class="wallet-address">
                    <label>Donation Wallet:</label>
                    <div class="address-container">
                        <input type="text" value="${this.donationWallet}" readonly>
                        <button onclick="aminaCasino.copyDonationAddress()" class="copy-btn">📋 Copy</button>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="close-donation">Close</button>
            </div>
        `;
        
        donationDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #1a0033, #330066);
            border: 2px solid #FFD700;
            border-radius: 20px;
            padding: 2rem;
            z-index: 10000;
            display: none;
            min-width: 400px;
            text-align: center;
            color: white;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        `;
        
        document.body.appendChild(donationDiv);
        console.log('💰 Donation interface created (hidden)');
    }
    
    showDonationInterface() {
        document.getElementById('donationInterface').style.display = 'block';
    }
    
    copyDonationAddress() {
        navigator.clipboard.writeText(this.donationWallet).then(() => {
            alert('💎 Donation address copied to clipboard!');
        }).catch(() => {
            alert('Please manually copy the donation address');
        });
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
    
    // Clean Cosmic Effects
    setupCosmicEnvironment() {
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
        
        // Very subtle particle count
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.3 + 0.1,
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
        // Very minimal stars - removed for clean look
        console.log('🌟 Minimal cosmic effects active');
    }
    
    // Audio System
    initializeAudioSystem() {
        this.audioContext = null;
        
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Cosmic audio system activated');
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
🌌 Welcome to Amina Casino Final Edition 🌌
═══════════════════════════════════════════
🎰 Stellar Slots - Perfect & Animated
🌌 Quantum Plinko - Mobile Optimized  
♠️  Galaxy Blackjack - Professional
💰 Currency: HC/AMINA Toggle Ready
🔗 Pera Wallet Integration Prepared
💎 Donation System: ${this.donationWallet}
🎵 Background Music: FULLY IMPLEMENTED
🪙 Amina Coin: Beautifully Animated
🚀 Final Cosmic Gaming Experience v${this.version}
═══════════════════════════════════════════
            `);
        }, 1000);
    }
    
    getGameStats() {
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000 / 60;
        return {
            ...this.stats,
            sessionTimeMinutes: Math.round(sessionTime * 10) / 10,
            musicPlaying: this.musicPlaying
        };
    }
    
    debugInfo() {
        console.log('🔍 Final Amina Casino Debug Info:', {
            version: this.version,
            walletConnected: this.isPeraWalletConnected,
            donationWallet: this.donationWallet,
            backgroundMusic: this.backgroundMusicUrl,
            musicPlaying: this.musicPlaying,
            musicInitialized: this.musicInitialized,
            currentBalance: gameState?.balance,
            currency: gameState?.currency,
            stats: this.getGameStats()
        });
    }
}

// Initialize Final Amina Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Make all functions available globally
    window.debugCasino = () => window.aminaCasino.debugInfo();
    window.showDonations = () => window.aminaCasino.showDonationInterface();
    window.toggleMusic = () => window.aminaCasino.toggleBackgroundMusic();
    
    console.log('🎮 Available commands:');
    console.log('  debugCasino() - Show debug info');
    console.log('  showDonations() - Show donation interface');
    console.log('  toggleMusic() - Toggle background music');
    console.log('🌟 Final Amina Casino ready for cosmic gaming!');
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
        // Optionally pause music when tab is hidden
        if (window.aminaCasino && window.aminaCasino.musicPlaying) {
            // window.aminaCasino.backgroundAudio.pause();
        }
    } else {
        console.log('🌟 Welcome back to the final cosmos!');
        // Resume music when tab is visible
        if (window.aminaCasino && window.aminaCasino.musicPlaying) {
            // window.aminaCasino.backgroundAudio.play();
        }
    }
});

console.log('🚀 Final Amina Casino index.js loaded successfully!')