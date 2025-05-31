// casino-credits.js - PERSISTENT STORAGE FIX
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/674c0000acd3cb34a8b85c42';
const JSONBIN_KEY = '$2a$10$Vq3zY6HH.pK8dWxmfN9UXO7qE.M8BQK3p2Y4wZ9A1sN7fT2mL5gR6';

async function loadCredits() {
  try {
    const response = await fetch(`${JSONBIN_URL}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_KEY
      }
    });
    const data = await response.json();
    return data.record || {};
  } catch (error) {
    console.log('Loading credits from JSONBin failed, using empty:', error.message);
    return {};
  }
}

async function saveCredits(credits) {
  try {
    const response = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify(credits)
    });
    return response.ok;
  } catch (error) {
    console.error('Saving credits to JSONBin failed:', error);
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
    const { action, wallet, amount } = JSON.parse(event.body || '{}');

    if (!wallet || wallet.length !== 58) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Invalid wallet address' })
      };
    }

    const credits = await loadCredits();
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
        // ALLOW add_credits for monitor function only
        if (!amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid amount' })
          };
        }
        
        const currentBalance = credits[wallet] || 0;
        const newBalance = currentBalance + amount;
        credits[wallet] = newBalance;
        
        await saveCredits(credits);
        
        response = {
          success: true,
          wallet: wallet,
          amount: amount,
          oldBalance: currentBalance,
          newBalance: newBalance,
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

      case 'set_balance':
        if (amount === undefined || amount < 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid balance amount' })
          };
        }

        credits[wallet] = amount;
        await saveCredits(credits);
        
        response = {
          success: true,
          wallet: wallet,
          balance: amount,
          message: `Set casino credits to ${amount.toFixed(8)} AMINA`
        };
        break;

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid action',
            supportedActions: ['get_balance', 'add_credits', 'deduct_credits', 'set_balance']
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