// Algorand and Pera Wallet Integration
const AMINA_ASSET_ID = 1107424865;
const HOUSE_ADDRESS = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
const HOUSE_RAKE = 0.05; // 5%

// Simulated Pera Wallet SDK for the context of this demo
class PeraWalletConnect {
    constructor() {
        this.connected = false;
        this.accounts = [];
        this.balances = {};
    }

    // Connect to Pera Wallet
    async connect() {
        try {
            // In a real implementation, this would interact with the actual Pera wallet
            console.log("Connecting to Pera Wallet...");
            
            // Simulate connection process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate a random wallet address for demo purposes
            const walletAddress = this.generateRandomAddress();
            this.accounts = [walletAddress];
            
            // Set a random Amina balance
            this.balances[AMINA_ASSET_ID] = (Math.random() * 50 + 5).toFixed(2);
            
            this.connected = true;
            return this.accounts;
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        }
    }

    // Disconnect from Pera Wallet
    async disconnect() {
        this.connected = false;
        this.accounts = [];
        this.balances = {};
        console.log("Disconnected from Pera Wallet");
    }

    // Check if connected
    isConnected() {
        return this.connected;
    }

    // Get the connected accounts
    getAccounts() {
        return this.accounts;
    }

    // Get asset balance
    async getAssetBalance(account, assetId) {
        if (!this.connected || !this.accounts.includes(account)) {
            throw new Error("Not connected or invalid account");
        }
        
        return this.balances[assetId] || '0';
    }

    // Simulate sending assets (for betting)
    async sendAssets(from, to, amount, assetId) {
        if (!this.connected || !this.accounts.includes(from)) {
            throw new Error("Not connected or invalid account");
        }
        
        // Check if user has enough balance
        const balance = parseFloat(this.balances[assetId] || '0');
        if (balance < amount) {
            throw new Error("Insufficient balance");
        }
        
        console.log(`Sending ${amount} of asset ${assetId} from ${from} to ${to}`);
        
        // Update balance
        this.balances[assetId] = (balance - amount).toFixed(2);
        
        // Return a mock transaction ID
        return {
            txId: this.generateRandomTxId(),
            balance: this.balances[assetId]
        };
    }

    // Simulate receiving assets (for winning)
    async receiveAssets(to, amount, assetId) {
        if (!this.connected || !this.accounts.includes(to)) {
            throw new Error("Not connected or invalid account");
        }
        
        const balance = parseFloat(this.balances[assetId] || '0');
        
        // Apply house rake
        const rakeAmount = amount * HOUSE_RAKE;
        const netAmount = amount - rakeAmount;
        
        console.log(`Receiving ${netAmount} of asset ${assetId} to ${to} (Rake: ${rakeAmount})`);
        
        // Update balance
        this.balances[assetId] = (balance + netAmount).toFixed(2);
        
        // Simulate sending rake to house address
        console.log(`Sending rake ${rakeAmount} to ${HOUSE_ADDRESS}`);
        
        // Return a mock transaction ID
        return {
            txId: this.generateRandomTxId(),
            balance: this.balances[assetId]
        };
    }

    // Helper to generate random wallet address for demo
    generateRandomAddress() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let address = '';
        for (let i = 0; i < 58; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
    }

    // Helper to generate random transaction ID for demo
    generateRandomTxId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let txId = '';
        for (let i = 0; i < 52; i++) {
            txId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return txId;
    }
}

// Create wallet instance 
const peraWallet = new PeraWalletConnect();
// ===== AMINA CASINO - ALGORAND INTEGRATION =====

// Configuration
const AMINA_ASSET_ID = 1107424865;
const HOUSE_ADDRESS = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
const HOUSE_RAKE_PERCENTAGE = 0.05; // 5%
const MIN_BET = 0.25;
const MAX_BET = 1.0;

// Simulated Pera Wallet Connection (for demo purposes)
// In production, you would use the actual Pera Wallet Connect SDK
class MockPeraWallet {
    constructor() {
        this.connected = false;
        this.accounts = [];
        this.balances = new Map();
        this.isConnecting = false;
    }

    // Generate a realistic-looking Algorand address
    generateAddress() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let address = '';
        for (let i = 0; i < 58; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return address;
    }

    // Generate a random transaction ID
    generateTxId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let txId = '';
        for (let i = 0; i < 52; i++) {
            txId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return txId;
    }

    // Connect to wallet
    async connect() {
        if (this.isConnecting) return this.accounts;
        
        this.isConnecting = true;
        
        try {
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate a mock wallet address
            const address = this.generateAddress();
            this.accounts = [address];
            
            // Set initial Amina balance (random between 5-50)
            const initialBalance = (Math.random() * 45 + 5).toFixed(2);
            this.balances.set(AMINA_ASSET_ID, parseFloat(initialBalance));
            
            this.connected = true;
            this.isConnecting = false;
            
            console.log(`Connected to wallet: ${address}`);
            console.log(`Initial Amina balance: ${initialBalance}`);
            
            return this.accounts;
        } catch (error) {
            this.isConnecting = false;
            throw new Error('Failed to connect to Pera Wallet');
        }
    }

    // Disconnect from wallet
    async disconnect() {
        this.connected = false;
        this.accounts = [];
        this.balances.clear();
        console.log('Disconnected from wallet');
    }

    // Check if connected
    isConnected() {
        return this.connected && this.accounts.length > 0;
    }

    // Get connected accounts
    getAccounts() {
        return this.accounts;
    }

    // Get asset balance
    async getBalance(assetId = AMINA_ASSET_ID) {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }
        
        return this.balances.get(assetId) || 0;
    }

    // Send transaction (for betting)
    async sendTransaction(amount, assetId = AMINA_ASSET_ID) {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const currentBalance = this.balances.get(assetId) || 0;
        
        if (currentBalance < amount) {
            throw new Error('Insufficient balance');
        }

        // Simulate transaction processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update balance
        this.balances.set(assetId, currentBalance - amount);
        
        const txId = this.generateTxId();
        console.log(`Transaction sent: ${amount} Amina, TxID: ${txId}`);
        
        return {
            txId: txId,
            amount: amount,
            newBalance: this.balances.get(assetId)
        };
    }

    // Receive winnings (with house rake applied)
    async receiveWinnings(amount, assetId = AMINA_ASSET_ID) {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }

        // Calculate house rake
        const rake = amount * HOUSE_RAKE_PERCENTAGE;
        const netWinnings = amount - rake;

        // Simulate transaction processing
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update balance
        const currentBalance = this.balances.get(assetId) || 0;
        this.balances.set(assetId, currentBalance + netWinnings);

        console.log(`Winnings received: ${netWinnings} Amina (${rake} rake to house)`);
        
        return {
            grossWinnings: amount,
            rake: rake,
            netWinnings: netWinnings,
            newBalance: this.balances.get(assetId)
        };
    }

    // Send donation
    async sendDonation(amount, assetId = AMINA_ASSET_ID) {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const currentBalance = this.balances.get(assetId) || 0;
        
        if (currentBalance < amount) {
            throw new Error('Insufficient balance for donation');
        }

        // Simulate donation transaction
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Update balance
        this.balances.set(assetId, currentBalance - amount);
        
        const txId = this.generateTxId();
        console.log(`Donation sent: ${amount} Amina to ${HOUSE_ADDRESS}, TxID: ${txId}`);
        
        return {
            txId: txId,
            amount: amount,
            newBalance: this.balances.get(assetId)
        };
    }
}

// Create wallet instance
const peraWallet = new MockPeraWallet();

// Wallet connection functions
async function connectWallet() {
    try {
        const accounts = await peraWallet.connect();
        return accounts[0];
    } catch (error) {
        console.error('Wallet connection failed:', error);
        throw error;
    }
}

async function disconnectWallet() {
    try {
        await peraWallet.disconnect();
    } catch (error) {
        console.error('Wallet disconnection failed:', error);
    }
}

async function getWalletBalance() {
    try {
        return await peraWallet.getBalance();
    } catch (error) {
        console.error('Failed to get wallet balance:', error);
        return 0;
    }
}

async function placeBet(amount) {
    try {
        return await peraWallet.sendTransaction(amount);
    } catch (error) {
        console.error('Failed to place bet:', error);
        throw error;
    }
}

async function receiveWinnings(amount) {
    try {
        return await peraWallet.receiveWinnings(amount);
    } catch (error) {
        console.error('Failed to receive winnings:', error);
        throw error;
    }
}

async function sendDonation(amount) {
    try {
        return await peraWallet.sendDonation(amount);
    } catch (error) {
        console.error('Failed to send donation:', error);
        throw error;
    }
}

// Export functions for use in main script
window.AlgorandWallet = {
    connect: connectWallet,
    disconnect: disconnectWallet,
    isConnected: () => peraWallet.isConnected(),
    getAccounts: () => peraWallet.getAccounts(),
    getBalance: getWalletBalance,
    placeBet: placeBet,
    receiveWinnings: receiveWinnings,
    sendDonation: sendDonation,
    AMINA_ASSET_ID,
    HOUSE_ADDRESS,
    HOUSE_RAKE_PERCENTAGE,
    MIN_BET,
    MAX_BET
};

// Log initialization
console.log('🚀 Amina Casino - Algorand Integration Initialized');
console.log(`Asset ID: ${AMINA_ASSET_ID}`);
console.log(`House Address: ${HOUSE_ADDRESS}`);
console.log(`House Rake: ${HOUSE_RAKE_PERCENTAGE * 100}%`);