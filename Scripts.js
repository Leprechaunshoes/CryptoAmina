// Amina Casino - Game Logic & Mechanics
// Cosmic Galactic Adventure Theme

// Global Game State
let gameState = {
    aminaBalance: 1000,
    algoBalance: 100,
    currentGame: 'slots',
    gameInProgress: false,
    selectedBet: null,
    walletConnected: false,
    
    // Mission Progress
    missions: {
        stellarCollector: { progress: 0, target: 5, completed: false, reward: 500 },
        rouletteMaster: { progress: 0, target: 3, completed: false, reward: 300 },
        blackjackChampion: { progress: 0, target: 3, completed: false, reward: 1000 },
        highRoller: { progress: 0, target: 2000, completed: false, reward: 2000 }
    }
};

// Blackjack Game State
let blackjackState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    dealerHidden: true,
    canDouble: false
};

// Initialize Casino
document.addEventListener('DOMContentLoaded', function() {
    initializeCasino();
    updateAllDisplays();
});

function initializeCasino() {
    console.log('🚀 Amina Casino - Cosmic Adventure Initialized!');
    
    // Load saved progress
    loadGameProgress();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize audio
    initializeAudio();
    
    // Start cosmic effects
    startCosmicEffects();
}

function setupEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Exchange controls
    document.getElementById('exchangeAmount').addEventListener('input', validateExchangeAmount);
}

function initializeAudio() {
    // Create audio context for cosmic sounds
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gameState.audioContext = audioContext;
    } catch (e) {
        console.log('Audio not supported');
    }
}

function startCosmicEffects() {
    // Add cosmic particle effects
    createCosmicParticles();
    
    // Start ambient cosmic sounds (muted by default)
    // playAmbientSound();
}

// ============================================
// WALLET & EXCHANGE FUNCTIONS
// ============================================

function connectWallet() {
    const btn = document.getElementById('connectWallet');
    
    if (!gameState.walletConnected) {
        // Simulate wallet connection (replace with Pera Wallet integration later)
        btn.textContent = '🔄 Connecting...';
        btn.disabled = true;
        
        setTimeout(() => {
            gameState.walletConnected = true;
            btn.textContent = '✅ Wallet Connected';
            btn.classList.add('connected');
            
            // Show conversion panel
            const conversionPanel = document.getElementById('conversionPanel');
            conversionPanel.classList.add('active');
            conversionPanel.style.display = 'block';
            
            showMessage('🚀 Pera Wallet Connected Successfully!', 'win');
        }, 2000);
    }
}

function exchangeCoins() {
    const amount = parseInt(document.getElementById('exchangeAmount').value);
    const exchangeType = document.getElementById('exchangeType').value;
    
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount!', 'lose');
        return;
    }
    
    if (exchangeType === 'algoToAmina') {
        if (amount > gameState.algoBalance) {
            showMessage('Insufficient ALGO balance!', 'lose');
            return;
        }
        
        gameState.algoBalance -= amount;
        gameState.aminaBalance += amount * 10; // 1 ALGO = 10 AMINA
        showMessage(`🔄 Exchanged ${amount} ALGO for ${amount * 10} AMINA!`, 'win');
        
    } else {
        const aminaNeeded = amount * 10;
        if (aminaNeeded > gameState.aminaBalance) {
            showMessage('Insufficient AMINA balance!', 'lose');
            return;
        }
        
        gameState.aminaBalance -= aminaNeeded;
        gameState.algoBalance += amount; // 10 AMINA = 1 ALGO
        showMessage(`🔄 Exchanged ${aminaNeeded} AMINA for ${amount} ALGO!`, 'win');
    }
    
    updateAllDisplays();
    document.getElementById('exchangeAmount').value = '';
}

function validateExchangeAmount() {
    const amount = parseInt(document.getElementById('exchangeAmount').value);
    const exchangeType = document.getElementById('exchangeType').value;
    const btn = document.querySelector('.exchange-btn');
    
    if (exchangeType === 'algoToAmina') {
        btn.disabled = amount > gameState.algoBalance || amount <= 0;
    } else {
        btn.disabled = (amount * 10) > gameState.aminaBalance || amount <= 0;
    }
}

// ============================================
// NAVIGATION & UI FUNCTIONS
// ============================================

function showGame(gameName) {
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected game
    document.getElementById(gameName).classList.add('active');
    document.getElementById(gameName + 'Tab').classList.add('active');
    
    gameState.currentGame = gameName;
    
    // Clear any ongoing game messages
    clearMessages();
    
    // Game-specific initialization
    if (gameName === 'missions') {
        updateMissionDisplay();
    }
}

function updateAllDisplays() {
    document.getElementById('aminaBalance').textContent = gameState.aminaBalance;
    document.getElementById('algoBalance').textContent = gameState.algoBalance;
    updateMissionProgress();
}

function showMessage(message, type = 'info') {
    const resultElements = document.querySelectorAll('.result-message');
    resultElements.forEach(element => {
        element.textContent = message;
        element.className = `result-message result-${type}`;
        
        // Add cosmic glow effect
        element.classList.add('glowing');
        setTimeout(() => {
            element.classList.remove('glowing');
        }, 3000);
    });
    
    // Play notification sound
    playNotificationSound(type);
}

function clearMessages() {
    document.querySelectorAll('.result-message').forEach(element => {
        element.textContent = '';
        element.className = 'result-message';
    });
}

// ============================================
// SLOT MACHINE FUNCTIONS
// ============================================

const COSMIC_SYMBOLS = ['🌟', '🚀', '🌌', '👽', '🛸', '💎', '⭐', '🌠'];

function spinSlots() {
    const betAmount = parseInt(document.getElementById('slotBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA balance! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<span>🌀 SPINNING COSMOS... 🌀</span>';
    
    // Start cosmic spinning animation
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    reels.forEach(reel => {
        reel.classList.add('spinning');
        reel.classList.add('glowing');
    });
    
    // Generate cosmic results
    const results = [
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)],
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)],
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)]
    ];
    
    // Play cosmic spin sound
    playCosmicSpinSound();
    
    // Stop spinning with cosmic delay
    setTimeout(() => {
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning', 'glowing');
                reel.textContent = results[index];
                reel.classList.add('pulsing');
                
                setTimeout(() => reel.classList.remove('pulsing'), 1000);
            }, index * 300);
        });
        
        // Calculate cosmic winnings
        setTimeout(() => {
            const { multiplier, winAmount } = calculateSlotWinnings(results, betAmount);
            
            if (multiplier > 0) {
                gameState.aminaBalance += winAmount;
                updateAllDisplays();
                
                // Update mission progress
                updateMissionProgress('stellarCollector', 1);
                updateMissionProgress('highRoller', winAmount);
                
                showMessage(`🎉 COSMIC WIN! ${results.join('')} = ${winAmount} AMINA! (${multiplier}x) 🌟`, 'win');
                playCosmicWinSound();
            } else {
                showMessage(`🌌 The cosmos shifts... ${results.join('')} Better luck next orbit! 🚀`, 'lose');
                playCosmicLoseSound();
            }
            
            spinBtn.disabled = false;
            spinBtn.innerHTML = '<span>🌟 SPIN THE COSMOS 🌟</span>';
            gameState.gameInProgress = false;
        }, 1200);
    }, 2000);
}

function calculateSlotWinnings(results, betAmount) {
    let multiplier = 0;
    
    // Three of a kind - Cosmic Jackpots!
    if (results[0] === results[1] && results[1] === results[2]) {
        switch(results[0]) {
            case '🌟': multiplier = 15; break;  // Stellar jackpot
            case '🚀': multiplier = 12; break;  // Rocket power
            case '🌌': multiplier = 10; break;  // Galaxy win
            case '👽': multiplier = 8; break;   // Alien encounter
            case '🛸': multiplier = 6; break;   // UFO sighting
            case '💎': multiplier = 20; break;  // Diamond cosmos
            case '⭐': multiplier = 7; break;   // Star power
            case '🌠': multiplier = 9; break;   // Shooting star
        }
    }
    // Two of a kind - Stellar pairs
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        multiplier = 3;
    }
    
    const winAmount = betAmount * multiplier;
    return { multiplier, winAmount };
}

// ============================================
// ROULETTE FUNCTIONS
// ============================================

const ROULETTE_NUMBERS = {
    0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black',
    11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black',
    21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

function selectBet(betType) {
    // Clear previous selections
    document.querySelectorAll('.bet-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Select new bet
    const betElement = document.getElementById(`bet-${betType}`);
    betElement.classList.add('selected');
    gameState.selectedBet = betType;
    
    playClickSound();
}

function spinRoulette() {
    const betAmount = parseInt(document.getElementById('rouletteBet').value);
    
    if (!gameState.selectedBet) {
        showMessage('🎯 Select your cosmic bet first, space explorer!', 'lose');
        return;
    }
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA for this cosmic wager! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    const spinBtn = document.getElementById('rouletteSpinBtn');
    spinBtn.disabled = true;
    spinBtn.textContent = '🌀 SPINNING GALAXY...';
    
    // Generate winning number
    const winningNumber = Math.floor(Math.random() * 37);
    const winningColor = ROULETTE_NUMBERS[winningNumber];
    
    // Spin the cosmic wheel
    const wheel = document.getElementById('rouletteWheel');
    const rotations = 1800 + Math.random() * 1800; // 5-10 full rotations
    wheel.style.transform = `rotate(${rotations}deg)`;
    
    playCosmicSpinSound();
    
    setTimeout(() => {
        document.getElementById('winningNumber').textContent = `🌟 ${winningNumber} 🌟`;
        
        const { isWin, multiplier } = checkRouletteBet(gameState.selectedBet, winningNumber, winningColor);
        
        if (isWin) {
            const winAmount = betAmount * multiplier;
            gameState.aminaBalance += winAmount;
            updateAllDisplays();
            
            // Update mission progress
            updateMissionProgress('rouletteMaster', 1);
            updateMissionProgress('highRoller', winAmount);
            
            showMessage(`🎉 STELLAR WIN! Number ${winningNumber} (${winningColor})! Won ${winAmount} AMINA! 🌟`, 'win');
            playCosmicWinSound();
        } else {
            showMessage(`🌌 Number ${winningNumber} (${winningColor}). The cosmos spins on... 🚀`, 'lose');
            playCosmicLoseSound();
        }
        
        // Reset bet selection
        gameState.selectedBet = null;
        document.querySelectorAll('.bet-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        spinBtn.disabled = false;
        spinBtn.textContent = '🌌 SPIN THE GALAXY 🌌';
        gameState.gameInProgress = false;
    }, 4000);
}

function checkRouletteBet(betType, winningNumber, winningColor) {
    let isWin = false;
    let multiplier = 2;
    
    switch(betType) {
        case 'red':
            isWin = winningColor === 'red';
            break;
        case 'black':
            isWin = winningColor === 'black';
            break;
        case 'even':
            isWin = winningNumber > 0 && winningNumber % 2 === 0;
            break;
        case 'odd':
            isWin = winningNumber % 2 === 1;
            break;
        case 'low':
            isWin = winningNumber >= 1 && winningNumber <= 18;
            break;
        case 'high':
            isWin = winningNumber >= 19 && winningNumber <= 36;
            break;
    }
    
    return { isWin, multiplier };
}

// ============================================
// BLACKJACK FUNCTIONS
// ============================================

const CARD_SUITS = ['♠️', '♥️', '♦️', '♣️'];
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createCosmicDeck() {
    blackjackState.deck = [];
    
    for (let suit of CARD_SUITS) {
        for (let rank of CARD_RANKS) {
            blackjackState.deck.push({
                suit: suit,
                rank: rank,
                value: getCardValue(rank),
                isRed: suit === '♥️' || suit === '♦️'
            });
        }
    }
    
    // Cosmic shuffle
    for (let i = blackjackState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blackjackState.deck[i], blackjackState.deck[j]] = [blackjackState.deck[j], blackjackState.deck[i]];
    }
}

function getCardValue(rank) {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
}

function calculateHandScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += card.value;
        if (card.rank === 'A') aces++;
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function dealCards() {
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA for this space mission! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    // Initialize new cosmic hand
    createCosmicDeck();
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    blackjackState.dealerHidden = true;
    blackjackState.canDouble = true;
    
    // Deal initial cosmic cards
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    
    updateBlackjackDisplay();
    
    // Enable action buttons
    document.getElementById('dealBtn').disabled = true;
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('standBtn').disabled = false;
    document.getElementById('doubleBtn').disabled = false;
    
    // Check for cosmic blackjack
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore === 21) {
        // Player has blackjack!
        setTimeout(() => stand(), 1000);
    }
    
    playCardDealSound();
}

function hit() {
    if (!gameState.gameInProgress) return;
    
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.canDouble = false;
    document.getElementById('doubleBtn').disabled = true;
    
    updateBlackjackDisplay();
    playCardDealSound();
    
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore > 21) {
        // Cosmic bust!
        setTimeout(() => {
            endBlackjackGame('lose', '💥 Cosmic Bust! The universe is too strong! 🌌');
        }, 1000);
    }
}

function stand() {
    if (!gameState.gameInProgress) return;
    
    blackjackState.dealerHidden = false;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    document.getElementById('doubleBtn').disabled = true;
    
    // Dealer cosmic AI
    playDealerTurn();
}

function doubleDown() {
    if (!gameState.gameInProgress || !blackjackState.canDouble) return;
    
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA to double down! 💫', 'lose');
        return;
    }
    
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    // Hit once and stand
    blackjackState.playerHand.push(blackjackState.deck.pop());
    updateBlackjackDisplay();
    playCardDealSound();
    
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore > 21) {
        setTimeout(() => {
            endBlackjackGame('lose', '💥 Double Down Bust! The cosmos claimed your wager! 🌌');
        }, 1000);
    } else {
        setTimeout(() => stand(), 1000);
    }
}

function playDealerTurn() {
    const dealerTurnInterval = setInterval(() => {
        updateBlackjackDisplay();
        
        const dealerScore = calculateHandScore(blackjackState.dealerHand);
        
        if (dealerScore < 17) {
            blackjackState.dealerHand.push(blackjackState.deck.pop());
            playCardDealSound();
        } else {
            clearInterval(dealerTurnInterval);
            
            setTimeout(() => {
                const playerScore = calculateHandScore(blackjackState.playerHand);
                const finalDealerScore = calculateHandScore(blackjackState.dealerHand);
                
                determineBlackjackWinner(playerScore, finalDealerScore);
            }, 1000);
        }
    }, 1500);
}

function determineBlackjackWinner(playerScore, dealerScore) {
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    const isPlayerBlackjack = blackjackState.playerHand.length === 2 && playerScore === 21;
    const isDealerBlackjack = blackjackState.dealerHand.length === 2 && dealerScore === 21;
    
    if (dealerScore > 21) {
        // Dealer busts - cosmic victory!
        const winAmount = betAmount * (blackjackState.canDouble ? 4 : 2);
        endBlackjackGame('win', `🚀 Dealer Bust! Cosmic Victory! Won ${winAmount} AMINA! 🌟`, winAmount);
    } else if (isPlayerBlackjack && !isDealerBlackjack) {
        // Player blackjack!
        const winAmount = Math.floor(betAmount * 2.5);
        updateMissionProgress('blackjackChampion', 1);
        endBlackjackGame('win', `🃏 COSMIC BLACKJACK! Epic win! ${winAmount} AMINA! ⭐`, winAmount);
    } else if (playerScore > dealerScore) {
        // Player wins!
        const winAmount = betAmount * (blackjackState.canDouble ? 4 : 2);
        endBlackjackGame('win', `🎉 Victory over the cosmic dealer! Won ${winAmount} AMINA! 🌟`, winAmount);
    } else if (playerScore < dealerScore) {
        // Dealer wins
        endBlackjackGame('lose', `🤖 The cosmic dealer prevails... Better luck next mission! 🚀`);
    } else {
        // Cosmic tie!
        gameState.aminaBalance += betAmount * (blackjackState.canDouble ? 2 : 1); // Return bet
        endBlackjackGame('tie', `🌌 Cosmic Standoff! Your AMINA is returned! ⚖️`);
    }
}

function endBlackjackGame(result, message, winAmount = 0) {
    if (winAmount > 0) {
        gameState.aminaBalance += winAmount;
        updateMissionProgress('highRoller', winAmount);
        playCosmicWinSound();
    } else if (result === 'lose') {
        playCosmicLoseSound();
    }
    
    updateAllDisplays();
    showMessage(message, result);
    
    // Reset game buttons
    document.getElementById('dealBtn').disabled = false;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    document.getElementById('doubleBtn').disabled = true;
    
    gameState.gameInProgress = false;
}

function updateBlackjackDisplay() {
    // Update player cards
    const playerCardsDiv = document.getElementById('playerCards');
    playerCardsDiv.innerHTML = '';
    blackjackState.playerHand.forEach(card => {
        playerCardsDiv.appendChild(createCardElement(card));
    });
    
    // Update dealer cards
    const dealerCardsDiv = document.getElementById('dealerCards');
    dealerCardsDiv.innerHTML = '';
    blackjackState.dealerHand.forEach((card, index) => {
        const isHidden = blackjackState.dealerHidden && index === 1;
        dealerCardsDiv.appendChild(createCardElement(card, isHidden));
    });
    
    // Update scores
    document.getElementById('playerScore').textContent = calculateHandScore(blackjackState.playerHand);
    document.getElementById('dealerScore').textContent = blackjackState.dealerHidden ? '?' : calculateHandScore(blackjackState.dealerHand);
}

function createCardElement(card, isHidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    if (isHidden) {
        cardDiv.classList.add('card-back');
        cardDiv.textContent = '🌌';
    } else {
        if (card.isRed) {
            cardDiv.classList.add('red');
        }
        cardDiv.innerHTML = `${card.rank}<br>${card.suit}`;
    }
    
    return cardDiv;
}

// ============================================
// MISSION SYSTEM
// ============================================

function updateMissionProgress(missionType, value) {
    const mission = gameState.missions[missionType];
    if (!mission || mission.completed) return;
    
    mission.progress += value;
    
    if (mission.progress >= mission.target) {
        mission.progress = mission.target;
        const missionBtn = document.getElementById(`${missionType.replace(/([A-Z])/g, (match, letter, index) => index > 0 ? (index === 1 ? '1' : (index === 11 ? '2' : (index === 17 ? '3' : '4'))) : '')}Btn`);
        if (missionBtn) {
            missionBtn.disabled = false;
            missionBtn.textContent = 'Claim Reward!';
            missionBtn.classList.add('glowing');
        }
    }
    
    updateMissionDisplay();
}

function updateMissionDisplay() {
    Object.keys(gameState.missions).forEach((key, index) => {
        const mission = gameState.missions[key];
        const missionNumber = index + 1;
        
        const progressElement = document.getElementById(`mission${missionNumber}Progress`);
        if (progressElement) {
            progressElement.textContent = mission.progress;
        }
    });
}

function completeMission(missionNumber) {
    const missionKeys = Object.keys(gameState.missions);
    const missionKey = missionKeys[missionNumber - 1];
    const mission = gameState.missions[missionKey];
    
    if (mission && mission.progress >= mission.target && !mission.completed) {
        mission.completed = true;
        gameState.aminaBalance += mission.reward;
        
        const missionBtn = document.getElementById(`mission${missionNumber}Btn`);
        missionBtn.textContent = 'Completed!';
        missionBtn.disabled = true;
        missionBtn.classList.remove('glowing');
        
        showMessage(`🎉 Mission Complete! Earned ${mission.reward} AMINA! 🚀`, 'win');
        updateAllDisplays();
        playCosmicWinSound();
    }
}

// ============================================
// AUDIO FUNCTIONS
// ============================================

function playNotificationSound(type) {
    // Create simple notification sounds
    if (!gameState.audioContext) return;
    
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    if (type === 'win') {
        oscillator.frequency.setValueAtTime(523.25, gameState.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, gameState.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, gameState.audioContext.currentTime + 0.2); // G5
    } else if (type === 'lose') {
        oscillator.frequency.setValueAtTime(220, gameState.audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, gameState.audioContext.currentTime + 0.1); // G3
        oscillator.frequency.setValueAtTime(174.61, gameState.audioContext.currentTime + 0.2); // F3
    }
    
    gainNode.gain.setValueAtTime(0.1, gameState.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, gameState.audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(gameState.audioContext.currentTime + 0.3);
}

function playCosmicSpinSound() {
    playNotificationSound('spin');
}

function playCosmicWinSound() {
    playNotificationSound('win');
}

function playCosmicLoseSound() {
    playNotificationSound('lose');
}

function playClickSound() {
    if (!gameState.audioContext) return;
    
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, gameState.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05, gameState.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, gameState.audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(gameState.audioContext.currentTime + 0.1);
}

function playCardDealSound() {
    playClickSound();
}

// ============================================
// COSMIC EFFECTS
// ============================================

function createCosmicParticles() {
    // Add floating cosmic particles effect
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 200);
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #ffd700, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        left: ${Math.random() * 100}vw;
        top: 100vh;
        opacity: 0.8;
    `;
    
    document.body.appendChild(particle);
    
    const duration = 8000 + Math.random() * 4000;
    const drift = (Math.random() - 0.5) * 200;
    
    particle.animate([
        { transform: `translateY(0px) translateX(0px)`, opacity: 0 },
        { transform: `translateY(-50px) translateX(${drift * 0.2}px)`, opacity: 0.8 },
        { transform: `translateY(-100vh) translateX(${drift}px)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear'
    }).addEventListener('finish', () => {
        particle.remove();
        // Create new particle to maintain count
        setTimeout(createParticle, Math.random() * 2000);
    });
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

function saveGameProgress() {
    try {
        const saveData = {
            aminaBalance: gameState.aminaBalance,
            algoBalance: gameState.algoBalance,
            missions: gameState.missions,
            walletConnected: gameState.walletConnected
        };
        localStorage.setItem('aminaCasinoSave', JSON.stringify(saveData));
    } catch (e) {
        console.log('Could not save game progress');
    }
}

function loadGameProgress() {
    try {
        const saveData = localStorage.getItem('aminaCasinoSave');
        if (saveData) {
            const parsed = JSON.parse(saveData);
            gameState.aminaBalance = parsed.aminaBalance || 1000;
            gameState.algoBalance = parsed.algoBalance || 100;
            gameState.missions = { ...gameState.missions, ...parsed.missions };
            gameState.walletConnected = parsed.walletConnected || false;
            
            if (gameState.walletConnected) {
                const btn = document.getElementById('connectWallet');
                btn.textContent = '✅ Wallet Connected';
                btn.classList.add('connected');
                document.getElementById('conversionPanel').classList.add('active');
                document.getElementById('conversionPanel').style.display = 'block';
            }
        }
    } catch (e) {
        console.log('Could not load game progress');
    }
}

// Auto-save every 30 seconds
setInterval(saveGameProgress, 30000);

// Save when page is closed
window.addEventListener('beforeunload', saveGameProgress);
// Amina Casino - Game Logic & Mechanics
// Cosmic Galactic Adventure Theme

// Global Game State
let gameState = {
    aminaBalance: 1000,
    algoBalance: 100,
    currentGame: 'slots',
    gameInProgress: false,
    selectedBet: null,
    walletConnected: false,
    
    // Mission Progress
    missions: {
        stellarCollector: { progress: 0, target: 5, completed: false, reward: 500 },
        rouletteMaster: { progress: 0, target: 3, completed: false, reward: 300 },
        blackjackChampion: { progress: 0, target: 3, completed: false, reward: 1000 },
        highRoller: { progress: 0, target: 2000, completed: false, reward: 2000 }
    }
};

// Blackjack Game State
let blackjackState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    dealerHidden: true,
    canDouble: false
};

// Initialize Casino
document.addEventListener('DOMContentLoaded', function() {
    initializeCasino();
    updateAllDisplays();
});

function initializeCasino() {
    console.log('🚀 Amina Casino - Cosmic Adventure Initialized!');
    
    // Load saved progress
    loadGameProgress();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize audio
    initializeAudio();
    
    // Start cosmic effects
    startCosmicEffects();
}

function setupEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Exchange controls
    document.getElementById('exchangeAmount').addEventListener('input', validateExchangeAmount);
}

function initializeAudio() {
    // Create audio context for cosmic sounds
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gameState.audioContext = audioContext;
    } catch (e) {
        console.log('Audio not supported');
    }
}

function startCosmicEffects() {
    // Add cosmic particle effects
    createCosmicParticles();
    
    // Start ambient cosmic sounds (muted by default)
    // playAmbientSound();
}

// ============================================
// WALLET & EXCHANGE FUNCTIONS
// ============================================

function connectWallet() {
    const btn = document.getElementById('connectWallet');
    
    if (!gameState.walletConnected) {
        // Simulate wallet connection (replace with Pera Wallet integration later)
        btn.textContent = '🔄 Connecting...';
        btn.disabled = true;
        
        setTimeout(() => {
            gameState.walletConnected = true;
            btn.textContent = '✅ Wallet Connected';
            btn.classList.add('connected');
            
            // Show conversion panel
            const conversionPanel = document.getElementById('conversionPanel');
            conversionPanel.classList.add('active');
            conversionPanel.style.display = 'block';
            
            showMessage('🚀 Pera Wallet Connected Successfully!', 'win');
        }, 2000);
    }
}

function exchangeCoins() {
    const amount = parseInt(document.getElementById('exchangeAmount').value);
    const exchangeType = document.getElementById('exchangeType').value;
    
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount!', 'lose');
        return;
    }
    
    if (exchangeType === 'algoToAmina') {
        if (amount > gameState.algoBalance) {
            showMessage('Insufficient ALGO balance!', 'lose');
            return;
        }
        
        gameState.algoBalance -= amount;
        gameState.aminaBalance += amount * 10; // 1 ALGO = 10 AMINA
        showMessage(`🔄 Exchanged ${amount} ALGO for ${amount * 10} AMINA!`, 'win');
        
    } else {
        const aminaNeeded = amount * 10;
        if (aminaNeeded > gameState.aminaBalance) {
            showMessage('Insufficient AMINA balance!', 'lose');
            return;
        }
        
        gameState.aminaBalance -= aminaNeeded;
        gameState.algoBalance += amount; // 10 AMINA = 1 ALGO
        showMessage(`🔄 Exchanged ${aminaNeeded} AMINA for ${amount} ALGO!`, 'win');
    }
    
    updateAllDisplays();
    document.getElementById('exchangeAmount').value = '';
}

function validateExchangeAmount() {
    const amount = parseInt(document.getElementById('exchangeAmount').value);
    const exchangeType = document.getElementById('exchangeType').value;
    const btn = document.querySelector('.exchange-btn');
    
    if (exchangeType === 'algoToAmina') {
        btn.disabled = amount > gameState.algoBalance || amount <= 0;
    } else {
        btn.disabled = (amount * 10) > gameState.aminaBalance || amount <= 0;
    }
}

// ============================================
// NAVIGATION & UI FUNCTIONS
// ============================================

function showGame(gameName) {
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected game
    document.getElementById(gameName).classList.add('active');
    document.getElementById(gameName + 'Tab').classList.add('active');
    
    gameState.currentGame = gameName;
    
    // Clear any ongoing game messages
    clearMessages();
    
    // Game-specific initialization
    if (gameName === 'missions') {
        updateMissionDisplay();
    }
}

function updateAllDisplays() {
    document.getElementById('aminaBalance').textContent = gameState.aminaBalance;
    document.getElementById('algoBalance').textContent = gameState.algoBalance;
    updateMissionProgress();
}

function showMessage(message, type = 'info') {
    const resultElements = document.querySelectorAll('.result-message');
    resultElements.forEach(element => {
        element.textContent = message;
        element.className = `result-message result-${type}`;
        
        // Add cosmic glow effect
        element.classList.add('glowing');
        setTimeout(() => {
            element.classList.remove('glowing');
        }, 3000);
    });
    
    // Play notification sound
    playNotificationSound(type);
}

function clearMessages() {
    document.querySelectorAll('.result-message').forEach(element => {
        element.textContent = '';
        element.className = 'result-message';
    });
}

// ============================================
// SLOT MACHINE FUNCTIONS
// ============================================

const COSMIC_SYMBOLS = ['🌟', '🚀', '🌌', '👽', '🛸', '💎', '⭐', '🌠'];

function spinSlots() {
    const betAmount = parseInt(document.getElementById('slotBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA balance! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<span>🌀 SPINNING COSMOS... 🌀</span>';
    
    // Start cosmic spinning animation
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    reels.forEach(reel => {
        reel.classList.add('spinning');
        reel.classList.add('glowing');
    });
    
    // Generate cosmic results
    const results = [
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)],
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)],
        COSMIC_SYMBOLS[Math.floor(Math.random() * COSMIC_SYMBOLS.length)]
    ];
    
    // Play cosmic spin sound
    playCosmicSpinSound();
    
    // Stop spinning with cosmic delay
    setTimeout(() => {
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning', 'glowing');
                reel.textContent = results[index];
                reel.classList.add('pulsing');
                
                setTimeout(() => reel.classList.remove('pulsing'), 1000);
            }, index * 300);
        });
        
        // Calculate cosmic winnings
        setTimeout(() => {
            const { multiplier, winAmount } = calculateSlotWinnings(results, betAmount);
            
            if (multiplier > 0) {
                gameState.aminaBalance += winAmount;
                updateAllDisplays();
                
                // Update mission progress
                updateMissionProgress('stellarCollector', 1);
                updateMissionProgress('highRoller', winAmount);
                
                showMessage(`🎉 COSMIC WIN! ${results.join('')} = ${winAmount} AMINA! (${multiplier}x) 🌟`, 'win');
                playCosmicWinSound();
            } else {
                showMessage(`🌌 The cosmos shifts... ${results.join('')} Better luck next orbit! 🚀`, 'lose');
                playCosmicLoseSound();
            }
            
            spinBtn.disabled = false;
            spinBtn.innerHTML = '<span>🌟 SPIN THE COSMOS 🌟</span>';
            gameState.gameInProgress = false;
        }, 1200);
    }, 2000);
}

function calculateSlotWinnings(results, betAmount) {
    let multiplier = 0;
    
    // Three of a kind - Cosmic Jackpots!
    if (results[0] === results[1] && results[1] === results[2]) {
        switch(results[0]) {
            case '🌟': multiplier = 15; break;  // Stellar jackpot
            case '🚀': multiplier = 12; break;  // Rocket power
            case '🌌': multiplier = 10; break;  // Galaxy win
            case '👽': multiplier = 8; break;   // Alien encounter
            case '🛸': multiplier = 6; break;   // UFO sighting
            case '💎': multiplier = 20; break;  // Diamond cosmos
            case '⭐': multiplier = 7; break;   // Star power
            case '🌠': multiplier = 9; break;   // Shooting star
        }
    }
    // Two of a kind - Stellar pairs
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        multiplier = 3;
    }
    
    const winAmount = betAmount * multiplier;
    return { multiplier, winAmount };
}

// ============================================
// ROULETTE FUNCTIONS
// ============================================

const ROULETTE_NUMBERS = {
    0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black',
    11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black',
    21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

function selectBet(betType) {
    // Clear previous selections
    document.querySelectorAll('.bet-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Select new bet
    const betElement = document.getElementById(`bet-${betType}`);
    betElement.classList.add('selected');
    gameState.selectedBet = betType;
    
    playClickSound();
}

function spinRoulette() {
    const betAmount = parseInt(document.getElementById('rouletteBet').value);
    
    if (!gameState.selectedBet) {
        showMessage('🎯 Select your cosmic bet first, space explorer!', 'lose');
        return;
    }
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA for this cosmic wager! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    const spinBtn = document.getElementById('rouletteSpinBtn');
    spinBtn.disabled = true;
    spinBtn.textContent = '🌀 SPINNING GALAXY...';
    
    // Generate winning number
    const winningNumber = Math.floor(Math.random() * 37);
    const winningColor = ROULETTE_NUMBERS[winningNumber];
    
    // Spin the cosmic wheel
    const wheel = document.getElementById('rouletteWheel');
    const rotations = 1800 + Math.random() * 1800; // 5-10 full rotations
    wheel.style.transform = `rotate(${rotations}deg)`;
    
    playCosmicSpinSound();
    
    setTimeout(() => {
        document.getElementById('winningNumber').textContent = `🌟 ${winningNumber} 🌟`;
        
        const { isWin, multiplier } = checkRouletteBet(gameState.selectedBet, winningNumber, winningColor);
        
        if (isWin) {
            const winAmount = betAmount * multiplier;
            gameState.aminaBalance += winAmount;
            updateAllDisplays();
            
            // Update mission progress
            updateMissionProgress('rouletteMaster', 1);
            updateMissionProgress('highRoller', winAmount);
            
            showMessage(`🎉 STELLAR WIN! Number ${winningNumber} (${winningColor})! Won ${winAmount} AMINA! 🌟`, 'win');
            playCosmicWinSound();
        } else {
            showMessage(`🌌 Number ${winningNumber} (${winningColor}). The cosmos spins on... 🚀`, 'lose');
            playCosmicLoseSound();
        }
        
        // Reset bet selection
        gameState.selectedBet = null;
        document.querySelectorAll('.bet-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        spinBtn.disabled = false;
        spinBtn.textContent = '🌌 SPIN THE GALAXY 🌌';
        gameState.gameInProgress = false;
    }, 4000);
}

function checkRouletteBet(betType, winningNumber, winningColor) {
    let isWin = false;
    let multiplier = 2;
    
    switch(betType) {
        case 'red':
            isWin = winningColor === 'red';
            break;
        case 'black':
            isWin = winningColor === 'black';
            break;
        case 'even':
            isWin = winningNumber > 0 && winningNumber % 2 === 0;
            break;
        case 'odd':
            isWin = winningNumber % 2 === 1;
            break;
        case 'low':
            isWin = winningNumber >= 1 && winningNumber <= 18;
            break;
        case 'high':
            isWin = winningNumber >= 19 && winningNumber <= 36;
            break;
    }
    
    return { isWin, multiplier };
}

// ============================================
// BLACKJACK FUNCTIONS
// ============================================

const CARD_SUITS = ['♠️', '♥️', '♦️', '♣️'];
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createCosmicDeck() {
    blackjackState.deck = [];
    
    for (let suit of CARD_SUITS) {
        for (let rank of CARD_RANKS) {
            blackjackState.deck.push({
                suit: suit,
                rank: rank,
                value: getCardValue(rank),
                isRed: suit === '♥️' || suit === '♦️'
            });
        }
    }
    
    // Cosmic shuffle
    for (let i = blackjackState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blackjackState.deck[i], blackjackState.deck[j]] = [blackjackState.deck[j], blackjackState.deck[i]];
    }
}

function getCardValue(rank) {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
}

function calculateHandScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += card.value;
        if (card.rank === 'A') aces++;
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function dealCards() {
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA for this space mission! 💫', 'lose');
        return;
    }
    
    if (gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    // Initialize new cosmic hand
    createCosmicDeck();
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    blackjackState.dealerHidden = true;
    blackjackState.canDouble = true;
    
    // Deal initial cosmic cards
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.dealerHand.push(blackjackState.deck.pop());
    
    updateBlackjackDisplay();
    
    // Enable action buttons
    document.getElementById('dealBtn').disabled = true;
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('standBtn').disabled = false;
    document.getElementById('doubleBtn').disabled = false;
    
    // Check for cosmic blackjack
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore === 21) {
        // Player has blackjack!
        setTimeout(() => stand(), 1000);
    }
    
    playCardDealSound();
}

function hit() {
    if (!gameState.gameInProgress) return;
    
    blackjackState.playerHand.push(blackjackState.deck.pop());
    blackjackState.canDouble = false;
    document.getElementById('doubleBtn').disabled = true;
    
    updateBlackjackDisplay();
    playCardDealSound();
    
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore > 21) {
        // Cosmic bust!
        setTimeout(() => {
            endBlackjackGame('lose', '💥 Cosmic Bust! The universe is too strong! 🌌');
        }, 1000);
    }
}

function stand() {
    if (!gameState.gameInProgress) return;
    
    blackjackState.dealerHidden = false;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    document.getElementById('doubleBtn').disabled = true;
    
    // Dealer cosmic AI
    playDealerTurn();
}

function doubleDown() {
    if (!gameState.gameInProgress || !blackjackState.canDouble) return;
    
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    
    if (betAmount > gameState.aminaBalance) {
        showMessage('Insufficient AMINA to double down! 💫', 'lose');
        return;
    }
    
    gameState.aminaBalance -= betAmount;
    updateAllDisplays();
    
    // Hit once and stand
    blackjackState.playerHand.push(blackjackState.deck.pop());
    updateBlackjackDisplay();
    playCardDealSound();
    
    const playerScore = calculateHandScore(blackjackState.playerHand);
    if (playerScore > 21) {
        setTimeout(() => {
            endBlackjackGame('lose', '💥 Double Down Bust! The cosmos claimed your wager! 🌌');
        }, 1000);
    } else {
        setTimeout(() => stand(), 1000);
    }
}

function playDealerTurn() {
    const dealerTurnInterval = setInterval(() => {
        updateBlackjackDisplay();
        
        const dealerScore = calculateHandScore(blackjackState.dealerHand);
        
        if (dealerScore < 17) {
            blackjackState.dealerHand.push(blackjackState.deck.pop());
            playCardDealSound();
        } else {
            clearInterval(dealerTurnInterval);
            
            setTimeout(() => {
                const playerScore = calculateHandScore(blackjackState.playerHand);
                const finalDealerScore = calculateHandScore(blackjackState.dealerHand);
                
                determineBlackjackWinner(playerScore, finalDealerScore);
            }, 1000);
        }
    }, 1500);
}

function determineBlackjackWinner(playerScore, dealerScore) {
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    const isPlayerBlackjack = blackjackState.playerHand.length === 2 && playerScore === 21;
    const isDealerBlackjack = blackjackState.dealerHand.length === 2 && dealerScore === 21;
    
    if (dealerScore > 21) {
        // Dealer busts - cosmic victory!
        const winAmount = betAmount * (blackjackState.canDouble ? 4 : 2);
        endBlackjackGame('win', `🚀 Dealer Bust! Cosmic Victory! Won ${winAmount} AMINA! 🌟`, winAmount);
    } else if (isPlayerBlackjack && !isDealerBlackjack) {
        // Player blackjack!
        const winAmount = Math.floor(betAmount * 2.5);
        updateMissionProgress('blackjackChampion', 1);
        endBlackjackGame('win', `🃏 COSMIC BLACKJACK! Epic win! ${winAmount} AMINA! ⭐`, winAmount);
    } else if (playerScore > dealerScore) {
        // Player wins!
        const winAmount = betAmount * (blackjackState.canDouble ? 4 : 2);
        endBlackjackGame('win', `🎉 Victory over the cosmic dealer! Won ${winAmount} AMINA! 🌟`, winAmount);
    } else if (playerScore < dealerScore) {
        // Dealer wins
        endBlackjackGame('lose', `🤖 The cosmic dealer prevails... Better luck next mission! 🚀`);
    } else {
        // Cosmic tie!
        gameState.aminaBalance += betAmount * (blackjackState.canDouble ? 2 : 1); // Return bet
        endBlackjackGame('tie', `🌌 Cosmic Standoff! Your AMINA is returned! ⚖️`);
    }
}

function endBlackjackGame(result, message, winAmount = 0) {
    if (winAmount > 0) {
        gameState.aminaBalance += winAmount;
        updateMissionProgress('highRoller', winAmount);
        playCosmicWinSound();
    } else if (result === 'lose') {
        playCosmicLoseSound();
    }
    
    updateAllDisplays();
    showMessage(message, result);
    
    // Reset game buttons
    document.getElementById('dealBtn').disabled = false;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    document.getElementById('doubleBtn').disabled = true;
    
    gameState.gameInProgress = false;
}

function updateBlackjackDisplay() {
    // Update player cards
    const playerCardsDiv = document.getElementById('playerCards');
    playerCardsDiv.innerHTML = '';
    blackjackState.playerHand.forEach(card => {
        playerCardsDiv.appendChild(createCardElement(card));
    });
    
    // Update dealer cards
    const dealerCardsDiv = document.getElementById('dealerCards');
    dealerCardsDiv.innerHTML = '';
    blackjackState.dealerHand.forEach((card, index) => {
        const isHidden = blackjackState.dealerHidden && index === 1;
        dealerCardsDiv.appendChild(createCardElement(card, isHidden));
    });
    
    // Update scores
    document.getElementById('playerScore').textContent = calculateHandScore(blackjackState.playerHand);
    document.getElementById('dealerScore').textContent = blackjackState.dealerHidden ? '?' : calculateHandScore(blackjackState.dealerHand);
}

function createCardElement(card, isHidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    if (isHidden) {
        cardDiv.classList.add('card-back');
        cardDiv.textContent = '🌌';
    } else {
        if (card.isRed) {
            cardDiv.classList.add('red');
        }
        cardDiv.innerHTML = `${card.rank}<br>${card.suit}`;
    }
    
    return cardDiv;
}

// ============================================
// MISSION SYSTEM
// ============================================

function updateMissionProgress(missionType, value) {
    const mission = gameState.missions[missionType];
    if (!mission || mission.completed) return;
    
    mission.progress += value;
    
    if (mission.progress >= mission.target) {
        mission.progress = mission.target;
        const missionBtn = document.getElementById(`${missionType.replace(/([A-Z])/g, (match, letter, index) => index > 0 ? (index === 1 ? '1' : (index === 11 ? '2' : (index === 17 ? '3' : '4'))) : '')}Btn`);
        if (missionBtn) {
            missionBtn.disabled = false;
            missionBtn.textContent = 'Claim Reward!';
            missionBtn.classList.add('glowing');
        }
    }
    
    updateMissionDisplay();
}

function updateMissionDisplay() {
    Object.keys(gameState.missions).forEach((key, index) => {
        const mission = gameState.missions[key];
        const missionNumber = index + 1;
        
        const progressElement = document.getElementById(`mission${missionNumber}Progress`);
        if (progressElement) {
            progressElement.textContent = mission.progress;
        }
    });
}

function completeMission(missionNumber) {
    const missionKeys = Object.keys(gameState.missions);
    const missionKey = missionKeys[missionNumber - 1];
    const mission = gameState.missions[missionKey];
    
    if (mission && mission.progress >= mission.target && !mission.completed) {
        mission.completed = true;
        gameState.aminaBalance += mission.reward;
        
        const missionBtn = document.getElementById(`mission${missionNumber}Btn`);
        missionBtn.textContent = 'Completed!';
        missionBtn.disabled = true;
        missionBtn.classList.remove('glowing');
        
        showMessage(`🎉 Mission Complete! Earned ${mission.reward} AMINA! 🚀`, 'win');
        updateAllDisplays();
        playCosmicWinSound();
    }
}

// ============================================
// AUDIO FUNCTIONS
// ============================================

function playNotificationSound(type) {
    // Create simple notification sounds
    if (!gameState.audioContext) return;
    
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    if (type === 'win') {
        oscillator.frequency.setValueAtTime(523.25, gameState.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, gameState.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, gameState.audioContext.currentTime + 0.2); // G5
    } else if (type === 'lose') {
        oscillator.frequency.setValueAtTime(220, gameState.audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, gameState.audioContext.currentTime + 0.1); // G3
        oscillator.frequency.setValueAtTime(174.61, gameState.audioContext.currentTime + 0.2); // F3
    }
    
    gainNode.gain.setValueAtTime(0.1, gameState.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, gameState.audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(gameState.audioContext.currentTime + 0.3);
}

function playCosmicSpinSound() {
    playNotificationSound('spin');
}

function playCosmicWinSound() {
    playNotificationSound('win');
}

function playCosmicLoseSound() {
    playNotificationSound('lose');
}

function playClickSound() {
    if (!gameState.audioContext) return;
    
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, gameState.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05, gameState.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, gameState.audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(gameState.audioContext.currentTime + 0.1);
}

function playCardDealSound() {
    playClickSound();
}

// ============================================
// COSMIC EFFECTS
// ============================================

function createCosmicParticles() {
    // Add floating cosmic particles effect
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 200);
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #ffd700, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        left: ${Math.random() * 100}vw;
        top: 100vh;
        opacity: 0.8;
    `;
    
    document.body.appendChild(particle);
    
    const duration = 8000 + Math.random() * 4000;
    const drift = (Math.random() - 0.5) * 200;
    
    particle.animate([
        { transform: `translateY(0px) translateX(0px)`, opacity: 0 },
        { transform: `translateY(-50px) translateX(${drift * 0.2}px)`, opacity: 0.8 },
        { transform: `translateY(-100vh) translateX(${drift}px)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear'
    }).addEventListener('finish', () => {
        particle.remove();
        // Create new particle to maintain count
        setTimeout(createParticle, Math.random() * 2000);
    });
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================

function saveGameProgress() {
    try {
        const saveData = {
            aminaBalance: gameState.aminaBalance,
            algoBalance: gameState.algoBalance,
            missions: gameState.missions,
            walletConnected: gameState.walletConnected
        };
        localStorage.setItem('aminaCasinoSave', JSON.stringify(saveData));
    } catch (e) {
        console.log('Could not save game progress');
    }
}

function loadGameProgress() {
    try {
        const saveData = localStorage.getItem('aminaCasinoSave');
        if (saveData) {
            const parsed = JSON.parse(saveData);
            gameState.aminaBalance = parsed.aminaBalance || 1000;
            gameState.algoBalance = parsed.algoBalance || 100;
            gameState.missions = { ...gameState.missions, ...parsed.missions };
            gameState.walletConnected = parsed.walletConnected || false;
            
            if (gameState.walletConnected) {
                const btn = document.getElementById('connectWallet');
                btn.textContent = '✅ Wallet Connected';
                btn.classList.add('connected');
                document.getElementById('conversionPanel').classList.add('active');
                document.getElementById('conversionPanel').style.display = 'block';
            }
        }
    } catch (e) {
        console.log('Could not load game progress');
    }
}

// Auto-save every 30 seconds
setInterval(saveGameProgress, 30000);

// Save when page is closed
window.addEventListener('beforeunload', saveGameProgress);
