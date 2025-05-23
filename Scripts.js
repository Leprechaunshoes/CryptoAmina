// Amina Casino Wallet Integration & Transaction Management
// Professional-grade crypto casino backend logic

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
            sessionsPlayed: 0
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
            
            console.log('Amina Casino Wallet initialized successfully');
        } catch (error) {
            console.error('Wallet initialization failed:', error);
            this.showNotification('Wallet initialization failed', 'error');
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
            console.log('No saved data found, using defaults');
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

    toggleMode(isAminaMode) {
        this.isAminaMode = isAminaMode;
        
        if (isAminaMode && !this.isConnected) {
            this.showNotification('Connect your Pera Wallet to use Amina mode', 'warning');
            // Reset toggle if wallet not connected
            setTimeout(() => {
                document.getElementById('modeToggle').checked = false;
                this.isAminaMode = false;
            }, 100);
            return;
        }
        
        this.updateUI();
        this.showNotification(
            `Switched to ${isAminaMode ? 'Amina' : 'House Coins'} mode`, 
            'success'
        );
    }

    async handleWalletConnection() {
        try {
            if (!this.isConnected) {
                await this.connectWallet();
            } else {
                this.disconnectWallet();
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showNotification('Wallet connection failed', 'error');
        }
    }

    async connectWallet() {
        this.showNotification('Connecting to Pera Wallet...', 'info');
        
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
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.isConnected = true;
            this.walletAddress = 'DEMO_' + this.generateMockAddress();
            this.aminaBalance = 25.50; // Mock balance for demo
            
            this.showNotification('Wallet connected successfully!', 'success');
            this.updateUI();
            
            // Track connection
            this.stats.sessionsPlayed++;
            this.saveData();
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification('Failed to connect wallet', 'error');
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
        
        this.showNotification('Wallet disconnected', 'info');
    }

    async handleDonation() {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        const amount = this.promptForAmount('Enter donation amount in Amina Coins:');
        if (!amount) return;

        if (amount > this.aminaBalance) {
            this.showNotification('Insufficient Amina balance for donation', 'error');
            return;
        }

        try {
            this.showNotification(`Processing donation of ${amount} Amina...`, 'info');
            
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
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showNotification(
                `Thank you for your generous donation of ${amount} Amina! 💫`, 
                'success'
            );
            
        } catch (error) {
            console.error('Donation failed:', error);
            this.showNotification('Donation transaction failed', 'error');
        }
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        
        if (this.lastDailyBonus === today) {
            this.showNotification('Daily bonus already claimed today!', 'warning');
            return;
        }

        const bonusAmount = 1000;
        this.houseCoins += bonusAmount;
        this.lastDailyBonus = today;
        
        this.saveData();
        this.updateUI();
        
        this.showNotification(`Daily bonus claimed! +${bonusAmount} House Coins`, 'success');
        
        // Add celebration effect
        this.triggerCelebration();
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
    }

    getBalance() {
        return this.isAminaMode ? this.aminaBalance : this.houseCoins;
    }

    getCurrency() {
        return this.isAminaMode ? 'AMINA' : 'HC';
    }

    async canPlaceBet(amount) {
        if (!amount || isNaN(amount) || amount < this.minBet) {
            this.showNotification(`Minimum bet is ${this.minBet} ${this.getCurrency()}`, 'error');
            return false;
        }

        if (amount > this.maxBet) {
            this.showNotification(`Maximum bet is ${this.maxBet} ${this.getCurrency()}`, 'error');
            return false;
        }

        if (this.isAminaMode && !this.isConnected) {
            this.showNotification('Please connect your wallet for Amina mode', 'error');
            return false;
        }
        
        const balance = this.getBalance();
        if (amount > balance) {
            this.showNotification(
                `Insufficient balance. You have ${balance.toFixed(2)} ${this.getCurrency()}`, 
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
            this.showNotification('Bet placement failed', 'error');
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
            
            // Celebration for big wins
            if (multiplier >= 5) {
                this.triggerCelebration();
            }
            
            return netWin;
            
        } catch (error) {
            console.error('Payout failed:', error);
            this.showNotification('Payout failed', 'error');
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Mock ${type} transaction: ${amount} AMINA`);
        return 'mock_tx_' + Date.now();
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
                '<span class="btn-icon">🔗</span> Disconnect Wallet' : 
                '<span class="btn-icon">🔗</span> Connect Pera Wallet';
            
            connectButton.style.background = this.isConnected ? 
                'linear-gradient(45deg, #f87171, #ef4444)' : 
                'linear-gradient(45deg, #4169E1, #1E90FF)';
        }

        // Update daily bonus button
        const dailyButton = document.getElementById('dailyBonus');
        if (dailyButton) {
            const today = new Date().toDateString();
            const claimed = this.lastDailyBonus === today;
            
            dailyButton.innerHTML = claimed ? 
                '<span class="btn-icon">✅</span> Claimed Today' : 
                '<span class="btn-icon">🎁</span> Daily 1000 HC';
            
            dailyButton.disabled = claimed;
            dailyButton.style.opacity = claimed ? '0.5' : '1';
            dailyButton.style.display = this.isAminaMode ? 'none' : 'flex';
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notification
        const existing = document.getElementById('notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Styling
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 20px 30px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            font-family: 'Exo 2', sans-serif;
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            transform: translateX(450px);
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        `;

        // Type-specific styling
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #00ff00, #32cd32)';
                notification.style.boxShadow += ', 0 0 30px rgba(0, 255, 0, 0.3)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
                notification.style.boxShadow += ', 0 0 30px rgba(255, 68, 68, 0.3)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ffa500, #ff8c00)';
                notification.style.boxShadow += ', 0 0 30px rgba(255, 165, 0, 0.3)';
                break;
            case 'info':
                notification.style.background = 'linear-gradient(135deg, #4169e1, #1e90ff)';
                notification.style.boxShadow += ', 0 0 30px rgba(65, 105, 225, 0.3)';
                break;
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(450px)';
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }

    triggerCelebration() {
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 100);
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['🎉', '✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 5)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: particleFloat 3s ease-out forwards;
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }

    promptForAmount(message) {
        const amount = prompt(message);
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            if (amount !== null) {
                this.showNotification('Invalid amount entered', 'error');
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
            console.log('Unable to save wallet data');
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

// Add particle animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize wallet system
let aminaWallet;
document.addEventListener('DOMContentLoaded', () => {
    aminaWallet = new AminaCasinoWallet();
    window.aminaWallet = aminaWallet; // Make globally accessible
});