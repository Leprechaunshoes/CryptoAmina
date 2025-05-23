// Amina Casino Luxury Game Mechanics
// Royal-grade gaming engine with enhanced luxury features

class AminaCasinoGames {
    constructor() {
        // Game Configuration
        this.isInitialized = false;
        
        // Enhanced Luxury Slot Machine Configuration
        this.slotSymbols = [
            { symbol: '🌟', name: 'Royal Star', value: 15, rarity: 0.04 },
            { symbol: '💫', name: 'Cosmic Sparkle', value: 12, rarity: 0.06 },
            { symbol: '🌙', name: 'Lunar Crown', value: 10, rarity: 0.08 },
            { symbol: '🪐', name: 'Royal Planet', value: 8, rarity: 0.12 },
            { symbol: '🌌', name: 'Galaxy Jewel', value: 6, rarity: 0.18 },
            { symbol: '☄️', name: 'Golden Comet', value: 4, rarity: 0.22 },
            { symbol: '🛸', name: 'Royal Ship', value: 3, rarity: 0.20 },
            { symbol: '👑', name: 'Imperial Crown', value: 25, rarity: 0.02 }, // New luxury symbol
            { symbol: '💎', name: 'Royal Diamond', value: 20, rarity: 0.03 }  // New luxury symbol
        ];
        
        this.slotState = {
            isSpinning: false,
            autoSpinCount: 0,
            isAutoSpinning: false,
            reels: [[], [], [], [], []],
            paylines: [],
            lastWin: null,
            luxuryMode: true // New luxury feature
        };
        
        // Enhanced Royal Blackjack Configuration
        this.blackjackState = {
            deck: [],
            playerHand: [],
            dealerHand: [],
            gameInProgress: false,
            playerScore: 0,
            dealerScore: 0,
            canDouble: false,
            gameResult: null,
            royalMode: true // New luxury feature
        };
        
        // Professional Luxury Plinko Configuration
        this.plinkoState = {
            isDropping: false,
            ballPosition: { x: 0, y: 0 },
            pegs: [],
            multipliers: [0.1, 0.5, 1, 2, 3, 10, 3, 2, 1, 0.5, 0.1],
            ballPath: [],
            physics: {
                gravity: 0.6,
                bounce: 0.8,
                friction: 0.95
            },
            celestialMode: true // New luxury feature
        };
        
        this.initializeGames();
    }

    async initializeGames() {
        try {
            // Wait for wallet to be ready
            await this.waitForWallet();
            
            // Setup all luxury games
            this.setupLuxurySlotMachine();
            this.setupRoyalBlackjack();
            this.setupCelestialPlinko();
            
            // Initialize luxury effects
            this.initializeLuxuryGameEffects();
            
            this.isInitialized = true;
            console.log('👑 Amina Casino Royal Games initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize royal games:', error);
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

    initializeLuxuryGameEffects() {
        // Add royal sparkle effects to game elements
        this.addSparkleEffects();
        
        // Initialize luxury sound effects (visual feedback)
        this.initializeLuxuryFeedback();
    }

    addSparkleEffects() {
        // Add sparkle effects to reels
        document.querySelectorAll('.reel').forEach(reel => {
            setInterval(() => {
                if (!this.slotState.isSpinning) {
                    this.addReelSparkle(reel);
                }
            }, 3000 + Math.random() * 2000);
        });
    }

    addReelSparkle(reel) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.cssText = `
            position: absolute;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            font-size: 1.2rem;
            pointer-events: none;
            animation: reelSparkle 2s ease-out forwards;
            z-index: 10;
        `;
        
        reel.style.position = 'relative';
        reel.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 2000);
    }

    initializeLuxuryFeedback() {
        // Add luxury visual feedback for interactions
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createLuxuryClickEffect(btn);
            });
        });
    }

    createLuxuryClickEffect(element) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: luxuryClick 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }

    // =================== LUXURY SLOT MACHINE ===================

    setupLuxurySlotMachine() {
        // Initialize reels with luxury symbols
        this.generateLuxuryReelSymbols();
        
        // Event listeners
        document.getElementById('spinBtn')?.addEventListener('click', () => {
            this.spinLuxurySlots();
        });
        
        document.getElementById('autoSpinBtn')?.addEventListener('click', () => {
            this.toggleAutoSpin();
        });
        
        // Generate luxury paylines
        this.generateLuxuryPaylines();
        
        console.log('👑 Imperial Slot Machine initialized');
    }

    generateLuxuryReelSymbols() {
        // Fill each reel with weighted luxury symbols
        for (let reel = 0; reel < 5; reel++) {
            this.slotState.reels[reel] = [];
            
            // Generate 3 visible symbols per reel
            for (let position = 0; position < 3; position++) {
                const symbol = this.getWeightedLuxurySymbol();
                this.slotState.reels[reel].push(symbol);
            }
        }
        
        this.updateLuxurySlotDisplay();
    }

    getWeightedLuxurySymbol() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const symbolData of this.slotSymbols) {
            cumulativeWeight += symbolData.rarity;
            if (random <= cumulativeWeight) {
                return symbolData;
            }
        }
        
        // Fallback to most common symbol
        return this.slotSymbols[this.slotSymbols.length - 3];
    }

    generateLuxuryPaylines() {
        // Define winning paylines for luxury 5-reel slot
        this.slotState.paylines = [
            [1, 1, 1, 1, 1], // Middle row - Royal Line
            [0, 0, 0, 0, 0], // Top row - Crown Line
            [2, 2, 2, 2, 2], // Bottom row - Foundation Line
            [0, 1, 2, 1, 0], // V shape - Victory Line
            [2, 1, 0, 1, 2], // Inverted V - Diamond Line
            [0, 0, 1, 2, 2], // Diagonal - Ascending Line
            [2, 2, 1, 0, 0], // Inverted diagonal - Descending Line
            [1, 0, 1, 2, 1], // Zigzag - Lightning Line
            [1, 2, 1, 0, 1], // Inverted zigzag - Thunder Line
            [0, 1, 1, 1, 0], // Crown shape - Imperial Line
            [2, 1, 1, 1, 2], // Inverted crown - Royal Line
        ];
    }

    async spinLuxurySlots() {
        if (this.slotState.isSpinning) return;
        
        const betAmount = parseFloat(document.getElementById('slotBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        this.slotState.isSpinning = true;
        this.updateSlotControls(false);
        this.showLuxuryGameMessage('slotResult', '👑 Spinning the royal reels of fortune...', 'info');

        // Enhanced luxury spinning animation
        await this.animateLuxurySlotSpin();
        
        // Generate final results
        this.generateLuxuryReelSymbols();
        
        // Check for wins
        const winResult = this.checkLuxurySlotWins();
        
        if (winResult.totalWin > 0) {
            const payout = await window.aminaWallet.payoutWin(betAmount, winResult.totalWin / betAmount);
            this.showLuxuryGameMessage('slotResult', 
                `👑 ${winResult.message} | Royal Win: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
            
            // Highlight winning paylines with luxury effect
            this.highlightLuxuryWinningPaylines(winResult.winningLines);
            
            // Royal celebration for big wins
            if (winResult.totalWin >= betAmount * 5) {
                this.triggerRoyalSlotCelebration();
            }
        } else {
            this.showLuxuryGameMessage('slotResult', '👑 The stars align differently - Try your royal luck again!', 'lose');
        }

        this.slotState.isSpinning = false;
        this.updateSlotControls(true);
        
        // Continue auto-spin if active
        if (this.slotState.isAutoSpinning && this.slotState.autoSpinCount > 0) {
            this.slotState.autoSpinCount--;
            document.getElementById('autoCount').textContent = this.slotState.autoSpinCount;
            
            if (this.slotState.autoSpinCount > 0) {
                setTimeout(() => this.spinLuxurySlots(), 1500);
            } else {
                this.toggleAutoSpin();
            }
        }
    }

    async animateLuxurySlotSpin() {
        const spinDuration = 3500; // Longer for luxury experience
        const spinsPerReel = 25;
        
        for (let reel = 0; reel < 5; reel++) {
            const reelElement = document.getElementById(`reel${reel + 1}`);
            if (!reelElement) continue;
            
            // Animate each reel with staggered luxury timing
            setTimeout(() => {
                this.animateLuxuryReel(reelElement, reel, spinsPerReel);
            }, reel * 250);
        }
        
        // Wait for all reels to finish
        await new Promise(resolve => setTimeout(resolve, spinDuration + 1200));
    }

    animateLuxuryReel(reelElement, reelIndex, spins) {
        let spinCount = 0;
        
        const spinInterval = setInterval(() => {
            const symbols = reelElement.querySelectorAll('.symbol');
            symbols.forEach(symbolEl => {
                const randomSymbol = this.getWeightedLuxurySymbol();
                symbolEl.textContent = randomSymbol.symbol;
                symbolEl.style.transform = `scale(${0.9 + Math.random() * 0.3})`;
                symbolEl.style.filter = `hue-rotate(${Math.random() * 60}deg)`;
            });
            
            spinCount++;
            if (spinCount >= spins) {
                clearInterval(spinInterval);
                // Reset transform and filter
                symbols.forEach(symbolEl => {
                    symbolEl.style.transform = 'scale(1)';
                    symbolEl.style.filter = 'none';
                });
            }
        }, 80);
    }

    checkLuxurySlotWins() {
        let totalWin = 0;
        let winningLines = [];
        let messages = [];
        
        // Check each luxury payline
        this.slotState.paylines.forEach((payline, lineIndex) => {
            const lineSymbols = payline.map((row, reel) => 
                this.slotState.reels[reel][row]
            );
            
            const winData = this.evaluateLuxuryPayline(lineSymbols);
            if (winData.win > 0) {
                totalWin += winData.win;
                winningLines.push(lineIndex);
                messages.push(winData.message);
            }
        });
        
        return {
            totalWin,
            winningLines,
            message: messages.join(' | ') || 'No royal wins'
        };
    }

    evaluateLuxuryPayline(symbols) {
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
            
            // Special luxury bonus for rare symbols
            let bonusMultiplier = 1;
            if (firstSymbol.symbol === '👑') bonusMultiplier = 2;
            if (firstSymbol.symbol === '💎') bonusMultiplier = 1.5;
            
            return {
                win: win * bonusMultiplier,
                message: `${matchCount}x ${firstSymbol.name} (${(win * bonusMultiplier).toFixed(1)}x)`
            };
        }
        
        return { win: 0, message: '' };
    }

    updateLuxurySlotDisplay() {
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

    highlightLuxuryWinningPaylines(winningLines) {
        // Enhanced visual highlight for winning combinations
        winningLines.forEach(lineIndex => {
            const payline = this.slotState.paylines[lineIndex];
            payline.forEach((row, reel) => {
                const reelElement = document.getElementById(`reel${reel + 1}`);
                if (reelElement) {
                    const symbolEl = reelElement.querySelectorAll('.symbol')[row];
                    if (symbolEl) {
                        symbolEl.style.animation = 'luxuryWinHighlight 3s ease-in-out';
                        symbolEl.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                        setTimeout(() => {
                            symbolEl.style.animation = '';
                            symbolEl.style.filter = '';
                        }, 3000);
                    }
                }
            });
        });
    }

    triggerRoyalSlotCelebration() {
        // Create royal celebration for big slot wins
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createSlotCelebrationParticle();
            }, i * 100);
        }
    }

    createSlotCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['👑', '💎', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: slotCelebration 3s ease-out forwards;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }

    toggleAutoSpin() {
        if (!this.slotState.isAutoSpinning) {
            const count = parseInt(prompt('👑 Enter number of royal auto spins (1-100):') || '10');
            if (count > 0 && count <= 100) {
                this.slotState.autoSpinCount = count;
                this.slotState.isAutoSpinning = true;
                document.getElementById('autoSpinBtn').textContent = 'STOP';
                document.getElementById('autoCount').textContent = count;
                this.spinLuxurySlots();
            }
        } else {
            this.slotState.isAutoSpinning = false;
            this.slotState.autoSpinCount = 0;
            document.getElementById('autoSpinBtn').textContent = 'AUTO';
            document.getElementById('autoCount').textContent = '0';
        }
    }

    updateSlotControls(enabled) {
        const spinBtn = document.getElementById('spinBtn');
        const autoBtn = document.getElementById('autoSpinBtn');
        
        if (spinBtn) spinBtn.disabled = !enabled;
        if (autoBtn) autoBtn.disabled = !enabled || this.slotState.isAutoSpinning;
    }

    // =================== ROYAL BLACKJACK ===================

    setupRoyalBlackjack() {
        // Event listeners
        document.getElementById('dealBtn')?.addEventListener('click', () => {
            this.dealRoyalBlackjack();
        });
        
        document.getElementById('hitBtn')?.addEventListener('click', () => {
            this.hitRoyalBlackjack();
        });
        
        document.getElementById('standBtn')?.addEventListener('click', () => {
            this.standRoyalBlackjack();
        });
        
        document.getElementById('doubleBtn')?.addEventListener('click', () => {
            this.doubleRoyalBlackjack();
        });
        
        this.createRoyalDeck();
        console.log('👑 Royal Blackjack initialized');
    }

    createRoyalDeck() {
        const suits = [
            { symbol: '♠️', name: 'Spades', color: '#2d1b69' },
            { symbol: '♥️', name: 'Hearts', color: '#dc2626' },
            { symbol: '♦️', name: 'Diamonds', color: '#dc2626' },
            { symbol: '♣️', name: 'Clubs', color: '#2d1b69' }
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
        
        // Create multiple luxury decks for better gameplay
        for (let deckCount = 0; deckCount < 8; deckCount++) {
            suits.forEach(suit => {
                values.forEach(value => {
                    this.blackjackState.deck.push({
                        suit: suit.symbol,
                        suitName: suit.name,
                        suitColor: suit.color,
                        value: value.symbol,
                        valueName: value.name,
                        numericValue: value.value,
                        id: `${value.symbol}${suit.symbol}_${deckCount}`,
                        isRoyal: ['J', 'Q', 'K'].includes(value.symbol) // Royal cards
                    });
                });
            });
        }
        
        this.shuffleRoyalDeck();
    }

    shuffleRoyalDeck() {
        // Enhanced Fisher-Yates shuffle for royal deck
        for (let i = this.blackjackState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blackjackState.deck[i], this.blackjackState.deck[j]] = 
            [this.blackjackState.deck[j], this.blackjackState.deck[i]];
        }
    }

    async dealRoyalBlackjack() {
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        // Reset game state
        this.blackjackState.playerHand = [];
        this.blackjackState.dealerHand = [];
        this.blackjackState.gameInProgress = true;
        this.blackjackState.canDouble = true;
        
        // Clear existing cards display immediately
        const playerCards = document.getElementById('playerCards');
        const dealerCards = document.getElementById('dealerCards');
        if (playerCards) playerCards.innerHTML = '';
        if (dealerCards) dealerCards.innerHTML = '';
        
        // Update UI immediately
        this.updateBlackjackControls(false);
        this.showLuxuryGameMessage('blackjackResult', '👑 Dealing royal cards from the cosmic deck...', 'info');
        
        try {
            // Deal initial cards with proper sequence and delays
            await this.dealRoyalCard('player', true);
            await this.dealRoyalCard('dealer', true);
            await this.dealRoyalCard('player', true);
            await this.dealRoyalCard('dealer', false); // Dealer's second card face down
            
            // Final display update
            this.updateRoyalBlackjackDisplay();
            
            // Check for natural blackjack
            const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
            if (playerScore === 21) {
                this.showLuxuryGameMessage('blackjackResult', '👑 Royal Blackjack! Checking dealer...', 'info');
                setTimeout(() => this.endRoyalBlackjackGame(), 1500);
            } else {
                this.updateBlackjackControls(true);
                this.showLuxuryGameMessage('blackjackResult', '👑 Make your royal move: Hit, Stand, or Double', 'info');
            }
        } catch (error) {
            console.error('Error dealing royal cards:', error);
            this.showLuxuryGameMessage('blackjackResult', '👑 Error dealing cards. Please try again.', 'error');
            this.updateBlackjackControls(false);
        }
    }

    async dealRoyalCard(recipient, faceUp = true) {
        if (this.blackjackState.deck.length < 20) {
            this.createRoyalDeck();
        }
        
        const card = this.blackjackState.deck.pop();
        if (!card) {
            console.error('No royal cards available in deck');
            return;
        }
        
        card.faceUp = faceUp;
        
        if (recipient === 'player') {
            this.blackjackState.playerHand.push(card);
        } else if (recipient === 'dealer') {
            this.blackjackState.dealerHand.push(card);
        }
        
        // Add card dealing animation delay
        await new Promise(resolve => setTimeout(resolve, 600));
        this.updateRoyalBlackjackDisplay();
    }

    async hitRoyalBlackjack() {
        if (!this.blackjackState.gameInProgress) return;
        
        this.blackjackState.canDouble = false;
        await this.dealRoyalCard('player');
        
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        if (playerScore >= 21) {
            setTimeout(() => this.endRoyalBlackjackGame(), 1000);
        } else {
            this.updateBlackjackControls(true);
        }
    }

    async standRoyalBlackjack() {
        if (!this.blackjackState.gameInProgress) return;
        
        // Reveal dealer's hidden card
        if (this.blackjackState.dealerHand.length > 1) {
            this.blackjackState.dealerHand[1].faceUp = true;
        }
        this.updateRoyalBlackjackDisplay();
        
        // Dealer draws until 17 or higher
        while (this.calculateBlackjackScore(this.blackjackState.dealerHand) < 17) {
            await new Promise(resolve => setTimeout(resolve, 1200));
            await this.dealRoyalCard('dealer');
        }
        
        setTimeout(() => this.endRoyalBlackjackGame(), 1000);
    }

    async doubleRoyalBlackjack() {
        if (!this.blackjackState.gameInProgress || !this.blackjackState.canDouble) return;
        
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }
        
        // Double the bet display
        const currentBetEl = document.getElementById('currentBet');
        if (currentBetEl) {
            currentBetEl.textContent = (betAmount * 2).toFixed(2);
        }
        
        // Deal one more card and stand
        await this.dealRoyalCard('player');
        await this.standRoyalBlackjack();
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

    updateRoyalBlackjackDisplay() {
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        const dealerScore = this.blackjackState.gameInProgress ? 
            this.calculateBlackjackScore([this.blackjackState.dealerHand[0]]) : 
            this.calculateBlackjackScore(this.blackjackState.dealerHand);

        const playerScoreEl = document.getElementById('playerScore');
        const dealerScoreEl = document.getElementById('dealerScore');
        
        if (playerScoreEl) playerScoreEl.textContent = playerScore;
        if (dealerScoreEl) {
            dealerScoreEl.textContent = this.blackjackState.gameInProgress ? '?' : dealerScore;
        }

        this.displayRoyalCards('playerCards', this.blackjackState.playerHand);
        this.displayRoyalCards('dealerCards', this.blackjackState.dealerHand, this.blackjackState.gameInProgress);
    }

    displayRoyalCards(containerId, hand, hideSecond = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Don't clear existing cards, just add new ones
        const existingCards = container.children.length;
        
        hand.forEach((card, index) => {
            // Skip if card already displayed
            if (index < existingCards) return;
            
            const cardEl = document.createElement('div');
            cardEl.className = 'card royal-card';
            
            if (hideSecond && index === 1 && !card.faceUp) {
                cardEl.innerHTML = '🂠';
                cardEl.style.background = 'linear-gradient(135deg, #9370db, #8a2be2, #4b0082)';
                cardEl.style.color = '#ffd700';
                cardEl.style.display = 'flex';
                cardEl.style.alignItems = 'center';
                cardEl.style.justifyContent = 'center';
                cardEl.style.fontSize = '1.8rem';
                cardEl.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
            } else {
                cardEl.innerHTML = `${card.value}${card.suit}`;
                cardEl.style.color = card.suitColor;
                cardEl.style.background = 'linear-gradient(135deg, #fff 0%, #f8f8f8 100%)';
                cardEl.style.display = 'flex';
                cardEl.style.alignItems = 'center';
                cardEl.style.justifyContent = 'center';
                cardEl.style.fontSize = '1rem';
                cardEl.style.fontWeight = 'bold';
                
                // Add royal glow for royal cards
                if (card.isRoyal) {
                    cardEl.style.boxShadow += ', 0 0 15px rgba(255, 215, 0, 0.5)';
                }
            }
            
            container.appendChild(cardEl);
        });
    }

    async endRoyalBlackjackGame() {
        this.blackjackState.gameInProgress = false;
        this.updateBlackjackControls(false);
        
        // Reveal dealer's hidden cards
        this.blackjackState.dealerHand.forEach(card => card.faceUp = true);
        this.updateRoyalBlackjackDisplay();
        
        const playerScore = this.calculateBlackjackScore(this.blackjackState.playerHand);
        const dealerScore = this.calculateBlackjackScore(this.blackjackState.dealerHand);
        const betAmount = parseFloat(document.getElementById('blackjackBet')?.value || 0.25);
        const currentBetEl = document.getElementById('currentBet');
        const isDoubled = currentBetEl && currentBetEl.textContent !== betAmount.toFixed(2);
        const actualBet = isDoubled ? betAmount * 2 : betAmount;
        
        let result, multiplier = 0;
        
        if (playerScore > 21) {
            result = '👑 Player Bust! Dealer Claims Victory';
        } else if (dealerScore > 21) {
            result = '👑 Dealer Bust! Royal Victory to Player';
            multiplier = 2;
        } else if (playerScore === 21 && this.blackjackState.playerHand.length === 2) {
            result = '👑 ROYAL BLACKJACK! Magnificent Victory';
            multiplier = 2.5;
        } else if (playerScore > dealerScore) {
            result = '👑 Player Achieves Royal Victory!';
            multiplier = 2;
        } else if (dealerScore > playerScore) {
            result = '👑 Dealer Claims the Royal Crown';
        } else {
            result = '👑 Royal Tie - A Noble Draw';
            multiplier = 1;
        }
        
        if (multiplier > 0) {
            const payout = await window.aminaWallet.payoutWin(actualBet, multiplier);
            this.showLuxuryGameMessage('blackjackResult', 
                `${result} | Royal Payout: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
            
            if (multiplier >= 2.5) {
                this.triggerRoyalBlackjackCelebration();
            }
        } else {
            this.showLuxuryGameMessage('blackjackResult', result, 'lose');
        }
        
        // Reset bet display
        if (currentBetEl) {
            currentBetEl.textContent = betAmount.toFixed(2);
        }
    }

    triggerRoyalBlackjackCelebration() {
        // Create royal celebration for blackjack
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBlackjackCelebrationParticle();
            }, i * 150);
        }
    }

    createBlackjackCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['👑', '🃏', '♠️', '♥️', '♦️', '♣️'][Math.floor(Math.random() * 6)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2.2rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: blackjackCelebration 3.5s ease-out forwards;
            filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1));
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3500);
    }

    updateBlackjackControls(gameActive) {
        const dealBtn = document.getElementById('dealBtn');
        const hitBtn = document.getElementById('hitBtn');
        const standBtn = document.getElementById('standBtn');
        const doubleBtn = document.getElementById('doubleBtn');
        
        if (dealBtn) dealBtn.disabled = gameActive;
        if (hitBtn) hitBtn.disabled = !gameActive;
        if (standBtn) standBtn.disabled = !gameActive;
        if (doubleBtn) doubleBtn.disabled = !gameActive || !this.blackjackState.canDouble;
    }

    // =================== CELESTIAL PLINKO ===================

    setupCelestialPlinko() {
        document.getElementById('dropBtn')?.addEventListener('click', () => {
            this.dropCelestialBall();
        });
        
        this.createCelestialPlinkoBoard();
        console.log('👑 Celestial Plinko initialized');
    }

    createCelestialPlinkoBoard() {
        const container = document.getElementById('pegsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        this.plinkoState.pegs = [];
        
        // Create luxury peg layout
        const rows = 12;
        const containerWidth = container.parentElement.offsetWidth || 400;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = Math.min(row + 3, 14); // Max 14 pegs per row
            const spacing = containerWidth / (pegsInRow + 1);
            
            for (let col = 0; col < pegsInRow; col++) {
                const x = spacing * (col + 1);
                const y = 70 + (row * 28);
                
                const peg = document.createElement('div');
                peg.className = 'peg celestial-peg';
                peg.style.left = `${x}px`;
                peg.style.top = `${y}px`;
                container.appendChild(peg);
                
                this.plinkoState.pegs.push({ x, y, element: peg });
                
                // Add sparkle effect to random pegs
                if (Math.random() < 0.1) {
                    setTimeout(() => this.addPegSparkle(peg), Math.random() * 5000);
                }
            }
        }
    }

    addPegSparkle(peg) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.cssText = `
            position: absolute;
            top: -15px;
            left: -10px;
            font-size: 1rem;
            pointer-events: none;
            animation: pegSparkle 1.5s ease-out forwards;
            z-index: 10;
        `;
        
        peg.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }

    async dropCelestialBall() {
        if (this.plinkoState.isDropping) return;
        
        const betAmount = parseFloat(document.getElementById('plinkoBet')?.value || 0.25);
        
        if (!await window.aminaWallet.placeBet(betAmount)) {
            return;
        }

        this.plinkoState.isDropping = true;
        document.getElementById('dropBtn').disabled = true;
        this.showLuxuryGameMessage('plinkoResult', '👑 The celestial orb descends through the cosmic realm...', 'info');

        const ball = document.getElementById('plinkoBall');
        if (!ball) return;
        
        // Enhanced celestial physics simulation
        await this.simulateCelestialBallPhysics(ball);
        
        // Determine final slot
        const finalSlot = this.determineFinalSlot();
        const multiplier = this.plinkoState.multipliers[finalSlot];
        
        // Highlight winning slot with luxury effect
        this.highlightCelestialMultiplierSlot(finalSlot);
        
        // Calculate and award payout
        if (multiplier >= 1) {
            const payout = await window.aminaWallet.payoutWin(betAmount, multiplier);
            this.showLuxuryGameMessage('plinkoResult', 
                `👑 ${multiplier}x Celestial Multiplier! Royal Payout: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'win'
            );
            
            if (multiplier >= 5) {
                this.triggerCelestialCelebration();
            }
        } else {
            const payout = await window.aminaWallet.payoutWin(betAmount, multiplier);
            this.showLuxuryGameMessage('plinkoResult', 
                `👑 ${multiplier}x Multiplier | Consolation: ${payout.toFixed(2)} ${window.aminaWallet.getCurrency()}`, 
                'lose'
            );
        }
        
        // Reset after delay
        setTimeout(() => {
            this.resetCelestialPlinko();
        }, 4000);
    }

    async simulateCelestialBallPhysics(ball) {
        // Enhanced celestial physics simulation
        let position = 5; // Start in middle (0-10 range for 11 slots)
        ball.style.display = 'block';
        ball.style.left = '50%';
        ball.style.top = '30px';
        
        // Add glow effect to ball
        ball.style.boxShadow = '0 0 30px rgba(255, 215, 0, 1), 0 0 50px rgba(255, 215, 0, 0.8)';
        
        // Simulate celestial ball bouncing through pegs
        const drops = 16; // More drops for luxury experience
        for (let drop = 0; drop < drops; drop++) {
            // Enhanced bounce physics with bias toward center
            const bounceIntensity = 0.6 + (Math.random() * 0.4);
            const bounce = Math.random() < 0.5 ? -bounceIntensity : bounceIntensity;
            position += bounce;
            
            // Keep within bounds (0-10 for 11 multiplier slots)
            position = Math.max(0, Math.min(10, position));
            
            // Visual celestial ball movement
            const ballX = (position / 10) * 85 + 7.5; // Convert to percentage
            const ballY = 30 + (drop * 22); // Move down
            
            ball.style.left = `${ballX}%`;
            ball.style.top = `${ballY}px`;
            
            // Add enhanced peg hit effects
            const affectedPegs = this.plinkoState.pegs.filter(peg => 
                Math.abs(peg.y - ballY) < 30 && Math.abs(peg.x - (ballX * 4)) < 40
            );
            
            affectedPegs.forEach(peg => {
                peg.element.style.transform = 'scale(1.4)';
                peg.element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 1)';
                setTimeout(() => {
                    peg.element.style.transform = 'scale(1)';
                    peg.element.style.boxShadow = '';
                }, 300);
            });
            
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        
        // Store final position
        this.plinkoState.ballPosition = { x: position };
    }

    determineFinalSlot() {
        // Use the position directly from the celestial physics
        const position = this.plinkoState.ballPosition.x;
        return Math.max(0, Math.min(10, Math.floor(position)));
    }

    highlightCelestialMultiplierSlot(slotIndex) {
        const multiplierElements = document.querySelectorAll('.multiplier');
        
        multiplierElements.forEach((el, index) => {
            if (index === slotIndex) {
                el.style.transform = 'scale(1.3)';
                el.style.boxShadow = '0 0 40px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.8)';
                el.style.animation = 'celestialMultiplier 3s ease-in-out';
            } else {
                el.style.transform = 'scale(1)';
                el.style.boxShadow = '';
                el.style.animation = '';
            }
        });
    }

    triggerCelestialCelebration() {
        // Create celestial celebration for big plinko wins
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createCelestialCelebrationParticle();
            }, i * 100);
        }
    }

    createCelestialCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['👑', '💎', '✨', '🌟', '⭐', '💫', '🎯'][Math.floor(Math.random() * 7)];
        particle.style.cssText = `
            position: fixed;
            font-size: 2.3rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: celestialCelebration 4s ease-out forwards;
            filter: drop-shadow(0 0 18px rgba(255, 215, 0, 1));
        `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 4000);
    }

    resetCelestialPlinko() {
        const ball = document.getElementById('plinkoBall');
        if (ball) {
            ball.style.left = '50%';
            ball.style.top = '50%';
            ball.style.boxShadow = '';
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

    // =================== LUXURY UTILITY METHODS ===================

    showLuxuryGameMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = message;
        element.className = `game-result luxury-result ${type}`;
        
        // Enhanced luxury animation
        element.style.transform = 'scale(1.08)';
        element.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 400);
        
        // Add luxury particle effects for wins
        if (type === 'win') {
            this.createLuxuryWinParticles(element);
        }
    }

    createLuxuryWinParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = ['✨', '💫', '⭐', '🌟', '💰', '👑', '💎'][Math.floor(Math.random() * 7)];
                particle.style.cssText = `
                    position: fixed;
                    font-size: 1.8rem;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${centerX + (Math.random() - 0.5) * 120}px;
                    top: ${centerY + (Math.random() - 0.5) * 60}px;
                    animation: luxuryWinParticle 2.5s ease-out forwards;
                    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1));
                `;
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2500);
            }, i * 60);
        }
    }

    // Get luxury game statistics
    getLuxuryGameStats() {
        return {
            slot: this.slotState,
            blackjack: this.blackjackState,
            plinko: this.plinkoState,
            luxuryLevel: 'Imperial'
        };
    }
}

// Add luxury game animation CSS
const luxuryGameStyle = document.createElement('style');
luxuryGameStyle.textContent = `
    @keyframes luxuryWinParticle {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-120px) rotate(360deg) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes luxuryWinHighlight {
        0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
        }
        50% { 
            transform: scale(1.3);
            filter: brightness(1.8) drop-shadow(0 0 25px gold);
        }
    }
    
    @keyframes celestialMultiplier {
        0%, 100% { 
            transform: scale(1.3);
        }
        50% { 
            transform: scale(1.5);
        }
    }
    
    @keyframes slotCelebration {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-40vh) rotate(180deg) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translateY(-80vh) rotate(360deg) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes blackjackCelebration {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        25% {
            transform: translateY(-20vh) rotate(90deg) scale(1.1);
            opacity: 1;
        }
        75% {
            transform: translateY(-60vh) rotate(270deg) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translateY(-80vh) rotate(360deg) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes celestialCelebration {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        33% {
            transform: translateY(-30vh) rotate(120deg) scale(1.3);
            opacity: 1;
        }
        66% {
            transform: translateY(-60vh) rotate(240deg) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translateY(-90vh) rotate(360deg) scale(0.7);
            opacity: 0;
        }
    }
    
    @keyframes luxuryClick {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
    
    @keyframes reelSparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes pegSparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .royal-card {
        transition: all 0.3s ease;
    }
    
    .royal-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4) !important;
    }
    
    .celestial-peg {
        transition: all 0.2s ease;
    }
    
    .luxury-result {
        font-family: 'Cinzel', serif !important;
        letter-spacing: 1px;
    }
`;
document.head.appendChild(luxuryGameStyle);

// Initialize luxury games when DOM is ready
let aminaCasinoGames;
document.addEventListener('DOMContentLoaded', () => {
    aminaCasinoGames = new AminaCasinoGames();
    window.aminaCasinoGames = aminaCasinoGames;
});