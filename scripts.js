// AMINA CASINO - STREAMLINED COSMIC ENGINE
class AminaCasino{
constructor(){
this.balance={HC:this.getHCBalance(),AMINA:0};
this.currency='HC';
this.wallet=null;
this.aminaId=1107424865;
this.casinoWallet='6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
this.games={
slots:{symbols:['⭐','🌟','💫','🌌','🪐','🌙','☄️','🚀','👽','🛸'],scatter:'🌠',grid:[],spinning:0,win:0,mult:1,spins:0},
plinko:{balls:[],max:5},
bj:{pHand:[],dHand:[],deck:[],active:0,bet:0},
hilo:{card:null,streak:0,bet:0,active:0},
dice:{bet:null,roll1:1,roll2:1}
};
this.music={on:0,audio:null};
this.init();
}

getHCBalance(){
const today=new Date().toDateString();
const stored=localStorage.getItem('hc_data');
if(stored){
const data=JSON.parse(stored);
if(data.date===today)return data.balance;
}
localStorage.setItem('hc_data',JSON.stringify({date:today,balance:1000}));
return 1000;
}

saveHCBalance(){
const today=new Date().toDateString();
localStorage.setItem('hc_data',JSON.stringify({date:today,balance:this.balance.HC}));
}

async fetchAminaBalance(wallet){
try{
const response=await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${wallet}/assets`);
const data=await response.json();
const aminaAsset=data.assets?.find(a=>a['asset-id']===this.aminaId);
const balance=aminaAsset?aminaAsset.amount/100000000:0;
console.log('AMINA Balance:',balance);
return balance;
}catch(e){
console.error('Balance fetch error:',e);
this.notify('❌ Error fetching balance');
return 0;
}
}

init(){
this.setupUI();
this.setupGames();
this.setupMusic();
this.createEffects();
this.updateDisplay();
console.log('🚀 Amina Casino LIVE!');
}

setupUI(){
$('enterCasino').onclick=()=>this.enterCasino();
$('walletBtn').onclick=()=>this.toggleWallet();
$('currencyToggle').onclick=()=>this.toggleCurrency();
this.setupOrb();
$$('.game-card').forEach(c=>c.onclick=()=>this.switchGame(c.dataset.game));
}

setupOrb(){
const orb=$('cosmicOrb'),menu=$('orbitalMenu');
let open=0;
orb.onclick=()=>{
open=!open;
menu.classList.toggle('open',open);
orb.style.transform=open?'scale(0.9)':'scale(1)';
};
$$('.orbital-item').forEach(i=>{
i.onclick=()=>{
this.switchGame(i.dataset.game);
open=0;
menu.classList.remove('open');
orb.style.transform='scale(1)';
};
});
document.addEventListener('click',e=>{
if(!e.target.closest('.cosmic-orb-menu')&&open){
open=0;
menu.classList.remove('open');
orb.style.transform='scale(1)';
}
});
}

enterCasino(){
$('welcomeScreen').classList.remove('active');
$('mainCasino').classList.add('active');
if(this.music.audio&&!this.music.on){
this.music.audio.play().then(()=>{
this.music.on=1;
$('musicToggle').innerHTML='🎵';
}).catch(()=>{
console.log('Auto-play blocked by browser');
});
}
}

async toggleWallet(){
if(this.wallet){
this.wallet=null;
this.balance.AMINA=0;
if(this.currency==='AMINA')this.toggleCurrency();
this.updateWalletUI();
this.notify('Wallet disconnected');
}else{
const addr=prompt('Enter Algorand wallet:');
if(addr&&addr.length===58){
this.wallet=addr;
this.balance.AMINA=await this.fetchAminaBalance(addr);
this.updateWalletUI();
this.notify('Wallet connected! 🚀');
}else if(addr)this.notify('Invalid address');
}
}

updateWalletUI(){
const btn=$('walletBtn');
btn.innerHTML=this.wallet?'🔓 '+this.wallet.slice(0,4)+'...'+this.wallet.slice(-4):'🔗 Connect Wallet';
}

async toggleCurrency(){
if(this.currency==='HC'&&!this.wallet){
this.notify('🔗 Connect wallet for AMINA!');
return;
}
const newCurrency=this.currency==='HC'?'AMINA':'HC';
const toggle=$('currencyToggle');
const text=toggle.querySelector('.currency-text');

if(newCurrency==='AMINA'){
this.notify('Fetching AMINA balance...');
this.balance.AMINA=await this.fetchAminaBalance(this.wallet);
this.currency='AMINA';
toggle.classList.add('amina');
text.textContent='AMINA';
}else{
this.currency='HC';
toggle.classList.remove('amina');
text.textContent='HC';
}
this.updateBets();
this.updateDisplay();
}

updateBets(){
const bets=this.currency==='HC'?['1','5','10']:['0.05','0.1','0.2'];
['slots','plinko','blackjack','hilo','dice'].forEach(g=>{
const sel=$(`${g}Bet`);
if(sel){
const curr=sel.value;
sel.innerHTML='';
bets.forEach(b=>{
const opt=document.createElement('option');
opt.value=opt.textContent=b;
sel.appendChild(opt);
});
if(bets.includes(curr))sel.value=curr;
}
});
}

updateDisplay(){
const bal=this.balance[this.currency];
$('balanceAmount').textContent=this.currency==='AMINA'?bal.toFixed(6):bal.toFixed(0);
$('currencySymbol').textContent=this.currency;
['slots','plinko','blackjack','hilo','dice'].forEach(g=>{
const el=$(`${g}Currency`);
if(el)el.textContent=this.currency;
});
}

deductBalance(amt){
if(this.balance[this.currency]<amt){
this.notify('Insufficient balance!');
return 0;
}
this.balance[this.currency]-=amt;
if(this.currency==='HC')this.saveHCBalance();
this.updateDisplay();
return 1;
}

addBalance(amt){
if(this.currency==='AMINA')amt*=0.95; // 5% rake
this.balance[this.currency]+=amt;
if(this.currency==='HC')this.saveHCBalance();
this.updateDisplay();
}

switchGame(id){
$$('.game-screen').forEach(s=>s.classList.remove('active'));
$(id).classList.add('active');
if(id==='slots')this.initSlots();
if(id==='plinko')this.initPlinko();
if(id==='blackjack')this.initBJ();
if(id==='hilo')this.initHilo();
if(id==='dice')this.initDice();
}

notify(msg,type='info'){
const div=document.createElement('div');
div.textContent=msg;
div.style.cssText=`position:fixed;top:20px;right:20px;z-index:1001;background:#FFD700;color:#000;padding:1rem 2rem;border-radius:15px;font-family:JetBrains Mono,monospace;font-weight:700;transform:translateX(100%);transition:transform .3s ease`;
document.body.appendChild(div);
setTimeout(()=>div.style.transform='translateX(0)',50);
setTimeout(()=>{
div.style.transform='translateX(100%)';
setTimeout(()=>div.remove(),300);
},3000);
}

showResult(game,msg,type='info'){
const el=$(`${game}Result`);
if(el){
el.textContent=msg;
el.className=`game-result show ${type}`;
setTimeout(()=>el.classList.remove('show'),4000);
}
}

// === COSMIC CHAOS SLOTS ===
initSlots(){
this.games.slots.grid=Array(5).fill().map(()=>Array(6).fill(''));
this.games.slots.win=0;
this.games.slots.mult=1;
this.games.slots.spins=0;
this.games.slots.spinning=0;
this.createSlotsGrid();
this.fillGrid();
this.updateSlotsDisplay();
$('spinBtn').onclick=()=>this.spinSlots();
$('buyBonusBtn').onclick=()=>this.buyBonus();
$('autoplayBtn').onclick=()=>this.toggleAuto();
}

createSlotsGrid(){
const grid=$('chaosGrid');
if(!grid)return;
grid.innerHTML='';
for(let i=0;i<30;i++){
const sym=document.createElement('div');
sym.className='chaos-symbol';
sym.id=`chaos-${i}`;
grid.appendChild(sym);
}
}

fillGrid(){
const syms=this.games.slots.symbols;
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
this.games.slots.grid[r][c]=syms[Math.floor(Math.random()*syms.length)];
}
}
}

updateSlotsDisplay(){
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
const idx=r*6+c;
const sym=$(`chaos-${idx}`);
if(sym)sym.textContent=this.games.slots.grid[r][c];
}
}
$('currentMultiplier').textContent=`${this.games.slots.mult}x`;
$('freeSpinsCount').textContent=this.games.slots.spins;
$('totalWin').textContent=this.games.slots.win.toFixed(2);
$('winCurrency').textContent=this.currency;
}

async spinSlots(){
if(this.games.slots.spinning)return;
const bet=+$('slotsBet').value;
if(this.games.slots.spins===0&&!this.deductBalance(bet))return;
if(this.games.slots.spins>0)this.games.slots.spins--;
this.games.slots.spinning=1;
this.games.slots.win=0;
$$('.chaos-symbol').forEach(s=>s.classList.add('spinning'));
await new Promise(resolve=>{
let spins=0;
const interval=setInterval(()=>{
this.fillGrid();
this.updateSlotsDisplay();
spins++;
if(spins>=20){
clearInterval(interval);
resolve();
}
},100);
});
$$('.chaos-symbol').forEach(s=>s.classList.remove('spinning'));
const clusters=this.findClusters();
let totalWin=0;
clusters.forEach(cluster=>{
let mult=1;
if(cluster.size>=15)mult=50;
else if(cluster.size>=10)mult=10;
else if(cluster.size>=7)mult=5;
else if(cluster.size>=5)mult=2;
totalWin+=bet*mult*this.games.slots.mult;
cluster.positions.forEach(({row,col})=>{
const idx=row*6+col;
const sym=$(`chaos-${idx}`);
if(sym)sym.classList.add('winning');
});
});
// Check scatters
let scatters=0;
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
if(this.games.slots.grid[r][c]===this.games.slots.scatter)scatters++;
}
}
if(scatters>=3){
this.games.slots.spins+=10;
this.games.slots.mult=Math.min(this.games.slots.mult+1,10);
this.notify(`🌠 ${scatters} SCATTERS! +10 Free Spins!`);
}
// Bonus check (2% chance)
if(Math.random()<0.02){
totalWin+=bet*(10+Math.floor(Math.random()*90));
this.notify('🌠 BONUS! Cosmic multiplier!');
}
this.games.slots.win=totalWin;
if(totalWin>0){
this.addBalance(totalWin);
const winType=totalWin>=bet*20?'MEGA WIN':totalWin>=bet*5?'BIG WIN':'WIN';
this.showResult('slots',`${winType}! +${totalWin.toFixed(2)} ${this.currency}`,'win');
}else{
this.showResult('slots','No clusters! Try again! ⭐','lose');
}
this.updateSlotsDisplay();
this.games.slots.spinning=0;
setTimeout(()=>$$('.chaos-symbol').forEach(s=>s.classList.remove('winning')),2000);
}

findClusters(){
const visited=Array(5).fill().map(()=>Array(6).fill(0));
const clusters=[];
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
if(!visited[r][c]){
const cluster=this.findCluster(r,c,this.games.slots.grid[r][c],visited);
if(cluster.length>=5){
clusters.push({symbol:this.games.slots.grid[r][c],positions:cluster,size:cluster.length});
}
}
}
}
return clusters;
}

findCluster(r,c,sym,visited){
if(r<0||r>=5||c<0||c>=6||visited[r][c]||this.games.slots.grid[r][c]!==sym)return[];
visited[r][c]=1;
const cluster=[{row:r,col:c}];
const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
dirs.forEach(([dr,dc])=>{
cluster.push(...this.findCluster(r+dr,c+dc,sym,visited));
});
return cluster;
}

buyBonus(){
const bet=+$('slotsBet').value;
const cost=bet*100;
if(!this.deductBalance(cost))return this.showResult('slots','Insufficient balance!','lose');
this.games.slots.spins=10;
this.games.slots.mult=3;
this.notify('🚀 BONUS! 10 Free Spins with 3x multiplier!');
setTimeout(()=>this.spinSlots(),1000);
}

toggleAuto(){
// Simple autoplay toggle - implementation left minimal for space
this.notify('Autoplay feature - coming soon!');
}

// === QUANTUM PLINKO ===
initPlinko(){
const canvas=$('plinkoCanvas');
if(!canvas)return;
canvas.width=400;
canvas.height=450;
this.ctx=canvas.getContext('2d');
this.games.plinko.balls=[];
this.setupPegs();
this.drawBoard();
$('dropBtn').onclick=()=>this.dropBall();
}

setupPegs(){
this.pegs=[];
const w=400;
for(let row=0;row<10;row++){
const n=row+3;
const space=w*0.8/(n+1);
const start=(w-w*0.8)/2;
for(let i=0;i<n;i++){
this.pegs.push({x:start+space*(i+1),y:50+row*35,r:3});
}
}
}

drawBoard(){
const ctx=this.ctx;
ctx.fillStyle='#1a2332';
ctx.fillRect(0,0,400,450);
this.pegs.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fillStyle='#4a5568';
ctx.fill();
});
this.games.plinko.balls.forEach(b=>{
ctx.beginPath();
ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
ctx.fillStyle=b.color;
ctx.fill();
});
}

async dropBall(){
const bet=+$('plinkoBet').value;
if(!this.deductBalance(bet))return;
if(this.games.plinko.balls.length>=this.games.plinko.max){
return this.notify(`Max ${this.games.plinko.max} balls!`);
}
const ball={
id:Date.now()+Math.random(),
x:200+(Math.random()-0.5)*20,y:15,vx:(Math.random()-0.5)*0.3,vy:0,r:6,g:0.06,b:0.9,bet:bet,
color:`hsl(${Math.random()*360},70%,60%)`
};
this.games.plinko.balls.push(ball);
this.animatePlinko();
}

animatePlinko(){
const animate=()=>{
this.games.plinko.balls.forEach((b,idx)=>{
b.vy+=b.g;
b.vy*=0.998;
b.vx*=0.99;
b.x+=b.vx;
b.y+=b.vy;
this.pegs.forEach(p=>{
const dx=b.x-p.x,dy=b.y-p.y,d=Math.sqrt(dx*dx+dy*dy);
if(d<b.r+p.r){
const a=Math.atan2(dy,dx);
const force=Math.max(0,(b.r+p.r)-d)*0.5;
b.x=p.x+Math.cos(a)*(b.r+p.r+2);
b.y=p.y+Math.sin(a)*(b.r+p.r+2);
const bounceAngle=(Math.random()-0.5)*0.6;
b.vx=Math.cos(a+bounceAngle)*Math.abs(b.vy)*0.3+(Math.random()-0.5)*0.5;
b.vy=Math.abs(b.vy)*b.b*(0.5+Math.random()*0.3);
}
});
if(b.x<b.r||b.x>400-b.r){
b.vx*=-0.7;
b.x=b.x<b.r?b.r:400-b.r;
}
if(b.y>420){
const slot=Math.floor(b.x/(400/13));
const mults=[10,3,1.5,1.4,1.1,1,0.5,1,1.1,1.4,1.5,3,10];
const mult=mults[Math.max(0,Math.min(12,slot))];
const win=b.bet*mult;
this.addBalance(win);
this.showResult('plinko',`Ball hit ${mult}x! Won ${win.toFixed(2)} ${this.currency}`,win>=b.bet?'win':'lose');
$$('.multiplier').forEach((m,i)=>{
if(i===slot){
m.classList.add('hit');
setTimeout(()=>m.classList.remove('hit'),1000);
}
});
this.games.plinko.balls.splice(idx,1);
}
});
this.drawBoard();
if(this.games.plinko.balls.length>0)requestAnimationFrame(animate);
};
animate();
}

// === GALAXY BLACKJACK ===
initBJ(){
this.games.bj={pHand:[],dHand:[],deck:[],active:0,bet:0};
this.createDeck();
this.shuffleDeck();
this.resetBJUI();
$('dealBtn').onclick=()=>this.dealBJ();
$('hitBtn').onclick=()=>this.hitBJ();
$('standBtn').onclick=()=>this.standBJ();
}

createDeck(){
const suits=['♠','♥','♦','♣'];
const vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
this.games.bj.deck=[];
suits.forEach(s=>vals.forEach(v=>this.games.bj.deck.push({v,s})));
}

shuffleDeck(){
const deck=this.games.bj.deck;
for(let i=deck.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[deck[i],deck[j]]=[deck[j],deck[i]];
}
}

resetBJUI(){
$('playerCards').innerHTML='';
$('dealerCards').innerHTML='';
$('playerScore').textContent='0';
$('dealerScore').textContent='0';
$('dealBtn').disabled=0;
$('hitBtn').disabled=1;
$('standBtn').disabled=1;
}

dealBJ(){
const bet=+$('blackjackBet').value;
if(!this.deductBalance(bet))return;
this.games.bj.bet=bet;
this.games.bj.pHand=[this.games.bj.deck.pop(),this.games.bj.deck.pop()];
this.games.bj.dHand=[this.games.bj.deck.pop(),this.games.bj.deck.pop()];
this.games.bj.active=1;
this.updateBJ();
$('dealBtn').disabled=1;
$('hitBtn').disabled=0;
$('standBtn').disabled=0;
if(this.getHandVal(this.games.bj.pHand)===21)this.standBJ();
}

hitBJ(){
if(!this.games.bj.active)return;
this.games.bj.pHand.push(this.games.bj.deck.pop());
this.updateBJ();
const pVal=this.getHandVal(this.games.bj.pHand);
if(pVal>21)this.endBJ('💥 Bust! Dealer wins',0);
else if(pVal===21)this.standBJ();
}

standBJ(){
if(!this.games.bj.active)return;
while(this.getHandVal(this.games.bj.dHand)<17){
this.games.bj.dHand.push(this.games.bj.deck.pop());
}
this.updateBJ(1);
const pVal=this.getHandVal(this.games.bj.pHand);
const dVal=this.getHandVal(this.games.bj.dHand);
if(dVal>21)this.endBJ('🎉 Dealer busts! You win!',this.games.bj.bet*2);
else if(pVal>dVal)this.endBJ('🎉 You win!',this.games.bj.bet*2);
else if(pVal<dVal)this.endBJ('😔 Dealer wins',0);
else this.endBJ('🤝 Push! Bet returned',this.games.bj.bet);
}

getHandVal(hand){
let val=0,aces=0;
hand.forEach(c=>{
if(c.v==='A'){aces++;val+=11;}
else if(['J','Q','K'].includes(c.v))val+=10;
else val+=+c.v;
});
while(val>21&&aces>0){val-=10;aces--;}
return val;
}

updateBJ(showAll=0){
this.showHand('player',this.games.bj.pHand,1);
this.showHand('dealer',this.games.bj.dHand,showAll||!this.games.bj.active);
$('playerScore').textContent=this.getHandVal(this.games.bj.pHand);
$('dealerScore').textContent=(showAll||!this.games.bj.active)?this.getHandVal(this.games.bj.dHand):this.getHandVal([this.games.bj.dHand[0]]);
}

showHand(who,hand,showAll=1){
const el=$(`${who}Cards`);
if(!el)return;
el.innerHTML='';
hand.forEach((c,i)=>{
const card=document.createElement('div');
card.className='playing-card';
if(who==='dealer'&&i===1&&!showAll){
card.classList.add('back');
card.textContent='🚀';
}else{
card.innerHTML=`${c.v}<br>${c.s}`;
if(['♥','♦'].includes(c.s))card.classList.add('red');
}
el.appendChild(card);
});
}

endBJ(msg,win=0){
this.games.bj.active=0;
if(win>0){
this.addBalance(win);
msg+=` +${win} ${this.currency}`;
}
this.updateBJ(1);
this.showResult('blackjack',msg,win>0?'win':'lose');
$('hitBtn').disabled=1;
$('standBtn').disabled=1;
setTimeout(()=>{
this.resetBJUI();
this.createDeck();
this.shuffleDeck();
},3000);
}

// === COSMIC HI-LO ===
initHilo(){
this.games.hilo={card:null,streak:0,bet:0,active:0};
this.resetHiloUI();
$('dealHiloBtn').onclick=()=>this.startHilo();
$('higherBtn').onclick=()=>this.guessHilo('higher');
$('lowerBtn').onclick=()=>this.guessHilo('lower');
$('cashoutBtn').onclick=()=>this.cashoutHilo();
}

resetHiloUI(){
$('currentCard').innerHTML='<div class="playing-card hilo-main-card">?</div>';
$('dealHiloBtn').style.display='block';
$('higherBtn').disabled=1;
$('lowerBtn').disabled=1;
$('cashoutBtn').disabled=1;
this.updateStreakDisplay();
}

startHilo(){
const bet=+$('hiloBet').value;
if(!this.deductBalance(bet))return;
this.games.hilo.bet=bet;
this.games.hilo.streak=0;
this.games.hilo.active=1;
this.games.hilo.card=this.getRandCard();
this.displayCard('currentCard',this.games.hilo.card);
$('dealHiloBtn').style.display='none';
$('higherBtn').disabled=0;
$('lowerBtn').disabled=0;
$('cashoutBtn').disabled=0;
this.updateStreakDisplay();
}

guessHilo(guess){
if(!this.games.hilo.active)return;
const next=this.getRandCard();
const curr=this.getCardVal(this.games.hilo.card);
const nextVal=this.getCardVal(next);
let correct=0;
if(guess==='higher'&&nextVal>curr)correct=1;
if(guess==='lower'&&nextVal<curr)correct=1;
if(correct){
this.games.hilo.streak++;
this.games.hilo.card=next;
this.displayCard('currentCard',next);
this.updateStreakDisplay();
this.showResult('hilo',`🎉 Correct! Streak: ${this.games.hilo.streak}`,'win');
}else{
this.showResult('hilo',`❌ Wrong! Game over. Streak: ${this.games.hilo.streak}`,'lose');
this.endHilo(0);
}
}

cashoutHilo(){
if(!this.games.hilo.active)return;
const win=this.games.hilo.bet*Math.pow(2,this.games.hilo.streak);
this.addBalance(win);
this.showResult('hilo',`💰 Cashed out! Won ${win.toFixed(2)} ${this.currency}`,'win');
this.endHilo(win);
}

endHilo(win){
this.games.hilo.active=0;
setTimeout(()=>this.resetHiloUI(),3000);
}

updateStreakDisplay(){
const container=$('streakCards');
const countEl=document.querySelector('.streak-count');
if(!container)return;
if(countEl)countEl.textContent=this.games.hilo.streak;
if(this.games.hilo.streak===0){
container.innerHTML='<div class="streak-placeholder">Start playing!</div>';
}else{
container.innerHTML='';
for(let i=0;i<Math.min(this.games.hilo.streak,10);i++){
const card=document.createElement('div');
card.className='streak-card';
card.textContent='🃏';
container.appendChild(card);
}
}
}

getRandCard(){
const suits=['♠','♥','♦','♣'];
const vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
return{suit:suits[Math.floor(Math.random()*4)],value:vals[Math.floor(Math.random()*13)]};
}

getCardVal(card){
if(card.value==='A')return 1;
if(['J','Q','K'].includes(card.value))return[11,12,13][['J','Q','K'].indexOf(card.value)];
return parseInt(card.value);
}

displayCard(id,card){
const container=$(id);
container.innerHTML='';
const cardEl=document.createElement('div');
cardEl.className='playing-card hilo-main-card';
cardEl.innerHTML=`${card.value}<br>${card.suit}`;
if(['♥','♦'].includes(card.suit))cardEl.classList.add('red');
container.appendChild(cardEl);
}

// === NEBULA DICE ===
initDice(){
this.games.dice={bet:null,roll1:1,roll2:1};
this.resetDiceUI();
$('rollBtn').onclick=()=>this.rollDice();
$$('.bet-option').forEach(btn=>btn.onclick=()=>this.selectDiceBet(btn.dataset.bet));
}

resetDiceUI(){
$('dice1').textContent='⚀';
$('dice2').textContent='⚀';
$('diceTotal').textContent='2';
$('selectedBet').textContent='None';
$('rollBtn').disabled=1;
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
}

selectDiceBet(bet){
this.games.dice.bet=bet;
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
document.querySelector(`[data-bet="${bet}"]`).classList.add('selected');
$('selectedBet').textContent=bet.toUpperCase();
$('rollBtn').disabled=0;
}

async rollDice(){
if(!this.games.dice.bet)return;
const bet=+$('diceBet').value;
if(!this.deductBalance(bet))return;
$('dice1').classList.add('rolling');
$('dice2').classList.add('rolling');
await new Promise(resolve=>setTimeout(resolve,1000));
this.games.dice.roll1=Math.floor(Math.random()*6)+1;
this.games.dice.roll2=Math.floor(Math.random()*6)+1;
const total=this.games.dice.roll1+this.games.dice.roll2;
const syms=['⚀','⚁','⚂','⚃','⚄','⚅'];
$('dice1').textContent=syms[this.games.dice.roll1-1];
$('dice2').textContent=syms[this.games.dice.roll2-1];
$('diceTotal').textContent=total;
$('dice1').classList.remove('rolling');
$('dice2').classList.remove('rolling');
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
setTimeout(()=>this.resetDiceUI(),3000);
}

// === GAME SETUP ===
setupGames(){
// Games setup handled in individual init functions
console.log('🎮 Games ready!');
}

// === MUSIC SYSTEM ===
setupMusic(){
const btn=$('musicToggle');
this.music.audio=document.createElement('audio');
this.music.audio.loop=1;
this.music.audio.volume=0.3;
this.music.audio.src='https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
this.music.audio.crossOrigin='anonymous';
this.music.on=1;
this.music.audio.play().catch(()=>{
this.music.on=0;
btn.innerHTML='🔇';
});
btn.onclick=()=>{
if(this.music.on){
this.music.audio.pause();
btn.innerHTML='🔇';
this.music.on=0;
this.notify('🎵 Music off');
}else{
this.music.audio.play().catch(()=>{
this.notify('❌ Music failed to load');
});
btn.innerHTML='🎵';
this.music.on=1;
this.notify('🎵 Hot Butter Popcorn!');
}
};
}

// === EFFECTS ===
createEffects(){
setInterval(()=>{
if(Math.random()<0.3)this.createParticle();
},3000);
}

createParticle(){
const el=document.createElement('div');
const syms=['✨','⭐','🌟','💫'];
el.textContent=syms[Math.floor(Math.random()*4)];
el.style.cssText=`position:fixed;font-size:${Math.random()*10+15}px;pointer-events:none;z-index:-1;left:${Math.random()*100}%;top:100vh;opacity:${Math.random()*0.6+0.2};animation:floatUp ${Math.random()*4+6}s linear forwards`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),10000);
}
}

// UTILITY FUNCTIONS
function $(id){return document.getElementById(id)}
function $$(sel){return document.querySelectorAll(sel)}
function openAminaExplorer(){window.open('https://explorer.perawallet.app/asset/1107424865/','_blank')}
function showDonationModal(){$('donationModal').style.display='flex'}
function closeDonationModal(){$('donationModal').style.display='none'}
function copyDonationAddress(){
const input=$('donationWallet');
input.select();
document.execCommand('copy');
alert('Address copied! 🚀');
}

// INITIALIZE
let casino;
document.addEventListener('DOMContentLoaded',()=>{
casino=new AminaCasino();
console.log('🚀 Cosmic Casino Ready!');
});
window.casino=casino;