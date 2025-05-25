// Amina Casino - Main Game Logic
class AminaCasino {
    constructor() {
        this.balance = { HC: 1000, AMINA: 0 };
        this.currentCurrency = 'HC';
        this.isAmina = false;
        this.slotSymbols = ['⭐', '🌟', '💫', '🌌', '🪐', '🌙', '☄️', '🚀', '👽', '🛸'];
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupCurrencyToggle();
        this.setupGames();
        this.updateDisplay();
        console.log('🌌 Amina Casino loaded!');
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
    }
    
    setupCurrencyToggle() {
        document.getElementById('currencyToggle').addEventListener('click', () => {
            this.isAmina = !this.isAmina;
            this.currentCurrency = this.isAmina ? 'AMINA' : 'HC';
            
            const toggle = document.getElementById('currencyToggle');
            const text = document.querySelector('.currency-text');
            
            if (this.isAmina) {
                toggle.classList.add('amina');
                text.textContent = 'AMINA';
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
            this.updateDisplay();
            return true;
        }
        return false;
    }
    
    addBalance(amount) {
        this.balance[this.currentCurrency] += amount;
        this.updateDisplay();
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
            this.showNotification('Insufficient balance!');
            return;
        }
        
        this.deductBalance(bet);
        
        const reels = document.querySelectorAll('.slot-reel');
        const spinButton = document.getElementById('spinBtn');
        
        spinButton.disabled = true;
        spinButton.textContent = 'SPINNING...';
        
        reels.forEach(reel => reel.classList.add('spinning'));
        
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
                this.showNotification(`🌟 WIN! +${winAmount} ${this.currentCurrency}`, 'win');
            }
            
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN';
        }, 2000);
    }
    
    calculateSlotWin(results, bet) {
        // Check each row for matches
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
                if (count >= 5) totalWin += bet * 100; // 5 of a kind
                else if (count >= 4) totalWin += bet * 25; // 4 of a kind
                else if (count >= 3) totalWin += bet * 5;  // 3 of a kind
            });
        });
        
        return totalWin;
    }
    
    // PLINKO GAME
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(400, rect.width - 20);
        canvas.height = 300;
        
        this.plinkoCtx = canvas.getContext('2d');
        this.plinkoDropping = false;
        this.pegs = [];
        this.setupPlinkoPhysics();
        this.drawPlinkoBoard();
    }
    
    setupPlinkoPhysics() {
        this.pegs = [];
        const canvasWidth = this.plinkoCtx.canvas.width;
        
        for (let row = 0; row < 8; row++) {
            const pegsInRow = row + 3;
            const spacing = (canvasWidth - 60) / pegsInRow;
            const startX = 30 + spacing / 2;
            
            for (let peg = 0; peg < pegsInRow; peg++) {
                const x = startX + peg * spacing;
                const y = 40 + row * 30;
                this.pegs.push({x, y, radius: 4});
            }
        }
    }
    
    drawPlinkoBoard() {
        const ctx = this.plinkoCtx;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw pegs
        this.pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#4a5568';
            ctx.fill();
        });
    }
    
    dropPlinko() {
        const bet = parseFloat(document.getElementById('plinkoBet').value);
        if (!this.canAfford(bet) || this.plinkoDropping) {
            this.showNotification(this.plinkoDropping ? 'Ball already dropping!' : 'Insufficient balance!');
            return;
        }
        
        this.deductBalance(bet);
        this.plinkoDropping = true;
        
        const button = document.getElementById('dropBtn');
        button.disabled = true;
        button.textContent = 'DROPPING...';
        
        this.animatePlinkoBall().then(finalSlot => {
            const multipliers = [10, 3, 1, 0.5, 1, 3, 10];
            const result = multipliers[finalSlot] || 1;
            const winAmount = bet * result;
            
            this.addBalance(winAmount);
            this.showNotification(`🌌 Ball landed on ${result}x! +${winAmount} ${this.currentCurrency}`, winAmount > bet ? 'win' : 'info');
            
            // Highlight multiplier
            document.querySelectorAll('.multiplier').forEach(m => m.classList.remove('hit'));
            const multiplierElements = document.querySelectorAll('.multiplier');
            if (multiplierElements[finalSlot]) {
                multiplierElements[finalSlot].classList.add('hit');
            }
            
            setTimeout(() => {
                document.querySelectorAll('.multiplier').forEach(m => m.classList.remove('hit'));
            }, 3000);
            
            this.plinkoDropping = false;
            button.disabled = false;
            button.textContent = 'DROP BALL';
        });
    }
    
    animatePlinkoBall() {
        return new Promise(resolve => {
            const canvas = this.plinkoCtx.canvas;
            const ball = {
                x: canvas.width / 2,
                y: 20,
                vx: (Math.random() - 0.5) * 2,
                vy: 0,
                radius: 6,
                gravity: 0.3,
                bounce: 0.7
            };
            
            const animate = () => {
                this.drawPlinkoBoard();
                
                // Update physics
                ball.vy += ball.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // Check peg collisions
                this.pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ball.radius + peg.radius + 2) {
                        const angle = Math.atan2(dy, dx);
                        ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.radius + 2);
                        ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.radius + 2);
                        
                        ball.vx = Math.cos(angle) * 3 + (Math.random() - 0.5) * 2;
                        ball.vy = Math.abs(Math.sin(angle)) * 3;
                    }
                });
                
                // Wall collisions
                if (ball.x < 20) {
                    ball.x = 20;
                    ball.vx = Math.abs(ball.vx) * ball.bounce;
                } else if (ball.x > canvas.width - 20) {
                    ball.x = canvas.width - 20;
                    ball.vx = -Math.abs(ball.vx) * ball.bounce;
                }
                
                // Draw ball
                const ctx = this.plinkoCtx;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00e5ff';
                ctx.fill();
                
                // Check if ball reached bottom
                if (ball.y > canvas.height - 40) {
                    const slotWidth = canvas.width / 7;
                    const finalSlot = Math.floor(ball.x / slotWidth);
                    resolve(Math.max(0, Math.min(6, finalSlot)));
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
            this.showNotification('Insufficient balance!');
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
    }
    
    hit() {
        if (!this.gameActive) return;
        
        this.playerHand.push(this.deck.pop());
        this.updateBlackjackDisplay();
        
        if (this.getHandValue(this.playerHand) > 21) {
            this.endGame('Bust! You lose.');
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
            this.endGame('Dealer busts! You win!', this.currentBet * 2);
        } else if (playerValue > dealerValue) {
            this.endGame('You win!', this.currentBet * 2);
        } else if (playerValue < dealerValue) {
            this.endGame('Dealer wins!');
        } else {
            this.endGame('Push!', this.currentBet);
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
    
    endGame(message, winAmount = 0) {
        this.gameActive = false;
        
        if (winAmount > 0) {
            this.addBalance(winAmount);
            message += ` +${winAmount} ${this.currentCurrency}`;
        }
        
        document.getElementById('gameMessage').textContent = message;
        
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        document.getElementById('newGameBtn').style.display = 'inline-block';
    }
    
    newGame() {
        this.initBlackjack();
        document.getElementById('dealBtn').disabled = false;
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('gameMessage').textContent = '';
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