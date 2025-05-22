// Scripts.js  
  
// Utility functions for DOM  
function $(id) {  
    return document.getElementById(id);  
}  
  
// Navigation between games  
function showGame(game) {  
    const games = ['slots', 'roulette', 'blackjack', 'missions'];  
    games.forEach(g => {  
        document.getElementById(g).classList.remove('active');  
        document.getElementById(g + 'Tab').classList.remove('active');  
    });  
    document.getElementById(game).classList.add('active');  
    document.getElementById(game + 'Tab').classList.add('active');  
}  
  
// Wallet and balance logic  
let aminaBalance = 1000;  
let algoBalance = 100;  
  
function updateBalances() {  
    $('aminaBalance').textContent = aminaBalance;  
    $('algoBalance').textContent = algoBalance;  
}  
  
// Exchange logic  
function exchangeCoins() {  
    const amount = parseInt($('exchangeAmount').value, 10);  
    const type = $('exchangeType').value;  
    if (isNaN(amount) || amount <= 0) {  
        alert('Enter a valid amount!');  
        return;  
    }  
    if (type === 'algoToAmina') {  
        if (algoBalance >= amount) {  
            algoBalance -= amount;  
            aminaBalance += amount * 10;  
        } else {  
            alert('Not enough ALGO!');  
            return;  
        }  
    } else {  
        if (aminaBalance >= amount) {  
            aminaBalance -= amount;  
            algoBalance += Math.floor(amount / 10);  
        } else {  
            alert('Not enough AMINA!');  
            return;  
        }  
    }  
    updateBalances();  
}  
  
// Slots logic  
const slotSymbols = ['🚀', '🌟', '🌍', '🪐', '👽', '💫'];  
function spinSlots() {  
    const bet = parseInt($('slotBet').value, 10);  
    if (isNaN(bet) || bet < 10 || bet > aminaBalance) {  
        $('slotResult').textContent = 'Invalid bet!';  
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
        const win = bet * 10;  
        aminaBalance += win;  
        result = 'JACKPOT! You win ' + win + ' AMINA!';  
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {  
        const win = bet * 2;  
        aminaBalance += win;  
        result = 'Nice! You win ' + win + ' AMINA!';  
    }  
    updateBalances();  
    $('slotResult').textContent = result;  
}  
  
// Roulette logic  
let rouletteBetColor = 'red';  
function placeBet(color) {  
    rouletteBetColor = color;  
}  
function spinRoulette() {  
    const bet = parseInt($('rouletteBet').value, 10);  
    if (isNaN(bet) || bet < 10 || bet > aminaBalance) {  
        $('rouletteResult').textContent = 'Invalid bet!';  
        return;  
    }  
    aminaBalance -= bet;  
    updateBalances();  
    const colors = ['red', 'black', 'green'];  
    const resultColor = colors[Math.floor(Math.random() * colors.length)];  
    let result = 'It landed on ' + resultColor + '. ';  
    if (resultColor === rouletteBetColor) {  
        let win = bet * (resultColor === 'green' ? 14 : 2);  
        aminaBalance += win;  
        result += 'You win ' + win + ' AMINA!';  
    } else {  
        result += 'You lost!';  
    }  
    updateBalances();  
    $('rouletteResult').textContent = result;  
}  
  
// Blackjack logic  
let playerHand = [];  
let dealerHand = [];  
let blackjackBet = 0;  
function startBlackjack() {  
    blackjackBet = parseInt($('blackjackBet').value, 10);  
    if (isNaN(blackjackBet) || blackjackBet < 10 || blackjackBet > aminaBalance) {  
        $('blackjackResult').textContent = 'Invalid bet!';  
        return;  
    }  
    aminaBalance -= blackjackBet;  
    updateBalances();  
    playerHand = [drawCard(), drawCard()];  
    dealerHand = [drawCard(), drawCard()];  
    renderHands();  
    $('blackjackResult').textContent = '';  
}  
function drawCard() {  
    const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];  
    const suits = ['♠', '♥', '♦', '♣'];  
    return {  
        rank: ranks[Math.floor(Math.random() * ranks.length)],  
        suit: suits[Math.floor(Math.random() * suits.length)]  
    };  
}  
function handValue(hand) {  
    let value = 0, aces = 0;  
    hand.forEach(card => {  
        if (typeof card.rank === 'number') value += card.rank;  
        else if (card.rank === 'A') { value += 11; aces++; }  
        else value += 10;  
    });  
    while (value > 21 && aces) { value -= 10; aces--; }  
    return value;  
}  
function renderHands() {  
    $('playerCards').innerHTML = playerHand.map(card =>   
        '<div class=\"card\">' + card.rank + card.suit + '</div>').join('');  
    $('dealerCards').innerHTML = dealerHand.map(card =>   
        '<div class=\"card\">' + card.rank + card.suit + '</div>').join('');  
}  
function hit() {  
    if (!playerHand.length) return;  
    playerHand.push(drawCard());  
    renderHands();  
    if (handValue(playerHand) > 21) {  
        $('blackjackResult').textContent = 'Bust! You lose!';  
        playerHand = [];  
        dealerHand = [];  
    }  
}  
function stand() {  
    if (!playerHand.length) return;  
    while (handValue(dealerHand) < 17) dealerHand.push(drawCard());  
    renderHands();  
    const playerVal = handValue(playerHand);  
    const dealerVal = handValue(dealerHand);  
    let result = '';  
    if (dealerVal > 21 || playerVal > dealerVal) {  
        aminaBalance += blackjackBet * 2;  
        result = 'You win!';  
    } else if (playerVal === dealerVal) {  
        aminaBalance += blackjackBet;  
        result = 'Push!';  
    } else {  
        result = 'Dealer wins!';  
    }  
    updateBalances();  
    $('blackjackResult').textContent = result;  
    playerHand = [];  
    dealerHand = [];  
}  
  
// Missions (placeholder)  
function loadMissions() {  
    document.querySelector('.missions-grid').innerHTML = '<div class=\"mission-card\">Complete a spin to earn 50 AMINA!</div>';  
}  
  
// Wallet connect (placeholder)  
document.getElementById('connectWallet').onclick = function() {  
    alert('Wallet connection is a placeholder in this demo.');  
};  
  
// Show/hide exchange panel  
document.querySelector('.wallet-section').onclick = function() {  
    document.getElementById('conversionPanel').classList.toggle('active');  
};  
  
// Initial setup  
window.onload = function() {  
    updateBalances();  
    loadMissions();  
    showGame('slots');  
};  