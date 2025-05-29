// AMINA CASINO - CLEAN & FUNCTIONAL GAMING ENGINE
class AminaCasino {
    constructor() {
        // BALANCE SYSTEM - Single source of truth
        this.balance = { HC: 1000, AMINA: 475 };
        this.currentCurrency = 'HC';
        this.connectedWallet = null;
        this.aminaAssetId = 1107424865;
        this.casinoWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        
        // GAME STATES
        this.games = {
            slots: { symbols: ['⭐','🌟','💫','🌌','🪐','🌙','☄️'], grid: [], spinning: false, win: 0 },
            plinko: { balls: [], maxBalls: 5 },
            blackjack: { playerHand: [], dealerHand: [], deck: [], active: false, bet: 0 },
            hilo: { currentCard: null, streak: 0, bet: 0, potentialWin: 0, active: false },
            dice: { selectedBet: null, bet: 0 }
        };
        
        // MUSIC
        this.music = { playing: false, audio: null };
        
        this.init();
    }

    // INITIALIZATION
    init() {
        this.setupUI();
        this.setupGames();
        this.setupMusic();
        this.createParticles();
        this.updateDisplay();
        console.log('🚀 Amina Casino initialized!');
    }

    setupUI() {
        // Welcome screen
        document.getElementById('enterCasino').onclick = () => this.enterCasino();
        
        // Wallet connection
        document.getElementById('walletBtn').onclick = () => this.toggleWallet();
        
        // Currency toggle
        document.getElementById('currencyToggle').onclick = () => this.toggleCurrency();
        
        // Cosmic orb menu
        this.setupCosmicOrb();
        
        // Game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.onclick = () => this.switchGame(card.dataset.game);
        });
    }

    setupCosmicOrb() {
        const orb = document.getElementById('cosmicOrb');
        const menu = document.getElementById('orbitalMenu');
        let menuOpen = false;

        orb.onclick = () => {
            menuOpen = !menuOpen;
            menu.classList.toggle('open', menuOpen);
            orb.style.transform = menuOpen ? 'scale(0.9)' : 'scale(1)';
        };

        document.querySelectorAll('.orbital-item').forEach(item => {
            item.onclick = () => {
                this.switchGame(item.dataset.game);
                menuOpen = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            };
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cosmic-orb-menu') && menuOpen) {
                menuOpen = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            }
        });
    }

    enterCasino() {
        document.getElementById('welcomeScreen').classList.remove('active');
        document.getElementById('mainCasino').classList.add('active');
    }

    toggleWallet() {
        if (this.connectedWallet) {
            // Disconnect
            this.connectedWallet = null;
            this.balance.AMINA = 0;
            if (this.currentCurrency === 'AMINA') this.toggleCurrency();
            this.updateWalletUI();
            this.showResult('Wallet disconnected');
        } else {
            // Connect
            const address = prompt('Enter your Algorand wallet address:');
            if (address && address.length === 58) {
                this.connectedWallet = address;
                this.balance.AMINA = 475; // Set your actual balance
                this.updateWalletUI();
                this.showResult('Wallet connected! 🚀');
            } else if (address) {
                this.showResult('Invalid wallet address');
            }
        }
    }

    updateWalletUI() {
        const btn = document.getElementById('walletBtn');
        if (this.connectedWallet) {
            const short = this.connectedWallet.slice(0,4) + '...' + this.connectedWallet.slice(-4);
            btn.innerHTML = '🔓 ' + short;
        } else {
            btn.innerHTML = '🔗 Connect Wallet';
        }
    }

    toggleCurrency() {
        if (this.currentCurrency === 'HC' && !this.connectedWallet) {
            this.showResult('🔗 Connect wallet for AMINA!');
            return;
        }
        
        this.currentCurrency = this.currentCurrency === 'HC' ? 'AMINA' : 'HC';
        
        const toggle = document.getElementById('currencyToggle');
        const text = document.querySelector('.currency-text');
        
        if (this.currentCurrency === 'AMINA') {
            toggle.classList.add('amina');
            text.textContent = 'AMINA';
        } else {
            toggle.classList.remove('amina');
            text.textContent = 'HC';
        }
        
        this.updateBetOptions();
        this.updateDisplay();
    }

    updateBetOptions() {
        const hcBets = ['1', '5', '10'];
        const aminaBets = ['0.05', '0.1', '0.2'];
        const bets = this.currentCurrency === 'HC' ? hcBets : aminaBets;
        
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(game => {
            const select = document.getElementById(`${game}Bet`);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '';
                bets.forEach(bet => {
                    const option = document.createElement('option');
                    option.value = option.textContent = bet;
                    select.appendChild(option);
                });
                if (bets.includes(currentValue)) select.value = currentValue;
            }
        });
    }

    updateDisplay() {
        const balance = this.balance[this.currentCurrency];
        document.getElementById('balanceAmount').textContent = balance.toFixed(4);
        document.getElementById('currencySymbol').textContent = this.currentCurrency;
        
        // Update currency symbols in games
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(game => {
            const el = document.getElementById(`${game}Currency`);
            if (el) el.textContent = this.currentCurrency;
        });
    }

    deductBalance(amount) {
        if (this.balance[this.currentCurrency] < amount) {
            this.showResult('Insufficient balance!');
            return false;
        }
        this.balance[this.currentCurrency] -= amount;
        this.updateDisplay();
        return true;
    }

    addBalance(amount) {
        // Apply 5% house rake for AMINA wins
        if (this.currentCurrency === 'AMINA') {
            amount *= 0.95; // 5% rake
        }
        this.balance[this.currentCurrency] += amount;
        this.updateDisplay();
    }

    switchGame(gameId) {
        document.querySelectorAll('.game-screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(gameId).classList.add('active');
        
        // Initialize specific games
        if (gameId === 'slots') this.initSlots();
        if (gameId === 'plinko') this.initPlinko();
        if (gameId === 'blackjack') this.initBlackjack();
        if (gameId === 'hilo') this.initHilo();
        if (gameId === 'dice') this.initDice();
    }

    showResult(message, type = 'info', gameId = null) {
        if (gameId) {
            const resultEl = document.getElementById(`${gameId}Result`);
            if (resultEl) {
                resultEl.textContent = message;
                resultEl.className = `game-result show ${type}`;
                setTimeout(() => resultEl.classList.remove('show'), 4000);
            }
        } else {
            // Global notification
            const div = document.createElement('div');
            div.textContent = message;
            div.style.cssText = `position:fixed;top:20px;right:20px;z-index:1001;background:#FFD700;color:#000;padding:1rem 2rem;border-radius:15px;font-family:JetBrains Mono,monospace;font-weight:700;animation:slideIn 0.3s ease`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
    }

    // === COSMIC CHAOS SLOTS ===
    initSlots() {
        this.games.slots.grid = Array(5).fill().map(() => Array(6).fill(''));
        this.games.slots.win = 0;
        this.games.slots.spinning = false;
        
        this.createSlotsGrid();
        this.fillSlotsRandomly();
        this.updateSlotsDisplay();
        
        document.getElementById('spinBtn').onclick = () => this.spinSlots();
    }

    createSlotsGrid() {
        const grid = document.getElementById('slotsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        for (let i = 0; i < 30; i++) { // 5x6 = 30 symbols
            const symbol = document.createElement('div');
            symbol.className = 'slot-symbol';
            symbol.id = `slot-${i}`;
            grid.appendChild(symbol);
        }
    }

    fillSlotsRandomly() {
        const symbols = this.games.slots.symbols;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                this.games.slots.grid[row][col] = symbols[Math.floor(Math.random() * symbols.length)];
            }
        }
    }

    updateSlotsDisplay() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                const index = row * 6 + col;
                const symbol = document.getElementById(`slot-${index}`);
                if (symbol) {
                    symbol.textContent = this.games.slots.grid[row][col];
                }
            }
        }
        
        document.getElementById('slotsWin').textContent = this.games.slots.win.toFixed(2);
        document.getElementById('slotsWinCurrency').textContent = this.currentCurrency;
    }

    async spinSlots() {
        if (this.games.slots.spinning) return;
        
        const bet = parseFloat(document.getElementById('slotsBet').value);
        if (!this.deductBalance(bet)) return;
        
        this.games.slots.spinning = true;
        this.games.slots.win = 0;
        
        // Spinning animation
        document.querySelectorAll('.slot-symbol').forEach(symbol => {
            symbol.classList.add('spinning');
        });
        
        // Animate for 2 seconds (fixed the slow spinning!)
        await new Promise(resolve => {
            let spins = 0;
            const spinInterval = setInterval(() => {
                this.fillSlotsRandomly();
                this.updateSlotsDisplay();
                spins++;
                if (spins >= 20) { // 20 spins in 2 seconds = fast!
                    clearInterval(spinInterval);
                    resolve();
                }
            }, 100);
        });
        
        // Stop spinning
        document.querySelectorAll('.slot-symbol').forEach(symbol => {
            symbol.classList.remove('spinning');
        });
        
        // Calculate wins
        const clusters = this.findSlotClusters();
        let totalWin = 0;
        
        clusters.forEach(cluster => {
            let multiplier = 1;
            if (cluster.size >= 15) multiplier = 50;
            else if (cluster.size >= 10) multiplier = 10;
            else if (cluster.size >= 7) multiplier = 5;
            else if (cluster.size >= 5) multiplier = 2;
            
            totalWin += bet * multiplier;
            
            // Highlight winning symbols
            cluster.positions.forEach(({row, col}) => {
                const index = row * 6 + col;
                const symbol = document.getElementById(`slot-${index}`);
                if (symbol) symbol.classList.add('winning');
            });
        });
        
        // Check for bonus (rare now!)
        const bonusChance = Math.random();
        if (bonusChance < 0.02) { // 2% chance instead of crazy high
            totalWin += bet * (10 + Math.floor(Math.random() * 90)); // 10x to 100x bonus
            this.showResult('🌠 BONUS HIT! Cosmic multiplier!', 'win', 'slots');
        }
        
        this.games.slots.win = totalWin;
        
        if (totalWin > 0) {
            this.addBalance(totalWin);
            const winType = totalWin >= bet * 20 ? 'MEGA WIN' : totalWin >= bet * 5 ? 'BIG WIN' : 'WIN';
            this.showResult(`${winType}! +${totalWin.toFixed(2)} ${this.currentCurrency}`, 'win', 'slots');
        } else {
            this.showResult('No clusters! Try again! ⭐', 'lose', 'slots');
        }
        
        this.updateSlotsDisplay();
        this.games.slots.spinning = false;
        
        // Clear winning highlights
        setTimeout(() => {
            document.querySelectorAll('.slot-symbol').forEach(symbol => {
                symbol.classList.remove('winning');
            });
        }, 2000);
    }

    findSlotClusters() {
        const visited = Array(5).fill().map(() => Array(6).fill(false));
        const clusters = [];
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if (!visited[row][col]) {
                    const cluster = this.findCluster(row, col, this.games.slots.grid[row][col], visited);
                    if (cluster.length >= 5) {
                        clusters.push({
                            symbol: this.games.slots.grid[row][col],
                            positions: cluster,
                            size: cluster.length
                        });
                    }
                }
            }
        }
        
        return clusters;
    }

    findCluster(row, col, symbol, visited) {
        if (row < 0 || row >= 5 || col < 0 || col >= 6 || 
            visited[row][col] || this.games.slots.grid[row][col] !== symbol) {
            return [];
        }
        
        visited[row][col] = true;
        const cluster = [{row, col}];
        
        // Check adjacent cells (including diagonals)
        const directions = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
        directions.forEach(([dr, dc]) => {
            cluster.push(...this.findCluster(row + dr, col + dc, symbol, visited));
        });
        
        return cluster;
    }

    // === QUANTUM PLINKO ===
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        this.games.plinko.balls = [];
        this.setupPegs();
        this.drawPlinkoBoard();
        
        document.getElementById('dropBtn').onclick = () => this.dropBall();
    }

    setupPegs() {
        this.pegs = [];
        const canvas = this.ctx.canvas;
        const rows = 8;
        
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const spacing = canvas.width * 0.8 / (pegsInRow + 1);
            const startX = (canvas.width - canvas.width * 0.8) / 2;
            
            for (let i = 0; i < pegsInRow; i++) {
                this.pegs.push({
                    x: startX + spacing * (i + 1),
                    y: 40 + row * 25,
                    radius: 3
                });
            }
        }
    }

    drawPlinkoBoard() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw pegs
        this.pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#4a5568';
            ctx.fill();
        });
        
        // Draw balls
        this.games.plinko.balls.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
        });
    }

    async dropBall() {
        const bet = parseFloat(document.getElementById('plinkoBet').value);
        if (!this.deductBalance(bet)) return;
        
        if (this.games.plinko.balls.length >= this.games.plinko.maxBalls) {
            this.showResult(`Max ${this.games.plinko.maxBalls} balls!`, 'info', 'plinko');
            return;
        }
        
        const ball = {
            x: this.ctx.canvas.width / 2,
            y: 10,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            radius: 4,
            gravity: 0.2,
            bounce: 0.7,
            bet: bet,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        
        this.games.plinko.balls.push(ball);
        this.animatePlinko();
    }

    animatePlinko() {
        const animate = () => {
            this.games.plinko.balls.forEach((ball, index) => {
                // Physics
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
                        ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.radius);
                        ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.radius);
                        ball.vx += (Math.random() - 0.5) * 1.5;
                        ball.vy = Math.abs(ball.vy) * ball.bounce;
                    }
                });
                
                // Wall collisions
                if (ball.x < ball.radius || ball.x > this.ctx.canvas.width - ball.radius) {
                    ball.vx *= -0.5;
                    ball.x = ball.x < ball.radius ? ball.radius : this.ctx.canvas.width - ball.radius;
                }
                
                // Bottom collision
                if (ball.y > this.ctx.canvas.height - 20) {
                    const slot = Math.floor(ball.x / (this.ctx.canvas.width / 11));
                    const multipliers = [10, 3, 1.5, 1.2, 1, 0.5, 1, 1.2, 1.5, 3, 10];
                    const multiplier = multipliers[Math.max(0, Math.min(10, slot))];
                    const winAmount = ball.bet * multiplier;
                    
                    this.addBalance(winAmount);
                    this.showResult(`Ball hit ${multiplier}x! Won ${winAmount.toFixed(2)} ${this.currentCurrency}`, 'win', 'plinko');
                    
                    // Highlight multiplier
                    document.querySelectorAll('.multiplier').forEach((mult, i) => {
                        if (i === slot) {
                            mult.classList.add('hit');
                            setTimeout(() => mult.classList.remove('hit'), 1000);
                        }
                    });
                    
                    this.games.plinko.balls.splice(index, 1);
                }
            });
            
            this.drawPlinkoBoard();
            
            if (this.games.plinko.balls.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // === GALAXY BLACKJACK ===
    initBlackjack() {
        this.games.blackjack = { playerHand: [], dealerHand: [], deck: [], active: false, bet: 0 };
        this.createDeck();
        this.shuffleDeck();
        this.resetBlackjackUI();
        
        document.getElementById('dealBtn').onclick = () => this.dealBlackjack();
        document.getElementById('hitBtn').onclick = () => this.hitBlackjack();
        document.getElementById('standBtn').onclick = () => this.standBlackjack();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.games.blackjack.deck = [];
        
        suits.forEach(suit => {
            values.forEach(value => {
                this.games.blackjack.deck.push({ suit, value });
            });
        });
    }

    shuffleDeck() {
        const deck = this.games.blackjack.deck;
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    resetBlackjackUI() {
        document.getElementById('playerCards').innerHTML = '';
        document.getElementById('dealerCards').innerHTML = '';
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('dealerScore').textContent = '0';
        document.getElementById('dealBtn').disabled = false;
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
    }

    dealBlackjack() {
        const bet = parseFloat(document.getElementById('blackjackBet').value);
        if (!this.deductBalance(bet)) return;
        
        this.games.blackjack.bet = bet;
        this.games.blackjack.playerHand = [this.games.blackjack.deck.pop(), this.games.blackjack.deck.pop()];
        this.games.blackjack.dealerHand = [this.games.blackjack.deck.pop(), this.games.blackjack.deck.pop()];
        this.games.blackjack.active = true;
        
        this.updateBlackjackDisplay();
        
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('hitBtn').disabled = false;
        document.getElementById('standBtn').disabled = false;
        
        // Check for blackjack
        if (this.getHandValue(this.games.blackjack.playerHand) === 21) {
            this.standBlackjack();
        }
    }

    hitBlackjack() {
        if (!this.games.blackjack.active) return;
        
        this.games.blackjack.playerHand.push(this.games.blackjack.deck.pop());
        this.updateBlackjackDisplay();
        
        const playerValue = this.getHandValue(this.games.blackjack.playerHand);
        if (playerValue > 21) {
            this.endBlackjack('💥 Bust! Dealer wins', 0);
        } else if (playerValue === 21) {
            this.standBlackjack();
        }
    }

    standBlackjack() {
        if (!this.games.blackjack.active) return;
        
        // Dealer draws
        while (this.getHandValue(this.games.blackjack.dealerHand) < 17) {
            this.games.blackjack.dealerHand.push(this.games.blackjack.deck.pop());
        }
        
        this.updateBlackjackDisplay(true);
        
        const playerValue = this.getHandValue(this.games.blackjack.playerHand);
        const dealerValue = this.getHandValue(this.games.blackjack.dealerHand);
        
        if (dealerValue > 21) {
            this.endBlackjack('🎉 Dealer busts! You win!', this.games.blackjack.bet * 2);
        } else if (playerValue > dealerValue) {
            this.endBlackjack('🎉 You win!', this.games.blackjack.bet * 2);
        } else if (playerValue < dealerValue) {
            this.endBlackjack('😔 Dealer wins', 0);
        } else {
            this.endBlackjack('🤝 Push! Bet returned', this.games.blackjack.bet);
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

    updateBlackjackDisplay(showDealerHidden = false) {
        this.displayHand('player', this.games.blackjack.playerHand);
        this.displayHand('dealer', this.games.blackjack.dealerHand, showDealerHidden);
        
        document.getElementById('playerScore').textContent = this.getHandValue(this.games.blackjack.playerHand);
        
        if (showDealerHidden || !this.games.blackjack.active) {
            document.getElementById('dealerScore').textContent = this.getHandValue(this.games.blackjack.dealerHand);
        } else {
            document.getElementById('dealerScore').textContent = this.getHandValue([this.games.blackjack.dealerHand[0]]);
        }
    }

    displayHand(player, hand, showAll = true) {
        const container = document.getElementById(`${player}Cards`);
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'playing-card';
            
            if (player === 'dealer' && index === 1 && !showAll) {
                cardEl.classList.add('back');
                cardEl.textContent = '🚀';
            } else {
                cardEl.innerHTML = `${card.value}<br>${card.suit}`;
                if (['♥', '♦'].includes(card.suit)) cardEl.classList.add('red');
            }
            
            container.appendChild(cardEl);
        });
    }

    endBlackjack(message, winAmount) {
        this.games.blackjack.active = false;
        
        if (winAmount > 0) {
            this.addBalance(winAmount);
        }
        
        this.showResult(message, winAmount > 0 ? 'win' : 'lose', 'blackjack');
        
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        
        setTimeout(() => {
            this.resetBlackjackUI();
            this.createDeck();
            this.shuffleDeck();
        }, 3000);
    }

    // === COSMIC HI-LO ===
    initHilo() {
        this.games.hilo = { currentCard: null, streak: 0, bet: 0, potentialWin: 0, active: false };
        this.resetHiloUI();
        
        document.getElementById('startHiloBtn').onclick = () => this.startHiloGame();
        document.getElementById('higherBtn').onclick = () => this.guessHilo('higher');
        document.getElementById('lowerBtn').onclick = () => this.guessHilo('lower');
        document.getElementById('cashoutBtn').onclick = () => this.cashoutHilo();
    }

    resetHiloUI() {
        document.getElementById('currentCard').innerHTML = '<div class="playing-card">?</div>';
        document.getElementById('startHiloBtn').style.display = 'block';
        document.getElementById('higherBtn').disabled = true;
        document.getElementById('lowerBtn').disabled = true;
        document.getElementById('cashoutBtn').disabled = true;
        document.getElementById('streakCount').textContent = '0';
        document.getElementById('potentialWin').textContent = '0';
        document.getElementById('potentialCurrency').textContent = this.currentCurrency;
    }

    startHiloGame() {
        const bet = parseFloat(document.getElementById('hiloBet').value);
        if (!this.deductBalance(bet)) return;
        
        this.games.hilo.bet = bet;
        this.games.hilo.streak = 0;
        this.games.hilo.potentialWin = bet;
        this.games.hilo.active = true;
        this.games.hilo.currentCard = this.getRandomCard();
        
        this.displayCard('currentCard', this.games.hilo.currentCard);
        
        document.getElementById('startHiloBtn').style.display = 'none';
        document.getElementById('higherBtn').disabled = false;
        document.getElementById('lowerBtn').disabled = false;
        document.getElementById('cashoutBtn').disabled = false;
        
        this.updateHiloDisplay();
    }

    guessHilo(guess) {
        if (!this.games.hilo.active) return;
        
        const nextCard = this.getRandomCard();
        const currentValue = this.getCardNumericValue(this.games.hilo.currentCard);
        const nextValue = this.getCardNumericValue(nextCard);
        
        let correct = false;
        if (guess === 'higher' && nextValue > currentValue) correct = true;
        if (guess === 'lower' && nextValue < currentValue) correct = true;
        
        if (correct) {
            this.games.hilo.streak++;
            this.games.hilo.potentialWin *= 2;
            this.games.hilo.currentCard = nextCard;
            
            this.displayCard('currentCard', nextCard);
            this.updateHiloDisplay();
            
            this.showResult(`🎉 Correct! Streak: ${this.games.hilo.streak}`, 'win', 'hilo');
        } else {
            this.showResult(`❌ Wrong! Game over. Final streak: ${this.games.hilo.streak}`, 'lose', 'hilo');
            this.endHiloGame(0);
        }
    }

    cashoutHilo() {
        if (!this.games.hilo.active) return;
        
        this.addBalance(this.games.hilo.potentialWin);
        this.showResult(`💰 Cashed out! Won ${this.games.hilo.potentialWin.toFixed(2)} ${this.currentCurrency}`, 'win', 'hilo');
        this.endHiloGame(this.games.hilo.potentialWin);
    }

    endHiloGame(winAmount) {
        this.games.hilo.active = false;
        setTimeout(() => this.resetHiloUI(), 3000);
    }

    updateHiloDisplay() {
        document.getElementById('streakCount').textContent = this.games.hilo.streak;
        document.getElementById('potentialWin').textContent = this.games.hilo.potentialWin.toFixed(2);
        document.getElementById('potentialCurrency').textContent = this.currentCurrency;
    }

    getRandomCard() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            value: values[Math.floor(Math.random() * values.length)]
        };
    }

    getCardNumericValue(card) {
        if (card.value === 'A') return 1;
        if (['J', 'Q', 'K'].includes(card.value)) return [11, 12, 13][['J', 'Q', 'K'].indexOf(card.value)];
        return parseInt(card.value);
    }

    displayCard(containerId, card) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        const cardEl = document.createElement('div');
        cardEl.className = 'playing-card';
        cardEl.innerHTML = `${card.value}<br>${card.suit}`;
        
        if (['♥', '♦'].includes(card.suit)) cardEl.classList.add('red');
        
        container.appendChild(cardEl);
    }

    // === NEBULA DICE ===
    initDice() {
        this.games.dice = { selectedBet: null, bet: 0 };
        this.resetDiceUI();
        
        document.getElementById('rollBtn').onclick = () => this.rollDice();
        document.querySelectorAll('.bet-option').forEach(btn => {
            btn.onclick = () => this.selectDiceBet(btn.dataset.bet);
        });
    }

    resetDiceUI() {
        document.getElementById('dice1').textContent = '⚀';
        document.getElementById('dice2').textContent = '⚀';
        document.getElementById('diceTotal').textContent = '2';
        document.getElementById('selectedBet').textContent = 'None';
        document.getElementById('rollBtn').disabled = true;
        document.querySelectorAll('.bet-option').forEach(btn => btn.classList.remove('selected'));
    }

    selectDiceBet(betType) {
        this.games.dice.selectedBet = betType;
        document.querySelectorAll('.bet-option').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-bet="${betType}"]`).classList.add('selected');
        document.getElementById('selectedBet').textContent = betType.toUpperCase();
        document.getElementById('rollBtn').disabled = false;
    }

    async rollDice() {
        if (!this.games.dice.selectedBet) return;
        
        const bet = parseFloat(document.getElementById('diceBet').value);
        if (!this.deductBalance(bet)) return;
        
        // Rolling animation
        document.getElementById('dice1').classList.add('rolling');
        document.getElementById('dice2').classList.add('rolling');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        
        const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        document.getElementById('dice1').textContent = diceSymbols[dice1 - 1];
        document.getElementById('dice2').textContent = diceSymbols[dice2 - 1];
        document.getElementById('diceTotal').textContent = total;
        
        document.getElementById('dice1').classList.remove('rolling');
        document.getElementById('dice2').classList.remove('rolling');
        
        // Check win
        let win = false;
        let multiplier = 1;
        
        if (this.games.dice.selectedBet === 'low' && total >= 2 && total <= 6) { win = true; multiplier = 2; }
        if (this.games.dice.selectedBet === 'high' && total >= 8 && total <= 12) { win = true; multiplier = 2; }
        if (this.games.dice.selectedBet === 'seven' && total === 7) { win = true; multiplier = 5; }
        
        if (win) {
            const winAmount = bet * multiplier;
            this.addBalance(winAmount);
            this.showResult(`🎲 WIN! Rolled ${total} - Won ${winAmount.toFixed(2)} ${this.currentCurrency}`, 'win', 'dice');
        } else {
            this.showResult(`🎲 Rolled ${total} - No win this time!`, 'lose', 'dice');
        }
        
        setTimeout(() => this.resetDiceUI(), 3000);
    }

    // === MUSIC SYSTEM ===
    setupMusic() {
        const musicBtn = document.getElementById('musicToggle');
        
        // Create audio element
        this.music.audio = document.createElement('audio');
        this.music.audio.loop = true;
        this.music.audio.volume = 0.3;
        this.music.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuLz/bNfSkHK43Q8N2VQgsUYbjl7qhcGgRFot/iuV4fBTiPzffcHjZQp+z8FGxgzZGJR8dQ';
        
        musicBtn.onclick = () => {
            if (this.music.playing) {
                this.music.audio.pause();
                musicBtn.innerHTML = '🔇';
                this.music.playing = false;
            } else {
                this.music.audio.play().catch(() => {});
                musicBtn.innerHTML = '🎵';
                this.music.playing = true;
            }
        };
    }

    // === PARTICLE EFFECTS ===
    createParticles() {
        setInterval(() => {
            if (Math.random() < 0.3) { // Less frequent for performance
                this.createFloatingElement();
            }
        }, 3000);
    }

    createFloatingElement() {
        const element = document.createElement('div');
        const symbols = ['✨', '⭐', '🌟', '💫'];
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        element.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 10 + 15}px;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}%;
            top: 100vh;
            opacity: ${Math.random() * 0.6 + 0.2};
            animation: floatUp ${Math.random() * 4 + 6}s linear forwards;
        `;
        
        document.body.appendChild(element);
        setTimeout(() => element.remove(), 10000);
    }

    setupGames() {
        // All game setup is handled in their respective init functions
        console.log('🎮 All games ready!');
    }
}

// UTILITY FUNCTIONS
function openAminaExplorer() {
    window.open('https://explorer.perawallet.app/asset/1107424865/', '_blank');
}

function showDonationModal() {
    document.getElementById('donationModal').style.display = 'flex';
}

function closeDonationModal() {
    document.getElementById('donationModal').style.display = 'none';
}

function copyDonationAddress() {
    const input = document.getElementById('donationWallet');
    input.select();
    document.execCommand('copy');
    alert('Address copied! 🚀');
}

// Add floating animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { transform: translateY(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh); opacity: 0; }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// INITIALIZE CASINO
let casino;
document.addEventListener('DOMContentLoaded', () => {
    casino = new AminaCasino();
    console.log('🚀 Amina Casino is LIVE!');
});

// Make casino globally accessible
window.casino = casino;