// casino-credits.js - SIMPLE STORAGE FIX
// Using simple in-memory storage that persists during function lifetime

let globalCredits = {};
let globalProcessedTxns = new Set();

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { action, wallet, amount, txnId } = JSON.parse(event.body || '{}');

    if (!wallet || wallet.length !== 58) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Invalid wallet address' })
      };
    }

    let response = {};

    switch (action) {
      case 'get_balance':
        const balance = globalCredits[wallet] || 0;
        response = {
          success: true,
          wallet: wallet,
          balance: balance,
          message: `Casino credits: ${balance.toFixed(8)} AMINA`
        };
        break;

      case 'add_credits':
        if (!amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid amount' })
          };
        }

        // Check if transaction already processed
        if (txnId && globalProcessedTxns.has(txnId)) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Transaction already processed' })
          };
        }
        
        const currentBalance = globalCredits[wallet] || 0;
        const newBalance = currentBalance + amount;
        globalCredits[wallet] = newBalance;
        
        // Mark transaction as processed if txnId provided
        if (txnId) {
          globalProcessedTxns.add(txnId);
        }
        
        response = {
          success: true,
          wallet: wallet,
          amount: amount,
          oldBalance: currentBalance,
          newBalance: newBalance,
          txnId: txnId,
          message: `Added ${amount.toFixed(8)} AMINA credits`
        };
        break;

      case 'deduct_credits':
        if (!amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid amount' })
          };
        }

        const walletBalance = globalCredits[wallet] || 0;
        if (walletBalance < amount) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false, 
              error: 'Insufficient credits',
              balance: walletBalance
            })
          };
        }

        const updatedBalance = walletBalance - amount;
        globalCredits[wallet] = updatedBalance;
        
        response = {
          success: true,
          wallet: wallet,
          amount: amount,
          oldBalance: walletBalance,
          newBalance: updatedBalance,
          message: `Deducted ${amount.toFixed(8)} AMINA credits`
        };
        break;

      case 'set_balance':
        if (amount === undefined || amount < 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid balance amount' })
          };
        }

        globalCredits[wallet] = amount;
        
        response = {
          success: true,
          wallet: wallet,
          balance: amount,
          message: `Set casino credits to ${amount.toFixed(8)} AMINA`
        };
        break;

      case 'debug_info':
        response = {
          success: true,
          totalWallets: Object.keys(globalCredits).length,
          totalProcessedTxns: globalProcessedTxns.size,
          allBalances: globalCredits,
          processedTxnsList: [...globalProcessedTxns].slice(-10) // Last 10 txns
        };
        break;

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid action',
            supportedActions: ['get_balance', 'add_credits', 'deduct_credits', 'set_balance', 'debug_info']
          })
        };
    }

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Casino credits error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    };
  }
};