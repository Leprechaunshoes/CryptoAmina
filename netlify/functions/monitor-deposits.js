// monitor-deposits.js - BULLETPROOF DEPOSIT DETECTION
const algosdk = require('algosdk');

const AMINA_ID = 1107424865;
const CASINO_ADDR = process.env.CASINO_ADDRESS || 'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';

async function callSessionManager(action, data) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('https://cryptoamina.netlify.app/.netlify/functions/session-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.log(`Retry ${i + 1}/${maxRetries} failed:`, error.message);
      if (i === maxRetries - 1) return { success: false, error: error.message };
      await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
    }
  }
}

async function processDeposit(wallet, amount, txnId) {
  console.log(`🎯 PROCESSING: ${txnId} | ${wallet} | ${amount} AMINA`);
  
  // Check if already processed (prevent double crediting)
  const checkResult = await callSessionManager('check_transaction', { txnId });
  if (!checkResult.success) {
    console.log('❌ Check failed:', checkResult.error);
    return false;
  }
  
  if (checkResult.processed) {
    console.log('⚠️  Already processed:', txnId);
    return true; // Not an error, just already done
  }

  // Get or create session
  const sessionResult = await callSessionManager('create_session', { wallet });
  if (!sessionResult.success) {
    console.log('❌ Session failed:', sessionResult.error);
    return false;
  }

  // Add credits
  const addResult = await callSessionManager('add_credits', { 
    token: sessionResult.token, 
    amount: amount 
  });
  
  if (!addResult.success) {
    console.log('❌ Credit failed:', addResult.error);
    return false;
  }

  console.log(`💰 CREDITED: ${amount} AMINA (${addResult.oldBalance} → ${addResult.newBalance})`);

  // Mark as processed
  await callSessionManager('mark_transaction', { txnId, wallet, amount });
  
  return true;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  console.log('🚀 DEPOSIT MONITOR STARTING...');
  const startTime = Date.now();

  try {
    // Get target wallet and amount from request (for focused detection)
    const body = event.body ? JSON.parse(event.body) : {};
    const targetWallet = body.wallet;
    const targetAmount = body.amount;
    
    console.log(`🎯 Target: ${targetWallet || 'ALL'} | Amount: ${targetAmount || 'ANY'}`);

    // Scan recent transactions (last 10 minutes for focused, 2 hours for general)
    const timeWindow = targetWallet ? 10 * 60 * 1000 : 2 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - timeWindow;
    
    const transactions = await scanCasinoDeposits(cutoffTime);
    console.log(`📊 Found ${transactions.length} recent AMINA deposits`);

    let processed = 0;
    let errors = [];
    let credited = [];

    for (const txn of transactions) {
      // If targeting specific deposit, filter more precisely
      if (targetWallet && targetAmount) {
        const amountMatch = Math.abs(txn.amount - targetAmount) < 0.00000001; // Handle floating point
        const walletMatch = txn.sender === targetWallet;
        const recentEnough = txn.timestamp > (Date.now() - 5 * 60 * 1000); // Last 5 minutes
        
        if (!amountMatch || !walletMatch || !recentEnough) {
          continue;
        }
        
        console.log(`🎯 TARGETED DEPOSIT FOUND: ${txn.id}`);
      }

      const success = await processDeposit(txn.sender, txn.amount, txn.id);
      
      if (success) {
        credited.push({
          txnId: txn.id,
          wallet: txn.sender,
          amount: txn.amount,
          timestamp: new Date(txn.timestamp).toISOString()
        });
        processed++;
      } else {
        errors.push({
          txnId: txn.id,
          wallet: txn.sender,
          amount: txn.amount,
          error: 'Processing failed'
        });
      }
    }

    const result = {
      success: true,
      processed: processed,
      credits: credited,
      errors: errors,
      totalScanned: transactions.length,
      executionTime: Date.now() - startTime,
      message: processed > 0 ? `✅ Processed ${processed} deposits` : 'No new deposits found',
      timestamp: new Date().toISOString()
    };

    console.log(`🏁 MONITOR COMPLETE: ${processed} processed in ${result.executionTime}ms`);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('💥 MONITOR ERROR:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function scanCasinoDeposits(cutoffTime) {
  try {
    console.log(`🔍 Scanning transactions since: ${new Date(cutoffTime).toISOString()}`);
    
    // Use both mainnet-idx endpoints for redundancy
    const endpoints = [
      'https://mainnet-idx.algonode.cloud',
      'https://mainnet-idx.4160.nodely.io'
    ];
    
    let transactions = [];
    
    for (const endpoint of endpoints) {
      try {
        const url = `${endpoint}/v2/accounts/${CASINO_ADDR}/transactions?` + new URLSearchParams({
          limit: 100,
          'asset-id': AMINA_ID,
          'tx-type': 'axfer'
        });
        
        console.log(`🌐 Trying: ${endpoint}`);
        
        const response = await fetch(url, { timeout: 10000 });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.transactions && data.transactions.length > 0) {
          transactions = data.transactions;
          console.log(`✅ Got ${transactions.length} transactions from ${endpoint}`);
          break; // Use first successful response
        }
      } catch (error) {
        console.log(`❌ ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    if (transactions.length === 0) {
      console.log('⚠️  No transactions found from any endpoint');
      return [];
    }

    // Filter and format deposits
    const deposits = transactions
      .filter(tx => {
        const assetTx = tx['asset-transfer-transaction'];
        const isToCasino = assetTx && assetTx.receiver === CASINO_ADDR;
        const isAmina = assetTx && assetTx['asset-id'] === AMINA_ID;
        const timestamp = tx['round-time'] * 1000;
        const isRecent = timestamp > cutoffTime;
        
        return isToCasino && isAmina && isRecent;
      })
      .map(tx => ({
        id: tx.id,
        amount: tx['asset-transfer-transaction'].amount / 100000000, // Convert to AMINA
        sender: tx.sender,
        receiver: tx['asset-transfer-transaction'].receiver,
        timestamp: tx['round-time'] * 1000,
        roundNumber: tx['confirmed-round']
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first

    console.log(`🎯 Filtered deposits: ${deposits.length}`);
    
    return deposits;
  } catch (error) {
    console.error('💥 Scan error:', error);
    return [];
  }
}