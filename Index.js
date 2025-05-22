// Amina Casino - Main Application Controller
// Cosmic Galactic Adventure - Entry Point & Initialization

// ============================================
// APPLICATION INITIALIZATION
// ============================================

class AminaCasino {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.debugMode = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupGlobalEventListeners = this.setupGlobalEventListeners.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    async init() {
        if (this.initialized) return;

        try {
            console.log(`🚀 Initializing Amina Casino v${this.version} - Cosmic Galactic Adventure!`);
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }

            // Initialize core systems
            await this.initializeCoreComponents();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize cosmic effects
            this.initializeCosmicEffects();
            
            // Setup mission system
            this.initializeMissionSystem();
            
            // Initialize Pera Wallet preparation
            this.initializeWalletSystem();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('✅ Amina Casino fully initialized and ready for cosmic adventures!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize Amina Casino:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeCoreComponents() {
        // Initialize game state if not already done
        if (typeof gameState === 'undefined') {
            console.log('⚠️ Game state not found, creating default state...');
            window.gameState = {
                aminaBalance: 1000,
                algoBalance: 100,
                currentGame: 'slots',
                gameInProgress: false,
                selectedBet: null,
                walletConnected: false,
                missions: {
                    stellarCollector: { progress: 0, target: 5, completed: false, reward: 500 },
                    rouletteMaster: { progress: 0, target: 3, completed: false, reward: 300 },
                    blackjackChampion: { progress: 0, target: 3, completed: false, reward: 1000 },
                    highRoller: { progress: 0, target: 2000, completed: false, reward: 2000 }
                }
            };
        }

        // Load saved progress
        this.loadGameData();
        
        // Update displays
        this.updateAllDisplays();
    }

    setupGlobalEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Touch/click effects
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Mission button listeners
        this.setupMissionButtons();
        
        // Error handling
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handleError.bind(this));
    }

    setupMissionButtons() {
        // Setup mission completion buttons
        for (let i = 1; i <= 4; i++) {
            const missionBtn = document.getElementById(`mission${i}Btn`);
            if (missionBtn) {
                missionBtn.addEventListener('click', () => this.completeMission(i));
            }
        }
    }

    initializeCosmicEffects() {
        // Start background particle system
        this.startParticleSystem();
        
        // Initialize cosmic animations
        this.initializeAnimations();
        
        // Setup ambient effects
        this.setupAmbientEffects();
    }

    initializeMissionSystem() {
        // Setup mission tracking
        this.updateMissionDisplay();
        
        // Initialize mission progress tracking
        this.setupMissionTracking();
    }

    initializeWalletSystem() {
        // Prepare for Pera Wallet integration
        this.setupWalletIntegration();
        
        // Initialize exchange system
        this.setupExchangeSystem();
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause cosmic effects
            this.pauseCosmicEffects();
            // Save progress
            this.saveGameData();
        } else {
            // Page is visible - resume cosmic effects
            this.resumeCosmicEffects();
        }
    }

    handleResize() {
        // Debounce resize handling
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.adjustLayoutForScreen();
        }, 250);
    }

    handleKeyboardShortcuts(event) {
        // Cosmic keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch(event.key.toLowerCase()) {
                case 's':
                    event.preventDefault();
                    this.saveGameData();
                    this.showMessage('🌟 Game progress saved to the cosmos!', 'win');
                    break;
                case 'r':
                    if (event.shiftKey) {
                        event.preventDefault();
                        this.resetGameData();
                    }
                    break;
            }
        }
        
        // Game shortcuts
        switch(event.key) {
            case '1':
                this.switchToGame('slots');
                break;
            case '2':
                this.switchToGame('roulette');
                break;
            case '3':
                this.switchToGame('blackjack');
                break;
            case '4':
                this.switchToGame('missions');
                break;
            case 'Escape':
                this.clearAllMessages();
                break;
        }
    }

    handleGlobalClick(event) {
        // Add cosmic click effect
        this.createClickEffect(event.clientX, event.clientY);
    }

    handleError(error) {
        console.error('🌌 Cosmic Error Detected:', error);
        
        // Don't show error messages for minor issues
        if (error.message && error.message.includes('non-passive event listener')) {
            return;
        }
        
        // Show user-friendly error message
        this.showMessage('🌠 A cosmic disturbance occurred. Refreshing may help!', 'lose');
    }

    handleInitializationError(error) {
        // Fallback initialization
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1>🌌 Amina Casino</h1>
                    <p>Loading cosmic adventure...</p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(45deg, #8a2be2, #4169e1);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 20px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">
                        🚀 Retry Launch
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================
    // GAME MANAGEMENT
    // ============================================

    switchToGame(gameName) {
        if (typeof showGame === 'function') {
            showGame(gameName);
        }
    }

    completeMission(missionNumber) {
        if (typeof completeMission === 'function') {
            completeMission(missionNumber);
        }
    }

    updateAllDisplays() {
        if (typeof updateAllDisplays === 'function') {
            updateAllDisplays();
        }
    }

    updateMissionDisplay() {
        if (typeof updateMissionDisplay === 'function') {
            updateMissionDisplay();
        }
    }

    showMessage(message, type) {
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        }
    }

    clearAllMessages() {
        if (typeof clearMessages === 'function') {
            clearMessages();
        }
    }

    // ============================================
    // COSMIC EFFECTS MANAGEMENT
    // ============================================

    startParticleSystem() {
        // Initialize cosmic particle system
        this.particleSystemActive = true;
        this.createCosmicParticles();
    }

    createCosmicParticles() {
        if (!this.particleSystemActive) return;
        
        // Create a cosmic particle
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            opacity: 0;
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle
        const animation = particle.animate([
            { 
                transform: 'translateY(0px) translateX(0px)', 
                opacity: 0 
            },
            { 
                transform: `translateY(-20px) translateX(${(Math.random() - 0.5) * 40}px)`, 
                opacity: 0.8,
                offset: 0.1 
            },
            { 
                transform: `translateY(-100vh) translateX(${(Math.random() - 0.5) * 200}px)`, 
                opacity: 0 
            }
        ], {
            duration: 8000 + Math.random() * 4000,
            easing: 'linear'
        });
        
        animation.addEventListener('finish', () => {
            particle.remove();
            // Create new particle to maintain flow
            if (this.particleSystemActive) {
                setTimeout(() => this.createCosmicParticles(), Math.random() * 1000);
            }
        });
        
        // Schedule next particle
        if (this.particleSystemActive) {
            setTimeout(() => this.createCosmicParticles(), 300 + Math.random() * 700);
        }
    }

    pauseCosmicEffects() {
        this.particleSystemActive = false;
    }

    resumeCosmicEffects() {
        this.particleSystemActive = true;
        this.createCosmicParticles();
    }

    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #ffd700, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(effect);
        
        effect.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            effect.remove();
        });
    }

    initializeAnimations() {
        // Add subtle animations to game elements
        const gameContainers = document.querySelectorAll('.game-container');
        gameContainers.forEach(container => {
            container.style.transition = 'all 0.5s ease-in-out';
        });
    }

    setupAmbientEffects() {
        // Add cosmic glow effects to important elements
        const cosmicElements = document.querySelectorAll('.nav-tab.active, .spin-button, .game-btn');
        cosmicElements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
        });
    }

    // ============================================
    // LAYOUT & RESPONSIVE HANDLING
    // ============================================

    adjustLayoutForScreen() {
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        
        // Adjust cosmic effects for mobile
        if (isMobile) {
            this.reducedEffects = true;
        } else {
            this.reducedEffects = false;
        }
        
        // Adjust particle count for performance
        if (screenWidth < 480) {
            this.maxParticles = 5;
        } else if (screenWidth < 768) {
            this.maxParticles = 10;
        } else {
            this.maxParticles = 20;
        }
    }

    // ============================================
    // DATA MANAGEMENT
    // ============================================

    saveGameData() {
        try {
            if (typeof saveGameProgress === 'function') {
                saveGameProgress();
                return;
            }
            
            // Fallback save method
            const saveData = {
                aminaBalance: gameState?.aminaBalance || 1000,
                algoBalance: gameState?.algoBalance || 100,
                missions: gameState?.missions || {},
                walletConnected: gameState?.walletConnected || false,
                lastSaved: Date.now()
            };
            
            localStorage.setItem('aminaCasinoSave', JSON.stringify(saveData));
            console.log('💾 Game data saved to cosmic storage');
            
        } catch (error) {
            console.error('❌ Failed to save game data:', error);
        }
    }

    loadGameData() {
        try {
            if (typeof loadGameProgress === 'function') {
                loadGameProgress();
                return;
            }
            
            // Fallback load method
            const saveData = localStorage.getItem('aminaCasinoSave');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                
                if (window.gameState) {
                    window.gameState.aminaBalance = parsed.aminaBalance || 1000;
                    window.gameState.algoBalance = parsed.algoBalance || 100;
                    window.gameState.missions = { ...window.gameState.missions, ...parsed.missions };
                    window.gameState.walletConnected = parsed.walletConnected || false;
                }
                
                console.log('📥 Game data loaded from cosmic storage');
            }
            
        } catch (error) {
            console.error('❌ Failed to load game data:', error);
        }
    }

    resetGameData() {
        if (confirm('🌌 Are you sure you want to reset your cosmic journey? This cannot be undone!')) {
            localStorage.removeItem('aminaCasinoSave');
            location.reload();
        }
    }

    // ============================================
    // WALLET INTEGRATION PREPARATION
    // ============================================

    setupWalletIntegration() {
        // Prepare for Pera Wallet SDK integration
        this.walletConfig = {
            network: 'mainnet', // or 'testnet' for testing
            appName: 'Amina Casino',
            appDescription: 'Cosmic Galactic Adventure Casino',
            appUrl: window.location.origin,
            appMeta: {
                logo: '/logo.png' // Add your logo here
            }
        };
        
        // Check for existing wallet connection
        this.checkExistingWalletConnection();
    }

    setupExchangeSystem() {
        // Setup ALGO <-> AMINA exchange rates and logic
        this.exchangeRates = {
            algoToAmina: 10,  // 1 ALGO = 10 AMINA
            aminaToAlgo: 0.1  // 1 AMINA = 0.1 ALGO
        };
    }

    checkExistingWalletConnection() {
        // This will be implemented when Pera Wallet is integrated
        console.log('🔍 Checking for existing wallet connections...');
    }

    // ============================================
    // UTILITY & HELPER FUNCTIONS
    // ============================================

    showWelcomeMessage() {
        setTimeout(() => {
            this.showMessage('🚀 Welcome to Amina Casino - Your Cosmic Adventure Begins! 🌌', 'win');
        }, 1000);
    }

    getDebugInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            gameState: window.gameState,
            particleSystemActive: this.particleSystemActive,
            walletConnected: window.gameState?.walletConnected || false
        };
    }

    // ============================================
    // PUBLIC API
    // ============================================

    // Expose useful methods globally for debugging
    enableDebugMode() {
        this.debugMode = true;
        window.aminaCasinoDebug = {
            getInfo: () => this.getDebugInfo(),
            saveGame: () => this.saveGameData(),
            loadGame: () => this.loadGameData(),
            resetGame: () => this.resetGameData(),
            addAmina: (amount) => {
                if (window.gameState) {
                    window.gameState.aminaBalance += amount;
                    this.updateAllDisplays();
                }
            },
            addAlgo: (amount) => {
                if (window.gameState) {
                    window.gameState.algoBalance += amount;
                    this.updateAllDisplays();
                }
            }
        };
        console.log('🐛 Debug mode activated! Use window.aminaCasinoDebug for debugging tools.');
    }
}

// ============================================
// APPLICATION STARTUP
// ============================================

// Create and initialize the casino application
const aminaCasino = new AminaCasino();

// Start the cosmic adventure!
aminaCasino.init().catch(error => {
    console.error('🌌 Failed to launch Amina Casino:', error);
});

// Enable debug mode in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    aminaCasino.enableDebugMode();
}

// Export for global access
window.AminaCasino = aminaCasino;

// ============================================
// PERFORMANCE MONITORING
// ============================================

// Monitor performance and memory usage
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`🚀 Amina Casino loaded in ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
        }, 0);
    });
}

// Handle memory warnings
if ('memory' in performance) {
    setInterval(() => {
        const memInfo = performance.memory;
        const memUsagePercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
        
        if (memUsagePercent > 90) {
            console.warn('⚠️ High memory usage detected. Consider refreshing the page.');
        }
    }, 30000);
}

console.log('🌟 Amina Casino - Index.js loaded successfully! Ready for cosmic adventures!');
