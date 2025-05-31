// casino-credits.js - PERSISTENT STORAGE FINAL
const STORAGE_URL = 'https://api.github.com/gists/f1e2d3c4b5a6789012345678901234567890abcd';
const GITHUB_TOKEN = 'ghp_1234567890abcdef1234567890abcdef12345678';

async function loadCredits() {
  try {
    const response = await fetch(`${STORAGE_URL}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    const gist = await response.json();
    const content = gist.files['credits.json'].content;
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

async function saveCredits(credits) {
  try {
    await fetch(STORAGE_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'credits.json': { content: JSON.stringify(credits) }
        }
      })
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function loadProcessedTxns() {
  try {
    const response = await fetch(`${STORAGE_URL}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    const gist = await response.json();
    const content = gist.files['processed.json'].content;
    return new Set(JSON.parse(content));
  } catch (error) {
    return new Set();
  }
}

async function saveProcessedTxns(txnSet) {
  try {
    await fetch(STORAGE_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'processed.json': { content: JSON.stringify([...txnSet]) }
        }
      })
    });
    return true;
  } catch (error) {
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

    const credits = await loadCredits();
    const processedTxns = await loadProcessedTxns();
    let response = {};

    switch (action) {
      case 'get_balance':
        const balance = credits[wallet] || 0;
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

        if (txnId && processedTxns.has(txnId)) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Transaction already processed' })
          };
        }
        
        const currentBalance = credits[wallet] || 0;
        const newBalance = currentBalance + amount;
        credits[wallet] = newBalance;
        
        if (txnId) {
          processedTxns.add(txnId);
          await saveProcessedTxns(processedTxns);
        }
        
        await saveCredits(credits);
        
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

        const walletBalance = credits[wallet] || 0;
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
        credits[wallet] = updatedBalance;
        await saveCredits(credits);
        
        response = {
          success: true,
          wallet: wallet,
          amount: amount,
          oldBalance: walletBalance,
          newBalance: updatedBalance,
          message: `Deducted ${amount.toFixed(8)} AMINA credits`
        };
        break;

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid action',
            supportedActions: ['get_balance', 'add_credits', 'deduct_credits']
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
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error'
      })
    };
  }
};