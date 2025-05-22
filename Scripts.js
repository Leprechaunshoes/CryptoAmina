// scripts.js

// Utility function for DOM interactions
function $(id) {
    return document.getElementById(id);
}

// Function to show and switch between game sections
function showGame(game) {
    const games = ['slots', 'roulette', 'blackjack', 'missions'];
    games.forEach(g => {
        document.getElementById(g).classList.remove('active');
        document.getElementById(g + '-tab').classList.remove('active');
    });
    document.getElementById(game).classList.add('active');
    document.getElementById(game + '-tab').classList.add('active');
}

// Initialize wallet balances
let aminaBalance = 1000;
let algoBalance = 100;

// Function to update the displayed balances
function updateBalances() {
    $('amina-balance').textContent = aminaBalance;
    $('algo-balance').textContent = algoBalance;
}

// Function to handle currency exchange logic
function exchangeCoins() {
    const amount = parseInt($('exchange-amount').value, 10);
    const type = $('exchange-direction').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Enter a valid amount!');
        return;
    }

    if (type === 'algo-to-amina') {
        if (algoBalance >= amount) {
            algoBalance -= amount;
            aminaBalance += amount * 10; // Exchange rate: 1 ALGO = 10 AMINA
        } else {
            alert('Not enough ALGO!');
            return;
        }
    } else {
        if (aminaBalance >= amount) {
            aminaBalance -= amount;
            algoBalance += Math.floor(amount / 10); // Exchange rate: 10 AMINA = 1 ALGO
        } else {
            alert('Not enough AMINA!');
            return;
        }
    }

    updateBalances();
}

// Functionality for spinning the slot machine
const slotSymbols = ['🚀', '🌟', '🌍', '👾', '✈️', '💫'];

function spinSlots() {
    const bet = parseInt($('slot-bet').value, 10);

    if (isNaN(bet) || bet < 10 || bet > aminaBalance) {
        $('slot-result').textContent = 'Invalid bet!';
        return;
    }

    aminaBalance -= bet;
    updateBalances();

    const reels = [1, 2, 3].map(i => {
        const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        $('reel' + i).textContent = symbol;
        return symbol;
    });

    let result = 'Try again!';
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
        const win = bet * 10; // Jackpot multiplier
        aminaBalance += win;
        result = 'JACKPOT! You win ' + win + ' AMINA!';
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        const win = bet * 2; // Partial win multiplier
        aminaBalance += win;
        result = 'Nice! You win ' + win + ' AMINA!';
    }

    updateBalances();
    $('slot-result').textContent = result;
}

// Roulette game logic
let rouletteBetColor = 'red';

function placeBet(color) {
    rouletteBetColor = color;
}

function spinRoulette() {
    const winningColor = Math.random() > 0.5 ? 'red' : 'black';

    if (rouletteBetColor === winningColor) {
        alert(`You win! The color is ${winningColor}`);
    } else {
        alert(`You lose! The color is ${winningColor}`);
    }
}

// Initialize event listeners
document.getElementById('spin-slots').addEventListener('click', spinSlots);
document.getElementById('execute-exchange').addEventListener('click', exchangeCoins);

// Update balances on page load
updateBalances();