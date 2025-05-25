// Amina Casino - Enhanced Features & Particles
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Index.js loading...');
    
    // Wait a bit for main casino to load
    setTimeout(() => {
        initializeEnhancements();
        startParticleSystem();
    }, 1000);
    
    console.log('✨ Index.js ready!');
});

function initializeEnhancements() {
    // Smooth loading animation
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'all 0.8s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Add resize handler for plinko
    window.addEventListener('resize', () => {
        if (window.aminaCasino && window.aminaCasino.initPlinko) {
            setTimeout(() => {
                window.aminaCasino.initPlinko();
            }, 100);
        }
    });
}

function startParticleSystem() {
    createCosmicParticles();
    
    // Continue creating particles
    setInterval(createCosmicParticles, 4000);
}

function createCosmicParticles() {
    const particleCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createSingleParticle();
        }, i * 200);
    }
}

function createSingleParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 6 + 8;
    
    particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        opacity: ${Math.random() * 0.7 + 0.3};
        left: ${Math.random() * 100}%;
        top: 100vh;
        box-shadow: 0 0 ${size * 3}px ${color};
        animation: floatUp ${duration}s linear forwards;
    `;
    
    document.body.appendChild(particle);
    
    // Remove particle when animation ends
    setTimeout(() => {
        if (particle && particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, duration * 1000);
}

// Add CSS animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        50% {
            transform: translateY(-50vh) translateX(${Math.random() * 100 - 50}px) rotate(180deg);
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .loading .main-content {
        opacity: 0;
        transform: translateY(20px);
    }
    
    .loaded .main-content {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// Enhanced utility functions
window.aminaUtils = {
    formatNumber: (num) => {
        return new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 4 
        }).format(num);
    },
    
    playSound: (type) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            const createTone = (freq, duration, volume = 0.1) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            };
            
            switch(type) {
                case 'win':
                    createTone(523.25, 0.2); // C5
                    setTimeout(() => createTone(659.25, 0.2), 100); // E5
                    setTimeout(() => createTone(783.99, 0.3), 200); // G5
                    break;
                case 'spin':
                    createTone(220, 0.1);
                    break;
                case 'drop':
                    createTone(440, 0.1);
                    break;
                default:
                    createTone(330, 0.1);
            }
        } catch (e) {
            console.log(`🔊 ${type} sound (audio context unavailable)`);
        }
    },
    
    vibrate: (pattern = [100]) => {
        if ('vibrate' in navigator && Array.isArray(pattern)) {
            navigator.vibrate(pattern);
        }
    },
    
    createExplosion: (x, y) => {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 3;
            const colors = ['#FFD700', '#00E5FF', '#E91E63', '#FF6B35'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: explode 1s ease-out forwards;
                transform: translate(-50%, -50%);
            `;
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = Math.random() * 80 + 40;
            particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
};

// Add explosion animation
const explosionStyle = document.createElement('style');
explosionStyle.textContent = `
    @keyframes explode {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(explosionStyle);

// Performance monitoring
window.aminaPerf = {
    startTime: performance.now(),
    
    logLoadTime: () => {
        const loadTime = performance.now() - window.aminaPerf.startTime;
        console.log(`⚡ Casino loaded in ${loadTime.toFixed(2)}ms`);
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('🚨 Casino Error:', e.error);
});

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('🌙 Casino paused');
    } else {
        console.log('🌟 Casino resumed');
    }
});

// Log performance when loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        window.aminaPerf.logLoadTime();
        document.body.classList.add('loaded');
    }, 100);
});

console.log('🌌 Amina Casino enhanced features loaded!');