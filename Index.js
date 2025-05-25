// FILE: index.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Index.js loading...');
    
    setTimeout(() => {
        initializeWelcomeExperience();
        startCosmicEffects();
        setupBackgroundMusic();
        setupWalletEnhancements();
    }, 500);
    
    console.log('✨ Index.js ready!');
});

function setupWalletEnhancements() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'walletBtn' && e.target.innerHTML.includes('✅')) {
            createWalletCelebration();
        }
    });
    
    const originalToggle = document.getElementById('currencyToggle');
    if (originalToggle) {
        originalToggle.addEventListener('click', () => {
            setTimeout(() => {
                const isAmina = originalToggle.classList.contains('amina');
                if (isAmina && window.aminaCasino && window.aminaCasino.connectedAccount) {
                    createAminaCoinRain();
                }
            }, 100);
        });
    }
}

function createWalletCelebration() {
    for (let i = 0; i < 8; i++) {
        const icon = document.createElement('div');
        icon.innerHTML = '💳';
        icon.style.cssText = `position: fixed; font-size: 20px; pointer-events: none; z-index: 1000; left: 50%; top: 20%; animation: walletExplode 2s ease-out forwards; filter: drop-shadow(0 0 10px #FFD700);`;
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 100;
        icon.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        icon.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        document.body.appendChild(icon);
        setTimeout(() => { if (icon.parentNode) icon.parentNode.removeChild(icon); }, 2000);
    }
}

function createAminaCoinRain() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `position: fixed; font-size: ${Math.random() * 10 + 15}px; pointer-events: none; z-index: 999; left: ${Math.random() * 100}%; top: -50px; animation: aminaCoinFall 3s ease-in forwards; filter: drop-shadow(0 0 10px #E91E63);`;
            document.body.appendChild(coin);
            setTimeout(() => { if (coin.parentNode) coin.parentNode.removeChild(coin); }, 3000);
        }, i * 100);
    }
}

function setupBackgroundMusic() {
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggle';
    musicButton.innerHTML = '🎵';
    musicButton.style.cssText = `position: fixed; bottom: 20px; left: 20px; width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan)); border: 2px solid var(--cosmic-gold); color: var(--space-black); font-size: 1.2rem; cursor: pointer; z-index: 1001; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);`;
    document.body.appendChild(musicButton);
    
    const audio = document.createElement('audio');
    audio.id = 'backgroundMusic';
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = 'auto';
    audio.src = 'https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
    document.body.appendChild(audio);
    
    let musicPlaying = false;
    
    musicButton.addEventListener('click', () => {
        if (musicPlaying) {
            audio.pause();
            musicButton.innerHTML = '🔇';
            musicButton.style.background = 'linear-gradient(135deg, var(--void-gray), var(--cosmic-purple))';
            musicPlaying = false;
        } else {
            audio.play().catch(() => { console.log('🎵 Click to start music'); });
            musicButton.innerHTML = '🎵';
            musicButton.style.background = 'linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan))';
            musicPlaying = true;
        }
    });
    
    const originalEnterFunction = document.getElementById('enterCasino');
    if (originalEnterFunction) {
        originalEnterFunction.addEventListener('click', () => {
            setTimeout(() => {
                if (!musicPlaying) {
                    audio.play().catch(() => {});
                    musicPlaying = true;
                }
            }, 1000);
        });
    }
}

function initializeWelcomeExperience() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainCasino = document.getElementById('mainCasino');
    
    if (welcomeScreen && mainCasino) {
        welcomeScreen.classList.add('active');
        mainCasino.classList.remove('active');
        
        const enterBtn = document.getElementById('enterCasino');
        if (enterBtn) {
            enterBtn.addEventListener('click', function() {
                welcomeScreen.classList.remove('active');
                setTimeout(() => {
                    mainCasino.classList.add('active');
                    triggerCoinCelebration();
                }, 300);
            });
        }
    }
}

function startCosmicEffects() {
    createCosmicParticles();
    setInterval(createCosmicParticles, 6000);
    createFloatingCoins();
    setInterval(createFloatingCoins, 10000);
}

function createCosmicParticles() {
    const particleCount = window.innerWidth < 768 ? 5 : 8;
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => { createSingleParticle(); }, i * 400);
    }
}

function createSingleParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 6 + 8;
    particle.style.cssText = `position: fixed; width: ${size}px; height: ${size}px; background: ${color}; border-radius: 50%; pointer-events: none; z-index: -1; opacity: ${Math.random() * 0.6 + 0.2}; left: ${Math.random() * 100}%; top: 100vh; box-shadow: 0 0 ${size * 2}px ${color}; animation: floatUp ${duration}s linear forwards;`;
    document.body.appendChild(particle);
    setTimeout(() => { if (particle && particle.parentNode) particle.parentNode.removeChild(particle); }, duration * 1000);
}

function createFloatingCoins() {
    const coinCount = window.innerWidth < 768 ? 2 : 3;
    for (let i = 0; i < coinCount; i++) {
        setTimeout(() => { createFloatingCoin(); }, i * 1500);
    }
}

function createFloatingCoin() {
    const coin = document.createElement('div');
    const size = Math.random() * 15 + 12;
    const duration = Math.random() * 4 + 6;
    coin.innerHTML = '🪙';
    coin.style.cssText = `position: fixed; font-size: ${size}px; pointer-events: none; z-index: -1; opacity: ${Math.random() * 0.5 + 0.3}; left: ${Math.random() * 100}%; top: 100vh; animation: coinFloat ${duration}s ease-in-out forwards; filter: drop-shadow(0 0 8px #FFD700);`;
    document.body.appendChild(coin);
    setTimeout(() => { if (coin && coin.parentNode) coin.parentNode.removeChild(coin); }, duration * 1000);
}

function triggerCoinCelebration() {
    const celebrationCount = 6;
    for (let i = 0; i < celebrationCount; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `position: fixed; font-size: 25px; pointer-events: none; z-index: 999; left: ${Math.random() * window.innerWidth}px; top: -50px; animation: celebrationFall 2.5s ease-in forwards; filter: drop-shadow(0 0 12px #FFD700);`;
            document.body.appendChild(coin);
            setTimeout(() => { if (coin && coin.parentNode) coin.parentNode.removeChild(coin); }, 2500);
        }, i * 150);
    }
}

const walletStyle = document.createElement('style');
walletStyle.textContent = `
    @keyframes walletExplode { 
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; } 
    }
    @keyframes aminaCoinFall { 
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
    }
    @keyframes floatUp { 
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; } 
        10% { opacity: 1; } 
        50% { transform: translateY(-40vh) translateX(${Math.random() * 80 - 40}px) rotate(180deg); } 
        90% { opacity: 1; } 
        100% { transform: translateY(-80vh) translateX(${Math.random() * 120 - 60}px) rotate(360deg); opacity: 0; } 
    }
    @keyframes coinFloat { 
        0% { transform: translateY(0) rotate(0deg); opacity: 0; } 
        10% { opacity: 1; } 
        50% { transform: translateY(-25vh) rotate(180deg); } 
        90% { opacity: 1; } 
        100% { transform: translateY(-50vh) rotate(360deg); opacity: 0; } 
    }
    @keyframes celebrationFall { 
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 
        100% { transform: translateY(100vh) rotate(540deg); opacity: 0; } 
    }
`;
document.head.appendChild(walletStyle);

console.log('🌌 Enhanced features loaded!');