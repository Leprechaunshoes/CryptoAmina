// Casino Games - Clean and Simple
document.addEventListener('DOMContentLoaded', function() {
// Navigation
document.querySelectorAll('.nav-btn:not(.donation-btn)').forEach(btn => {
btn.addEventListener('click', () => switchGame(btn.dataset.game));
});
document.querySelectorAll('.game-card').forEach(card => {
card.addEventListener('click', () => switchGame(card.dataset.game));
});

// Initialize games
initSlots();
initPlinko();
initBlackjack();
initHiLo();
initDice();
});

function switchGame(game) {
document.querySelectorAll('.game-screen, .nav-btn').forEach(el => el.classList.remove('active'));
document.getElementById(game).classList.add('active');
document.querySelector(`[data-game="${game}"]`).classList.add('active');
}

function showResult(gameId, message, type) {
const result = document.getElementById(gameId + 'Result');
result.textContent = message;
result.className = `game-result show ${type}`;
setTimeout(() => result.classList.remove('show'), 4000);
}

// SLOTS GAME
let slotSymbols = ['⭐', '🌟', '💫', '🌌', '🪐', '🌙', '☄️', '🚀'];

function initSlots() {
const grid = document.getElementById('slotsGrid');
grid.innerHTML = '';
for(let i = 0; i < 15; i++) {
const reel = document.createElement('div');
reel.className = 'slot-reel';
reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
grid.appendChild(reel);
}

document.getElementById('spinBtn').onclick = spinSlots;
}

function spinSlots() {
const bet = +document.getElementById('slotsBet').value;
if(!deductBalance(bet)) return;

const btn = document.getElementById('spinBtn');
const reels = document.querySelectorAll('.slot-reel');
btn.disabled = true;
btn.textContent = 'SPINNING...';

reels.forEach(reel => reel.classList.add('spinning'));

setTimeout(() => {
const results = [];
reels.forEach(reel => {
reel.classList.remove('spinning');
const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
reel.textContent = symbol;
results.push(symbol);
});

const win = calculateSlotWin(results, bet);
if(win > 0) {
addBalance(win);
showResult('slots', `🌟 WIN! +${win} ${currentCurrency}`, 'win');
} else {
showResult('slots', 'Try again!', 'lose');
}

btn.disabled = false;
btn.textContent = 'SPIN';
}, 1500);
}

function calculateSlotWin(results, bet) {
const rows = [
[results[0], results[1], results[2], results[3], results[4]],
[results[5], results[6], results[7], results[8], results[9]],
[results[10], results[11], results[12], results[13], results[14]]
];

let totalWin = 0;
rows.forEach(row => {
const counts = {};
row.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
Object.values(counts).forEach(count => {
if(count >= 5) totalWin += bet * 100;
else if(count >= 4) totalWin += bet * 25;
else if(count >= 3) totalWin += bet * 5;
});
});
return totalWin;
}

// PLINKO GAME
let plinkoDropping = false;
let plinkoCtx, plinkoPegs;

function initPlinko() {
const canvas = document.getElementById('plinkoCanvas');
canvas.width = window.innerWidth < 768 ? 320 : 400;
canvas.height = window.innerWidth < 768 ? 280 : 350;
plinkoCtx = canvas.getContext('2d');
setupPegs();
drawPlinkoBoard();
document.getElementById('dropBtn').onclick = dropPlinko;
}

function setupPegs() {
plinkoPegs = [];
const width = plinkoCtx.canvas.width;
for(let row = 0; row < 10; row++) {
const pegsInRow = row + 3;
const spacing = width * 0.75 / (pegsInRow + 1);
const startX = (width - width * 0.75) / 2;
for(let i = 0; i < pegsInRow; i++) {
plinkoPegs.push({
x: startX + spacing * (i + 1),
y: 35 + row * 20,
r: 2.5
});
}
}
}

function drawPlinkoBoard() {
const ctx = plinkoCtx;
const canvas = ctx.canvas;
ctx.fillStyle = '#1a2332';
ctx.fillRect(0, 0, canvas.width, canvas.height);
plinkoPegs.forEach(peg => {
ctx.beginPath();
ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
ctx.fillStyle = '#4a5568';
ctx.fill();
});
}

function dropPlinko() {
if(plinkoDropping) return;
const bet = +document.getElementById('plinkoBet').value;
if(!deductBalance(bet)) return;

plinkoDropping = true;
const btn = document.getElementById('dropBtn');
btn.disabled = true;
btn.textContent = 'DROPPING...';

animateBall().then(slot => {
const multipliers = [10, 3, 1.5, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.5, 3, 10];
const multiplier = multipliers[slot] || 0.5;
const winAmount = bet * multiplier;
addBalance(winAmount);
showResult('plinko', `Hit ${multiplier}x! Won ${winAmount.toFixed(2)} ${currentCurrency}`, 'win');

plinkoDropping = false;
btn.disabled = false;
btn.textContent = 'DROP BALL';
});
}

function animateBall() {
return new Promise(resolve => {
const canvas = plinkoCtx.canvas;
const ball = {x: canvas.width / 2, y: 15, vx: 0, vy: 0, r: 4};

function animate() {
drawPlinkoBoard();
ball.vy += 0.2;
ball.x += ball.vx;
ball.y += ball.vy;

plinkoPegs.forEach(peg => {
const dx = ball.x - peg.x;
const dy = ball.y - peg.y;
const distance = Math.sqrt(dx * dx + dy * dy);
if(distance < ball.r + peg.r) {
const angle = Math.atan2(dy, dx);
ball.x = peg.x + Math.cos(angle) * (ball.r + peg.r + 1);
ball.y = peg.y + Math.sin(angle) * (ball.r + peg.r + 1);
ball.vx += (Math.random() - 0.5) * 0.8;
ball.vy = Math.abs(ball.vy) * 0.3 + 0.3;
}
});

if(ball.x < ball.r) {ball.x = ball.r; ball.vx = Math.abs(ball.vx) * 0.5;}
if(ball.x > canvas.width - ball.r) {ball.x = canvas.width - ball.r; ball.vx = -Math.abs(ball.vx) * 0.5;}

plinkoCtx.beginPath();
plinkoCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
plinkoCtx.fillStyle = '#48bb78';
plinkoCtx.fill();

if(ball.y > canvas.height - 30) {
let slot = Math.floor(ball.x / (canvas.width / 13));
slot = Math.max(0, Math.min(12, slot));
resolve(slot);
} else {
requestAnimationFrame(animate);
}
}
animate();
});
}

// BLACKJACK GAME
let blackjackDeck = [];
let playerHand = [];
let dealerHand = [];
let blackjackActive = false;
let blackjackBet = 0;

function initBlackjack() {
createDeck();
document.getElementById('dealBtn').onclick = dealBlackjack;
document.getElementById('hitBtn').onclick = hitBlackjack;
document.getElementById('standBtn').onclick = standBlackjack;
document.getElementById('newGameBtn').onclick = newBlackjackGame;
}

function createDeck() {
blackjackDeck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
suits.forEach(suit => {
values.forEach(value => {
blackjackDeck.push({value, suit});
});
});
for(let i = blackjackDeck.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[blackjackDeck[i], blackjackDeck[j]] = [blackjackDeck[j], blackjackDeck[i]];
}
}

function dealBlackjack() {
const bet = +document.getElementById('blackjackBet').value;
if(!deductBalance(bet)) return;

blackjackBet = bet;
playerHand = [blackjackDeck.pop(), blackjackDeck.pop()];
dealerHand = [blackjackDeck.pop(), blackjackDeck.pop()];
blackjackActive = true;
updateBlackjackDisplay();

document.getElementById('dealBtn').disabled = true;
document.getElementById('hitBtn').disabled = false;
document.getElementById('standBtn').disabled = false;
}

function hitBlackjack() {
if(!blackjackActive) return;
playerHand.push(blackjackDeck.pop());
updateBlackjackDisplay();
if(getHandValue(playerHand) > 21) {
endBlackjack('💥 Bust!', 0, 'lose');
}
}

function standBlackjack() {
if(!blackjackActive) return;
while(getHandValue(dealerHand) < 17) {
dealerHand.push(blackjackDeck.pop());
}
updateBlackjackDisplay(true);

const playerValue = getHandValue(playerHand);
const dealerValue = getHandValue(dealerHand);

if(dealerValue > 21) {
endBlackjack('🎉 Dealer busts!', blackjackBet * 2, 'win');
} else if(playerValue > dealerValue) {
endBlackjack('🎉 You win!', blackjackBet * 2, 'win');
} else if(playerValue < dealerValue) {
endBlackjack('😔 Dealer wins!', 0, 'lose');
} else {
endBlackjack('🤝 Push!', blackjackBet, 'win');
}
}

function getHandValue(hand) {
let value = 0;
let aces = 0;
hand.forEach(card => {
if(card.value === 'A') {
aces++;
value += 11;
} else if(['J', 'Q', 'K'].includes(card.value)) {
value += 10;
} else {
value += parseInt(card.value);
}
});
while(value > 21 && aces > 0) {
value -= 10;
aces--;
}
return value;
}

function updateBlackjackDisplay(showDealerCards = false) {
displayHand('player', playerHand, true);
displayHand('dealer', dealerHand, showDealerCards || !blackjackActive);
document.getElementById('playerScore').textContent = getHandValue(playerHand);
document.getElementById('dealerScore').textContent = 
showDealerCards || !blackjackActive ? getHandValue(dealerHand) : getHandValue([dealerHand[0]]);
}

function displayHand(player, hand, showAll) {
const container = document.getElementById(player + 'Cards');
container.innerHTML = '';
hand.forEach((card, index) => {
const cardElement = document.createElement('div');
cardElement.className = 'playing-card';
if(player === 'dealer' && index === 1 && !showAll) {
cardElement.classList.add('back');
cardElement.textContent = '🎭';
} else {
cardElement.innerHTML = `${card.value}<br>${card.suit}`;
if(['♥', '♦'].includes(card.suit)) cardElement.classList.add('red');
}
container.appendChild(cardElement);
});
}

function endBlackjack(message, winAmount, type) {
blackjackActive = false;
if(winAmount > 0) {
addBalance(winAmount);
message += ` +${winAmount} ${currentCurrency}`;
}
showResult('blackjack', message, type);
document.getElementById('hitBtn').disabled = true;
document.getElementById('standBtn').disabled = true;
document.getElementById('newGameBtn').style.display = 'inline-block';
}

function newBlackjackGame() {
createDeck();
document.getElementById('dealBtn').disabled = false;
document.getElementById('newGameBtn').style.display = 'none';
document.getElementById('blackjackResult').classList.remove('show');
document.getElementById('playerCards').innerHTML = '';
document.getElementById('dealerCards').innerHTML = '';
document.getElementById('playerScore').textContent = '0';
document.getElementById('dealerScore').textContent = '0';
}

// HI-LO GAME
let hiloCurrentCard = null;
let hiloCurrentValue = 0;

function initHiLo() {
document.getElementById('hiloDeal').onclick = dealHiLo;
document.getElementById('hiloHigher').onclick = () => guessHiLo('higher');
document.getElementById('hiloLower').onclick = () => guessHiLo('lower');
resetHiLo();
}

function resetHiLo() {
document.getElementById('hiloCard').textContent = '?';
document.getElementById('hiloCardValue').textContent = 'Click Deal to start';
document.getElementById('hiloNext').textContent = '?';
document.getElementById('hiloNextValue').textContent = '';
document.getElementById('hiloDeal').disabled = false;
document.getElementById('hiloHigher').disabled = true;
document.getElementById('hiloLower').disabled = true;
}

function dealHiLo() {
const bet = +document.getElementById('hiloBet').value;
if(!deductBalance(bet)) return;

hiloCurrentCard = getRandomCard();
hiloCurrentValue = getCardValue(hiloCurrentCard);
document.getElementById('hiloCard').textContent = hiloCurrentCard;
document.getElementById('hiloCardValue').textContent = `Value: ${hiloCurrentValue}`;
document.getElementById('hiloDeal').disabled = true;
document.getElementById('hiloHigher').disabled = false;
document.getElementById('hiloLower').disabled = false;
}

function guessHiLo(guess) {
const bet = +document.getElementById('hiloBet').value;
const nextCard = getRandomCard();
const nextValue = getCardValue(nextCard);

document.getElementById('hiloNext').textContent = nextCard;
document.getElementById('hiloNextValue').textContent = `Value: ${nextValue}`;

let won = false;
if(guess === 'higher' && nextValue > hiloCurrentValue) won = true;
if(guess === 'lower' && nextValue < hiloCurrentValue) won = true;

if(won) {
const winAmount = bet * 2;
addBalance(winAmount);
showResult('hilo', `🎉 Correct! +${winAmount} ${currentCurrency}`, 'win');
} else {
showResult('hilo', '❌ Wrong guess!', 'lose');
}

setTimeout(resetHiLo, 2000);
}

function getRandomCard() {
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suit = suits[Math.floor(Math.random() * suits.length)];
const value = values[Math.floor(Math.random() * values.length)];
return value + suit;
}

function getCardValue(card) {
const value = card.slice(0, -1);
if(value === 'A') return 1;
if(['J', 'Q', 'K'].includes(value)) return 11;
return parseInt(value);
}

// DICE GAME
let diceSelectedBet = null;

function initDice() {
document.querySelectorAll('.dice-bet-btn').forEach(btn => {
btn.onclick = () => selectDiceBet(btn.dataset.bet);
});
document.getElementById('diceRoll').onclick = rollDice;
resetDice();
}

function resetDice() {
document.getElementById('dice1').textContent = '⚀';
document.getElementById('dice2').textContent = '⚀';
document.getElementById('diceTotal').textContent = 'Total: 2';
document.getElementById('diceSelected').textContent = 'Select a bet above';
document.getElementById('diceRoll').disabled = true;
document.querySelectorAll('.dice-bet-btn').forEach(btn => btn.classList.remove('selected'));
diceSelectedBet = null;
}

function selectDiceBet(bet) {
diceSelectedBet = bet;
document.querySelectorAll('.dice-bet-btn').forEach(btn => btn.classList.remove('selected'));
document.querySelector(`[data-bet="${bet}"]`).classList.add('selected');
document.getElementById('diceSelected').textContent = `Selected: ${bet.toUpperCase()}`;
document.getElementById('diceRoll').disabled = false;
}

function rollDice() {
if(!diceSelectedBet) return;
const bet = +document.getElementById('diceBet').value;
if(!deductBalance(bet)) return;

const dice1Value = Math.floor(Math.random() * 6) + 1;
const dice2Value = Math.floor(Math.random() * 6) + 1;
const total = dice1Value + dice2Value;

const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
document.getElementById('dice1').textContent = diceSymbols[dice1Value - 1];
document.getElementById('dice2').textContent = diceSymbols[dice2Value - 1];
document.getElementById('diceTotal').textContent = `Total: ${total}`;

let won = false;
let multiplier = 1;

if(diceSelectedBet === 'low' && total >= 2 && total <= 6) {
won = true;
multiplier = 2;
} else if(diceSelectedBet === 'seven' && total === 7) {
won = true;
multiplier = 5;
} else if(diceSelectedBet === 'high' && total >= 8 && total <= 12) {
won = true;
multiplier = 2;
}

if(won) {
const winAmount = bet * multiplier;
addBalance(winAmount);
showResult('dice', `🎲 WIN! Rolled ${total} - +${winAmount} ${currentCurrency}`, 'win');
} else {
showResult('dice', `🎲 Rolled ${total} - Try again!`, 'lose');
}

setTimeout(resetDice, 2000);
}