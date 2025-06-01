// transfer-to-hot-wallet.js - Transfer lost funds to your personal hot wallet
const algosdk = require('algosdk');

const ALGOD_SERVER = 'https://mainnet-api.algonode.cloud';
const ALGOD_TOKEN = '';
const ALGOD_PORT = '';
const AMINA_ASSET_ID = 1107424865;

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

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
        const { amount, fromWallet, toWallet, reason } = JSON.parse(event.body || '{}');
        
        console.log(`🔥 Hot wallet transfer: ${amount} AMINA | Reason: ${reason}`);
        
        if (!amount || !fromWallet || !toWallet) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Missing required parameters: amount, fromWallet, toWallet' 
                })
            };
        }

        if (amount <= 0 || amount > 1000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Invalid amount (must be 0.00000001 - 1000 AMINA)' 
                })
            };
        }

        // Get casino wallet private key
        const casinoMnemonic = process.env.CASINO_PRIVATE_KEY;
        if (!casinoMnemonic) {
            console.error('❌ Casino private key not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Hot wallet transfer service not configured' 
                })
            };
        }

        // Initialize Algorand client and casino account
        const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
        const casinoAccount = algosdk.mnemonicToSecretKey(casinoMnemonic);
        
        console.log(`💰 From: ${casinoAccount.addr} → To: ${toWallet}`);

        // Check casino wallet has sufficient balance
        const accountInfo = await algodClient.accountInformation(casinoAccount.addr).do();
        const aminaAsset = accountInfo.assets?.find(a => a['asset-id'] === AMINA_ASSET_ID);
        const casinoBalance = aminaAsset ? aminaAsset.amount / 100000000 : 0;
        
        if (casinoBalance < amount) {
            console.error(`❌ Insufficient casino balance: ${casinoBalance} < ${amount}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: `Insufficient casino balance for transfer`,
                    casinoBalance: casinoBalance
                })
            };
        }

        // Get transaction parameters
        const suggestedParams = await algodClient.getTransactionParams().do();
        
        // Create the transfer transaction
        const amountInMicroAmina = Math.floor(amount * 100000000);
        const noteText = `Hot wallet transfer: ${reason || 'lost_bet'} - ${amount} AMINA`;
        
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: casinoAccount.addr,
            to: toWallet,
            amount: amountInMicroAmina,
            assetIndex: AMINA_ASSET_ID,
            suggestedParams: suggestedParams,
            note: algosdk.encodeObj(noteText)
        });
        
        // Sign the transaction
        const signedTxn = txn.signTxn(casinoAccount.sk);
        
        // Submit to network
        console.log(`📡 Submitting hot wallet transfer...`);
        const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
        const txId = txResponse.txId;
        
        // Wait for confirmation
        console.log(`⏳ Waiting for confirmation: ${txId}`);
        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 5);
        
        if (confirmedTxn['confirmed-round']) {
            console.log(`✅ Hot wallet transfer confirmed in round: ${confirmedTxn['confirmed-round']}`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    txId: txId,
                    amount: amount,
                    from: fromWallet,
                    to: toWallet,
                    confirmedRound: confirmedTxn['confirmed-round'],
                    reason: reason,
                    message: `Transferred ${amount} AMINA to hot wallet`
                })
            };
        } else {
            throw new Error('Transfer failed to confirm within timeout');
        }
        
    } catch (error) {
        console.error('💥 Hot wallet transfer error:', error);
        
        let errorMessage = 'Hot wallet transfer failed';
        if (error.message?.includes('insufficient funds')) {
            errorMessage = 'Casino wallet has insufficient AMINA balance';
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Transfer timeout - may still be processing';
        } else if (error.message?.includes('fee')) {
            errorMessage = 'Transaction fee error';
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: errorMessage,
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};