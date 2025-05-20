// --- State ---
let houseBalance = 1000.0;
function updateBalance() {
  document.getElementById('house-balance').textContent = houseBalance.toFixed(1);
}
function getBet(id) {
  return parseInt(document.getElementById(id).value);
}
function setBetDisplay(id, value) {
  document.getElementById(id + '-display').textContent = value;
}
['bj', 'slot', 'plinko'].forEach(prefix => {
  let range = document.getElementById(`${prefix}-bet`);
  range.addEventListener('input', () => setBetDisplay(`${prefix}-bet`, range.value));
  setBetDisplay(`${prefix}-bet`, range.value);
});
updateBalance();

// --- Blackjack ---
const suits = ['♠','♥','♦','♣'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function drawCard() {
  let suit = suits[Math.floor(Math.random()*4)];
  let rank = ranks[Math.floor(Math.random()*13)];
  return {suit, rank};
}
function handValue(hand) {
  let val = 0, aces = 0;
  hand.forEach(card => {
    if (card.rank === 'A') { val += 11; aces++; }
    else if (['K','Q','J'].includes(card.rank)) val += 10;
    else val += parseInt(card.rank);
  });
  while (val > 21 && aces > 0) { val -= 10; aces--; }
  return val;
}
function renderHand(div, hand, hideFirst=false) {
  div.innerHTML = '';
  hand.forEach((card, i) => {
    let c = document.createElement('div');
    c.className = 'card';
    if (['♥','♦'].includes(card.suit)) c.classList.add('red');
    c.textContent = (hideFirst && i === 0) ? '🂠' : card.rank + card.suit;
    div.appendChild(c);
  });
}

let bjPlayer = [], bjDealer = [], bjBet = 0;
function resetBlackjack() {
  bjPlayer = [drawCard(), drawCard()];
  bjDealer = [drawCard(), drawCard()];
  renderHand(document.getElementById('player-hand'), bjPlayer);
  renderHand(document.getElementById('dealer-hand'), bjDealer, true);
  document.getElementById('bj-result').textContent = '';
  document.getElementById('bj-hit').disabled = false;
  document.getElementById('bj-stand').disabled = false;
}
document.getElementById('bj-deal').onclick = function() {
  bjBet = getBet('bj-bet');
  if (bjBet > houseBalance) {
    document.getElementById('bj-result').textContent = "Not enough balance!";
    return;
  }
  houseBalance -= bjBet;
  updateBalance();
  resetBlackjack();
};
document.getElementById('bj-hit').onclick = function() {
  bjPlayer.push(drawCard());
  renderHand(document.getElementById('player-hand'), bjPlayer);
  if (handValue(bjPlayer) > 21) {
    endBlackjack("Bust! You lose.");
  }
};
document.getElementById('bj-stand').onclick = function() {
  // Dealer's turn: hit until 17+
  while (handValue(bjDealer) < 17) bjDealer.push(drawCard());
  renderHand(document.getElementById('dealer-hand'), bjDealer);
  let playerVal = handValue(bjPlayer), dealerVal = handValue(bjDealer);
  if (dealerVal > 21 || playerVal > dealerVal) {
    endBlackjack("You win!", true);
  } else if (playerVal === dealerVal) {
    endBlackjack("Push (tie).", null, true);
  } else {
    endBlackjack("Dealer wins.");
  }
};
function endBlackjack(msg, win=false, push=false) {
  document.getElementById('bj-hit').disabled = true;
  document.getElementById('bj-stand').disabled = true;
  document.getElementById('bj-result').textContent = msg;
  if (win) {
    houseBalance += bjBet * 2;
    updateBalance();
  }
  if (push) {
    houseBalance += bjBet;
    updateBalance();
  }
}

// --- Slot Machine ---
const slotSymbols = ['🍒','🍋','🔔','💎','7️⃣','🍀','🌌','👽'];
const slotRows = 3, slotCols = 3;
function createSlotReels() {
  let reelsDiv = document.getElementById('slot-reels');
  reelsDiv.innerHTML = '';
  for (let r=0; r<slotRows; r++) {
    let row = document.createElement('div');
    row.className = 'slot-row';
    for (let c=0; c<slotCols; c++) {
      let reel = document.createElement('div');
      reel.className = 'slot-reel';
      reel.id = `slot-${r}-${c}`;
      row.appendChild(reel);
    }
    reelsDiv.appendChild(row);
  }
}
function randomSymbol() {
  return slotSymbols[Math.floor(Math.random()*slotSymbols.length)];
}
function spinSlots() {
  let grid = [];
  for (let r=0; r<slotRows; r++) {
    grid[r] = [];
    for (let c=0; c<slotCols; c++) {
      grid[r][c] = randomSymbol();
      let reel = document.getElementById(`slot-${r}-${c}`);
      reel.innerHTML = `<span class="slot-symbol">${grid[r][c]}</span>`;
    }
  }
  return grid;
}
function checkSlotWins(grid, bet) {
  let wins = 0, lines = [];
  // Horizontal lines
  for (let r=0; r<slotRows; r++) {
    if (grid[r][0] === grid[r][1] && grid[r][1] === grid[r][2]) {
      wins += bet * 5;
      lines.push(`Row ${r+1}`);
    }
  }
  // Diagonals
  if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    wins += bet * 10;
    lines.push("↘ Diagonal");
  }
  if (grid[2][0] === grid[1][1] && grid[1][1] === grid[0][2]) {
    wins += bet * 10;
    lines.push("↗ Diagonal");
  }
  // Center line bonus
  if (grid[1][0] === grid[1][1] && grid[1][1] === grid[1][2]) {
    wins += bet * 10;
    if (!lines.includes("Row 2")) lines.push("Row 2");
  }
  return {wins, lines};
}
createSlotReels();
document.getElementById('slot-spin').onclick = function() {
  let bet = getBet('slot-bet');
  if (bet > houseBalance) {
    document.getElementById('slot-result').textContent = "Not enough balance!";
    return;
  }
  houseBalance -= bet;
  updateBalance();
  let spins = 18, grid;
  let anim = setInterval(() => {
    grid = spinSlots();
    spins--;
    if (spins === 0) {
      clearInterval(anim);
      let {wins, lines} = checkSlotWins(grid, bet);
      if (wins > 0) {
        document.getElementById('slot-result').textContent = `Win! +${wins} (${lines.join(', ')})`;
        houseBalance += wins;
        updateBalance();
      } else {
        document.getElementById('slot-result').textContent = "No win. Try again!";
      }
    }
  }, 60);
};

// --- Plinko ---
const plinkoRows = 12, plinkoSlots = 13;
const plinkoPayouts = [0,0.5,1,2,4,6,10,6,4,2,1,0.5,0];

function buildPlinkoBoard(ballPositions=[]) {
  const board = document.getElementById('plinko-board');
  board.innerHTML = '';
  // Pins
  for (let r=0; r<plinkoRows; ++r) {
    let row = document.createElement('div');
    row.className = 'plinko-row';
    for (let c=0; c<=r; ++c) {
      let cell = document.createElement('div');
      cell.className = 'plinko-cell plinko-pin';
      cell.textContent = '•';
      // Place balls if any at this position
      let ballsHere = ballPositions.filter(bp => bp.row === r && bp.col === c);
      if (ballsHere.length > 0) {
        cell.className += ' plinko-ball';
        cell.textContent = ballsHere.length > 1 ? '⬤'.repeat(Math.min(2, ballsHere.length)) : '⬤';
      }
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
  // Slots
  let slotRow = document.createElement('div');
  slotRow.className = 'plinko-row';
  for (let s=0; s<plinkoSlots; ++s) {
    let cell = document.createElement('div');
    cell.className = 'plinko-cell plinko-slot';
    cell.textContent = plinkoPayouts[s] > 0 ? `x${plinkoPayouts[s]}` : '';
    // Place balls in slots if any
    let ballsHere = ballPositions.filter(bp => bp.row === plinkoRows && bp.col === s);
    if (ballsHere.length > 0) {
      cell.className += ' plinko-ball';
      cell.textContent = ballsHere.length > 1 ? '⬤'.repeat(Math.min(2, ballsHere.length)) : '⬤';
    }
    slotRow.appendChild(cell);
  }
  board.appendChild(slotRow);
}
buildPlinkoBoard();

document.getElementById('plinko-drop').onclick = function() {
  let bet = getBet('plinko-bet');
  let numBalls = parseInt(document.getElementById('plinko-balls').value) || 1;
  if (numBalls < 1) numBalls = 1;
  if (numBalls > 10) numBalls = 10;
  if (bet * numBalls > houseBalance) {
    document.getElementById('plinko-result').textContent = "Not enough balance!";
    return;
  }
  houseBalance -= bet * numBalls;
  updateBalance();

  // For each ball, simulate its path
  let balls = [];
  for (let b=0; b<numBalls; ++b) {
    let col = Math.floor((plinkoSlots-1)/2);
    let path = [{row:0, col}];
    for (let r=0; r<plinkoRows; ++r) {
      let move = Math.random() < 0.5 ? 0 : 1;
      col = col + move;
      path.push({row:r+1, col});
    }
    balls.push(path);
  }

  // Animate all balls together, step by step
  let animStep = 0;
  function getBallPositionsAtStep(step) {
    let positions = [];
    balls.forEach(path => {
      let pos = path[Math.min(step, path.length-1)];
      positions.push(pos);
    });
    return positions;
  }
  let maxSteps = plinkoRows+1;
  function anim() {
    if (animStep <= maxSteps) {
      buildPlinkoBoard(getBallPositionsAtStep(animStep));
      animStep++;
      setTimeout(anim, 200); // SLOWER: 200ms per step
    } else {
      // Show all balls in their slots and payout
      let slotCounts = Array(plinkoSlots).fill(0);
      balls.forEach(path => {
        let finalCol = path[path.length-1].col;
        slotCounts[finalCol]++;
      });
      let totalWin = 0;
      slotCounts.forEach((count, slot) => {
        totalWin += count * bet * (plinkoPayouts[slot] || 0);
      });
      // Show balls in slots
      let ballPositions = [];
      slotCounts.forEach((count, slot) => {
        if (count > 0) ballPositions.push({row:plinkoRows, col:slot});
      });
      buildPlinkoBoard(ballPositions);
      if (totalWin > 0) {
        document.getElementById('plinko-result').textContent = `You win ${totalWin.toFixed(1)}!`;
      } else {
        document.getElementById('plinko-result').textContent = "No win. Try again!";
      }
      houseBalance += totalWin;
      updateBalance();
    }
  }
  anim();
};
