
// Cosmic Plinko Game
const plinkoCanvas = document.getElementById('plinko-canvas');
const plinkoCtx = plinkoCanvas.getContext('2d');
const plinkoRows = 10;
const plinkoCols = 9;
const plinkoBallCount = 1;
const plinkoBalls = [];
const plinkoBet = 10;

function drawPlinkoBoard() {
  plinkoCtx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
  const pegRadius = 5;
  const pegColor = '#ffffff';
  const boardWidth = plinkoCanvas.width;
  const boardHeight = plinkoCanvas.height;
  const pegSpacing = boardWidth / (plinkoCols + 1);
  
  for (let r = 0; r < plinkoRows; r++) {
    for (let c = 0; c < plinkoCols; c++) {
      if (c % 2 === r % 2) {
        const x = pegSpacing * (c + 1);
        const y = pegSpacing * (r + 1);
        plinkoCtx.beginPath();
        plinkoCtx.arc(x, y, pegRadius, 0, Math.PI * 2);
        plinkoCtx.fillStyle = pegColor;
        plinkoCtx.fill();
      }
    }
  }
}

function dropBall() {
  const ball = {
    x: plinkoCanvas.width / 2,
    y: 0,
    radius: 8,
    color: '#ffcc00',
    speed: 2,
    direction: Math.random() < 0.5 ? -1 : 1,
  };
  plinkoBalls.push(ball);
}

function updateBalls() {
  for (let i = 0; i < plinkoBalls.length; i++) {
    const ball = plinkoBalls[i];
    ball.y += ball.speed;
    ball.x += ball.direction;

    // Check for collision with pegs
    if (ball.y >= plinkoCanvas.height - ball.radius) {
      ball.y = plinkoCanvas.height - ball.radius;
      ball.direction = Math.random() < 0.5 ? -1 : 1; // Change direction
    }

    // Check for boundary
    if (ball.x < ball.radius || ball.x > plinkoCanvas.width - ball.radius) {
      ball.direction *= -1; // Bounce back
    }
  }
}

function drawBalls() {
  for (let ball of plinkoBalls) {
    plinkoCtx.beginPath();
    plinkoCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    plinkoCtx.fillStyle = ball.color;
    plinkoCtx.fill();
  }
}

function gameLoop() {
  drawPlinkoBoard();
  updateBalls();
  drawBalls();
  requestAnimationFrame(gameLoop);
}

document.getElementById('plinko-drop').onclick = function() {
  const bet = getBet('plinko-bet');
  if (bet > houseBalance) {
    document.getElementById('plinko-result').textContent = "Not enough balance!";
    return;
  }
  houseBalance -= bet;
  updateBalance();
  for (let i = 0; i < plinkoBallCount; i++) {
    dropBall();
  }
};

drawPlinkoBoard();
gameLoop();
