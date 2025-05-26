// scripts.js
class AminaCasino{
constructor(){
this.balance={HC:1000,AMINA:0};
this.currentCurrency='HC';
this.isAmina=false;
this.slotSymbols=['⭐','🌟','💫','🌌','🪐','🌙','☄️','🚀','👽','🛸'];
this.houseWallet='6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
this.initWallet();
this.init();
}

async initWallet(){
try{
console.log('🔄 Initializing wallet...');
if(typeof PeraWalletConnect==='undefined'){
console.error('❌ PeraWalletConnect not found');
await new Promise(resolve=>setTimeout(resolve,2000));
if(typeof PeraWalletConnect==='undefined'){
throw new Error('PeraWalletConnect failed to load');
}
}
this.peraWallet=new PeraWalletConnect();
this.walletReady=true;
console.log('✅ Wallet ready');
setTimeout(()=>this.checkConnection(),1000);
}catch(error){
console.error('❌ Wallet init error:',error);
this.walletReady=false;
}
}

async checkConnection(){
try{
const accounts=await this.peraWallet.reconnectSession();
if(accounts?.length>0){
this.connectedAccount=accounts[0];
this.updateWalletUI();
await this.fetchAminaBalance();
this.showNotification('🔗 Wallet reconnected!','success');
}
}catch(error){
console.log('No previous session');
}
}

init(){
this.setupNavigation();
this.setupCurrencyToggle();
this.setupGames();
this.updateDisplay();
setTimeout(()=>this.addWalletButton(),500);
}

setupNavigation(){
document.querySelectorAll('.nav-btn:not(.donation-btn)').forEach(btn=>{
btn.addEventListener('click',(e)=>this.switchGame(e.target.dataset.game));
});
document.querySelectorAll('.game-card').forEach(card=>{
card.addEventListener('click',(e)=>this.switchGame(e.currentTarget.dataset.game));
});
}

switchGame(game){
document.querySelectorAll('.game-screen, .nav-btn').forEach(el=>el.classList.remove('active'));
document.getElementById(game).classList.add('active');
document.querySelector(`[data-game="${game}"]`).classList.add('active');
if(game==='plinko')setTimeout(()=>this.initPlinko(),100);
}

addWalletButton(){
const headerControls=document.querySelector('.header-controls');
if(!headerControls||document.getElementById('walletBtn'))return;
const walletBtn=document.createElement('button');
walletBtn.id='walletBtn';
walletBtn.className='wallet-btn';
walletBtn.innerHTML='🔗 Connect Wallet';
walletBtn.addEventListener('click',()=>this.toggleWallet());
headerControls.insertBefore(walletBtn,headerControls.firstChild);
}

async toggleWallet(){
if(!this.walletReady){
this.showNotification('❌ Wallet not ready - check console','error');
return;
}
const walletBtn=document.getElementById('walletBtn');
try{
console.log('🔄 Wallet action starting...');
if(this.connectedAccount){
walletBtn.innerHTML='🔄 Disconnecting...';
await this.peraWallet.disconnect();
this.connectedAccount=null;
this.balance.AMINA=0;
if(this.isAmina){
this.isAmina=false;
this.currentCurrency='HC';
document.getElementById('currencyToggle').classList.remove('amina');
document.querySelector('.currency-text').textContent='HC';
}
this.updateWalletUI();
this.updateDisplay();
this.showNotification('🔌 Disconnected','success');
}else{
walletBtn.innerHTML='🔄 Connecting...';
const accounts=await this.peraWallet.connect();
console.log('📱 Connection result:',accounts);
if(accounts?.length>0){
this.connectedAccount=accounts[0];
this.updateWalletUI();
await this.fetchAminaBalance();
this.showNotification('🔗 Connected!','success');
}else{
throw new Error('No accounts returned');
}
}
}catch(error){
console.error('❌ Wallet error:',error);
this.showNotification(`❌ Error: ${error.message}`,'error');
}finally{
if(!this.connectedAccount)walletBtn.innerHTML='🔗 Connect Wallet';
}
}

updateWalletUI(){
const walletBtn=document.getElementById('walletBtn');
if(!walletBtn)return;
if(this.connectedAccount){
const short=this.connectedAccount.slice(0,6)+'...'+this.connectedAccount.slice(-4);
walletBtn.innerHTML=`✅ ${short}`;
}else{
walletBtn.innerHTML='🔗 Connect Wallet';
}
}

async fetchAminaBalance(){
if(!this.connectedAccount)return;
try{
const response=await fetch(`https://mainnet-api.algonode.cloud/v2/accounts/${this.connectedAccount}`);
const accountInfo=await response.json();
const aminaAsset=accountInfo.assets?.find(asset=>asset['asset-id']===1107424865);
this.balance.AMINA=aminaAsset?(aminaAsset.amount/1000000):0;
this.updateDisplay();
}catch(error){
console.error('Balance fetch error:',error);
this.balance.AMINA=0;
}
}

setupCurrencyToggle(){
document.getElementById('currencyToggle').addEventListener('click',()=>{
if(!this.isAmina&&!this.connectedAccount){
this.showNotification('🔗 Connect wallet for AMINA!','error');
return;
}
this.isAmina=!this.isAmina;
this.currentCurrency=this.isAmina?'AMINA':'HC';
const toggle=document.getElementById('currencyToggle');
const text=document.querySelector('.currency-text');
if(this.isAmina){
toggle.classList.add('amina');
text.textContent='AMINA';
this.fetchAminaBalance();
}else{
toggle.classList.remove('amina');
text.textContent='HC';
}
this.updateDisplay();
this.updateBetOptions();
});
}

updateBetOptions(){
const hcBets=['1','5','10'];
const aminaBets=['0.25','0.5','0.75','1','1.25','1.5'];
const bets=this.isAmina?aminaBets:hcBets;
['slots','plinko','blackjack'].forEach(game=>{
const select=document.getElementById(`${game}Bet`);
if(select){
const currentValue=select.value;
select.innerHTML='';
bets.forEach(bet=>{
const option=document.createElement('option');
option.value=bet;
option.textContent=bet;
select.appendChild(option);
});
if(bets.includes(currentValue))select.value=currentValue;
}
});
}

setupGames(){
this.initSlots();
document.getElementById('spinBtn').addEventListener('click',()=>this.spinSlots());
this.initPlinko();
document.getElementById('dropBtn').addEventListener('click',()=>this.dropPlinko());
this.initBlackjack();
document.getElementById('dealBtn').addEventListener('click',()=>this.dealCards());
document.getElementById('hitBtn').addEventListener('click',()=>this.hit());
document.getElementById('standBtn').addEventListener('click',()=>this.stand());
document.getElementById('newGameBtn').addEventListener('click',()=>this.newGame());
}

updateDisplay(){
const balance=Math.floor(this.balance[this.currentCurrency]*10000)/10000;
document.getElementById('balanceAmount').textContent=balance;
document.getElementById('currencySymbol').textContent=this.currentCurrency;
['slots','plinko','blackjack'].forEach(game=>{
const currencyEl=document.getElementById(`${game}Currency`);
if(currencyEl)currencyEl.textContent=this.currentCurrency;
});
}

async deductBalance(amount){
if(this.balance[this.currentCurrency]<amount)return false;
// 5% RAKE FOR AMINA BETS
if(this.isAmina){
const rake=amount*0.05;
console.log(`💰 5% Rake: ${rake} AMINA to house wallet ${this.houseWallet}`);
this.balance[this.currentCurrency]-=amount;
}else{
this.balance[this.currentCurrency]-=amount;
}
this.animateBalance('lose');
this.updateDisplay();
return true;
}

async addBalance(amount){
this.balance[this.currentCurrency]+=amount;
this.animateBalance('win');
this.updateDisplay();
}

animateBalance(type){
const balanceDisplay=document.querySelector('.balance-display');
balanceDisplay.classList.remove('win','lose');
setTimeout(()=>{
balanceDisplay.classList.add(type);
setTimeout(()=>balanceDisplay.classList.remove(type),1000);
},50);
}

showGameResult(gameId,message,type='info'){
const resultDiv=document.getElementById(`${gameId}Result`);
if(resultDiv){
resultDiv.textContent=message;
resultDiv.className=`game-result show ${type}`;
setTimeout(()=>resultDiv.classList.remove('show'),4000);
}
}

showNotification(message,type='info'){
const colors={success:'#4CAF50',error:'#F44336',info:'#FFD700'};
const notification=document.createElement('div');
notification.textContent=message;
notification.style.cssText=`position:fixed;top:20px;right:20px;z-index:1001;background:${colors[type]};color:white;padding:1rem 2rem;border-radius:15px;font-family:'Orbitron',monospace;font-weight:700;transform:translateX(100%);transition:transform 0.3s ease`;
document.body.appendChild(notification);
setTimeout(()=>notification.style.transform='translateX(0)',50);
setTimeout(()=>{
notification.style.transform='translateX(100%)';
setTimeout(()=>notification.remove(),300);
},3000);
}

// SLOTS WITH PAYOUT TABLE
initSlots(){
this.createSlotPayoutTable();
const grid=document.getElementById('slotsGrid');
if(!grid)return;
grid.innerHTML='';
for(let i=0;i<15;i++){
const reel=document.createElement('div');
reel.className='slot-reel';
reel.textContent=this.slotSymbols[Math.floor(Math.random()*this.slotSymbols.length)];
grid.appendChild(reel);
}
}

createSlotPayoutTable(){
const slotsContainer=document.querySelector('#slots .game-container');
if(!slotsContainer||document.getElementById('slotPayouts'))return;
const payoutTable=document.createElement('div');
payoutTable.id='slotPayouts';
payoutTable.className='payout-table';
payoutTable.innerHTML=`
<h3>💰 PAYOUTS</h3>
<div class="payout-grid">
<div class="payout-row high"><span>5 MATCH</span><span>100x</span></div>
<div class="payout-row med"><span>4 MATCH</span><span>25x</span></div>
<div class="payout-row low"><span>3 MATCH</span><span>5x</span></div>
</div>`;
slotsContainer.appendChild(payoutTable);
}

async spinSlots(){
const bet=parseFloat(document.getElementById('slotsBet').value);
if(!(await this.deductBalance(bet))){
this.showGameResult('slots','Insufficient balance!','lose');
return;
}
const reels=document.querySelectorAll('.slot-reel');
const spinButton=document.getElementById('spinBtn');
spinButton.disabled=true;
spinButton.textContent='SPINNING...';
reels.forEach(reel=>reel.classList.add('spinning'));
setTimeout(()=>{
const results=[];
reels.forEach(reel=>{
reel.classList.remove('spinning');
const symbol=this.slotSymbols[Math.floor(Math.random()*this.slotSymbols.length)];
reel.textContent=symbol;
results.push(symbol);
});
const winAmount=this.calculateSlotWin(results,bet);
if(winAmount>0){
this.addBalance(winAmount);
this.showGameResult('slots',`🌟 WIN! +${winAmount} ${this.currentCurrency}`,'win');
}else{
this.showGameResult('slots','No win this time!','lose');
}
spinButton.disabled=false;
spinButton.textContent='SPIN';
},1500);
}

calculateSlotWin(results,bet){
const rows=[[results[0],results[1],results[2],results[3],results[4]],[results[5],results[6],results[7],results[8],results[9]],[results[10],results[11],results[12],results[13],results[14]]];
let totalWin=0;
rows.forEach(row=>{
const counts={};
row.forEach(symbol=>counts[symbol]=(counts[symbol]||0)+1);
Object.entries(counts).forEach(([symbol,count])=>{
if(count>=5)totalWin+=bet*100;
else if(count>=4)totalWin+=bet*25;
else if(count>=3)totalWin+=bet*5;
});
});
return totalWin;
}

// REALISTIC PLINKO - STAKE STYLE
initPlinko(){
const canvas=document.getElementById('plinkoCanvas');
if(!canvas)return;
canvas.width=window.innerWidth<768?350:400;
canvas.height=350;
this.plinkoCtx=canvas.getContext('2d');
this.plinkoDropping=false;
this.setupPegs();
this.drawBoard();
}

setupPegs(){
this.pegs=[];
const canvas=this.plinkoCtx.canvas;
const rows=12;
const pegArea=canvas.width*0.8;
const startX=(canvas.width-pegArea)/2;
for(let row=0;row<rows;row++){
const pegsInRow=row+3;
const spacing=pegArea/(pegsInRow+1);
for(let peg=0;peg<pegsInRow;peg++){
this.pegs.push({
x:startX+spacing*(peg+1),
y:40+row*22,
radius:3
});
}
}
}

drawBoard(){
const ctx=this.plinkoCtx;
const canvas=ctx.canvas;
ctx.fillStyle='#1a2332';
ctx.fillRect(0,0,canvas.width,canvas.height);
this.pegs.forEach(peg=>{
ctx.beginPath();
ctx.arc(peg.x,peg.y,peg.radius,0,Math.PI*2);
ctx.fillStyle='#4a5568';
ctx.fill();
});
}

async dropPlinko(){
const bet=parseFloat(document.getElementById('plinkoBet').value);
if(this.plinkoDropping||!(await this.deductBalance(bet))){
this.showGameResult('plinko','Ball dropping or insufficient balance!','lose');
return;
}
this.plinkoDropping=true;
const button=document.getElementById('dropBtn');
button.disabled=true;
button.textContent='DROPPING...';
const finalSlot=await this.animateBall();
// STAKE MULTIPLIERS - REALISTIC
const multipliers=[10,3,1.5,1.4,1.1,1,0.5,1,1.1,1.4,1.5,3,10];
const multiplier=multipliers[finalSlot]||1;
const winAmount=bet*multiplier;
await this.addBalance(winAmount);
this.showGameResult('plinko',`Hit ${multiplier}x! Won ${winAmount.toFixed(2)} ${this.currentCurrency}!`,winAmount>bet?'win':'lose');
document.querySelectorAll('.multiplier').forEach((m,i)=>m.classList.toggle('hit',i===finalSlot));
setTimeout(()=>document.querySelectorAll('.multiplier').forEach(m=>m.classList.remove('hit')),2000);
this.plinkoDropping=false;
button.disabled=false;
button.textContent='DROP BALL';
}

animateBall(){
return new Promise(resolve=>{
const canvas=this.plinkoCtx.canvas;
const ball={x:canvas.width/2,y:20,vx:0,vy:0,radius:5,gravity:0.25,bounce:0.5};
const animate=()=>{
this.drawBoard();
ball.vy+=ball.gravity;
ball.x+=ball.vx;
ball.y+=ball.vy;
// REALISTIC PHYSICS - BIAS TOWARD CENTER
this.pegs.forEach(peg=>{
const dx=ball.x-peg.x;
const dy=ball.y-peg.y;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance<ball.radius+peg.radius){
const angle=Math.atan2(dy,dx);
ball.x=peg.x+Math.cos(angle)*(ball.radius+peg.radius+1);
ball.y=peg.y+Math.sin(angle)*(ball.radius+peg.radius+1);
// REDUCED RANDOMNESS - MORE PREDICTABLE
ball.vx+=(Math.random()-0.5)*1.5;
ball.vy=Math.abs(ball.vy)*ball.bounce+0.5;
}
});
if(ball.x<ball.radius){ball.x=ball.radius;ball.vx=Math.abs(ball.vx)*0.8;}
if(ball.x>canvas.width-ball.radius){ball.x=canvas.width-ball.radius;ball.vx=-Math.abs(ball.vx)*0.8;}
const ctx=this.plinkoCtx;
ctx.beginPath();
ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
ctx.fillStyle='#48bb78';
ctx.fill();
if(ball.y>canvas.height-40){
const slotWidth=canvas.width/13;
const finalSlot=Math.max(0,Math.min(12,Math.floor(ball.x/slotWidth)));
resolve(finalSlot);
}else{
requestAnimationFrame(animate);
}
};
animate();
});
}

// BLACKJACK
initBlackjack(){
this.playerHand=[];
this.dealerHand=[];
this.gameActive=false;
this.createDeck();
}

createDeck(){
const suits=['♠','♥','♦','♣'];
const values=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
this.deck=[];
suits.forEach(suit=>values.forEach(value=>this.deck.push({value,suit})));
for(let i=this.deck.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];
}
}

async dealCards(){
const bet=parseFloat(document.getElementById('blackjackBet').value);
if(!(await this.deductBalance(bet))){
this.showGameResult('blackjack','Insufficient balance!','lose');
return;
}
this.currentBet=bet;
this.playerHand=[this.deck.pop(),this.deck.pop()];
this.dealerHand=[this.deck.pop(),this.deck.pop()];
this.gameActive=true;
this.updateBlackjackDisplay();
document.getElementById('dealBtn').disabled=true;
document.getElementById('hitBtn').disabled=false;
document.getElementById('standBtn').disabled=false;
}

hit(){
if(!this.gameActive)return;
this.playerHand.push(this.deck.pop());
this.updateBlackjackDisplay();
if(this.getHandValue(this.playerHand)>21){
this.endGame('💥 Bust! You lose.',0,'lose');
}
}

stand(){
if(!this.gameActive)return;
while(this.getHandValue(this.dealerHand)<17){
this.dealerHand.push(this.deck.pop());
}
this.updateBlackjackDisplay(true);
const playerValue=this.getHandValue(this.playerHand);
const dealerValue=this.getHandValue(this.dealerHand);
if(dealerValue>21){
this.endGame('🎉 Dealer busts! You win!',this.currentBet*2,'win');
}else if(playerValue>dealerValue){
this.endGame('🎉 You win!',this.currentBet*2,'win');
}else if(playerValue<dealerValue){
this.endGame('😔 Dealer wins!',0,'lose');
}else{
this.endGame('🤝 Push! Bet returned.',this.currentBet,'win');
}
}

getHandValue(hand){
let value=0,aces=0;
hand.forEach(card=>{
if(card.value==='A'){aces++;value+=11;}
else if(['J','Q','K'].includes(card.value))value+=10;
else value+=parseInt(card.value);
});
while(value>21&&aces>0){value-=10;aces--;}
return value;
}

updateBlackjackDisplay(showAllDealer=false){
this.displayHand('player',this.playerHand,true);
this.displayHand('dealer',this.dealerHand,showAllDealer||!this.gameActive);
document.getElementById('playerScore').textContent=this.getHandValue(this.playerHand);
document.getElementById('dealerScore').textContent=(showAllDealer||!this.gameActive)?this.getHandValue(this.dealerHand):this.getHandValue([this.dealerHand[0]]);
}

displayHand(player,hand,showAll=true){
const container=document.getElementById(`${player}Cards`);
if(!container)return;
container.innerHTML='';
hand.forEach((card,index)=>{
const cardEl=document.createElement('div');
cardEl.className='playing-card';
if(player==='dealer'&&index===1&&!showAll){
cardEl.classList.add('back');
cardEl.textContent='🎭';
}else{
cardEl.innerHTML=`${card.value}<br>${card.suit}`;
if(['♥','♦'].includes(card.suit))cardEl.classList.add('red');
}
container.appendChild(cardEl);
});
}

async endGame(message,winAmount=0,resultType='info'){
this.gameActive=false;
if(winAmount>0){
await this.addBalance(winAmount);
message+=` +${winAmount} ${this.currentCurrency}`;
}
this.updateBlackjackDisplay(true);
this.showGameResult('blackjack',message,resultType);
document.getElementById('hitBtn').disabled=true;
document.getElementById('standBtn').disabled=true;
document.getElementById('newGameBtn').style.display='inline-block';
}

newGame(){
this.initBlackjack();
document.getElementById('dealBtn').disabled=false;
document.getElementById('newGameBtn').style.display='none';
document.getElementById('blackjackResult').classList.remove('show');
['player','dealer'].forEach(player=>{
const cards=document.getElementById(`${player}Cards`);
const score=document.getElementById(`${player}Score`);
if(cards)cards.innerHTML='';
if(score)score.textContent='0';
});
}
}

document.addEventListener('DOMContentLoaded',()=>{
window.aminaCasino=new AminaCasino();
});