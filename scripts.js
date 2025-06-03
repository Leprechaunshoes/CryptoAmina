class AminaCasino {
    constructor() {
        this.b = { HC: this.getHC(), AMINA: 0 };
        this.c = 'HC';
        this.w = this.getW();
        this.t = this.getT();
        this.p = null;
        this.aid = 1107424865;
        this.cw = 'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';
        this.cc = 0;
        this.dp = false;
        this.ds = 0;
        this.sq = [];
        this.ls = 0;
        this.sil = false;
        this.g = {
            s: {
                syms: ['⭐','🌟','💫','🌌','🪐','🌙','☄️','🚀','👽','🛸'],
                sct: '🌠',
                grid: [],
                spin: 0,
                win: 0,
                mult: 1,
                spins: 0,
                state: null
            },
            p: { balls: [], max: 5 },
            bj: {
                pH: [], dH: [], deck: [], act: 0, bet: 0, dbl: 0, spl: 0, ins: 0,
                spH: [], cDbl: 0, cSpl: 0
            },
            h: { card: null, strk: 0, bet: 0, act: 0 },
            d: { bet: null, v1: 1, v2: 1, roll: 0, hot: [] }
        };
        this.m = { on: 0, aud: null };
        this.hap = navigator.vibrate || navigator.webkitVibrate;
        this.fx = { stars: [], meteors: [] };
        this.silkyRestore();
        this.initP();
        this.init();
        this.epicCheck();
    }

    vib(p = 50) {
        if (this.hap && 'ontouchstart' in window) {
            try {
                this.hap.call(navigator, p);
            } catch(e) {}
        }
    }

    load(el, tx = 'Loading...', glow = false) {
        if (!el) return;
        const glowClass = glow ? ' epic-glow' : '';
        el.innerHTML = `<div class="epic-loading${glowClass}" style="display:flex;align-items:center;gap:8px"><div class="cosmic-spinner"></div>${tx}</div>`;
        el.disabled = true;
    }

    unload(el, tx) {
        if (!el) return;
        el.innerHTML = tx;
        el.disabled = false;
        el.classList.add('button-pop');
        setTimeout(() => el.classList.remove('button-pop'), 200);
    }

    epicAnim() {
        const b = $('balanceAmount');
        if (b) {
            b.classList.add('balance-pulse');
            setTimeout(() => b.classList.remove('balance-pulse'), 600);
        }
    }

    getHC() {
        const d = new Date().toDateString();
        const s = localStorage.getItem('hc_data');
        if (s) {
            const dt = JSON.parse(s);
            if (dt.date === d) return dt.balance;
        }
        localStorage.setItem('hc_data', JSON.stringify({date: d, balance: 1000}));
        return 1000;
    }

    saveHC() {
        localStorage.setItem('hc_data', JSON.stringify({
            date: new Date().toDateString(),
            balance: this.b.HC
        }));
    }

    getT() {
        return localStorage.getItem('session_token') || null;
    }

    saveT(t) {
        localStorage.setItem('session_token', t);
        this.t = t;
    }

    clearT() {
        localStorage.removeItem('session_token');
        this.t = null;
    }

    getW() {
        const s = localStorage.getItem('connected_wallet') || sessionStorage.getItem('connected_wallet');
        return s ? JSON.parse(s) : null;
    }

    saveW() {
        ['localStorage', 'sessionStorage'].forEach(s => 
            window[s].setItem('connected_wallet', JSON.stringify(this.w))
        );
        if (this.b.AMINA > 0) {
            ['localStorage', 'sessionStorage'].forEach(s => 
                window[s].setItem('cached_amina_balance', this.b.AMINA.toString())
            );
        }
        this.saveApp();
    }

    clearW() {
        ['connected_wallet', 'cached_amina_balance', 'app_state'].forEach(k =>
            ['localStorage', 'sessionStorage'].forEach(s => window[s].removeItem(k))
        );
    }

    saveApp() {
        const st = {
            inCasino: !$('welcomeScreen').classList.contains('active'),
            currency: this.c,
            timestamp: Date.now()
        };
        ['localStorage', 'sessionStorage'].forEach(s => 
            window[s].setItem('app_state', JSON.stringify(st))
        );
    }

    saveGameState() {
        localStorage.setItem('game_state', JSON.stringify({
            slots: this.g.s.state,
            hilo: this.g.h.act ? this.g.h : null,
            timestamp: Date.now()
        }));
    }

    loadGameState() {
        const gs = localStorage.getItem('game_state');
        if (gs) {
            const state = JSON.parse(gs);
            if (Date.now() - state.timestamp < 300000) {
                if (state.slots && this.g.s.spins > 0) {
                    this.g.s.state = state.slots;
                }
                if (state.hilo && state.hilo.act) {
                    this.g.h = state.hilo;
                }
            }
        }
    }

    silkyRestore() {
        this.sil = true;
        const ch = localStorage.getItem('cached_amina_balance') || 
                   sessionStorage.getItem('cached_amina_balance');
        if (ch && this.w) {
            this.b.AMINA = parseFloat(ch);
        }
        
        if (this.w) {
            this.c = 'AMINA';
            this.epicUpdCur();
            this.epicUpdBets();
            this.updDisp();
        } else {
            this.c = 'HC';
            this.epicUpdCur();
            this.epicUpdBets();
            this.updDisp();
        }
        this.sil = false;
    }

    // Fixed missing functions
    updBets() {
        this.epicUpdBets();
    }

    async sync() {
        return this.silkySync();
    }

    async epicCheck() {
        if (this.dp) return;
        
        if (this.w) {
            const tg = $('currencyToggle');
            if (tg) {
                tg.classList.add('wallet-connected');
                setTimeout(() => tg.classList.remove('wallet-connected'), 1000);
            }
            this.updWal();
            
            const ap = localStorage.getItem('app_state') || sessionStorage.getItem('app_state');
            if (ap) {
                const st = JSON.parse(ap);
                if (st.inCasino && st.timestamp > Date.now() - 300000) {
                    setTimeout(() => this.enter(), 100);
                }
            }
            
            this.loadGameState();
            this.silkySync();
            setTimeout(() => this.refWal(), 300);
            this.processSyncQueue();
        }
    }

    epicUpdCur() {
        const tg = $('currencyToggle');
        const tx = tg?.querySelector('.currency-text');
        
        if (this.c === 'AMINA') {
            tg?.classList.add('amina');
            if (tx) {
                tx.textContent = 'AMINA';
                tx.classList.add('currency-shine');
                setTimeout(() => tx.classList.remove('currency-shine'), 800);
            }
        } else {
            tg?.classList.remove('amina');
            if (tx) {
                tx.textContent = 'HC';
                tx.classList.add('currency-shine');
                setTimeout(() => tx.classList.remove('currency-shine'), 800);
            }
        }
    }

    async refWal() {
        if (!this.w) return;
        try {
            const bal = await this.fetchAmina(this.w);
            this.b.AMINA = bal;
            ['localStorage', 'sessionStorage'].forEach(s => 
                window[s].setItem('cached_amina_balance', bal.toString())
            );
            this.updCash();
            this.epicAnim();
        } catch(e) {
            // Silent fail
        }
    }

    async refSess() {
        if (!this.w) return false;
        try {
            this.clearT();
            const res = await this.callSess('create_session', {wallet: this.w});
            if (res.success) {
                this.saveT(res.token);
                this.cc = res.balance || 0;
                this.updDisp();
                this.updCash();
                return true;
            }
        } catch(e) {
            // Silent fail
        }
        return false;
    }

    async callSess(act, data) {
        try {
            const res = await fetch('/.netlify/functions/session-manager', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: act, ...data})
            });
            return await res.json();
        } catch(e) {
            return {success: false, error: e.message};
        }
    }

    async silkySync() {
        if (this.dp || (!this.w && !this.t)) return;
        
        try {
            const body = this.t ? 
                {action: 'get_balance', token: this.t} : 
                {action: 'get_balance', wallet: this.w};
                
            const res = await fetch('/.netlify/functions/casino-credits', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            });
            
            const result = await res.json();
            
            if (result.success) {
                this.cc = result.balance || 0;
                if (result.token && !this.t) {
                    this.saveT(result.token);
                }
                if (this.w && this.cc >= 0.001 && this.c === 'HC') {
                    this.silentForceAMINA();
                }
                this.updDisp();
                this.updCash();
                this.ls = Date.now();
            } else if (result.needsRefresh && this.w) {
                await this.refSess();
            }
        } catch(e) {
            if (this.w && !this.t && !this.dp) {
                await this.refSess();
            }
        }
    }

    async updServ(act, amt) {
        if (!this.t) return false;
        
        const req = {
            action: act,
            token: this.t,
            amount: amt,
            timestamp: Date.now()
        };
        
        try {
            const res = await fetch('/.netlify/functions/casino-credits', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(req)
            });
            
            const result = await res.json();
            
            if (result.success) {
                this.cc = result.newBalance || result.balance || 0;
                this.updDisp();
                this.updCash();
                this.ls = Date.now();
                return true;
            } else {
                this.sq.push(req);
                return false;
            }
        } catch(e) {
            this.sq.push(req);
            return false;
        }
    }

    async processSyncQueue() {
        if (this.sq.length === 0 || !this.t) return;
        
        const req = this.sq.shift();
        try {
            const res = await fetch('/.netlify/functions/casino-credits', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(req)
            });
            
            const result = await res.json();
            
            if (result.success) {
                this.cc = result.newBalance || result.balance || 0;
                this.updDisp();
                this.updCash();
                this.ls = Date.now();
                if (this.sq.length > 0) {
                    setTimeout(() => this.processSyncQueue(), 100);
                }
            } else {
                this.sq.unshift(req);
            }
        } catch(e) {
            this.sq.unshift(req);
        }
        
        setTimeout(() => this.processSyncQueue(), 5000);
    }

    async fetchAmina(wal) {
        try {
            const res = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${wal}/assets`);
            const data = await res.json();
            const asset = data.assets?.find(a => a['asset-id'] === this.aid);
            const bal = asset ? asset.amount / 100000000 : 0;
            
            ['localStorage', 'sessionStorage'].forEach(s => 
                window[s].setItem('cached_amina_balance', bal.toString())
            );
            return bal;
        } catch(e) {
            if (!this.sil) {
                this.notify('❌ Error fetching balance');
            }
            const ch = localStorage.getItem('cached_amina_balance') || 
                       sessionStorage.getItem('cached_amina_balance');
            return ch ? parseFloat(ch) : 0;
        }
    }

    initP() {
        try {
            if (typeof PeraWalletConnect !== 'undefined') {
                this.p = new PeraWalletConnect({
                    shouldShowSignTxnToast: false,
                    chainId: 416001
                });
                
                if (typeof this.p.connect === 'function' && typeof this.p.signTransaction === 'function') {
                    this.p.connector?.on('disconnect', () => {
                        this.handleWalletDisconnect();
                    });
                } else {
                    this.p = null;
                }
            } else {
                this.p = null;
            }
        } catch(e) {
            this.p = null;
        }
    }

    handleWalletDisconnect() {
        this.w = null;
        this.b.AMINA = 0;
        this.clearW();
        this.clearT();
        if (this.g.h.act) {
            this.autoCashHilo();
        }
        this.forceHC();
        this.updWal();
        this.notify('🔓 Wallet disconnected - switched to HC mode');
        this.createBurst(5);
    }

    init() {
        this.setupUI();
        this.setupGames();
        this.setupMusic();
        this.createCosmicFX();
        this.updDisp();
    }

    setupUI() {
        $('enterCasino').onclick = () => {
            this.vib(50);
            this.createStarBurst();
            this.enter();
        };
        
        $('walletBtn').onclick = () => {
            this.vib(75);
            this.togWal();
        };
        
        $('currencyToggle').onclick = () => {
            this.vib(25);
            this.togCur();
        };
        
        this.setupOrb();
        
        $$('.game-card').forEach(c => {
            c.onclick = () => {
                this.vib(50);
                this.createRipple(c);
                this.switch(c.dataset.game);
            };
        });
    }

    setupOrb() {
        const orb = $('cosmicOrb');
        const menu = $('orbitalMenu');
        let open = false;
        
        orb.onclick = () => {
            this.vib(75);
            open = !open;
            menu.classList.toggle('open', open);
            orb.style.transform = open ? 'scale(0.9)' : 'scale(1)';
            if (open) this.createBurst(3);
        };
        
        $$('.orbital-item').forEach(i => {
            i.onclick = () => {
                this.vib(50);
                this.createSparkle(i);
                this.switch(i.dataset.game);
                open = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            };
        });
        
        document.addEventListener('click', e => {
            if (!e.target.closest('.cosmic-orb-menu') && open) {
                open = false;
                menu.classList.remove('open');
                orb.style.transform = 'scale(1)';
            }
        });
    }

    enter() {
        const btn = $('enterCasino');
        this.load(btn, 'Entering...', true);
        
        setTimeout(() => {
            $('welcomeScreen').classList.remove('active');
            $('mainCasino').classList.add('active');
            this.saveApp();
            
            if (this.w) {
                this.fetchAmina(this.w).then(bal => {
                    this.b.AMINA = bal;
                    this.updCash();
                });
                this.silkySync();
            }
            
            if (this.m.aud && !this.m.on) {
                this.m.aud.play().then(() => {
                    this.m.on = 1;
                    $('musicToggle').innerHTML = '🎵';
                }).catch(() => {});
            }
            
            this.unload(btn, 'ENTER CASINO');
            this.createBurst(8);
        }, 800);
    }

    async togWal() {
        if (this.w) {
            try {
                if (this.p && typeof this.p.disconnect === 'function') {
                    await this.p.disconnect();
                } else {
                    this.handleWalletDisconnect();
                }
            } catch(e) {
                this.handleWalletDisconnect();
            }
            this.notify('🔓 Wallet disconnected');
            this.vib(100);
        } else {
            const btn = $('walletBtn');
            this.load(btn, 'Connecting...', true);
            
            if (!this.p) {
                this.unload(btn, '🔗 Connect Wallet');
                this.notify('⚠️ Pera Wallet not available - using manual entry');
                
                const addr = prompt('Enter Algorand wallet:');
                if (addr && addr.length === 58) {
                    this.w = addr;
                    this.saveW();
                    this.b.AMINA = await this.fetchAmina(addr);
                    await this.refSess();
                    this.epicForceAMINA();
                    this.updWal();
                    this.notify('✅ Wallet connected manually');
                    this.vib([50, 100, 50]);
                    this.createStarBurst();
                    if ($('welcomeScreen').classList.contains('active')) {
                        setTimeout(() => this.enter(), 1000);
                    }
                } else if (addr) {
                    this.notify('❌ Invalid address');
                }
                return;
            }
            
            try {
                const re = await this.p.reconnectSession();
                if (re && re.length > 0) {
                    this.w = re[0];
                    this.saveW();
                    this.b.AMINA = await this.fetchAmina(this.w);
                    await this.refSess();
                    this.epicForceAMINA();
                    this.updWal();
                    this.unload(btn, '🔗 Connect Wallet');
                    this.notify('🚀 Pera Wallet reconnected!');
                    this.vib([50, 100, 50]);
                    this.createStarBurst();
                    if ($('welcomeScreen').classList.contains('active')) {
                        setTimeout(() => this.enter(), 1000);
                    }
                    return;
                }
                
                const acc = await this.p.connect();
                if (acc && acc.length > 0) {
                    this.w = acc[0];
                    this.saveW();
                    this.b.AMINA = await this.fetchAmina(this.w);
                    await this.refSess();
                    this.epicForceAMINA();
                    this.updWal();
                    this.unload(btn, '🔗 Connect Wallet');
                    this.notify('🚀 Pera Wallet connected!');
                    this.vib([50, 100, 50]);
                    this.createStarBurst();
                    if ($('welcomeScreen').classList.contains('active')) {
                        setTimeout(() => this.enter(), 1000);
                    }
                } else {
                    this.unload(btn, '🔗 Connect Wallet');
                    this.notify('❌ No accounts found');
                }
            } catch(e) {
                this.unload(btn, '🔗 Connect Wallet');
                const msg = e.type === 4001 || e.message?.includes('cancelled') ? 
                    '❌ Connection cancelled' : 
                    e.message?.includes('rejected') ? 
                    '❌ Connection rejected' : 
                    '❌ Connection failed - check Pera Wallet app';
                this.notify(msg);
            }
        }
    }

    forceHC() {
        this.c = 'HC';
        this.epicUpdCur();
        this.epicUpdBets();
        this.updDisp();
        this.saveApp();
        this.createRippleEffect('HC');
    }

    epicForceAMINA() {
        if (this.w && this.cc < 0.001) {
            if (!this.sil) {
                this.notify('❌ Need at least 0.001 AMINA to switch. Visit Cashier!');
            }
            this.forceHC();
            return false;
        }
        
        if (!this.w) {
            this.forceHC();
            return false;
        }
        
        this.c = 'AMINA';
        this.epicUpdCur();
        this.epicUpdBets();
        this.updDisp();
        this.saveApp();
        this.createRippleEffect('AMINA');
        return true;
    }

    silentForceAMINA() {
        if (this.w && this.cc >= 0.001 && this.c === 'HC') {
            this.c = 'AMINA';
            this.epicUpdCur();
            this.epicUpdBets();
            this.updDisp();
            this.saveApp();
            this.createGentleGlow();
        }
    }

    updWal() {
        const btn = $('walletBtn');
        if (this.w) {
            btn.innerHTML = '🔓 ' + this.w.slice(0, 4) + '...' + this.w.slice(-4);
            btn.classList.add('wallet-connected');
            setTimeout(() => btn.classList.remove('wallet-connected'), 2000);
        } else {
            btn.innerHTML = '🔗 Connect Wallet';
            btn.classList.remove('wallet-connected');
        }
    }

    async togCur() {
        if (!this.w) {
            this.notify('🔗 Connect wallet for AMINA!');
            this.vib(100);
            this.createWarningPulse();
            return;
        }
        
        const btn = $('currencyToggle');
        btn.classList.add('toggle-active');
        setTimeout(() => btn.classList.remove('toggle-active'), 300);
        
        if (this.c === 'HC') {
            if (this.epicForceAMINA()) {
                this.notify('🪙 Switched to AMINA mode');
                this.createCurrencyWave('AMINA');
            }
        } else {
            this.forceHC();
            this.notify('🏠 Switched to HC mode');
            this.createCurrencyWave('HC');
        }
        this.vib(50);
    }

    epicUpdBets() {
        const bets = this.c === 'HC' ? ['1', '5', '10'] : ['0.001', '0.005', '0.01'];
        
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(g => {
            const sel = $(`${g}Bet`);
            if (sel) {
                const oldVal = sel.value;
                sel.innerHTML = '';
                bets.forEach(b => {
                    const opt = document.createElement('option');
                    opt.value = opt.textContent = b;
                    sel.appendChild(opt);
                });
                sel.value = bets.includes(oldVal) ? oldVal : bets[0];
                sel.classList.add('bet-update');
                setTimeout(() => sel.classList.remove('bet-update'), 400);
            }
        });
    }

    updDisp() {
        const bal = this.c === 'AMINA' ? this.cc : this.b.HC;
        const balEl = $('balanceAmount');
        balEl.textContent = this.c === 'AMINA' ? 
            this.trimZeros(bal.toFixed(8)) : 
            bal.toFixed(0);
        $('currencySymbol').textContent = this.c;
        this.epicAnim();
        
        ['slots', 'plinko', 'blackjack', 'hilo', 'dice'].forEach(g => {
            const el = $(`${g}Currency`);
            if (el) {
                el.textContent = this.c;
                el.classList.add('currency-pop');
                setTimeout(() => el.classList.remove('currency-pop'), 300);
            }
        });
    }

    updCash() {
        this.epicUpdCash();
    }

    trimZeros(str) {
        return str.replace(/\.?0+$/, '');
    }

    async valBal() {
        if (this.c === 'AMINA' && this.cc < 0.001) {
            if (!this.sil) {
                this.notify('💰 Please top up your AMINA balance!');
                this.createWarningPulse();
            }
            this.forceHC();
            return false;
        }
        return true;
    }

    async deduct(amt) {
        if (!await this.valBal()) return 0;
        
        if (this.c === 'AMINA') {
            if (this.cc < amt) {
                this.notify('❌ Insufficient AMINA credits! Visit Cashier.');
                this.vib(100);
                this.createErrorShake();
                return 0;
            }
            this.cc -= amt;
            this.updDisp();
            const suc = await this.updServ('deduct_credits', amt);
            if (!suc && !this.sil) {
                this.notify('⏸️ Sync pending...');
            }
            this.createSpendEffect(amt);
            return 1;
        } else {
            if (this.b.HC < amt) {
                this.notify('❌ Insufficient HC balance!');
                this.vib(100);
                this.createErrorShake();
                return 0;
            }
            this.b.HC -= amt;
            this.saveHC();
            this.updDisp();
            this.createSpendEffect(amt);
            return 1;
        }
    }

    async add(amt, src = 'win') {
        if (this.c === 'AMINA' && src === 'win') {
            this.cc += amt;
            this.updDisp();
            const suc = await this.updServ('add_credits', amt);
            if (!suc && !this.sil) {
                this.notify('⏸️ Sync pending...');
            }
            this.vib([25, 50, 25]);
            this.createWinEffect(amt);
        } else {
            this.b.HC += amt;
            this.saveHC();
            this.updDisp();
            this.vib([25, 50, 25]);
            this.createWinEffect(amt);
        }
    }

    switch(id) {
        this.vib(25);
        $$('.game-screen').forEach(s => {
            s.classList.remove('active');
            s.classList.add('game-exit');
        });
        
        setTimeout(() => {
            $$('.game-screen').forEach(s => s.classList.remove('game-exit'));
            $(id).classList.add('active', 'game-enter');
            setTimeout(() => $(id).classList.remove('game-enter'), 500);
        }, 200);
        
        const games = {
            slots: () => this.initSlots(),
            plinko: () => this.initPlinko(),
            blackjack: () => this.initBJ(),
            hilo: () => this.initHilo(),
            dice: () => this.initDice(),
            cashier: () => this.initCash()
        };
        
        if (games[id]) {
            setTimeout(() => games[id](), 250);
        }
    }

    notify(msg, type = 'info') {
        const div = document.createElement('div');
        div.textContent = msg;
        div.style.cssText = `position:fixed;top:20px;right:20px;z-index:1001;background:${type === 'error' ? '#F44336' : '#FFD700'};color:#000;padding:1rem 2rem;border-radius:15px;font-family:JetBrains Mono,monospace;font-weight:700;transform:translateX(100%);transition:all .4s cubic-bezier(0.68,-0.55,0.265,1.55);max-width:300px;word-wrap:break-word;box-shadow:0 8px 25px rgba(0,0,0,0.3);border:2px solid ${type === 'error' ? '#D32F2F' : '#FFA000'}`;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.style.transform = 'translateX(0)';
            div.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
        }, 50);
        
        setTimeout(() => {
            div.style.transform = 'translateX(100%)';
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 400);
        }, 3500);
    }

    showRes(game, msg, type = 'info') {
        const el = $(`${game}Result`);
        if (el) {
            el.textContent = msg;
            el.className = `game-result show ${type}`;
            
            if (type === 'win' && msg.includes('MEGA')) {
                el.classList.add('mega-win');
                this.vib([100, 50, 100, 50, 100]);
                this.createMegaWinExplosion();
            } else if (type === 'win') {
                this.vib([50, 25, 50]);
                this.createWinBurst();
            }
            
            setTimeout(() => el.classList.remove('show', 'mega-win'), 5000);
        }
    }

    // Visual Effects Methods
    createStarBurst() {
        for (let i = 0; i < 8; i++) {
            const star = document.createElement('div');
            star.className = 'star-burst';
            star.style.cssText = `position:fixed;top:50%;left:50%;width:4px;height:4px;background:#FFD700;border-radius:50%;pointer-events:none;z-index:1000;transform:translate(-50%,-50%) rotate(${i * 45}deg) translateY(-${20 + Math.random() * 30}px);opacity:1;transition:all 0.8s ease-out`;
            document.body.appendChild(star);
            
            setTimeout(() => {
                star.style.transform += ` translateY(-${100 + Math.random() * 50}px) scale(0)`;
                star.style.opacity = '0';
                setTimeout(() => star.remove(), 800);
            }, 50);
        }
    }

    createBurst(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const burst = document.createElement('div');
                burst.className = 'cosmic-burst';
                burst.style.cssText = `position:fixed;top:${Math.random() * 100}%;left:${Math.random() * 100}%;width:3px;height:3px;background:hsl(${Math.random() * 360},70%,60%);border-radius:50%;pointer-events:none;z-index:999;opacity:1;transition:all 1s ease-out`;
                document.body.appendChild(burst);
                
                setTimeout(() => {
                    burst.style.transform = `scale(${2 + Math.random() * 3}) translateY(-${50 + Math.random() * 100}px)`;
                    burst.style.opacity = '0';
                    setTimeout(() => burst.remove(), 1000);
                }, 100);
            }, i * 100);
        }
    }

    createRipple(el) {
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;top:${rect.top + rect.height / 2}px;left:${rect.left + rect.width / 2}px;width:0;height:0;border-radius:50%;background:rgba(255,215,0,0.3);pointer-events:none;z-index:1000;transition:all 0.6s ease-out;transform:translate(-50%,-50%)`;
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.opacity = '0';
            setTimeout(() => ripple.remove(), 600);
        }, 10);
    }

    createSparkle(el) {
        const rect = el.getBoundingClientRect();
        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `position:fixed;top:${rect.top + Math.random() * rect.height}px;left:${rect.left + Math.random() * rect.width}px;width:2px;height:2px;background:#FFD700;border-radius:50%;pointer-events:none;z-index:1001;opacity:1;transition:all 0.8s ease-out`;
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.style.transform = `translateY(-${30 + Math.random() * 20}px) scale(0)`;
                sparkle.style.opacity = '0';
                setTimeout(() => sparkle.remove(), 800);
            }, i * 100);
        }
    }

    createRippleEffect(type) {
        const color = type === 'AMINA' ? '255,20,147' : '0,229,255';
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(${color},0.2);border:2px solid rgba(${color},0.8);pointer-events:none;z-index:1000;transition:all 0.8s ease-out;transform:translate(-50%,-50%)`;
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.width = '200px';
            ripple.style.height = '200px';
            ripple.style.opacity = '0';
            setTimeout(() => ripple.remove(), 800);
        }, 10);
    }

    createCurrencyWave(type) {
        const wave = document.createElement('div');
        wave.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(${type === 'AMINA' ? '255,20,147' : '0,229,255'},0.1),transparent);pointer-events:none;z-index:999;opacity:0;transition:all 0.6s ease;transform:translateX(-100%)`;
        document.body.appendChild(wave);
        
        setTimeout(() => {
            wave.style.opacity = '1';
            wave.style.transform = 'translateX(100%)';
            setTimeout(() => wave.remove(), 600);
        }, 10);
    }

    createGentleGlow() {
        const glow = document.createElement('div');
        glow.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(255,215,0,0.05),transparent 70%);pointer-events:none;z-index:998;opacity:0;transition:opacity 1s ease`;
        document.body.appendChild(glow);
        
        setTimeout(() => {
            glow.style.opacity = '1';
            setTimeout(() => {
                glow.style.opacity = '0';
                setTimeout(() => glow.remove(), 1000);
            }, 1000);
        }, 10);
    }

    createWarningPulse() {
        const pulse = document.createElement('div');
        pulse.style.cssText = `position:fixed;top:50%;left:50%;width:50px;height:50px;border:3px solid #F44336;border-radius:50%;pointer-events:none;z-index:1000;opacity:1;transition:all 0.8s ease-out;transform:translate(-50%,-50%)`;
        document.body.appendChild(pulse);
        
        setTimeout(() => {
            pulse.style.width = '150px';
            pulse.style.height = '150px';
            pulse.style.opacity = '0';
            setTimeout(() => pulse.remove(), 800);
        }, 10);
    }

    createErrorShake() {
        const el = $('balanceAmount');
        if (el) {
            el.classList.add('error-shake');
            setTimeout(() => el.classList.remove('error-shake'), 600);
        }
    }

    createSpendEffect(amt) {
        const spend = document.createElement('div');
        spend.textContent = `-${this.trimZeros(amt.toFixed(this.c === 'AMINA' ? 8 : 0))} ${this.c}`;
        spend.style.cssText = `position:fixed;top:30%;right:20%;color:#F44336;font-family:JetBrains Mono,monospace;font-weight:700;font-size:1.2rem;pointer-events:none;z-index:1001;opacity:1;transition:all 1s ease-out`;
        document.body.appendChild(spend);
        
        setTimeout(() => {
            spend.style.transform = 'translateY(-50px)';
            spend.style.opacity = '0';
            setTimeout(() => spend.remove(), 1000);
        }, 100);
    }

    createWinEffect(amt) {
        const win = document.createElement('div');
        win.textContent = `+${this.trimZeros(amt.toFixed(this.c === 'AMINA' ? 8 : 0))} ${this.c}`;
        win.style.cssText = `position:fixed;top:30%;right:20%;color:#4CAF50;font-family:JetBrains Mono,monospace;font-weight:700;font-size:1.4rem;pointer-events:none;z-index:1001;opacity:1;transition:all 1s ease-out;text-shadow:0 0 10px #4CAF50`;
        document.body.appendChild(win);
        
        setTimeout(() => {
            win.style.transform = 'translateY(-50px) scale(1.2)';
            win.style.opacity = '0';
            setTimeout(() => win.remove(), 1000);
        }, 100);
    }

    createWinBurst() {
        this.createBurst(5);
    }

    createMegaWinExplosion() {
        this.createBurst(15);
        this.createStarBurst();
    }

    // Game Setup Methods
    setupGames() {
        // Game setup code would go here
    }

    setupMusic() {
        const btn = $('musicToggle');
        this.m.aud = document.createElement('audio');
        Object.assign(this.m.aud, {
            loop: true,
            volume: 0.3,
            src: 'https://dn721902.ca.archive.org/0/items/tvtunes_26876/Hot%20Butter%20Popcorn.mp3',
            crossOrigin: 'anonymous'
        });
        
        this.m.on = 1;
        this.m.aud.play().catch(() => {
            this.m.on = 0;
            btn.innerHTML = '🔇';
        });
        
        btn.onclick = () => {
            this.vib(25);
            btn.classList.add('button-pop');
            setTimeout(() => btn.classList.remove('button-pop'), 200);
            
            if (this.m.on) {
                this.m.aud.pause();
                btn.innerHTML = '🔇';
                this.m.on = 0;
                this.notify('🎵 Music off');
            } else {
                this.m.aud.play().catch(() => this.notify('❌ Music failed to load'));
                btn.innerHTML = '🎵';
                this.m.on = 1;
                this.notify('🎵 Hot Butter Popcorn!');
            }
        };
    }

    createCosmicFX() {
        this.starField();
        setInterval(() => {
            if (Math.random() < 0.4) {
                this.createCosmicPart();
            }
        }, 2000);
    }

    starField() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.style.cssText = `position:fixed;width:2px;height:2px;background:#FFD700;border-radius:50%;pointer-events:none;z-index:-1;top:${Math.random() * 100}%;left:${Math.random() * 100}%;opacity:${Math.random() * 0.5 + 0.2};animation:twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
                document.body.appendChild(star);
                setTimeout(() => star.remove(), 10000);
            }, i * 200);
        }
    }

    createCosmicPart() {
        const el = document.createElement('div');
        const syms = ['✨', '⭐', '🌟', '💫', '🌙', '☄️'];
        el.textContent = syms[Math.floor(Math.random() * 6)];
        el.style.cssText = `position:fixed;font-size:${Math.random() * 12 + 10}px;pointer-events:none;z-index:-1;left:${Math.random() * 100}%;top:100vh;opacity:${Math.random() * 0.8 + 0.2};animation:floatUp ${Math.random() * 6 + 4}s linear forwards`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 10000);
    }

    // Placeholder game methods - you can implement these later
    initSlots() {
        console.log('Slots game initialized');
    }

    initPlinko() {
        console.log('Plinko game initialized');
    }

    initBJ() {
        console.log('Blackjack game initialized');
    }

    initHilo() {
        console.log('Hi-Lo game initialized');
    }

    initDice() {
        console.log('Dice game initialized');
    }

    initCash() {
        console.log('Cashier initialized');
    }

    // Add any missing methods referenced in the code
    epicUpdCash() {
        // Update cashier display
    }

    autoCashHilo() {
        // Auto cash out hilo game
    }
}

function $(id) {
    return document.getElementById(id);
}

function $$(sel) {
    return document.querySelectorAll(sel);
}

function openAminaExplorer() {
    window.open('https://explorer.perawallet.app/asset/1107424865/', '_blank');
}

function showDonationModal() {
    $('donationModal').style.display = 'flex';
}

function closeDonationModal() {
    $('donationModal').style.display = 'none';
}

function copyDonationAddress() {
    const input = $('donationWallet');
    input.select();
    document.execCommand('copy');
    alert('Address copied! 🚀');
}

let casino;

document.addEventListener('DOMContentLoaded', () => {
    casino = new AminaCasino();
});

window.casino = casino;