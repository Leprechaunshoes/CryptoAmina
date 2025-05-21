// Constants & Globals
const AminaASA_ID = 1107424865; // Your Amina Coin ASA ID
const HOUSE_WALLET = "6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI";
let peraWallet = null;
let userAddress = null;
let userBalance = 0;
let playMode = 'amina'; // 'amina' or 'hc'
let hcBalance = 1000; // Play money starts with 1000 House Coins

// UI Elements
const connectBtn = document.getElementById('connectWallet');
const walletAddrDisplay = document.getElementById('walletAddress');
const balanceDisplay = document.getElementById('balance');
const modeToggle = document.getElementById('togglePlayMode');
const balanceLabel = document.getElementById('balanceLabel');
const slotReels = document.querySelectorAll('.reel');
const slotSpinBtn = document.getElementById('slotSpinBtn');
const blackjackCards = document.getElementById('blackjackCards');
const blackjackControls = {
  hit: document.getElementById('bjHit'),
  stand: document.getElementById('bjStand'),
  result: document.getElementById('bjResult')
};
const plinkoBoard = document.getElementById('plinkoBoard');
const plinkoDropBtn = document.getElementById('plinkoDropBtn');
const plinkoResultDisplay = document.getElementById('plinkoResult');
const betSlider = document.getElementById('betSlider');
const betLabel = document.getElementById('betLabel');
const donationBtn = document.getElementById('donateBtn');
const popcornAudio = document.getElementById('popcornAudio');
const audioToggle = document.getElementById('audioToggle');


// ---------------------------
// WALLET CONNECT & BALANCE
// ---------------------------
async function connectWallet() {
  if (!window.PeraWalletConnect) {
    alert("Pera Wallet extension or app required!");
    return;
  }
  peraWallet = new window.PeraWalletConnect();

  peraWallet.connector.on("disconnect", () => {
    userAddress = null;
    walletAddrDisplay.textContent = "Disconnected";
    balanceDisplay.textContent = "-";
  });

  try {
    const accounts = await peraWallet.connect();
    userAddress = accounts[0];
    walletAddrDisplay.textContent = `Connected: ${userAddress}`;
    await fetchBalance();
  } catch (e) {
    alert("Wallet connection failed.");
  }
}

async function fetchBalance() {
  if (!userAddress) return;
  const algodClient = new algosdk.Algodv2('', 'https://node.algoexplorerapi.io', '');
  try {
    const accountInfo = await algodClient.accountInformation(userAddress).do();
    // Look for ASA balance of Amina Coin
    const asaInfo = accountInfo.assets.find(a => a['asset-id'] === AminaASA_ID);
    userBalance = asaInfo ? asaInfo.amount / 1e6 : 0; // Assume 6 decimals
  } catch {
    userBalance = 0;
  }
  updateBalanceDisplay();
}

function updateBalanceDisplay() {
  if (playMode === 'amina') {
    balanceDisplay.textContent = userBalance.toFixed(6) + " Amina";
  } else {
    balanceDisplay.textContent = hcBalance + " HC";
  }
}

// ---------------------------
// PLAY MODE TOGGLE
// ---------------------------
modeToggle.addEventListener('change', () => {
  playMode = modeToggle.checked ? 'hc' : 'amina';
  updateBalanceDisplay();
  alert(`Switched to ${playMode === 'amina' ? 'Amina Coin' : 'House Coins (HC)'} mode.`);
});

// ---------------------------
// SLOT MACHINE
// ---------------------------
const slotSymbols = ['🍒', '🍋', '🔔', '⭐', '🍀', '💎'];
function spinSlot() {
  const bet = parseFloat(betSlider.value);
  if (!canPlaceBet(bet)) return;

  // Animate spinning reels
  let spins = 0;
  const spinInterval = setInterval(() => {
    slotReels.forEach(reel => {
      const randomIndex = Math.floor(Math.random() * slotSymbols.length);
      reel.textContent = slotSymbols[randomIndex];
    });
    spins++;
    if (spins >= 20) {
      clearInterval(spinInterval);
      finalizeSlotSpin(bet);
    }
  }, 100);
}

function finalizeSlotSpin(bet) {
  // Determine final slot symbols randomly
  const finalSymbols = [];
  for (let i = 0; i < slotReels.length; i++) {
    const randIdx = Math.floor(Math.random() * slotSymbols.length);
    slotReels[i].textContent = slotSymbols[randIdx];
    finalSymbols.push(slotSymbols[randIdx]);
  }

  // Check for win: 3 matching symbols = 5x bet, 2 matching = 2x bet
  let payout = 0;
  if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
    payout = bet * 5;
  } else if (
    finalSymbols[0] === finalSymbols[1] ||
    finalSymbols[1] === finalSymbols[2] ||
    finalSymbols[0] === finalSymbols[2]
  ) {
    payout = bet * 2;
  }

  processBetResult(bet, payout);
}

// ---------------------------
// BLACKJACK (simplified)
// ---------------------------
const bjDeck = [];
let playerHand = [];
let dealerHand = [];

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = [
    { name: 'A', value: [1, 11] },
    { name: '2', value: [2] },
    { name: '3', value: [3] },
    { name: '4', value: [4] },
    { name: '5', value: [5] },
    { name: '6', value: [6] },
    { name: '7', value: [7] },
    { name: '8', value: [8] },
    { name: '9', value: [9] },
    { name: '10', value: [10] },
    { name: 'J', value: [10] },
    { name: 'Q', value: [10] },
    { name: 'K', value: [10] },
  ];
  const deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ name: rank.name, suit, value: rank.value });
    });
  });
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function calculateHandValue(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.name === 'A') {
      aces++;
      total += 11;
    } else {
      total += card.value[0];
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function startBlackjack() {
  if (!canPlaceBet(parseFloat(betSlider.value))) return;

  blackjackCards.innerHTML = '';
  blackjackControls.result.textContent = '';
  playerHand = [];
  dealerHand = [];

  shuffleDeck(bjDeck);
  playerHand.push(bjDeck.pop());
  dealerHand.push(bjDeck.pop());
  playerHand.push(bjDeck.pop());
  dealerHand.push(bjDeck.pop());

  renderBlackjackHands();
  checkBlackjackStatus();
}

function renderBlackjackHands() {
  blackjackCards.innerHTML = `
    <div><strong>Player:</strong> ${renderCards(playerHand)} (${calculateHandValue(playerHand)})</div>
    <div><strong>Dealer:</strong> ${renderCards([dealerHand[0]])} ❓</div>
  `;
}

function renderCards(hand) {
  return hand.map(c => `${c.name}${c.suit}`).join(' ');
}

function hitBlackjack() {
  playerHand.push(bjDeck.pop());
  renderBlackjackHands();
  checkBlackjackStatus();
}

function standBlackjack() {
  // Reveal dealer's full hand and dealer draws till 17+
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(bjDeck.pop());
  }
  renderFinalBlackjack();
}

function renderFinalBlackjack() {
  blackjackCards.innerHTML = `
    <div><strong>Player:</strong> ${renderCards(playerHand)} (${calculateHandValue(playerHand)})</div>
    <div><strong>Dealer:</strong> ${renderCards(dealerHand)} (${calculateHandValue(dealerHand)})</div>
  `;

  const playerScore = calculateHandValue(playerHand);
  const dealerScore = calculateHandValue(dealerHand);
  const bet = parseFloat(betSlider.value);

  if (playerScore > 21) {
    blackjackControls.result.textContent = "Bust! You lose.";
    processBetResult(bet, 0);
  } else if (dealerScore > 21 || playerScore > dealerScore) {
    blackjackControls.result.textContent = "You win!";
    processBetResult(bet, bet * 2);
  } else if (playerScore === dealerScore) {
    blackjackControls.result.textContent = "Push! Bet returned.";
    processBetResult(bet, bet);
  } else {
    blackjackControls.result.textContent = "Dealer wins.";
    processBetResult(bet, 0);
  }
}

function checkBlackjackStatus() {
  const playerScore = calculateHandValue(playerHand);
  if (playerScore === 21) {
    blackjackControls.result.textContent = "Blackjack! You win!";
    processBetResult(parseFloat(betSlider.value), parseFloat(betSlider.value) * 2.5);
  } else if (playerScore > 21) {
    blackjackControls.result.textContent = "Bust! You lose.";
    processBetResult(parseFloat(betSlider.value), 0);
  }
}

// ---------------------------
// PLINKO
// ---------------------------
function dropPlinkoBall() {
  const bet = parseFloat(betSlider.value);
  if (!canPlaceBet(bet)) return;

  plinkoResultDisplay.textContent = "Dropping ball...";

  // Simple plinko simulation: random payout multiplier
  const payoutMultipliers = [0, 0, 0, 1, 1, 2, 3, 5]; // Weighted for house edge
  const randIdx = Math.floor(Math.random() * payoutMultipliers.length);
  const payoutMultiplier = payoutMultipliers[randIdx];

  setTimeout(() => {
    if (payoutMultiplier === 0) {
      plinkoResultDisplay.textContent = "No win. Try again!";
      processBetResult(bet, 0);
    } else {
      const payout = bet * payoutMultiplier;
      plinkoResultDisplay.textContent = `You win ${payout.toFixed(3)} ${playMode === 'amina' ? 'Amina' : 'HC'}!`;
      processBetResult(bet, payout);
    }
  }, 2500); // Delay to simulate ball drop
}

// ---------------------------
// BET & BALANCE LOGIC
// ---------------------------
function canPlaceBet(bet) {
  if (bet <= 0) {
    alert("Bet must be greater than 0");
    return false;
  }
  if (playMode === 'amina' && bet > userBalance) {
    alert("Insufficient Amina balance");
    return false;
  }
  if (playMode === 'hc' && bet > hcBalance) {
    alert("Insufficient House Coins");
    return false;
  }
  return true;
}

function processBetResult(bet, payout) {
  // Apply house rake 5%
  const rake = payout * 0.05;
  const netPayout = payout - rake;

  if (playMode === 'amina') {
    userBalance = userBalance - bet + netPayout;
    // Here you'd do actual blockchain transfers in a real app
  } else {
    hcBalance = hcBalance - bet + netPayout;
  }
  updateBalanceDisplay();
}

// ---------------------------
// GAME TAB SWITCHING
// ---------------------------
const gameButtons = document.querySelectorAll('#gameTabs button');
const gameSections = document.querySelectorAll('.gameSection');

gameButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-game');
    gameSections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// ---------------------------
// DONATION BUTTON
// ---------------------------
donationBtn.addEventListener('click', () => {
  alert(`Send your appreciation to:\n${HOUSE_WALLET}\nvia Algorand`);
});

// ---------------------------
// POPCORN MUSIC TOGGLE
// ---------------------------
audioToggle.addEventListener('click', () => {
  if (popcornAudio.paused) {
    popcornAudio.play();
    audioToggle.textContent = "Stop Music";
  } else {
    popcornAudio.pause();
    audioToggle.textContent = "Play Music";
  }
});

// ---------------------------
// BET SLIDER UPDATE
// ---------------------------
betSlider.addEventListener('input', () => {
  betLabel.textContent = `Bet: ${betSlider.value} ${playMode === 'amina' ? 'Amina' : 'HC'}`;
});

// ---------------------------
// BLACKJACK BUTTONS
// ---------------------------
blackjackControls.hit.addEventListener('click', hitBlackjack);
blackjackControls.stand.addEventListener('click', standBlackjack);

// ---------------------------
// SLOT BUTTON
// ---------------------------
slotSpinBtn.addEventListener('click', spinSlot);

// ---------------------------
// PLINKO BUTTON
// ---------------------------
plinkoDropBtn.addEventListener('click', dropPlinkoBall);

// ---------------------------
// INITIALIZATION
// ---------------------------
function init() {
  // Prepare deck for blackjack
  bjDeck.push(...createDeck());
  shuffleDeck(bjDeck);

  // Default UI setup
  updateBalanceDisplay();
  betLabel.textContent = `Bet: ${betSlider.value} Amina`;
  document.getElementById('slot').classList.add('active');

  // Connect wallet button
  connectBtn.addEventListener('click', connectWallet);

  // Start popcorn music paused
  popcornAudio.pause();
}

window.onload = init;
