// Amina Casino - Main Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Amina Casino starting up...');
    
    // Smooth loading animation
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.5s ease-in-out';
            mainContent.style.opacity = '1';
        }, 100);
    }
    
    // Preload coin image
    const coinImg = new Image();
    coinImg.src = 'https://i.postimg.cc/nrMt6P0R/IMG-8041.png';
    coinImg.onload = () => {
        console.log('🪙 Amina Coin image loaded successfully');
    };
    
    // Add cosmic particles effect
    createCosmicParticles();
    
    // Mobile responsiveness check
    checkMobile();
    
    console.log('✨ Amina Casino ready!');
});

function createCosmicParticles() {
    const particleCount = window.innerWidth < 768 ? 15 : 40;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';
        
        const size = Math.random() * 3 + 1;
        const colors = ['#FFD700', '#00E5FF', '#E91E63', '#4A148C'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            opacity: ${Math.random() * 0.8 + 0.2};
            animation: particleFloat ${Math.random() * 15 + 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 ${size * 3}px ${color};
        `;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation with some randomness
        setTimeout(() => {
            if (particle && particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (Math.random() * 10 + 20) * 1000);
    }
    
    // Create continuous particle stream
    setTimeout(createCosmicParticles, Math.random() * 5000 + 3000);
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