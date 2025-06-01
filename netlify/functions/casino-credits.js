// casino-credits.js - SESSION BASED
async function callSessionManager(action, data) {
  try {
    const response = await fetch('https://cryptoamina.netlify.app/.netlify/functions/session-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
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
    const { action, wallet, token, amount } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'get_balance':
        if (token) {
          // Get balance by session token
          const result = await callSessionManager('get_session', { token });
          if (result.success) {
            return {
              statusCode: 200,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({
                success: true,
                balance: result.balance,
                wallet: result.wallet,
                token: result.token,
                message: `Casino credits: ${result.balance.toFixed(8)} AMINA`
              })
            };
          } else {
            // Token expired or invalid - signal frontend to refresh
            return {
              statusCode: 404,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({
                success: false,
                error: 'Session not found',
                needsRefresh: true
              })
            };
          }
        }

        if (wallet) {
          // Create or restore session by wallet
          const result = await callSessionManager('create_session', { wallet });
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              success: true,
              balance: result.balance || 0,
              token: result.token,
              wallet: wallet,
              message: result.message || 'Session ready'
            })
          };
        }

        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, error: 'Token or wallet required' })
        };

      case 'add_credits':
        if (!token || !amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Token and valid amount required' })
          };
        }

        const addResult = await callSessionManager('add_credits', { token, amount });
        
        return {
          statusCode: addResult.success ? 200 : 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(addResult)
        };

      case 'deduct_credits':
        if (!token || !amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Token and valid amount required' })
          };
        }

        // Get current balance
        const sessionResult = await callSessionManager('get_session', { token });
        if (!sessionResult.success) {
          return {
            statusCode: 404,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false, 
              error: 'Session not found',
              needsRefresh: true
            })
          };
        }

        if (sessionResult.balance < amount) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false, 
              error: 'Insufficient credits',
              balance: sessionResult.balance
            })
          };
        }

        const newBalance = sessionResult.balance - amount;
        const updateResult = await callSessionManager('update_balance', { token, amount: newBalance });

        return {
          statusCode: updateResult.success ? 200 : 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: updateResult.success,
            wallet: sessionResult.wallet,
            amount: amount,
            oldBalance: sessionResult.balance,
            newBalance: newBalance,
            message: `Deducted ${amount.toFixed(8)} AMINA credits`
          })
        };

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

  } catch (error) {
    console.error('Casino credits error:', error);
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