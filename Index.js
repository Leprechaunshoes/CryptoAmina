```javascript
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

// --- Slot Machine (Canvas, Animated) ---
const slotSymbols = ['🍒','🍋','🔔','💎','7️⃣','🍀','🌌','👽'];
const slotRows = 3, slotCols = 3;
const slotW = 70, slotH = 40;
const slotCanvas = document.getElementById('slot-canvas');
const slotCtx = slotCanvas.getContext('2d');
function drawSlotGrid(grid, highlightLines=[]) {
  slotCtx.clearRect(0,0,slotCanvas.width,slotCanvas.height);
  for (let r=0; r<slotRows; r++) {
    for (let c=0; c<slotCols; c++) {
      let x = c*slotW+15, y = r*slotH+15;
      slotCtx.save();
      let isHighlight = highlightLines.some(line => line.includes(`${r},${c}`));
      slotCtx.shadowColor = isHighlight ? "#ffe600" : "#00f0ff";
      slotCtx.shadowBlur = isHighlight ? 30 : 12;
      slotCtx.fillStyle = isHighlight ? "#ffe60033" : "#222";
      slotCtx.strokeStyle = "#00f0ff";
      slotCtx.lineWidth = 3;
      slotCtx.beginPath();
      slotCtx.roundRect(x, y, slotW-18, slotH-18, 12);
      slotCtx.fill();
      slotCtx.stroke();
      slotCtx.font = "2rem Arial";
      slotCtx.textAlign = "center";
      slotCtx.textBaseline = "middle";
      slotCtx.fillStyle = isHighlight ? "#fff" : "#fff";
      slotCtx.shadowBlur = 0;
      slotCtx.fillText(grid[r][c], x+(slotW-18)/2, y+(slotH-18)/2+2);
      slotCtx.restore();
    }
  }
}
function randomSlotGrid() {
  let grid = [];
  for (let r=0; r<slotRows; r++) {
    grid[r] = [];
    for (let c=0; c<slotCols; c++) {
      grid[r][c] = slotSymbols[Math.floor(Math.random()*slotSymbols.length)];
    }
  }
  return grid;
}
function slotWinLines(grid) {
  let lines = [], highlight = [];
  for (let r=0; r<slotRows; r++) {
    if (grid[r][0] === grid[r][1] && grid[r][1] === grid[r][2]) {
      lines.push(`Row ${r+1}`);
      highlight.push([`${r},0`,`${r},1`,`${r},2`]);
    }
  }
  if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    lines.push("↘ Diagonal");
    highlight.push([`0,0`,`1,1`,`2,2`]);
  }
  if (grid[2][0] === grid[1][1] && grid[1][1] === grid[0][2]) {
    lines.push("↗ Diagonal");
    highlight.push([`2,0`,`1,1`,`0,2`]);
  }
  if (grid[1][0] === grid[1][1] && grid[1][1] === grid[1][2]) {
    if (!lines.includes("Row 2")) lines.push("Row 2");
    highlight.push([`1,0`,`1,1`,`1,2`]);
  }
  return {lines, highlight};
}
function slotPayout(grid, bet) {
  let payout = 0;
  let {lines} = slotWinLines(grid);
  lines.forEach(line => {
    if (line === "Row 2" || line.includes("Diagonal")) payout += bet * 10;
    else payout += bet * 5;
  });
  return payout;
}
let slotGrid = randomSlotGrid();
drawSlotGrid(slotGrid);

document.getElementById('slot-spin').onclick = function() {
  let bet = getBet('slot-bet');
  if (bet > houseBalance) {
    document.getElementById('slot-result').textContent = "Not enough balance!";
    return;
  }
  houseBalance -= bet;
  updateBalance();
  let spins = 24, grid;
  let anim = setInterval(() => {
    grid = randomSlotGrid();
    drawSlotGrid(grid);
    spins--;
    if (spins === 0) {
      clearInterval(anim);
      slotGrid = grid;
      let {lines, highlight} = slotWinLines(slotGrid);
      drawSlotGrid(slotGrid, highlight);
      let payout = slotPayout(slotGrid, bet);
      if (payout > 0) {
        document.getElementById('slot-result').textContent = `Win! +${payout} (${lines.join(', ')})`;
        houseBalance += payout;
        updateBalance();
      } else {
        document.getElementById('slot-result').textContent = "No win. Try again!";
      }
    }
  }, 50);
};

// --- Cosmic Plinko (Canvas, Physics) ---
const plinkoCanvas =
