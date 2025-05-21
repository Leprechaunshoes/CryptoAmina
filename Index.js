// Game State
let balance = 1000;
document.getElementById('balance').textContent = balance;

// Blackjack
let bjPlayer = [], bjDealer = [], bjBet = 10;

document.getElementById('bj-deal').addEventListener('click', () => {
  if (balance < bjBet) return alert("Not enough coins!");
  balance -= bjBet;
  updateBalance();
  
  bjPlayer = [drawCard(), drawCard()];
  bjDealer = [drawCard(), drawCard()];
  
  renderHand('player-hand', bjPlayer);
  renderHand('dealer-hand', [bjDealer[0], true);
  
  document.getElementById('bj-hit').disabled = false;
  document.getElementById('bj-stand').disabled = false;
});

// Slots
const symbols = ['🌌', '🪐', '☄️', '🌠', '✨', '👽'];
document.getElementById('spin').addEventListener('click', () => {
  const cost = 10;
  if (balance < cost) return alert("Not enough coins!");
  balance -= cost;
  updateBalance();
  
  // Animate spin
  let spins = 0;
  const spinInterval = setInterval(() => {
    document.getElementById('reel1').textContent = randomSymbol();
    document.getElementById('reel2').textContent = randomSymbol();
    document.getElementById('reel3').textContent = randomSymbol();
    
    spins++;
    if (spins > 10) {
      clearInterval(spinInterval);
      checkSlotWin();
    }
  }, 100);
});

// Helper Functions
function drawCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    rank: ranks[Math.floor(Math.random() * ranks.length)]
  };
}

function updateBalance() {
  document.getElementById('balance').textContent = balance;
}
