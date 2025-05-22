// Index.js  
  
// Game state variables  
let isSpinning = false;  
let currentBet = 10;  
  
// Slot machine symbols and payouts  
const symbols = ['🚀', '🌟', '🌍', '🌙', '👾', '🛸'];  
const payouts = {  
    '🚀🚀🚀': 50,  
    '🌟🌟🌟': 30,  
    '🌍🌍🌍': 20,  
    '🌙🌙🌙': 15,  
    '👾👾👾': 10,  
    '🛸🛸🛸': 5  
};  
  
// Exchange rates  
const ALGO_TO_AMINA = 10;  
const AMINA_TO_ALGO = 0.1;  
  
function exchangeCoins() {  
    const amount = parseInt($('exchangeAmount').value);  
    const type = $('exchangeType').value;  
      
    if (isNaN(amount) || amount <= 0) {  
        alert('Please enter a valid amount');  
        return;  
    }  
  
    if (type === 'algoToAmina') {  
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
  
// Slot machine animation  
function animateReel(reelId, duration) {  
    const reel = $(reelId);  
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
  
// Roulette wheel animation  
function spinRouletteWheel() {  
    const wheel = document.querySelector('.roulette-wheel');  
    const spins = 5 + Math.random() * 5;  
    const duration = 3000;  
      
    wheel.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;  
    wheel.style.transform = `rotate(${spins * 360}deg)`;  
      
    return new Promise(resolve => setTimeout(resolve, duration));  
}  
  
// Card deck management  
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
    shuffleDeck();  
}  
  
function shuffleDeck() {  
    for (let i = deck.length - 1; i > 0; i--) {  
        const j = Math.floor(Math.random() * (i + 1));  
        [deck[i], deck[j]] = [deck[j], deck[i]];  
    }  
}  
  
function drawCard() {  
    if (deck.length === 0) createDeck();  
    return deck.pop();  
}  
  
// Event listeners  
document.addEventListener('DOMContentLoaded', () => {  
    createDeck();  
    updateBalances();  
      
    // Add event listeners for bet inputs  
    ['slotBet', 'rouletteBet', 'blackjackBet'].forEach(id => {  
        const input = $(id);  
        input.addEventListener('change', () => {  
            const value = parseInt(input.value);  
            if (value < 10) input.value = 10;  
            if (value > 1000) input.value = 1000;  
        });  
    });  
});  