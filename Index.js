// Amina Casino Game Mechanics
// Professional-grade gaming engine with enhanced features

class AminaCasinoGames {
    constructor() {
        // Game Configuration
        this.isInitialized = false;
        
        // Enhanced Slot Machine Configuration
        this.slotSymbols = [
            { symbol: '🌟', name: 'Star', value: 10, rarity: 0.05 },
            { symbol: '💫', name: 'Sparkle', value: 8, rarity: 0.08 },
            { symbol: '🌙', name: 'Moon', value: 6, rarity: 0.12 },
            { symbol: '🪐', name: 'Planet', value: 5, rarity: 0.15 },
            { symbol: '🌌', name: 'Galaxy', value: 4, rarity: 0.20 },
            { symbol: '☄️', name: 'Comet', value: 3, rarity: 0.25 },
            { symbol: '🛸', name: 'UFO', value: 2, rarity: 0.15 }
        ];
        
        this.slotState = {
            isSpinning: false,
            autoSpinCount: 0,
            isAutoSpinning: false,
            reels: [[], [], [], [], []],
            paylines: [],
            lastWin: null
        };
        
        // Enhanced Blackjack Configuration
        this.blackjackState = {
            deck: [],
            playerHand: [],
            dealerHand: [],
            gameInProgress: false,
            playerScore: 0,
            dealerScore: 0,
            canDouble: false,
            gameResult: null
        };
        
        // Professional Plinko Configuration
        this.plinkoState = {
            isDropping: false,
            ballPosition: { x: 0, y: 0 },
            pegs: [],
            multipliers: [0.1, 0.5, 1, 2, 3, 10, 3, 2, 1, 0.5, 0.1],
            ballPath: [],
            physics: {
                gravity: 0.5,
                bounce: 0.7,
                friction: 0.98
            }
        };
        
        this.initializeGames();
    }

    async initializeGames() {
        try {
            // Wait for wallet to be ready
            await this.waitForWallet();
            
            // Setup all games
            this.setupSlotMachine();
            this.setupBlackjack();
            this.setupPlinko();
            
            this.isInitialized = true;
            console.log('Amina Casino Games initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize games:', error);
        }
    }

    async waitForWallet() {
        return new Promise((resolve) => {
            const checkWallet = () => {
                if (window.aminaWallet) {
                    resolve();
                } else {
                    setTimeout(checkWallet, 100);
                }
            };
            checkWallet();
        });
    }

    // =================== ENHANCED SLOT MACHINE ===================

    setupSlotMachine() {
        // Initialize reels with symbols
        this.generateReelSymbols();
        
        // Event listeners
        document.getElementById('spinBtn')?.addEventListener('click', () => {
            this.spinSlots();
        });
        
        document.getElementById('autoSpinBtn')?.addEventListener('click', () => {
            this.toggleAutoSpin();
        });
        
        // Generate paylines
        this.generatePaylines();
        
        console.log('Enhanced Slot Machine initialized');
    }

    generateReelSymbols() {
        // Fill each reel with weighted symbols
        for (let reel = 0; reel < 5; reel++) {
            this.slotState.reels[reel] = [];
            
            // Generate 3 visible symbols per reel
            for (let position = 0; position < 3; position++) {
                const symbol = this.getWeightedSymbol();
                this.slotState.reels[reel].push(symbol);
            }
        }
        
        this.updateSlotDisplay();
    }

    getWeightedSymbol() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const symbolData of this.slotSymbols) {
            cumulativeWeight += symbolData.rarity;
            if (random <= cumulativeWeight) {
                return symbolData;
            }
        }
        
        // Fallback to most common symbol
        return this.slotSymbols[this.slotSymbols.length - 1];
    }

    generatePaylines() {
        // Define winning paylines for 5-reel slot
        this.slotState.paylines = [
            [1, 1, 1, 1, 1], // Middle row
            [0, 0, 0, 0, 0], // Top row
            [2, 2, 2, 2, 2], // Bottom row
            [0, 1, 2, 1, 0], // V shape
            [2, 1, 0, 1, 2], // Inverted V
            [0, 0, 1, 2, 2], // Diagonal
            [2, 2, 1, 0, 0], // Inverted diagonal
            [1, 0, 1, 2, 1], // Zigzag
            [1, 2, 1, 0, 1], // Inverted zigzag
        ];
    }

    async spinSlots() {
        if (this.slotState.isSpinning) return;
        
        const betAmount = parseFloat(document.getElementById('slotBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        this.slotState.isSpinning = true;
        this.updateSlotControls(false);
        this.showGameMessage('slotResult', 'Spinning the cosmic reels...', 'info');

        // Enhanced spinning animation
        await this.animateSlotSpin();
        
        // Generate final results
        this.generateReelSymbols();
        
        // Check for wins
        const winResult = this.checkSlotWins();
        
        if (winResult.totalWin > 0) {
            const payout = await window.aminaWallet.payoutWin(betAmount, winResult.totalWin / betAmount);
            this.showGameMessage('slotResult', 
                `${winResult.message} | Won: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
            
            // Highlight winning paylines
            this.highlightWinningPaylines(winResult.winningLines);
        } else {
            this.showGameMessage('slotResult', 'No winning combinations - Try again!', 'lose');
        }

        this.slotState.isSpinning = false;
        this.updateSlotControls(true);
        
        // Continue auto-spin if active
        if (this.slotState.isAutoSpinning && this.slotState.autoSpinCount > 0) {
            this.slotState.autoSpinCount--;
            document.getElementById('autoCount').textContent = this.slotState.autoSpinCount;
            
            if (this.slotState.autoSpinCount > 0) {
                setTimeout(() => this.spinSlots(), 1000);
            } else {
                this.toggleAutoSpin();
            }
        }
    }

    async animateSlotSpin() {
        const spinDuration = 3000; // 3 seconds
        const spinsPerReel = 20;
        
        for (let reel = 0; reel < 5; reel++) {
            const reelElement = document.getElementById(`reel${reel + 1}`);
            if (!reelElement) continue;
            
            // Animate each reel with staggered timing
            setTimeout(() => {
                this.animateReel(reelElement, reel, spinsPerReel);
            }, reel * 200);
        }
        
        // Wait for all reels to finish
        await new Promise(resolve => setTimeout(resolve, spinDuration + 1000));
    }

    animateReel(reelElement, reelIndex, spins) {
        let spinCount = 0;
        
        const spinInterval = setInterval(() => {
            const symbols = reelElement.querySelectorAll('.symbol');
            symbols.forEach(symbolEl => {
                const randomSymbol = this.getWeightedSymbol();
                symbolEl.textContent = randomSymbol.symbol;
                symbolEl.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
            });
            
            spinCount++;
            if (spinCount >= spins) {
                clearInterval(spinInterval);
                // Reset transform
                symbols.forEach(symbolEl => {
                    symbolEl.style.transform = 'scale(1)';
                });
            }
        }, 100);
    }

    checkSlotWins() {
        let totalWin = 0;
        let winningLines = [];
        let messages = [];
        
        // Check each payline
        this.slotState.paylines.forEach((payline, lineIndex) => {
            const lineSymbols = payline.map((row, reel) => 
                this.slotState.reels[reel][row]
            );
            
            const winData = this.evaluatePayline(lineSymbols);
            if (winData.win > 0) {
                totalWin += winData.win;
                winningLines.push(lineIndex);
                messages.push(winData.message);
            }
        });
        
        return {
            totalWin,
            winningLines,
            message: messages.join(' | ') || 'No wins'
        };
    }

    evaluatePayline(symbols) {
        // Count consecutive matching symbols from left
        let matchCount = 1;
        const firstSymbol = symbols[0];
        
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i].symbol === firstSymbol.symbol) {
                matchCount++;
            } else {
                break;
            }
        }
        
        // Calculate win based on symbol value and match count
        if (matchCount >= 3) {
            const baseWin = firstSymbol.value;
            const multiplier = Math.pow(2, matchCount - 3); // 3=1x, 4=2x, 5=4x
            const win = baseWin * multiplier;
            
            return {
                win,
                message: `${matchCount}x ${firstSymbol.name} (${win}x)`
            };
        }
        
        return { win: 0, message: '' };
    }

    updateSlotDisplay() {
        for (let reel = 0; reel < 5; reel++) {
            const reelElement = document.getElementById(`reel${reel + 1}`);
            if (!reelElement) continue;
            
            const symbols = reelElement.querySelectorAll('.symbol');
            symbols.forEach((symbolEl, index) => {
                if (this.slotState.reels[reel][index]) {
                    symbolEl.textContent = this.slotState.reels[reel][index].symbol;
                }
            });
        }
    }

    highlightWinningPaylines(winningLines) {
        // Visual highlight for winning combinations
        winningLines.forEach(lineIndex => {
            const payline = this.slotState.paylines[lineIndex];
            payline.forEach((row, reel) => {
                const reelElement = document.getElementById(`reel${reel + 1}`);
                if (reelElement) {
                    const symbolEl = reelElement.querySelectorAll('.symbol')[row];
                    if (symbolEl) {
                        symbolEl.style.animation = 'winHighlight 2s ease-in-out';
                        setTimeout(() => {
                            symbolEl.style.animation = '';
                        }, 2000);
                    }
                }
            });
        });
    }

    toggleAutoSpin() {
        if (!this.slotState.isAutoSpinning) {
            const count = parseInt(prompt('Enter number of auto spins (1-100):') || '10');
            if (count > 0 && count <= 100) {
                this.slotState.autoSpinCount = count;
                this.slotState.isAutoSpinning = true;
                document.getElementById('autoSpinBtn').textContent = 'STOP';
                document.getElementById('autoCount').textContent = count;
                this.spinSlots();
            }
        } else {
            this.slotState.isAutoSpinning = false;
            this.slotState.autoSpinCount = 0;
            document.getElementById('autoSpinBtn').textContent = 'AUTO';
            document.getElementById('autoCount').textContent = '0';
        }
    }

    updateSlotControls(enabled) {
        document.getElementById('spinBtn').disabled = !enabled;
        document.getElementById('autoSpinBtn').disabled = !enabled || this.slotState.isAutoSpinning;
    }

    // =================== ENHANCED BLACKJACK ===================

    setupBlackjack() {
        // Event listeners
        document.getElementById('dealBtn')?.addEventListener('click', () => {
            this.dealBlackjack();
        });
        
        document.getElementById('hitBtn')?.addEventListener('click', () => {
            this.hitBlackjack();
        });
        
        document.getElementById('standBtn')?.addEventListener('click', () => {
            this.standBlackjack();
        });
        
        document.getElementById('doubleBtn')?.addEventListener('click', () => {
            this.doubleBlackjack();
        });
        
        this.createDeck();
        console.log('Enhanced Blackjack initialized');
    }

    createDeck() {
        const suits = [
            { symbol: '♠️', name: 'Spades', color: '#000' },
            { symbol: '♥️', name: 'Hearts', color: '#ff0000' },
            { symbol: '♦️', name: 'Diamonds', color: '#ff0000' },
            { symbol: '♣️', name: 'Clubs', color: '#000' }
        ];
        
        const values = [
            { symbol: 'A', name: 'Ace', value: 11 },
            { symbol: '2', name: 'Two', value: 2 },
            { symbol: '3', name: 'Three', value: 3 },
            { symbol: '4', name: 'Four', value: 4 },
            { symbol: '5', name: 'Five', value: 5 },
            { symbol: '6', name: 'Six', value: 6 },
            { symbol: '7', name: 'Seven', value: 7 },
            { symbol: '8', name: 'Eight', value: 8 },
            { symbol: '9', name: 'Nine', value: 9 },
            { symbol: '10', name: 'Ten', value: 10 },
            { symbol: 'J', name: 'Jack', value: 10 },
            { symbol: 'Q', name: 'Queen', value: 10 },
            { symbol: 'K', name: 'King', value: 10 }
        ];
        
        this.blackjackState.deck = [];
        
        // Create multiple decks for better gameplay
        for (let deckCount = 0; deckCount < 6; deckCount++) {
            suits.forEach(suit => {
                values.forEach(value => {
                    this.blackjackState.deck.push({
                        suit: suit.symbol,
                        suitName: suit.name,
                        suitColor: suit.color,
                        value: value.symbol,
                        valueName: value.name,
                        numericValue: value.value,
                        id: `${value.symbol}${suit.symbol}_${deckCount}`
                    });
                });
            });
        }
        
        this.shuffleDeck();
    }

    shuffleDeck() {
        // Enhanced Fisher-Yates shuffle
        for (let i = this.blackjackState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blackjackState.deck[i], this.blackjackState.deck[j]] = 
            [this.blackjackState.deck[j], this.blackjackState.deck[i]];
        }
    }

    async dealBlackjack() {
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        // Reset game state
        this.blackjackState.playerHand = [];
        this.blackjackState.dealerHand = [];
        this.blackjackState.gameInProgress = true;
        this.blackjackState.canDouble = true;
        
        // Clear existing cards display
        document.getElementById('playerCards').innerHTML = '';
        document.getElementById('dealerCards').innerHTML = '';
        
        // Update UI immediately
        this.updateBlackjackControls(false);
        this.showGameMessage('blackjackResult', 'Dealing cards...', 'info');
        
        try {
            // Deal initial cards with proper sequence
            await this.dealCard('player', true);
            await this.dealCard('dealer', true);
            await this.dealCard('player', true);
            await this.dealCard('dealer', false); // Dealer's second card face down
            
            // Check for natural blackjack
            const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
            if (playerScore === 21) {
                this.showGameMessage('blackjackResult', 'Blackjack! Checking dealer...', 'info');
                await this.endBlackjackGame();
            } else {
                this.updateBlackjackControls(true);
                this.showGameMessage('blackjackResult', 'Make your move: Hit, Stand, or Double', 'info');
            }
        } catch (error) {
            console.error('Error dealing cards:', error);
            this.showGameMessage('blackjackResult', 'Error dealing cards. Please try again.', 'error');
            this.updateBlackjackControls(false);
        }
    }

    async dealCard(recipient, faceUp = true) {
        if (this.blackjackState.deck.length < 20) {
            this.createDeck();
        }
        
        const card = this.blackjackState.deck.pop();
        if (!card) {
            console.error('No cards available in deck');
            return;
        }
        
        card.faceUp = faceUp;
        
        if (recipient === 'player') {
            this.blackjackState.playerHand.push(card);
        } else if (recipient === 'dealer') {
            this.blackjackState.dealerHand.push(card);
        }
        
        // Add a small delay for card dealing animation
        await new Promise(resolve => setTimeout(resolve, 300));
        this.updateBlackjackDisplay();
    }

    async hitBlackjack() {
        if (!this.blackjackState.gameInProgress) return;
        
        this.blackjackState.canDouble = false;
        await this.dealCard('player');
        
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        if (playerScore >= 21) {
            await this.endBlackjackGame();
        } else {
            this.updateBlackjackControls(true);
        }
    }

    async standBlackjack() {
        if (!this.blackjackState.gameInProgress) return;
        
        // Reveal dealer's hidden card
        this.blackjackState.dealerHand[1].faceUp = true;
        this.updateBlackjackDisplay();
        
        // Dealer draws until 17 or higher
        while (this.calculateBlackjackScore(this.blackjackState.dealerHand) < 17) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.dealCard('dealer');
        }
        
        await this.endBlackjackGame();
    }

    async doubleBlackjack() {
        if (!this.blackjackState.gameInProgress || !this.blackjackState.canDouble) return;
        
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }
        
        // Double the bet display
        document.getElementById('currentBet').textContent = (betAmount * 2).toFixed(2);
        
        // Deal one more card and stand
        await this.dealCard('player');
        await this.standBlackjack();
    }

    calculateBlackjackScore(hand) {
        let score = 0;
        let aces = 0;
        
        hand.forEach(card => {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else {
                score += card.numericValue;
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
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        const dealerScore = this.blackjackState.gameInProgress ? 
            this.calculateBlackjackScore([this.blackjackState.dealerHand[0]]) : 
            this.calculateBlackjackScore(this.blackjackState.dealerHand);

        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('dealerScore').textContent = 
            this.blackjackState.gameInProgress ? '?' : dealerScore;

        this.displayCards('playerCards', this.blackjackState.playerHand);
        this.displayCards('dealerCards', this.blackjackState.dealerHand, this.blackjackState.gameInProgress);
    }

    displayCards(containerId, hand, hideSecond = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            
            if (hideSecond && index === 1 && !card.faceUp) {
                cardEl.innerHTML = '🂠';
                cardEl.style.background = 'linear-gradient(135deg, #4169E1, #1E90FF)';
                cardEl.style.color = 'white';
                cardEl.style.display = 'flex';
                cardEl.style.alignItems = 'center';
                cardEl.style.justifyContent = 'center';
                cardEl.style.fontSize = '1.5rem';
            } else {
                cardEl.innerHTML = `${card.value}${card.suit}`;
                cardEl.style.color = card.suitColor || (['♥️', '♦️'].includes(card.suit) ? '#ef4444' : '#1f2937');
                cardEl.style.background = 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)';
                cardEl.style.display = 'flex';
                cardEl.style.alignItems = 'center';
                cardEl.style.justifyContent = 'center';
                cardEl.style.fontSize = '0.9rem';
                cardEl.style.fontWeight = 'bold';
            }
            
            container.appendChild(cardEl);
        });
    }

    async endBlackjackGame() {
        this.blackjackState.gameInProgress = false;
        this.updateBlackjackControls(false);
        
        // Reveal dealer's hidden card
        this.blackjackState.dealerHand.forEach(card => card.faceUp = true);
        this.updateBlackjackDisplay();
        
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        const dealerScore = this.calculateBlackjackScore(this.blackjackState.dealerHand);
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        const isDoubled = document.getElementById('currentBet').textContent !== betAmount.toFixed(2);
        const actualBet = isDoubled ? betAmount * 2 : betAmount;
        
        let result, multiplier = 0;
        
        if (playerScore > 21) {
            result = 'Player Bust! Dealer Wins';
        } else if (dealerScore > 21) {
            result = 'Dealer Bust! Player Wins';
            multiplier = 2;
        } else if (playerScore === 21 && this.blackjackState.playerHand.length === 2) {
            result = 'BLACKJACK! Player Wins';
            multiplier = 2.5;
        } else if (playerScore > dealerScore) {
            result = 'Player Wins!';
            multiplier = 2;
        } else if (dealerScore > playerScore) {
            result = 'Dealer Wins';
        } else {
            result = 'Push - Tie Game';
            multiplier = 1;
        }
        
        if (multiplier > 0) {
            const payout = await window.aminaWallet.payoutWin(actualBet, multiplier);
            this.showGameMessage('blackjackResult', 
                `${result} | Won: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
        } else {
            this.showGameMessage('blackjackResult', result, 'lose');
        }
        
        // Reset bet display
        document.getElementById('currentBet').textContent = betAmount.toFixed(2);
    }

    updateBlackjackControls(gameActive) {
        document.getElementById('dealBtn').disabled = gameActive;
        document.getElementById('hitBtn').disabled = !gameActive;
        document.getElementById('standBtn').disabled = !gameActive;
        document.getElementById('doubleBtn').disabled = !gameActive || !this.blackjackState.canDouble;
    }

    // =================== PROFESSIONAL PLINKO ===================

    setupPlinko() {
        document.getElementById('dropBtn')?.addEventListener('click', () => {
            this.dropPlinkoBall();
        });
        
        this.createPlinkoBoard();
        console.log('Professional Plinko initialized');
    }

    createPlinkoBoard() {
        const container = document.getElementById('pegsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        this.plinkoState.pegs = [];
        
        // Simplified peg layout for better mobile performance
        const rows = 10;
        const containerWidth = container.parentElement.offsetWidth || 350;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = Math.min(row + 3, 12); // Max 12 pegs per row
            const spacing = containerWidth / (pegsInRow + 1);
            
            for (let col = 0; col < pegsInRow; col++) {
                const x = spacing * (col + 1);
                const y = 60 + (row * 25);
                
                const peg = document.createElement('div');
                peg.className = 'peg';
                peg.style.left = `${x}px`;
                peg.style.top = `${y}px`;
                container.appendChild(peg);
                
                this.plinkoState.pegs.push({ x, y, element: peg });
            }
        }
    }

    async dropPlinkoBall() {
        if (this.plinkoState.isDropping) return;
        
        const betAmount = parseFloat(document.getElementById('plinkoBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        this.plinkoState.isDropping = true;
        document.getElementById('dropBtn').disabled = true;
        this.showGameMessage('plinkoResult', 'Ball dropping through the galaxy...', 'info');

        const ball = document.getElementById('plinkoBall');
        if (!ball) return;
        
        // Enhanced physics simulation
        await this.simulateBallPhysics(ball);
        
        // Determine final slot
        const finalSlot = this.determineFinalSlot();
        const multiplier = this.plinkoState.multipliers[finalSlot];
        
        // Highlight winning slot
        this.highlightMultiplierSlot(finalSlot);
        
        // Calculate and award payout
        if (multiplier >= 1) {
            const payout = await window.aminaWallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('plinkoResult', 
                `${multiplier}x Multiplier! Won: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
        } else {
            const payout = await window.aminaWallet.payoutWin(betAmount, multiplier);
            this.showGameMessage('plinkoResult', 
                `${multiplier}x Multiplier | Won: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'lose'
            );
        }
        
        // Reset after delay
        setTimeout(() => {
            this.resetPlinko();
        }, 3000);
    }

    async simulateBallPhysics(ball) {
        // Simplified, more reliable physics simulation
        let position = 4; // Start in middle (0-10 range for 11 slots)
        ball.style.display = 'block';
        ball.style.left = '50%';
        ball.style.top = '30px';
        
        // Simulate ball bouncing through pegs
        const drops = 14; // Number of peg rows
        for (let drop = 0; drop < drops; drop++) {
            // Random bounce left or right with some bias toward center
            const bounce = Math.random() < 0.5 ? -0.5 : 0.5;
            position += bounce;
            
            // Keep within bounds (0-10 for 11 multiplier slots)
            position = Math.max(0, Math.min(10, position));
            
            // Visual ball movement
            const ballX = (position / 10) * 80 + 10; // Convert to percentage
            const ballY = 30 + (drop * 20); // Move down
            
            ball.style.left = `${ballX}%`;
            ball.style.top = `${ballY}px`;
            
            // Add visual peg hit effect
            const pegRow = Math.floor(drop / 2);
            const pegs = document.querySelectorAll('.peg');
            if (pegs[pegRow]) {
                pegs[pegRow].style.transform = 'scale(1.3)';
                setTimeout(() => {
                    pegs[pegRow].style.transform = 'scale(1)';
                }, 200);
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Store final position
        this.plinkoState.ballPosition = { x: position };
    }

    determineFinalSlot() {
        // Use the position directly from the simplified physics
        const position = this.plinkoState.ballPosition.x;
        return Math.max(0, Math.min(10, Math.floor(position)));
    }

    highlightMultiplierSlot(slotIndex) {
        const multiplierElements = document.querySelectorAll('.multiplier');
        
        multiplierElements.forEach((el, index) => {
            if (index === slotIndex) {
                el.style.transform = 'scale(1.2)';
                el.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
                el.style.animation = 'winMultiplier 2s ease-in-out';
            } else {
                el.style.transform = 'scale(1)';
                el.style.boxShadow = '';
                el.style.animation = '';
            }
        });
    }

    resetPlinko() {
        const ball = document.getElementById('plinkoBall');
        if (ball) {
            ball.style.left = '50%';
            ball.style.top = '50%';
        }
        
        // Reset multiplier highlights
        document.querySelectorAll('.multiplier').forEach(el => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '';
            el.style.animation = '';
        });
        
        this.plinkoState.isDropping = false;
        document.getElementById('dropBtn').disabled = false;
    }

    // =================== UTILITY METHODS ===================

    showGameMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = message;
        element.className = `game-result ${type}`;
        
        // Enhanced animation
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
        
        // Add particle effects for wins
        if (type === 'win') {
            this.createWinParticles(element);
        }
    }

    createWinParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = ['✨', '💫', '⭐', '🌟', '💰'][Math.floor(Math.random() * 5)];
                particle.style.cssText = `
                    position: fixed;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${centerX + (Math.random() - 0.5) * 100}px;
                    top: ${centerY + (Math.random() - 0.5) * 50}px;
                    animation: winParticle 2s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * 50);
        }
    }

    // Get game statistics
    getGameStats() {
        return {
            slot: this.slotState,
            blackjack: this.blackjackState,
            plinko: this.plinkoState
        };
    }
}

// Add win particle animation CSS
const gameStyle = document.createElement('style');
gameStyle.textContent = `
    @keyframes winParticle {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes winHighlight {
        0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
        }
        50% { 
            transform: scale(1.2);
            filter: brightness(1.5) drop-shadow(0 0 20px gold);
        }
    }
    
    @keyframes winMultiplier {
        0%, 100% { 
            transform: scale(1.2);
        }
        50% { 
            transform: scale(1.4);
        }
    }
`;
document.head.appendChild(gameStyle);

// Initialize games when DOM is ready
let aminaCasinoGames;
document.addEventListener('DOMContentLoaded', () => {
    aminaCasinoGames = new AminaCasinoGames();
    window.aminaCasinoGames = aminaCasinoGames;
});