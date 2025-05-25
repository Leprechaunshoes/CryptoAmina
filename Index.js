// Amina Casino - Professional Main Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Amina Casino initializing...');
    
    // Professional loading sequence
    initializeProCasino();
    
    // Enhanced particle system
    startCosmicParticleSystem();
    
    // Performance optimizations
    optimizeForDevice();
    
    console.log('✨ Professional Amina Casino ready!');
});

function initializeProCasino() {
    // Smooth fade-in with stagger effect
    const elements = [
        '.header',
        '.nav-menu', 
        '.main-content'
    ];
    
    elements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        }
    });
    
    // Preload all images with loading indicator
    preloadCasinoAssets();
}

function preloadCasinoAssets() {
    const coinImg = new Image();
    coinImg.src = 'https://i.postimg.cc/nrMt6P0R/IMG-8041.png';
    
    coinImg.onload = () => {
        console.log('🪙 Amina Coin loaded successfully');
        // Add loaded class for CSS animations
        document.body.classList.add('assets-loaded');
    };
    
    coinImg.onerror = () => {
        console.warn('⚠️ Coin image failed to load, using fallback');
    };
}

function startCosmicParticleSystem() {
    let particlePool = [];
    let activeParticles = [];
    const maxParticles = window.innerWidth < 768 ? 25 : 50;
    
    // Create particle pool for performance
    for (let i = 0; i < maxParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '-1';
        particle.style.borderRadius = '50%';
        particlePool.push(particle);
    }
    
    function createParticle() {
        if (particlePool.length === 0) return;
        
        const particle = particlePool.pop();
        const size = Math.random() * 3 + 1;
        const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 8 + 6;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            opacity: ${Math.random() * 0.8 + 0.3};
            left: ${Math.random() * 100}%;
            top: 100vh;
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: professionalParticleFloat ${duration}s linear forwards;
        `;
        
        document.body.appendChild(particle);
        activeParticles.push(particle);
        
        // Return to pool when animation ends
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            const index = activeParticles.indexOf(particle);
            if (index > -1) {
                activeParticles.splice(index, 1);
                particlePool.push(particle);
            }
        }, duration * 1000);
    }
    
    // Create particles at intervals
    function particleLoop() {
        if (document.visibilityState === 'visible') {
            createParticle();
        }
        setTimeout(particleLoop, Math.random() * 2000 + 1000);
    }
    
    particleLoop();
}

function optimizeForDevice() {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency < 4;
    
    if (isMobile || isLowEnd) {
        // Reduce animations for performance
        document.documentElement.style.setProperty('--animation-speed', '0.5s');
        console.log('📱 Mobile/low-end optimizations applied');
    }
    
    // Add CSS for professional particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes professionalParticleFloat {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg) scale(0);
                opacity: 0;
            }
            10% {
                opacity: var(--particle-opacity, 0.8);
                transform: scale(1);
            }
            90% {
                opacity: var(--particle-opacity, 0.8);
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg) scale(0);
                opacity: 0;
            }
        }
        
        .assets-loaded .coin-image {
            animation-play-state: running;
        }
        
        .cosmic-particle {
            will-change: transform, opacity;
        }
    `;
    document.head.appendChild(style);
}

function checkMobile() {
    if (window.innerWidth < 768) {
        console.log('📱 Mobile device detected');
        
        // Add mobile-specific optimizations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
            
            .cosmic-particle {
                animation-duration: 15s !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        console.log('🖥️ Desktop device detected');
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                50% { transform: translateY(50vh) translateX(${Math.random() * 200 - 100}px) rotate(180deg); }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) translateX(${Math.random() * 400 - 200}px) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Utility functions for the casino
window.aminaUtils = {
    formatNumber: (num) => {
        return num.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    },
    
    generateRandomId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    playSound: (type) => {
        // Future: Add sound effects
        console.log(`🔊 Playing ${type} sound`);
    },
    
    vibrate: (pattern = [100]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },
    
    saveToLocalStorage: (key, data) => {
        try {
            localStorage.setItem(`aminaCasino_${key}`, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },
    
    loadFromLocalStorage: (key) => {
        try {
            const data = localStorage.getItem(`aminaCasino_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return null;
        }
    }
};

// Performance monitoring
window.aminaPerf = {
    startTime: performance.now(),
    
    logLoadTime: () => {
        const loadTime = performance.now() - window.aminaPerf.startTime;
        console.log(`⚡ Casino loaded in ${loadTime.toFixed(2)}ms`);
    },
    
    measureFunction: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`📊 ${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('🚨 Casino Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('🌙 Casino paused (tab hidden)');
    } else {
        console.log('🌟 Casino resumed (tab visible)');
        // Refresh particles when page becomes visible
        setTimeout(createCosmicParticles, 1000);
    }
});

// Resize handler
window.addEventListener('resize', () => {
    console.log('📏 Window resized');
    
    // Redraw plinko canvas if game is active
    if (window.aminaCasino && window.aminaCasino.plinkoCtx) {
        const canvas = document.getElementById('plinkoCanvas');
        if (canvas && window.innerWidth < 768) {
            canvas.width = Math.min(350, window.innerWidth - 40);
            window.aminaCasino.drawPlinkoBoard();
        }
    }
});

// Service worker registration (future feature)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.registerServiceWorker('/sw.js')
        console.log('🔧 Service worker support detected');
    });
}

// Log performance when everything is loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        window.aminaPerf.logLoadTime();
    }, 100);
});