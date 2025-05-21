// --- Amina Casino v1.0 ---
// Cosmic Crypto Casino powered by Amina Coin

// --- Global Variables ---
let walletConnected = false;
let walletAddress = null;
let balance = 100; // Placeholder balance in Amina Coin or HC based on mode
let playModeHC = false; // false = Amina, true = House Coins
let betAmount = 0.25;

// SLOT MACHINE Data
const slotSymbols = ['🍒', '🍋', '🔔', '🍉', '⭐', '💎', '7️⃣'];

// BLACKJACK Cards
const suits = ['♠', '♥', '♦', '♣'];
const ranks = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 },
];

// Blackjack State
let deck = [];
let playerHand = [];
let dealerHand = [];
let bjInProgress = false;

// PLINKO Settings
const plinkoSlots = [0, 0.25, 0.5, 0.75, 1]; // payout multipliers
const plinkoPositions = 5;
let plinkoBallDropped = false;

// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddrText = document.getElementById('walletAddrText');
const balanceDisplay = document.getElementById('balanceDisplay');
const playModeToggle = document.getElementById('playModeToggle');
const betSlider = document.getElementById('betSlider');
const betAmountLabel = document.getElementById('betAmountLabel');

// Slot Machine Elements
const slotReels = [
  document.getElementById('slotReel1'),
  document.getElementById('slotReel2'),
  document.getElementById('slotReel3'),
];
const slotSpinBtn = document.getElementById('slotSpinBtn');
const slotResult = document.getElementById('slotResult');

// Blackjack Elements
const dealerCardsSpan = document.getElementById('dealerCards');
const playerCardsSpan = document.getElementById('playerCards');
const playerTotalSpan = document.getElementById('playerTotal');
const bjHitBtn = document.getElementById('bjHitBtn');
const bjStandBtn = document.getElementById('bjStandBtn');
const bjNewGameBtn = document.getElementById('bjNewGameBtn');
const bjResultDiv = document.getElementById('bjResult');

// Plinko Elements
const plinkoPegContainer = document.getElementById('plinkoPegContainer');
const plinkoBall = document.getElementById('plinkoBall');
const plinkoDropBtn = document.getElementById('plinkoDropBtn');
const plinkoResult = document.getElementById('plinkoResult');

// --- Initialization ---
function init() {
  updateBalanceDisplay();
  updateBetLabel();
  setupEventListeners();
  buildPlinkoPegs();
  resetBlackjack();
}

function setupEventListeners() {
  connectWalletBtn.addEventListener('click', connectWallet);
  playModeToggle.addEventListener('change', togglePlayMode);
  betSlider.addEventListener('input', onBetSliderChange);
  slotSpinBtn.addEventListener('click', spinSlotMachine);
  bjHitBtn.addEventListener('click', blackjackHit);
  bjStandBtn.addEventListener('click', blackjackStand);
  bjNewGameBtn.addEventListener('click', resetBlackjack);
  plinkoDropBtn.addEventListener('click', plinkoDropBall);
  donateBtn.addEventListener('click', donateToHouse);
}

// --- Wallet Connect Placeholder ---
function connectWallet() {
  // TODO: Implement Pera Wallet Connect here
  walletConnected = true;
  walletAddress = 'ALGO_WALLET_XXXX1234';
  updateWalletDisplay();
  alert('Wallet connected: ' + walletAddress);
}

function updateWalletDisplay() {
  walletAddrText.textContent = walletAddress || 'Not connected';
}

// --- Balance Display ---
function updateBalanceDisplay() {
  let display = playModeHC ? `${balance.toFixed(2)} HC` : `${balance.toFixed(2)} Amina`;
  balanceDisplay.textContent = display;
}

// --- Play Mode Toggle ---
function togglePlayMode() {
  playModeHC = playModeToggle.checked;
  updateBalanceDisplay();
  updateBetLabel();
}

// --- Bet Slider Change ---
function onBetSliderChange() {
  betAmount = parseFloat(betSlider.value);
  updateBetLabel();
}

function updateBetLabel() {
  betAmountLabel.textContent = betAmount.toFixed(2);
}

// --- SLOT MACHINE Logic ---
function spinSlotMachine() {
  if (!checkBalance(betAmount)) return;
  slotSpinBtn.disabled = true;
  slotResult.textContent = 'Spinning... 🎰';

  let spins = [];
  for (let i = 0; i < 3; i++) {
    spins.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
  }

  // Animate reels (simplified)
  let frame = 0;
  const maxFrames = 15;
  const animationInterval = setInterval(() => {
    slotReels.forEach((reel, idx) => {
      reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    });
    frame++;
    if (frame >= maxFrames) {
      clearInterval(animationInterval);
      // Show final spin results
      for (let i = 0; i < 3; i++) {
        slotReels[i].textContent = spins[i];
      }
      evaluateSlotResult(spins);
      slotSpinBtn.disabled = false;
    }
  }, 80);
}

function evaluateSlotResult(spins) {
  // Simple payout:
  // 3 of the same symbol: 5x bet
  // 2 of the same symbol: 2x bet
  // else no payout

  const counts = {};
  spins.forEach(s => counts[s] = (counts[s] || 0) + 1);

  let payout = 0;
  if (Object.values(counts).includes(3)) {
    payout = betAmount * 5;
    slotResult.textContent = `JACKPOT! 3 ${spins[0]}! You win ${payout.toFixed(2)} Amina 🎉`;
  } else if (Object.values(counts).includes(2)) {
    payout = betAmount * 2;
    slotResult.textContent = `Nice! 2 matching symbols! You win ${payout.toFixed(2)} Amina 😊`;
  } else {
    payout = 0;
    slotResult.textContent = `No match. Better luck next time!`;
  }

  updateBalance(-betAmount + payout);
}

// --- BALANCE CHECK ---
function checkBalance(amount) {
  if (amount > balance) {
    alert('Insufficient balance!');
    return false;
  }
  return true;
}

function updateBalance(change) {
  balance += change;
  if (balance < 0) balance = 0;
  updateBalanceDisplay();
}

// --- BLACKJACK Logic ---

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rankObj of ranks) {
      deck.push({ suit, rank: rankObj.rank, value: rankObj.value });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function resetBlackjack() {
  if (!checkBalance(betAmount)) return;
  bjInProgress = true;
  deck = createDeck();
  shuffleDeck(deck);
  playerHand = [];
  dealerHand = [];

  // Deal initial cards
  playerHand.push(deck.pop());
  dealerHand
