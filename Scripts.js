// Amina Casino - Enhanced Game Logic
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
        
        // Reinitialize plinko when switching to it
        if (game === 'plinko') {
            setTimeout(() => this.initPlinko(), 100);
        }
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
    
    // PLINKO - PERFECT MOBILE VERTICAL VERSION
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        // Perfect mobile sizing
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            canvas.width = Math.min(350, window.innerWidth - 20);
            canvas.height = 280; // Shorter for mobile so multipliers show!
        } else {
            canvas.width = 400;
            canvas.height = 350;
        }
        
        this.plinkoCtx = canvas.getContext('2d');
        this.plinkoDropping = false;
        this.setupPerfectPlinko();
        this.drawBeautifulBoard();
    }
    
    setupPerfectPlinko() {
        this.pegs = [];
        const canvas = this.plinkoCtx.canvas;
        const rows = 5; // Perfect amount for mobile
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = 4 + row;
            const spacing = (canvas.width - 60) / pegsInRow;
            
            for (let peg = 0; peg < pegsInRow; peg++) {
                const x = 30 + spacing * (peg + 0.5);
                const y = 80 + row * 35;
                this.pegs.push({ x, y, radius: 5 });
            }
        }
    }
    
    drawBeautifulBoard() {
        const ctx = this.plinkoCtx;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Beautiful gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#2d1b69');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw beautiful pegs with glow
        this.pegs.forEach(peg => {
            // Peg glow
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius + 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.fill();
            
            // Main peg
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            
            // Peg highlight
            ctx.beginPath();
            ctx.arc(peg.x - 1, peg.y - 1, peg.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFF99';
            ctx.fill();
        });
        
        // Draw side guides
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 60);
        ctx.lineTo(15, canvas.height - 20);
        ctx.moveTo(canvas.width - 15, 60);
        ctx.lineTo(canvas.width - 15, canvas.height - 20);
        ctx.stroke();
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
        
        this.animateBulletproofBall().then(finalSlot => {
            const multipliers = [10, 5, 2, 1, 0.5, 1, 2, 5, 10];
            const result = multipliers[finalSlot] || 1;
            const winAmount = bet * result;
            
            this.addBalance(winAmount);
            
            const resultMessage = winAmount > bet ? 
                `🌌 WIN! ${result}x multiplier! +${winAmount} ${this.currentCurrency}` :
                `Ball hit ${result}x. +${winAmount} ${this.currentCurrency}`;
            
            const resultType = winAmount > bet ? 'win' : 'lose';
            this.showGameResult('plinko', resultMessage, resultType);
            
            // Highlight multiplier
            document.querySelectorAll('.multiplier').forEach(m => m.classList.remove('hit'));
            const multiplierElements = document.querySelectorAll('.multiplier');
            if (multiplierElements[finalSlot]) {
                multiplierElements[finalSlot].classList.add('hit');
                setTimeout(() => multiplierElements[finalSlot].classList.remove('hit'), 2000);
            }
            
            this.plinkoDropping = false;
            button.disabled = false;
            button.textContent = 'DROP BALL';
        });
    }
    
    animateBulletproofBall() {
        return new Promise(resolve => {
            const canvas = this.plinkoCtx.canvas;
            const ball = {
                x: canvas.width / 2,
                y: 50,
                vx: 0,
                vy: 0,
                radius: 8,
                gravity: 0.5,
                maxSpeed: 8
            };
            
            let frameCount = 0;
            
            const animate = () => {
                frameCount++;
                this.drawSimpleBoard();
                
                // Simple gravity
                ball.vy += ball.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // Limit speed to prevent freezing
                if (Math.abs(ball.vx) > ball.maxSpeed) ball.vx = ball.maxSpeed * Math.sign(ball.vx);
                if (ball.vy > ball.maxSpeed) ball.vy = ball.maxSpeed;
                
                // Simple peg bouncing
                this.pegs.forEach(peg => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ball.radius + peg.radius) {
                        // Simple bounce away from peg
                        ball.x = peg.x + (dx / distance) * (ball.radius + peg.radius + 2);
                        ball.y = peg.y + (dy / distance) * (ball.radius + peg.radius + 2);
                        
                        // Random direction change
                        ball.vx = (Math.random() - 0.5) * 4;
                        ball.vy = Math.abs(ball.vy) * 0.7;
                    }
                });
                
                // Wall bounces
                if (ball.x < ball.radius + 20) {
                    ball.x = ball.radius + 20;
                    ball.vx = Math.abs(ball.vx);
                } else if (ball.x > canvas.width - ball.radius - 20) {
                    ball.x = canvas.width - ball.radius - 20;
                    ball.vx = -Math.abs(ball.vx);
                }
                
                // Draw ball
                this.plinkoCtx.beginPath();
                this.plinkoCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                this.plinkoCtx.fillStyle = '#00E5FF';
                this.plinkoCtx.fill();
                
                // Safety check - force end if ball is stuck or taking too long
                if (ball.y > canvas.height - 30 || frameCount > 600) {
                    const slotWidth = (canvas.width - 40) / 9;
                    const finalSlot = Math.floor((ball.x - 20) / slotWidth);
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