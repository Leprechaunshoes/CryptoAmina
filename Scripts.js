// FILE: scripts.js

class AminaCasino {
    constructor() {
        this.balance = { HC: 1000, AMINA: 0 };
        this.currentCurrency = 'HC';
        this.isAmina = false;
        this.slotSymbols = ['⭐', '🌟', '💫', '🌌', '🪐', '🌙', '☄️', '🚀', '👽', '🛸'];
        this.walletReady = false;
        this.peraWallet = null;
        this.connectedAccount = null;
        this.aminaAssetId = 1107424865;
        this.init();
    }
    
    async init() {
        this.setupNavigation();
        this.setupCurrencyToggle();
        this.setupGames();
        this.updateDisplay();
        await this.initializePeraWallet();
        console.log('🌌 Amina Casino loaded!');
    }
    
    async initializePeraWallet() {
        try {
            if (typeof PeraWalletConnect !== 'undefined') {
                this.peraWallet = new PeraWalletConnect({ chainId: 416001 });
                this.walletReady = true;
                this.setupWalletButton();
                try {
                    const accounts = await this.peraWallet.reconnectSession();
                    if (accounts && accounts.length > 0) {
                        this.connectedAccount = accounts[0];
                        this.updateWalletUI();
                        await this.fetchAminaBalance();
                        this.showNotification('🔗 Wallet reconnected!', 'win');
                    }
                } catch (e) { console.log('No previous session'); }
            } else {
                throw new Error('PeraWalletConnect not loaded');
            }
        } catch (error) {
            this.walletReady = false;
            this.setupWalletButton();
        }
    }
    
    setupWalletButton() {
        const walletBtn = document.getElementById('walletBtn');
        if (walletBtn) {
            walletBtn.addEventListener('click', () => this.toggleWallet());
            if (!this.walletReady) {
                walletBtn.innerHTML = '❌ Wallet Unavailable';
                walletBtn.style.opacity = '0.6';
                walletBtn.disabled = true;
            }
        }
    }
    
    async toggleWallet() {
        if (!this.walletReady || !this.peraWallet) {
            this.showNotification('❌ Pera Wallet not available', 'lose');
            return;
        }
        
        if (this.connectedAccount) {
            try {
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
                this.showNotification('🔌 Wallet disconnected', 'info');
            } catch (error) {
                this.showNotification('❌ Disconnect failed', 'lose');
            }
        } else {
            try {
                const accounts = await this.peraWallet.connect();
                if (accounts && accounts.length > 0) {
                    this.connectedAccount = accounts[0];
                    this.updateWalletUI();
                    await this.fetchAminaBalance();
                    this.showNotification('🔗 Wallet connected!', 'win');
                } else {
                    this.showNotification('❌ No accounts found', 'lose');
                }
            } catch (error) {
                if (error.message && error.message.includes('cancelled')) {
                    this.showNotification('🚫 Connection cancelled', 'info');
                } else {
                    this.showNotification('❌ Connection failed', 'lose');
                }
            }
        }
    }
    
    updateWalletUI() {
        const walletBtn = document.getElementById('walletBtn');
        if (!walletBtn) return;
        
        if (this.connectedAccount) {
            const shortAddress = this.connectedAccount.slice(0, 6) + '...' + this.connectedAccount.slice(-4);
            walletBtn.innerHTML = `✅ ${shortAddress}`;
            walletBtn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
            walletBtn.disabled = false;
        } else {
            walletBtn.innerHTML = '🔗 Connect Wallet';
            walletBtn.style.background = 'linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-pink))';
            walletBtn.disabled = !this.walletReady;
        }
    }
    
    async fetchAminaBalance() {
        if (!this.connectedAccount) return;
        try {
            const response = await fetch(`https://mainnet-api.algonode.cloud/v2/accounts/${this.connectedAccount}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const accountInfo = await response.json();
            const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === this.aminaAssetId);
            this.balance.AMINA = aminaAsset ? aminaAsset.amount / 1000000 : 0;
            this.updateDisplay();
        } catch (error) {
            this.showNotification('⚠️ Could not fetch AMINA balance', 'lose');
            this.balance.AMINA = 0;
        }
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (!btn.classList.contains('donation-btn')) {
                btn.addEventListener('click', (e) => this.switchGame(e.target.dataset.game));
            }
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
    
    setupCurrencyToggle() {
        document.getElementById('currencyToggle').addEventListener('click', () => {
            if (!this.isAmina && !this.connectedAccount) {
                this.showNotification('🔗 Connect wallet to use AMINA!', 'lose');
                return;
            }
            this.isAmina = !this.isAmina;
            this.currentCurrency = this.isAmina ? 'AMINA' : 'HC';
            const toggle = document.getElementById('currencyToggle');
            const text = document.querySelector('.currency-text');
            if (this.isAmina) {
                toggle.classList.add('amina');
                text.textContent = 'AMINA';
                if (this.connectedAccount) this.fetchAminaBalance();
            } else {
                toggle.classList.remove('amina');
                text.textContent = 'HC';
            }
            this.updateDisplay();
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
        const balance = this.balance[this.currentCurrency];
        document.getElementById('balanceAmount').textContent = typeof balance === 'number' ? balance.toFixed(2) : balance;
        document.getElementById('currencySymbol').textContent = this.currentCurrency;
        document.getElementById('slotsCurrency').textContent = this.currentCurrency;
        document.getElementById('plinkoCurrency').textContent = this.currentCurrency;
        document.getElementById('blackjackCurrency').textContent = this.currentCurrency;
    }
    
    canAfford(amount) { return this.balance[this.currentCurrency] >= amount; }
    
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
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${type === 'win' ? '#4CAF50' : type === 'lose' ? '#F44336' : '#FFD700'}; color: white; padding: 1rem 2rem; border-radius: 15px; font-family: 'Orbitron', monospace; font-weight: 700; z-index: 1001; box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
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
                this.showGameResult('slots', `🌟 WIN! +${winAmount.toFixed(2)} ${this.currentCurrency}`, 'win');
            } else {
                this.showGameResult('slots', `😔 No win this time. Try again!`, 'lose');
            }
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN';
        }, 2500);
    }
    
    calculateSlotWin(results, bet) {
        const rows = [[results[0], results[1], results[2], results[3], results[4]], [results[5], results[6], results[7], results[8], results[9]], [results[10], results[11], results[12], results[13], results[14]]];
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
        const rows = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14]];
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
    
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        const isMobile = window.innerWidth < 768;
        canvas.width = isMobile ? 350 : 400;
        canvas.height = isMobile ? 500 : 550;
        this.plinkoCtx = canvas.getContext('2d');
        this.plinkoDropping = false;
        this.setupStakePlinko();
        this.drawStakeBoard();
    }
    
    setupStakePlinko() {
        this.pegs = [];
        const canvas = this.plinkoCtx.canvas;
        const rows = 10;
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = canvas.width - 60;
            const spacing = rowWidth / (pegsInRow + 1);
            for (let peg = 0; peg < pegsInRow; peg++) {
                const x = spacing * (peg + 1);
                const y = 80 + row * 35;
                this.pegs.push({ x, y, radius: 4 });
            }
        }
    }
    
    drawStakeBoard() {
        const ctx = this.plinkoCtx;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f1123');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x + 1, peg.y + 1, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
    }
    
    dropPlinko() {
        const bet = parseFloat(document.getElementById('plinkoBet').value);
        if (!this.canAfford(bet) || this.plinkoDropping) {
            this.showGameResult('plinko', this.plinkoDropping ? 'Ball already dropping!' : 'Insufficient balance!', 'lose');
            return;
        }
        this.deductBalance(bet);
        this.plinkoDropping = true;
        const button = document.getElementById('dropBtn');
        button.disabled = true;
        button.textContent = 'DROPPING...';
        this.animateStakeBall().then(finalSlot => {
            const multipliers = [100, 20, 5, 2, 1, 0.5, 1, 2, 5, 20, 100];
            const result = multipliers[finalSlot] || 1;
            const winAmount = bet * result;
            this.addBalance(winAmount);
            const resultMessage = winAmount > bet ? `🎉 WINNER! Hit ${result}x! Won ${winAmount.toFixed(2)} ${this.currentCurrency}!` : `Ball hit ${result}x. Got ${winAmount.toFixed(2)} ${this.currentCurrency}`;
            this.showGameResult('plinko', resultMessage, winAmount > bet ? 'win' : 'lose');
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
    
    animateStakeBall() {
        return new Promise(resolve => {
            const canvas = this.plinkoCtx.canvas;
            const ball = { x: canvas.width / 2, y: 40, vx: 0, vy: 0, radius: 6, gravity: 0.25, bounce: 0.7, friction: 0.98 };
            const animate = () => {
                this.drawStakeBoard();
                ball.vy += ball.gravity;
                ball.vx *= ball.friction;
                ball.x += ball.vx;
                ball.y += ball.vy;
                this.pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < ball.radius + peg.radius) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = ball.radius + peg.radius - distance;
                        ball.x += Math.cos(angle) * overlap;
                        ball.y += Math.sin(angle) * overlap;
                        const bounceForce = 2 + Math.random() * 2;
                        ball.vx = Math.cos(angle) * bounceForce * (Math.random() - 0.5);
                        ball.vy = Math.abs(Math.sin(angle)) * bounceForce + 1;
                    }
                });
                if (ball.x < ball.radius + 15) {
                    ball.x = ball.radius + 15;
                    ball.vx = Math.abs(ball.vx) * 0.8;
                } else if (ball.x > canvas.width - ball.radius - 15) {
                    ball.x = canvas.width - ball.radius - 15;
                    ball.vx = -Math.abs(ball.vx) * 0.8;
                }
                const ctx = this.plinkoCtx;
                ctx.beginPath();
                ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ff4444';
                ctx.fill();
                if (ball.y > canvas.height - 90) {
                    const slotWidth = (canvas.width - 20) / 11;
                    const finalSlot = Math.floor((ball.x - 10) / slotWidth);
                    resolve(Math.max(0, Math.min(10, finalSlot)));
                } else {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        });
    }
    
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
        document.getElementById('dealerScore').textContent = this.gameActive ? this.getHandValue([this.dealerHand[0]]) : this.getHandValue(this.dealerHand);
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
            message += ` +${winAmount.toFixed(2)} ${this.currentCurrency}`;
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

document.addEventListener('DOMContentLoaded', () => {
    window.aminaCasino = new AminaCasino();
});