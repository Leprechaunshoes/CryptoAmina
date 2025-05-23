// Amina Casino Luxury Wallet Integration & Transaction Management
// Royal-grade crypto casino backend logic

class AminaCasinoWallet {
    constructor() {
        // Wallet Configuration
        this.isConnected = false;
        this.isAminaMode = false;
        this.walletAddress = null;
        this.peraWallet = null;
        
        // Balance Management
        this.houseCoins = 1000;
        this.aminaBalance = 0;
        this.lastDailyBonus = null;
        
        // Casino Economics
        this.houseRake = 0.05; // 5% house edge
        this.minBet = 0.25;
        this.maxBet = 100;
        
        // Amina Coin Configuration
        this.aminaAsaId = 1107424865;
        this.donationAddress = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.houseWalletAddress = null; // Set this to your house wallet
        
        // Statistics Tracking
        this.stats = {
            totalBets: 0,
            totalWins: 0,
            biggestWin: 0,
            sessionsPlayed: 0,
            luxuryLevel: 'Royal' // New luxury feature
        };
        
        this.initializeWallet();
    }

    async initializeWallet() {
        try {
            // Load saved data
            this.loadSavedData();
            
            // Initialize Pera Wallet connection (mock for now)
            // In production, replace with: this.peraWallet = new PeraWalletConnect();
            
            // Update UI
            this.updateUI();
            this.setupEventListeners();
            this.initializeLuxuryEffects();
            
            console.log('👑 Amina Casino Royal Wallet initialized successfully');
        } catch (error) {
            console.error('Wallet initialization failed:', error);
            this.showLuxuryNotification('Wallet initialization failed', 'error');
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('aminaCasinoWallet');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.houseCoins = data.houseCoins || 1000;
                this.lastDailyBonus = data.lastDailyBonus;
                this.stats = { ...this.stats, ...data.stats };
            }
        } catch (error) {
            console.log('No saved data found, using royal defaults');
        }
    }

    setupEventListeners() {
        // Mode Toggle
        document.getElementById('modeToggle')?.addEventListener('change', (e) => {
            this.toggleMode(e.target.checked);
        });

        // Wallet Connection
        document.getElementById('connectWallet')?.addEventListener('click', () => {
            this.handleWalletConnection();
        });

        // Donation
        document.getElementById('donateBtn')?.addEventListener('click', () => {
            this.handleDonation();
        });

        // Daily Bonus
        document.getElementById('dailyBonus')?.addEventListener('click', () => {
            this.claimDailyBonus();
        });

        // Bet Adjustment Controls
        document.querySelectorAll('.bet-adjust').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.adjustBet(e.target);
            });
        });
    }

    initializeLuxuryEffects() {
        // Add royal particle effects on page load
        this.createLuxuryParticles();
        
        // Add subtle animations to luxury elements
        this.enhanceLuxuryElements();
    }

    createLuxuryParticles() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createRoyalParticle();
            }, i * 1000);
        }
    }

    createRoyalParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['✨', '💎', '👑', '🌟', '⭐'][Math.floor(Math.random() * 5)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 9998;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight + 50}px;
            animation: royalFloat 8s ease-out forwards;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 8000);
    }

    enhanceLuxuryElements() {
        // Add luxury hover effects to buttons
        document.querySelectorAll('.game-btn, .wallet-btn, .donate-btn, .daily-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.addLuxuryHoverEffect(btn);
            });
        });
    }

    addLuxuryHoverEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 1.2rem;
            pointer-events: none;
            animation: sparkleHover 0.6s ease-out forwards;
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 600);
    }

    toggleMode(isAminaMode) {
        this.isAminaMode = isAminaMode;
        
        if (isAminaMode && !this.isConnected) {
            this.showLuxuryNotification('Connect your royal Pera Wallet to access Amina treasures', 'warning');
            // Reset toggle if wallet not connected
            setTimeout(() => {
                document.getElementById('modeToggle').checked = false;
                this.isAminaMode = false;
            }, 100);
            return;
        }
        
        this.updateUI();
        this.showLuxuryNotification(
            `Switched to ${isAminaMode ? 'Amina Royal' : 'House Coins'} mode`, 
            'success'
        );
        
        // Add luxury mode switch effect
        this.triggerLuxuryModeEffect();
    }

    triggerLuxuryModeEffect() {
        // Create royal transition effect
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createRoyalParticle();
            }, i * 100);
        }
    }

    async handleWalletConnection() {
        try {
            if (!this.isConnected) {
                await this.connectWallet();
            } else {
                this.disconnectWallet();
            }
        } catch (error) {
            console.error('Royal wallet connection error:', error);
            this.showLuxuryNotification('Royal wallet connection failed', 'error');
        }
    }

    async connectWallet() {
        this.showLuxuryNotification('Connecting to your royal Pera Wallet...', 'info');
        
        try {
            // PRODUCTION CODE: Replace this mock connection with real Pera Wallet integration
            /*
            this.peraWallet = new PeraWalletConnect();
            const accounts = await this.peraWallet.connect();
            this.walletAddress = accounts[0];
            
            // Get Amina balance
            const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
            const accountInfo = await algodClient.accountInformation(this.walletAddress).do();
            
            // Find Amina asset balance
            const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === this.aminaAsaId);
            this.aminaBalance = aminaAsset ? aminaAsset.amount / 1000000 : 0; // Convert from microAmina
            */
            
            // DEMO MODE: Mock wallet connection
            await new Promise(resolve => setTimeout(resolve, 2500));
            this.isConnected = true;
            this.walletAddress = 'ROYAL_' + this.generateMockAddress();
            this.aminaBalance = 42.75; // Mock balance for demo
            
            this.showLuxuryNotification('👑 Royal wallet connected successfully!', 'success');
            this.updateUI();
            
            // Track connection
            this.stats.sessionsPlayed++;
            this.saveData();
            
            // Celebration effect
            this.triggerRoyalCelebration();
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.showLuxuryNotification('Failed to connect royal wallet', 'error');
        }
    }

    disconnectWallet() {
        // PRODUCTION CODE: Disconnect Pera Wallet
        // if (this.peraWallet) {
        //     this.peraWallet.disconnect();
        // }
        
        this.isConnected = false;
        this.walletAddress = null;
        this.aminaBalance = 0;
        this.isAminaMode = false;
        
        // Reset UI
        document.getElementById('modeToggle').checked = false;
        this.updateUI();
        
        this.showLuxuryNotification('👑 Royal wallet disconnected', 'info');
    }

    async handleDonation() {
        if (!this.isConnected) {
            this.showLuxuryNotification('Please connect your royal wallet first', 'error');
            return;
        }

        const amount = this.promptForAmount('Enter your royal donation amount in Amina Coins:');
        if (!amount) return;

        if (amount > this.aminaBalance) {
            this.showLuxuryNotification('Insufficient Amina treasures for donation', 'error');
            return;
        }

        try {
            this.showLuxuryNotification(`Processing royal donation of ${amount} Amina...`, 'info');
            
            // PRODUCTION CODE: Send actual Algorand transaction
            /*
            const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
            const params = await algodClient.getTransactionParams().do();
            
            const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                this.walletAddress,
                this.donationAddress,
                undefined,
                undefined,
                amount * 1000000, // Convert to microAmina
                undefined,
                this.aminaAsaId,
                params
            );
            
            const signedTxn = await this.peraWallet.signTransaction([txn]);
            const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
            await algosdk.waitForConfirmation(algodClient, txId, 4);
            */
            
            // DEMO MODE: Mock transaction
            await new Promise(resolve => setTimeout(resolve, 3500));
            
            this.showLuxuryNotification(
                `👑 Thank you for your generous royal donation of ${amount} Amina! ✨`, 
                'success'
            );
            
            // Royal celebration for donation
            this.triggerRoyalCelebration();
            
        } catch (error) {
            console.error('Donation failed:', error);
            this.showLuxuryNotification('Royal donation transaction failed', 'error');
        }
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        
        if (this.lastDailyBonus === today) {
            this.showLuxuryNotification('👑 Daily royal bonus already claimed today!', 'warning');
            return;
        }

        const bonusAmount = 1000;
        this.houseCoins += bonusAmount;
        this.lastDailyBonus = today;
        
        this.saveData();
        this.updateUI();
        
        this.showLuxuryNotification(`👑 Daily royal bonus claimed! +${bonusAmount} House Coins`, 'success');
        
        // Royal celebration effect
        this.triggerRoyalCelebration();
    }

    adjustBet(button) {
        const action = button.getAttribute('data-action');
        const game = button.getAttribute('data-game') || 'slot';
        
        let inputId;
        switch (game) {
            case 'blackjack': inputId = 'blackjackBet'; break;
            case 'plinko': inputId = 'plinkoBet'; break;
            default: inputId = 'slotBet'; break;
        }
        
        const input = document.getElementById(inputId);
        if (!input) return;
        
        let currentValue = parseFloat(input.value) || this.minBet;
        const step = 0.25;
        
        if (action === 'increase') {
            currentValue = Math.min(currentValue + step, this.maxBet);
        } else {
            currentValue = Math.max(currentValue - step, this.minBet);
        }
        
        input.value = currentValue.toFixed(2);
        
        // Update betting circle for blackjack
        if (game === 'blackjack') {
            const betDisplay = document.getElementById('currentBet');
            if (betDisplay) {
                betDisplay.textContent = currentValue.toFixed(2);
            }
        }
        
        // Add luxury effect to bet adjustment
        this.addLuxuryHoverEffect(button);
    }

    getBalance() {
        return this.isAminaMode ? this.aminaBalance : this.houseCoins;
    }

    getCurrency() {
        return this.isAminaMode ? 'AMINA' : 'HC';
    }

    async canPlaceBet(amount) {
        if (!amount || isNaN(amount) || amount < this.minBet) {
            this.showLuxuryNotification(`👑 Minimum royal bet is ${this.minBet} ${this.getCurrency()}`, 'error');
            return false;
        }

        if (amount > this.maxBet) {
            this.showLuxuryNotification(`👑 Maximum royal bet is ${this.maxBet} ${this.getCurrency()}`, 'error');
            return false;
        }

        if (this.isAminaMode && !this.isConnected) {
            this.showLuxuryNotification('Please connect your royal wallet for Amina mode', 'error');
            return false;
        }
        
        const balance = this.getBalance();
        if (amount > balance) {
            this.showLuxuryNotification(
                `👑 Insufficient royal treasury. You have ${balance.toFixed(2)} ${this.getCurrency()}`, 
                'error'
            );
            return false;
        }
        
        return true;
    }

    async placeBet(amount) {
        if (!await this.canPlaceBet(amount)) {
            return false;
        }

        try {
            if (this.isAminaMode) {
                await this.processAminaTransaction(amount, 'bet');
                this.aminaBalance -= amount;
            } else {
                this.houseCoins -= amount;
            }
            
            // Update statistics
            this.stats.totalBets++;
            
            this.updateUI();
            this.saveData();
            return true;
            
        } catch (error) {
            console.error('Bet placement failed:', error);
            this.showLuxuryNotification('Royal bet placement failed', 'error');
            return false;
        }
    }

    async payoutWin(betAmount, multiplier) {
        const grossWin = betAmount * multiplier;
        const rake = grossWin * this.houseRake;
        const netWin = grossWin - rake;

        try {
            if (this.isAminaMode) {
                await this.processAminaTransaction(netWin, 'payout');
                this.aminaBalance += netWin;
            } else {
                this.houseCoins += netWin;
            }
            
            // Update statistics
            this.stats.totalWins++;
            if (netWin > this.stats.biggestWin) {
                this.stats.biggestWin = netWin;
            }
            
            this.updateUI();
            this.saveData();
            
            // Royal celebration for big wins
            if (multiplier >= 5) {
                this.triggerRoyalCelebration();
            }
            
            return netWin;
            
        } catch (error) {
            console.error('Payout failed:', error);
            this.showLuxuryNotification('Royal payout failed', 'error');
            return 0;
        }
    }

    async processAminaTransaction(amount, type) {
        // PRODUCTION CODE: Handle real Algorand transactions
        /*
        const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
        const params = await algodClient.getTransactionParams().do();
        
        let txn;
        if (type === 'bet') {
            // Transfer from player to house
            txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                this.walletAddress,
                this.houseWalletAddress,
                undefined,
                undefined,
                amount * 1000000,
                undefined,
                this.aminaAsaId,
                params
            );
        } else if (type === 'payout') {
            // Transfer from house to player (requires house wallet signature)
            txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                this.houseWalletAddress,
                this.walletAddress,
                undefined,
                undefined,
                amount * 1000000,
                undefined,
                this.aminaAsaId,
                params
            );
        }
        
        const signedTxn = await this.peraWallet.signTransaction([txn]);
        const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
        await algosdk.waitForConfirmation(algodClient, txId, 4);
        
        return txId;
        */
        
        // DEMO MODE: Mock transaction processing
        await new Promise(resolve => setTimeout(resolve, 1200));
        console.log(`👑 Mock royal ${type} transaction: ${amount} AMINA`);
        return 'royal_tx_' + Date.now();
    }

    updateUI() {
        // Update balance display
        const balanceLabel = document.getElementById('balanceLabel');
        const balanceAmount = document.getElementById('balanceAmount');
        
        if (balanceLabel && balanceAmount) {
            balanceLabel.textContent = this.isAminaMode ? 'Amina Coins' : 'House Coins';
            balanceAmount.textContent = this.getBalance().toFixed(2);
        }

        // Update wallet button
        const connectButton = document.getElementById('connectWallet');
        if (connectButton) {
            connectButton.innerHTML = this.isConnected ? 
                '<span class="btn-icon">🔮</span> Disconnect Wallet<div class="btn-shimmer"></div>' : 
                '<span class="btn-icon">🔮</span> Connect Pera Wallet<div class="btn-shimmer"></div>';
            
            connectButton.style.background = this.isConnected ? 
                'linear-gradient(45deg, #f87171, #ef4444, #dc2626)' : 
                'linear-gradient(45deg, #9370db, #8a2be2, #4b0082)';
        }

        // Update daily bonus button
        const dailyButton = document.getElementById('dailyBonus');
        if (dailyButton) {
            const today = new Date().toDateString();
            const claimed = this.lastDailyBonus === today;
            
            dailyButton.innerHTML = claimed ? 
                '<span class="btn-icon">✅</span> Claimed Today<div class="btn-shimmer"></div>' : 
                '<span class="btn-icon">👑</span> Daily 1000 HC<div class="btn-shimmer"></div>';
            
            dailyButton.disabled = claimed;
            dailyButton.style.opacity = claimed ? '0.6' : '1';
            dailyButton.style.display = this.isAminaMode ? 'none' : 'flex';
        }
    }

    showLuxuryNotification(message, type = 'info', duration = 5000) {
        // Remove existing notification
        const existing = document.getElementById('luxuryNotification');
        if (existing) {
            existing.remove();
        }

        // Create luxury notification element
        const notification = document.createElement('div');
        notification.id = 'luxuryNotification';
        notification.className = `luxury-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-text">${message}</div>
            </div>
            <div class="notification-glow"></div>
        `;

        // Luxury styling
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 25px 35px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-family: 'Cinzel', serif;
            z-index: 10000;
            max-width: 450px;
            word-wrap: break-word;
            transform: translateX(500px);
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255, 215, 0, 0.3);
            font-size: 1rem;
        `;

        // Type-specific luxury styling
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(50, 205, 50, 0.2))';
                notification.style.boxShadow += ', 0 0 40px rgba(0, 255, 0, 0.4)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.3), rgba(220, 20, 60, 0.2))';
                notification.style.boxShadow += ', 0 0 40px rgba(255, 68, 68, 0.4)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 140, 0, 0.2))';
                notification.style.boxShadow += ', 0 0 40px rgba(255, 165, 0, 0.4)';
                break;
            case 'info':
                notification.style.background = 'linear-gradient(135deg, rgba(147, 112, 219, 0.3), rgba(138, 43, 226, 0.2))';
                notification.style.boxShadow += ', 0 0 40px rgba(147, 112, 219, 0.4)';
                break;
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '👑';
            case 'error': return '⚠️';
            case 'warning': return '💫';
            case 'info': return '✨';
            default: return '🌟';
        }
    }

    triggerRoyalCelebration() {
        // Create royal celebration particles
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                this.createRoyalCelebrationParticle();
            }, i * 100);
        }
    }

    createRoyalCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['👑', '💎', '✨', '🌟', '⭐', '💫', '🎉'][Math.floor(Math.random() * 7)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2.5rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: royalCelebration 4s ease-out forwards;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 4000);
    }

    promptForAmount(message) {
        const amount = prompt(message);
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            if (amount !== null) {
                this.showLuxuryNotification('👑 Invalid royal amount entered', 'error');
            }
            return null;
        }
        return parseFloat(amount);
    }

    generateMockAddress() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        for (let i = 0; i < 58; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    saveData() {
        try {
            const data = {
                houseCoins: this.houseCoins,
                lastDailyBonus: this.lastDailyBonus,
                stats: this.stats
            };
            localStorage.setItem('aminaCasinoWallet', JSON.stringify(data));
        } catch (error) {
            console.log('Unable to save royal wallet data');
        }
    }

    // Public API for games
    getWalletInfo() {
        return {
            isConnected: this.isConnected,
            isAminaMode: this.isAminaMode,
            balance: this.getBalance(),
            currency: this.getCurrency(),
            walletAddress: this.walletAddress,
            stats: this.stats
        };
    }
}

// Add royal particle animation CSS
const luxuryStyle = document.createElement('style');
luxuryStyle.textContent = `
    @keyframes royalFloat {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes royalCelebration {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-60vh) rotate(180deg) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translateY(-120vh) rotate(360deg) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes sparkleHover {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 15px;
        position: relative;
        z-index: 2;
    }
    
    .notification-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
    }
    
    .notification-text {
        flex: 1;
        line-height: 1.4;
    }
    
    .notification-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #ffd700, #dda0dd, #9370db, #ffd700);
        border-radius: 22px;
        z-index: -1;
        opacity: 0.6;
        animation: notificationGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes notificationGlow {
        0% { opacity: 0.4; }
        100% { opacity: 0.8; }
    }
`;
document.head.appendChild(luxuryStyle);

// Initialize royal wallet system
let aminaWallet;
document.addEventListener('DOMContentLoaded', () => {
    aminaWallet = new AminaCasinoWallet();
    window.aminaWallet = aminaWallet; // Make globally accessible
});