// index.js
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
initWelcome();startEffects();setupMusic();setupWalletEffects();setupSounds();
},500));

function setupWalletEffects(){
document.addEventListener('click',e=>{
if(e.target.id==='walletBtn'&&e.target.innerHTML.includes('✅'))createCelebration('💳',8);
});
const toggle=document.getElementById('currencyToggle');
if(toggle)toggle.addEventListener('click',()=>setTimeout(()=>{
if(toggle.classList.contains('amina')&&window.aminaCasino?.connectedAccount)createRain('🪙',10);
},100));
}

function createCelebration(icon,count){
for(let i=0;i<count;i++){
const el=document.createElement('div');
el.innerHTML=icon;
el.style.cssText=`position:fixed;font-size:20px;pointer-events:none;z-index:1000;left:50%;top:20%;animation:explode 1.5s ease-out forwards`;
const angle=(Math.PI*2*i)/count,distance=Math.random()*100+80;
el.style.setProperty('--dx',Math.cos(angle)*distance+'px');
el.style.setProperty('--dy',Math.sin(angle)*distance+'px');
document.body.appendChild(el);
setTimeout(()=>el.remove(),1500);
}
}

function createRain(icon,count){
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
el.innerHTML=icon;
el.style.cssText=`position:fixed;font-size:${Math.random()*10+15}px;pointer-events:none;z-index:999;left:${Math.random()*100}%;top:-50px;animation:fall 3s ease-in forwards`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),3000);
},i*100);
}

function setupMusic(){
const btn=document.createElement('button');
btn.id='musicToggle';
btn.innerHTML='🎵';
btn.style.cssText=`position:fixed;bottom:20px;left:20px;width:45px;height:45px;border-radius:50%;border:2px solid #FFD700;font-size:1.2rem;background:linear-gradient(135deg,#FFD700,#00E5FF);cursor:pointer;z-index:1001;transition:all 0.3s ease`;
const audio=document.createElement('audio');
audio.loop=true;audio.volume=0.25;
audio.src='https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
let playing=false;
btn.addEventListener('click',()=>{
if(playing){audio.pause();btn.innerHTML='🔇';}
else{audio.play().catch(()=>{});btn.innerHTML='🎵';}
playing=!playing;
});
document.body.appendChild(btn);
document.body.appendChild(audio);

// AUTO-PLAY ON CASINO ENTER
document.getElementById('enterCasino')?.addEventListener('click',()=>{
setTimeout(()=>{
if(!playing){
audio.play().catch(()=>{});
playing=true;
btn.innerHTML='🎵';
}
},800);
});
}

function initWelcome(){
const welcome=document.getElementById('welcomeScreen');
const casino=document.getElementById('mainCasino');
if(welcome&&casino){
document.getElementById('enterCasino')?.addEventListener('click',()=>{
welcome.classList.remove('active');
setTimeout(()=>{casino.classList.add('active');createRain('🪙',6);},200);
});
}
}

function startEffects(){
createParticles();setInterval(createParticles,5000);
createFloatingCoins();setInterval(createFloatingCoins,8000);
setupBigWinEffects();
}

function createParticles(){
const count=window.innerWidth<768?6:10;
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
const size=Math.random()*3+2;
const colors=['#FFD700','#00E5FF','#E91E63','#9C27B0','#FFFFFF'];
const color=colors[Math.floor(Math.random()*colors.length)];
el.style.cssText=`position:fixed;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;z-index:-1;opacity:${Math.random()*0.6+0.2};left:${Math.random()*100}%;top:100vh;animation:floatUp ${Math.random()*6+8}s linear forwards`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),14000);
},i*400);
}

function createFloatingCoins(){
const count=window.innerWidth<768?2:3;
for(let i=0;i<count;i++)setTimeout(()=>{
const el=document.createElement('div');
el.innerHTML='🪙';
el.style.cssText=`position:fixed;font-size:${Math.random()*15+12}px;pointer-events:none;z-index:-1;opacity:${Math.random()*0.5+0.3};left:${Math.random()*100}%;top:100vh;animation:coinFloat ${Math.random()*5+6}s ease-in-out forwards`;
document.body.appendChild(el);
setTimeout(()=>el.remove(),11000);
},i*800);
}

function setupBigWinEffects(){
const observer=new MutationObserver(mutations=>mutations.forEach(mutation=>{
if(mutation.type==='attributes'&&mutation.attributeName==='class'){
const target=mutation.target;
if(target.classList.contains('game-result')&&target.classList.contains('win')&&target.classList.contains('show')){
if(target.textContent.includes('WIN!')){
document.body.style.animation='screenShake 0.4s ease-in-out';
createExplosion();
setTimeout(()=>document.body.style.animation='',400);
}
}
}
}));
document.querySelectorAll('.game-result').forEach(el=>observer.observe(el,{attributes:true}));
}

function createExplosion(){
const centerX=window.innerWidth/2,centerY=window.innerHeight/2;
for(let i=0;i<10;i++){
const el=document.createElement('div');
el.innerHTML='🪙';
el.style.cssText=`position:fixed;font-size:20px;pointer-events:none;z-index:1000;left:${centerX}px;top:${centerY}px;animation:coinExplode 1.5s ease-out forwards`;
const angle=(Math.PI*2*i)/10,distance=Math.random()*150+80;
el.style.setProperty('--dx',Math.cos(angle)*distance+'px');
el.style.setProperty('--dy',Math.sin(angle)*distance+'px');
document.body.appendChild(el);
setTimeout(()=>el.remove(),1500);
}
}

function setupSounds(){
document.addEventListener('click',e=>{
if(e.target.classList.contains('cosmic-btn')&&!e.target.disabled)playSound(700,'sine',0.08,0.1);
if(e.target.classList.contains('nav-btn'))playSound(500,'triangle',0.06,0.12);
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
@keyframes explode{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2);opacity:0}}
@keyframes fall{0%{transform:translateY(-50px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
@keyframes floatUp{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh);opacity:0}}
@keyframes coinFloat{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translateY(-50vh) rotate(360deg);opacity:0}}
@keyframes screenShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes coinExplode{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2);opacity:0}}
`;
document.head.appendChild(style);

window.createWalletCelebration=()=>createCelebration('💳',8);
window.createAminaCoinRain=()=>createRain('🪙',10);