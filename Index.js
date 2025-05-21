// index.js - Main game logic and wallet interaction

// Initialize global variables
const AMINA_ASSET_ID = 1107424865;
const HOUSE_ADDRESS = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';

const peraWallet = new PeraWalletConnect(); // Your mock wallet class

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletAddressSpan = document.getElementById('wallet-address');
const walletBalanceSpan = document.getElementById('wallet-balance');
const walletInfoDiv = document.getElementById('wallet-info');
const currencyToggle = document.getElementById('currency-toggle');
const houseBalanceDiv = document.getElementById('house-balance');
const toggleMusicBtn = document.getElementById('toggle-music');
const donateBtn = document.getElementById('donate-button');
const donationModal = document.getElementById('donation-modal');
const closeModal = document.querySelector('.close');
const confirmDonationBtn = document.getElementById('confirm-donation');

const backgroundMusic = document.getElementById('background-music');
const winSound = document.getElementById('win-sound');
const spinSound = document.getElementById('spin-sound');
const cardSound = document.getElementById('card-sound');
const plinkoSound = document.getElementById('plinko-sound');

let useAmina = false; // default currency
let houseCoins = 1000; // initial house coins
let currentAccount = null;
let currentBalance = 0;

// Slots variables
const slotSymbols = ['🚀', '💫', '🌟', '🪐', '👽'];
const slotPayouts = { '🚀': 5, '💫': 3, '🌟': 2, '🪐': 10, '👽': 7 };
const reels = [
  document.getElementById('reel1'),
  document.getElementById('reel2'),
  document.getElementById('reel3')
];
let currentBet = 0.25;
let isSpinning = false;

// Blackjack variables
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerCardsDiv = document.getElementById('player-cards');
const dealerScoreDiv = document.getElementById('dealer-score');
const playerScoreDiv = document.getElementById('player-score');
const blackjackResultDiv = document.getElementById('blackjack-result');
const dealBtn = document.getElementById('deal-button');
const hitBtn = document.getElementById('hit-button');
const standBtn = document.getElementById('stand-button');
const bjBetAmountSpan = document.getElementById('bj-bet-amount');
let bjCurrentBet = 0.25;
let blackJackInProgress = false;
let deck = [];
let dealerHand = [];
let playerHand = [];

// Plinko variables
const plinkoCanvas = document.getElementById('plinko-canvas');
const ctx = plinkoCanvas.getContext('2d');
const plinkoRowsInput = document.getElementById('plinko-rows');
const rowsValueSpan = document.getElementById('rows-value');
const plinkoDropBtn = document.getElementById('drop-button');
const plinkoBetAmountSpan = document.getElementById('plinko-bet-amount');
let plinkoRows = 12;
let plinkoBet = 0.25;
let pegs = [];
let balls = [];
let multipliers = [];
let dropInProgress = false;

// Initialization
function initialize() {
  setupEventListeners();
  initializePlinko();
  createDeck();
  shuffleDeck();
  updateBalanceDisplay();
}

function setupEventListeners() {
  // Wallet connect
  connectWalletBtn.addEventListener('click', async () => {
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        currentAccount = accounts[0];
        const balanceStr = await peraWallet.getAssetBalance(currentAccount, AMINA_ASSET_ID);
        currentBalance = parseFloat(balanceStr);
        walletAddressSpan.textContent = `${currentAccount.substring(0,6)}...${currentAccount.substring(currentAccount.length - 4)}`;
        walletBalanceSpan.textContent = `${currentBalance} Amina`;
        walletInfoDiv.classList.remove('hidden');
        document.getElementById('connect-wallet').classList.add('hidden');
      }
    } catch (e) {
      alert('Wallet connection failed.');
    }
  });
  // Toggle currency
  document.getElementById('currency-toggle').addEventListener('change', () => {
    useAmina = document.getElementById('currency-toggle').checked;
    updateBalanceDisplay();
  });
  // Music toggle
  document.getElementById('toggle-music').addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  });
  // Donation modal
  document.getElementById('donate-button').addEventListener('click', () => {
    if (!peraWallet.isConnected() && useAmina) {
      alert('Please connect your wallet first.');
      return;
    }
    document.getElementById('donation-modal').style.display = 'block';
  });
  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('donation-modal').style.display = 'none';
  });
  window.onclick = (event) => {
    if (event.target == document.getElementById('donation-modal')) {
      document.getElementById('donation-modal').style.display = 'none';
    }
  };
  document.getElementById('confirm-donation').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('donation-amount').value);
    if (isNaN(amount) || amount < 0.25) {
      alert('Invalid amount.');
      return;
    }
    try {
      if (useAmina) {
        const account = currentAccount;
        const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, amount, AMINA_ASSET_ID);
        currentBalance = parseFloat(result.balance);
        walletBalanceSpan.textContent = `${currentBalance} Amina`;
        alert(`Thank you for your donation of ${amount} Amina!`);
      } else {
        if (amount > houseCoins) {
          alert('Not enough House Coins.');
          return;
        }
        houseCoins -= amount;
        updateBalanceDisplay();
        alert(`Thank you for your donation of ${amount} House Coins!`);
      }
      document.getElementById('donation-modal').style.display = 'none';
    } catch (err) {
      alert('Donation failed.');
    }
  });

  // Slot controls
  document.getElementById('decrease-bet').addEventListener('click', () => {
    if (currentBet > 0.25) {
      currentBet = Math.max(0.25, currentBet - 0.25);
      document.getElementById('bet-amount').textContent = currentBet.toFixed(2);
    }
  });
  document.getElementById('increase-bet').addEventListener('click', () => {
    if (currentBet < 1) {
      currentBet = Math.min(1, currentBet + 0.25);
      document.getElementById('bet-amount').textContent = currentBet.toFixed(2);
    }
  });
  document.getElementById('spin-button').addEventListener('click', async () => {
    await spinSlots();
  });

  // Blackjack controls
  document.getElementById('bj-decrease-bet').addEventListener('click', () => {
    if (bjCurrentBet > 0.25) {
      bjCurrentBet = Math.max(0.25, bjCurrentBet - 0.25);
      bjBetAmountSpan.textContent = bjCurrentBet.toFixed(2);
    }
  });
  document.getElementById('bj-increase-bet').addEventListener('click', () => {
    if (bjCurrentBet < 1) {
      bjCurrentBet = Math.min(1, bjCurrentBet + 0.25);
      bjBetAmountSpan.textContent = bjCurrentBet.toFixed(2);
    }
  });
  document.getElementById('deal-button').addEventListener('click', async () => {
    await dealBlackjack();
  });
  document.getElementById('hit-button').addEventListener('click', async () => {
    await blackjackHit();
  });
  document.getElementById('stand-button').addEventListener('click', async () => {
    await blackjackStand();
  });

  // Plinko controls
  document.getElementById('plinko-decrease-bet').addEventListener('click', () => {
    if (plinkoBet > 0.25) {
      plinkoBet = Math.max(0.25, plinkoBet - 0.25);
      document.getElementById('plinko-bet-amount').textContent = plinkoBet.toFixed(2);
    }
  });
  document.getElementById('plinko-increase-bet').addEventListener('click', () => {
    if (plinkoBet < 1) {
      plinkoBet = Math.min(1, plinkoBet + 0.25);
      document.getElementById('plinko-bet-amount').textContent = plinkoBet.toFixed(2);
    }
  });
  document.getElementById('drop-button').addEventListener('click', () => {
    dropBallPlinko();
  });
  // Rows slider
  document.getElementById('plinko-rows').addEventListener('input', () => {
    plinkoRows = parseInt(document.getElementById('plinko-rows').value);
    document.getElementById('rows-value').textContent = plinkoRows;
    initializePlinko();
  });
}

// Update display balances
function updateBalanceDisplay() {
  if (useAmina && currentAccount) {
    walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
  } else {
    document.getElementById('house-balance').textContent = `${houseCoins} HC`;
  }
}

// Slots game logic
async function spinSlots() {
  if (isSpinning) return;
  // Check if user can afford
  if (useAmina) {
    if (!peraWallet.isConnected()) {
      alert('Please connect your wallet.');
      return;
    }
    const account = currentAccount;
    const balanceStr = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
    if (parseFloat(balanceStr) < currentBet) {
      alert('Not enough Amina.');
      return;
    }
    try {
      const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, currentBet, AMINA_ASSET_ID);
      currentBalance = parseFloat(result.balance);
      walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
    } catch {
      alert('Failed to place bet.');
      return;
    }
  } else {
    if (houseCoins < currentBet) {
      alert('Not enough House Coins.');
      return;
    }
    houseCoins -= currentBet;
    updateBalanceDisplay();
  }

  isSpinning = true;
  document.getElementById('slots-result').textContent = '';
  spinSound.currentTime = 0;
  spinSound.play();

  const spinDurations = [2000, 2500, 3000];
  const finalSymbols = [];

  for (let i = 0; i < reels.length; i++) {
    finalSymbols.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
    animateReel(reels[i], spinDurations[i], finalSymbols[i]);
  }

  setTimeout(async () => {
    const result = checkSlotResult(finalSymbols);
    if (result.win) {
      const winAmount = currentBet * result.multiplier;
      document.getElementById('slots-result').textContent = `You won ${winAmount.toFixed(2)}!`;
      winSound.currentTime = 0;
      winSound.play();

      if (useAmina) {
        const account = currentAccount;
        try {
          const txResult = await peraWallet.receiveAssets(account, winAmount, AMINA_ASSET_ID);
          currentBalance = parseFloat(txResult.balance);
          walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
        } catch {
          alert('Failed to receive winnings.');
        }
      } else {
        houseCoins += winAmount;
        updateBalanceDisplay();
      }
    } else {
      document.getElementById('slots-result').textContent = 'Better luck next time!';
    }
    isSpinning = false;
  }, Math.max(...spinDurations) + 100);
}

// Blackjack functions
async function dealBlackjack() {
  if (blackJackInProgress) return;
  // Check funds
  if (useAmina) {
    if (!peraWallet.isConnected()) {
      alert('Please connect your wallet.');
      return;
    }
    const account = currentAccount;
    const balanceStr = await peraWallet.getAssetBalance(account, AMINA_ASSET_ID);
    if (parseFloat(balanceStr) < bjCurrentBet) {
      alert('Not enough Amina.');
      return;
    }
    try {
      const result = await peraWallet.sendAssets(account, HOUSE_ADDRESS, bjCurrentBet, AMINA_ASSET_ID);
      currentBalance = parseFloat(result.balance);
      walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
    } catch {
      alert('Failed to place bet.');
      return;
    }
  } else {
    if (houseCoins < bjCurrentBet) {
      alert('Not enough House Coins.');
      return;
    }
    houseCoins -= bjCurrentBet;
    updateBalanceDisplay();
  }

  createDeck();
  shuffleDeck();
  dealerHand = [];
  playerHand = [];
  dealCard(dealerHand, dealerCardsDiv, true);
  dealCard(playerHand, playerCardsDiv);
  dealCard(dealerHand, dealerCardsDiv, true);
  dealCard(playerHand, playerCardsDiv);
  updateScores();

  if (calculateScore(playerHand) === 21) {
    await endBlackjack();
    return;
  }

  blackJackInProgress = true;
  document.getElementById('hit-button').disabled = false;
  document.getElementById('stand-button').disabled = false;
  document.getElementById('deal-button').disabled = true;
}

async function blackjackHit() {
  if (!blackJackInProgress) return;
  dealCard(playerHand, playerCardsDiv);
  updateScores();
  if (calculateScore(playerHand) > 21) {
    await endBlackjack();
  }
}

async function blackjackStand() {
  if (!blackJackInProgress) return;
  // Reveal dealer's first card
  revealDealerCards();
  while (calculateScore(dealerHand) < 17) {
    dealCard(dealerHand, dealerCardsDiv);
    updateScores();
  }
  await endBlackjack();
}

async function endBlackjack() {
  updateScores();
  const playerScoreVal = calculateScore(playerHand);
  const dealerScoreVal = calculateScore(dealerHand);
  let resultText = '';

  if (playerScoreVal > 21) {
    resultText = 'Bust! You lose.';
  } else if (dealerScoreVal > 21 || playerScoreVal > dealerScoreVal) {
    // Win
    const payout = bjCurrentBet * 2;
    if (useAmina) {
      const account = currentAccount;
      try {
        const txResult = await peraWallet.receiveAssets(account, payout, AMINA_ASSET_ID);
        currentBalance = parseFloat(txResult.balance);
        walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
      } catch {
        alert('Failed to receive winnings.');
      }
    } else {
      houseCoins += payout;
    }
    resultText = `You win! Payout: ${payout.toFixed(2)}`;
  } else if (playerScoreVal === dealerScoreVal) {
    // Push, refund bet
    if (useAmina) {
      const account = currentAccount;
      try {
        const txResult = await peraWallet.receiveAssets(account, bjCurrentBet, AMINA_ASSET_ID);
        currentBalance = parseFloat(txResult.balance);
        walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
      } catch {
        alert('Failed to refund bet.');
      }
    } else {
      houseCoins += bjCurrentBet;
    }
    resultText = 'Push. Bet refunded.';
  } else {
    resultText = 'You lose.';
  }

  document.getElementById('blackjack-result').textContent = resultText;
  document.getElementById('hit-button').disabled = true;
  document.getElementById('stand-button').disabled = true;
  document.getElementById('deal-button').disabled = false;
  blackJackInProgress = false;
}

// Plinko functions
function initializePlinko() {
  // Setup pegs, multipliers, etc.
  const width = plinkoCanvas.width = plinkoCanvas.clientWidth;
  const height = plinkoCanvas.height = plinkoCanvas.clientHeight;
  pegs = [];
  balls = [];
  multipliers = [];
  // Generate pegs
  const rows = plinkoRows;
  const spacingX = width / (rows + 1);
  const spacingY = height / (rows + 1);
  for (let r = 0; r < rows; r++) {
    const y = spacingY * (r + 1);
    const numPegs = r + 1;
    for (let p = 0; p < numPegs; p++) {
      const x = spacingX * (p + 1) + (r % 2 === 0 ? 0 : spacingX / 2);
      pegs.push({ x, y, radius: 5 });
    }
  }
  // Generate multipliers
  multipliers = [1, 1.2, 1.5, 2, 3];
  // Draw initial board
  drawPlinkoBoard();
}

function drawPlinkoBoard() {
  ctx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
  // Draw pegs
  pegs.forEach(peg => {
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
  // Draw balls
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
  });
  requestAnimationFrame(updatePlinko);
}

function updatePlinko() {
  ctx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
  // Draw pegs
  pegs.forEach(peg => {
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
  // Update balls
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    ball.velocityY += 0.2; // gravity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Walls
    if (ball.x < ball.radius) {
      ball.x = ball.radius;
      ball.velocityX *= -0.8;
    }
    if (ball.x > plinkoCanvas.width - ball.radius) {
      ball.x = plinkoCanvas.width - ball.radius;
      ball.velocityX *= -0.8;
    }
    if (ball.y > plinkoCanvas.height - ball.radius) {
      ball.y = plinkoCanvas.height - ball.radius;
      ball.velocityY *= -0.2;
    }

    // Collisions with pegs
    pegs.forEach(peg => {
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.radius + peg.radius) {
        // bounce
        const nx = dx / dist;
        const ny = dy / dist;
        const relVel = ball.velocityX * nx + ball.velocityY * ny;
        if (relVel < 0) {
          const bounce = -(1 + 0.7) * relVel;
          ball.velocityX += bounce * nx;
          ball.velocityY += bounce * ny;
          plinkoSound.currentTime = 0;
          plinkoSound.play();
        }
      }
    });

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
  }
  requestAnimationFrame(updatePlinko);
}

function dropBallPlinko() {
  if (dropInProgress) return;
  // Check funds
  if (useAmina) {
    if (!peraWallet.isConnected()) {
      alert('Please connect your wallet.');
      return;
    }
    peraWallet.getAssetBalance(currentAccount, AMINA_ASSET_ID).then(balanceStr => {
      if (parseFloat(balanceStr) < plinkoBet) {
        alert('Not enough Amina.');
        return;
      }
      peraWallet.sendAssets(currentAccount, HOUSE_ADDRESS, plinkoBet, AMINA_ASSET_ID).then(result => {
        currentBalance = parseFloat(result.balance);
        walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
        startDrop();
      }).catch(() => alert('Transfer failed.'));
    });
  } else {
    if (houseCoins < plinkoBet) {
      alert('Not enough House Coins.');
      return;
    }
    houseCoins -= plinkoBet;
    updateBalanceDisplay();
    startDrop();
  }
}

function startDrop() {
  dropInProgress = true;
  document.getElementById('plinko-result').textContent = '';

  // Create new ball
  const startX = plinkoCanvas.width / 2 + (Math.random() * 40 - 20);
  const ball = {
    x: startX,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    radius: 8
  };
  balls.push(ball);

  // Wait for drop to finish
  setTimeout(() => {
    // Determine multiplier based on final position
    let index = Math.floor(ball.x / (plinkoCanvas.width / multipliers.length));
    if (index < 0) index = 0;
    if (index >= multipliers.length) index = multipliers.length - 1;
    const multiplier = multipliers[index];

    const winAmount = plinkoBet * multiplier;
    document.getElementById('plinko-result').textContent = `You won ${winAmount.toFixed(2)}!`;

    if (multiplier > 0) {
      if (useAmina) {
        peraWallet.receiveAssets(currentAccount, winAmount, AMINA_ASSET_ID).then(tx => {
          currentBalance = parseFloat(tx.balance);
          walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
        }).catch(() => alert('Receive failed.'));
      } else {
        houseCoins += winAmount;
        updateBalanceDisplay();
      }
    }
    balls = [];
    dropInProgress = false;
  }, 5000); // wait for animation
}

// Utility functions
function createDeck() {
  deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard(hand, container, isDealer = false) {
  const card = deck.pop();
  hand.push(card);
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  if (card.suit === '♥' || card.suit === '♦') {
    cardDiv.classList.add('red');
  } else {
    cardDiv.classList.add('black');
  }
  cardDiv.innerHTML = createCardHTML(card.value, card.suit);
  container.appendChild(cardDiv);
}

function createCardHTML(value, suit) {
  return `<div class="card-value">${value}</div><div class="card-suit">${suit}</div>`;
}

function updateScores() {
  document.getElementById('player-score').textContent = calculateScore(playerHand);
  document.getElementById('dealer-score').textContent = calculateScore(dealerHand);
}

function calculateScore(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      total += 11;
    } else if (['J','Q','K'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function revealDealerCards() {
  const dealerDivs = document.querySelectorAll('#dealer-cards .card');
  if (dealerDivs.length > 0) {
    dealerDivs[0].innerHTML = createCardHTML(dealerHand[0].value, dealerHand[0].suit);
  }
}

async function endBlackjack() {
  updateScores();
  const playerScoreVal = calculateScore(playerHand);
  const dealerScoreVal = calculateScore(dealerHand);
  let resultText = '';

  if (playerScoreVal > 21) {
    resultText = 'Bust! You lose.';
  } else if (dealerScoreVal > 21 || playerScoreVal > dealerScoreVal) {
    const payout = bjCurrentBet * 2;
    if (useAmina) {
      try {
        const tx = await peraWallet.receiveAssets(currentAccount, payout, AMINA_ASSET_ID);
        currentBalance = parseFloat(tx.balance);
        walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
      } catch {
        alert('Failed to receive winnings.');
      }
    } else {
      houseCoins += payout;
    }
    resultText = `You win! Payout: ${payout.toFixed(2)}`;
  } else if (playerScoreVal === dealerScoreVal) {
    // Push - refund bet
    if (useAmina) {
      try {
        const tx = await peraWallet.receiveAssets(currentAccount, bjCurrentBet, AMINA_ASSET_ID);
        currentBalance = parseFloat(tx.balance);
        walletBalanceSpan.textContent = `${currentBalance.toFixed(2)} Amina`;
      } catch {
        alert('Failed to refund bet.');
      }
    } else {
      houseCoins += bjCurrentBet;
    }
    resultText = 'Push. Bet refunded.';
  } else {
    resultText = 'You lose.';
  }
  document.getElementById('blackjack-result').textContent = resultText;
  document.getElementById('hit-button').disabled = true;
  document.getElementById('stand-button').disabled = true;
  document.getElementById('deal-button').disabled = false;
  blackJackInProgress = false;
}

// Initialize Plinko
initialize();

window.onload = initialize;
}

initialize();
