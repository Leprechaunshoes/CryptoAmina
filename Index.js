// Game Mechanics
class CosmicCasino {
    constructor() {
        this.slotSymbols = ['🌟', '💫', '🌙', '🪐', '🌌', '☄️', '🛸'];
        this.blackjackDeck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.gameInProgress = false;
        
        this.initializeGames();
    }

    initializeGames() {
        this.setupSlotMachine();
        this.setupBlackjack();
        this.setupPlinko();
    }

    // SLOT MACHINE
    setupSlotMachine() {
        document.getElementById('spinBtn').addEventListener('click', () => {
            this.spinSlots();
        });
    }

    async spinSlots() {
        const betAmount = parseFloat(document.getElementById('slotBet').value);
        const spinBtn = document.getElementById('spinBtn');
        
        if (isNaN(betAmount) || betAmount <= 0) {
            this.showGameMessage('slotResult', 'Please enter a valid bet amount', 'error');
            return;
        }

        // Check if wallet is available and place bet
        if (!window.wallet || !await window.wallet.placeBet(betAmount)) {
            return;
        }

        spinBtn.disabled = true;
        this.showGameMessage('slotResult', 'Spinning...', 'info');

        // Animate reels
        const reels = ['reel1', 'reel2', 'reel3'];
        const results = [];

        // Spin animation
        for (let i = 0; i < 20; i++) {
            reels.forEach(reelId => {
                const reel = document.getElementById(reelId);
                reel.textContent = this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)];
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Final results
        reels.forEach((reelId, index) => {
            const symbol = this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)];
            document.getElementById(reelId).textContent = symbol;
            results.push(symbol);
        });

        // Check for wins
        const { win, multiplier, message } = this.checkSlotWin(results);
        
        if (win) {
            const payout = await window.wallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('slotResult', `${message} | Won: ${payout.toFixed(2)}`, 'win');
        } else {
            this.showGameMessage('slotResult', message, 'lose');
        }

        spinBtn.disabled = false;
    }

    checkSlotWin(results) {
        const [first, second, third] = results;
        
        // Three matching symbols
        if (first === second && second === third) {
            if (first === '🌟') return { win: true, multiplier: 10, message: '⭐ JACKPOT! Three Stars!' };
            if (first === '💫') return { win: true, multiplier: 8, message: '💫 STELLAR! Three Sparkles!' };
            if (first === '🌙') return { win: true, multiplier: 6, message: '🌙 LUNAR WIN! Three Moons!' };
            return { win: true, multiplier: 4, message: '🎉 Three of a Kind!' };
        }
        
        // Two matching symbols
        if (first === second || second === third || first === third) {
            return { win: true, multiplier: 2, message: '✨ Pair Match!' };
        }
        
        // Special combinations
        if (results.includes('🌟') && results.includes('💫')) {
            return { win: true, multiplier: 3, message: '🌟💫 Cosmic Combo!' };
        }

        return { win: false, multiplier: 0, message: 'No match - Try again!' };
    }

    // BLACKJACK
    setupBlackjack() {
        document.getElementById('dealBtn').addEventListener('click', () => {
            this.dealBlackjack();
        });
        
        document.getElementById('hitBtn').addEventListener('click', () => {
            this.hitBlackjack();
        });
        
        document.getElementById('standBtn').addEventListener('click', () => {
            this.standBlackjack();
        });

        this.createDeck();
    }

    createDeck() {
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.blackjackDeck = [];
        suits.forEach(suit => {
            values.forEach(value => {
                this.blackjackDeck.push({ suit, value, score: this.getCardValue(value) });
            });
        });
        
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.blackjackDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blackjackDeck[i], this.blackjackDeck[j]] = [this.blackjackDeck[j], this.blackjackDeck[i]];
        }
    }

    getCardValue(value) {
        if (value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(value)) return 10;
        return parseInt(value);
    }

    async dealBlackjack() {
        const betAmount = parseFloat(document.getElementById('blackjackBet').value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            this.showGameMessage('blackjackResult', 'Please enter a valid bet amount', 'error');
            return;
        }

        if (!window.wallet || !await window.wallet.placeBet(betAmount)) {
            return;
        }

        // Reset game
        this.playerHand = [];
        this.dealerHand = [];
        this.gameInProgress = true;
        
        // Deal initial cards
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        
        this.updateBlackjackDisplay();
        
        // Check for blackjack
        if (this.calculateScore(this.playerHand) === 21) {
            this.endBlackjackGame();
        } else {
            this.toggleBlackjackButtons(true);
        }
    }

    drawCard() {
        if (this.blackjackDeck.length < 10) {
            this.createDeck();
        }
        return this.blackjackDeck.pop();
    }

    hitBlackjack() {
        if (!this.gameInProgress) return;
        
        this.playerHand.push(this.drawCard());
        this.updateBlackjackDisplay();
        
        const playerScore = this.calculateScore(this.playerHand);
        if (playerScore >= 21) {
            this.endBlackjackGame();
        }
    }

    standBlackjack() {
        if (!this.gameInProgress) return;
        
        // Dealer plays
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.drawCard());
        }
        
        this.endBlackjackGame();
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        hand.forEach(card => {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else {
                score += card.score;
            }
        });
        
        // Adjust for aces
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    }

    updateBlackjackDisplay() {
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.gameInProgress ? 
            this.calculateScore([this.dealerHand[0]]) : 
            this.calculateScore(this.dealerHand);

        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('dealerScore').textContent = this.gameInProgress ? '?' : dealerScore;

        // Update cards display
        this.displayCards('playerCards', this.playerHand);
        this.displayCards('dealerCards', this.dealerHand, this.gameInProgress);
    }

    displayCards(containerId, hand, hideSecond = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            
            if (hideSecond && index === 1) {
                cardEl.textContent = '🂠';
                cardEl.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                cardEl.style.color = 'white';
            } else {
                cardEl.textContent = `${card.value}${card.suit}`;
                cardEl.style.color = ['♥️', '♦️'].includes(card.suit) ? '#ef4444' : '#1f2937';
            }
            
            container.appendChild(cardEl);
        });
    }

    async endBlackjackGame() {
        this.gameInProgress = false;
        this.toggleBlackjackButtons(false);
        this.updateBlackjackDisplay();
        
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        const betAmount = parseFloat(document.getElementById('blackjackBet').value);
        
        let result, multiplier = 0;
        
        if (playerScore > 21) {
            result = 'Player Bust! Dealer Wins';
        } else if (dealerScore > 21) {
            result = 'Dealer Bust! Player Wins';
            multiplier = 2;
        } else if (playerScore === 21 && this.playerHand.length === 2) {
            result = 'BLACKJACK! Player Wins';
            multiplier = 2.5;
        } else if (playerScore > dealerScore) {
            result = 'Player Wins!';
            multiplier = 2;
        } else if (dealerScore > playerScore) {
            result = 'Dealer Wins';
        } else {
            result = 'Push - Tie Game';
            multiplier = 1; // Return bet
        }
        
        if (multiplier > 0) {
            const payout = await window.wallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('blackjackResult', `${result} | Won: ${payout.toFixed(2)}`, 'win');
        } else {
            this.showGameMessage('blackjackResult', result, 'lose');
        }
    }

    toggleBlackjackButtons(gameActive) {
        document.getElementById('dealBtn').disabled = gameActive;
        document.getElementById('hitBtn').disabled = !gameActive;
        document.getElementById('standBtn').disabled = !gameActive;
    }

    // PLINKO
    setupPlinko() {
        document.getElementById('dropBtn').addEventListener('click', () => {
            this.dropPlinkoBall();
        });
        
        this.createPlinkoBoard();
    }

    createPlinkoBoard() {
        const container = document.getElementById('pegsContainer');
        container.innerHTML = '';
        
        // Create pegs in a pyramid pattern
        for (let row = 0; row < 12; row++) {
            const pegsInRow = row + 3;
            const startX = (350 - (pegsInRow * 25)) / 2;
            
            for (let col = 0; col < pegsInRow; col++) {
                const peg = document.createElement('div');
                peg.className = 'peg';
                peg.style.left = `${startX + (col * 25)}px`;
                peg.style.top = `${row * 25}px`;
                container.appendChild(peg);
            }
        }
    }

    async dropPlinkoBall() {
        const betAmount = parseFloat(document.getElementById('plinkoBet').value);
        const dropBtn = document.getElementById('dropBtn');
        
        if (isNaN(betAmount) || betAmount <= 0) {
            this.showGameMessage('plinkoResult', 'Please enter a valid bet amount', 'error');
            return;
        }

        if (!window.wallet || !await window.wallet.placeBet(betAmount)) {
            return;
        }

        dropBtn.disabled = true;
        this.showGameMessage('plinkoResult', 'Ball dropping...', 'info');

        const ball = document.getElementById('plinkoBall');
        const multipliers = [0.1, 0.5, 1, 2, 5, 2, 1, 0.5, 0.1];
        
        // Animate ball drop
        let position = 4; // Start in middle (0-8 range)
        ball.style.display = 'block';
        ball.style.left = '50%';
        
        // Simulate ball bouncing through pegs
        for (let drop = 0; drop < 12; drop++) {
            // Random bounce left or right
            const bounce = Math.random() < 0.5 ? -1 : 1;
            position += bounce * 0.5;
            
            // Keep within bounds
            position = Math.max(0, Math.min(8, position));
            
            // Animate position
            ball.style.left = `${(position / 8) * 80 + 10}%`;
            ball.style.top = `${40 + (drop * 25)}px`;
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Final position determines multiplier
        const finalSlot = Math.floor(position);
        const multiplier = multipliers[finalSlot];
        
        // Highlight winning slot
        const multiplierElements = document.querySelectorAll('.multiplier');
        multiplierElements.forEach((el, index) => {
            el.style.background = index === finalSlot ? 
                'linear-gradient(45deg, #4ade80, #22c55e)' : 
                index === 4 ? 'linear-gradient(45deg, #f093fb, #f5576c)' :
                [3, 5].includes(index) ? 'linear-gradient(45deg, #4facfe, #00f2fe)' :
                'rgba(255, 255, 255, 0.1)';
        });
        
        if (multiplier >= 1) {
            const payout = await window.wallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('plinkoResult', `${multiplier}x Multiplier! Won: ${payout.toFixed(2)}`, 'win');
        } else {
            const payout = await window.wallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('plinkoResult', `${multiplier}x Multiplier | Won: ${payout.toFixed(2)}`, 'lose');
        }
        
        // Reset ball position
        setTimeout(() => {
            ball.style.top = '0px';
            ball.style.left = '50%';
            multiplierElements.forEach((el, index) => {
                el.style.background = index === 4 ? 
                    'linear-gradient(45deg, #f093fb, #f5576c)' :
                    [3, 5].includes(index) ? 'linear-gradient(45deg, #4facfe, #00f2fe)' :
                    'rgba(255, 255, 255, 0.1)';
            });
            dropBtn.disabled = false;
        }, 2000);
    }

    showGameMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `game-result ${type}`;
        
        // Add animation
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

// Initialize casino when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for wallet to be initialized
    setTimeout(() => {
        const casino = new CosmicCasino();
        window.casino = casino;
    }, 100);
});