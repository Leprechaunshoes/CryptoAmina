// FILE: index.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Index.js loading...');
    
    setTimeout(() => {
        initializeWelcomeExperience();
        startCosmicEffects();
        setupEnhancedFeatures();
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
    
    setupWalletNotifications();
}

function createWalletCelebration() {
    for (let i = 0; i < 12; i++) {
        const icon = document.createElement('div');
        icon.innerHTML = '💳';
        icon.style.cssText = `position: fixed; font-size: 24px; pointer-events: none; z-index: 1000; left: 50%; top: 20%; animation: walletExplode 2s ease-out forwards; filter: drop-shadow(0 0 10px #FFD700);`;
        const angle = (Math.PI * 2 * i) / 12;
        const distance = Math.random() * 150 + 100;
        icon.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        icon.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        document.body.appendChild(icon);
        setTimeout(() => { if (icon.parentNode) icon.parentNode.removeChild(icon); }, 2000);
    }
    playWalletConnectSound();
}

function createAminaCoinRain() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `position: fixed; font-size: ${Math.random() * 15 + 20}px; pointer-events: none; z-index: 999; left: ${Math.random() * 100}%; top: -50px; animation: aminaCoinFall 4s ease-in forwards; filter: drop-shadow(0 0 15px #E91E63);`;
            document.body.appendChild(coin);
            setTimeout(() => { if (coin.parentNode) coin.parentNode.removeChild(coin); }, 4000);
        }, i * 150);
    }
}

function setupWalletNotifications() {
    window.walletNotify = (message, type = 'info', duration = 3000) => {
        const notification = document.createElement('div');
        notification.innerHTML = `<div style="display: flex; align-items: center; gap: 0.5rem;"><span style="font-size: 1.2rem;">${getWalletIcon(type)}</span><span>${message}</span></div>`;
        notification.style.cssText = `position: fixed; top: 80px; right: 20px; background: ${getWalletNotificationColor(type)}; color: white; padding: 1rem 2rem; border-radius: 15px; font-family: 'Orbitron', monospace; font-weight: 700; z-index: 1002; box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); transform: translateX(100%); transition: transform 0.3s ease-out; max-width: 300px; border: 2px solid #FFD700;`;
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 50);
        setTimeout(() => { notification.style.transform = 'translateX(100%)'; setTimeout(() => notification.remove(), 300); }, duration);
    };
}

function getWalletIcon(type) {
    const icons = { 'wallet': '💳', 'amina': '🪙', 'win': '🎉', 'error': '⚠️', 'success': '✅' };
    return icons[type] || '💫';
}

function getWalletNotificationColor(type) {
    const colors = { 'wallet': 'linear-gradient(135deg, #9C27B0, #673AB7)', 'amina': 'linear-gradient(135deg, #E91E63, #FF6B35)', 'win': 'linear-gradient(135deg, #4CAF50, #8BC34A)', 'error': 'linear-gradient(135deg, #F44336, #E91E63)', 'success': 'linear-gradient(135deg, #4CAF50, #00E676)' };
    return colors[type] || 'linear-gradient(135deg, #FFD700, #00E5FF)';
}

function playWalletConnectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.8);
            }, i * 200);
        });
    } catch (e) { console.log('🔇 Wallet connect sound not available'); }
}

function setupBackgroundMusic() {
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggle';
    musicButton.innerHTML = '🎵';
    musicButton.style.cssText = `position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan)); border: 2px solid var(--cosmic-gold); color: var(--space-black); font-size: 1.5rem; cursor: pointer; z-index: 1001; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);`;
    document.body.appendChild(musicButton);
    
    const audio = document.createElement('audio');
    audio.id = 'backgroundMusic';
    audio.loop = true;
    audio.volume = 0.3;
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
            audio.play().catch(() => { console.log('🎵 Audio autoplay blocked, user interaction required'); });
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
                    audio.play().catch(() => { console.log('🎵 Music ready - click music button to start!'); });
                    musicPlaying = true;
                }
            }, 1000);
        });
    }
    
    musicButton.addEventListener('mouseenter', () => {
        musicButton.style.transform = 'scale(1.1)';
        musicButton.style.boxShadow = '0 0 30px var(--cosmic-gold)';
    });
    
    musicButton.addEventListener('mouseleave', () => {
        musicButton.style.transform = 'scale(1)';
        musicButton.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    });
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
    setInterval(createCosmicParticles, 4000);
    createFloatingCoins();
    setInterval(createFloatingCoins, 8000);
}

function createCosmicParticles() {
    const particleCount = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => { createSingleParticle(); }, i * 300);
    }
}

function createSingleParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 8 + 10;
    particle.style.cssText = `position: fixed; width: ${size}px; height: ${size}px; background: ${color}; border-radius: 50%; pointer-events: none; z-index: -1; opacity: ${Math.random() * 0.8 + 0.2}; left: ${Math.random() * 100}%; top: 100vh; box-shadow: 0 0 ${size * 3}px ${color}; animation: floatUp ${duration}s linear forwards;`;
    document.body.appendChild(particle);
    setTimeout(() => { if (particle && particle.parentNode) particle.parentNode.removeChild(particle); }, duration * 1000);
}

function createFloatingCoins() {
    const coinCount = window.innerWidth < 768 ? 2 : 4;
    for (let i = 0; i < coinCount; i++) {
        setTimeout(() => { createFloatingCoin(); }, i * 1000);
    }
}

function createFloatingCoin() {
    const coin = document.createElement('div');
    const size = Math.random() * 20 + 15;
    const duration = Math.random() * 6 + 8;
    coin.innerHTML = '🪙';
    coin.style.cssText = `position: fixed; font-size: ${size}px; pointer-events: none; z-index: -1; opacity: ${Math.random() * 0.6 + 0.3}; left: ${Math.random() * 100}%; top: 100vh; animation: coinFloat ${duration}s ease-in-out forwards; filter: drop-shadow(0 0 10px #FFD700);`;
    document.body.appendChild(coin);
    setTimeout(() => { if (coin && coin.parentNode) coin.parentNode.removeChild(coin); }, duration * 1000);
}

function setupEnhancedFeatures() {
    window.addEventListener('resize', () => {
        if (window.aminaCasino && window.aminaCasino.initPlinko) {
            setTimeout(() => { window.aminaCasino.initPlinko(); }, 200);
        }
    });
    
    addSoundEffects();
    setupScreenEffects();
    setupKeyboardShortcuts();
}

function addSoundEffects() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cosmic-btn') && !e.target.disabled) playClickSound();
        if (e.target.classList.contains('nav-btn')) playNavSound();
        if (e.target.classList.contains('enter-btn')) playEnterSound();
    });
}

function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) { console.log('🔇 Audio not available'); }
}

function playNavSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) { console.log('🔇 Audio not available'); }
}

function playEnterSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 100);
        });
    } catch (e) { console.log('🔇 Audio not available'); }
}

function setupScreenEffects() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('game-result') && target.classList.contains('win') && target.classList.contains('show')) {
                    const text = target.textContent;
                    if (text.includes('WIN!') || text.includes('WINNER!')) {
                        triggerBigWinEffect();
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.game-result').forEach(element => {
        observer.observe(element, { attributes: true });
    });
}

function triggerBigWinEffect() {
    document.body.style.animation = 'screenShake 0.5s ease-in-out';
    createCoinExplosion();
    setTimeout(() => { document.body.style.animation = ''; }, 500);
}

function createCoinExplosion() {
    const explosionCount = 15;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < explosionCount; i++) {
        const coin = document.createElement('div');
        coin.innerHTML = '🪙';
        coin.style.cssText = `position: fixed; font-size: 24px; pointer-events: none; z-index: 1000; left: ${centerX}px; top: ${centerY}px; animation: coinExplode 2s ease-out forwards; filter: drop-shadow(0 0 10px #FFD700);`;
        const angle = (Math.PI * 2 * i) / explosionCount;
        const distance = Math.random() * 200 + 100;
        coin.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        coin.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        document.body.appendChild(coin);
        setTimeout(() => { if (coin && coin.parentNode) coin.parentNode.removeChild(coin); }, 2000);
    }
}

function triggerCoinCelebration() {
    const celebrationCount = 8;
    for (let i = 0; i < celebrationCount; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `position: fixed; font-size: 30px; pointer-events: none; z-index: 999; left: ${Math.random() * window.innerWidth}px; top: -50px; animation: celebrationFall 3s ease-in forwards; filter: drop-shadow(0 0 15px #FFD700);`;
            document.body.appendChild(coin);
            setTimeout(() => { if (coin && coin.parentNode) coin.parentNode.removeChild(coin); }, 3000);
        }, i * 200);
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;
        switch(e.key.toLowerCase()) {
            case '1': if (document.querySelector('[data-game="home"]')) document.querySelector('[data-game="home"]').click(); break;
            case '2': if (document.querySelector('[data-game="slots"]')) document.querySelector('[data-game="slots"]').click(); break;
            case '3': if (document.querySelector('[data-game="plinko"]')) document.querySelector('[data-game="plinko"]').click(); break;
            case '4': if (document.querySelector('[data-game="blackjack"]')) document.querySelector('[data-game="blackjack"]').click(); break;
            case ' ': 
                e.preventDefault();
                const activeScreen = document.querySelector('.game-screen.active');
                if (activeScreen) {
                    const mainBtn = activeScreen.querySelector('.cosmic-btn:not(:disabled)');
                    if (mainBtn) mainBtn.click();
                }
                break;
        }
    });
}

const walletStyle = document.createElement('style');
walletStyle.textContent = `
    @keyframes walletExplode { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; } }
    @keyframes aminaCoinFall { 0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(1080deg); opacity: 0; } }
    @keyframes floatUp { 0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 50% { transform: translateY(-50vh) translateX(${Math.random() * 100 - 50}px) rotate(180deg); } 90% { opacity: 1; } 100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg); opacity: 0; } }
    @keyframes coinFloat { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 50% { transform: translateY(-30vh) rotate(180deg); } 90% { opacity: 1; } 100% { transform: translateY(-60vh) rotate(360deg); opacity: 0; } }
    @keyframes screenShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes coinExplode { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; } }
    @keyframes celebrationFall { 0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
`;
document.head.appendChild(walletStyle);

window.aminaUtils = {
    formatNumber: (num) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num),
    vibrate: (pattern = [100]) => { if ('vibrate' in navigator && Array.isArray(pattern)) navigator.vibrate(pattern); },
    createExplosion: (x, y) => { createCoinExplosion(); window.aminaUtils.vibrate([200, 100, 200]); },
    playWinSound: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                }, i * 150);
            });
        } catch (e) { console.log('🔇 Win sound not available'); }
    }
};

window.aminaPerf = { startTime: performance.now(), logLoadTime: () => { const loadTime = performance.now() - window.aminaPerf.startTime; console.log(`⚡ Casino loaded in ${loadTime.toFixed(2)}ms`); } };

window.addEventListener('error', (e) => { console.error('🚨 Casino Error:', e.error); });

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('🌙 Casino paused');
    } else {
        console.log('🌟 Casino resumed');
        setTimeout(triggerCoinCelebration, 500);
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        window.aminaPerf.logLoadTime();
        document.body.classList.add('loaded');
    }, 100);
});

console.log('🌌 Amina Casino enhanced features loaded!');