// session-manager.js - SESSION TOKEN SYSTEM
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://smkikgtjcasobbssivoc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2lrZ3RqY2Fzb2Jic3Npdm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MjgwMTgsImV4cCI6MjA2NDMwNDAxOH0.LI4bRgP6sSCCJsvGEcwhf2YqLNxXvL7kTql-AkQv4P8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Auto-create table if it doesn't exist
async function ensureTable() {
  try {
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS casino_sessions (
          id SERIAL PRIMARY KEY,
          session_token TEXT UNIQUE NOT NULL,
          wallet_address TEXT NOT NULL,
          balance DECIMAL(18,8) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet ON casino_sessions(wallet_address);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_token ON casino_sessions(session_token);
        
        CREATE TABLE IF NOT EXISTS processed_transactions (
          id SERIAL PRIMARY KEY,
          transaction_id TEXT UNIQUE NOT NULL,
          wallet_address TEXT NOT NULL,
          amount DECIMAL(18,8) NOT NULL,
          processed_at TIMESTAMP DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_txn_id ON processed_transactions(transaction_id);
      `
    });
  } catch (error) {
    console.log('Table might already exist:', error.message);
  }
}

function generateToken() {
  return 'tok_' + Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
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
    await ensureTable();
    
    const { action, wallet, token, amount, txnId } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'create_session':
        if (!wallet || wallet.length !== 58) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid wallet' })
          };
        }

        // Check if session already exists for this wallet
        const { data: existing } = await supabase
          .from('casino_sessions')
          .select('*')
          .eq('wallet_address', wallet)
          .single();

        if (existing) {
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              success: true,
              token: existing.session_token,
              balance: parseFloat(existing.balance),
              message: 'Session restored'
            })
          };
        }

        // Create new session
        const newToken = generateToken();
        const { data: session, error } = await supabase
          .from('casino_sessions')
          .insert({
            session_token: newToken,
            wallet_address: wallet,
            balance: 0
          })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            token: newToken,
            balance: 0,
            message: 'New session created'
          })
        };

      case 'get_session':
        if (!token) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Token required' })
          };
        }

        const { data: sessionData } = await supabase
          .from('casino_sessions')
          .select('*')
          .eq('session_token', token)
          .single();

        if (!sessionData) {
          return {
            statusCode: 404,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Session not found' })
          };
        }

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            wallet: sessionData.wallet_address,
            balance: parseFloat(sessionData.balance),
            token: sessionData.session_token
          })
        };

      case 'update_balance':
        if (!token || amount === undefined) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Token and amount required' })
          };
        }

        const { data: updateData, error: updateError } = await supabase
          .from('casino_sessions')
          .update({ 
            balance: amount,
            updated_at: new Date().toISOString()
          })
          .eq('session_token', token)
          .select()
          .single();

        if (updateError) throw updateError;

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            balance: parseFloat(updateData.balance),
            message: 'Balance updated'
          })
        };

      case 'add_credits':
        if (!token || !amount || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Token and valid amount required' })
          };
        }

        // Get current balance
        const { data: currentSession } = await supabase
          .from('casino_sessions')
          .select('balance')
          .eq('session_token', token)
          .single();

        if (!currentSession) {
          return {
            statusCode: 404,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Session not found' })
          };
        }

        const newBalance = parseFloat(currentSession.balance) + amount;

        const { data: addData, error: addError } = await supabase
          .from('casino_sessions')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('session_token', token)
          .select()
          .single();

        if (addError) throw addError;

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            oldBalance: parseFloat(currentSession.balance),
            newBalance: parseFloat(addData.balance),
            amount: amount,
            message: `Added ${amount} credits`
          })
        };

      case 'check_transaction':
        if (!txnId) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Transaction ID required' })
          };
        }

        const { data: txnCheck } = await supabase
          .from('processed_transactions')
          .select('*')
          .eq('transaction_id', txnId)
          .single();

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            processed: !!txnCheck
          })
        };

      case 'mark_transaction':
        if (!txnId || !wallet || !amount) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Missing required fields' })
          };
        }

        const { error: markError } = await supabase
          .from('processed_transactions')
          .insert({
            transaction_id: txnId,
            wallet_address: wallet,
            amount: amount
          });

        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: !markError,
            error: markError?.message
          })
        };

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid action',
            supportedActions: ['create_session', 'get_session', 'update_balance', 'add_credits', 'check_transaction', 'mark_transaction']
          })
        };
    }

  } catch (error) {
    console.error('Session manager error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};