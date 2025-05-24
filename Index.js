// Amina Casino - Main Controller
console.log('🌌 Amina Casino v4.0 Loading...');

class AminaCasino {
    constructor() {
        this.version = '4.0.0';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.aminaCoinAssetId = '1107424865';
        this.audioContext = null;
        this.musicPlaying = false;
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            sessionStartTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Casino...');
        this.setupAudio();
        this.setupParticles();
        this.setupWallet();
        this.integrateGames();
        this.setupCoins();
        console.log('✨ Casino ready!');
    }
    
    setupAudio() {
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Audio activated');
            }
        }, { once: true });
        
        this.sounds = {
            click: { freq: 800, dur: 0.1 },
            win: { freq: 660, dur: 0.6 },
            bigWin: { freq: 880, dur: 1.0 },
            spin: { freq: 440, dur: 0.3 }
        };
    }
    
    playSound(type, vol = 0.1) {
        if (!this.audioContext || this.audioContext.state !== 'running') return;
        
        const sound = this.sounds[type];
        if (!sound) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = sound.freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(vol, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.dur);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + sound.dur);
    }
    
    setupParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.4;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: Math.random() > 0.5 ? '#FFD700' : '#8A2BE2'
            });
        }
        
        const animate = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                
                if (p.x > window.innerWidth) p.x = 0;
                if (p.x < 0) p.x = window.innerWidth;
                if (p.y > window.innerHeight) p.y = 0;
                if (p.y < 0) p.y = window.innerHeight;
                
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    setupWallet() {
        console.log('🔗 Pera Wallet integration ready');
        console.log(`💎 Amina Coin Asset ID: ${this.aminaCoinAssetId}`);
        console.log(`💰 Donation Wallet: ${this.donationWallet}`);
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.showDevMode();
        }
    }
    
    showDevMode() {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; padding: 0.8rem; gap: 1rem; flex-wrap: wrap;">
                <span>🛠️ DEV MODE</span>
                <span>|</span>
                <span>Pera Wallet Ready for Production</span>
                <button onclick="alert('Wallet integration ready!')" style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 20px; color: white; padding: 0.4rem 1rem; cursor: pointer;">
                    🔗 Test Connection
                </button>
            </div>
        `;
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(45deg, #FF6B35, #F7931E);
            color: white;
            z-index: 1002;
            font-weight: bold;
        `;
        
        document.body.appendChild(banner);
        document.body.style.paddingTop = '70px';
    }
    
    setupCoins() {
        const coins = document.querySelectorAll('.coin-image, .welcome-coin, .donation-coin-image');
        coins.forEach(coin => {
            // Replace with your actual coin image URL when ready
            coin.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9InVybCgjZ3JhZGllbnQwKSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0iIzRBOUZGRiIvPjx0ZXh0IHg9IjUwIiB5PSI1OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkE1MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=';
            
            coin.addEventListener('mouseenter', () => {
                coin.style.transform = 'scale(1.1) rotateY(20deg)';
                coin.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))';
            });
            
            coin.addEventListener('mouseleave', () => {
                coin.style.transform = 'scale(1) rotateY(0deg)';
                coin.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))';
            });
        });
    }
    
    integrateGames() {
        // Hook into game system
        const originalAddBalance = window.addBalance;
        window.addBalance = (amount) => {
            if (originalAddBalance) originalAddBalance(amount);
            this.recordWin(amount);
        };
        
        // Add click sounds
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cosmic-btn')) {
                this.playSound('click');
                this.stats.totalGamesPlayed++;
            }
        });
        
        // Make sounds globally available
        window.playCosmicSound = (type, vol) => this.playSound(type, vol);
    }
    
    recordWin(amount) {
        this.stats.totalWinnings += amount;
        
        // Play win sound
        const soundType = amount > (gameState.currency === 'AMINA' ? 0.01 : 10) ? 'bigWin' : 'win';
        this.playSound(soundType);
        
        // Big win celebration
        if (amount > (gameState.currency === 'AMINA' ? 0.1 : 100)) {
            this.showBigWin(amount);
        }
    }
    
    showBigWin(amount) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="
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
                z-index: 10000;
                text-align: center;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
                animation: bigWinPulse 3s ease-in-out;
            ">
                🎉 COSMIC WIN! 🎉<br>
                +${amount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bigWinPulse {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(celebration);
        setTimeout(() => {
            celebration.remove();
            style.remove();
        }, 3000);
    }
    
    toggleBackgroundMusic() {
        const musicBtn = document.getElementById('musicBtn');
        const icon = musicBtn.querySelector('.music-icon') || musicBtn;
        
        if (!this.musicPlaying) {
            this.musicPlaying = true;
            musicBtn.classList.add('playing');
            icon.textContent = '🎶';
            
            // Show music setup info
            alert('🎵 Music System Ready!\n\nYour YouTube track: https://youtu.be/NjxNnqTcHhg\n\nTo complete: Download → Convert to MP3 → Upload to hosting → Update audio src');
            
            console.log('🎵 Music started (setup mode)');
        } else {
            this.musicPlaying = false;
            musicBtn.classList.remove('playing');
            icon.textContent = '🎵';
            console.log('🎵 Music stopped');
        }
    }
    
    connectWallet() {
        alert(`🔗 Pera Wallet Integration Ready!\n\n💎 Amina Coin: ${this.aminaCoinAssetId}\n💰 Donation: ${this.donationWallet}\n\nNext: Add Pera Wallet SDK to your project!`);
    }
    
    showDonationInterface() {
        document.getElementById('donationModal').style.display = 'flex';
    }
    
    copyDonationAddress() {
        navigator.clipboard.writeText(this.donationWallet).then(() => {
            alert('💎 Donation address copied!');
        }).catch(() => {
            alert('Please copy manually: ' + this.donationWallet);
        });
    }
    
    getStats() {
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000 / 60;
        return {
            ...this.stats,
            sessionMinutes: Math.round(sessionTime * 10) / 10,
            musicPlaying: this.musicPlaying
        };
    }
    
    debugInfo() {
        console.log('🔍 Amina Casino Debug:', {
            version: this.version,
            aminaCoin: this.aminaCoinAssetId,
            donation: this.donationWallet,
            balance: gameState?.balance,
            currency: gameState?.currency,
            stats: this.getStats()
        });
    }
}

// Initialize Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Global functions
    window.debugCasino = () => window.aminaCasino.debugInfo();
    window.showDonations = () => window.aminaCasino.showDonationInterface();
    window.toggleMusic = () => window.aminaCasino.toggleBackgroundMusic();
    
    console.log('🎮 Available commands: debugCasino(), showDonations(), toggleMusic()');
    console.log('🌟 Amina Casino ready for cosmic gaming!');
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🌙 Casino minimized');
    } else {
        console.log('🌟 Welcome back to the cosmos!');
    }
});

console.log('🚀 Amina Casino index.js loaded!');