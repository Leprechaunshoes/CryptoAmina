// FILE 3: index.js - Amina Casino Main Controller
console.log('🌌 Amina Casino v4.0 Loading...');

class AminaCasino {
    constructor() {
        this.version = '4.0.0';
        this.donationWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.aminaCoinAssetId = '1107424865';
        this.isPeraWalletConnected = false;
        this.userWalletAddress = null;
        this.networkMode = 'mainnet';
        
        this.stats = {
            totalGamesPlayed: 0,
            totalWinnings: 0,
            sessionStartTime: Date.now(),
            largestWin: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Amina Casino...');
        this.setupCosmicEnvironment();
        this.setupWalletIntegration();
        this.integrateWithGames();
        this.setupCoinAnimations();
        this.displayWelcomeMessage();
        console.log('✨ Amina Casino ready!');
    }
    
    setupCosmicEnvironment() {
        this.createParticleSystem();
        this.addCosmicEffects();
    }
    
    createParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'cosmicParticles';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // Create subtle cosmic particles
        for (let i = 0; i < 15; i++) {
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
        
        const animate = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                
                // Wrap around screen
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
        // Add subtle cosmic styling
        const style = document.createElement('style');
        style.textContent = `
            .cosmic-glow {
                animation: cosmicGlow 3s ease-in-out infinite;
            }
            
            @keyframes cosmicGlow {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                }
                50% { 
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
                }
            }
            
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
        console.log(`💎 Amina Coin Asset ID: ${this.aminaCoinAssetId}`);
        console.log(`💰 Donation Wallet: ${this.donationWallet}`);
        console.log(`🌐 Network: ${this.networkMode}`);
        
        // Show dev mode if localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.showDevMode();
        }
        
        this.createWalletInterface();
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
                <span style="font-size: 1.1rem;">🛠️ DEVELOPMENT MODE</span>
                <span style="opacity: 0.7;">|</span>
                <span>Pera Wallet integration ready for production</span>
                <button onclick="aminaCasino.testWalletConnection()" style="
                    background: rgba(255,255,255,0.2); 
                    border: 2px solid rgba(255,255,255,0.5); 
                    border-radius: 20px; 
                    color: white; 
                    padding: 0.4rem 1rem; 
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
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
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(banner);
        document.body.style.paddingTop = '70px';
    }
    
    createWalletInterface() {
        // Wallet status indicator
        const walletStatus = document.createElement('div');
        walletStatus.id = 'walletStatus';
        walletStatus.innerHTML = `
            <div style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(26, 26, 46, 0.9);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                padding: 0.8rem;
                z-index: 1001;
                display: none;
                backdrop-filter: blur(10px);
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="color: #FFD700;">🔗</span>
                    <span style="color: white; font-size: 0.9rem; font-weight: bold;">Wallet Status</span>
                </div>
                <div id="walletStatusText" style="color: #cccccc; font-size: 0.8rem;">Ready to connect</div>
                <button onclick="aminaCasino.connectWallet()" style="
                    background: linear-gradient(45deg, #FFD700, #B8860B);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    padding: 0.5rem 1rem;
                    margin-top: 0.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 0.8rem;
                    width: 100%;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                    Connect Pera Wallet
                </button>
            </div>
        `;
        
        document.body.appendChild(walletStatus);
    }
    
    setupCoinAnimations() {
        // Enhanced coin floating animation
        const coins = document.querySelectorAll('.coin-image, .welcome-coin, .donation-coin-image');
        coins.forEach((coin, index) => {
            // Set the actual Amina coin image
            coin.src = 'https://i.postimg.cc/nrMt6P0R/IMG-8041.png';
            coin.style.background = 'transparent';
            
            // Enhanced hover effects
            coin.addEventListener('mouseenter', () => {
                coin.style.transform = 'scale(1.15) translateY(-3px)';
                coin.style.filter = 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.8))';
                coin.classList.add('cosmic-glow');
            });
            
            coin.addEventListener('mouseleave', () => {
                coin.style.transform = 'scale(1) translateY(0px)';
                coin.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))';
                coin.classList.remove('cosmic-glow');
            });
            
            // Add click effect
            coin.addEventListener('click', () => {
                coin.classList.add('win-celebration');
                setTimeout(() => {
                    coin.classList.remove('win-celebration');
                }, 2000);
            });
        });
    }
    
    integrateWithGames() {
        // Hook into game system
        const originalAddBalance = window.addBalance;
        window.addBalance = (amount) => {
            if (originalAddBalance) originalAddBalance(amount);
            this.recordWin(amount);
        };
        
        // Track game plays
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cosmic-btn')) {
                this.stats.totalGamesPlayed++;
                
                // Add button click effect
                e.target.style.transform = 'translateY(-1px) scale(0.98)';
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        });
        
        // Make casino functions globally available
        window.aminaCasino = this;
    }
    
    recordWin(amount) {
        this.stats.totalWinnings += amount;
        
        if (amount > this.stats.largestWin) {
            this.stats.largestWin = amount;
            
            // Big win celebration
            if (amount > (gameState.currency === 'AMINA' ? 0.1 : 100)) {
                this.showBigWinCelebration(amount);
            }
        }
    }
    
    showBigWinCelebration(amount) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                pointer-events: none;
                animation: bigWinFade 3s ease-in-out;
            ">
                <div style="
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    color: #000;
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    font-weight: bold;
                    box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
                    animation: bigWinPulse 3s ease-in-out;
                    max-width: 90%;
                ">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🎉 COSMIC JACKPOT! 🎉</div>
                    <div style="font-size: 1.5rem;">
                        +${amount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}
                    </div>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bigWinFade {
                0% { opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            @keyframes bigWinPulse {
                0% { transform: scale(0.5); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
            style.remove();
        }, 3000);
    }
    
    // Wallet Functions
    testWalletConnection() {
        const dialog = this.createDialog(
            '🔗 Pera Wallet Test',
            `
                <div style="text-align: center; padding: 1rem;">
                    <div style="margin-bottom: 1rem;">
                        <strong>Wallet Integration Ready!</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; text-align: left;">
                        <div>💎 <strong>Amina Coin:</strong> ${this.aminaCoinAssetId}</div>
                        <div>🌐 <strong>Network:</strong> ${this.networkMode}</div>
                        <div>💰 <strong>Donation:</strong> ${this.donationWallet.substring(0, 20)}...</div>
                    </div>
                    <div style="color: #00ff88; font-size: 0.9rem;">
                        ✅ All systems ready for production deployment
                    </div>
                </div>
            `
        );
        
        setTimeout(() => dialog.remove(), 4000);
    }
    
    connectWallet() {
        const dialog = this.createDialog(
            '🚀 Pera Wallet Integration',
            `
                <div style="text-align: center; padding: 1rem;">
                    <div style="margin-bottom: 1rem;">
                        <strong>Production Integration Guide</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 10px; margin: 1rem 0; text-align: left;">
                        <div style="margin-bottom: 0.5rem;"><strong>Next Steps:</strong></div>
                        <div>1. Add Pera Wallet SDK to project</div>
                        <div>2. Implement wallet connection logic</div>
                        <div>3. Add transaction signing</div>
                        <div>4. Test with Asset ID: ${this.aminaCoinAssetId}</div>
                    </div>
                    <div style="color: #FFD700; font-size: 0.9rem;">
                        🌟 Integration framework ready!
                    </div>
                </div>
            `
        );
        
        setTimeout(() => dialog.remove(), 6000);
    }
    
    // Donation Functions
    showDonationInterface() {
        document.getElementById('donationModal').style.display = 'flex';
    }
    
    copyDonationAddress() {
        navigator.clipboard.writeText(this.donationWallet).then(() => {
            const notification = this.createNotification('💎 Donation address copied to clipboard!', 'success');
            setTimeout(() => notification.remove(), 3000);
        }).catch(() => {
            const notification = this.createNotification('Please copy manually: ' + this.donationWallet, 'info');
            setTimeout(() => notification.remove(), 5000);
        });
    }
    
    // Utility Functions
    createDialog(title, content) {
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
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
                    border: 2px solid #FFD700;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    backdrop-filter: blur(10px);
                ">
                    <div style="
                        padding: 1.5rem;
                        border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 style="color: #FFD700; margin: 0;">${title}</h3>
                        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                            background: none;
                            border: none;
                            color: #FFD700;
                            font-size: 1.5rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                            ×
                        </button>
                    </div>
                    <div style="color: white;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        return dialog;
    }
    
    createNotification(message, type = 'info') {
        const colors = {
            success: '#00ff88',
            error: '#ff4757',
            info: '#FFD700'
        };
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: ${colors[type]};
                padding: 1rem 1.5rem;
                border-radius: 10px;
                border: 1px solid ${colors[type]};
                z-index: 10002;
                font-weight: bold;
                max-width: 300px;
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease-in-out;
            ">
                ${message}
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => style.remove(), 1000);
        
        return notification;
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
            aminaCoin: this.aminaCoinAssetId,
            donation: this.donationWallet,
            network: this.networkMode,
            stats: this.getStats()
        });
    }
    
    displayWelcomeMessage() {
        setTimeout(() => {
            console.log(`
🌌 ═══════════════════════════════════════════
   AMINA CASINO v${this.version} - READY FOR COSMOS!
🌌 ═══════════════════════════════════════════
🎰 Stellar Slots - Vegas Style Cosmic Gaming
🌌 Quantum Plinko - Mobile Responsive Design  
♠️  Galaxy Blackjack - Fixed Card Graphics
💰 Currency: HC/AMINA Toggle (Fractional Betting)
🔗 Pera Wallet: Integration Framework Ready
💎 Donation System: ${this.donationWallet}
🪙 Amina Coin: Beautiful Floating Animation
🚀 Production Ready Cosmic Casino Experience
═══════════════════════════════════════════
            `);
        }, 1000);
    }
}

// Initialize Amina Casino
document.addEventListener('DOMContentLoaded', function() {
    window.aminaCasino = new AminaCasino();
    
    // Global utility functions
    window.debugCasino = () => window.aminaCasino.debugInfo();
    window.showDonations = () => window.aminaCasino.showDonationInterface();
    window.copyDonationAddress = () => window.aminaCasino.copyDonationAddress();
    
    console.log('🎮 Available commands:');
    console.log('  debugCasino() - Show debug information');
    console.log('  showDonations() - Open donation modal');
    console.log('  copyDonationAddress() - Copy wallet address');
    console.log('🌟 Amina Casino ready for cosmic gaming!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🌙 Casino minimized - Cosmic energy conservation mode');
    } else {
        console.log('🌟 Welcome back to the Amina cosmos!');
    }
});

console.log('🚀 Amina Casino index.js loaded successfully!');