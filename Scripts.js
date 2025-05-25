// Amina Casino - Streamlined & Enhanced with Working Pera Wallet
class AminaCasino {
    constructor() {
        this.balance = { HC: 1000, AMINA: 0 };
        this.currentCurrency = 'HC';
        this.isAmina = false;
        this.slotSymbols = ['⭐', '🌟', '💫', '🌌', '🪐', '🌙', '☄️', '🚀', '👽', '🛸'];
        
        // ENHANCED PERA WALLET SETUP
        try {
            this.peraWallet = new PeraWalletConnect();
            this.connectedAccount = null;
            this.aminaAssetId = 1107424865;
            this.nodeUrl = 'https://mainnet-api.algonode.cloud';
            this.walletReady = true;
            console.log('🔗 Pera Wallet initialized for mainnet');
        } catch (error) {
            console.log('⚠️ Pera Wallet not available, HC mode only');
            this.walletReady = false;
        }
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupCurrencyToggle();
        this.setupGames();
        this.updateDisplay();
        
        // Setup Pera Wallet after DOM loads
        setTimeout(() => this.setupPeraWallet(), 1000);
        console.log('🌌 Amina Casino loaded!');
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-btn:not(.donation-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchGame(e.target.dataset.game));
        });
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => this.switchGame(e.currentTarget.dataset.game));
        });
    }
    
    switchGame(game) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(game).classList.add('active');
        document.querySelector(`[data-game="${game}"]`).classList.add('active');
        if (game === 'plinko') setTimeout(() => this.initPlinko(), 100);
    }
    
    // ENHANCED PERA WALLET FUNCTIONS
    setupPeraWallet() {
        if (!this.walletReady) return;
        
        this.addWalletButton();
        
        // Auto-reconnect if previously connected
        this.peraWallet.reconnectSession().then((accounts) => {
            if (accounts?.length > 0) {
                this.connectedAccount = accounts[0];
                this.updateWalletUI();
                this.fetchAminaBalance();
                this.showNotification('🔗 Wallet reconnected!', 'success');
            }
        }).catch(() => console.log('No previous session'));
    }
    
    addWalletButton() {
        const headerControls = document.querySelector('.header-controls');
        if (!headerControls || document.getElementById('walletBtn')) return;
        
        const walletBtn = document.createElement('button');
        walletBtn.id = 'walletBtn';
        walletBtn.className = 'wallet-btn';
        walletBtn.innerHTML = '🔗 Connect Wallet';
        walletBtn.addEventListener('click', () => this.toggleWallet());
        headerControls.insertBefore(walletBtn, headerControls.firstChild);
    }
    
    async toggleWallet() {
        if (!this.walletReady) {
            this.showNotification('❌ Pera Wallet not available', 'error');
            return;
        }
        
        if (this.connectedAccount) {
            // Disconnect
            await this.peraWallet.disconnect();
            this.connectedAccount = null;
            this.balance.AMINA = 0;
            if (this.isAmina) {
                this.isAmina = false;
                this.currentCurrency = 'HC';
                document.getElementById('currencyToggle').classList.remove('amina');
                document.querySelector('.currency-text').textContent = 'HC';
            }
            this.updateWalletUI();
            this.updateDisplay();
            this.showNotification('🔌 Wallet disconnected', 'success');
        } else {
            // Connect
            try {
                const accounts = await this.peraWallet.connect();
                if (accounts?.length > 0) {
                    this.connectedAccount = accounts[0];
                    this.updateWalletUI();
                    await this.fetchAminaBalance();
                    this.showNotification('🔗 Wallet connected!', 'success');
                } else {
                    this.showNotification('❌ No accounts found', 'error');
                }
            } catch (error) {
                this.showNotification('❌ Connection failed', 'error');
            }
        }
    }
    
    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        if (!walletBtn) return;
        
        if (this.connectedAccount) {
            const short = this.connectedAccount.slice(0, 6) + '...' + this.connectedAccount.slice(-4);
            walletBtn.innerHTML = `✅ ${short}`;
            walletBtn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
        } else {
            walletBtn.innerHTML = '🔗 Connect Wallet';
            walletBtn.style.background = 'linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-pink))';
        }
    }
    
    async fetchAminaBalance() {
        if (!this.connectedAccount) return;
        
        try {
            const response = await fetch(`${this.nodeUrl}/v2/accounts/${this.connectedAccount}`);
            const accountInfo = await response.json();
            const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === this.aminaAssetId);
            this.balance.AMINA = aminaAsset ? (aminaAsset.amount / 1000000) : 0;
            this.updateDisplay();
            console.log(`🪙 AMINA Balance: ${this.balance.AMINA}`);
        } catch (error) {
            console.error('Failed to fetch AMINA balance:', error);
            this.showNotification('⚠️ Could not fetch balance', 'error');
        }
    }
    
    // ENHANCED TRANSACTION FUNCTIONS
    async sendAminaTransaction(amount, isDeduct = true) {
        if (!this.connectedAccount || !this.isAmina) return false;
        
        try {
            // For demo purposes, we'll simulate the transaction
            // In production, you'd create and send actual Algorand transactions
            
            this.showNotification(`🔄 Processing ${amount} AMINA...`, 'info');
            
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (isDeduct) {
                if (this.balance.AMINA >= amount) {
                    this.balance.AMINA -= amount;
                    this.showNotification(`✅ Deducted ${amount} AMINA`, 'success');
                    this.updateDisplay();
                    return true;
                } else {
                    this.showNotification('❌ Insufficient AMINA balance', 'error');
                    return false;
                }
            } else {
                this.balance.AMINA += amount;
                this.showNotification(`✅ Added ${amount} AMINA`, 'success');
                this.updateDisplay();
                return true;
            }
        } catch (error) {
            this.showNotification('❌ Transaction failed', 'error');
            return false;
        }
    }
    
    setupCurrencyToggle() {
        document.getElementById('currencyToggle').addEventListener('click', () => {
            if (!this.isAmina && !this.connectedAccount) {
                this.showNotification('🔗 Connect wallet to use AMINA!', 'error');
                return;
            }
            
            this.isAmina = !this.isAmina;
            this.currentCurrency = this.isAmina ? 'AMINA' : 'HC';
            
            const toggle = document.getElementById('currencyToggle');
            const text = document.querySelector('.currency-text');
            
            if (this.isAmina) {
                toggle.classList.add('amina');
                text.textContent = 'AMINA';
                this.fetchAminaBalance();
            } else {
                toggle.classList.remove('amina');
                text.textContent = 'HC';
            }
            
            this.updateDisplay();
        });
    }
    
    setupGames() {
        // Slots
        this.initSlots();
        document.getElementById('spinBtn').addEventListener('click', () => this.spinSlots());
        
        // Plinko
        this.initPlinko();
        document.getElementById('dropBtn').addEventListener('click', () => this.dropPlinko());
        
        // Blackjack
        this.initBlackjack();
        document.getElementById('dealBtn').addEventListener('click', () => this.dealCards());
        document.getElementById('hitBtn').addEventListener('click', () => this.hit());
        document.getElementById('standBtn').addEventListener('click', () => this.stand());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    }
    
    updateDisplay() {
        const balance = Math.floor(this.balance[this.currentCurrency] * 1000000) / 1000000; // Round to 6 decimals
        document.getElementById('balanceAmount').textContent = balance;
        document.getElementById('currencySymbol').textContent = this.currentCurrency;
        ['slots', 'plinko', 'blackjack'].forEach(game => {
            document.getElementById(`${game}Currency`).textContent = this.currentCurrency;
        });
    }
    
    async deductBalance(amount) {
        if (this.balance[this.currentCurrency] < amount) return false;
        
        if (this.isAmina && this.connectedAccount) {
            return await this.sendAminaTransaction(amount, true);
        } else {
            this.balance[this.currentCurrency] -= amount;
            this.animateBalance('lose');
            this.updateDisplay();
            return true;
        }
    }
    
    async addBalance(amount) {
        if (this.isAmina && this.connectedAccount) {
            await this.sendAminaTransaction(amount, false);
        } else {
            this.balance[this.currentCurrency] += amount;
        }
        this.animateBalance('win');
        this.updateDisplay();
    }
    
    animateBalance(type) {
        const balanceDisplay = document.querySelector('.balance-display');
        balanceDisplay.classList.remove('win', 'lose');
        setTimeout(() => {
            balanceDisplay.classList.add(type);
            setTimeout(() => balanceDisplay.classList.remove(type), 1000);
        }, 50);
    }
    
    showGameResult(gameId, message, type = 'info') {
        const resultDiv = document.getElementById(`${gameId}Result`);
        resultDiv.textContent = message;
        resultDiv.className = `game-result show ${type}`;
        setTimeout(() => resultDiv.classList.remove('show'), 4000);
    }
    
    showNotification(message, type = 'info') {
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#FFD700',
            amina: '#E91E63'
        };
        
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1001;
            background: ${colors[type] || colors.info}; color: white;
            padding: 1rem 2rem; border-radius: 15px;
            font-family: 'Orbitron', monospace; font-weight: 700;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // SLOTS GAME - STREAMLINED
    initSlots() {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const reel = document.createElement('div');
            reel.className = 'slot-reel';
            reel.textContent = this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)];
            grid.appendChild(reel);
        }
    }
    
    async spinSlots() {
        const bet = parseFloat(document.getElementById('slotsBet').value);
        if (!(await this.deductBalance(bet))) {
            this.showGameResult('slots', 'Insufficient balance!', 'lose');
            return;
        }
        
        const reels = document.querySelectorAll('.slot-reel');
        const spinButton = document.getElementById('spinBtn');
        
        spinButton.disabled = true;
        spinButton.textContent = 'SPINNING...';
        reels.forEach(reel => {
            reel.classList.add('spinning');
            reel.classList.remove('winning');
        });
        
        setTimeout(() => {
            const results = [];
            reels.forEach(reel => {
                reel.classList.remove('spinning');
                const symbol = this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)];
                reel.textContent = symbol;
                results.push(symbol);
            });
            
            const winAmount = this.calculateSlotWin(results, bet);
            if (winAmount > 0) {
                this.addBalance(winAmount);
                this.highlightWinningSlots(reels, results);
                this.showGameResult('slots', `🌟 WIN! +${winAmount} ${this.currentCurrency}`, 'win');
            } else {
                this.showGameResult('slots', 'No win this time!', 'lose');
            }
            
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN';
        }, 2500);
    }
    
    calculateSlotWin(results, bet) {
        const rows = [
            [results[0], results[1], results[2], results[3], results[4]],
            [results[5], results[6], results[7], results[8], results[9]],
            [results[10], results[11], results[12], results[13], results[14]]
        ];
        
        let totalWin = 0;
        rows.forEach(row => {
            const counts = {};
            row.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
            Object.entries(counts).forEach(([symbol, count]) => {
                if (count >= 5) totalWin += bet * 100;
                else if (count >= 4) totalWin += bet * 25;
                else if (count >= 3) totalWin += bet * 5;
            });
        });
        return totalWin;
    }
    
    highlightWinningSlots(reels, results) {
        const rows = [[0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14]];
        rows.forEach(rowIndices => {
            const rowSymbols = rowIndices.map(i => results[i]);
            const counts = {};
            rowSymbols.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
            Object.entries(counts).forEach(([symbol, count]) => {
                if (count >= 3) {
                    rowIndices.forEach(i => {
                        if (results[i] === symbol) reels[i].classList.add('winning');
                    });
                }
            });
        });
    }
    
    // PLINKO GAME - STREAMLINED
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth < 768 ? 350 : 400;
        canvas.height = window.innerWidth < 768 ? 250 : 280;
        
        this.plinkoCtx = canvas.getContext('2d');
        this.plinkoDropping = false;
        this.setupPegs();
        this.drawPlinkoBoard();
    }
    
    setupPegs() {
        this.pegs = [];
        const canvas = this.plinkoCtx.canvas;
        const rows = 6;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 2;
            const spacing = (canvas.width - 80) / (rows + 1);
            const startX = (canvas.width - (pegsInRow * spacing)) / 2;
            
            for (let peg = 0; peg < pegsInRow; peg++) {
                this.pegs.push({
                    x: startX + peg * spacing + spacing / 2,
                    y: 60 + row * 28,
                    radius: 6
                });
            }
        }
    }
    
    drawPlinkoBoard() {
        const ctx = this.plinkoCtx;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4169E1');
        gradient.addColorStop(1, '#1E90FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Pegs
        this.pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        });
    }
    
    async dropPlinko() {
        const bet = parseFloat(document.getElementById('plinkoBet').value);
        if (this.plinkoDropping || !(await this.deductBalance(bet))) {
            this.showGameResult('plinko', this.plinkoDropping ? 'Ball dropping!' : 'Insufficient balance!', 'lose');
            return;
        }
        
        this.plinkoDropping = true;
        const button = document.getElementById('dropBtn');
        button.disabled = true;
        button.textContent = 'DROPPING...';
        
        const finalSlot = await this.animatePlinko();
        const multipliers = [10, 5, 2, 1, 0.5, 1, 2, 5, 10];
        const multiplier = multipliers[finalSlot] || 1;
        const winAmount = bet * multiplier;
        
        await this.addBalance(winAmount);
        
        this.showGameResult('plinko', 
            `Hit ${multiplier}x! Won ${winAmount} ${this.currentCurrency}!`, 
            winAmount > bet ? 'win' : 'lose'
        );
        
        // Highlight multiplier
        document.querySelectorAll('.multiplier').forEach((m, i) => m.classList.toggle('hit', i === finalSlot));
        setTimeout(() => document.querySelectorAll('.multiplier').forEach(m => m.classList.remove('hit')), 3000);
        
        this.plinkoDropping = false;
        button.disabled = false;
        button.textContent = 'DROP BALL';
    }
    
    animatePlinko() {
        return new Promise(resolve => {
            const canvas = this.plinkoCtx.canvas;
            const ball = {
                x: canvas.width / 2, y: 30, vx: 0, vy: 2,
                radius: 8, gravity: 0.3, bounce: 0.6
            };
            
            const animate = () => {
                this.drawPlinkoBoard();
                
                ball.vy += ball.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // Peg collisions
                this.pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ball.radius + peg.radius) {
                        const angle = Math.atan2(dy, dx);
                        ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.radius + 1);
                        ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.radius + 1);
                        ball.vx = (Math.random() - 0.5) * 4;
                        ball.vy = Math.abs(ball.vy) * ball.bounce + 1;
                    }
                });
                
                // Wall bounces
                if (ball.x < ball.radius) {
                    ball.x = ball.radius;
                    ball.vx = Math.abs(ball.vx);
                } else if (ball.x > canvas.width - ball.radius) {
                    ball.x = canvas.width - ball.radius;
                    ball.vx = -Math.abs(ball.vx);
                }
                
                // Draw ball
                const ctx = this.plinkoCtx;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#FF4444';
                ctx.fill();
                
                if (ball.y > canvas.height - 30) {
                    const slotWidth = canvas.width / 9;
                    const finalSlot = Math.floor(ball.x / slotWidth);
                    resolve(Math.max(0, Math.min(8, finalSlot)));
                } else {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        });
    }
    
    // BLACKJACK GAME - STREAMLINED
    initBlackjack() {
        this.playerHand = [];
        this.dealerHand = [];
        this.gameActive = false;
        this.createDeck();
    }
    
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        
        suits.forEach(suit => values.forEach(value => this.deck.push({value, suit})));
        
        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    async dealCards() {
        const bet = parseFloat(document.getElementById('blackjackBet').value);
        if (!(await this.deductBalance(bet))) {
            this.showGameResult('blackjack', 'Insufficient balance!', 'lose');
            return;
        }
        
        this.currentBet = bet;
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.gameActive = true;
        
        this.updateBlackjackDisplay();
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('hitBtn').disabled = false;
        document.getElementById('standBtn').disabled = false;
    }
    
    hit() {
        if (!this.gameActive) return;
        this.playerHand.push(this.deck.pop());
        this.updateBlackjackDisplay();
        if (this.getHandValue(this.playerHand) > 21) {
            this.endGame('💥 Bust! You lose.', 0, 'lose');
        }
    }
    
    stand() {
        if (!this.gameActive) return;
        
        while (this.getHandValue(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.pop());
        }
        
        this.updateBlackjackDisplay();
        
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);
        
        if (dealerValue > 21) {
            this.endGame('🎉 Dealer busts! You win!', this.currentBet * 2, 'win');
        } else if (playerValue > dealerValue) {
            this.endGame('🎉 You win!', this.currentBet * 2, 'win');
        } else if (playerValue < dealerValue) {
            this.endGame('😔 Dealer wins!', 0, 'lose');
        } else {
            this.endGame('🤝 Push! Bet returned.', this.currentBet, 'win');
        }
    }
    
    getHandValue(hand) {
        let value = 0, aces = 0;
        hand.forEach(card => {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else if (['J', 'Q', 'K'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        });
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        return value;
    }
    
    updateBlackjackDisplay() {
        this.displayHand('player', this.playerHand);
        this.displayHand('dealer', this.dealerHand, !this.gameActive);
        document.getElementById('playerScore').textContent = this.getHandValue(this.playerHand);
        document.getElementById('dealerScore').textContent = 
            this.gameActive ? this.getHandValue([this.dealerHand[0]]) : this.getHandValue(this.dealerHand);
    }
    
    displayHand(player, hand, showAll = true) {
        const container = document.getElementById(`${player}Cards`);
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'playing-card';
            
            if (player === 'dealer' && index === 1 && !showAll) {
                cardEl.classList.add('back');
                cardEl.textContent = '🎭';
            } else {
                cardEl.innerHTML = `${card.value}<br>${card.suit}`;
                if (['♥', '♦'].includes(card.suit)) cardEl.classList.add('red');
            }
            container.appendChild(cardEl);
        });
    }
    
    async endGame(message, winAmount = 0, resultType = 'info') {
        this.gameActive = false;
        
        if (winAmount > 0) {
            await this.addBalance(winAmount);
            message += ` +${winAmount} ${this.currentCurrency}`;
        }
        
        this.showGameResult('blackjack', message, resultType);
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        document.getElementById('newGameBtn').style.display = 'inline-block';
    }
    
    newGame() {
        this.initBlackjack();
        document.getElementById('dealBtn').disabled = false;
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('blackjackResult').classList.remove('show');
        ['player', 'dealer'].forEach(player => {
            document.getElementById(`${player}Cards`).innerHTML = '';
            document.getElementById(`${player}Score`).textContent = '0';
        });
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌌 Initializing Amina Casino...');
    window.aminaCasino = new AminaCasino();
    console.log('✅ Amina Casino ready!');
});