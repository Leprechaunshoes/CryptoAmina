// session-manager.js - FIXED VERSION
const { createClient } = require(’@supabase/supabase-js’);

const supabaseUrl = ‘https://smkikgtjcasobbssivoc.supabase.co’;
const supabaseKey = ‘eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2lrZ3RqY2Fzb2Jic3Npdm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MjgwMTgsImV4cCI6MjA2NDMwNDAxOH0.LI4bRgP6sSCCJsvGEcwhf2YqLNxXvL7kTql-AkQv4P8’;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateToken() {
return ‘tok_’ + Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
}

// Enhanced error handling and logging
function logError(context, error) {
console.error(`❌ [${context}] Error:`, error.message || error);
return { success: false, error: error.message || ‘Unknown error’ };
}

function logSuccess(context, data = {}) {
console.log(`✅ [${context}] Success:`, data);
return { success: true, …data };
}

// Improved table existence check
async function checkTables() {
try {
// Test if tables exist by trying a simple query
const { error: sessionError } = await supabase
.from(‘casino_sessions’)
.select(‘id’)
.limit(1);

```
    const { error: txnError } = await supabase
        .from('processed_transactions')
        .select('id')
        .limit(1);

    if (sessionError || txnError) {
        console.log('🔧 Tables need to be created manually in Supabase dashboard');
        return false;
    }
    
    console.log('✅ Tables exist and are accessible');
    return true;
} catch (error) {
    console.log('⚠️ Table check failed:', error.message);
    return false;
}
```

}

// Improved safe operations
async function safeQuery(operation, context) {
try {
const result = await operation();
if (result.error) {
throw result.error;
}
return { success: true, data: result.data };
} catch (error) {
return logError(context, error);
}
}

exports.handler = async (event, context) => {
// CORS headers
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type’,
‘Access-Control-Allow-Methods’: ‘POST, GET, OPTIONS’
};

```
if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
}

if (event.httpMethod !== 'POST') {
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
}

try {
    const body = JSON.parse(event.body || '{}');
    const { action, wallet, token, amount, txnId } = body;

    console.log(`🔧 Session manager: ${action}`, { wallet: wallet?.slice(0, 8) + '...', token: token?.slice(0, 10) + '...' });

    // Check table availability first
    const tablesReady = await checkTables();
    if (!tablesReady) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Database tables not ready. Please create tables in Supabase dashboard.',
                tables_needed: ['casino_sessions', 'processed_transactions']
            })
        };
    }

    switch (action) {
        case 'create_session': {
            if (!wallet || wallet.length !== 58) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Invalid wallet address' })
                };
            }

            // Check for existing session
            const existingResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .select('session_token, balance')
                    .eq('wallet_address', wallet)
                    .single(),
                'check_existing_session'
            );

            if (existingResult.success && existingResult.data) {
                console.log(`✅ Session exists for ${wallet.slice(0, 8)}...`);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        token: existingResult.data.session_token,
                        balance: parseFloat(existingResult.data.balance || 0),
                        message: 'Session restored'
                    })
                };
            }

            // Create new session
            const newToken = generateToken();
            const createResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .insert({
                        session_token: newToken,
                        wallet_address: wallet,
                        balance: 0,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single(),
                'create_new_session'
            );

            if (!createResult.success) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to create session',
                        details: createResult.error
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token: newToken,
                    balance: 0,
                    message: 'New session created'
                })
            };
        }

        case 'get_session': {
            if (!token) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Token required' })
                };
            }

            const sessionResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .select('wallet_address, balance, session_token')
                    .eq('session_token', token)
                    .single(),
                'get_session'
            );

            if (!sessionResult.success || !sessionResult.data) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Session not found' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    wallet: sessionResult.data.wallet_address,
                    balance: parseFloat(sessionResult.data.balance || 0),
                    token: sessionResult.data.session_token
                })
            };
        }

        case 'add_credits': {
            if (!token || !amount || amount <= 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Token and valid amount required' })
                };
            }

            // Get current balance
            const currentResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .select('balance, wallet_address')
                    .eq('session_token', token)
                    .single(),
                'get_current_balance'
            );

            if (!currentResult.success || !currentResult.data) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Session not found' })
                };
            }

            const oldBalance = parseFloat(currentResult.data.balance || 0);
            const newBalance = oldBalance + amount;

            // Update balance
            const updateResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .update({ balance: newBalance })
                    .eq('session_token', token)
                    .select()
                    .single(),
                'add_credits'
            );

            if (!updateResult.success) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to add credits',
                        details: updateResult.error
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    oldBalance: oldBalance,
                    newBalance: parseFloat(updateResult.data.balance),
                    amount: amount,
                    message: `Added ${amount} credits`
                })
            };
        }

        case 'update_balance': {
            if (!token || amount < 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Token and valid amount required' })
                };
            }

            const updateResult = await safeQuery(
                () => supabase
                    .from('casino_sessions')
                    .update({ balance: amount })
                    .eq('session_token', token)
                    .select()
                    .single(),
                'update_balance'
            );

            if (!updateResult.success) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to update balance',
                        details: updateResult.error
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    newBalance: parseFloat(updateResult.data.balance),
                    message: `Balance updated to ${amount}`
                })
            };
        }

        case 'check_transaction': {
            if (!txnId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Transaction ID required' })
                };
            }

            const txnResult = await safeQuery(
                () => supabase
                    .from('processed_transactions')
                    .select('transaction_id')
                    .eq('transaction_id', txnId)
                    .single(),
                'check_transaction'
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    processed: !!txnResult.data
                })
            };
        }

        case 'mark_transaction': {
            if (!txnId || !wallet || !amount) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Missing required fields' })
                };
            }

            const markResult = await safeQuery(
                () => supabase
                    .from('processed_transactions')
                    .insert({
                        transaction_id: txnId,
                        wallet_address: wallet,
                        amount: amount,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single(),
                'mark_transaction'
            );

            if (!markResult.success) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to mark transaction',
                        details: markResult.error
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Transaction marked as processed'
                })
            };
        }

        case 'debug_session': {
            // Special debug endpoint
            const debugInfo = {
                timestamp: new Date().toISOString(),
                tables_accessible: await checkTables(),
                request_body: body
            };

            if (wallet) {
                const sessionCheck = await safeQuery(
                    () => supabase
                        .from('casino_sessions')
                        .select('*')
                        .eq('wallet_address', wallet),
                    'debug_session_check'
                );
                debugInfo.session_data = sessionCheck;
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    debug: debugInfo
                })
            };
        }

        default:
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Invalid action' })
            };
    }

} catch (error) {
    console.error('💥 Session manager error:', error);
    return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
            success: false,
            error: 'Internal server error',
            details: error.message
        })
    };
}
```

};