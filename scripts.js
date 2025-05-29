// Amina Casino - Optimized Game Engine
class AminaCasino {
    constructor() {
        this.balance = { HC: 1000, AMINA: 0 };
        this.currentCurrency = 'HC';
        this.isAmina = false;
        this.connectedAccount = null;
        this.casinoWallet = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
        this.aminaAssetId = 1107424865;
        
        // Game states
        this.hiloCard = null;
        this.selectedDiceBet = null;
        this.activeBalls = [];
        this.maxBalls = 7;
        
        // Cosmic Chaos Configuration
        this.cosmicSymbols = ['⭐','🌟','💫','🌌','🪐','🌙','☄️','🚀','👽','🛸'];
        this.scatterSymbol = '🌠';
        this.chaosGrid = Array(5).fill().map(() => Array(6).fill(''));
        this.currentMultiplier = 1;
        this.freeSpins = 0;
        this.totalWin = 0;
        this.isSpinning = false;
        this.cascadeCount = 0;
        this.autoplay = { active: false, spins: 0, remaining: 0 };
        
        setTimeout(() => this.init(), 500);
    }

    async init() {
        this.setupUI();
        this.setupGames();
        this.updateDisplay();
        this.initEffects();
        this.initCosmicChaos();
    }

    // === COSMIC CHAOS SLOTS ===
    initCosmicChaos() {
        this.createChaosGrid();
        this.fillGridRandomly();
        this.updateChaosDisplay();
        
        document.getElementById('spinBtn').onclick = () => this.spinCosmicChaos();
        document.getElementById('buyBonusBtn').onclick = () => this.buyBonusRound();
        document.getElementById('autoplayBtn').onclick = () => this.toggleAutoplay();
    }

    createChaosGrid() {
        const grid = document.getElementById('chaosGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'chaos-symbol';
                cell.id = `symbol-${row}-${col}`;
                grid.appendChild(cell);
            }
        }
    }

    fillGridRandomly() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                this.chaosGrid[row][col] = this.cosmicSymbols[Math.floor(Math.random() * this.cosmicSymbols.length)];
            }
        }
    }

    updateChaosDisplay() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.getElementById(`symbol-${row}-${col}`);
                if (cell) cell.textContent = this.chaosGrid[row][col];
            }
        }
        
        document.getElementById('currentMultiplier').textContent = `${this.currentMultiplier}x`;
        document.getElementById('freeSpinsCount').textContent = this.freeSpins;
        document.getElementById('totalWin').textContent = this.totalWin.toFixed(2);
        document.getElementById('winCurrency').textContent = this.currentCurrency;
    }

    async spinCosmicChaos() {
        if (this.isSpinning) return;
        
        const bet = +document.getElementById('slotsBet').value;
        
        if (this.freeSpins === 0) {
            if (!(await this.deductBalance(bet))) {
                return this.showResult('slots', 'Insufficient balance!', 'lose');
            }
        } else {
            this.freeSpins--;
        }
        
        this.isSpinning = true;
        this.cascadeCount = 0;
        this.totalWin = 0;
        
        this.toggleSpinButton(false);
        await this.performSpin(bet);
        this.isSpinning = false;
        this.toggleSpinButton(true);
        
        if (this.autoplay.active && this.autoplay.remaining > 0) {
            this.autoplay.remaining--;
            if (this.autoplay.remaining > 0) {
                setTimeout(() => this.spinCosmicChaos(), 1500);
            } else {
                this.stopAutoplay();
            }
        }
    }

    async performSpin(bet) {
        await this.animateSpinning();
        this.generateNewGrid();
        this.updateChaosDisplay();
        this.checkForScatters();
        await this.cascadeSequence(bet);
        this.showFinalResults(bet);
    }

    async animateSpinning() {
        return new Promise(resolve => {
            const duration = 1200;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                if (progress < 0.8) {
                    for (let row = 0; row < 5; row++) {
                        for (let col = 0; col < 6; col++) {
                            if (Math.random() < 0.3) {
                                const cell = document.getElementById(`symbol-${row}-${col}`);
                                if (cell) {
                                    cell.textContent = this.cosmicSymbols[Math.floor(Math.random() * this.cosmicSymbols.length)];
                                    cell.style.transform = 'scale(0.8) rotate(180deg)';
                                }
                            }
                        }
                    }
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    document.querySelectorAll('.chaos-symbol').forEach(cell => {
                        cell.style.transform = 'scale(1) rotate(0deg)';
                    });
                    resolve();
                }
            };
            
            animate();
        });
    }

    generateNewGrid() {
        this.fillGridRandomly();
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if (Math.random() < 0.05) {
                    this.chaosGrid[row][col] = this.scatterSymbol;
                }
            }
        }
    }

    checkForScatters() {
        let scatterCount = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.chaosGrid[row][col] === this.scatterSymbol) scatterCount++;
            }
        }
        
        if (scatterCount >= 3) {
            this.freeSpins += 10;
            this.currentMultiplier = Math.min(this.currentMultiplier + 1, 10);
            this.createCelebration('🌠', 15);
            this.notify(`🌠 ${scatterCount} SCATTERS! +10 Free Spins!`, 'success');
        }
    }

    async cascadeSequence(bet) {
        let hasWins = true;
        
        while (hasWins) {
            this.cascadeCount++;
            const clusters = this.findAllClusters();
            
            if (clusters.length === 0) {
                hasWins = false;
                break;
            }
            
            const cascadeWin = this.calculateClusterWins(clusters, bet);
            this.totalWin += cascadeWin;
            
            await this.animateClusterWins(clusters);
            await this.cascadeSymbols();
            
            if (this.cascadeCount > 1) {
                this.currentMultiplier = Math.min(this.currentMultiplier + 1, 50);
            }
            
            this.updateChaosDisplay();
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }

    findAllClusters() {
        const visited = Array(5).fill().map(() => Array(6).fill(false));
        const clusters = [];
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                if (!visited[row][col] && this.chaosGrid[row][col] !== '') {
                    const cluster = this.findCluster(row, col, this.chaosGrid[row][col], visited);
                    if (cluster.length >= 5) {
                        clusters.push({
                            symbol: this.chaosGrid[row][col],
                            positions: cluster,
                            size: cluster.length
                        });
                    }
                }
            }
        }
        
        return clusters;
    }

    findCluster(row, col, symbol, visited) {
        if (row < 0 || row >= 5 || col < 0 || col >= 6 || 
            visited[row][col] || this.chaosGrid[row][col] !== symbol) {
            return [];
        }
        
        visited[row][col] = true;
        const cluster = [{row, col}];
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        directions.forEach(([dr, dc]) => {
            cluster.push(...this.findCluster(row + dr, col + dc, symbol, visited));
        });
        
        return cluster;
    }

    calculateClusterWins(clusters, bet) {
        let totalWin = 0;
        
        clusters.forEach(cluster => {
            let multiplier = 1;
            
            if (cluster.size >= 20) multiplier = 500;
            else if (cluster.size >= 15) multiplier = 50;
            else if (cluster.size >= 10) multiplier = 10;
            else if (cluster.size >= 5) multiplier = 2;
            
            multiplier *= this.currentMultiplier;
            
            if (cluster.size >= 10 && Math.random() < 0.3) {
                const meteorMult = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
                multiplier *= meteorMult;
                this.notify(`☄️ METEOR x${meteorMult}!`, 'success');
            }
            
            totalWin += bet * multiplier;
        });
        
        return totalWin;
    }

    async animateClusterWins(clusters) {
        return new Promise(resolve => {
            clusters.forEach(cluster => {
                cluster.positions.forEach(({row, col}) => {
                    const cell = document.getElementById(`symbol-${row}-${col}`);
                    if (cell) {
                        cell.style.background = 'linear-gradient(45deg, #FFD700, #FF6B35)';
                        cell.style.boxShadow = '0 0 25px #FFD700';
                        cell.style.transform = 'scale(1.2)';
                        cell.style.animation = 'pulse 0.8s ease-in-out';
                    }
                });
            });
            setTimeout(resolve, 800);
        });
    }

    async cascadeSymbols() {
        return new Promise(resolve => {
            for (let col = 0; col < 6; col++) {
                let writeIndex = 4;
                
                for (let row = 4; row >= 0; row--) {
                    const cell = document.getElementById(`symbol-${row}-${col}`);
                    if (cell && !cell.style.animation.includes('pulse')) {
                        if (writeIndex !== row && writeIndex >= 0) {
                            this.chaosGrid[writeIndex][col] = this.chaosGrid[row][col];
                            this.chaosGrid[row][col] = '';
                        }
                        writeIndex--;
                    }
                }
                
                while (writeIndex >= 0) {
                    this.chaosGrid[writeIndex][col] = this.cosmicSymbols[Math.floor(Math.random() * this.cosmicSymbols.length)];
                    writeIndex--;
                }
            }
            
            document.querySelectorAll('.chaos-symbol').forEach(cell => {
                cell.style.animation = '';
                cell.style.background = 'rgba(255,255,255,0.05)';
                cell.style.boxShadow = '';
                cell.style.transform = 'scale(1)';
            });
            
            setTimeout(resolve, 400);
        });
    }

    showFinalResults(bet) {
        if (this.totalWin > 0) {
            this.addBalance(this.totalWin);
            
            let message = `🌟 COSMIC WIN! +${this.totalWin.toFixed(2)} ${this.currentCurrency}`;
            
            if (this.cascadeCount > 1) {
                message += ` (${this.cascadeCount} cascades!)`;
            }
            
            if (this.totalWin >= bet * 100) {
                message = `🚀 MEGA WIN! +${this.totalWin.toFixed(2)} ${this.currentCurrency}`;
                this.createRain('🪙', 20);
                this.createCelebration('🚀', 12);
            } else if (this.totalWin >= bet * 20) {
                message = `⭐ BIG WIN! +${this.totalWin.toFixed(2)} ${this.currentCurrency}`;
                this.createCelebration('⭐', 8);
            }
            
            this.showResult('slots', message, 'win');
        } else {
            this.showResult('slots', 'No clusters this time! ⭐', 'lose');
        }
        
        this.currentMultiplier = this.freeSpins > 0 ? Math.max(this.currentMultiplier, 2) : 1;
        this.updateChaosDisplay();
    }

    async buyBonusRound() {
        const bet = +document.getElementById('slotsBet').value;
        const bonusCost = bet * 100;
        
        if (!(await this.deductBalance(bonusCost))) {
            return this.showResult('slots', 'Insufficient balance for bonus!', 'lose');
        }
        
        this.freeSpins = 10;
        this.currentMultiplier = 3;
        
        this.createCelebration('🚀', 15);
        this.notify('🚀 BONUS PURCHASED! 10 Free Spins with 3x multiplier!', 'success');
        
        setTimeout(() => this.spinCosmicChaos(), 1000);
    }

    toggleAutoplay() {
        if (this.autoplay.active) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    startAutoplay() {
        const spins = +document.getElementById('autoplaySpins').value;
        this.autoplay = { active: true, spins: spins, remaining: spins };
        
        document.getElementById('autoplayBtn').textContent = '⏸️ Stop';
        document.getElementById('autoplayBtn').style.background = 'linear-gradient(135deg, #F44336, #D32F2F)';
        
        this.notify(`🔄 Autoplay started: ${spins} spins`, 'info');
        
        if (!this.isSpinning) {
            this.spinCosmicChaos();
        }
    }

    stopAutoplay() {
        this.autoplay.active = false;
        this.autoplay.remaining = 0;
        
        document.getElementById('autoplayBtn').textContent = '🔄 Auto';
        document.getElementById('autoplayBtn').style.background = 'linear-gradient(135deg, var(--cg), var(--pc))';
        
        this.notify('⏸️ Autoplay stopped', 'info');
    }

    toggleSpinButton(enabled) {
        const btn = document.getElementById('spinBtn');
        btn.disabled = !enabled;
        btn.textContent = enabled ? '⚡ SPIN ⚡' : '🌀 SPINNING...';
    }

    // === EFFECTS SYSTEM ===
    initEffects() {
        this.setupMusic();
        this.startEffects();
        this.setupSounds();
        this.addAnimationStyles();
    }

    setupMusic() {
        const btn = document.createElement('button');
        btn.id = 'musicToggle';
        btn.innerHTML = '🎵';
        btn.style.cssText = `position:fixed;bottom:20px;left:20px;width:45px;height:45px;border-radius:50%;border:2px solid #FFD700;font-size:1.2rem;background:linear-gradient(135deg,#FFD700,#00E5FF);cursor:pointer;z-index:1001;transition:all 0.3s ease`;
        
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.volume = 0.25;
        audio.src = 'https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3';
        
        let playing = false;
        btn.addEventListener('click', () => {
            if (playing) {
                audio.pause();
                btn.innerHTML = '🔇';
            } else {
                audio.play().catch(() => {});
                btn.innerHTML = '🎵';
            }
            playing = !playing;
        });
        
        document.body.appendChild(btn);
        document.body.appendChild(audio);
    }

    startEffects() {
        this.createParticles();
        setInterval(() => this.createParticles(), 5000);
        this.createFloatingCoins();
        setInterval(() => this.createFloatingCoins(), 8000);
        this.setupBigWinEffects();
    }

    createParticles() {
        const count = window.innerWidth < 768 ? 6 : 10;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                const size = Math.random() * 3 + 2;
                const colors = ['#FFD700', '#00E5FF', '#E91E63', '#9C27B0', '#FFFFFF'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                el.style.cssText = `position:fixed;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;z-index:-1;opacity:${Math.random() * 0.6 + 0.2};left:${Math.random() * 100}%;top:100vh;animation:floatUp ${Math.random() * 6 + 8}s linear forwards`;
                
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 14000);
            }, i * 400);
        }
    }

    createFloatingCoins() {
        const count = window.innerWidth < 768 ? 2 : 3;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.innerHTML = '🪙';
                el.style.cssText = `position:fixed;font-size:${Math.random() * 15 + 12}px;pointer-events:none;z-index:-1;opacity:${Math.random() * 0.5 + 0.3};left:${Math.random() * 100}%;top:100vh;animation:coinFloat ${Math.random() * 5 + 6}s ease-in-out forwards`;
                
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 11000);
            }, i * 800);
        }
    }

    setupBigWinEffects() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('game-result') && target.classList.contains('win') && target.classList.contains('show')) {
                        if (target.textContent.includes('WIN!')) {
                            document.body.style.animation = 'screenShake 0.4s ease-in-out';
                            this.createExplosion();
                            setTimeout(() => document.body.style.animation = '', 400);
                        }
                    }
                }
            });
        });
        
        document.querySelectorAll('.game-result').forEach(el => {
            observer.observe(el, { attributes: true });
        });
    }

    createExplosion() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < 10; i++) {
            const el = document.createElement('div');
            el.innerHTML = '🪙';
            const angle = (Math.PI * 2 * i) / 10;
            const distance = Math.random() * 150 + 80;
            
            el.style.cssText = `position:fixed;font-size:20px;pointer-events:none;z-index:1000;left:${centerX}px;top:${centerY}px;animation:coinExplode 1.5s ease-out forwards`;
            el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            el.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }
    }

    setupSounds() {
        document.addEventListener('click', e => {
            if (e.target.classList.contains('cosmic-btn') && !e.target.disabled) {
                this.playSound(700, 'sine', 0.08, 0.1);
            }
            if (e.target.classList.contains('orbital-item')) {
                this.playSound(500, 'triangle', 0.06, 0.12);
            }
        });
    }

    playSound(frequency, type, volume, duration) {
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

    createRain(icon, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.innerHTML = icon;
                el.style.cssText = `position:fixed;font-size:${Math.random() * 10 + 15}px;pointer-events:none;z-index:999;left:${Math.random() * 100}%;top:-50px;animation:fall 3s ease-in forwards`;
                
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 3000);
            }, i * 100);
        }
    }

    createCelebration(icon, count) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.innerHTML = icon;
            const angle = (Math.PI * 2 * i) / count;
            const distance = Math.random() * 100 + 80;
            
            el.style.cssText = `position:fixed;font-size:20px;pointer-events:none;z-index:1000;left:50%;top:20%;animation:explode 1.5s ease-out forwards`;
            el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            el.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes explode{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2);opacity:0}}
            @keyframes fall{0%{transform:translateY(-50px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
            @keyframes floatUp{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh);opacity:0}}
            @keyframes coinFloat{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translateY(-50vh) rotate(360deg);opacity:0}}
            @keyframes screenShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
            @keyframes coinExplode{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2);opacity:0}}
            @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}
        `;
        document.head.appendChild(style);
    }

    // === UI SYSTEM ===
    setupUI() {
        this.setupCosmicOrb();
        document.querySelectorAll('.game-card').forEach(card => {
            card.onclick = () => this.switchGame(card.dataset.game);
        });
    }

    setupCosmicOrb() {
        const orb = document.getElementById('cosmicOrb');
        const menu = document.getElementById('orbitalMenu');
        let menuOpen = false;

        orb.addEventListener('click', () => {
            menuOpen = !menuOpen;
            if (menuOpen) {
                menu.classList.add('open');
                orb.style.transform = 'scale(0.8)';
            } else {
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            }
        });

        document.querySelectorAll('.orbital-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchGame(item.dataset.game);
                menuOpen = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cosmic-orb-menu') && menuOpen) {
                menuOpen = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            }
        });
    }

    switchGame(game) {
        document.querySelectorAll('.game-screen').forEach(el => el.classList.remove('active'));
        document.getElementById(game).classList.add('active');
        
        if (game === 'slots') setTimeout(() => this.initCosmicChaos(), 100);
        if (game === 'plinko') setTimeout(() => this.initPlinko(), 100);
        if (game === 'hilo') setTimeout(() => this.initHilo(), 100);
        if (game === 'dice') setTimeout(() => this.initDice(), 100);
    }

    updateBets() {
        const bets = this.isAmina ? ['0.25', '0.5', '0.75', '1', '1.25', '1.5'] : ['1', '5', '10'];
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(game => {
            const select = document.getElementById(`${game}Bet`);
            if (select) {
                const curr = select.value;
                select.innerHTML = '';
                bets.forEach(bet => {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = bet;
                    select.appendChild(opt);
                });
                if (bets.includes(curr)) select.value = curr;
            }
        });
    }

    updateDisplay() {
        if (window.currentCurrency) {
            this.currentCurrency = window.currentCurrency;
            this.isAmina = (window.currentCurrency === 'AMINA');
        }
        if (window.aminaBalance !== undefined) this.balance.AMINA = window.aminaBalance;
        if (window.hcBalance !== undefined) this.balance.HC = window.hcBalance;
        if (window.connectedWallet) this.connectedAccount = window.connectedWallet;

        const bal = Math.floor(this.balance[this.currentCurrency] * 10000) / 10000;
        document.getElementById('balanceAmount').textContent = bal;
        document.getElementById('currencySymbol').textContent = this.currentCurrency;
        
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(game => {
            const el = document.getElementById(`${game}Currency`);
            if (el) el.textContent = this.currentCurrency;
        });
    }

    async deductBalance(amt) {
        if (window.deductBalance) return window.deductBalance(amt);
        return false;
    }

    async addBalance(amt) {
        if (window.addBalance) window.addBalance(amt);
    }

    notify(msg, type = 'info') {
        const colors = { success: '#4CAF50', error: '#F44336', info: '#FFD700' };
        const div = document.createElement('div');
        div.textContent = msg;
        div.style.cssText = `position:fixed;top:20px;right:20px;z-index:1001;background:${colors[type]};color:white;padding:1rem 2rem;border-radius:15px;font-family:'Orbitron',monospace;font-weight:700;transform:translateX(100%);transition:transform 0.3s ease`;
        
        document.body.appendChild(div);
        setTimeout(() => div.style.transform = 'translateX(0)', 50);
        setTimeout(() => {
            div.style.transform = 'translateX(100%)';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }

    showResult(gameId, msg, type = 'info') {
        const el = document.getElementById(`${gameId}Result`);
        if (el) {
            el.textContent = msg;
            el.className = `game-result show ${type}`;
            setTimeout(() => el.classList.remove('show'), 4000);
        }
    }

    // === GAME SETUPS ===
    setupGames() {
        this.initPlinko();
        document.getElementById('dropBtn').onclick = () => this.dropPlinko();
        
        this.initBlackjack();
        document.getElementById('dealBtn').onclick = () => this.dealCards();
        document.getElementById('hitBtn').onclick = () => this.hit();
        document.getElementById('standBtn').onclick = () => this.stand();
        document.getElementById('newGameBtn').onclick = () => this.newGame();
        
        this.initHilo();
        document.getElementById('dealHiloBtn').onclick = () => this.dealHilo();
        document.getElementById('higherBtn').onclick = () => this.guessHilo('higher');
        document.getElementById('lowerBtn').onclick = () => this.guessHilo('lower');
        
        this.initDice();
        document.getElementById('rollBtn').onclick = () => this.rollDice();
        document.querySelectorAll('.bet-option').forEach(btn => {
            btn.onclick = () => this.selectDiceBet(btn.dataset.bet);
        });
    }

    // === HI-LO GAME ===
initHilo() {
    console.log('Initializing Hi-Lo game...'); // Debug log
    
    try {
        // Reset game state
        this.hiloCard = null;
        this.cardStreak = [];
        this.hiloBet = 0;
        
        // Reset UI elements - make sure they exist first
        const currentCardEl = document.getElementById('currentCard');
        const nextCardEl = document.getElementById('nextCard');
        const dealBtn = document.getElementById('dealHiloBtn');
        const higherBtn = document.getElementById('higherBtn');
        const lowerBtn = document.getElementById('lowerBtn');
        const resultEl = document.getElementById('hiloResult');
        
        // Check if elements exist
        if (!currentCardEl || !nextCardEl || !dealBtn || !higherBtn || !lowerBtn) {
            console.error('Hi-Lo: Missing HTML elements');
            return;
        }
        
        // Reset current card display
        currentCardEl.innerHTML = '<div class="playing-card">?</div>';
        
        // Reset next card display  
        nextCardEl.innerHTML = '<div class="playing-card back">🚀</div>';
        
        // Reset button states
        dealBtn.disabled = false;
        dealBtn.style.display = 'block';
        higherBtn.disabled = true;
        lowerBtn.disabled = true;
        
        // Clear any previous results
        if (resultEl) {
            resultEl.classList.remove('show');
            resultEl.textContent = '';
        }
        
        // Reset streak display
        this.updateStreakDisplay();
        
        // Add event listeners (remove old ones first to prevent duplicates)
        dealBtn.onclick = null;
        higherBtn.onclick = null; 
        lowerBtn.onclick = null;
        
        // Add fresh event listeners
        dealBtn.onclick = () => this.dealHilo();
        higherBtn.onclick = () => this.guessHilo('higher');
        lowerBtn.onclick = () => this.guessHilo('lower');
        
        console.log('Hi-Lo game initialized successfully!');
        
    } catch (error) {
        console.error('Hi-Lo initialization error:', error);
        // Show error to user
        const hiloContainer = document.querySelector('#hilo .game-container');
        if (hiloContainer) {
            hiloContainer.innerHTML = '<p style="color: #F44336; text-align: center; padding: 2rem;">Hi-Lo game failed to load. Please refresh the page.</p>';
        }
    }
}

    resetHiloUI() {
        document.getElementById('currentCard').innerHTML = '<div class="playing-card">?</div>';
        document.getElementById('nextCard').innerHTML = '<div class="playing-card back">🚀</div>';
        document.getElementById('dealHiloBtn').disabled = false;
        document.getElementById('higherBtn').disabled = true;
        document.getElementById('lowerBtn').disabled = true;
        document.getElementById('hiloResult').classList.remove('show');
        this.cardStreak = [];
        this.updateStreakDisplay();
    }

    updateStreakDisplay() {
        const container = document.getElementById('streakCards');
        if (this.cardStreak.length === 0) {
            container.innerHTML = '<div class="streak-placeholder">Start your streak!</div>';
        } else {
            container.innerHTML = '';
            this.cardStreak.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'streak-card';
                if (['♥', '♦'].includes(card.suit)) cardEl.classList.add('red');
                cardEl.innerHTML = `${card.value}<br>${card.suit}`;
                container.appendChild(cardEl);
            });
        }
    }

    async dealHilo() {
        const bet = +document.getElementById('hiloBet').value;
        if (!(await this.deductBalance(bet))) return this.showResult('hilo', 'Insufficient balance!', 'lose');
        
        this.hiloBet = bet;
        this.hiloCard = this.getRandomCard();
        this.displayCard('currentCard', this.hiloCard);
        document.getElementById('dealHiloBtn').disabled = true;
        document.getElementById('higherBtn').disabled = false;
        document.getElementById('lowerBtn').disabled = false;
    }

    async guessHilo(guess) {
        if (!this.hiloCard) return;
        
        const nextCard = this.getRandomCard();
        this.displayCard('nextCard', nextCard);
        document.getElementById('higherBtn').disabled = true;
        document.getElementById('lowerBtn').disabled = true;
        
        const currentVal = this.getCardValue(this.hiloCard);
        const nextVal = this.getCardValue(nextCard);
        let win = false;
        
        if (guess === 'higher' && nextVal > currentVal) win = true;
        if (guess === 'lower' && nextVal < currentVal) win = true;
        if (nextVal === currentVal) win = false;
        
        if (win) {
            this.cardStreak.push(this.hiloCard);
            this.updateStreakDisplay();
            const winAmount = this.hiloBet * 2;
            this.addBalance(winAmount);
            this.showResult('hilo', `🎉 WIN! Streak: ${this.cardStreak.length} +${winAmount} ${this.currentCurrency}`, 'win');
            
            setTimeout(() => {
                this.hiloCard = nextCard;
                this.displayCard('currentCard', this.hiloCard);
                this.displayCard('nextCard', { suit: '🚀', value: '?' });
                document.getElementById('higherBtn').disabled = false;
                document.getElementById('lowerBtn').disabled = false;
                document.getElementById('hiloResult').classList.remove('show');
            }, 1500);
        } else {
            this.cardStreak.push(this.hiloCard);
            this.cardStreak.push(nextCard);
            this.updateStreakDisplay();
            this.showResult('hilo', `❌ Wrong guess! Final Streak: ${this.cardStreak.length - 1} cards - Game Over!`, 'lose');
            setTimeout(() => this.resetHiloUI(), 4000);
        }
    }

    getRandomCard() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            value: values[Math.floor(Math.random() * values.length)]
        };
    }

    getCardValue(card) {
        if (card.value === 'A') return 1;
        if (['J', 'Q', 'K'].includes(card.value)) return 11;
        return parseInt(card.value);
    }

    displayCard(containerId, card) {
        const container = document.getElementById(containerId);
        const cardEl = document.createElement('div');
        cardEl.className = 'playing-card';
        
        if (card.suit === '🚀' && card.value === '?') {
            cardEl.classList.add('back');
            cardEl.innerHTML = '🚀';
        } else {
            if (['♥', '♦'].includes(card.suit)) cardEl.classList.add('red');
            cardEl.innerHTML = `${card.value}<br>${card.suit}`;
        }
        
        container.innerHTML = '';
        container.appendChild(cardEl);
    }

    // === DICE GAME ===
    initDice() {
        this.selectedDiceBet = null;
        this.resetDiceUI();
    }

    resetDiceUI() {
        document.getElementById('dice1').textContent = '⚀';
        document.getElementById('dice2').textContent = '⚀';
        document.getElementById('selectedBet').textContent = 'None';
        document.getElementById('rollBtn').disabled = true;
        document.querySelectorAll('.bet-option').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('diceResult').classList.remove('show');
    }

    selectDiceBet(bet) {
        this.selectedDiceBet = bet;
        document.querySelectorAll('.bet-option').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-bet="${bet}"]`).classList.add('selected');
        document.getElementById('selectedBet').textContent = bet.toUpperCase();
        document.getElementById('rollBtn').disabled = false;
    }

    async rollDice() {
        if (!this.selectedDiceBet) return;
        
        const bet = +document.getElementById('diceBet').value;
        if (!(await this.deductBalance(bet))) return this.showResult('dice', 'Insufficient balance!', 'lose');
        
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        
        document.getElementById('dice1').classList.add('rolling');
        document.getElementById('dice2').classList.add('rolling');
        
        setTimeout(() => {
            document.getElementById('dice1').textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice1 - 1];
            document.getElementById('dice2').textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice2 - 1];
            document.getElementById('dice1').classList.remove('rolling');
            document.getElementById('dice2').classList.remove('rolling');
            
            let win = false;
            let multiplier = 1;
            
            if (this.selectedDiceBet === 'high' && total >= 8 && total <= 12) { win = true; multiplier = 2; }
            if (this.selectedDiceBet === 'low' && total >= 2 && total <= 6) { win = true; multiplier = 2; }
            if (this.selectedDiceBet === 'seven' && total === 7) { win = true; multiplier = 5; }
            
            if (win) {
                const winAmount = bet * multiplier;
                this.addBalance(winAmount);
                this.showResult('dice', `🎲 WIN! Rolled ${total} - +${winAmount} ${this.currentCurrency}`, 'win');
            } else {
                this.showResult('dice', `🎲 Rolled ${total} - No win!`, 'lose');
            }
            
            setTimeout(() => this.resetDiceUI(), 3000);
        }, 1000);
    }

    // === PLINKO GAME ===
    initPlinko() {
        const canvas = document.getElementById('plinkoCanvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth < 768 ? 320 : 400;
        canvas.height = window.innerWidth < 768 ? 280 : 350;
        this.ctx = canvas.getContext('2d');
        this.activeBalls = [];
        this.setupPegs();
        this.drawBoard();
    }

    setupPegs() {
        this.pegs = [];
        const w = this.ctx.canvas.width;
        
        for (let row = 0; row < 10; row++) {
            const n = row + 3;
            const space = w * 0.75 / (n + 1);
            const start = (w - w * 0.75) / 2;
            
            for (let i = 0; i < n; i++) {
                this.pegs.push({ x: start + space * (i + 1), y: 35 + row * 20, r: 2.5 });
            }
        }
    }

    drawBoard() {
        const ctx = this.ctx;
        const c = ctx.canvas;
        
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(0, 0, c.width, c.height);
        
        this.pegs.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = '#4a5568';
            ctx.fill();
        });
    }

    async dropPlinko() {
        const bet = +document.getElementById('plinkoBet').value;
        
        if (this.activeBalls.length >= this.maxBalls) {
            return this.showResult('plinko', `Max ${this.maxBalls} balls at once!`, 'info');
        }
        
        if (!(await this.deductBalance(bet))) {
            return this.showResult('plinko', 'Insufficient balance!', 'lose');
        }
        
        const ballId = Date.now() + Math.random();
        const ball = {
            id: ballId,
            x: this.ctx.canvas.width / 2,
            y: 15,
            vx: 0,
            vy: 0,
            r: 4,
            g: 0.2,
            b: 0.3,
            bet: bet,
            color: `hsl(${Math.random() * 360},70%,60%)`
        };
        
        this.activeBalls.push(ball);
        this.animateBall(ball);
    }

    animateBall(ball) {
        const animate = () => {
            if (!this.activeBalls.find(b => b.id === ball.id)) return;
            
            this.drawBoard();
            
            this.activeBalls.forEach(b => {
                b.vy += b.g;
                b.x += b.vx;
                b.y += b.vy;
                
                this.pegs.forEach(p => {
                    const dx = b.x - p.x;
                    const dy = b.y - p.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    
                    if (d < b.r + p.r) {
                        const a = Math.atan2(dy, dx);
                        b.x = p.x + Math.cos(a) * (b.r + p.r + 1);
                        b.y = p.y + Math.sin(a) * (b.r + p.r + 1);
                        b.vx += (Math.random() - 0.5) * 0.8;
                        b.vy = Math.abs(b.vy) * b.b + 0.3;
                    }
                });
                
                if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.5; }
                if (b.x > this.ctx.canvas.width - b.r) { b.x = this.ctx.canvas.width - b.r; b.vx = -Math.abs(b.vx) * 0.5; }
                
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                this.ctx.fillStyle = b.color;
                this.ctx.fill();
                
                if (b.y > this.ctx.canvas.height - 30) {
                    let slot = Math.floor(b.x / (this.ctx.canvas.width / 13));
                    slot = Math.max(0, Math.min(12, slot));
                    this.handleBallLanding(b, slot);
                    this.activeBalls = this.activeBalls.filter(ball => ball.id !== b.id);
                }
            });
            
            if (this.activeBalls.length > 0) requestAnimationFrame(animate);
        };
        
        animate();
    }

    handleBallLanding(ball, slot) {
        const mults = [10, 3, 1.5, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.5, 3, 10];
        const mult = mults[slot] || 0.5;
        const win = ball.bet * mult;
        
        this.addBalance(win);
        this.showResult('plinko', `🌌 Ball hit ${mult}x! Won ${win.toFixed(2)} ${this.currentCurrency}!`, win >= ball.bet ? 'win' : 'lose');
        
        document.querySelectorAll('.multiplier').forEach((m, i) => {
            if (i === slot) {
                m.classList.add('hit');
                setTimeout(() => m.classList.remove('hit'), 1000);
            }
        });
    }

    // === BLACKJACK GAME ===
    initBlackjack() {
        this.pHand = [];
        this.dHand = [];
        this.active = false;
        this.deck = [];
        
        const suits = ['♠', '♥', '♦', '♣'];
        const vals = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        suits.forEach(s => vals.forEach(v => this.deck.push({ v, s })));
        
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    async dealCards() {
        const bet = +document.getElementById('blackjackBet').value;
        if (!(await this.deductBalance(bet))) return this.showResult('blackjack', 'Insufficient balance!', 'lose');
        
        this.bet = bet;
        this.pHand = [this.deck.pop(), this.deck.pop()];
        this.dHand = [this.deck.pop(), this.deck.pop()];
        this.active = true;
        
        this.updateBJ();
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('hitBtn').disabled = false;
        document.getElementById('standBtn').disabled = false;
    }

    hit() {
        if (!this.active) return;
        
        this.pHand.push(this.deck.pop());
        this.updateBJ();
        
        if (this.getVal(this.pHand) > 21) {
            this.endBJ('💥 Bust!', 0, 'lose');
        }
    }

    stand() {
        if (!this.active) return;
        
        while (this.getVal(this.dHand) < 17) {
            this.dHand.push(this.deck.pop());
        }
        
        this.updateBJ(true);
        
        const pv = this.getVal(this.pHand);
        const dv = this.getVal(this.dHand);
        
        if (dv > 21) this.endBJ('🎉 Dealer busts!', this.bet * 2, 'win');
        else if (pv > dv) this.endBJ('🎉 You win!', this.bet * 2, 'win');
        else if (pv < dv) this.endBJ('😔 Dealer wins!', 0, 'lose');
        else this.endBJ('🤝 Push!', this.bet, 'win');
    }

    getVal(hand) {
        let val = 0;
        let aces = 0;
        
        hand.forEach(c => {
            if (c.v === 'A') {
                aces++;
                val += 11;
            } else if (['J', 'Q', 'K'].includes(c.v)) {
                val += 10;
            } else {
                val += +c.v;
            }
        });
        
        while (val > 21 && aces > 0) {
            val -= 10;
            aces--;
        }
        
        return val;
    }

    updateBJ(showAll = false) {
        this.showHand('player', this.pHand, true);
        this.showHand('dealer', this.dHand, showAll || !this.active);
        
        document.getElementById('playerScore').textContent = this.getVal(this.pHand);
        document.getElementById('dealerScore').textContent = (showAll || !this.active) ? this.getVal(this.dHand) : this.getVal([this.dHand[0]]);
    }

    showHand(who, hand, showAll = true) {
        const el = document.getElementById(`${who}Cards`);
        if (!el) return;
        
        el.innerHTML = '';
        
        hand.forEach((c, i) => {
            const card = document.createElement('div');
            card.className = 'playing-card';
            
            if (who === 'dealer' && i === 1 && !showAll) {
                card.classList.add('back');
                card.textContent = '🚀';
            } else {
                card.innerHTML = `${c.v}<br>${c.s}`;
                if (['♥', '♦'].includes(c.s)) card.classList.add('red');
            }
            
            el.appendChild(card);
        });
    }

    endBJ(msg, win = 0, type = 'info') {
        this.active = false;
        
        if (win > 0) {
            this.addBalance(win);
            msg += ` +${win} ${this.currentCurrency}`;
        }
        
        this.updateBJ(true);
        this.showResult('blackjack', msg, type);
        
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('standBtn').disabled = true;
        document.getElementById('newGameBtn').style.display = 'inline-block';
    }

    newGame() {
        this.initBlackjack();
        document.getElementById('dealBtn').disabled = false;
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('blackjackResult').classList.remove('show');
        
        ['player', 'dealer'].forEach(p => {
            const cards = document.getElementById(`${p}Cards`);
            const score = document.getElementById(`${p}Score`);
            if (cards) cards.innerHTML = '';
            if (score) score.textContent = '0';
        });
    }
}

// Initialize casino when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aminaCasino = new AminaCasino();
});