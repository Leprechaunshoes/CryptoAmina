// scripts.js - Clean & Minimal
class AminaCasino{
constructor(){
this.balance={HC:1000,AMINA:0};
this.currentCurrency='HC';
this.isAmina=false;
this.slotSymbols=['⭐','🌟','💫','🌌','🪐','🌙','☄️','🚀','👽','🛸'];
this.connectedAccount=null;
this.peraWallet=null;
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>this.init().catch(console.error),500));
}else{
setTimeout(()=>this.init().catch(console.error),500);
}
}

async init(){
this.setupUI();
this.setupGames();
this.addWalletButton();
this.updateDisplay();
}





setupUI(){
document.querySelectorAll('.nav-btn:not(.donation-btn)').forEach(btn=>{
btn.onclick=()=>this.switchGame(btn.dataset.game);
});
document.querySelectorAll('.game-card').forEach(card=>{
card.onclick=()=>this.switchGame(card.dataset.game);
});
document.getElementById('currencyToggle').onclick=()=>this.toggleCurrency();
}

switchGame(game){
document.querySelectorAll('.game-screen,.nav-btn').forEach(el=>el.classList.remove('active'));
document.getElementById(game).classList.add('active');
document.querySelector(`[data-game="${game}"]`).classList.add('active');
if(game==='plinko')setTimeout(()=>this.initPlinko(),100);
}

addWalletButton(){
const controls=document.querySelector('.header-controls');
if(!controls||document.getElementById('walletBtn'))return;
const btn=document.createElement('button');
btn.id='walletBtn';
btn.className='wallet-btn';
btn.innerHTML='🔗 Connect Wallet';
btn.onclick=()=>this.toggleWallet();
controls.insertBefore(btn,controls.firstChild);
}

async toggleWallet(){
const btn=document.getElementById('walletBtn');
btn.disabled=true;
try{
if(!this.peraWallet)this.peraWallet=new PeraWalletConnect();
if(this.connectedAccount){
await this.peraWallet.disconnect();
this.connectedAccount=null;
this.balance.AMINA=0;
if(this.isAmina)this.toggleCurrency();
this.updateWalletUI();
this.updateDisplay();
}else{
const accounts=await this.peraWallet.connect();
if(accounts?.length>0){
this.connectedAccount=accounts[0];
await this.updateWalletUI();
await this.fetchBalance();
}
}
}catch(error){
console.log('Error:',error);
}finally{
btn.disabled=false;
if(!this.connectedAccount)btn.innerHTML='🔗 Connect Wallet';
}
}

async updateWalletUI(){
const btn=document.getElementById('walletBtn');
if(!btn)return;
if(this.connectedAccount){
const shortAddr=`${this.connectedAccount.slice(0,4)}...${this.connectedAccount.slice(-4)}`;
btn.innerHTML=`🔓 ${shortAddr}`;
}else{
btn.innerHTML='🔗 Connect Wallet';
}
}

async fetchBalance(){
if(!this.connectedAccount)return;
try{
const res=await fetch(`https://mainnet-api.algonode.cloud/v2/accounts/${this.connectedAccount}`);
const data=await res.json();
const asset=data.assets?.find(a=>a['asset-id']===1107424865);
this.balance.AMINA=asset?(asset.amount/1000000):0;
this.updateDisplay();
}catch(e){
this.balance.AMINA=0;
}
}

toggleCurrency(){
if(!this.isAmina&&!this.connectedAccount)return this.notify('🔗 Connect wallet for AMINA!','error');
this.isAmina=!this.isAmina;
this.currentCurrency=this.isAmina?'AMINA':'HC';
const toggle=document.getElementById('currencyToggle');
const text=document.querySelector('.currency-text');
if(this.isAmina){
toggle.classList.add('amina');
text.textContent='AMINA';
this.fetchBalance();
if(window.createAminaCoinRain)window.createAminaCoinRain();
}else{
toggle.classList.remove('amina');
text.textContent='HC';
}
this.updateDisplay();
this.updateBets();
}

updateBets(){
const bets=this.isAmina?['0.25','0.5','0.75','1','1.25','1.5']:['1','5','10'];
['slots','plinko','blackjack'].forEach(game=>{
const select=document.getElementById(`${game}Bet`);
if(select){
const curr=select.value;
select.innerHTML='';
bets.forEach(bet=>{
const opt=document.createElement('option');
opt.value=opt.textContent=bet;
select.appendChild(opt);
});
if(bets.includes(curr))select.value=curr;
}
});
}

updateDisplay(){
const bal=Math.floor(this.balance[this.currentCurrency]*10000)/10000;
document.getElementById('balanceAmount').textContent=bal;
document.getElementById('currencySymbol').textContent=this.currentCurrency;
['slots','plinko','blackjack'].forEach(game=>{
const el=document.getElementById(`${game}Currency`);
if(el)el.textContent=this.currentCurrency;
});
}

async deductBalance(amt){
if(this.balance[this.currentCurrency]<amt)return false;
this.balance[this.currentCurrency]-=amt;
this.animateBalance('lose');
this.updateDisplay();
return true;
}

addBalance(amt){
this.balance[this.currentCurrency]+=amt;
this.animateBalance('win');
this.updateDisplay();
}

animateBalance(type){
const el=document.querySelector('.balance-display');
el.classList.remove('win','lose');
setTimeout(()=>{
el.classList.add(type);
setTimeout(()=>el.classList.remove(type),1000);
},50);
}

notify(msg,type='info'){
const colors={success:'#4CAF50',error:'#F44336',info:'#FFD700'};
const div=document.createElement('div');
div.textContent=msg;
div.style.cssText=`position:fixed;top:20px;right:20px;z-index:1001;background:${colors[type]};color:white;padding:1rem 2rem;border-radius:15px;font-family:'Orbitron',monospace;font-weight:700;transform:translateX(100%);transition:transform 0.3s ease`;
document.body.appendChild(div);
setTimeout(()=>div.style.transform='translateX(0)',50);
setTimeout(()=>{
div.style.transform='translateX(100%)';
setTimeout(()=>div.remove(),300);
},3000);
}

showResult(gameId,msg,type='info'){
const el=document.getElementById(`${gameId}Result`);
if(el){
el.textContent=msg;
el.className=`game-result show ${type}`;
setTimeout(()=>el.classList.remove('show'),4000);
}
}

setupGames(){
this.initSlots();
document.getElementById('spinBtn').onclick=()=>this.spinSlots();
this.initPlinko();
document.getElementById('dropBtn').onclick=()=>this.dropPlinko();
this.initBlackjack();
document.getElementById('dealBtn').onclick=()=>this.dealCards();
document.getElementById('hitBtn').onclick=()=>this.hit();
document.getElementById('standBtn').onclick=()=>this.stand();
document.getElementById('newGameBtn').onclick=()=>this.newGame();
}

initSlots(){
const grid=document.getElementById('slotsGrid');
if(!grid)return;
grid.innerHTML='';
for(let i=0;i<15;i++){
const reel=document.createElement('div');
reel.className='slot-reel';
reel.textContent=this.slotSymbols[Math.floor(Math.random()*this.slotSymbols.length)];
grid.appendChild(reel);
}
if(!document.getElementById('slotPayouts')){
const table=document.createElement('div');
table.id='slotPayouts';
table.className='payout-table';
table.innerHTML='<h3>💰 PAYOUTS</h3><div class="payout-grid"><div class="payout-row high"><span>5 MATCH</span><span>100x</span></div><div class="payout-row med"><span>4 MATCH</span><span>25x</span></div><div class="payout-row low"><span>3 MATCH</span><span>5x</span></div></div>';
document.querySelector('#slots .game-container').appendChild(table);
}
}

async spinSlots(){
const bet=+document.getElementById('slotsBet').value;
if(!(await this.deductBalance(bet)))return this.showResult('slots','Insufficient balance!','lose');
const reels=document.querySelectorAll('.slot-reel');
const btn=document.getElementById('spinBtn');
btn.disabled=true;
btn.textContent='SPINNING...';
reels.forEach(r=>r.classList.add('spinning'));
setTimeout(()=>{
const results=[];
reels.forEach(r=>{
r.classList.remove('spinning');
const sym=this.slotSymbols[Math.floor(Math.random()*this.slotSymbols.length)];
r.textContent=sym;
results.push(sym);
});
const win=this.calcSlotWin(results,bet);
if(win>0){
this.addBalance(win);
this.showResult('slots',`🌟 WIN! +${win} ${this.currentCurrency}`,'win');
}else{
this.showResult('slots','No win this time!','lose');
}
btn.disabled=false;
btn.textContent='SPIN';
},1500);
}

calcSlotWin(results,bet){
const rows=[[results[0],results[1],results[2],results[3],results[4]],[results[5],results[6],results[7],results[8],results[9]],[results[10],results[11],results[12],results[13],results[14]]];
let win=0;
rows.forEach(row=>{
const counts={};
row.forEach(s=>counts[s]=(counts[s]||0)+1);
Object.entries(counts).forEach(([s,c])=>{
if(c>=5)win+=bet*100;
else if(c>=4)win+=bet*25;
else if(c>=3)win+=bet*5;
});
});
return win;
}

initPlinko(){
const canvas=document.getElementById('plinkoCanvas');
if(!canvas)return;
canvas.width=window.innerWidth<768?320:400;
canvas.height=window.innerWidth<768?280:350;
this.ctx=canvas.getContext('2d');
this.dropping=false;
this.setupPegs();
this.drawBoard();
}

setupPegs(){
this.pegs=[];
const w=this.ctx.canvas.width;
for(let row=0;row<10;row++){
const n=row+3;
const space=w*0.75/(n+1);
const start=(w-w*0.75)/2;
for(let i=0;i<n;i++){
this.pegs.push({x:start+space*(i+1),y:35+row*20,r:2.5});
}
}
}

drawBoard(){
const ctx=this.ctx;
const c=ctx.canvas;
ctx.fillStyle='#1a2332';
ctx.fillRect(0,0,c.width,c.height);
this.pegs.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fillStyle='#4a5568';
ctx.fill();
});
}

async dropPlinko(){
const bet=+document.getElementById('plinkoBet').value;
if(this.dropping||!(await this.deductBalance(bet)))return this.showResult('plinko','Ball dropping or insufficient balance!','lose');
this.dropping=true;
const btn=document.getElementById('dropBtn');
btn.disabled=true;
btn.textContent='DROPPING...';
const slot=await this.animateBall();
const mults=[10,3,1.5,1.4,1.1,1,0.5,1,1.1,1.4,1.5,3,10];
const mult=mults[slot]||0.5;
const win=bet*mult;
this.addBalance(win);
this.showResult('plinko',`Hit ${mult}x! ${win>=bet?'Won':'Lost'} ${Math.abs(win-bet).toFixed(2)}!`,win>=bet?'win':'lose');
document.querySelectorAll('.multiplier').forEach((m,i)=>m.classList.toggle('hit',i===slot));
setTimeout(()=>document.querySelectorAll('.multiplier').forEach(m=>m.classList.remove('hit')),2000);
this.dropping=false;
btn.disabled=false;
btn.textContent='DROP BALL';
}

animateBall(){
return new Promise(resolve=>{
const c=this.ctx.canvas;
const ball={x:c.width/2,y:15,vx:0,vy:0,r:4,g:0.2,b:0.3};
const animate=()=>{
this.drawBoard();
ball.vy+=ball.g;
ball.x+=ball.vx;
ball.y+=ball.vy;
this.pegs.forEach(p=>{
const dx=ball.x-p.x;
const dy=ball.y-p.y;
const d=Math.sqrt(dx*dx+dy*dy);
if(d<ball.r+p.r){
const a=Math.atan2(dy,dx);
ball.x=p.x+Math.cos(a)*(ball.r+p.r+1);
ball.y=p.y+Math.sin(a)*(ball.r+p.r+1);
ball.vx+=(Math.random()-0.5)*0.8;
ball.vy=Math.abs(ball.vy)*ball.b+0.3;
}
});
if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)*0.5;}
if(ball.x>c.width-ball.r){ball.x=c.width-ball.r;ball.vx=-Math.abs(ball.vx)*0.5;}
this.ctx.beginPath();
this.ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
this.ctx.fillStyle='#48bb78';
this.ctx.fill();
if(ball.y>c.height-30){
let slot=Math.floor(ball.x/(c.width/13));
slot=Math.max(0,Math.min(12,slot));
resolve(slot);
}else{
requestAnimationFrame(animate);
}
};
animate();
});
}

initBlackjack(){
this.pHand=[];
this.dHand=[];
this.active=false;
this.deck=[];
const suits=['♠','♥','♦','♣'];
const vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
suits.forEach(s=>vals.forEach(v=>this.deck.push({v,s})));
for(let i=this.deck.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];
}
}

async dealCards(){
const bet=+document.getElementById('blackjackBet').value;
if(!(await this.deductBalance(bet)))return this.showResult('blackjack','Insufficient balance!','lose');
this.bet=bet;
this.pHand=[this.deck.pop(),this.deck.pop()];
this.dHand=[this.deck.pop(),this.deck.pop()];
this.active=true;
this.updateBJ();
document.getElementById('dealBtn').disabled=true;
document.getElementById('hitBtn').disabled=false;
document.getElementById('standBtn').disabled=false;
}

hit(){
if(!this.active)return;
this.pHand.push(this.deck.pop());
this.updateBJ();
if(this.getVal(this.pHand)>21)this.endBJ('💥 Bust!',0,'lose');
}

stand(){
if(!this.active)return;
while(this.getVal(this.dHand)<17)this.dHand.push(this.deck.pop());
this.updateBJ(true);
const pv=this.getVal(this.pHand);
const dv=this.getVal(this.dHand);
if(dv>21)this.endBJ('🎉 Dealer busts!',this.bet*2,'win');
else if(pv>dv)this.endBJ('🎉 You win!',this.bet*2,'win');
else if(pv<dv)this.endBJ('😔 Dealer wins!',0,'lose');
else this.endBJ('🤝 Push!',this.bet,'win');
}

getVal(hand){
let val=0,aces=0;
hand.forEach(c=>{
if(c.v==='A'){aces++;val+=11;}
else if(['J','Q','K'].includes(c.v))val+=10;
else val+=+c.v;
});
while(val>21&&aces>0){val-=10;aces--;}
return val;
}

updateBJ(showAll=false){
this.showHand('player',this.pHand,true);
this.showHand('dealer',this.dHand,showAll||!this.active);
document.getElementById('playerScore').textContent=this.getVal(this.pHand);
document.getElementById('dealerScore').textContent=(showAll||!this.active)?this.getVal(this.dHand):this.getVal([this.dHand[0]]);
}

showHand(who,hand,showAll=true){
const el=document.getElementById(`${who}Cards`);
if(!el)return;
el.innerHTML='';
hand.forEach((c,i)=>{
const card=document.createElement('div');
card.className='playing-card';
if(who==='dealer'&&i===1&&!showAll){
card.classList.add('back');
card.textContent='🎭';
}else{
card.innerHTML=`${c.v}<br>${c.s}`;
if(['♥','♦'].includes(c.s))card.classList.add('red');
}
el.appendChild(card);
});
}

endBJ(msg,win=0,type='info'){
this.active=false;
if(win>0){
this.addBalance(win);
msg+=` +${win} ${this.currentCurrency}`;
}
this.updateBJ(true);
this.showResult('blackjack',msg,type);
document.getElementById('hitBtn').disabled=true;
document.getElementById('standBtn').disabled=true;
document.getElementById('newGameBtn').style.display='inline-block';
}

newGame(){
this.initBlackjack();
document.getElementById('dealBtn').disabled=false;
document.getElementById('newGameBtn').style.display='none';
document.getElementById('blackjackResult').classList.remove('show');
['player','dealer'].forEach(p=>{
const cards=document.getElementById(`${p}Cards`);
const score=document.getElementById(`${p}Score`);
if(cards)cards.innerHTML='';
if(score)score.textContent='0';
});
}
}

document.addEventListener('DOMContentLoaded',()=>{
window.aminaCasino=new AminaCasino();
});