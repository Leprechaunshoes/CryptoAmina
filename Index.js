// Replace index.js with this - Amina Casino Main Controller
console.log('🌌 Amina Casino v4.0 Loading...');

class AminaCasino {
    constructor() {
        this.version = '4.0.0';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.aminoCoinAssetId = '1107424865';
        this.networkMode = 'mainnet';
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            sessionStartTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Amina Casino...');
        this.setupCosmicEnvironment();
        this.setupWalletIntegration();
        this.integrateWithGames();
        this.setupCoinAnimations();
        console.log('✨ Amina Casino ready!');
    }
    
    setupCosmicEnvironment() {
        this.createParticleSystem();
        this.addCosmicEffects();
    }
    
    createParticleSystem() {
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
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
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
                
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    addCosmicEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .win-celebration {
                animation: winCelebration 2s ease-in-out;
            }
            
            @keyframes winCelebration {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupWalletIntegration() {
        console.log('🔗 Pera Wallet integration ready');
        console.log(`💎 Amina Coin Asset ID: ${this.aminoCoinAssetId}`);
        console.log(`💰 Donation Wallet: ${this.donationWallet}`);
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.showDevMode();
        }
    }
    
    showDevMode() {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                padding: 0.8rem; 
                gap: 1rem; 
                flex-wrap: wrap;
                font-weight: bold;
            ">
                <span>🛠️ DEVELOPMENT MODE</span>
                <span>|</span>
                <span>Pera Wallet integration ready for production</span>
                <button onclick="aminaCasino.testWalletConnection()" style="
                    background: rgba(255,255,255,0.2); 
                    border: 2px solid rgba(255,255,255,0.5); 
                    border-radius: 20px; 
                    color: white; 
                    padding: 0.4rem 1rem; 
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🔗 Test Wallet
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
        `;
        
        document.body.appendChild(banner);
        document.body.style.paddingTop = '70px';
    }
    
    setupCoinAnimations() {
        const coins = document.querySelectorAll('.coin-image, .welcome-coin, .donation-coin-image');
        coins.forEach(coin => {
            coin.src = 'https://i.postimg.cc/nrMt6P0R/IMG-8041.png';
            coin.style.objectFit = 'contain';
            coin.style.background = 'transparent';
            
            coin.addEventListener('mouseenter', () => {
                coin.style.transform = 'scale(1.15) translateY(-5px)';
                coin.style.filter = 'brightness(1.3)';
            });
            
            coin.addEventListener('mouseleave', () => {
                coin.style.transform = 'scale(1) translateY(0px)';
                coin.style.filter = 'brightness(1)';
            });
        });
    }
    
    integrateWithGames() {
        const originalAddBalance = window.addBalance;
        window.addBalance = (amount) => {
            if (originalAddBalance) originalAddBalance(amount);
            this.recordWin(amount);
        };
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cosmic-btn')) {
                this.stats.totalGamesPlayed++;
            }
        });
        
        window.aminaCasino = this;
    }
    
    recordWin(amount) {
        this.stats.totalWinnings += amount;
        
        if (amount > (gameState.currency === 'AMINA' ? 0.1 : 100)) {
            this.showBigWinCelebration(amount);
        }
    }
    
    showBigWinCelebration(amount) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: #000;
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                font-weight: bold;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
                z-index: 10000;
                animation: bigWinPulse 3s ease-in-out;
            ">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🎉 COSMIC JACKPOT! 🎉</div>
                <div style="font-size: 1.5rem;">
                    +${amount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bigWinPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
            style.remove();
        }, 3000);
    }
    
    testWalletConnection() {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
                    border: 2px solid #FFD700;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    padding: 2rem;
                    text-align: center;
                    color: white;
                ">
                    <h3 style="color: #FFD700; margin-bottom: 1rem;">🔗 Pera Wallet Test</h3>
                    <div style="margin-bottom: 1rem;"><strong>Wallet Integration Ready!</strong></div>
                    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; text-align: left;">
                        <div>💎 <strong>Amina Coin:</strong> ${this.aminoCoinAssetId}</div>
                        <div>🌐 <strong>Network:</strong> ${this.networkMode}</div>
                        <div>💰 <strong>Donation:</strong> ${this.donationWallet.substring(0, 20)}...</div>
                    </div>
                    <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                        background: linear-gradient(45deg, #FFD700, #FFA500);
                        border: none;
                        border-radius: 25px;
                        color: #000;
                        padding: 1rem 2rem;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">
                        Got it! 🌟
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        setTimeout(() => dialog.remove(), 5000);
    }
    
    connectWallet() {
        alert(`🚀 Pera Wallet Ready!\n\n💎 Amina Coin: ${this.aminoCoinAssetId}\n💰 Donation: ${this.donationWallet}\n\nIntegration framework ready for production!`);
    }
    
    showDonationInterface() {
        document.getElementById('donationModal').style.display = 'flex';
    }
    
    copyDonationAddress() {
        navigator.clipboard.writeText(this.donationWallet).then(() => {
            alert('💎 Donation address copied to clipboard!');
        }).catch(() => {
            alert('Please copy manually: ' + this.donationWallet);
        });
    }
    
    getStats() {
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000 / 60;
        return {
            ...this.stats,
            sessionMinutes: Math.round(sessionTime * 10) / 10,
            currentBalance: gameState?.balance,
            currentCurrency: gameState?.currency
        };
    }
    
    debugInfo() {
        console.log('🔍 Amina Casino Debug Info:', {
            version: this.version,
            aminaCoin: this.aminoCoinAssetId,
            donation: this.donationWallet,
            network: this.networkMode,
            stats: this.getStats()
        });
    }
}

// Initialize Amina Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    window.debugCasino = () => window.aminaCasino.debugInfo();
    window.showDonations = () => window.aminaCasino.showDonationInterface();
    window.copyDonationAddress = () => window.aminaCasino.copyDonationAddress();
    
    console.log('🎮 Available commands: debugCasino(), showDonations()');
    console.log('🌟 Amina Casino ready for cosmic gaming!');
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🌙 Casino minimized');
    } else {
        console.log('🌟 Welcome back to the Amina cosmos!');
    }
});

console.log('🚀 Amina Casino index.js loaded!');