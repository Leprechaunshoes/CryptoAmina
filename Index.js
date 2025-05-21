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
