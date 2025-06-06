// sessions.js - AMINA CASINO SESSION MANAGER
// THE DEFINITIVE VERSION - PUT THIS IN YOUR GITHUB REPO ROOT

class SessionManager {
constructor() {
this.sessions = new Map();
this.walletSessions = new Map();
this.transactions = new Map();
this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
this.cleanupInterval = 60 * 60 * 1000; // 1 hour

```
// Auto-cleanup timer
setInterval(() => this.cleanup(), this.cleanupInterval);
console.log('🚀 Amina Casino Session Manager initialized');
```

}

generateToken() {
const array = new Uint8Array(32);
if (typeof crypto !== ‘undefined’ && crypto.getRandomValues) {
crypto.getRandomValues(array);
} else {
// Fallback for Node.js
const crypto = require(‘crypto’);
const buffer = crypto.randomBytes(32);
for (let i = 0; i < 32; i++) {
array[i] = buffer[i];
}
}
return Array.from(array, byte => byte.toString(16).padStart(2, ‘0’)).join(’’);
}

createSession(wallet) {
try {
if (!wallet || wallet.length !== 58) {
return { success: false, error: ‘Invalid wallet address’ };
}

```
  // Check existing session
  const existingToken = this.walletSessions.get(wallet);
  if (existingToken && this.sessions.has(existingToken)) {
    const session = this.sessions.get(existingToken);
    if (Date.now() - session.lastActivity < this.sessionTimeout) {
      session.lastActivity = Date.now();
      return {
        success: true,
        token: existingToken,
        balance: session.balance,
        message: `Session restored: ${session.balance.toFixed(8)} AMINA credits`,
        wallet: wallet
      };
    } else {
      this.sessions.delete(existingToken);
      this.walletSessions.delete(wallet);
    }
  }

  // Create new session
  const token = this.generateToken();
  const sessionData = {
    wallet: wallet,
    balance: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    totalDeposited: 0,
    totalWithdrawn: 0,
    gamesPlayed: 0,
    totalWagered: 0,
    totalWon: 0
  };

  this.sessions.set(token, sessionData);
  this.walletSessions.set(wallet, token);

  return {
    success: true,
    token: token,
    balance: 0,
    message: 'New session created - visit Cashier to deposit AMINA',
    wallet: wallet
  };

} catch (error) {
  console.error('❌ Session creation error:', error);
  return { success: false, error: 'Session creation failed' };
}
```

}

getSession(token) {
try {
if (!token) {
return { success: false, error: ‘Token required’ };
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  if (Date.now() - session.lastActivity > this.sessionTimeout) {
    this.sessions.delete(token);
    this.walletSessions.delete(session.wallet);
    return { success: false, error: 'Session expired' };
  }

  session.lastActivity = Date.now();

  return {
    success: true,
    wallet: session.wallet,
    balance: session.balance,
    token: token,
    stats: {
      totalDeposited: session.totalDeposited,
      totalWithdrawn: session.totalWithdrawn,
      gamesPlayed: session.gamesPlayed,
      totalWagered: session.totalWagered,
      totalWon: session.totalWon,
      sessionAge: Date.now() - session.createdAt
    }
  };

} catch (error) {
  console.error('❌ Get session error:', error);
  return { success: false, error: 'Session retrieval failed' };
}
```

}

updateBalance(token, newBalance) {
try {
const session = this.sessions.get(token);
if (!session) {
return { success: false, error: ‘Session not found’ };
}

```
  if (newBalance < 0) {
    return { success: false, error: 'Balance cannot be negative' };
  }

  const oldBalance = session.balance;
  session.balance = newBalance;
  session.lastActivity = Date.now();

  return {
    success: true,
    oldBalance: oldBalance,
    newBalance: newBalance,
    wallet: session.wallet
  };

} catch (error) {
  console.error('❌ Balance update error:', error);
  return { success: false, error: 'Balance update failed' };
}
```

}

addCredits(token, amount) {
try {
if (!token || !amount || amount <= 0) {
return { success: false, error: ‘Invalid token or amount’ };
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const oldBalance = session.balance;
  const newBalance = oldBalance + amount;
  
  session.balance = newBalance;
  session.totalDeposited += amount;
  session.lastActivity = Date.now();

  return {
    success: true,
    amount: amount,
    oldBalance: oldBalance,
    newBalance: newBalance,
    wallet: session.wallet,
    message: `Added ${amount.toFixed(8)} AMINA credits`
  };

} catch (error) {
  console.error('❌ Add credits error:', error);
  return { success: false, error: 'Failed to add credits' };
}
```

}

deductCredits(token, amount) {
try {
if (!token || !amount || amount <= 0) {
return { success: false, error: ‘Invalid token or amount’ };
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  if (session.balance < amount) {
    return { 
      success: false, 
      error: 'Insufficient credits',
      balance: session.balance 
    };
  }

  const oldBalance = session.balance;
  const newBalance = oldBalance - amount;
  
  session.balance = newBalance;
  session.totalWagered += amount;
  session.gamesPlayed += 1;
  session.lastActivity = Date.now();

  return {
    success: true,
    amount: amount,
    oldBalance: oldBalance,
    newBalance: newBalance,
    wallet: session.wallet,
    message: `Deducted ${amount.toFixed(8)} AMINA for bet`
  };

} catch (error) {
  console.error('❌ Deduct credits error:', error);
  return { success: false, error: 'Failed to deduct credits' };
}
```

}

addWinnings(token, amount) {
try {
if (!token || !amount || amount <= 0) {
return { success: false, error: ‘Invalid token or amount’ };
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const oldBalance = session.balance;
  const newBalance = oldBalance + amount;
  
  session.balance = newBalance;
  session.totalWon += amount;
  session.lastActivity = Date.now();

  return {
    success: true,
    amount: amount,
    oldBalance: oldBalance,
    newBalance: newBalance,
    wallet: session.wallet,
    message: `Won ${amount.toFixed(8)} AMINA!`
  };

} catch (error) {
  console.error('❌ Add winnings error:', error);
  return { success: false, error: 'Failed to add winnings' };
}
```

}

processWithdrawal(token, amount) {
try {
if (!token || !amount || amount <= 0) {
return { success: false, error: ‘Invalid token or amount’ };
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  if (session.balance < amount) {
    return { 
      success: false, 
      error: 'Insufficient credits for withdrawal',
      balance: session.balance 
    };
  }

  const oldBalance = session.balance;
  const newBalance = oldBalance - amount;
  
  session.balance = newBalance;
  session.totalWithdrawn += amount;
  session.lastActivity = Date.now();

  return {
    success: true,
    amount: amount,
    oldBalance: oldBalance,
    newBalance: newBalance,
    wallet: session.wallet,
    message: `Withdrawn ${amount.toFixed(8)} AMINA`
  };

} catch (error) {
  console.error('❌ Withdrawal error:', error);
  return { success: false, error: 'Withdrawal processing failed' };
}
```

}

markTransaction(txId, wallet, amount) {
try {
if (this.transactions.has(txId)) {
return { success: false, error: ‘Transaction already processed’ };
}

```
  this.transactions.set(txId, {
    wallet: wallet,
    amount: amount,
    timestamp: Date.now(),
    processed: true
  });

  return { success: true, message: 'Transaction marked as processed' };

} catch (error) {
  console.error('❌ Mark transaction error:', error);
  return { success: false, error: 'Failed to mark transaction' };
}
```

}

checkTransaction(txId) {
try {
const transaction = this.transactions.get(txId);

```
  return {
    success: true,
    processed: !!transaction,
    data: transaction || null
  };

} catch (error) {
  console.error('❌ Check transaction error:', error);
  return { success: false, error: 'Transaction check failed' };
}
```

}

getWalletStats(wallet) {
try {
const token = this.walletSessions.get(wallet);
if (!token) {
return {
success: false,
error: ‘No session found for wallet’,
stats: { currentBalance: 0, wallet: wallet }
};
}

```
  const session = this.sessions.get(token);
  if (!session) {
    return { 
      success: false, 
      error: 'Session data not found',
      stats: { currentBalance: 0, wallet: wallet }
    };
  }

  return {
    success: true,
    stats: {
      wallet: wallet,
      currentBalance: session.balance,
      totalDeposited: session.totalDeposited,
      totalWithdrawn: session.totalWithdrawn,
      netDeposits: session.totalDeposited - session.totalWithdrawn,
      gamesPlayed: session.gamesPlayed,
      totalWagered: session.totalWagered,
      totalWon: session.totalWon,
      netWinnings: session.totalWon - session.totalWagered,
      sessionDuration: Date.now() - session.createdAt,
      lastActivity: session.lastActivity
    }
  };

} catch (error) {
  console.error('❌ Get stats error:', error);
  return { success: false, error: 'Stats retrieval failed' };
}
```

}

cleanup() {
try {
const now = Date.now();
let cleaned = 0;

```
  for (const [token, session] of this.sessions.entries()) {
    if (now - session.lastActivity > this.sessionTimeout) {
      this.sessions.delete(token);
      this.walletSessions.delete(session.wallet);
      cleaned++;
    }
  }

  const transactionTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days
  for (const [txId, transaction] of this.transactions.entries()) {
    if (now - transaction.timestamp > transactionTimeout) {
      this.transactions.delete(txId);
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleanup: ${cleaned} expired sessions removed`);
  }

} catch (error) {
  console.error('❌ Cleanup error:', error);
}
```

}

getStatus() {
return {
activeSessions: this.sessions.size,
trackedTransactions: this.transactions.size,
uptime: Date.now(),
status: ‘operational’
};
}

destroySession(token) {
try {
const session = this.sessions.get(token);
if (!session) {
return { success: false, error: ‘Session not found’ };
}

```
  this.sessions.delete(token);
  this.walletSessions.delete(session.wallet);

  return { success: true, message: 'Session terminated' };

} catch (error) {
  console.error('❌ Destroy session error:', error);
  return { success: false, error: 'Session destruction failed' };
}
```

}
}

// Export for Node.js (Netlify Functions)
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = SessionManager;
}

// Global for browser
if (typeof window !== ‘undefined’) {
window.SessionManager = SessionManager;
}

// Global instance for Netlify Functions
let globalSessionManager = null;

function getGlobalSessionManager() {
if (!globalSessionManager) {
globalSessionManager = new SessionManager();
}
return globalSessionManager;
}

// Export singleton getter
if (typeof module !== ‘undefined’ && module.exports) {
module.exports.getGlobalSessionManager = getGlobalSessionManager;
}