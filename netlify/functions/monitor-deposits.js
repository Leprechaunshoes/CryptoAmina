// monitor-deposits.js - BULLETPROOF TRANSACTION DETECTION
const algosdk = require('algosdk');

const AMINA_ID = 1107424865;
const CASINO_ADDR = process.env.CASINO_ADDRESS || 'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';

async function callSessionManager(action, data) {
  try {
    const response = await fetch('https://cryptoamina.netlify.app/.netlify/functions/session-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Session manager ${action}:`, result);
    return result;
  } catch (error) {
    console.error(`Session manager ${action} failed:`, error);
    return { success: false, error: error.message };
  }
}

async function addCreditsToWallet(wallet, amount, txnId) {
  try {
    console.log(`🔍 Processing transaction ${txnId} for ${wallet}: ${amount} AMINA`);
    
    // Step 1: Check if already processed
    const checkResult = await callSessionManager('check_transaction', { txnId });
    if (!checkResult.success) {
      console.error('❌ Failed to check transaction:', checkResult.error);
      return false;
    }
    
    if (checkResult.processed) {
      console.log('⏭️  Transaction already processed:', txnId);
      return false;
    }

    // Step 2: Create or get session
    const sessionResult = await callSessionManager('create_session', { wallet });
    if (!sessionResult.success) {
      console.error('❌ Failed to create session for wallet:', wallet, sessionResult.error);
      return false;
    }

    console.log(`✅ Session ready for ${wallet}, token: ${sessionResult.token}`);

    // Step 3: Add credits
    const addResult = await callSessionManager('add_credits', { 
      token: sessionResult.token, 
      amount: amount 
    });
    
    if (!addResult.success) {
      console.error('❌ Failed to add credits:', addResult.error);
      return false;
    }

    console.log(`💰 Credits added: ${amount} AMINA (${addResult.oldBalance} → ${addResult.newBalance})`);

    // Step 4: Mark as processed
    const markResult = await callSessionManager('mark_transaction', { txnId, wallet, amount });
    if (!markResult.success) {
      console.error('❌ Failed to mark transaction (but credits were added):', markResult.error);
      // Don't return false here - credits were successfully added
    } else {
      console.log('✅ Transaction marked as processed:', txnId);
    }

    return true;
  } catch (error) {
    console.error('💥 addCreditsToWallet error:', error);
    return false;
  }
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

  console.log('🔍 Monitor deposits starting...');

  try {
    const now = Date.now();
    const fourHoursAgo = now - (4 * 60 * 60 * 1000); // Extended to 4 hours
    
    console.log('📡 Scanning wallet transactions...');
    const txns = await scanWalletTransactions();
    
    console.log(`📊 Found ${txns.length} total transactions`);
    
    let processed = 0;
    let creditedAmounts = [];
    let errors = [];

    for (const txn of txns) {
      // Extended time window check
      if (txn.timestamp <= fourHoursAgo) {
        console.log(`⏰ Skipping old transaction: ${txn.id} (${new Date(txn.timestamp).toISOString()})`);
        continue;
      }
      
      // Filter for AMINA transfers to casino
      if (txn.assetId !== AMINA_ID) {
        console.log(`🚫 Skipping non-AMINA transaction: ${txn.id}`);
        continue;
      }
      
      if (txn.receiver !== CASINO_ADDR) {
        console.log(`🚫 Skipping transaction not to casino: ${txn.id}`);
        continue;
      }

      console.log(`🎯 Processing deposit: ${txn.id} from ${txn.sender}`);
      
      // Convert micro-units to AMINA (8 decimals)
      const amount = Math.round((txn.amount / 100000000) * 100000000) / 100000000;
      
      console.log(`💰 Amount: ${amount} AMINA (${txn.amount} micro-units)`);

      const success = await addCreditsToWallet(txn.sender, amount, txn.id);
      
      if (success) {
        creditedAmounts.push({
          amount: amount,
          wallet: txn.sender,
          txnId: txn.id,
          timestamp: new Date(txn.timestamp).toISOString()
        });
        processed++;
        console.log(`✅ Successfully credited ${amount} AMINA to ${txn.sender}`);
      } else {
        errors.push({
          txnId: txn.id,
          wallet: txn.sender,
          amount: amount,
          error: 'Credit processing failed'
        });
        console.log(`❌ Failed to credit ${amount} AMINA to ${txn.sender}`);
      }
    }

    const result = {
      success: true,
      processed: processed,
      credits: creditedAmounts,
      errors: errors,
      totalScanned: txns.length,
      message: processed > 0 ? `Credited ${processed} deposits` : 'No new deposits found',
      timestamp: new Date().toISOString()
    };

    console.log('📈 Monitor deposits complete:', result);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('💥 Monitor deposits error:', error);
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

async function scanWalletTransactions() {
  try {
    console.log(`🔍 Scanning transactions for wallet: ${CASINO_ADDR}`);
    
    const params = {
      limit: 200, // Increased limit
      'asset-id': AMINA_ID,
      'tx-type': 'axfer'
    };
    
    const url = `https://mainnet-idx.algonode.cloud/v2/accounts/${CASINO_ADDR}/transactions?${new URLSearchParams(params)}`;
    console.log('🌐 API URL:', url);
    
    const txnResponse = await fetch(url);
    
    if (!txnResponse.ok) {
      throw new Error(`HTTP ${txnResponse.status}: ${txnResponse.statusText}`);
    }
    
    const data = await txnResponse.json();
    
    if (!data.transactions) {
      console.log('⚠️  No transactions found in response');
      return [];
    }

    console.log(`📊 Raw transactions found: ${data.transactions.length}`);

    const filtered = data.transactions
      .filter(tx => {
        const assetTx = tx['asset-transfer-transaction'];
        const isToCasino = assetTx && assetTx.receiver === CASINO_ADDR;
        const isAmina = assetTx && assetTx['asset-id'] === AMINA_ID;
        return isToCasino && isAmina;
      })
      .map(tx => ({
        id: tx.id,
        amount: tx['asset-transfer-transaction'].amount,
        assetId: tx['asset-transfer-transaction']['asset-id'],
        sender: tx.sender,
        receiver: tx['asset-transfer-transaction'].receiver,
        timestamp: tx['round-time'] * 1000, // Convert to milliseconds
        roundNumber: tx['confirmed-round']
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first

    console.log(`🎯 Filtered AMINA deposits: ${filtered.length}`);
    
    // Log recent transactions for debugging
    filtered.slice(0, 5).forEach(tx => {
      console.log(`📋 Recent: ${tx.id} | ${tx.amount/100000000} AMINA | ${new Date(tx.timestamp).toISOString()}`);
    });

    return filtered;
  } catch (error) {
    console.error('💥 scanWalletTransactions error:', error);
    return [];
  }
}