// index.js

// Game state variables
let isSpinning = false;
let currentBet = 10;

// Slot machine symbols and payouts
const symbols = ['🚀', '🌟', '🌍', '🌙', '👾', '✈️'];
const payouts = {
    '🚀🚀🚀': 50,
    '🌟🌟🌟': 30,
    '🌍🌍🌍': 20,
    '🌙🌙🌙': 15,
    '👾👾👾': 10,
    '✈️✈️✈️': 5
};

// Exchange rates
const ALGO_TO_AMINA = 10;
const AMINA_TO_ALGO = 0.1;

// Function to handle coin exchanges
function exchangeCoins() {
    const amount = parseInt(document.getElementById('exchange-amount').value);
    const type = document.getElementById('exchange-direction').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (type === 'algo-to-amina') {
        if (algoBalance >= amount) {
            algoBalance -= amount;
            aminaBalance += amount * ALGO_TO_AMINA;
        } else {
            alert('Insufficient ALGO balance');
            return;
        }
    } else {
        if (aminaBalance >= amount) {
            aminaBalance -= amount;
            algoBalance += amount * AMINA_TO_ALGO;
        } else {
            alert('Insufficient AMINA balance');
            return;
        }
    }

    updateBalances();
}

// Function to animate slot reels
function animateReel(reelId, duration) {
    const reel = document.getElementById(reelId);
    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;

        if (elapsed < duration) {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            requestAnimationFrame(animate);
        }
    }

    return new Promise(resolve => {
        requestAnimationFrame(animate);
        setTimeout(resolve, duration);
    });
}

// Function to spin the roulette wheel
function spinRouletteWheel() {
    const wheel = document.querySelector('.roulette-wheel');
    const spins = 5 + Math.random() * 5;
    const duration = 3000;

    wheel.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    wheel.style.transform = `rotate(${spins * 360}deg)`;

    return new Promise(resolve => setTimeout(resolve, duration));
}

// Function to create a card deck for Blackjack
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Function to update balances
function updateBalances() {
    document.getElementById('amina-balance').textContent = aminaBalance;
    document.getElementById('algo-balance').textContent = algoBalance;
}

// Event listeners for UI actions
document.getElementById('spin-slots').addEventListener('click', async () => {
    if (isSpinning) return;
    isSpinning = true;

    const bet = parseInt(document.getElementById('slot-bet').value);
    if (isNaN(bet) || bet <= 0 || bet > aminaBalance) {
        alert('Invalid bet!');
        isSpinning = false;
        return;
    }

    aminaBalance -= bet;
    updateBalances();

    await Promise.all([
        animateReel('reel1', 1000),
        animateReel('reel2', 1200),
        animateReel('reel3', 1400)
    ]);

    // Check result
    const reel1 = document.getElementById('reel1').textContent;
    const reel2 = document.getElementById('reel2').textContent;
    const reel3 = document.getElementById('reel3').textContent;
    const result = reel1 + reel2 + reel3;

    if (payouts[result]) {
        const winnings = bet * payouts[result];
        aminaBalance += winnings;
        alert(`You won ${winnings} AMINA!`);
    } else {
        alert('Better luck next time!');
    }

    updateBalances();
    isSpinning = false;
});

document.getElementById('execute-exchange').addEventListener('click', exchangeCoins);

// Initialize balances
let aminaBalance = 1000;
let algoBalance = 100;
updateBalances();