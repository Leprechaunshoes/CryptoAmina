// Global Game State
const gameState = {
    balance: 1000,
    currency: 'HC', // HC or AMINA
    currentGame: 'home',
    isPlaying: false,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

// Currency Management
function toggleCurrency() {
    const toggle = document.getElementById('currencyToggle');
    const currencyText = toggle.querySelector('.currency-text');
    const currencySymbol = document.getElementById('currencySymbol');
    const allCurrencySpans = document.querySelectorAll('#slotsCurrency, #plinkoCurrency, #blackjackCurrency');
    
    if (gameState.currency === 'HC') {
        gameState.currency = 'AMINA';
        gameState.balance = parseFloat((gameState.balance * 0.001).toFixed(6));
        currencyText.textContent = 'AMINA';
        toggle.classList.add('active');
    } else {
        gameState.currency = 'HC';
        gameState.balance = parseFloat((gameState.balance * 1000).toFixed(2));
        currencyText.textContent = 'HC';
        toggle.classList.remove('active');
    }
    
    currencySymbol.textContent = gameState.currency;
    allCurrencySpans.forEach(span => span.textContent = gameState.currency);
    updateBalance();
}

function updateBalance() {
    const balanceElement = document.getElementById('balanceAmount');
    if (gameState.currency === 'AMINA') {
        balanceElement.textContent = gameState.balance.toFixed(6);
    } else {
        balanceElement.textContent = gameState.balance.toFixed(2);
    }
}

function deductBalance(amount) {
    if (gameState.balance >= amount) {
        gameState.balance -= amount;
        updateBalance();
        return true;
    }
    return false;
}

function addBalance(amount) {
    gameState.balance += amount;
    updateBalance();
    
    // Trigger win celebration for big wins
    if (amount > (gameState.currency === 'AMINA' ? 0.01 : 10)) {
        triggerWinCelebration(amount);
    }
}

function triggerWinCelebration(amount) {
    const winText = document.createElement('div');
    winText.textContent = `+${amount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}`;
    winText.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        color: #FFD700;
        font-size: 2rem;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        animation: floatWin 3s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatWin {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-100px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(winText);
    setTimeout(() => {
        winText.remove();
        style.remove();
    }, 3000);
}

// Navigation
function switchGame(gameName) {
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(gameName).classList.add('active');
    document.querySelector(`[data-game="${gameName}"]`).classList.add('active');
    gameState.currentGame = gameName;
    
    if (gameName === 'plinko') {
        plinkoGame.resizeCanvas();
    }
}

// SLOTS GAME
const slotsGame = {
    symbols: ['🌟', '🪐', '🌌', '☄️', '🚀', '🛸', '🌙', '⭐'],
    grid: [],
    payouts: {
        '🌟': { 5: 100, 4: 20, 3: 5 },
        '🪐': { 5: 50, 4: 15, 3: 3 },
        '🌌': { 5: 25, 4: 10, 3: 2 },
        '☄️': { 5: 15, 4: 8, 3: 2 },
        '🚀': { 5: 10, 4: 5, 3: 1 }
    },
    
    init() {
        this.createGrid();
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
    },
    
    createGrid() {
        const gridElement = document.getElementById('slotsGrid');
        gridElement.innerHTML = '';
        this.grid = [];
        
        for (let i = 0; i < 15; i++) {
            const cell = document.createElement('div');
            cell.className = 'slot-cell';
            cell.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            gridElement.appendChild(cell);
            this.grid.push(cell);
        }
    },
    
    spin() {
        if (gameState.isPlaying) return;
        
        const betAmount = parseFloat(document.getElementById('slotsBet').value);
        if (!deductBalance(betAmount)) {
            alert('Insufficient stellar balance!');
            return;
        }
        
        gameState.isPlaying = true;
        document.getElementById('spinBtn').disabled = true;
        
        this.grid.forEach((cell, index) => {
            cell.classList.add('spinning');
            
            const spinInterval = setInterval(() => {
                cell.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            }, 100);
            
            setTimeout(() => {
                clearInterval(spinInterval);
                cell.classList.remove('spinning');
                cell.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            }, 1000 + Math.random() * 1000);
        });
        
        setTimeout(() => {
            this.checkWins(betAmount);
            gameState.isPlaying = false;
            document.getElementById('spinBtn').disabled = false;
        }, 2500);
    },
    
    checkWins(betAmount) {
        const rows = [
            [this.grid[0], this.grid[1], this.grid[2], this.grid[3], this.grid[4]],
            [this.grid[5], this.grid[6], this.grid[7], this.grid[8], this.grid[9]],
            [this.grid[10], this.grid[11], this.grid[12], this.grid[13], this.grid[14]]
        ];
        
        let totalWin = 0;
        
        rows.forEach(row => {
            const symbols = row.map(cell => cell.textContent);
            const counts = {};
            symbols.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
            
            Object.entries(counts).forEach(([symbol, count]) => {
                if (this.payouts[symbol] && this.payouts[symbol][count]) {
                    totalWin += betAmount * this.payouts[symbol][count];
                    row.forEach(cell => {
                        if (cell.textContent === symbol) {
                            cell.classList.add('winning');
                            setTimeout(() => cell.classList.remove('winning'), 3000);
                        }
                    });
                }
            });
        });
        
        if (totalWin > 0) {
            addBalance(totalWin);
            setTimeout(() => {
                alert(`🌟 Cosmic Win! You won ${totalWin.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}!`);
            }, 500);
        }
    }
};

// PLINKO GAME - MOBILE ENHANCED
const plinkoGame = {
    canvas: null,
    ctx: null,
    balls: [],
    pegs: [],
    canvasWidth: 600,
    canvasHeight: 500,
    
    init() {
        this.canvas = document.getElementById('plinkoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.setupPegs();
        
        document.getElementById('dropBtn').addEventListener('click', () => this.dropBall());
        document.getElementById('dropZone').addEventListener('click', () => this.dropBall());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.dropBall();
        });
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    },
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.offsetWidth - 40;
        
        if (gameState.isMobile) {
            this.canvasWidth = Math.min(containerWidth, 350);
            this.canvasHeight = 300;
        } else {
            this.canvasWidth = Math.min(containerWidth, 600);
            this.canvasHeight = 500;
        }
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.setupPegs();
    },
    
    setupPegs() {
        this.pegs = [];
        const rows = gameState.isMobile ? 6 : 8;
        const pegSpacing = this.canvasWidth / 12;
        const startX = this.canvasWidth / 2;
        const startY = 80;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = (pegsInRow - 1) * pegSpacing;
            const rowStartX = startX - rowWidth / 2;
            
            for (let col = 0; col < pegsInRow; col++) {
                this.pegs.push({
                    x: rowStartX + col * pegSpacing,
                    y: startY + row * 50,
                    radius: gameState.isMobile ? 4 : 6
                });
            }
        }
    },
    
    dropBall() {
        if (gameState.isPlaying) return;
        
        const betAmount = parseFloat(document.getElementById('plinkoBet').value);
        if (!deductBalance(betAmount)) {
            alert('Insufficient cosmic energy!');
            return;
        }
        
        gameState.isPlaying = true;
        document.getElementById('dropBtn').disabled = true;
        
        const ball = {
            x: this.canvasWidth / 2 + (Math.random() - 0.5) * 20,
            y: 30,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            radius: gameState.isMobile ? 6 : 8,
            bounces: 0,
            betAmount: betAmount
        };
        
        this.balls.push(ball);
    },
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw pegs
        this.ctx.fillStyle = '#FFD700';
        this.pegs.forEach(peg => {
            this.ctx.beginPath();
            this.ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Update and draw balls
        this.balls.forEach((ball, index) => {
            ball.vy += 0.5;
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Collision with pegs
            this.pegs.forEach(peg => {
                const dx = ball.x - peg.x;
                const dy = ball.y - peg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball.radius + peg.radius) {
                    const angle = Math.atan2(dy, dx);
                    ball.vx = Math.cos(angle) * 3;
                    ball.vy = Math.abs(Math.sin(angle)) * 3;
                    ball.bounces++;
                }
            });
            
            // Side walls
            if (ball.x < ball.radius || ball.x > this.canvasWidth - ball.radius) {
                ball.vx *= -0.8;
                ball.x = Math.max(ball.radius, Math.min(this.canvasWidth - ball.radius, ball.x));
            }
            
            // Bottom detection
            if (ball.y > this.canvasHeight - 60) {
                const slotWidth = this.canvasWidth / 9;
                const slot = Math.floor(ball.x / slotWidth);
                const multipliers = [10, 3, 1.5, 1, 0.5, 1, 1.5, 3, 10];
                const multiplier = multipliers[Math.min(slot, 8)];
                
                const winAmount = ball.betAmount * multiplier;
                addBalance(winAmount);
                
                setTimeout(() => {
                    alert(`🌌 Quantum result! Ball landed in ${multiplier}x slot! Won ${winAmount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}!`);
                }, 100);
                
                this.balls.splice(index, 1);
                gameState.isPlaying = false;
                document.getElementById('dropBtn').disabled = false;
            }
            
            // Draw ball
            this.ctx.fillStyle = '#8A2BE2';
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowColor = '#8A2BE2';
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        requestAnimationFrame(() => this.animate());
    }
};

// BLACKJACK GAME
const blackjackGame = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    gameOver: false,
    playerScore: 0,
    dealerScore: 0,
    currentBet: 0,
    
    init() {
        document.getElementById('dealBtn').addEventListener('click', () => this.deal());
        document.getElementById('hitBtn').addEventListener('click', () => this.hit());
        document.getElementById('standBtn').addEventListener('click', () => this.stand());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    },
    
    createDeck() {
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        
        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.deck.push({ suit, rank });
            });
        });
        
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },
    
    getCardValue(card) {
        if (card.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        return parseInt(card.rank);
    },
    
    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        hand.forEach(card => {
            if (card.rank === 'A') {
                aces++;
                score += 11;
            } else if (['J', 'Q', 'K'].includes(card.rank)) {
                score += 10;
            } else {
                score += parseInt(card.rank);
            }
        });
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    },
    
    createCardElement(card, hidden = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (hidden) {
            cardEl.className += ' card-back';
            cardEl.textContent = '🌌';
        } else {
            if (card.suit === '♥️' || card.suit === '♦️') {
                cardEl.classList.add('red');
            }
            cardEl.innerHTML = `<div>${card.rank}</div><div>${card.suit}</div>`;
        }
        
        return cardEl;
    },
    
    deal() {
        const betAmount = parseFloat(document.getElementById('blackjackBet').value);
        if (!deductBalance(betAmount)) {
            alert('Insufficient galactic credits!');
            return;
        }
        
        this.currentBet = betAmount;
        this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = false;
        
        this.playerHand.push(this.deck.pop(), this.deck.pop());
        this.dealerHand.push(this.deck.pop(), this.deck.pop());
        
        this.updateDisplay();
        this.checkBlackjack();
        
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('hitBtn').disabled = false;
        document.getElementById('standBtn').disabled = false;
    },
    
    hit() {
        if (this.gameOver) return;
        
        this.playerHand.push(this.deck.pop());
        this.updateDisplay();
        
        if (this.playerScore > 21) {
            this.endGame('💥 Bust! The cosmic dealer wins.');
        }
    },
    
    stand() {
        if (this.gameOver) return;
        
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.pop());
        }
        
        this.updateDisplay();
        this.determineWinner();
    },
    
    checkBlackjack() {
        if (this.playerScore === 21) {
            if (this.calculateScore(this.dealerHand) === 21) {
                this.endGame('🌌 Push! Both have blackjack in the cosmos.');
                addBalance(this.currentBet);
            } else {
                this.endGame('⭐ Blackjack! The stars align for you!');
                addBalance(this.currentBet * 2.5);
            }
        }
    },
    
    determineWinner() {
        const dealerScore = this.calculateScore(this.dealerHand);
        
        if (dealerScore > 21) {
            this.endGame('💥 Dealer busts! Victory among the stars!');
            addBalance(this.currentBet * 2);
        } else if (this.playerScore > dealerScore) {
            this.endGame('🚀 You win! The galaxy rewards you!');
            addBalance(this.currentBet * 2);
        } else if (this.playerScore < dealerScore) {
            this.endGame('🌑 Dealer wins this cosmic battle.');
        } else {
            this.endGame('🌌 Push! The cosmic forces are balanced.');
            addBalance(this.currentBet);
        }
    },
    
    endGame(message) {
        this.gameOver = true;
        document.getElementById('gameMessage').textContent = message;
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        document.getElementById('newGameBtn').style.display = 'inline-block';
        
        if (message.includes('win') || message.includes('Victory') || message.includes('Blackjack')) {
            document.getElementById('gameMessage').className = 'game-message win';
        } else if (message.includes('Push') || message.includes('balanced')) {
            document.getElementById('gameMessage').className = 'game-message';
        } else {
            document.getElementById('gameMessage').className = 'game-message lose';
        }
    },
    
    newGame() {
        document.getElementById('dealBtn').disabled = false;
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('gameMessage').textContent = '';
        document.getElementById('gameMessage').className = 'game-message';
        
        document.getElementById('playerCards').innerHTML = '';
        document.getElementById('dealerCards').innerHTML = '';
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('dealerScore').textContent = '0';
    },
    
    updateDisplay() {
        this.playerScore = this.calculateScore(this.playerHand);
        this.dealerScore = this.calculateScore(this.dealerHand);
        
        const playerContainer = document.getElementById('playerCards');
        playerContainer.innerHTML = '';
        this.playerHand.forEach(card => {
            playerContainer.appendChild(this.createCardElement(card));
        });
        
        const dealerContainer = document.getElementById('dealerCards');
        dealerContainer.innerHTML = '';
        this.dealerHand.forEach((card, index) => {
            const hidden = !this.gameOver && index === 1;
            dealerContainer.appendChild(this.createCardElement(card, hidden));
        });
        
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('dealerScore').textContent = this.gameOver ? this.dealerScore : this.getCardValue(this.dealerHand[0]);
    }
};

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌌 Amina Casino - Enhanced cosmic systems online!');
    
    document.getElementById('currencyToggle').addEventListener('click', toggleCurrency);
    
    document.querySelectorAll('.nav-btn, .game-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const game = e.target.closest('[data-game]').dataset.game;
            switchGame(game);
        });
    });
    
    slotsGame.init();
    plinkoGame.init();
    blackjackGame.init();
    
    updateBalance();
    
    console.log('🚀 All enhanced cosmic gaming systems initialized!');
});