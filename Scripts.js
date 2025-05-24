// Amina Casino - Core Game Scripts
console.log('🎮 Amina Casino Scripts Loading...');

// Game State Management
const gameState = {
    balance: 1000,
    currency: 'HC', // HC or AMINA
    currentGame: 'home',
    isPlaying: false
};

// Currency conversion rates
const CURRENCY_RATES = {
    HC_TO_AMINA: 0.001, // 1000 HC = 1 AMINA
    AMINA_TO_HC: 1000
};

// Cosmic symbols for slots
const COSMIC_SYMBOLS = ['🌟', '🪐', '🌌', '☄️', '🚀', '💫', '🛸'];

// Initialize Casino
document.addEventListener('DOMContentLoaded', function() {
    initializeCasino();
    setupEventListeners();
    console.log('🌟 Casino initialized successfully!');
});

function initializeCasino() {
    updateBalanceDisplay();
    initializeSlots();
    initializePlinko();
    initializeBlackjack();
    
    // Replace placeholder images with actual coin image when available
    const coinImages = document.querySelectorAll('.coin-image, .welcome-coin, .donation-coin-image');
    coinImages.forEach(img => {
        // When you upload your coin image, replace this URL
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDgiIGZpbGw9InVybCgjZ3JhZGllbnQwKSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0iIzRBOUZGRiIvPjx0ZXh0IHg9IjUwIiB5PSI1OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkE1MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=';
    });
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!e.target.classList.contains('donation-btn')) {
                switchGame(e.target.dataset.game);
            }
        });
    });
    
    // Game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
            switchGame(e.currentTarget.dataset.game);
        });
    });
    
    // Currency toggle
    document.getElementById('currencyToggle').addEventListener('click', toggleCurrency);
    
    // Game controls
    setupGameControls();
}

function switchGame(gameId) {
    if (gameState.isPlaying) {
        alert('🎮 Finish your current game first!');
        return;
    }
    
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(gameId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-game="${gameId}"]`).classList.add('active');
    
    gameState.currentGame = gameId;
    console.log(`🎯 Switched to ${gameId}`);
}

function toggleCurrency() {
    const toggle = document.getElementById('currencyToggle');
    const currencyText = toggle.querySelector('.currency-text');
    
    if (gameState.currency === 'HC') {
        gameState.currency = 'AMINA';
        gameState.balance = gameState.balance * CURRENCY_RATES.HC_TO_AMINA;
        toggle.classList.add('amina');
        currencyText.textContent = 'AMINA';
    } else {
        gameState.currency = 'HC';
        gameState.balance = gameState.balance * CURRENCY_RATES.AMINA_TO_HC;
        toggle.classList.remove('amina');
        currencyText.textContent = 'HC';
    }
    
    updateBalanceDisplay();
    updateAllBetDisplays();
    console.log(`💱 Currency switched to ${gameState.currency}`);
}

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balanceAmount');
    const currencyEl = document.getElementById('currencySymbol');
    
    const decimals = gameState.currency === 'AMINA' ? 6 : 2;
    balanceEl.textContent = gameState.balance.toFixed(decimals);
    currencyEl.textContent = gameState.currency;
}

function updateAllBetDisplays() {
    ['slots', 'plinko', 'blackjack'].forEach(game => {
        const currencySpan = document.getElementById(`${game}Currency`);
        if (currencySpan) {
            currencySpan.textContent = gameState.currency;
        }
    });
}

function addBalance(amount) {
    gameState.balance += amount;
    updateBalanceDisplay();
    
    // Play win sound if available
    if (window.playCosmicSound) {
        window.playCosmicSound(amount > (gameState.currency === 'AMINA' ? 0.01 : 10) ? 'bigWin' : 'win');
    }
}

function deductBalance(amount) {
    if (gameState.balance >= amount) {
        gameState.balance -= amount;
        updateBalanceDisplay();
        return true;
    }
    alert(`💰 Insufficient ${gameState.currency} balance!`);
    return false;
}

// SLOTS GAME
function initializeSlots() {
    const grid = document.getElementById('slotsGrid');
    grid.innerHTML = '';
    
    // Create 5x3 grid
    for (let i = 0; i < 15; i++) {
        const cell = document.createElement('div');
        cell.className = 'slot-cell';
        cell.textContent = COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)];
        grid.appendChild(cell);
    }
}

function setupGameControls() {
    // Slots
    document.getElementById('spinBtn').addEventListener('click', spinSlots);
    
    // Plinko
    document.getElementById('dropBtn').addEventListener('click', dropPlinko);
    
    // Blackjack
    document.getElementById('dealBtn').addEventListener('click', dealBlackjack);
    document.getElementById('hitBtn').addEventListener('click', hitBlackjack);
    document.getElementById('standBtn').addEventListener('click', standBlackjack);
    document.getElementById('newGameBtn').addEventListener('click', newBlackjackGame);
}

function spinSlots() {
    if (gameState.isPlaying) return;
    
    const betAmount = parseFloat(document.getElementById('slotsBet').value);
    if (!deductBalance(betAmount)) return;
    
    gameState.isPlaying = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'SPINNING...';
    
    const cells = document.querySelectorAll('.slot-cell');
    
    // Animate spin
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        cells.forEach(cell => {
            cell.textContent = COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)];
        });
        
        if (++spinCount >= 20) {
            clearInterval(spinInterval);
            checkSlotsWin(betAmount);
            
            spinBtn.disabled = false;
            spinBtn.textContent = 'SPIN THE COSMOS';
            gameState.isPlaying = false;
        }
    }, 100);
}

function checkSlotsWin(betAmount) {
    const cells = document.querySelectorAll('.slot-cell');
    const symbols = Array.from(cells).map(cell => cell.textContent);
    
    // Check for wins (simplified - 3+ in a row)
    const rows = [
        [0, 1, 2, 3, 4], // Top row
        [5, 6, 7, 8, 9], // Middle row
        [10, 11, 12, 13, 14] // Bottom row
    ];
    
    let maxWin = 0;
    let winningCells = [];
    
    rows.forEach(row => {
        const rowSymbols = row.map(i => symbols[i]);
        const matches = getConsecutiveMatches(rowSymbols);
        
        if (matches >= 3) {
            const multiplier = getSlotMultiplier(rowSymbols[0], matches);
            const winAmount = betAmount * multiplier;
            
            if (winAmount > maxWin) {
                maxWin = winAmount;
                winningCells = row.slice(0, matches);
            }
        }
    });
    
    if (maxWin > 0) {
        // Highlight winning cells
        winningCells.forEach(i => {
            cells[i].classList.add('winning');
        });
        
        addBalance(maxWin);
        showMessage(`🎉 COSMIC WIN! +${maxWin.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}`);
        
        setTimeout(() => {
            cells.forEach(cell => cell.classList.remove('winning'));
        }, 3000);
    } else {
        showMessage('💫 No match this time. Try again!');
    }
}

function getConsecutiveMatches(symbols) {
    let count = 1;
    for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] === symbols[0]) count++;
        else break;
    }
    return count;
}

function getSlotMultiplier(symbol, matches) {
    const multipliers = {
        '🌟': [0, 0, 2, 5, 15, 100],
        '🪐': [0, 0, 2, 4, 10, 50],
        '🌌': [0, 0, 1.5, 3, 8, 25],
        '☄️': [0, 0, 1.5, 3, 6, 15],
        '🚀': [0, 0, 1, 2, 5, 10],
        '💫': [0, 0, 1, 2, 4, 8],
        '🛸': [0, 0, 1, 2, 4, 8]
    };
    
    return multipliers[symbol] ? multipliers[symbol][matches] : 0;
}

// PLINKO GAME
function initializePlinko() {
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 500;
    
    // Draw initial board
    drawPlinkoBoard(ctx);
}

function drawPlinkoBoard(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#FFD700';
    
    // Draw pegs
    const rows = 12;
    const startY = 80;
    const rowSpacing = 35;
    
    for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 3;
        const startX = (ctx.canvas.width - (pegsInRow - 1) * 40) / 2;
        
        for (let peg = 0; peg < pegsInRow; peg++) {
            ctx.beginPath();
            ctx.arc(startX + peg * 40, startY + row * rowSpacing, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function dropPlinko() {
    if (gameState.isPlaying) return;
    
    const betAmount = parseFloat(document.getElementById('plinkoBet').value);
    if (!deductBalance(betAmount)) return;
    
    gameState.isPlaying = true;
    const dropBtn = document.getElementById('dropBtn');
    dropBtn.disabled = true;
    dropBtn.textContent = 'DROPPING...';
    
    // Simulate ball drop
    simulatePlinkoball(betAmount);
}

function simulatePlinkoball(betAmount) {
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    
    let ballX = canvas.width / 2;
    let ballY = 50;
    let ballSpeed = 2;
    let bounceDirection = 0;
    
    const animateBall = () => {
        drawPlinkoBoard(ctx);
        
        // Draw ball
        ctx.fillStyle = '#8A2BE2';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Move ball
        ballY += ballSpeed;
        ballX += bounceDirection;
        
        // Random bounce
        if (ballY % 35 < 5 && Math.random() > 0.5) {
            bounceDirection = (Math.random() - 0.5) * 4;
        }
        
        // Keep ball in bounds
        if (ballX < 20) ballX = 20;
        if (ballX > canvas.width - 20) ballX = canvas.width - 20;
        
        if (ballY < canvas.height - 50) {
            requestAnimationFrame(animateBall);
        } else {
            // Ball finished - calculate result
            const slotIndex = Math.floor((ballX / canvas.width) * 9);
            const multipliers = [10, 3, 1.5, 1, 0.5, 1, 1.5, 3, 10];
            const multiplier = multipliers[Math.max(0, Math.min(8, slotIndex))];
            const winAmount = betAmount * multiplier;
            
            addBalance(winAmount);
            showMessage(`🌌 Ball landed in ${multiplier}x slot! +${winAmount.toFixed(gameState.currency === 'AMINA' ? 6 : 2)} ${gameState.currency}`);
            
            // Reset button
            document.getElementById('dropBtn').disabled = false;
            document.getElementById('dropBtn').textContent = 'DROP COSMIC BALL';
            gameState.isPlaying = false;
        }
    };
    
    animateBall();
}

// BLACKJACK GAME
let blackjackState = {
    playerCards: [],
    dealerCards: [],
    deck: [],
    gamePhase: 'betting' // betting, playing, finished
};

function initializeBlackjack() {
    resetBlackjackUI();
}

function createDeck() {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank, value: getCardValue(rank) });
        });
    });
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

function getCardValue(rank) {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(rank)) return 10;
    return parseInt(rank);
}

function calculateHandValue(cards) {
    let value = 0;
    let aces = 0;
    
    cards.forEach(card => {
        if (card.rank === 'A') aces++;
        value += card.value;
    });
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function dealBlackjack() {
    if (gameState.isPlaying) return;
    
    const betAmount = parseFloat(document.getElementById('blackjackBet').value);
    if (!deductBalance(betAmount)) return;
    
    gameState.isPlaying = true;
    blackjackState.currentBet = betAmount;
    blackjackState.deck = createDeck();
    blackjackState.playerCards = [];
    blackjackState.dealerCards = [];
    blackjackState.gamePhase = 'playing';
    
    // Deal initial cards
    blackjackState.playerCards.push(blackjackState.deck.pop());
    blackjackState.dealerCards.push(blackjackState.deck.pop());
    blackjackState.playerCards.push(blackjackState.deck.pop());
    blackjackState.dealerCards.push(blackjackState.deck.pop());
    
    updateBlackjackDisplay();
    updateBlackjackButtons();
    
    // Check for blackjack
    if (calculateHandValue(blackjackState.playerCards) === 21) {
        endBlackjackGame('blackjack');
    }
}

function hitBlackjack() {
    if (!gameState.isPlaying || blackjackState.gamePhase !== 'playing') return;
    
    blackjackState.playerCards.push(blackjackState.deck.pop());
    updateBlackjackDisplay();
    
    const playerValue = calculateHandValue(blackjackState.playerCards);
    if (playerValue > 21) {
        endBlackjackGame('bust');
    } else if (playerValue === 21) {
        standBlackjack();
    }
}

function standBlackjack() {
    if (!gameState.isPlaying || blackjackState.gamePhase !== 'playing') return;
    
    // Dealer plays
    let dealerValue = calculateHandValue(blackjackState.dealerCards);
    
    const dealerPlay = () => {
        if (dealerValue < 17) {
            blackjackState.dealerCards.push(blackjackState.deck.pop());
            dealerValue = calculateHandValue(blackjackState.dealerCards);
            updateBlackjackDisplay();
            
            setTimeout(dealerPlay, 1000);
        } else {
            // Determine winner
            const playerValue = calculateHandValue(blackjackState.playerCards);
            
            if (dealerValue > 21) {
                endBlackjackGame('dealer_bust');
            } else if (playerValue > dealerValue) {
                endBlackjackGame('win');
            } else if (playerValue < dealerValue) {
                endBlackjackGame('lose');
            } else {
                endBlackjackGame('push');
            }
        }
    };
    
    // Show dealer's hole card
    updateBlackjackDisplay(true);
    setTimeout(dealerPlay, 1000);
}

function endBlackjackGame(result) {
    blackjackState.gamePhase = 'finished';
    const betAmount = blackjackState.currentBet;
    let message = '';
    
    switch (result) {
        case 'blackjack':
            addBalance(betAmount * 2.5);
            message = '🃏 BLACKJACK! You win 2.5x!';
            break;
        case 'win':
        case 'dealer_bust':
            addBalance(betAmount * 2);
            message = '🎉 You win!';
            break;
        case 'push':
            addBalance(betAmount);
            message = '🤝 Push - Bet returned!';
            break;
        case 'bust':
        case 'lose':
            message = '😔 Dealer wins!';
            break;
    }
    
    showMessage(message);
    updateBlackjackButtons();
    gameState.isPlaying = false;
}

function newBlackjackGame() {
    resetBlackjackUI();
    blackjackState.gamePhase = 'betting';
}

function updateBlackjackDisplay(showDealerHole = false) {
    // Update player cards
    const playerContainer = document.getElementById('playerCards');
    playerContainer.innerHTML = '';
    blackjackState.playerCards.forEach(card => {
        playerContainer.appendChild(createCardElement(card));
    });
    
    // Update dealer cards
    const dealerContainer = document.getElementById('dealerCards');
    dealerContainer.innerHTML = '';
    blackjackState.dealerCards.forEach((card, index) => {
        if (index === 1 && !showDealerHole && blackjackState.gamePhase === 'playing') {
            dealerContainer.appendChild(createCardElement(null, true)); // Hidden card
        } else {
            dealerContainer.appendChild(createCardElement(card));
        }
    });
    
    // Update scores
    document.getElementById('playerScore').textContent = calculateHandValue(blackjackState.playerCards);
    
    if (showDealerHole || blackjackState.gamePhase === 'finished') {
        document.getElementById('dealerScore').textContent = calculateHandValue(blackjackState.dealerCards);
    } else {
        document.getElementById('dealerScore').textContent = blackjackState.dealerCards[0].value;
    }
}

function createCardElement(card, hidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (hidden) {
        cardEl.classList.add('card-back');
        cardEl.textContent = '🂠';
    } else {
        const isRed = ['♥️', '♦️'].includes(card.suit);
        cardEl.classList.add(isRed ? 'red' : 'black');
        cardEl.innerHTML = `
            <div style="font-size: 0.8rem;">${card.rank}${card.suit}</div>
            <div style="font-size: 1.5rem; text-align: center; flex: 1; display: flex; align-items: center; justify-content: center;">${card.suit}</div>
            <div style="font-size: 0.8rem; transform: rotate(180deg);">${card.rank}${card.suit}</div>
        `;
    }
    
    return cardEl;
}

function updateBlackjackButtons() {
    const dealBtn = document.getElementById('dealBtn');
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    
    if (blackjackState.gamePhase === 'betting') {
        dealBtn.style.display = 'inline-block';
        hitBtn.style.display = 'none';
        standBtn.style.display = 'none';
        newGameBtn.style.display = 'none';
    } else if (blackjackState.gamePhase === 'playing') {
        dealBtn.style.display = 'none';
        hitBtn.style.display = 'inline-block';
        standBtn.style.display = 'inline-block';
        newGameBtn.style.display = 'none';
        hitBtn.disabled = false;
        standBtn.disabled = false;
    } else {
        dealBtn.style.display = 'none';
        hitBtn.style.display = 'none';
        standBtn.style.display = 'none';
        newGameBtn.style.display = 'inline-block';
    }
}

function resetBlackjackUI() {
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('dealerScore').textContent = '0';
    document.getElementById('gameMessage').textContent = '';
    updateBlackjackButtons();
}

// Utility Functions
function showMessage(message) {
    const messageEl = document.getElementById('gameMessage') || createMessageElement();
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 4000);
}

function createMessageElement() {
    const messageEl = document.createElement('div');
    messageEl.id = 'gameMessage';
    messageEl.className = 'game-message';
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #8A2BE2, #4a0e4e);
        color: white;
        padding: 1rem 2rem;
        border-radius: 20px;
        border: 2px solid #FFD700;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
    `;
    document.body.appendChild(messageEl);
    return messageEl;
}

console.log('🚀 Amina Casino Scripts Loaded Successfully!');