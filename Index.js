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

// --- Winners Ticker ---
const fakeNames = ["Starman","Luna","Nebula","Astro","Comet","Orion","Vega","Nova","Cosmo","Galaxia"];
const fakeGames = ["Plinko","Blackjack","Slots"];
function randomTickerMsg() {
  let name = fakeNames[Math.floor(Math.random()*fakeNames.length)];
  let game = fakeGames[Math.floor(Math.random()*fakeGames.length)];
  let win = (Math.random()*400+50).toFixed(1);
  return `🌟 ${name} won ${win} coins on ${game}!`;
}
function updateTicker() {
  let ticker = document.getElementById('winners-ticker');
  let msg = randomTickerMsg();
  ticker.innerHTML = `<span>${msg}</span>`;
}
setInterval(updateTicker, 6500);
updateTicker();

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
      // Highlight winning lines
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
  // Rows
  for (let r=0; r<slotRows; r++) {
    if (grid[r][0] === grid[r][1] && grid[r][1] === grid[r][2]) {
      lines.push(`Row ${r+1}`);
      highlight.push([`${r},0`,`${r},1`,`${r},2`]);
    }
  }
  // Diagonals
  if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    lines.push("↘ Diagonal");
    highlight.push([`0,0`,`1,1`,`2,2`]);
  }
  if (grid[2][0] === grid[1][1] && grid[1][1] === grid[0][2]) {
    lines.push("↗ Diagonal");
    highlight.push([`2,0`,`1,1`,`0,2`]);
  }
  // Center line bonus
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
  // Animate spin
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
const plinkoCanvas = document.getElementById('plinko-canvas');
const plinkoCtx = plinkoCanvas.getContext('2d');
const plinkoRows = 12, plinkoSlots = 13;
const plinkoPayouts = [0,0.5,1,2,4,6,10,6,4,2,1,0.5,0];
const pinRadius = 7, slotHeight = 24;
const plinkoW = plinkoCanvas.width, plinkoH = plinkoCanvas.height;
const boardLeft = 20, boardTop = 20, boardW = plinkoW-40, boardH = plinkoH-40-slotHeight;
function drawPlinkoBoard(balls=[], highlightSlots=[]) {
  plinkoCtx.clearRect(0,0,plinkoW,plinkoH);
  // Draw pins
  for (let r=0; r<plinkoRows; r++) {
    let y = boardTop + r * (boardH/(plinkoRows-1));
    for (let c=0; c<=r; c++) {
      let x = boardLeft + (boardW/(plinkoRows))*(c+((plinkoRows-r)/2));
      plinkoCtx.save();
      plinkoCtx.beginPath();
      plinkoCtx.arc(x, y, pinRadius, 0, 2*Math.PI);
      plinkoCtx.shadowColor = "#ffe600";
      plinkoCtx.shadowBlur = 16;
      plinkoCtx.fillStyle = "#ffe600";
      plinkoCtx.fill();
      plinkoCtx.restore();
    }
  }
  // Draw slots
  for (let s=0; s<plinkoSlots; s++) {
    let x = boardLeft + (boardW/(plinkoSlots-1))*s;
    let y = boardTop + boardH + slotHeight/2;
    plinkoCtx.save();
    plinkoCtx.beginPath();
    plinkoCtx.arc(x, y, pinRadius+2, 0, Math.PI, true);
    plinkoCtx.lineTo(x+pinRadius+2, y+slotHeight/2);
    plinkoCtx.lineTo(x-pinRadius-2, y+slotHeight/2);
    plinkoCtx.closePath();
    plinkoCtx.shadowColor = highlightSlots.includes(s) ? "#39ff14" : "#00f0ff";
    plinkoCtx.shadowBlur = highlightSlots.includes(s) ? 30 : 10;
    plinkoCtx.fillStyle = highlightSlots.includes(s) ? "#39ff1444" : "#00f0ff33";
    plinkoCtx.fill();
    plinkoCtx.strokeStyle = "#00f0ff";
    plinkoCtx.lineWidth = 2;
    plinkoCtx.stroke();
    plinkoCtx.restore();

    // Payout label
    plinkoCtx.save();
    plinkoCtx.font = "1.1rem Arial";
    plinkoCtx.textAlign = "center";
    plinkoCtx.textBaseline = "top";
    plinkoCtx.fillStyle = highlightSlots.includes(s) ? "#39ff14" : "#fff";
    if (plinkoPayouts[s] > 0)
      plinkoCtx.fillText("x"+plinkoPayouts[s], x, y+8);
    plinkoCtx.restore();
  }
  // Draw balls
  balls.forEach(ball => {
    plinkoCtx.save();
    plinkoCtx.beginPath();
    plinkoCtx.arc(ball.x, ball.y, 10, 0, 2*Math.PI);
    let grad = plinkoCtx.createRadialGradient(ball.x, ball.y, 2, ball.x, ball.y, 10);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.3, "#ff00de");
    grad.addColorStop(1, "#00f0ff");
    plinkoCtx.fillStyle = grad;
    plinkoCtx.shadowColor = "#ff00de";
    plinkoCtx.shadowBlur = 24;
    plinkoCtx.fill();
    // Trail
    if (ball.trail) {
      for (let i=0; i<ball.trail.length; i++) {
        let t = ball.trail[i];
        plinkoCtx.globalAlpha = 0.15*(1-i/ball.trail.length);
        plinkoCtx.beginPath();
        plinkoCtx.arc(t.x, t.y, 8, 0, 2*Math.PI);
        plinkoCtx.fill();
      }
      plinkoCtx.globalAlpha = 1;
    }
    plinkoCtx.restore();
  }
}
drawPlinkoBoard();

function plinkoSimulateDrop(numBalls, callback) {
  // Physics: balls fall, bounce left/right at each row, land in slot
  let balls = [];
  let slotXs = [];
  for (let s=0; s<plinkoSlots; s++) {
    slotXs[s] = boardLeft + (boardW/(plinkoSlots-1))*s;
  }
  for (let i=0; i<numBalls; i++) {
    let x = slotXs[Math.floor(plinkoSlots/2)];
    let y = boardTop-10;
    balls.push({
      x, y,
      vx: 0,
      vy: 0.5+Math.random()*0.3,
      row: 0,
      col: Math.floor(plinkoSlots/2),
      trail: []
    });
  }
  let animFrame = 0;
  let finished = 0;
  let slots = Array(plinkoSlots).fill(0);

  function step() {
    let moving = false;
    balls.forEach(ball => {
      if (ball.row < plinkoRows) {
        // Move down
        ball.y += ball.vy;
        // At pin row?
        let targetY = boardTop + ball.row * (boardH/(plinkoRows-1));
        if (ball.y >= targetY) {
          // Bounce left/right
          let move = Math.random() < 0.5 ? -1 : 1;
          ball.col += move;
          if (ball.col < 0) ball.col = 0;
          if (ball.col > plinkoSlots-1) ball.col = plinkoSlots-1;
          ball.x = slotXs[ball.col];
          ball.row++;
        }
        moving = true;
      } else if (!ball.landed) {
        // Land in slot
        let targetY = boardTop + boardH + slotHeight/2 - 10;
        if (ball.y < targetY) {
          ball.y += 2.2;
          moving = true;
        } else {
          ball.y = targetY;
          ball.landed = true;
          slots[ball.col]++;
          finished++;
        }
      }
      // Trail
      ball.trail.unshift({x: ball.x, y: ball.y});
      if (ball.trail.length > 12) ball.trail.pop();
    });
    drawPlinkoBoard(balls, []);
    if (moving) {
      requestAnimationFrame(step);
    } else {
      callback(slots);
    }
  }
  step();
}

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
  document.getElementById('plinko-result').textContent = "";
  plinkoSimulateDrop(numBalls, function(slots) {
    // Animate slot highlight and payout
    let totalWin = 0;
    let highlight = [];
    for (let s=0; s<plinkoSlots; s++) {
      if (slots[s]) {
        highlight.push(s);
        totalWin += slots[s] * bet * (plinkoPayouts[s]||0);
      }
    }
    drawPlinkoBoard([], highlight);
    setTimeout(()=>{
      if (totalWin > 0) {
        document.getElementById('plinko-result').textContent = `You win ${totalWin.toFixed(1)}!`;
        houseBalance += totalWin;
        updateBalance();
      } else {
        document.getElementById('plinko-result').textContent = "No win. Try again!";
      }
      drawPlinko
