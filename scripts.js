
class AminaCasino{
constructor(){
//localStorage.clear();
//sessionStorage.clear();
this.b={HC:1000,AMINA:0};
this.c='HC';
this.w=null;
this.t=null;
this.cc=0;
this.g={s:{},p:{},bj:{},h:{},d:{}};
this.m={on:0,aud:null};
setTimeout(()=>{
this.setupUI();
this.setupMusic();
},100);
}

vib(p=50){if(this.hap&&‘ontouchstart’in window)try{this.hap.call(navigator,p)}catch(e){}}

load(el,tx=‘Loading…’){
if(!el)return;
el.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><div style="width:16px;height:16px;border:2px solid #fff3;border-top:2px solid #FFD700;border-radius:50%;animation:rotate 1s linear infinite"></div>${tx}</div>`;
el.disabled=1;
}

unload(el,tx){if(!el)return;el.innerHTML=tx;el.disabled=0}

anim(){const b=$(‘balanceAmount’);if(b){b.classList.add(‘updating’);setTimeout(()=>b.classList.remove(‘updating’),300)}}

getHC(){
const d=new Date().toDateString(),s=localStorage.getItem(‘hc_data’);
if(s){const dt=JSON.parse(s);if(dt.date===d)return dt.balance}
localStorage.setItem(‘hc_data’,JSON.stringify({date:d,balance:1000}));
return 1000;
}

saveHC(){localStorage.setItem(‘hc_data’,JSON.stringify({date:new Date().toDateString(),balance:this.b.HC}))}

getT(){return localStorage.getItem(‘session_token’)||null}
saveT(t){localStorage.setItem(‘session_token’,t);this.t=t}
clearT(){localStorage.removeItem(‘session_token’);this.t=null}

getW(){
const s=localStorage.getItem(‘connected_wallet’)||sessionStorage.getItem(‘connected_wallet’);
return s?JSON.parse(s):null;
}

saveW(){
[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].setItem(‘connected_wallet’,JSON.stringify(this.w)));
if(this.b.AMINA>0)[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].setItem(‘cached_amina_balance’,this.b.AMINA.toString()));
this.saveApp();
}

clearW(){
[‘connected_wallet’,‘cached_amina_balance’,‘app_state’].forEach(k=>
[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].removeItem(k))
);
}

saveApp(){
const st={inCasino:!$(‘welcomeScreen’).classList.contains(‘active’),currency:this.c,timestamp:Date.now()};
[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].setItem(‘app_state’,JSON.stringify(st)));
}

saveGameState(){
localStorage.setItem(‘game_state’,JSON.stringify({
slots:this.g.s.state,
hilo:this.g.h.act?this.g.h:null,
timestamp:Date.now()
}));
}

loadGameState(){
const gs=localStorage.getItem(‘game_state’);
if(gs){
const state=JSON.parse(gs);
if(Date.now()-state.timestamp<300000){
if(state.slots&&this.g.s.spins>0)this.g.s.state=state.slots;
if(state.hilo&&state.hilo.act)this.g.h=state.hilo;
}
}
}

atomicRestore(){
const ch=localStorage.getItem(‘cached_amina_balance’)||sessionStorage.getItem(‘cached_amina_balance’);
if(ch&&this.w)this.b.AMINA=parseFloat(ch);
if(this.w){this.forceAMINA()}else{this.forceHC()}
}

async check(){
try{
if(this.dp)return;
if(this.w){
this.forceAMINA();
this.updWal();
this.loadGameState();
this.sync();
setTimeout(()=>this.refWal(),500);
this.processSyncQueue();
// Only auto-enter if explicitly saved as in-casino AND has valid session
const ap=localStorage.getItem(‘app_state’)||sessionStorage.getItem(‘app_state’);
if(ap&&this.t){
const st=JSON.parse(ap);
if(st.inCasino&&st.timestamp>Date.now()-300000&&this.w){
setTimeout(()=>this.enter(),100);
}
}
}
}catch(e){
console.log(‘Check error:’,e);
this.forceHC();
}
}

updCur(){
const tg=$(‘currencyToggle’),tx=tg?.querySelector(’.currency-text’);
if(this.c===‘AMINA’){
tg?.classList.add(‘amina’);
if(tx)tx.textContent=‘AMINA’;
}else{
tg?.classList.remove(‘amina’);
if(tx)tx.textContent=‘HC’;
}
}

async refWal(){
if(!this.w)return;
try{
const bal=await this.fetchAmina(this.w);
this.b.AMINA=bal;
[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].setItem(‘cached_amina_balance’,bal.toString()));
this.updCash();
this.anim();
}catch(e){console.log(‘Wallet refresh error:’,e)}
}

async refSess(){
if(!this.w)return!1;
try{
this.clearT();
const res=await this.callSess(‘create_session’,{wallet:this.w});
if(res.success){
this.saveT(res.token);
this.cc=res.balance||0;
this.updDisp();
this.updCash();
return!0;
}
}catch(e){console.log(‘Session refresh error:’,e)}
return!1;
}

async callSess(act,data){
try{
const res=await fetch(’/.netlify/functions/session-manager’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify({action:act,…data})
});
return await res.json();
}catch(e){
return{success:!1,error:e.message};
}
}

async sync(){
if(this.dp||(!this.w&&!this.t))return;
try{
const body=this.t?{action:‘get_balance’,token:this.t}:{action:‘get_balance’,wallet:this.w};
const res=await fetch(’/.netlify/functions/casino-credits’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify(body)
});
const result=await res.json();
if(result.success){
this.cc=result.balance||0;
if(result.token&&!this.t)this.saveT(result.token);
this.updDisp();
this.updCash();
this.ls=Date.now();
}else if(result.needsRefresh&&this.w){
await this.refSess();
}
}catch(e){
console.log(‘Sync error:’,e);
if(this.w&&!this.t&&!this.dp)await this.refSess();
}
}

async updServ(act,amt){
if(!this.t)return!1;
const req={action:act,token:this.t,amount:amt,timestamp:Date.now()};
try{
const res=await fetch(’/.netlify/functions/casino-credits’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify(req)
});
const result=await res.json();
if(result.success){
this.cc=result.newBalance||result.balance||0;
this.updDisp();
this.updCash();
this.ls=Date.now();
return!0;
}else{
this.sq.push(req);
return!1;
}
}catch(e){
this.sq.push(req);
return!1;
}
}

async processSyncQueue(){
if(this.sq.length===0||!this.t)return;
const req=this.sq.shift();
try{
const res=await fetch(’/.netlify/functions/casino-credits’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify(req)
});
const result=await res.json();
if(result.success){
this.cc=result.newBalance||result.balance||0;
this.updDisp();
this.updCash();
this.ls=Date.now();
if(this.sq.length>0)setTimeout(()=>this.processSyncQueue(),100);
}else{
this.sq.unshift(req);
}
}catch(e){
this.sq.unshift(req);
}
setTimeout(()=>this.processSyncQueue(),5000);
}

async fetchAmina(wal){
try{
const res=await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${wal}/assets`);
const data=await res.json();
const asset=data.assets?.find(a=>a[‘asset-id’]===this.aid);
const bal=asset?asset.amount/100000000:0;
[‘localStorage’,‘sessionStorage’].forEach(s=>window[s].setItem(‘cached_amina_balance’,bal.toString()));
return bal;
}catch(e){
this.notify(‘❌ Error fetching balance’);
const ch=localStorage.getItem(‘cached_amina_balance’)||sessionStorage.getItem(‘cached_amina_balance’);
return ch?parseFloat(ch):0;
}
}

initP(){
try{
if(typeof PeraWalletConnect!==‘undefined’){
this.p=new PeraWalletConnect({shouldShowSignTxnToast:!1,chainId:416001});
if(typeof this.p.connect===‘function’&&typeof this.p.signTransaction===‘function’){
this.p.connector?.on(‘disconnect’,()=>{this.handleWalletDisconnect()});
}else{
this.p=null;
}
}else{
this.p=null;
}
}catch(e){
this.p=null;
console.log(‘Pera wallet init error:’,e);
}
}

handleWalletDisconnect(){
this.w=null;
this.b.AMINA=0;
this.clearW();
this.clearT();
if(this.g.h.act)this.autoCashHilo();
this.forceHC();
this.updWal();
this.notify(‘🔓 Wallet disconnected - switched to HC mode’);
}

init(){
this.setupUI();
this.setupGames();
this.setupMusic();
this.createFX();
this.updDisp();
}

setupUI(){
$(‘enterCasino’).onclick=()=>{this.vib(50);this.enter()};
$(‘walletBtn’).onclick=()=>{this.vib(75);this.togWal()};
$(‘currencyToggle’).onclick=()=>{this.vib(25);this.togCur()};
this.setupOrb();
$$(’.game-card’).forEach(c=>c.onclick=()=>{this.vib(50);this.switch(c.dataset.game)});
}

setupOrb(){
const orb=$(‘cosmicOrb’),menu=$(‘orbitalMenu’);
let open=0;
orb.onclick=()=>{
this.vib(75);
open=!open;
menu.classList.toggle(‘open’,open);
orb.style.transform=open?‘scale(0.9)’:‘scale(1)’;
};
$$(’.orbital-item’).forEach(i=>i.onclick=()=>{
this.vib(50);
this.switch(i.dataset.game);
open=0;
menu.classList.remove(‘open’);
orb.style.transform=‘scale(1)’;
});
document.addEventListener(‘click’,e=>{
if(!e.target.closest(’.cosmic-orb-menu’)&&open){
open=0;
menu.classList.remove(‘open’);
orb.style.transform=‘scale(1)’;
}
});
}

enter(){
const btn=$(‘enterCasino’);
this.load(btn,‘Entering…’);

$(‘welcomeScreen’).classList.remove(‘active’);
$(‘mainCasino’).classList.add(‘active’);
this.saveApp();
if(this.w){
this.fetchAmina(this.w).then(bal=>{
this.b.AMINA=bal;
this.updCash();
});
this.sync();
}
if(this.m.aud&&!this.m.on){
this.m.aud.play().then(()=>{
this.m.on=1;
$(‘musicToggle’).innerHTML=‘🎵’;
}).catch(()=>{});
}
this.unload(btn,‘🚀 ENTER CASINO’);
}
}

async togWal(){
if(this.w){
try{
if(this.p&&typeof this.p.disconnect===‘function’){
await this.p.disconnect();
}else{
this.handleWalletDisconnect();
}
}catch(e){
this.handleWalletDisconnect();
}
this.notify(‘🔓 Wallet disconnected’);
this.vib(100);
}else{
if(!this.p){
this.notify(‘⚠️ Pera Wallet not available - using manual entry’);
const addr=prompt(‘Enter Algorand wallet:’);
if(addr&&addr.length===58){
this.w=addr;
this.saveW();
this.b.AMINA=await this.fetchAmina(addr);
await this.refSess();
this.forceAMINA();
this.updWal();
this.notify(‘✅ Wallet connected manually’);
this.vib([50,100,50]);
if($(‘welcomeScreen’).classList.contains(‘active’)){
setTimeout(()=>this.enter(),1000);
}
}else if(addr){
this.notify(‘❌ Invalid address’);
}
return;
}
try{
const re=await this.p.reconnectSession();
if(re&&re.length>0){
this.w=re[0];
this.saveW();
this.b.AMINA=await this.fetchAmina(this.w);
await this.refSess();
this.forceAMINA();
this.updWal();
this.notify(‘🚀 Pera Wallet reconnected!’);
this.vib([50,100,50]);
if($(‘welcomeScreen’).classList.contains(‘active’)){
setTimeout(()=>this.enter(),1000);
}
return;
}
const acc=await this.p.connect();
if(acc&&acc.length>0){
this.w=acc[0];
this.saveW();
this.b.AMINA=await this.fetchAmina(this.w);
await this.refSess();
this.forceAMINA();
this.updWal();
this.notify(‘🚀 Pera Wallet connected!’);
this.vib([50,100,50]);
if($(‘welcomeScreen’).classList.contains(‘active’)){
setTimeout(()=>this.enter(),1000);
}
}else{
this.notify(‘❌ No accounts found’);
}
}catch(e){
const msg=e.type===4001||e.message?.includes(‘cancelled’)?‘❌ Connection cancelled’:
e.message?.includes(‘rejected’)?‘❌ Connection rejected’:‘❌ Connection failed - check Pera Wallet app’;
this.notify(msg);
}
}
}

forceHC(){
this.c=‘HC’;
this.updCur();
this.updBets();
this.updDisp();
this.saveApp();
}

forceAMINA(){
if(this.w&&this.cc<0.001){
this.notify(‘❌ Need at least 0.001 AMINA to switch. Visit Cashier!’);
this.forceHC();
return!1;
}
if(!this.w){
this.forceHC();
return!1;
}
this.c=‘AMINA’;
this.updCur();
this.updBets();
this.updDisp();
this.saveApp();
return!0;
}

updWal(){
const btn=$(‘walletBtn’);
btn.innerHTML=this.w?‘🔓 ‘+this.w.slice(0,4)+’…’+this.w.slice(-4):‘🔗 Connect Wallet’;
}

async togCur(){
if(!this.w){
this.notify(‘🔗 Connect wallet for AMINA!’);
this.vib(100);
return;
}
if(this.c===‘HC’){
if(this.forceAMINA()){
this.notify(‘🪙 Switched to AMINA mode’);
}
}else{
this.forceHC();
this.notify(‘🏠 Switched to HC mode’);
}
this.vib(50);
}

updBets(){
const bets=this.c===‘HC’?[‘1’,‘5’,‘10’]:[‘0.001’,‘0.005’,‘0.01’];
[‘slots’,‘plinko’,‘blackjack’,‘hilo’,‘dice’].forEach(g=>{
const sel=$(`${g}Bet`);
if(sel){
sel.innerHTML=’’;
bets.forEach(b=>{
const opt=document.createElement(‘option’);
opt.value=opt.textContent=b;
sel.appendChild(opt);
});
sel.value=bets[0];
}
});
}

updDisp(){
const bal=this.c===‘AMINA’?this.cc:this.b.HC;
$(‘balanceAmount’).textContent=this.c===‘AMINA’?this.trimZeros(bal.toFixed(8)):bal.toFixed(0);
$(‘currencySymbol’).textContent=this.c;
this.anim();
[‘slots’,‘plinko’,‘blackjack’,‘hilo’,‘dice’].forEach(g=>{
const el=$(`${g}Currency`);
if(el)el.textContent=this.c;
});
}

trimZeros(str){return str.replace(/.?0+$/,’’)}

async valBal(){
if(this.c===‘AMINA’&&this.cc<0.001){
this.notify(‘💰 Please top up your AMINA balance!’);
this.forceHC();
return!1;
}
return!0;
}

async deduct(amt){
if(amt > 100) return 0
if(!await this.valBal())return 0;
if(this.c===‘AMINA’){
if(this.cc<amt){
this.notify(‘❌ Insufficient AMINA credits! Visit Cashier.’);
this.vib(100);
return 0;
}
if(this.cc < 0 || this.cc > 1000) this.cc = 0;
this.cc-=amt;
this.updDisp();
const suc=await this.updServ(‘deduct_credits’,amt);
if(!suc)this.notify(‘⏸️ Sync pending…’);
return 1;
}else{
if(this.b.HC<amt){
this.notify(‘❌ Insufficient HC balance!’);
this.vib(100);
return 0;
}
if(this.b.HC < 0 || this.b.HC > 10000) this.b.HC = 1000;
this.b.HC-=amt;
this.saveHC();
this.updDisp();
return 1;
}
}

async add(amt,src=‘win’){
if(this.c===‘AMINA’&&src===‘win’){
if(amt > 1000 || amt < 0) return;
this.cc+=amt;
this.updDisp();
const suc=await this.updServ(‘add_credits’,amt);
if(!suc)this.notify(‘⏸️ Sync pending…’);
this.vib([25,50,25]);
}else{
if(amt > 1000 || amt < 0) return;
this.b.HC+=amt;
this.saveHC();
this.updDisp();
this.vib([25,50,25]);
}
}

switch(id){
this.vib(25);
$$(’.game-screen’).forEach(s=>s.classList.remove(‘active’));
$(id).classList.add(‘active’);
const games={
slots:()=>this.initSlots(),
plinko:()=>this.initPlinko(),
blackjack:()=>this.initBJ(),
hilo:()=>this.initHilo(),
dice:()=>this.initDice(),
cashier:()=>this.initCash()
};
if(games[id])games[id]();
}

notify(msg,type=‘info’){
const div=document.createElement(‘div’);
div.textContent=msg;
div.style.cssText=`position:fixed;top:20px;right:20px;z-index:1001;background:${type==='error'?'#F44336':'#FFD700'};color:#000;padding:1rem 2rem;border-radius:15px;font-family:JetBrains Mono,monospace;font-weight:700;transform:translateX(100%);transition:transform .3s ease;max-width:300px;word-wrap:break-word;box-shadow:0 8px 25px rgba(0,0,0,0.3)`;
document.body.appendChild(div);
setTimeout(()=>div.style.transform=‘translateX(0)’,50);
setTimeout(()=>{
div.style.transform=‘translateX(100%)’;
setTimeout(()=>div.remove(),300);
},3000);
}

showRes(game,msg,type=‘info’){
const el=$(`${game}Result`);
if(el){
el.textContent=msg;
el.className=`game-result show ${type}`;
if(type===‘win’&&msg.includes(‘MEGA’)){
el.classList.add(‘mega-win’);
this.vib([100,50,100,50,100]);
}else if(type===‘win’){
this.vib([50,25,50]);
}
setTimeout(()=>el.classList.remove(‘show’,‘mega-win’),4000);
}
}

setupGames(){}

setupMusic(){
const btn=$(‘musicToggle’);
this.m.aud=document.createElement(‘audio’);
Object.assign(this.m.aud,{
loop:1,
volume:.3,
src:‘https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3’,
crossOrigin:‘anonymous’
});
this.m.on=1;
this.m.aud.play().catch(()=>{
this.m.on=0;
btn.innerHTML=‘🔇’;
});
btn.onclick=()=>{
if(this.m.on){
this.m.aud.pause();
btn.innerHTML=‘🔇’;
this.m.on=0;
this.notify(‘🎵 Music off’);
}else{
this.m.aud.play().catch(()=>this.notify(‘❌ Music failed to load’));
btn.innerHTML=‘🎵’;
this.m.on=1;
this.notify(‘🎵 Hot Butter Popcorn!’);
}
};
}

createFX(){
setInterval(()=>{
if(Math.random()<.3)this.createPart();
},3000);
}

createPart(){
const el=document.createElement(‘div’),syms=[‘✨’,‘⭐’,‘🌟’,‘💫’];
el.textContent=syms[Math.floor(Math.random()*4)];
el.style.cssText=`position:fixed;font-size:${Math.random()*10+15}px;pointer-events:none;z-index:-1;left:${Math.random()*100}%;top:100vh;opacity:${Math.random()*.6+.2};animation:floatUp ${Math.random()*4+6}s linear forwards`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),10000);
}

// === CASHIER SYSTEM ===
initCash(){
this.updCash();
if(this.w){
this.refWal().then(()=>{}).catch(e=>{});
}
$(‘depositBtn’).onclick=()=>{
this.vib(50);
this.depAmina();
};
$(‘withdrawBtn’).onclick=()=>{
this.vib(50);
this.withAmina();
};
this.updTrans();
}

updCash(){
if($(‘walletBalance’)){
$(‘walletBalance’).textContent=`${this.trimZeros(this.b.AMINA.toFixed(8))} AMINA`;
}
if($(‘casinoCredits’)){
$(‘casinoCredits’).textContent=`${this.trimZeros(this.cc.toFixed(8))} AMINA`;
}
}

async depAmina(){
if(!this.w){
this.notify(‘🔗 Connect wallet first!’);
return;
}
if(this.dp){
this.notify(‘⏸️ Deposit already in progress…’);
return;
}
const amt=parseFloat($(‘depositAmount’).value);
if(!amt||amt<=0){
this.notify(‘❌ Enter valid amount’);
return;
}
if(amt>this.b.AMINA){
this.notify(‘❌ Insufficient AMINA balance’);
return;
}
this.dp=!0;
this.ds=Date.now();
this.notify(‘📝 Manual wallet detected - preparing transaction…’);
this.showManTx({
amount:amt,
from:this.w,
to:this.cw,
note:`AMINA Casino Deposit: ${amt}`,
assetId:this.aid
});
}

showManTx(tx){
const modal=document.createElement(‘div’);
modal.id=‘depositModal’;
modal.style.cssText=‘position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:10000;padding:5px;box-sizing:border-box’;
modal.innerHTML=`<div style="background:#1a2332;border-radius:10px;padding:12px;width:95%;max-width:350px;max-height:85vh;overflow-y:auto;border:2px solid #ffd700;color:white;font-family:JetBrains Mono,monospace;font-size:11px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0;color:#ffd700;font-size:14px">📝 Manual Signing</h3><button onclick="casino.closeDep()" style="background:none;border:none;color:#ffd700;font-size:18px;cursor:pointer">&times;</button></div><div style="background:#2a3441;padding:8px;border-radius:6px;margin-bottom:12px;font-size:10px"><div><strong>Amount:</strong> ${tx.amount} AMINA</div><div><strong>To:</strong> Casino</div><div><strong>Asset:</strong> ${tx.assetId}</div></div><div style="margin-bottom:12px"><h4 style="color:#ffd700;font-size:12px;margin:8px 0 4px">📱 Send Manually</h4><p style="font-size:10px;margin:4px 0">Send exactly <strong>${tx.amount} AMINA</strong> to:</p><input readonly onclick="this.select()" value="${this.cw}" style="width:100%;background:#2a3441;color:white;border:1px solid #ffd700;border-radius:4px;padding:4px;font-size:9px;box-sizing:border-box;margin:2px 0"><button onclick="navigator.clipboard.writeText('${this.cw}');alert('Address copied!')" style="background:#ffd700;color:#000;border:none;padding:6px 12px;border-radius:4px;margin:4px 0;cursor:pointer;font-size:10px;width:100%">📋 Copy Address</button></div><div style="display:flex;gap:8px;margin-top:10px"><button onclick="casino.compDep(${tx.amount})" style="background:#28a745;color:white;border:none;padding:8px 10px;border-radius:4px;cursor:pointer;font-size:10px;flex:1">✅ I Sent It</button><button onclick="casino.closeDep()" style="background:#dc3545;color:white;border:none;padding:8px 10px;border-radius:4px;cursor:pointer;font-size:10px;flex:1">❌ Cancel</button></div></div>`;
document.body.appendChild(modal);
}

closeDep(){
const modal=$(‘depositModal’);
if(modal)modal.remove();
this.dp=!1;
this.ds=0;
}

compDep(amt){
this.closeDep();
this.notify(‘🔍 Starting verification - please wait…’);
this.verifyDeposit(amt);
}

async verifyDeposit(amt){
if(!this.w){
this.notify(‘❌ Wallet required for deposits’);
return;
}
this.notify(‘🔍 Checking blockchain for your transaction…’);
let att=0;
const max=15,poll=12000;
const check=async()=>{
att++;
try{
const res=await fetch(’/.netlify/functions/monitor-deposits’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify({
wallet:this.w,
amount:amt,
timestamp:this.ds,
action:‘verify_only’
})
});
const result=await res.json();
if(result.success&&result.transaction_found){
this.notify(‘✅ Transaction found! Crediting your account…’);
await this.creditVerifiedDeposit(amt,result.txId);
return;
}
this.notify(`🔍 Still checking blockchain... (${att}/${max})`);
if(att<max){
setTimeout(check,poll);
}else{
this.dp=!1;
this.ds=0;
this.notify(‘⏰ Verification timeout. If you sent AMINA, contact support with your transaction details.’);
}
}catch(e){
console.error(‘Verification error:’,e);
if(att<max){
this.notify(`🔄 Network error, retrying... (${att}/${max})`);
setTimeout(check,poll);
}else{
this.dp=!1;
this.ds=0;
this.notify(‘❌ Verification failed. If you sent AMINA, contact support.’);
}
}
};
check();
}

async creditVerifiedDeposit(amt,txId){
try{
const res=await fetch(’/.netlify/functions/monitor-deposits’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify({
wallet:this.w,
amount:amt,
txId:txId,
action:‘credit_verified’
})
});
const result=await res.json();
if(result.success&&result.credited){
this.dp=!1;
this.ds=0;
await this.sync();
this.notify(`✅ Deposit complete! ${this.trimZeros(amt.toFixed(8))} AMINA credited!`);
this.addTrans(‘deposit’,amt);
this.vib([100,50,100]);
const input=$(‘depositAmount’);
if(input)input.value=’’;
}else{
this.dp=!1;
this.ds=0;
this.notify(‘❌ Credit failed. Transaction was found but crediting failed. Contact support.’);
}
}catch(e){
console.error(‘Credit error:’,e);
this.dp=!1;
this.ds=0;
this.notify(‘❌ Credit error. Contact support with transaction details.’);
}
}

async withAmina(){
if(!this.w){
this.notify(‘🔗 Connect wallet first!’);
return;
}
const amt=parseFloat($(‘withdrawAmount’).value);
if(!amt||amt<=0){
this.notify(‘❌ Enter valid amount’);
return;
}
if(amt>this.cc){
this.notify(‘❌ Insufficient casino credits’);
return;
}
this.notify(‘🔄 Processing automated withdrawal…’);
try{
const res=await fetch(’/.netlify/functions/casino-withdraw’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify({
amount:amt,
toAddress:this.w,
wallet:this.w
})
});
const result=await res.json();
if(result.success){
this.cc-=amt;
this.updDisp();
this.updCash();
const suc=await this.updServ(‘deduct_credits’,amt);
if(!suc)this.notify(‘⏸️ Sync pending…’);
this.addTrans(‘withdrawal’,amt);
this.notify(`✅ Withdrawal complete! ${this.trimZeros(amt.toFixed(8))} AMINA sent! TX: ${result.txId.slice(0,8)}...`);
$(‘withdrawAmount’).value=’’;
this.vib([100,50,100]);
}else{
this.notify(result.refund?`❌ ${result.error} - Credits remain in account`:`❌ ${result.error}`);
}
}catch(e){
this.notify(‘❌ Network error - please try again’);
}
}

addTrans(type,amt){
const trans=JSON.parse(localStorage.getItem(‘transactions’)||’[]’);
const tx={
id:Date.now(),
type,
amount:amt,
timestamp:new Date().toISOString(),
status:‘completed’
};
trans.unshift(tx);
trans.splice(10);
localStorage.setItem(‘transactions’,JSON.stringify(trans));
this.updTrans();
}

updTrans(){
const list=$(‘transactionList’);
if(!list)return;
const trans=JSON.parse(localStorage.getItem(‘transactions’)||’[]’);
list.innerHTML=trans.length===0?
‘<div class="transaction-placeholder">No transactions yet. Make your first deposit!</div>’:
trans.map(tx=>`<div class="transaction-item"><div class="tx-icon">${tx.type==='deposit'?'💰':'💸'}</div><div class="tx-details"><div class="tx-type">${tx.type==='deposit'?'Deposit':'Withdrawal'}</div><div class="tx-amount">${this.trimZeros(tx.amount.toFixed(8))} AMINA</div></div><div class="tx-time">${new Date(tx.timestamp).toLocaleTimeString()}</div></div>`).join(’’);
}

// === SLOTS GAME ===
initSlots(){
this.g.s.grid=Array(5).fill().map(()=>Array(6).fill(’’));
this.g.s.win=0;
this.g.s.mult=1;
this.g.s.spins=0;
this.g.s.spin=0;
this.createGrid();
this.fillGrid();
if(this.g.s.state&&this.g.s.spins>0){
this.g.s.spins=this.g.s.state.spins;
this.g.s.mult=this.g.s.state.mult;
this.notify(‘🎰 Free spins resumed! Press SPIN to continue’);
}
this.updSlots();
$(‘spinBtn’).onclick=()=>{
this.vib(50);
this.spinSlots();
};
$(‘buyBonusBtn’).onclick=()=>{
this.vib(75);
this.buyBonus();
};
$(‘autoplayBtn’).onclick=()=>this.notify(‘Autoplay feature - coming soon!’);
}

createGrid(){
const grid=$(‘chaosGrid’);
if(!grid)return;
grid.innerHTML=’’;
for(let i=0;i<30;i++){
const sym=document.createElement(‘div’);
sym.className=‘chaos-symbol’;
sym.id=`chaos-${i}`;
grid.appendChild(sym);
}
}

fillGrid(){
const syms=this.g.s.syms;
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
this.g.s.grid[r][c]=syms[Math.floor(Math.random()*syms.length)];
}
}
}

updSlots(){
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
const idx=r*6+c;
const sym=$(`chaos-${idx}`);
if(sym)sym.textContent=this.g.s.grid[r][c];
}
}
const els=[‘currentMultiplier’,‘freeSpinsCount’,‘totalWin’];
const vals=[`${this.g.s.mult}x`,this.g.s.spins,this.trimZeros(this.g.s.win.toFixed(8))];
els.forEach((id,i)=>{
const el=$(id);
if(el){
el.textContent=vals[i];
el.classList.add(‘updating’);
setTimeout(()=>el.classList.remove(‘updating’),300);
}
});
$(‘winCurrency’).textContent=this.c;
}

async spinSlots(){
if(this.g.s.spin)return;
const bet=+$(‘slotsBet’).value;
if(this.g.s.spins===0&&!await this.deduct(bet))return;
if(this.g.s.spins>0)this.g.s.spins–;
this.g.s.spin=1;
this.g.s.win=0;
this.g.s.state={spins:this.g.s.spins,mult:this.g.s.mult};
this.saveGameState();
const btn=$(‘spinBtn’);
this.load(btn,‘SPINNING…’);
$$(’.chaos-symbol’).forEach((s,i)=>setTimeout(()=>s.classList.add(‘spinning’),i*20));
await new Promise(res=>{
let sp=0;
const int=setInterval(()=>{
this.fillGrid();
this.updSlots();
if(++sp>=25){
clearInterval(int);
res();
}
},80);
});
$$(’.chaos-symbol’).forEach((s,i)=>setTimeout(()=>s.classList.remove(‘spinning’),i*15));
const clust=this.findClust();
let totWin=0;
clust.forEach(cl=>{
let mult=cl.size>=15?50:cl.size>=10?10:cl.size>=7?5:cl.size>=5?2:1;
totWin+=bet*mult*this.g.s.mult;
cl.positions.forEach(({row,col})=>{
const idx=row*6+col;
const sym=$(`chaos-${idx}`);
if(sym){
sym.classList.add(‘winning’);
setTimeout(()=>sym.style.transform=‘scale(1.2)’,100);
setTimeout(()=>sym.style.transform=‘scale(1)’,600);
}
});
});
let scats=0;
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
if(this.g.s.grid[r][c]===this.g.s.sct)scats++;
}
}
if(scats>=3){
this.g.s.spins+=10;
this.g.s.mult=Math.min(this.g.s.mult+1,10);
this.notify(`🌠 ${scats} SCATTERS! +10 Free Spins!`);
this.vib([100,50,100,50,100]);
}
if(Math.random()<.02){
totWin+=bet*(10+Math.floor(Math.random()*90));
this.notify(‘🌠 BONUS! Cosmic multiplier!’);
this.vib([200,100,200]);
}
this.g.s.win=totWin;
if(totWin>0){
await this.add(totWin,‘win’);
const wType=totWin>=bet*20?‘MEGA WIN’:totWin>=bet*5?‘BIG WIN’:‘WIN’;
this.showRes(‘slots’,`${wType}! +${this.trimZeros(totWin.toFixed(8))} ${this.c}`,‘win’);
}else{
this.showRes(‘slots’,‘No clusters! Try again! ⭐’,‘lose’);
}
if(this.g.s.spins===0)this.g.s.state=null;
this.updSlots();
this.g.s.spin=0;
this.unload(btn,‘SPIN’);
setTimeout(()=>$$(’.chaos-symbol’).forEach(s=>s.classList.remove(‘winning’)),2000);
}

findClust(){
const vis=Array(5).fill().map(()=>Array(6).fill(0));
const clust=[];
for(let r=0;r<5;r++){
for(let c=0;c<6;c++){
if(!vis[r][c]){
const cl=this.findCl(r,c,this.g.s.grid[r][c],vis);
if(cl.length>=5){
clust.push({
symbol:this.g.s.grid[r][c],
positions:cl,
size:cl.length
});
}
}
}
}
return clust;
}

findCl(r,c,sym,vis){
if(r<0||r>=5||c<0||c>=6||vis[r][c]||this.g.s.grid[r][c]!==sym)return[];
vis[r][c]=1;
const cl=[{row:r,col:c}];
[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>
cl.push(…this.findCl(r+dr,c+dc,sym,vis))
);
return cl;
}

buyBonus(){
const bet=+$(‘slotsBet’).value;
const cost=bet*100;
if(!this.deduct(cost))return this.showRes(‘slots’,‘Insufficient balance!’,‘lose’);
this.g.s.spins=10;
this.g.s.mult=3;
this.g.s.state={spins:this.g.s.spins,mult:this.g.s.mult};
this.saveGameState();
this.notify(‘🚀 BONUS! 10 Free Spins with 3x multiplier!’);
this.vib([100,25,100,25,100]);
setTimeout(()=>this.spinSlots(),1000);
}

// === PLINKO GAME ===
initPlinko(){
const can=$(‘plinkoCanvas’);
if(!can)return;
const container=can.parentElement;
const maxW=Math.min(350,container.offsetWidth-20);
can.width=maxW;
can.height=Math.min(400,window.innerHeight*0.5);
this.ctx=can.getContext(‘2d’);
this.g.p.balls=[];
this.setupPegs();
this.drawBoard();
$(‘dropBtn’).onclick=()=>{
this.vib(50);
this.dropBall();
};
}

setupPegs(){
this.pegs=[];
const w=this.ctx.canvas.width;
for(let row=0;row<10;row++){
const n=row+3;
const space=w*0.8/(n+1);
const start=(w-w*0.8)/2;
for(let i=0;i<n;i++){
this.pegs.push({
x:start+space*(i+1),
y:50+row*35,
r:3
});
}
}
}

drawBoard(){
const ctx=this.ctx;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
ctx.fillStyle=’#1a2332’;
ctx.fillRect(0,0,w,h);
this.pegs.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fillStyle=’#4a5568’;
ctx.fill();
});
this.g.p.balls.forEach(b=>{
ctx.beginPath();
ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
ctx.fillStyle=b.color;
ctx.fill();
});
}

async dropBall(){
const bet=+$(‘plinkoBet’).value;
if(!await this.deduct(bet))return;
if(this.g.p.balls.length>=this.g.p.max)return this.notify(`Max ${this.g.p.max} balls!`);
const w=this.ctx.canvas.width;
this.g.p.balls.push({
id:Date.now()+Math.random(),
x:w/2+(Math.random()-.5)*20,
y:15,
vx:(Math.random()-.5)*.3,
vy:0,
r:6,
g:.06,
b:.9,
bet,
color:`hsl(${Math.random()*360},70%,60%)`
});
this.animPlinko();
}

animPlinko(){
const anim=()=>{
this.g.p.balls.forEach((b,idx)=>{
b.vy+=b.g;
b.vy*=.998;
b.vx*=.99;
b.x+=b.vx;
b.y+=b.vy;
this.pegs.forEach(p=>{
const dx=b.x-p.x;
const dy=b.y-p.y;
const d=Math.sqrt(dx*dx+dy*dy);
if(d<b.r+p.r){
const a=Math.atan2(dy,dx);
b.x=p.x+Math.cos(a)*(b.r+p.r+2);
b.y=p.y+Math.sin(a)*(b.r+p.r+2);
b.vx=Math.cos(a+(Math.random()-.5)*.6)*Math.abs(b.vy)*.3+(Math.random()-.5)*.5;
b.vy=Math.abs(b.vy)*b.b*(.5+Math.random()*.3);
this.vib(10);
}
});
const w=this.ctx.canvas.width;
const h=this.ctx.canvas.height;
if(b.x<b.r||b.x>w-b.r){
b.vx*=-.7;
b.x=b.x<b.r?b.r:w-b.r;
}
if(b.y>h-30){
const slot=Math.floor(b.x/(w/13));
const mults=[10,3,1.5,1.4,1.1,1,.5,1,1.1,1.4,1.5,3,10];
const mult=mults[Math.max(0,Math.min(12,slot))];
const win=b.bet*mult;
this.add(win,‘win’);
this.showRes(‘plinko’,`Ball hit ${mult}x! Won ${this.trimZeros(win.toFixed(8))} ${this.c}`,win>=b.bet?‘win’:‘lose’);
$$(’.multiplier’).forEach((m,i)=>{
if(i===slot){
m.classList.add(‘hit’);
setTimeout(()=>m.classList.remove(‘hit’),1000);
}
});
this.vib(mult>=2?[100,50,100]:50);
this.g.p.balls.splice(idx,1);
}
});
this.drawBoard();
if(this.g.p.balls.length>0){
requestAnimationFrame(anim);
}
};
anim();
}

// === BLACKJACK GAME ===
initBJ(){
this.g.bj={pH:[],dH:[],deck:[],act:0,bet:0,dbl:0,spl:0,ins:0,spH:[],cDbl:0,cSpl:0};
this.createDeck();
this.shuffleDeck();
this.resetBJ();
this.setupBJ();
}

setupBJ(){
const ctrls=$(‘dealBtn’).parentElement;
[‘double’,‘split’,‘insurance’].forEach(name=>{
if(!$(`${name}Btn`)){
const btn=document.createElement(‘button’);
btn.id=`${name}Btn`;
btn.className=‘cosmic-btn’;
btn.textContent=name.toUpperCase();
btn.disabled=!0;
btn.onclick=()=>{
this.vib(50);
this[`${name}BJ`]();
};
ctrls.appendChild(btn);
}
});
$(‘dealBtn’).onclick=()=>{
this.vib(50);
this.dealBJ();
};
$(‘hitBtn’).onclick=()=>{
this.vib(25);
this.hitBJ();
};
$(‘standBtn’).onclick=()=>{
this.vib(25);
this.standBJ();
};
}

createDeck(){
const suits=[‘♠’,‘♥’,‘♦’,‘♣’];
const vals=[‘A’,‘2’,‘3’,‘4’,‘5’,‘6’,‘7’,‘8’,‘9’,‘10’,‘J’,‘Q’,‘K’];
this.g.bj.deck=[];
for(let d=0;d<6;d++){
suits.forEach(s=>
vals.forEach(v=>
this.g.bj.deck.push({v,s})
)
);
}
}

shuffleDeck(){
const deck=this.g.bj.deck;
for(let i=deck.length-1;i>0;i–){
const j=Math.floor(Math.random()*(i+1));
[deck[i],deck[j]]=[deck[j],deck[i]];
}
}

resetBJ(){
$(‘playerCards’).innerHTML=’’;
$(‘dealerCards’).innerHTML=’’;
$(‘playerScore’).textContent=‘0’;
$(‘dealerScore’).textContent=‘0’;
$(‘dealBtn’).disabled=0;
[‘hitBtn’,‘standBtn’,‘doubleBtn’,‘splitBtn’,‘insuranceBtn’].forEach(id=>{
const btn=$(id);
if(btn)btn.disabled=1;
});
Object.assign(this.g.bj,{dbl:0,spl:0,ins:0,spH:[],cDbl:0,cSpl:0});
}

async dealBJ(){
const bet=+$(‘blackjackBet’).value;
if(!await this.deduct(bet))return;
this.g.bj.bet=bet;
this.g.bj.act=1;
this.g.bj.pH=[this.g.bj.deck.pop(),this.g.bj.deck.pop()];
this.g.bj.dH=[this.g.bj.deck.pop(),this.g.bj.deck.pop()];
this.updBJ();
$(‘dealBtn’).disabled=1;
setTimeout(()=>{
$(‘hitBtn’).disabled=0;
$(‘standBtn’).disabled=0;
this.checkOpts();
if(this.getHandVal(this.g.bj.pH)===21)this.standBJ();
},400);
}

checkOpts(){
if(this.g.bj.pH.length===2){
this.g.bj.cDbl=1;
$(‘doubleBtn’).disabled=0;
if(this.g.bj.pH[0].v===this.g.bj.pH[1].v){
this.g.bj.cSpl=1;
$(‘splitBtn’).disabled=0;
}
}
if(this.g.bj.dH[0].v===‘A’){
$(‘insuranceBtn’).disabled=0;
}
}

async hitBJ(){
if(!this.g.bj.act)return;
this.g.bj.pH.push(this.g.bj.deck.pop());
this.g.bj.cDbl=0;
this.g.bj.cSpl=0;
[‘doubleBtn’,‘splitBtn’].forEach(id=>{
const btn=$(id);
if(btn)btn.disabled=1;
});
this.updBJ();
const pVal=this.getHandVal(this.g.bj.pH);
if(pVal>21){
this.vib(100);
this.endBJ(‘💥 Bust! Dealer wins’,0);
}else if(pVal===21){
this.standBJ();
}
}

async doubleBJ(){
if(!this.g.bj.cDbl||this.g.bj.dbl||!await this.deduct(this.g.bj.bet))return;
this.g.bj.bet*=2;
this.g.bj.dbl=1;
this.g.bj.pH.push(this.g.bj.deck.pop());
this.updBJ();
[‘hitBtn’,‘doubleBtn’,‘splitBtn’,‘insuranceBtn’].forEach(id=>{
const btn=$(id);
if(btn)btn.disabled=1;
});
setTimeout(()=>{
if(this.getHandVal(this.g.bj.pH)<=21){
this.standBJ();
}else{
this.vib(100);
this.endBJ(‘💥 Bust! Dealer wins’,0);
}
},500);
}

async splitBJ(){
if(!this.g.bj.cSpl||this.g.bj.spl||!await this.deduct(this.g.bj.bet))return;
this.g.bj.spl=1;
this.g.bj.spH=[this.g.bj.pH.pop()];
this.g.bj.pH.push(this.g.bj.deck.pop());
this.g.bj.spH.push(this.g.bj.deck.pop());
this.updBJ();
[‘splitBtn’,‘doubleBtn’].forEach(id=>{
const btn=$(id);
if(btn)btn.disabled=1;
});
this.showRes(‘blackjack’,‘Split! Playing first hand then second’,‘info’);
}

async insuranceBJ(){
if(this.g.bj.ins||this.g.bj.dH[0].v!==‘A’)return;
const iBet=this.g.bj.bet/2;
if(!await this.deduct(iBet))return;
this.g.bj.ins=iBet;
$(‘insuranceBtn’).disabled=1;
this.showRes(‘blackjack’,‘Insurance taken’,‘info’);
}

async standBJ(){
if(!this.g.bj.act)return;
[‘hitBtn’,‘standBtn’,‘doubleBtn’,‘splitBtn’,‘insuranceBtn’].forEach(id=>{
const btn=$(id);
if(btn)btn.disabled=1;
});
while(this.getHandVal(this.g.bj.dH)<17){
await new Promise(res=>setTimeout(()=>{
this.g.bj.dH.push(this.g.bj.deck.pop());
this.updBJ(1);
res();
},400));
}
this.resolveBJ();
}

resolveBJ(){
const pVal=this.getHandVal(this.g.bj.pH);
const dVal=this.getHandVal(this.g.bj.dH);
let win=0,msg=’’;
if(this.g.bj.ins&&dVal===21){
win+=this.g.bj.ins*2;
msg+=’Insurance pays! ’;
}
const outs=[
{c:()=>pVal>21,m:‘💥 Hand 1 busts!’,w:0},
{c:()=>dVal>21,m:‘🎉 Hand 1 wins! Dealer busts!’,w:this.g.bj.bet*2},
{c:()=>pVal===21&&this.g.bj.pH.length===2&&dVal!==21,m:‘🃏 Hand 1 BLACKJACK!’,w:this.g.bj.bet*2.5},
{c:()=>pVal>dVal,m:‘🎉 Hand 1 wins!’,w:this.g.bj.bet*2},
{c:()=>pVal<dVal,m:‘😔 Hand 1 loses’,w:0},
{c:()=>pVal===dVal,m:‘🤝 Hand 1 pushes’,w:this.g.bj.bet}
];
const out=outs.find(o=>o.c());
if(out){
msg+=out.m;
win+=out.w;
}
if(this.g.bj.spl){
const spVal=this.getHandVal(this.g.bj.spH);
const spOuts=[
{c:()=>spVal>21,m:’ | Hand 2 busts’,w:0},
{c:()=>dVal>21,m:’ | Hand 2 wins!’,w:this.g.bj.bet*2},
{c:()=>spVal===21&&this.g.bj.spH.length===2&&dVal!==21,m:’ | Hand 2 BLACKJACK!’,w:this.g.bj.bet*2.5},
{c:()=>spVal>dVal,m:’ | Hand 2 wins!’,w:this.g.bj.bet*2},
{c:()=>spVal<dVal,m:’ | Hand 2 loses’,w:0},
{c:()=>spVal===dVal,m:’ | Hand 2 pushes’,w:this.g.bj.bet}
];
const spOut=spOuts.find(o=>o.c());
if(spOut){
msg+=spOut.m;
win+=spOut.w;
}
}
this.endBJ(msg,win);
}

getHandVal(hand){
let val=0,aces=0;
hand.forEach(c=>{
if(c.v===‘A’){
aces++;
val+=11;
}else{
val+=([‘J’,‘Q’,‘K’].includes(c.v)?10:+c.v);
}
});
while(val>21&&aces>0){
val-=10;
aces–;
}
return val;
}

updBJ(showAll=0){
this.showHand(‘player’,this.g.bj.pH,1);
this.showHand(‘dealer’,this.g.bj.dH,showAll||!this.g.bj.act);
if(this.g.bj.spl){
const pCards=$(‘playerCards’);
const div=document.createElement(‘div’);
div.textContent=’|’;
div.style.cssText=‘color:#FFD700;font-size:2rem;margin:0 1rem;align-self:center;’;
pCards.appendChild(div);
this.g.bj.spH.forEach((c,i)=>{
const card=document.createElement(‘div’);
card.className=‘playing-card’;
card.style.animationDelay=`${(this.g.bj.pH.length+i)*80}ms`;
card.innerHTML=`${c.v}<br>${c.s}`;
if([‘♥’,‘♦’].includes(c.s))card.classList.add(‘red’);
pCards.appendChild(card);
});
}
$(‘playerScore’).textContent=this.g.bj.spl?
`${this.getHandVal(this.g.bj.pH)} | ${this.getHandVal(this.g.bj.spH)}`:
this.getHandVal(this.g.bj.pH);
$(‘dealerScore’).textContent=(showAll||!this.g.bj.act)?
this.getHandVal(this.g.bj.dH):
this.getHandVal([this.g.bj.dH[0]]);
}

showHand(who,hand,showAll=1){
const el=$(`${who}Cards`);
if(!el)return;
el.innerHTML=’’;
hand.forEach((c,i)=>{
const card=document.createElement(‘div’);
card.className=‘playing-card’;
card.style.animationDelay=`${i*80}ms`;
if(who===‘dealer’&&i===1&&!showAll){
card.classList.add(‘back’);
card.textContent=‘🚀’;
}else{
card.innerHTML=`${c.v}<br>${c.s}`;
if([‘♥’,‘♦’].includes(c.s))card.classList.add(‘red’);
}
el.appendChild(card);
});
}

async endBJ(msg,win=0){
this.g.bj.act=0;
if(win>0){
await this.add(win,‘win’);
msg+=` +${this.trimZeros(win.toFixed(8))} ${this.c}`;
this.vib([50,25,50]);
}else{
this.vib(100);
}
this.updBJ(1);
this.showRes(‘blackjack’,msg,win>0?‘win’:‘lose’);
setTimeout(()=>{
this.resetBJ();
this.createDeck();
this.shuffleDeck();
},2500);
}

// === HI-LO GAME ===
initHilo(){
this.g.h={card:null,strk:0,bet:0,act:0};
this.resetHilo();
$(‘dealHiloBtn’).onclick=()=>{
this.vib(50);
this.startHilo();
};
$(‘higherBtn’).onclick=()=>{
this.vib(25);
this.guessHilo(‘higher’);
};
$(‘lowerBtn’).onclick=()=>{
this.vib(25);
this.guessHilo(‘lower’);
};
$(‘cashoutBtn’).onclick=()=>{
this.vib(75);
this.cashHilo();
};
}

resetHilo(){
$(‘currentCard’).innerHTML=’<div class="playing-card hilo-main-card">?</div>’;
$(‘dealHiloBtn’).style.display=‘block’;
[‘higherBtn’,‘lowerBtn’,‘cashoutBtn’].forEach(id=>$(id).disabled=1);
this.updStreak();
}

async startHilo(){
const bet=+$(‘hiloBet’).value;
if(!await this.deduct(bet))return;
Object.assign(this.g.h,{bet,strk:0,act:1,card: this.getRandCard()});
this.dispCard('currentCard',this.g.h.card);
$('dealHiloBtn').style.display='none';
['higherBtn','lowerBtn','cashoutBtn'].forEach(id=>$(id).disabled=0);
this.updStreak();
}

guessHilo(guess){
if(!this.g.h.act)return;
const next=this.getRandCard();
const curr=this.getCardVal(this.g.h.card);
const nextVal=this.getCardVal(next);
const correct=(guess==='higher'&&nextVal>curr)||(guess==='lower'&&nextVal<curr);
if(correct){
this.g.h.strk++;
this.g.h.card=next;
this.dispCard('currentCard',next);
this.updStreak();
this.showRes('hilo',`🎉 Correct! Streak: ${this.g.h.strk}`,'win');
this.vib([25,50,25]);
}else{
this.showRes('hilo',`❌ Wrong! Game over. Streak: ${this.g.h.strk}`,'lose');
this.vib(100);
this.endHilo();
}
}

async cashHilo(){
if(!this.g.h.act)return;
const win=this.g.h.bet*Math.pow(2,this.g.h.strk);
await this.add(win,'win');
this.showRes('hilo',`💰 Cashed out! Won ${this.trimZeros(win.toFixed(8))} ${this.c}`,'win');
this.endHilo();
}

autoCashHilo(){
if(!this.g.h.act)return;
const win=this.g.h.bet*Math.pow(2,this.g.h.strk);
this.add(win,'win');
this.notify(`💰 Auto cash-out! Won ${this.trimZeros(win.toFixed(8))} ${this.c}`);
this.endHilo();
}

endHilo(){
this.g.h.act=0;
setTimeout(()=>this.resetHilo(),3000);
}

updStreak(){
const cont=$('streakCards');
const countEl=$('.streak-count');
if(countEl){
countEl.textContent=this.g.h.strk;
countEl.classList.add('updating');
setTimeout(()=>countEl.classList.remove('updating'),300);
}
if(!cont)return;
cont.innerHTML=this.g.h.strk===0?'<div class="streak-placeholder">Start playing!</div>':'';
for(let i=0;i<Math.min(this.g.h.strk,10);i++){
const card=document.createElement('div');
card.className='streak-card';
card.textContent='🃏';
card.style.animationDelay=`${i*50}ms`;
cont.appendChild(card);
}
}

getRandCard(){
const suits=['♠','♥','♦','♣'];
const vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
return{
suit:suits[Math.floor(Math.random()*4)],
value:vals[Math.floor(Math.random()*13)]
};
}

getCardVal(card){
return card.value==='A'?1:
['J','Q','K'].includes(card.value)?
[11,12,13][['J','Q','K'].indexOf(card.value)]:
parseInt(card.value);
}

dispCard(id,card){
const cont=$(id);
cont.innerHTML='';
const cardEl=document.createElement('div');
cardEl.className='playing-card hilo-main-card';
cardEl.innerHTML=`${card.value}<br>${card.suit}`;
if(['♥','♦'].includes(card.suit))cardEl.classList.add('red');
cardEl.style.transform='scale(0.8)';
cont.appendChild(cardEl);
setTimeout(()=>cardEl.style.transform='scale(1)',100);
}

// === DICE GAME ===
initDice(){
this.g.d={bet:null,v1:1,v2:1,roll:0,hot:[]};
this.setupDice();
this.resetDice();
this.enhDice();
$('rollBtn').onclick=()=>{
this.vib(75);
this.rollDice();
};
$$('.bet-option').forEach(btn=>btn.onclick=()=>{
this.vib(25);
this.selBet(btn.dataset.bet);
});
}

enhDice(){
const cont=$('dice')?.querySelector('.dice-betting');
const opts=cont?.querySelector('.bet-options');
if(opts){
opts.innerHTML=['low','seven','high','hard','field'].map((bet,i)=>
`<button class="bet-option" data-bet="${bet}">${['LOW (2-6) - 2x','SEVEN (7) - 5x','HIGH (8-12) - 2x','HARD WAYS - 8x','FIELD (3,4,9,10,11) - 2x'][i]}</button>`
).join('');
$$('.bet-option').forEach(btn=>btn.onclick=()=>{
this.vib(25);
this.selBet(btn.dataset.bet);
});
}
}

setupDice(){
['dice1','dice2'].forEach(dId=>{
for(let f=1;f<=6;f++){
const fEl=$(dId)?.querySelector(`.face-${f}`);
if(fEl){
fEl.innerHTML='';
for(let i=0;i<f;i++){
fEl.appendChild(Object.assign(document.createElement('div'),{className:'dice-dot'}));
}
}
}
});
}

resetDice(){
$('rollBtn').disabled=1;
$('selectedBet').textContent='None';
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
Object.assign(this.g.d,{v1:1,v2:1});
this.showFace('dice1',1);
this.showFace('dice2',1);
this.updTot();
}

selBet(bet){
this.g.d.bet=bet;
$$('.bet-option').forEach(btn=>btn.classList.remove('selected'));
document.querySelector(`[data-bet="${bet}"]`).classList.add('selected');
$('selectedBet').textContent={
low:'LOW (2-6)',
seven:'SEVEN (7)',
high:'HIGH (8-12)',
hard:'HARD WAYS',
field:'FIELD NUMBERS'
}[bet];
$('rollBtn').disabled=0;
}

async rollDice(){
if(!this.g.d.bet||this.g.d.roll)return;
const bet=+$('diceBet').value;
if(!await this.deduct(bet))return;
this.g.d.roll=1;
const btn=$('rollBtn');
this.load(btn,'ROLLING...');
['dice1','dice2'].forEach(dId=>{
const dice=$(dId);
dice.classList.add('rolling');
dice.style.transform='rotateX(720deg) rotateY(720deg)';
});
await new Promise(r=>setTimeout(r,1200));
this.g.d.v1=Math.floor(Math.random()*6)+1;
this.g.d.v2=Math.floor(Math.random()*6)+1;
['dice1','dice2'].forEach(dId=>{
const dice=$(dId);
dice.classList.remove('rolling');
dice.style.transform='rotateX(0deg) rotateY(0deg)';
});
this.showFace('dice1',this.g.d.v1);
this.showFace('dice2',this.g.d.v2);
this.updTot();
const tot=this.g.d.v1+this.g.d.v2;
const isHard=this.g.d.v1===this.g.d.v2;
this.g.d.hot.unshift(tot);
if(this.g.d.hot.length>10)this.g.d.hot.pop();
const outs={
low:()=>tot>=2&&tot<=6?{win:1,mult:2,msg:`LOW wins! ${tot} is low`}:{win:0},
high:()=>tot>=8&&tot<=12?{win:1,mult:2,msg:`HIGH wins! ${tot} is high`}:{win:0},
seven:()=>tot===7?{win:1,mult:5,msg:'SEVEN! Lucky 7 wins'}:{win:0},
hard:()=>[4,6,8,10].includes(tot)&&isHard?{win:1,mult:8,msg:`HARD ${tot}! Perfect doubles`}:{win:0},
field:()=>[3,4,9,10,11].includes(tot)?{win:1,mult:2,msg:`FIELD wins! ${tot} hits field`}:{win:0}
};
const res=outs[this.g.d.bet]();
if(res.win){
const winAmt=bet*res.mult;
await this.add(winAmt,'win');
['dice1','dice2'].forEach(dId=>{
const dice=$(dId);
dice.style.boxShadow='0 0 30px #FFD700';
setTimeout(()=>dice.style.boxShadow='0 0 25px var(--cg), inset 0 0 20px #4A148C4d',800);
});
this.showRes('dice',`🎲 ${res.msg} - Won ${this.trimZeros(winAmt.toFixed(8))} ${this.c}`,'win');
}else{
this.showRes('dice',`🎲 Rolled ${tot} - No win on ${this.g.d.bet}`,'lose');
}
this.g.d.roll=0;
this.unload(btn,'ROLL');
setTimeout(()=>this.resetDice(),1200);
}

showFace(dId,val){
const dice=$(dId);
$$(`#${dId} .dice-face`).forEach(f=>f.classList.remove('active'));
dice.querySelector(`.face-${val}`)?.classList.add('active');
}

updTot(){
const totEl=$('diceTotal');
totEl.textContent=this.g.d.v1+this.g.d.v2;
totEl.classList.add('updating');
setTimeout(()=>totEl.classList.remove('updating'),300);
}
}

function $(id){return document.getElementById(id)}
function $$(sel){return document.querySelectorAll(sel)}
function openAminaExplorer(){window.open('https://explorer.perawallet.app/asset/1107424865/','_blank')}
function showDonationModal(){$('donationModal').style.display='flex'}
function closeDonationModal(){$('donationModal').style.display='none'}
function copyDonationAddress(){const input=$('donationWallet');input.select();document.execCommand('copy');alert('Address copied! 🚀');}
let casino;
document.addEventListener('DOMContentLoaded',()=>{casino=new AminaCasino();});
window.casino=casino;
// Fix broken navigation
setTimeout(function() {
  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
    card.onclick = function() {
      const game = card.getAttribute('data-game');
      if (game) window.location.hash = game;
    };
  });
}, 1000);