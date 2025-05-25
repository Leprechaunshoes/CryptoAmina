// Amina Casino - Complete Game Logic WITH PERA WALLET!
class AminaCasino {
    constructor() {
        this.balance = { HC: 1000, AMINA: 0 };
        this.currentCurrency = 'HC';
        this.isAmina = false;
        this.slotSymbols = ['⭐', '🌟', '💫', '🌌', '🪐', '🌙', '☄️', '🚀', '👽', '🛸'];
        
        // PERA WALLET SETUP - WITH ERROR HANDLING
        try {
            this.peraWallet = new PeraWalletConnect();
            this.connectedAccount = null;
            this.aminaAssetId = 1107424865; // Your Amina Coin Asset ID
            this.walletReady = true;
        } catch (error) {
            console.log('⚠️ Pera Wallet not available, using play money only');
            this.walletReady = false;
        }
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupCurrencyToggle();
        this.setupGames();
        this.updateDisplay();
        
        // ADD PERA WALLET SETUP AFTER EVERYTHING ELSE LOADS
        setTimeout(() => {
            this.setupPeraWallet();
        }, 1000);
        
        console.log('🌌 Amina Casino with Pera Wallet loaded!');
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (!btn.classList.contains('donation-btn')) {
                btn.addEventListener('click', (e) => {
                    this.switchGame(e.target.dataset.game);
                });
            }
        });
        
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.switchGame(e.currentTarget.dataset.game);
            });
        });
    }
    
    switchGame(game) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(game).classList.add('active');
        document.querySelector(`[data-game="${game}"]`).classList.add('active');
        
        // Reinitialize plinko when switching to it
        if (game === 'plinko') {
            setTimeout(() => this.initPlinko(), 100);
        }
    }
    
    // PERA WALLET FUNCTIONS - SAFE VERSION
    setupPeraWallet() {
        if (!this.walletReady) {
            console.log('💫 Wallet features disabled, HC mode only');
            return;
        }
        
        // Add connect wallet button to header
        this.addWalletButton();
        
        // Check if wallet was previously connected
        this.peraWallet.reconnectSession().then((accounts) => {
            if (accounts && accounts.length > 0) {
                this.connectedAccount = accounts[0];
                this.updateWalletUI();
                this.fetchAminaBalance();
                console.log('🔗 Wallet reconnected!');
            }
        }).catch(() => {
            console.log('No previous wallet session');
        });
    }
    
    addWalletButton() {
        const headerControls = document.querySelector('.header-controls');
        if (!headerControls) return;
        
        // Check if button already exists
        if (document.getElementById('walletBtn')) return;
        
        const walletBtn = document.createElement('button');
        walletBtn.id = 'walletBtn';
        walletBtn.className = 'wallet-btn';
        walletBtn.innerHTML = '🔗 Connect Wallet';
        walletBtn.addEventListener('click', () => this.toggleWallet());
        
        // Insert before balance display
        headerControls.insertBefore(walletBtn, headerControls.firstChild);
        
        console.log('💳 Wallet button added!');
    }
    
    async toggleWallet() {
        if (!this.walletReady) {
            this.showNotification('❌ Pera Wallet not available', 'lose');
            return;
        }
        
        if (this.connectedAccount) {
            // Disconnect wallet
            try {
                await this.peraWallet.disconnect();
                this.connectedAccount = null;
                this.balance.AMINA = 0;
                // Switch back to HC if using AMINA
                if (this.isAmina) {
                    this.isAmina = false;
                    this.currentCurrency = 'HC';
                    document.getElementById('currencyToggle').classList.remove('amina');
                    document.querySelector('.currency-text').textContent = 'HC';
                }
                this.updateWalletUI();
                this.updateDisplay();
                this.showNotification('🔌 Wallet disconnected', 'info');
            } catch (error) {
                console.error('Disconnect failed:', error);
            }
        } else {
            // Connect wallet
            try {
                console.log('🔗 Attempting to connect wallet...');
                const accounts = await this.peraWallet.connect();
                
                if (accounts && accounts.length > 0) {
                    this.connectedAccount = accounts[0];
                    console.log('✅ Wallet connected:', this.connectedAccount);
                    this.updateWalletUI();
                    await this.fetchAminaBalance();
                    this.showNotification('🔗 Wallet connected successfully!', 'win');
                } else {
                    this.showNotification('❌ No accounts found', 'lose');
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
                this.showNotification('❌ Connection cancelled or failed', 'lose');
            }
        }
    }
    
    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        if (this.connectedAccount) {
            const shortAddress = this.connectedAccount.slice(0, 6) + '...' + this.connectedAccount.slice(-4);
            walletBtn.innerHTML = `✅ ${shortAddress}`;
            walletBtn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
        } else {
            walletBtn.innerHTML = '🔗 Connect Wallet';
            walletBtn.style.background = 'linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-pink))';
        }
    }
    
    async fetchAminaBalance() {
        if (!this.connectedAccount) return;
        
        try {
            // Use Algorand Node API to get account info
            const response = await fetch(`https://mainnet-api.algonode.cloud/v2/accounts/${this.connectedAccount}`);
            const accountInfo = await response.json();
            
            // Find AMINA asset in account
            const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === this.aminaAssetId);
            
            if (aminaAsset) {
                this.balance.AMINA = aminaAsset.amount / 1000000; // Convert from microAlgos
            } else {
                this.balance.AMINA = 0; // User doesn't have AMINA
            }
            
            this.updateDisplay();
            console.log(`🪙 AMINA Balance: ${this.balance.AMINA}`);
            
        } catch (error) {
            console.error('Failed to fetch AMINA balance:', error);
            this.showNotification('⚠️ Could not fetch AMINA balance', 'lose');
        }
    }
    
    // Enhanced currency toggle for wallet
    setupCurrencyToggle() {
        document.getElementById('currencyToggle').addEventListener('click', () => {
            // If trying to switch TO AMINA but no wallet connected
            if (!this.isAmina && !this.connectedAccount) {
                this.showNotification('🔗 Connect wallet to use AMINA!', 'lose');
                return; // Don't switch
            }
            
            // Toggle currency
            this.isAmina = !this.isAmina;
            this.currentCurrency = this.isAmina ? 'AMINA' : 'HC';
            
            const toggle = document.getElementById('currencyToggle');
            const text = document.querySelector('.currency-text');
            
            if (this.isAmina) {
                toggle.classList.add('amina');
                text.textContent = 'AMINA';
                if (this.connectedAccount) {
                    this.fetchAminaBalance(); // Refresh balance when switching
                }
            } else {
                toggle.classList.remove('amina');
                text.textContent = 'HC';
            }
            
            this.updateDisplay();
            console.log(`💰 Switched to ${this.currentCurrency}`);
        });
    }
    
    setupGames() {
        this.initSlots();
        document.getElementById('spinBtn').addEventListener('click', () => this.spinSlots());
        
        this.initPlinko();
        document.getElementById('dropBtn').addEventListener('click', () => this.dropPlinko());
        
        this.initBlackjack();
        document.getElementById('dealBtn').addEventListener('click', () => this.dealCards());
        document.getElementById('hitBtn').addEventListener('click', () => this.hit());
        document.getElementById('standBtn').addEventListener('click', () => this.stand());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    }
    
    updateDisplay() {
        document.getElementById('balanceAmount').textContent = this.balance[this.currentCurrency];
        document.getElementById('currencySymbol').textContent = this.currentCurrency;
        document.getElementById('slotsCurrency').textContent = this.currentCurrency;
        document.getElementById('plinkoCurrency').textContent = this.currentCurrency;
        document.getElementById('blackjackCurrency').textContent = this.currentCurrency;
    }
    
    canAfford(amount) {
        return this.balance[this.currentCurrency] >= amount;
    }
    
    deductBalance(amount) {
        if (this.canAfford(amount)) {
            this.balance[this.currentCurrency] -= amount;
            this.animateBalance('lose');
            this.updateDisplay();
            return true;
        }
        return false;
    }
    
    addBalance(amount) {
        this.balance[this.currentCurrency] += amount;
        this.animateBalance('win');
        this.updateDisplay();
    }
    
    animateBalance(type) {
        const balanceDisplay = document.querySelector('.balance-display');
        balanceDisplay.classList.remove('win', 'lose');
        setTimeout(() => {
            balanceDisplay.classList.add(type);
            setTimeout(() => {
                balanceDisplay.classList.remove(type);
            }, 1000);
        }, 50);
    }
    
    showGameResult(gameId, message, type = 'info') {
        const resultDiv = document.getElementById(`${gameId}Result`);
        resultDiv.textContent = message;
        resultDiv.className = `game-result show ${type}`;
        
        setTimeout(() => {
            resultDiv.classList.remove('show');
        }, 4000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'win' ? '#4CAF50' : '#FFD700'};
            color: ${type === 'win' ? 'white' : 'black'};
            padding: 1rem 2rem;
            border-radius: 15px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            z-index: 1001;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // SLOTS GAME
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
    
    spinSlots() {
        const bet = parseFloat(document.getElementById('slotsBet').value);
        if (!this.canAfford(bet)) {
            this.showGameResult('slots', 'Insufficient balance!', 'lose');
            return;
        }
        
        this.deductBalance(bet);
        
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
                this.showGameResult('slots', `😔 No win this time. Try again!`, 'lose');
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
        const rows = [
            [0, 1, 2, 3, 4],
            [5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14]
        ];
        
        rows.forEach(rowIndices => {
            const rowSymbols = rowIndices.map(i => results[i]);
            const counts = {};
            rowSymbols.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
            
            Object.entries(counts).forEach(([symbol, count]) => {
                if (count >= 3) {
                    rowIndices.forEach(i => {
                        if (results[i] === symbol) {
                            reels[i].classList.add('winning');
                        }
                    });
                }
            });
        });
    }
    
    // CLASSIC TRIANGLE PLINKO - FIXED MULTIPLIERS!
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        // Shorter canvas so multipliers show below!
        canvas.width = window.innerWidth < 768 ? 350 : 400;
        canvas.height = window.innerWidth < 768 ? 250 : 280; // SHORTER for multipliers!
        
        this.plinkoCtx = canvas.getContext('2d');
        this.plinkoDropping = false;
        this.setupClassicTriangle();
        this.drawClassicBoard();
    }
    
    setupClassicTriangle() {
        this.pegs = [];
        const canvas = this.plinkoCtx.canvas;
        const rows = 6; // Fewer rows to fit better
        
        // Classic triangle formation
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 2; // Start with 2, grow by 1 each row
            const totalWidth = canvas.width - 80;
            const spacing = totalWidth / (rows + 1);
            const rowWidth = pegsInRow * spacing;
            const startX = (canvas.width - rowWidth) / 2;
            
            for (let peg = 0; peg < pegsInRow; peg++) {
                const x = startX + peg * spacing + spacing / 2;
                const y = 60 + row * 28; // Tighter spacing
                this.pegs.push({ x, y, radius: 6 });
            }
        }
    }
    
    drawClassicBoard() {
        const ctx = this.plinkoCtx;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Classic blue background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4169E1');
        gradient.addColorStop(1, '#1E90FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw classic white pegs
        this.pegs.forEach(peg => {
            // Peg shadow
            ctx.beginPath();
            ctx.arc(peg.x + 2, peg.y + 2, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
            
            // Main peg
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            // Peg outline
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
    
    dropPlinko() {
        const bet = parseFloat(document.getElementById('plinkoBet').value);
        if (!this.canAfford(bet) || this.plinkoDropping) {
            const message = this.plinkoDropping ? 'Ball already dropping!' : 'Insufficient balance!';
            this.showGameResult('plinko', message, 'lose');
            return;
        }
        
        this.deductBalance(bet);
        this.plinkoDropping = true;
        
        const button = document.getElementById('dropBtn');
        button.disabled = true;
        button.textContent = 'DROPPING...';
        
        this.animateClassicBall().then(finalSlot => {
            const multipliers = [10, 5, 2, 1, 0.5, 1, 2, 5, 10];
            const result = multipliers[finalSlot] || 1;
            const winAmount = bet * result;
            
            this.addBalance(winAmount);
            
            const resultMessage = winAmount > bet ? 
                `🎉 WINNER! Hit ${result}x! Won ${winAmount} ${this.currentCurrency}!` :
                `Ball hit ${result}x. Got ${winAmount} ${this.currentCurrency}`;
            
            const resultType = winAmount > bet ? 'win' : 'lose';
            this.showGameResult('plinko', resultMessage, resultType);
            
            // Highlight multiplier
            document.querySelectorAll('.multiplier').forEach(m => m.classList.remove('hit'));
            const multiplierElements = document.querySelectorAll('.multiplier');
            if (multiplierElements[finalSlot]) {
                multiplierElements[finalSlot].classList.add('hit');
                setTimeout(() => multiplierElements[finalSlot].classList.remove('hit'), 3000);
            }
            
            this.plinkoDropping = false;
            button.disabled = false;
            button.textContent = 'DROP BALL';
        });
    }
    
    animateClassicBall() {
        return new Promise(resolve => {
            const canvas = this.plinkoCtx.canvas;
            const ball = {
                x: canvas.width / 2, // Start at center top
                y: 30,
                vx: 0,
                vy: 2, // Start with downward velocity
                radius: 8,
                gravity: 0.3,
                bounce: 0.6
            };
            
            let bounceCount = 0;
            
            const animate = () => {
                this.drawClassicBoard();
                
                // Apply gravity
                ball.vy += ball.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // Peg collisions - classic bouncing
                let hitPeg = false;
                this.pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ball.radius + peg.radius && !hitPeg) {
                        hitPeg = true;
                        bounceCount++;
                        
                        // Calculate bounce angle
                        const angle = Math.atan2(dy, dx);
                        
                        // Move ball away from peg
                        ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.radius + 1);
                        ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.radius + 1);
                        
                        // Classic plinko bounce - more random left/right
                        ball.vx = (Math.random() - 0.5) * 4;
                        ball.vy = Math.abs(ball.vy) * ball.bounce + 1; // Keep falling
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
                
                // Draw classic red ball  
                const ctx = this.plinkoCtx;
                
                // Ball shadow
                ctx.beginPath();
                ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fill();
                
                // Main ball - classic red
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#FF4444';
                ctx.fill();
                
                // Ball highlight
                ctx.beginPath();
                ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = '#FF8888';
                ctx.fill();
                
                // End when ball reaches bottom - BEFORE the multipliers!
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
    
    // BLACKJACK GAME
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
        
        suits.forEach(suit => {
            values.forEach(value => {
                this.deck.push({value, suit});
            });
        });
        
        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        const bet = parseFloat(document.getElementById('blackjackBet').value);
        if (!this.canAfford(bet)) {
            this.showGameResult('blackjack', 'Insufficient balance!', 'lose');
            return;
        }
        
        this.deductBalance(bet);
        this.currentBet = bet;
        
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.gameActive = true;
        
        this.updateBlackjackDisplay();
        
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('hitBtn').disabled = false;
        document.getElementById('standBtn').disabled = false;
        document.getElementById('blackjackResult').classList.remove('show');
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
        
        // Dealer hits until 17 or higher
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
        let value = 0;
        let aces = 0;
        
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
        
        // Adjust for aces
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
                if (['♥', '♦'].includes(card.suit)) {
                    cardEl.classList.add('red');
                }
            }
            
            container.appendChild(cardEl);
        });
    }
    
    endGame(message, winAmount = 0, resultType = 'info') {
        this.gameActive = false;
        
        if (winAmount > 0) {
            this.addBalance(winAmount);
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
        document.getElementById('playerCards').innerHTML = '';
        document.getElementById('dealerCards').innerHTML = '';
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('dealerScore').textContent = '0';
    }
}

// Initialize casino when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌌 Initializing Amina Casino...');
    window.aminaCasino = new AminaCasino();
    console.log('✅ Amina Casino ready!');
});