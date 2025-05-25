// Amina Casino - Streamlined Enhanced Effects & Wallet Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced index.js loading...');
    
    setTimeout(() => {
        initializeWelcomeExperience();
        startCosmicEffects();
        setupEnhancedFeatures();
        setupBackgroundMusic();
        setupWalletEnhancements();
    }, 500);
    
    console.log('✨ Enhanced index.js ready!');
});

// WALLET ENHANCEMENTS - STREAMLINED
function setupWalletEnhancements() {
    // Wallet connection celebration
    document.addEventListener('click', (e) => {
        if (e.target.id === 'walletBtn' && e.target.innerHTML.includes('✅')) {
            createWalletCelebration();
        }
    });
    
    // AMINA coin rain on currency toggle
    const toggle = document.getElementById('currencyToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            setTimeout(() => {
                if (toggle.classList.contains('amina') && window.aminaCasino?.connectedAccount) {
                    createAminaCoinRain();
                }
            }, 100);
        });
    }
    
    setupWalletNotifications();
}

function createWalletCelebration() {
    console.log('🎉 Wallet celebration!');
    
    for (let i = 0; i < 12; i++) {
        const icon = document.createElement('div');
        icon.innerHTML = '💳';
        icon.style.cssText = `
            position: fixed; font-size: 24px; pointer-events: none; z-index: 1000;
            left: 50%; top: 20%; filter: drop-shadow(0 0 10px #FFD700);
            animation: explode 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 12;
        const distance = Math.random() * 150 + 100;
        icon.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        icon.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        
        document.body.appendChild(icon);
        setTimeout(() => icon.remove(), 2000);
    }
    
    playWalletConnectSound();
}

function createAminaCoinRain() {
    console.log('🪙 AMINA coin rain!');
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `
                position: fixed; font-size: ${Math.random() * 15 + 20}px;
                pointer-events: none; z-index: 999; left: ${Math.random() * 100}%;
                top: -50px; filter: drop-shadow(0 0 15px #E91E63);
                animation: coinFall 4s ease-in forwards;
            `;
            
            document.body.appendChild(coin);
            setTimeout(() => coin.remove(), 4000);
        }, i * 150);
    }
}

function setupWalletNotifications() {
    window.walletNotify = (message, type = 'info', duration = 3000) => {
        const colors = {
            wallet: 'linear-gradient(135deg, #9C27B0, #673AB7)',
            amina: 'linear-gradient(135deg, #E91E63, #FF6B35)',
            win: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
            error: 'linear-gradient(135deg, #F44336, #E91E63)',
            success: 'linear-gradient(135deg, #4CAF50, #00E676)'
        };
        
        const icons = { wallet: '💳', amina: '🪙', win: '🎉', error: '⚠️', success: '✅' };
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${icons[type] || '💫'}</span>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed; top: 80px; right: 20px; z-index: 1002;
            background: ${colors[type] || colors.info}; color: white;
            padding: 1rem 2rem; border-radius: 15px; max-width: 300px;
            font-family: 'Orbitron', monospace; font-weight: 700;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); border: 2px solid #FFD700;
            transform: translateX(100%); transition: transform 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 50);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    };
}

function playWalletConnectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
        
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
    } catch (e) {
        console.log('🔇 Wallet sound not available');
    }
}

// BACKGROUND MUSIC - STREAMLINED
function setupBackgroundMusic() {
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggle';
    musicButton.innerHTML = '🎵';
    musicButton.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px;
        border-radius: 50%; border: 2px solid var(--cosmic-gold); font-size: 1.5rem;
        background: linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan));
        color: var(--space-black); cursor: pointer; z-index: 1001;
        transition: all 0.3s ease; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    `;
    
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
        } else {
            audio.play().catch(() => console.log('🎵 Audio blocked, user interaction required'));
            musicButton.innerHTML = '🎵';
            musicButton.style.background = 'linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan))';
        }
        musicPlaying = !musicPlaying;
    });
    
    // Auto-start when entering casino
    document.getElementById('enterCasino')?.addEventListener('click', () => {
        setTimeout(() => {
            if (!musicPlaying) {
                audio.play().catch(() => console.log('🎵 Music ready - click button to start!'));
                musicPlaying = true;
            }
        }, 1000);
    });
    
    // Hover effects
    musicButton.addEventListener('mouseenter', () => {
        musicButton.style.transform = 'scale(1.1)';
        musicButton.style.boxShadow = '0 0 30px var(--cosmic-gold)';
    });
    
    musicButton.addEventListener('mouseleave', () => {
        musicButton.style.transform = 'scale(1)';
        musicButton.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    });
}

// WELCOME EXPERIENCE - STREAMLINED
function initializeWelcomeExperience() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainCasino = document.getElementById('mainCasino');
    
    if (welcomeScreen && mainCasino) {
        welcomeScreen.classList.add('active');
        mainCasino.classList.remove('active');
        
        document.getElementById('enterCasino')?.addEventListener('click', function() {
            welcomeScreen.classList.remove('active');
            setTimeout(() => {
                mainCasino.classList.add('active');
                triggerCoinCelebration();
            }, 300);
        });
    }
}

// COSMIC EFFECTS - STREAMLINED
function startCosmicEffects() {
    createCosmicParticles();
    setInterval(createCosmicParticles, 4000);
    
    createFloatingCoins();
    setInterval(createFloatingCoins, 8000);
}

function createCosmicParticles() {
    const particleCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => createSingleParticle(), i * 300);
    }
}

function createSingleParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 8 + 10;
    
    particle.style.cssText = `
        position: fixed; width: ${size}px; height: ${size}px; background: ${color};
        border-radius: 50%; pointer-events: none; z-index: -1;
        opacity: ${Math.random() * 0.8 + 0.2}; left: ${Math.random() * 100}%;
        top: 100vh; box-shadow: 0 0 ${size * 3}px ${color};
        animation: floatUp ${duration}s linear forwards;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), duration * 1000);
}

function createFloatingCoins() {
    const coinCount = window.innerWidth < 768 ? 2 : 4;
    
    for (let i = 0; i < coinCount; i++) {
        setTimeout(() => createFloatingCoin(), i * 1000);
    }
}

function createFloatingCoin() {
    const coin = document.createElement('div');
    const size = Math.random() * 20 + 15;
    const duration = Math.random() * 6 + 8;
    
    coin.innerHTML = '🪙';
    coin.style.cssText = `
        position: fixed; font-size: ${size}px; pointer-events: none; z-index: -1;
        opacity: ${Math.random() * 0.6 + 0.3}; left: ${Math.random() * 100}%;
        top: 100vh; filter: drop-shadow(0 0 10px #FFD700);
        animation: coinFloat ${duration}s ease-in-out forwards;
    `;
    
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), duration * 1000);
}

// ENHANCED FEATURES - STREAMLINED
function setupEnhancedFeatures() {
    // Resize handler for plinko
    window.addEventListener('resize', () => {
        if (window.aminaCasino?.initPlinko) {
            setTimeout(() => window.aminaCasino.initPlinko(), 200);
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
    playSound(800, 'sine', 0.1, 0.1);
}

function playNavSound() {
    playSound(600, 'triangle', 0.08, 0.15);
}

function playEnterSound() {
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, i) => {
        setTimeout(() => playSound(freq, 'sine', 0.1, 0.3), i * 100);
    });
}

function playSound(frequency, type, volume, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('🔇 Audio not available');
    }
}

function setupScreenEffects() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('game-result') && 
                    target.classList.contains('win') && 
                    target.classList.contains('show')) {
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
    setTimeout(() => document.body.style.animation = '', 500);
}

function createCoinExplosion() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 15; i++) {
        const coin = document.createElement('div');
        coin.innerHTML = '🪙';
        coin.style.cssText = `
            position: fixed; font-size: 24px; pointer-events: none; z-index: 1000;
            left: ${centerX}px; top: ${centerY}px; filter: drop-shadow(0 0 10px #FFD700);
            animation: coinExplode 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 15;
        const distance = Math.random() * 200 + 100;
        coin.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        coin.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 2000);
    }
}

function triggerCoinCelebration() {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.innerHTML = '🪙';
            coin.style.cssText = `
                position: fixed; font-size: 30px; pointer-events: none; z-index: 999;
                left: ${Math.random() * window.innerWidth}px; top: -50px;
                filter: drop-shadow(0 0 15px #FFD700);
                animation: celebrationFall 3s ease-in forwards;
            `;
            
            document.body.appendChild(coin);
            setTimeout(() => coin.remove(), 3000);
        }, i * 200);
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;
        
        const gameMap = { '1': 'home', '2': 'slots', '3': 'plinko', '4': 'blackjack' };
        
        if (gameMap[e.key]) {
            document.querySelector(`[data-game="${gameMap[e.key]}"]`)?.click();
        } else if (e.key === ' ') {
            e.preventDefault();
            const activeScreen = document.querySelector('.game-screen.active');
            const mainBtn = activeScreen?.querySelector('.cosmic-btn:not(:disabled)');
            mainBtn?.click();
        }
    });
}

// CSS ANIMATIONS - STREAMLINED
const style = document.createElement('style');
style.textContent = `
    @keyframes explode {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; }
    }
    @keyframes coinFall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(1080deg); opacity: 0; }
    }
    @keyframes floatUp {
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        50% { transform: translateY(-50vh) translateX(${Math.random() * 100 - 50}px) rotate(180deg); }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg); opacity: 0; }
    }
    @keyframes coinFloat {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        50% { transform: translateY(-30vh) rotate(180deg); }
        90% { opacity: 1; }
        100% { transform: translateY(-60vh) rotate(360deg); opacity: 0; }
    }
    @keyframes screenShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    @keyframes coinExplode {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; }
    }
    @keyframes celebrationFall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// UTILITY FUNCTIONS - STREAMLINED
window.aminaUtils = {
    formatNumber: (num) => new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 4 
    }).format(num),
    
    vibrate: (pattern = [100]) => {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    },
    
    createExplosion: (x, y) => {
        createCoinExplosion();
        window.aminaUtils.vibrate([200, 100, 200]);
    },
    
    playWinSound: () => {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
        notes.forEach((freq, i) => {
            setTimeout(() => playSound(freq, 'sine', 0.15, 0.5), i * 150);
        });
    }
};

// PERFORMANCE & ERROR HANDLING - STREAMLINED
window.aminaPerf = {
    startTime: performance.now(),
    logLoadTime: () => {
        const loadTime = performance.now() - window.aminaPerf.startTime;
        console.log(`⚡ Casino loaded in ${loadTime.toFixed(2)}ms`);
    }
};

window.addEventListener('error', (e) => console.error('🚨 Casino Error:', e.error));

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
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