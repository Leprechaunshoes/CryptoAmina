// index.js - Enhanced with Pera Wallet Effects
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
initWelcome();startEffects();setupMusic();setupWalletEffects();setupSounds();
},500));

function setupWalletEffects(){
document.addEventListener('click',e=>{
if(e.target.id==='walletBtn'){
if(e.target.innerHTML.includes('✅')){
createCelebration('🎉',12);
setTimeout(()=>createRain('💎',8),500);
}else if(e.target.innerHTML.includes('🔗')){
createCelebration('🔗',6);
}
}
});

const toggle=document.getElementById('currencyToggle');
if(toggle)toggle.addEventListener('click',()=>setTimeout(()=>{
if(toggle.classList.contains('amina')&&window.aminaCasino?.connectedAccount){
createAminaCoinRain();
createCelebration('🪙',15);
}
},100));

document.addEventListener('aminaBalanceUpdate',()=>{
createFloatingCoins();
setTimeout(()=>createCelebration('💰',8),200);
});
}

function createCelebration(icon,count){
for(let i=0;i<count;i++){
const el=document.createElement('div');
el.innerHTML=icon;
el.style.cssText=`position:fixed;font-size:${Math.random()*8+16}px;pointer-events:none;z-index:1000;left:50%;top:30%;animation:explode 2s ease-out forwards`;
const angle=(Math.PI*2*i)/count,distance=Math.random()*120+100;
el.style.setProperty('--dx',Math.cos(angle)*distance+'px');
el.style.setProperty('--dy',Math.sin(angle)*distance+'px');
document.body.appendChild(el);
setTimeout(()=>el.remove(),2000);
}
}

function createRain(icon,count){
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
el.innerHTML=icon;
el.style.cssText=`position:fixed;font-size:${Math.random()*12+18}px;pointer-events:none;z-index:999;left:${Math.random()*100}%;top:-50px;animation:fall 4s ease-in forwards;opacity:${Math.random()*0.4+0.6}`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),4000);
},i*150);
}

function createAminaCoinRain(){
for(let i=0;i<15;i++)setTimeout(()=>{
const el=document.createElement('div');
el.innerHTML='🪙';
el.style.cssText=`position:fixed;font-size:${Math.random()*15+20}px;pointer-events:none;z-index:999;left:${Math.random()*100}%;top:-50px;animation:coinFall 3s ease-in forwards;filter:drop-shadow(0 0 10px #FFD700)`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),3000);
},i*100);
}

function setupMusic(){
const btn=document.createElement('button');
btn.id='musicToggle';
btn.innerHTML='🎵';
btn.title='Toggle Music';
btn.style.cssText=`position:fixed;bottom:20px;left:20px;width:50px;height:50px;border-radius:50%;border:3px solid #FFD700;font-size:1.3rem;background:linear-gradient(135deg,#FFD700,#00E5FF);cursor:pointer;z-index:1001;transition:all 0.3s ease;box-shadow:0 0 15px rgba(255,215,0,0.5)`;
const audio=document.createElement('audio');
audio.loop=true;audio.volume=0.2;
audio.src='https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
let playing=false;
btn.addEventListener('click',()=>{
if(playing){
audio.pause();
btn.innerHTML='🔇';
btn.style.background='linear-gradient(135deg,#666,#999)';
createCelebration('🔇',4);
}else{
audio.play().catch(()=>{});
btn.innerHTML='🎵';
btn.style.background='linear-gradient(135deg,#FFD700,#00E5FF)';
createCelebration('🎵',6);
}
playing=!playing;
});
document.body.appendChild(btn);
document.body.appendChild(audio);

document.getElementById('enterCasino')?.addEventListener('click',()=>{
setTimeout(()=>{
if(!playing){
audio.play().catch(()=>{});
playing=true;
btn.innerHTML='🎵';
btn.style.background='linear-gradient(135deg,#FFD700,#00E5FF)';
}
},1000);
});
}

function initWelcome(){
const welcome=document.getElementById('welcomeScreen');
const casino=document.getElementById('mainCasino');
if(welcome&&casino){
document.getElementById('enterCasino')?.addEventListener('click',()=>{
welcome.classList.remove('active');
createCelebration('🚀',10);
setTimeout(()=>{
casino.classList.add('active');
createRain('🪙',8);
setTimeout(()=>createFloatingCoins(),800);
},300);
});
}
}

function startEffects(){
createParticles();
setInterval(createParticles,6000);
createFloatingCoins();
setInterval(createFloatingCoins,10000);
setupBigWinEffects();
setupWalletConnectionEffects();
}

function createParticles(){
const count=window.innerWidth<768?8:15;
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
const size=Math.random()*4+2;
const colors=['#FFD700','#00E5FF','#E91E63','#9C27B0','#FFFFFF','#4CAF50'];
const color=colors[Math.floor(Math.random()*colors.length)];
el.style.cssText=`position:fixed;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;z-index:-1;opacity:${Math.random()*0.7+0.3};left:${Math.random()*100}%;top:100vh;animation:floatUp ${Math.random()*8+10}s linear forwards;box-shadow:0 0 5px ${color}`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),18000);
},i*200);
}

function createFloatingCoins(){
const count=window.innerWidth<768?3:5;
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
el.innerHTML='🪙';
el.style.cssText=`position:fixed;font-size:${Math.random()*20+15}px;pointer-events:none;z-index:-1;opacity:${Math.random()*0.6+0.4};left:${Math.random()*100}%;top:100vh;animation:coinFloat ${Math.random()*8+8}s ease-in-out forwards;filter:drop-shadow(0 0 8px #FFD700)`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),16000);
},i*600);
}

function setupBigWinEffects(){
const observer=new MutationObserver(mutations=>mutations.forEach(mutation=>{
if(mutation.type==='attributes'&&mutation.attributeName==='class'){
const target=mutation.target;
if(target.classList.contains('game-result')&&target.classList.contains('win')&&target.classList.contains('show')){
if(target.textContent.includes('WIN!')){
document.body.style.animation='screenShake 0.6s ease-in-out';
createExplosion();
createRain('💰',12);
setTimeout(()=>{
document.body.style.animation='';
createCelebration('🎉',20);
},400);
}
}
}
}));
document.querySelectorAll('.game-result').forEach(el=>observer.observe(el,{attributes:true}));
}

function setupWalletConnectionEffects(){
const observer=new MutationObserver(mutations=>mutations.forEach(mutation=>{
if(mutation.type==='childList'||mutation.type==='characterData'){
const target=mutation.target;
if(target.classList&&target.classList.contains('balance-display')){
if(target.classList.contains('win')){
createFloatingCoins();
setTimeout(()=>createCelebration('💎',8),300);
}
}
}
}));
const balanceEl=document.querySelector('.balance-display');
if(balanceEl)observer.observe(balanceEl,{attributes:true,childList:true,subtree:true});
}

function createExplosion(){
const centerX=window.innerWidth/2,centerY=window.innerHeight/2;
for(let i=0;i<15;i++){
const el=document.createElement('div');
el.innerHTML='🪙';
el.style.cssText=`position:fixed;font-size:${Math.random()*10+20}px;pointer-events:none;z-index:1000;left:${centerX}px;top:${centerY}px;animation:coinExplode 2s ease-out forwards;filter:drop-shadow(0 0 10px #FFD700)`;
const angle=(Math.PI*2*i)/15,distance=Math.random()*200+120;
el.style.setProperty('--dx',Math.cos(angle)*distance+'px');
el.style.setProperty('--dy',Math.sin(angle)*distance+'px');
document.body.appendChild(el);
setTimeout(()=>el.remove(),2000);
}
}

function setupSounds(){
document.addEventListener('click',e=>{
if(e.target.classList.contains('cosmic-btn')&&!e.target.disabled){
if(e.target.textContent.includes('SPIN'))playSound(800,'sine',0.1,0.15);
else if(e.target.textContent.includes('DROP'))playSound(600,'triangle',0.08,0.2);
else if(e.target.textContent.includes('DEAL'))playSound(400,'square',0.06,0.1);
else playSound(700,'sine',0.08,0.12);
}
if(e.target.classList.contains('nav-btn'))playSound(500,'triangle',0.06,0.1);
if(e.target.classList.contains('wallet-btn'))playSound(900,'sine',0.1,0.15);
if(e.target.id==='currencyToggle')playSound(750,'triangle',0.08,0.12);
});
}

function playSound(frequency,type,volume,duration){
try{
const ctx=new(window.AudioContext||window.webkitAudioContext)();
const osc=ctx.createOscillator(),gain=ctx.createGain();
osc.connect(gain);gain.connect(ctx.destination);
osc.frequency.setValueAtTime(frequency,ctx.currentTime);
osc.type=type;
gain.gain.setValueAtTime(0,ctx.currentTime);
gain.gain.linearRampToValueAtTime(volume,ctx.currentTime+0.01);
gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration);
osc.start(ctx.currentTime);osc.stop(ctx.currentTime+duration);
}catch(e){}
}

const style=document.createElement('style');
style.textContent=`
@keyframes explode{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.3);opacity:0}}
@keyframes fall{0%{transform:translateY(-50px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes coinFall{0%{transform:translateY(-50px) rotate(0deg) scale(1);opacity:1}100%{transform:translateY(100vh) rotate(1080deg) scale(0.5);opacity:0}}
@keyframes floatUp{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-120vh);opacity:0}}
@keyframes coinFloat{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translateY(-80vh) rotate(540deg);opacity:0}}
@keyframes screenShake{0%,100%{transform:translateX(0)}10%{transform:translateX(-4px)}20%{transform:translateX(4px)}30%{transform:translateX(-3px)}40%{transform:translateX(3px)}50%{transform:translateX(-2px)}60%{transform:translateX(2px)}70%{transform:translateX(-1px)}80%{transform:translateX(1px)}}
@keyframes coinExplode{0%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2) rotate(720deg);opacity:0}}
`;
document.head.appendChild(style);

window.createWalletCelebration=()=>createCelebration('🎉',12);
window.createAminaCoinRain=()=>createAminaCoinRain();
window.createFloatingCoins=createFloatingCoins;
window.createExplosion=createExplosion;