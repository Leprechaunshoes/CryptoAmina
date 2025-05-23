// Wallet Connection and Transaction Logic
class CasinoWallet {
    constructor() {
        this.isConnected = false;
        this.isAminaMode = false;
        this.houseCoins = 1000;
        this.aminaBalance = 0;
        this.walletAddress = null;
        this.lastDailyBonus = null;
        this.houseRake = 0.05; // 5% house rake
        this.donationAddress = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.aminaAsaId = 1107424865;
        
        this.initializeWallet();
    }

    initializeWallet() {
        // Load saved data from localStorage (if available)
        const savedData = localStorage.getItem('casinoWallet');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.houseCoins = data.houseCoins || 1000;
            this.lastDailyBonus = data.lastDailyBonus;
        }
        
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mode Toggle
        document.getElementById('modeToggle').addEventListener('change', (e) => {
            this.toggleMode(e.target.checked);
        });

        // Connect Wallet Button
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
        });

        // Donation Button
        document.getElementById('donateBtn').addEventListener('click', () => {
            this.donate();
        });

        // Daily Bonus Button
        document.getElementById('dailyBonus').addEventListener('click', () => {
            this.claimDailyBonus();
        });
    }

    toggleMode(isAminaMode) {
        this.isAminaMode = isAminaMode;
        this.updateUI();
        
        if (isAminaMode && !this.isConnected) {
            this.showMessage('Please connect your Pera Wallet to use Amina mode', 'info');
        }
    }

    async connectWallet() {
        try {
            // Mock wallet connection for demo
            // In real implementation, this would connect to Pera Wallet
            if (!this.isConnected) {
                this.showMessage('Connecting to Pera Wallet... (Demo Mode)', 'info');
                
                // Simulate connection delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Mock wallet connection success
                this.isConnected = true;
                this.walletAddress = 'MOCK_ADDRESS_FOR_DEMO_' + Math.random().toString(36).substr(2, 9);
                this.aminaBalance = 10; // Mock balance
                
                this.showMessage('Wallet connected successfully! (Demo Mode)', 'success');
                this.updateUI();
            } else {
                this.disconnectWallet();
            }
        } catch (error) {
            this.showMessage('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    disconnectWallet() {
        this.isConnected = false;
        this.walletAddress = null;
        this.aminaBalance = 0;
        this.isAminaMode = false;
        document.getElementById('modeToggle').checked = false;
        this.showMessage('Wallet disconnected', 'info');
        this.updateUI();
    }

    async donate() {
        if (!this.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        const amount = prompt('Enter donation amount in Amina Coins:');
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            this.showMessage('Invalid donation amount', 'error');
            return;
        }

        try {
            // Mock donation transaction
            this.showMessage(`Donating ${amount} Amina Coins... (Demo Mode)`, 'info');
            
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showMessage(`Thank you for your donation of ${amount} Amina Coins! 💫`, 'success');
        } catch (error) {
            this.showMessage('Donation failed: ' + error.message, 'error');
        }
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        
        if (this.lastDailyBonus === today) {
            this.showMessage('Daily bonus already claimed today!', 'error');
            return;
        }

        this.houseCoins += 1000;
        this.lastDailyBonus = today;
        this.saveData();
        this.updateUI();
        this.showMessage('Daily bonus claimed! +1000 House Coins', 'success');
    }

    getBalance() {
        return this.isAminaMode ? this.aminaBalance : this.houseCoins;
    }

    canPlaceBet(amount) {
        if (this.isAminaMode && !this.isConnected) {
            this.showMessage('Please connect your wallet to use Amina mode', 'error');
            return false;
        }
        
        const balance = this.getBalance();
        if (amount > balance) {
            this.showMessage(`Insufficient balance. You have ${balance.toFixed(2)} ${this.isAminaMode ? 'Amina' : 'HC'}`, 'error');
            return false;
        }
        
        return true;
    }

    async placeBet(amount) {
        if (!this.canPlaceBet(amount)) {
            return false;
        }

        try {
            if (this.isAminaMode) {
                // Mock Amina transaction
                await this.sendAminaTransaction(amount);
                this.aminaBalance -= amount;
            } else {
                // House coins transaction
                this.houseCoins -= amount;
            }
            
            this.updateUI();
            this.saveData();
            return true;
        } catch (error) {
            this.showMessage('Bet placement failed: ' + error.message, 'error');
            return false;
        }
    }

    async sendAminaTransaction(amount) {
        // Mock Amina transaction for demo
        // In real implementation, this would use Algorand SDK
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Mock Amina transaction: ${amount} AMINA`);
    }

    async payoutWin(betAmount, multiplier) {
        const grossWin = betAmount * multiplier;
        const rake = grossWin * this.houseRake;
        const netWin = grossWin - rake;

        try {
            if (this.isAminaMode) {
                // Mock Amina payout
                await this.receiveAminaTransaction(netWin);
                this.aminaBalance += netWin;
            } else {
                // House coins payout
                this.houseCoins += netWin;
            }
            
            this.updateUI();
            this.saveData();
            return netWin;
        } catch (error) {
            this.showMessage('Payout failed: ' + error.message, 'error');
            return 0;
        }
    }

    async receiveAminaTransaction(amount) {
        // Mock Amina receive for demo
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Mock Amina receive: ${amount} AMINA`);
    }

    updateUI() {
        const balanceLabel = document.getElementById('balanceLabel');
        const balanceAmount = document.getElementById('balanceAmount');
        const connectButton = document.getElementById('connectWallet');
        const dailyButton = document.getElementById('dailyBonus');

        // Update balance display
        if (this.isAminaMode) {
            balanceLabel.textContent = 'Amina Coins:';
            balanceAmount.textContent = this.aminaBalance.toFixed(2);
        } else {
            balanceLabel.textContent = 'House Coins:';
            balanceAmount.textContent = this.houseCoins.toFixed(2);
        }

        // Update connect button
        connectButton.textContent = this.isConnected ? 'Disconnect Wallet' : 'Connect Pera Wallet';
        connectButton.style.background = this.isConnected ? 
            'linear-gradient(45deg, #f87171, #ef4444)' : 
            'linear-gradient(45deg, #667eea, #764ba2)';

        // Update daily bonus button
        const today = new Date().toDateString();
        if (this.lastDailyBonus === today) {
            dailyButton.textContent = '✓ Claimed Today';
            dailyButton.disabled = true;
            dailyButton.style.opacity = '0.5';
        } else {
            dailyButton.textContent = '🎁 Daily 1000 HC';
            dailyButton.disabled = false;
            dailyButton.style.opacity = '1';
        }

        // Hide daily bonus in Amina mode
        dailyButton.style.display = this.isAminaMode ? 'none' : 'block';
    }

    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.getElementById('messageDisplay');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'messageDisplay';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                max-width: 300px;
                word-wrap: break-word;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        
        // Set color based on type
        switch (type) {
            case 'success':
                messageEl.style.background = 'linear-gradient(45deg, #4ade80, #22c55e)';
                break;
            case 'error':
                messageEl.style.background = 'linear-gradient(45deg, #f87171, #ef4444)';
                break;
            case 'info':
                messageEl.style.background = 'linear-gradient(45deg, #60a5fa, #3b82f6)';
                break;
            default:
                messageEl.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        }

        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.style.display = 'none';
            }
        }, 3000);
    }

    saveData() {
        const data = {
            houseCoins: this.houseCoins,
            lastDailyBonus: this.lastDailyBonus
        };
        localStorage.setItem('casinoWallet', JSON.stringify(data));
    }
}

// Initialize wallet when page loads
let wallet;
document.addEventListener('DOMContentLoaded', () => {
    wallet = new CasinoWallet();
});

// Export for use in other scripts
window.wallet = wallet;