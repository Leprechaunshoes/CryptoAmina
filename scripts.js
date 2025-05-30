// === NEBULA DICE (REALISTIC CASINO DICE) ===
initDice(){
this.games.dice={bet:null,roll1:1,roll2:1,showingBrand:1,rolling:0};
this.resetDiceUI();
this.updateDiceDisplay();
$('rollBtn').onclick=()=>this.rollDice();
$$('.bet-option').forEach(btn=>btn.onclick=()=>this.selectDiceBet(btn.dataset.bet));
}

resetDiceUI(){
$('diceTotal').textContent='2';
$('selectedBet').textContent='None';
$('rollBtn').disabled=1;
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
this.games.dice.roll1=1;
this.games.dice.roll2=1;
this.games.dice.showingBrand=1;
this.games.dice.rolling=0;
this.setBrandMode('dice1','A');
this.setBrandMode('dice2','C');
}

selectDiceBet(bet){
this.games.dice.bet=bet;
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
document.querySelector(`[data-bet="${bet}"]`).classList.add('selected');
$('selectedBet').textContent=bet.toUpperCase();
$('rollBtn').disabled=0;
}

async rollDice(){
if(!this.games.dice.bet||this.games.dice.rolling)return;
const bet=+$('diceBet').value;
if(!this.deductBalance(bet))return;
this.games.dice.rolling=1;
this.games.dice.showingBrand=0;
// Generate random results
this.games.dice.roll1=Math.floor(Math.random()*6)+1;
this.games.dice.roll2=Math.floor(Math.random()*6)+1;
const total=this.games.dice.roll1+this.games.dice.roll2;
// Start rolling animation
$('dice1').classList.add('rolling');
$('dice2').classList.add('rolling');
// Hide all faces during roll
this.hideAllFaces('dice1');
this.hideAllFaces('dice2');
await new Promise(resolve=>setTimeout(resolve,2000));
// Show results
this.setDiceFace('dice1',this.games.dice.roll1);
this.setDiceFace('dice2',this.games.dice.roll2);
$('diceTotal').textContent=total;
$('dice1').classList.remove('rolling');
$('dice2').classList.remove('rolling');
// Calculate wins
let win=0,mult=1;
if(this.games.dice.bet==='low'&&total>=2&&total<=6){win=1;mult=2;}
if(this.games.dice.bet==='high'&&total>=8&&total<=12){win=1;mult=2;}
if(this.games.dice.bet==='seven'&&total===7){win=1;mult=5;}
if(win){
const winAmt=bet*mult;
this.addBalance(winAmt);
this.showResult('dice',`🎲 WIN! Rolled ${total} - Won ${winAmt.toFixed(2)} ${this.currency}`,'win');
}else{
this.showResult('dice',`🎲 Rolled ${total} - No win!`,'lose');
}
this.games.dice.rolling=0;
// Return to A/C after 1.7 seconds
setTimeout(()=>{
this.games.dice.showingBrand=1;
this.resetDiceUI();
},1700);
}

hideAllFaces(diceId){
const dice=$(diceId);
if(!dice)return;
const allFaces=dice.querySelectorAll('.die-face');
allFaces.forEach(face=>{
face.style.opacity='0';
face.classList.remove('active');
});
}

updateDiceDisplay(){
if(this.games.dice.showingBrand){
this.setBrandMode('dice1','A');
this.setBrandMode('dice2','C');
}else{
this.setDiceFace('dice1',this.games.dice.roll1);
this.setDiceFace('dice2',this.games.dice.roll2);
}
}

setDiceFace(diceId,value){
const dice=$(diceId);
if(!dice)return;
// Hide all faces first
const allFaces=dice.querySelectorAll('.die-face');
allFaces.forEach(face=>{
face.style.opacity='0';
face.classList.remove('active');
});
// Show the target face with dots
const targetFace=dice.querySelector(`.face-${value}`);
if(targetFace){
// Ensure the face has proper dot structure
this.createDots(targetFace,value);
targetFace.style.opacity='1';
targetFace.classList.add('active');
}
}

createDots(face,value){
// Clear existing content and create proper dots
face.innerHTML='';
for(let i=0;i<value;i++){
const dot=document.createElement('div');
dot.className='mega-dot';
face.appendChild(dot);
}
}

setBrandMode(diceId,letter){
const dice=$(diceId);
if(!dice)return;
// Hide all faces
const allFaces=dice.querySelectorAll('.die-face');
allFaces.forEach(face=>{
face.style.opacity='0';
face.classList.remove('active');
});
// Show face-1 with brand letter
const face1=dice.querySelector('.face-1');
if(face1){
face1.innerHTML=`<div class="mega-letter">${letter}</div>`;
face1.style.opacity='1';
face1.classList.add('active');
}
}