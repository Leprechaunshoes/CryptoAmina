// Main Casino Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let useAmina = false; // Default to House Coins
    let houseCoins = 1000; // Starting amount of house coins
    let minBet = 0.25;
    let maxBet = 1;
    
    // DOM Elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const walletBalance = document.getElementById('wallet-balance');
    const currencyToggle = document.getElementById('currency-toggle');
    const houseBalance = document.getElementById('house-balance');
    const toggleMusicBtn = document.getElementById('toggle-music');
    const donateBtn = document.getElementById('donate-button');
    const donationModal = document.getElementById('donation-modal');
    const closeModal = document.querySelector('.close');
    const confirmDonationBtn = document.getElementById('confirm-donation');
    
    // Game tabs
    const gameTabs = document.querySelectorAll('.game-tab');
    const gameContents = document.querySelectorAll('.game-content');
    
    // Audio elements
    const backgroundMusic = document.getElementById('background-music');
    const winSound = document.getElementById('win-sound');
    const spinSound = document.getElementById('spin-sound');
    const cardSound = document.getElementById('card-sound');
    const plinkoSound = document.getElementById('plinko-sound');
    
    // Initialize the casino
    initializeCasino();
    
    // Connect to wallet
    connectWalletBtn.addEventListener('click', async function() {
        try {
            const accounts = await peraWallet.connect();
            if (accounts.length > 0) {
                const account = accounts[0];
                const aminaBalance = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
                
                // Update UI
                walletAddress.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
                walletBalance.textContent = `${aminaBalance} Amina`;
                
                connectWalletBtn.classList.add('hidden');
                walletInfo.classList.remove('hidden');
                
                // Enable Amina toggle
                currencyToggle.disabled = false;
            }
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect to wallet. Please try again.");
        }
    });
    
    // Toggle currency
    currencyToggle.addEventListener('change', function() {
        useAmina = this.checked;
        updateBalanceDisplay();
    });
    
    // Toggle music
    toggleMusicBtn.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            backgroundMusic.pause();
            toggleMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    });
    
    // Game tab switching
    gameTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            gameTabs.forEach(t => t.classList.remove('active'));
            gameContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const gameId = this.getAttribute('data-game');
            document.getElementById(`${gameId}-game`).classList.add('active');
        });
    });
    
    // Donation modal
    donateBtn.addEventListener('click', function() {
        if (!peraWallet.isConnected() && useAmina) {
            alert("Please connect your wallet first.");
            return;
        }
        donationModal.style.display = "block";
    });
    
    closeModal.addEventListener('click', function() {
        donationModal.style.display = "none";
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === donationModal) {
            donationModal.style.display = "none";
        }
    });
    
    confirmDonationBtn.addEventListener('click', async function() {
        const amount = parseFloat(document.getElementById('donation-amount').value);
        if (isNaN(amount) || amount < minBet) {
            alert(`Please enter a valid amount (minimum ${minBet}).`);
            return;
        }
        
        try {
            if (useAmina) {
                const account = peraWallet.getAccounts()[0];
                const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, amount, AMINA_ASSET_ID);
                walletBalance.textContent = `${result.balance} Amina`;
                alert(`Thank you for your donation of ${amount} Amina!`);
            } else {
                if (amount > houseCoins) {
                    alert("Not enough House Coins.");
                    return;
                }
                houseCoins -= amount;
                updateBalanceDisplay();
                alert(`Thank you for your donation of ${amount} House Coins!`);
            }
            donationModal.style.display = "none";
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Please try again.");
        }
    });
    
    // SLOTS GAME
    const slotSymbols = ['🚀', '💫', '🌟', '🪐', '👽'];
    const slotPayouts = {'🚀': 5, '💫': 3, '🌟': 2, '🪐': 10, '👽': 7};
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    const decreaseBetBtn = document.getElementById('decrease-bet');
    const increaseBetBtn = document.getElementById('increase-bet');
    const betAmountEl = document.getElementById('bet-amount');
    const spinBtn = document.getElementById('spin-button');
    const slotsResult = document.getElementById('slots-result');
    
    let currentBet = minBet;
    let isSpinning = false;
    
    // Update bet amount
    decreaseBetBtn.addEventListener('click', function() {
        if (currentBet > minBet) {
            currentBet = Math.max(minBet, currentBet - minBet);
            betAmountEl.textContent = currentBet.toFixed(2);
        }
    });
    
    increaseBetBtn.addEventListener('click', function() {
        if (currentBet < maxBet) {
            currentBet = Math.min(maxBet, currentBet + minBet);
            betAmountEl.textContent = currentBet.toFixed(2);
        }
    });
    
    // Spin the slot machine
    spinBtn.addEventListener('click', async function() {
        if (isSpinning) return;
        
        // Check if user can afford the bet
        if (useAmina) {
            if (!peraWallet.isConnected()) {
                alert("Please connect your wallet first.");
                return;
            }
            
            const account = peraWallet.getAccounts()[0];
            const balance = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
            
            if (parseFloat(balance) < currentBet) {
                alert("Not enough Amina coins.");
                return;
            }
            
            // Place bet (send to house)
            try {
                const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, currentBet, AMINA_ASSET_ID);
                walletBalance.textContent = `${result.balance} Amina`;
            } catch (error) {
                console.error("Failed to place bet:", error);
                alert("Failed to place bet. Please try again.");
                return;
            }
        } else {
            if (houseCoins < currentBet) {
                alert("Not enough House Coins.");
                return;
            }
            houseCoins -= currentBet;
            updateBalanceDisplay();
        }
        
        isSpinning = true;
        slotsResult.textContent = "";
        
        // Play spin sound
        spinSound.currentTime = 0;
        spinSound.play();
        
        // Spin animation
        const spinDurations = [2000, 2500, 3000]; // Different durations for each reel
        const finalSymbols = [];
        
        for (let i = 0; i < reels.length; i++) {
            finalSymbols.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
            animateReel(reels[i], spinDurations[i], finalSymbols[i]);
        }
        
        // Wait for longest spin to complete
        setTimeout(async () => {
            // Check results
            const result = checkSlotResult(finalSymbols);
            
            if (result.win) {
                const winAmount = currentBet * result.multiplier;
                slotsResult.textContent = `You won ${winAmount.toFixed(2)}!`;
                
                // Play win sound
                winSound.currentTime = 0;
                winSound.play();
                
                // Award winnings
                if (useAmina) {
                    const account = peraWallet.getAccounts()[0];
                    try {
                        const txResult = await peraWallet.receiveAssets(account, winAmount, AMINA_ASSET_ID);
                        walletBalance.textContent = `${txResult.balance} Amina`;
                    } catch (error) {
                        console.error("Failed to receive winnings:", error);
                        alert("Failed to receive winnings. Please try again.");
                    }
                } else {
                    houseCoins += winAmount;
                    updateBalanceDisplay();
                }
            } else {
                slotsResult.textContent = "Better luck next time!";
            }
            
            isSpinning = false;
        }, Math.max(...spinDurations) + 100);
    });
    
    // BLACKJACK GAME
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const dealerCards = document.getElementById('dealer-cards');
    const playerCards = document.getElementById('player-cards');
    const dealerScore = document.getElementById('dealer-score');
    const playerScore = document.getElementById('player-score');
    const bjResult = document.getElementById('blackjack-result');
    const dealButton = document.getElementById('deal-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const bjDecreaseBetBtn = document.getElementById('bj-decrease-bet');
    const bjIncreaseBetBtn = document.getElementById('bj-increase-bet');
    const bjBetAmountEl = document.getElementById('bj-bet-amount');
    
    let deck = [];
    let dealerHand = [];
    let playerHand = [];
    let bjCurrentBet = minBet;
    let gameInProgress = false;
    
    // Update bet amount for blackjack
    bjDecreaseBetBtn.addEventListener('click', function() {
        if (bjCurrentBet > minBet && !gameInProgress) {
            bjCurrentBet = Math.max(minBet, bjCurrentBet - minBet);
            bjBetAmountEl.textContent = bjCurrentBet.toFixed(2);
        }
    });
    
    bjIncreaseBetBtn.addEventListener('click', function() {
        if (bjCurrentBet < maxBet && !gameInProgress) {
            bjCurrentBet = Math.min(maxBet, bjCurrentBet + minBet);
            bjBetAmountEl.textContent = bjCurrentBet.toFixed(2);
        }
    });
    
    // Deal button
    dealButton.addEventListener('click', async function() {
        if (gameInProgress) return;
        
        // Check if user can afford the bet
        if (useAmina) {
            if (!peraWallet.isConnected()) {
                alert("Please connect your wallet first.");
                return;
            }
            
            const account = peraWallet.getAccounts()[0];
            const balance = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
            
            if (parseFloat(balance) < bjCurrentBet) {
                alert("Not enough Amina coins.");
                return;
            }
            
            // Place bet (send to house)
            try {
                const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, bjCurrentBet, AMINA_ASSET_ID);
                walletBalance.textContent = `${result.balance} Amina`;
            } catch (error) {
                console.error("Failed to place bet:", error);
                alert("Failed to place bet. Please try again.");
                return;
            }
        } else {
            if (houseCoins < bjCurrentBet) {
                alert("Not enough House Coins.");
                return;
            }
            houseCoins -= bjCurrentBet;
            updateBalanceDisplay();
        }
        
        // Clear previous game
        dealerCards.innerHTML = '';
        playerCards.innerHTML = '';
        bjResult.textContent = '';
        dealerScore.textContent = '?';
        playerScore.textContent = '0';
        
        // Create and shuffle deck
        createDeck();
        shuffleDeck();
        
        // Reset hands
        dealerHand = [];
        playerHand = [];
        
        // Deal initial cards
        dealCard(dealerHand, dealerCards, true);
        dealCard(playerHand, playerCards);
        dealCard(dealerHand, dealerCards);
        dealCard(playerHand, playerCards);
        
        // Update scores
        updateScores();
        
        // Check for blackjack
        if (calculateScore(playerHand) === 21) {
            await endGame();
            return;
        }
        
        // Enable game buttons
        gameInProgress = true;
        hitButton.disabled = false;
        standButton.disabled = false;
        dealButton.disabled = true;
    });
    
    // Hit button
    hitButton.addEventListener('click', async function() {
        if (!gameInProgress) return;
        
        dealCard(playerHand, playerCards);
        updateScores();
        
        // Check if player busts
        if (calculateScore(playerHand) > 21) {
            await endGame();
        }
    });
    
    // Stand button
    standButton.addEventListener('click', async function() {
        if (!gameInProgress) return;
        
        // Reveal dealer's first card
        const dealerFirstCard = dealerCards.querySelector('.card');
        dealerFirstCard.innerHTML = createCardHTML(dealerHand[0].value, dealerHand[0].suit);
        dealerFirstCard.classList.add(dealerHand[0].suit === '♥' || dealerHand[0].suit === '♦' ? 'red' : 'black');
        
        // Update dealer score
        dealerScore.textContent = calculateScore(dealerHand);
        
        // Dealer draws until 17 or higher
        while (calculateScore(dealerHand) < 17) {
            dealCard(dealerHand, dealerCards);
            updateScores();
        }
        
        await endGame();
    });
    
    // PLINKO GAME
    const plinkoCanvas = document.getElementById('plinko-canvas');
    const ctx = plinkoCanvas.getContext('2d');
    const plinkoRowsInput = document.getElementById('plinko-rows');
    const rowsValue = document.getElementById('rows-value');
    const plinkoDecreaseBtn = document.getElementById('plinko-decrease-bet');
    const plinkoIncreaseBtn = document.getElementById('plinko-increase-bet');
    const plinkoBetAmountEl = document.getElementById('plinko-bet-amount');
    const dropButton = document.getElementById('drop-button');
    const plinkoResult = document.getElementById('plinko-result');
    const plinkoMultipliersEl = document.getElementById('plinko-multipliers');
    
    let plinkoRows = 12;
    let plinkoCurrentBet = minBet;
    let pegRadius = 5;
    let ballRadius = 8;
    let pegSpacing = 40;
    let pegs = [];
    let balls = [];
    let multipliers = [];
    let dropInProgress = false;
    
    // Initialize plinko board
    initializePlinko();
    
    // Update rows value display
    plinkoRowsInput.addEventListener('input', function() {
        plinkoRows = parseInt(this.value);
        rowsValue.textContent = plinkoRows;
        initializePlinko();
    });
    
    // Update bet amount for plinko
    plinkoDecreaseBtn.addEventListener('click', function() {
        if (plinkoCurrentBet > minBet && !dropInProgress) {
            plinkoCurrentBet = Math.max(minBet, plinkoCurrentBet - minBet);
            plinkoBetAmountEl.textContent = plinkoCurrentBet.toFixed(2);
        }
    });
    
    plinkoIncreaseBtn.addEventListener('click', function() {
        if (plinkoCurrentBet < maxBet && !dropInProgress) {
            plinkoCurrentBet = Math.min(maxBet, plinkoCurrentBet + minBet);
            plinkoBetAmountEl.textContent = plinkoCurrentBet.toFixed(2);
        }
    });
    
    // Drop ball button
    dropButton.addEventListener('click', async function() {
        if (dropInProgress) return;
        
        // Check if user can afford the bet
        if (useAmina) {
            if (!peraWallet.isConnected()) {
                alert("Please connect your wallet first.");
                return;
            }
            
            const account = peraWallet.getAccounts()[0];
            const balance = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
            
            if (parseFloat(balance) < plinkoCurrentBet) {
                alert("Not enough Amina coins.");
                return;
            }
            
            // Place bet (send to house)
            try {
                const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, plinkoCurrentBet, AMINA_ASSET_ID);
                walletBalance.textContent = `${result.balance} Amina`;
            } catch (error) {
                console.error("Failed to place bet:", error);
                alert("Failed to place bet. Please try again.");
                return;
            }
        } else {
            if (houseCoins < plinkoCurrentBet) {
                alert("Not enough House Coins.");
                return;
            }
            houseCoins -= plinkoCurrentBet;
            updateBalanceDisplay();
        }
        
        dropInProgress = true;
        plinkoResult.textContent = "";
        
        // Create a new ball at a random position at the top
        const boardWidth = plinkoCanvas.width;
        const startX = boardWidth / 2 + (Math.random() * 40 - 20); // Random start position
        
        const ball = {
            x: startX,
            y: ballRadius,
            velocityX: 0,
            velocityY: 0,
            radius: ballRadius
        };
        
        balls.push(ball);
        
        // Play plinko sound
        plinkoSound.currentTime = 0;
        plinkoSound.play();
        
        // Animation loop is handled by the updatePlinko function
        
        // Allow the ball to drop and detect the multiplier
        setTimeout(async () => {
            const multiplierIndex = Math.floor(ball.x / (plinkoCanvas.width / multipliers.length));
            const multiplier = multipliers[Math.min(multiplierIndex, multipliers.length - 1)];
            
            const winAmount = plinkoCurrentBet * multiplier;
            
            // Display result
            plinkoResult.textContent = `You won ${winAmount.toFixed(2)}!`;
            
            // Award winnings
            if (multiplier > 0) {
                // Play win sound
                winSound.currentTime = 0;
                winSound.play();
                
                if (useAmina) {
                    const account = peraWallet.getAccounts()[0];
                    try {
                        const txResult = await peraWallet.receiveAssets(account, winAmount, AMINA_ASSET_ID);
                        walletBalance.textContent = `${txResult.balance} Amina`;
                    } catch (error) {
                        console.error("Failed to receive winnings:", error);
                        alert("Failed to receive winnings. Please try again.");
                    }
                } else {
                    houseCoins += winAmount;
                    updateBalanceDisplay();
                }
            }
            
            balls = []; // Clear all balls
            dropInProgress = false;
            
            // Redraw the board
            drawPlinkoBoard();
        }, 5000); // Wait 5 seconds for the ball to drop
    });
    
    // Resize canvas when window is resized
    window.addEventListener('resize', function() {
        initializePlinko();
    });
    
    // Animation loop for Plinko
    function updatePlinko() {
        // Clear canvas
        ctx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
        
        // Draw pegs
        drawPlinkoBoard();
        
        // Update ball positions and check for collisions
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            
            // Apply gravity
            ball.velocityY += 0.2;
            
            // Apply friction
            ball.velocityX *= 0.99;
            
            // Update position
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
            
            // Check for wall collisions
            if (ball.x < ball.radius) {
                ball.x = ball.radius;
                ball.velocityX = -ball.velocityX * 0.8;
            } else if (ball.x > plinkoCanvas.width - ball.radius) {
                ball.x = plinkoCanvas.width - ball.radius;
                ball.velocityX = -ball.velocityX * 0.8;
            }
            
            // Check for bottom collision
            if (ball.y > plinkoCanvas.height - ball.radius) {
                ball.y = plinkoCanvas.height - ball.radius;
                ball.velocityY = -ball.velocityY * 0.2;
                ball.velocityX *= 0.8;
            }
            
            // Check for peg collisions
            for (let j = 0; j < pegs.length; j++) {
                const peg = pegs[j];
                const dx = ball.x - peg.x;
                const dy = ball.y - peg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball.radius + peg.radius) {
                    // Collision detected
                    
                    // Calculate collision normal
                    const nx = dx / distance;
                    const ny = dy / distance;
                    
                    // Calculate relative velocity
                    const relVelX = ball.velocityX;
                    const relVelY = ball.velocityY;
                    
                    // Calculate relative velocity in terms of the normal direction
                    const relVelDotNormal = relVelX * nx + relVelY * ny;
                    
                    // Do not resolve if velocities are separating
                    if (relVelDotNormal > 0) continue;
                    
                    // Calculate restitution (bounciness)
                    const restitution = 0.7;
                    
                    // Calculate impulse scalar
                    let impulse = -(1 + restitution) * relVelDotNormal;
                    impulse /= 1; // This would be (1/massA + 1/massB) for more complex physics
                    
                    // Apply impulse
                    ball.velocityX += impulse * nx;
                    ball.velocityY += impulse * ny;
                    
                    // Play plinko sound on collision
                    plinkoSound.currentTime = 0;
                    plinkoSound.play();
                    
                    // Add a bit of randomness to make it more interesting
                    ball.velocityX += (Math.random() - 0.5) * 0.5;
                }
            }
            
            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'gold';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath
            // ===== AMINA CASINO - MAIN GAME LOGIC =====

// Global State
let gameState = {
    useAmina: false,
    houseCoins: 1000,
    dailyBonusReceived: false,
    lastBonusDate: null,
    musicPlaying: false,
    currentGame: 'slots'
};

// Game configurations
const SLOTS_SYMBOLS = ['🚀', '👽', '🌌', '⭐', '🪐'];
const SLOTS_PAYOUTS = {
    '🚀': 10,
    '👽': 8,
    '🌌': 5,
    '⭐': 3,
    '🪐': 2
};

// DOM Elements
let elements = {};

// Initialize casino when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCasino();
});

function initializeCasino() {
    console.log('🎰 Initializing Amina Casino...');
    
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize games
    initializeSlots();
    initializeBlackjack();
    initializePlinko();
    
    // Setup daily bonus
    checkDailyBonus();
    
    // Update displays
    updateBalanceDisplay();
    
    console.log('✨ Casino initialized successfully!');
}

function cacheElements() {
    elements = {
        // Header elements
        connectWalletBtn: document.getElementById('connect-wallet'),
        walletInfo: document.getElementById('wallet-info'),
        walletAddress: document.getElementById('wallet-address'),
        walletBalance: document.getElementById('wallet-balance'),
        currencyToggle: document.getElementById('currency-toggle'),
        houseBalance: document.getElementById('house-balance'),
        musicToggle: document.getElementById('music-toggle'),
        
        // Game navigation
        gameTabs: document.querySelectorAll('.game-tab'),
        gamePanels: document.querySelectorAll('.game-panel'),
        
        // Slots elements
        reels: [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ],
        slotsBetDown: document.getElementById('slots-bet-down'),
        slotsBetUp: document.getElementById('slots-bet-up'),
        slotsBet: document.getElementById('slots-bet'),
        spinBtn: document.getElementById('spin-btn'),
        slotsResult: document.getElementById('slots-result'),
        
        // Blackjack elements
        dealerCards: document.getElementById('dealer-cards'),
        playerCards: document.getElementById('player-cards'),
        dealerScore: document.getElementById('dealer-score'),
        playerScore: document.getElementById('player-score'),
        bjBetDown: document.getElementById('bj-bet-down'),
        bjBetUp: document.getElementById('bj-bet-up'),
        bjBet: document.getElementById('bj-bet'),
        dealBtn: document.getElementById('deal-btn'),
        hitBtn: document.getElementById('hit-btn'),
        standBtn: document.getElementById('stand-btn'),
        bjResult: document.getElementById('bj-result'),
        
        // Plinko elements
        plinkoRows: document.getElementById('plinko-rows'),
        rowsDisplay: document.getElementById('rows-display'),
        plinkoBetDown: document.getElementById('plinko-bet-down'),
        plinkoBetUp: document.getElementById('plinko-bet-up'),
        plinkoBet: document.getElementById('plinko-bet'),
        dropBtn: document.getElementById('drop-btn'),
        plinkoCanvas: document.getElementById('plinko-canvas'),
        multipliersDisplay: document.getElementById('multipliers-display'),
        plinkoResult: document.getElementById('plinko-result'),
        
        // Modal elements
        donateBtn: document.getElementById('donate-btn'),
        donationModal: document.getElementById('donation-modal'),
        closeModal: document.getElementById('close-modal'),
        donationAmount: document.getElementById('donation-amount'),
        confirmDonation: document.getElementById('confirm-donation'),
        
        // Audio elements
        bgMusic: document.getElementById('bg-music'),
        winSound: document.getElementById('win-sound'),
        spinSound: document.getElementById('spin-sound')
    };
}

function setupEventListeners() {
    // Wallet connection
    elements.connectWalletBtn.addEventListener('click', handleWalletConnection);
    
    // Currency toggle
    elements.currencyToggle.addEventListener('change', handleCurrencyToggle);
    
    // Music control
    elements.musicToggle.addEventListener('click', toggleMusic);
    
    // Game navigation
    elements.gameTabs.forEach(tab => {
        tab.addEventListener('click', () => switchGame(tab.dataset.game));
    });
    
    // Slots controls
    elements.slotsBetDown.addEventListener('click', () => adjustBet('slots', -0.25));
    elements.slotsBetUp.addEventListener('click', () => adjustBet('slots', 0.25));
    elements.spinBtn.addEventListener('click', playSlots);
    
    // Blackjack controls
    elements.bjBetDown.addEventListener('click', () => adjustBet('blackjack', -0.25));
    elements.bjBetUp.addEventListener('click', () => adjustBet('blackjack', 0.25));
    elements.dealBtn.addEventListener('click', dealBlackjack);
    elements.hitBtn.addEventListener('click', hitBlackjack);
    elements.standBtn.addEventListener('click', standBlackjack);
    
    // Plinko controls
    elements.plinkoRows.addEventListener('input', updatePlinkoRows);
    elements.plinkoBetDown.addEventListener('click', () => adjustBet('plinko', -0.25));
    elements.plinkoBetUp.addEventListener('click', () => adjustBet('plinko', 0.25));
    elements.dropBtn.addEventListener('click', playPlinko);
    
    // Donation modal
    elements.donateBtn.addEventListener('click', openDonationModal);
    elements.closeModal.addEventListener('click', closeDonationModal);
    elements.confirmDonation.addEventListener('click', processDonation);
    
    // Close modal when clicking outside
    elements.donationModal.addEventListener('click', (e) => {
        if (e.target === elements.donationModal) {
            closeDonationModal();
        }
    });
}

// ===== WALLET FUNCTIONS =====

async function handleWalletConnection() {
    try {
        elements.connectWalletBtn.textContent = 'Connecting...';
        elements.connectWalletBtn.disabled = true;
        
        const account = await window.AlgorandWallet.connect();
        const balance = await window.AlgorandWallet.getBalance();
        
        // Update UI
        elements.walletAddress.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
        elements.walletBalance.textContent = `${balance.toFixed(2)} Amina`;
        
        elements.connectWalletBtn.classList.add('hidden');
        elements.walletInfo.classList.remove('hidden');
        
        showNotification('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        showNotification('Failed to connect wallet. Please try again.', 'error');
        elements.connectWalletBtn.textContent = 'Connect Wallet';
        elements.connectWalletBtn.disabled = false;
    }
}

function handleCurrencyToggle() {
    gameState.use