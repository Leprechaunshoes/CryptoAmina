// Amina Casino - Ultra Streamlined Effects & Features
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initWelcome();
        startEffects();
        setupMusic();
        setupWalletEffects();
        setupSounds();
        setupKeyboard();
    }, 500);
});

// WALLET EFFECTS
function setupWalletEffects() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'walletBtn' && e.target.innerHTML.includes('✅')) {
            createCelebration('💳', 12);
            playChord([261.63, 329.63, 392.00, 523.25]);
        }
    });
    
    const toggle = document.getElementById('currencyToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            setTimeout(() => {
                if (toggle.classList.contains('amina') && window.aminaCasino?.connectedAccount) {
                    createRain('🪙', 15);
                }
            }, 100);
        });
    }
}

function createCelebration(icon, count) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.innerHTML = icon;
        el.style.cssText = `
            position: fixed; font-size: 24px; pointer-events: none; z-index: 1000;
            left: 50%; top: 20%; filter: drop-shadow(0 0 10px #FFD700);
            animation: explode 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / count;
        const distance = Math.random() * 150 + 100;
        el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        el.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }
}

function createRain(icon, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.innerHTML = icon;
            el.style.cssText = `
                position: fixed; font-size: ${Math.random() * 15 + 20}px;
                pointer-events: none; z-index: 999; left: ${Math.random() * 100}%;
                top: -50px; filter: drop-shadow(0 0 15px #E91E63);
                animation: fall 4s ease-in forwards;
            `;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }, i * 150);
    }
}

// MUSIC SYSTEM
function setupMusic() {
    const btn = document.createElement('button');
    btn.id = 'musicToggle';
    btn.innerHTML = '🎵';
    btn.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px;
        border-radius: 50%; border: 2px solid var(--cosmic-gold); font-size: 1.5rem;
        background: linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan));
        color: var(--space-black); cursor: pointer; z-index: 1001;
        transition: all 0.3s ease; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    `;
    
    const audio = document.createElement('audio');
    audio.loop = true;
    audio.volume = 0.3;
    audio.src = 'https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
    
    let playing = false;
    btn.addEventListener('click', () => {
        if (playing) {
            audio.pause();
            btn.innerHTML = '🔇';
            btn.style.background = 'linear-gradient(135deg, var(--void-gray), var(--cosmic-purple))';
        } else {
            audio.play().catch(() => console.log('🎵 Audio blocked'));
            btn.innerHTML = '🎵';
            btn.style.background = 'linear-gradient(135deg, var(--cosmic-gold), var(--plasma-cyan))';
        }
        playing = !playing;
    });
    
    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 0 30px var(--cosmic-gold)';
    };
    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    };
    
    document.body.appendChild(btn);
    document.body.appendChild(audio);
    
    document.getElementById('enterCasino')?.addEventListener('click', () => {
        setTimeout(() => {
            if (!playing) {
                audio.play().catch(() => {});
                playing = true;
            }
        }, 1000);
    });
}

// WELCOME & EFFECTS
function initWelcome() {
    const welcome = document.getElementById('welcomeScreen');
    const casino = document.getElementById('mainCasino');
    
    if (welcome && casino) {
        welcome.classList.add('active');
        casino.classList.remove('active');
        
        document.getElementById('enterCasino')?.addEventListener('click', function() {
            welcome.classList.remove('active');
            setTimeout(() => {
                casino.classList.add('active');
                createRain('🪙', 8);
            }, 300);
        });
    }
}

function startEffects() {
    createParticles();
    setInterval(createParticles, 4000);
    createFloatingCoins();
    setInterval(createFloatingCoins, 8000);
    setupBigWinEffects();
}

function createParticles() {
    const count = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = Math.random() * 8 + 10;
            
            el.style.cssText = `
                position: fixed; width: ${size}px; height: ${size}px; background: ${color};
                border-radius: 50%; pointer-events: none; z-index: -1;
                opacity: ${Math.random() * 0.8 + 0.2}; left: ${Math.random() * 100}%;
                top: 100vh; box-shadow: 0 0 ${size * 3}px ${color};
                animation: floatUp ${duration}s linear forwards;
            `;
            
            document.body.appendChild(el);
            setTimeout(() => el.remove(), duration * 1000);
        }, i * 300);
    }
}

function createFloatingCoins() {
    const count = window.innerWidth < 768 ? 2 : 4;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            const size = Math.random() * 20 + 15;
            const duration = Math.random() * 6 + 8;
            
            el.innerHTML = '🪙';
            el.style.cssText = `
                position: fixed; font-size: ${size}px; pointer-events: none; z-index: -1;
                opacity: ${Math.random() * 0.6 + 0.3}; left: ${Math.random() * 100}%;
                top: 100vh; filter: drop-shadow(0 0 10px #FFD700);
                animation: coinFloat ${duration}s ease-in-out forwards;
            `;
            
            document.body.appendChild(el);
            setTimeout(() => el.remove(), duration * 1000);
        }, i * 1000);
    }
}

function setupBigWinEffects() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('game-result') && 
                    target.classList.contains('win') && 
                    target.classList.contains('show')) {
                    const text = target.textContent;
                    if (text.includes('WIN!') || text.includes('WINNER!')) {
                        document.body.style.animation = 'screenShake 0.5s ease-in-out';
                        createExplosion();
                        setTimeout(() => document.body.style.animation = '', 500);
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.game-result').forEach(el => {
        observer.observe(el, { attributes: true });
    });
}

function createExplosion() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 15; i++) {
        const el = document.createElement('div');
        el.innerHTML = '🪙';
        el.style.cssText = `
            position: fixed; font-size: 24px; pointer-events: none; z-index: 1000;
            left: ${centerX}px; top: ${centerY}px; filter: drop-shadow(0 0 10px #FFD700);
            animation: coinExplode 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 15;
        const distance = Math.random() * 200 + 100;
        el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        el.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
        
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }
}

// SOUND SYSTEM
function setupSounds() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cosmic-btn') && !e.target.disabled) playSound(800, 'sine', 0.1, 0.1);
        if (e.target.classList.contains('nav-btn')) playSound(600, 'triangle', 0.08, 0.15);
        if (e.target.classList.contains('enter-btn')) playChord([523.25, 659.25, 783.99]);
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
        if (window.aminaCasino?.initPlinko) {
            setTimeout(() => window.aminaCasino.initPlinko(), 200);
        }
    });
}

function playSound(frequency, type, volume, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.type = type;
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playChord(notes) {
    notes.forEach((freq, i) => {
        setTimeout(() => playSound(freq, 'sine', 0.1, 0.3), i * 100);
    });
}

// KEYBOARD SHORTCUTS
function setupKeyboard() {
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

// CSS ANIMATIONS
const style = document.createElement('style');
style.textContent = `
    @keyframes explode {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; }
    }
    @keyframes fall {
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
`;
document.head.appendChild(style);

// UTILITY FUNCTIONS
window.aminaUtils = {
    formatNumber: (num) => new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 4 
    }).format(num),
    
    vibrate: (pattern = [100]) => {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    },
    
    createExplosion,
    
    playWinSound: () => {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            setTimeout(() => playSound(freq, 'sine', 0.15, 0.5), i * 150);
        });
    }
};

// GLOBALS FOR WALLET INTEGRATION
window.createWalletCelebration = () => createCelebration('💳', 12);
window.createAminaCoinRain = () => createRain('🪙', 15);

// ERROR HANDLING & PERFORMANCE
window.addEventListener('error', (e) => console.error('🚨 Error:', e.error));
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(() => createRain('🪙', 8), 500);
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadTime = performance.now();
        console.log(`⚡ Casino loaded in ${loadTime.toFixed(2)}ms`);
        document.body.classList.add('loaded');
    }, 100);
});

console.log('🌌 Enhanced index.js loaded!');