// AMINA CASINO - AUTOMATED WITHDRAWAL PROCESSOR
const algosdk = require('algosdk');

// Algorand configuration
const ALGOD_SERVER = 'https://mainnet-api.algonode.cloud';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';
const AMINA_ASSET_ID = 1107424865;

exports.handler = async (event, context) => {
  // CORS headers
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
    const { amount, toAddress, wallet } = JSON.parse(event.body || '{}');

    // Validation
    if (!amount || !toAddress || !wallet) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: amount, toAddress, wallet' 
        })
      };
    }

    if (amount <= 0 || amount > 1000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid withdrawal amount' 
        })
      };
    }

    // Get casino wallet private key from environment variable
    const casinoMnemonic = process.env.CASINO_WALLET_MNEMONIC;
    if (!casinoMnemonic) {
      console.error('Casino wallet mnemonic not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Withdrawal service temporarily unavailable' 
        })
      };
    }

    // Initialize Algorand client
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
    
    // Recover casino wallet account
    const casinoAccount = algosdk.mnemonicToSecretKey(casinoMnemonic);
    console.log('Casino wallet address:', casinoAccount.addr);

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Convert amount to micro units (8 decimals)
    const amountMicroUnits = Math.floor(amount * 100000000);

    // Create asset transfer transaction
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: casinoAccount.addr,
      to: toAddress,
      amount: amountMicroUnits,
      assetIndex: AMINA_ASSET_ID,
      suggestedParams: suggestedParams,
      note: algosdk.encodeObj(`Casino withdrawal: ${amount} AMINA`)
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(casinoAccount.sk);

    // Submit transaction to network
    const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = txResponse.txId;

    console.log('Transaction submitted:', txId);

    // Wait for confirmation (up to 5 rounds)
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 5);
    
    if (confirmedTxn['confirmed-round']) {
      console.log('Transaction confirmed in round:', confirmedTxn['confirmed-round']);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          txId: txId,
          amount: amount,
          toAddress: toAddress,
          confirmedRound: confirmedTxn['confirmed-round'],
          message: `Successfully sent ${amount} AMINA to ${toAddress}`
        })
      };
    } else {
      throw new Error('Transaction failed to confirm');
    }

  } catch (error) {
    console.error('Withdrawal error:', error);
    
    // Return different error messages based on error type
    let errorMessage = 'Withdrawal failed';
    
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Casino wallet has insufficient AMINA balance';
    } else if (error.message?.includes('invalid address')) {
      errorMessage = 'Invalid wallet address';
    } else if (error.message?.includes('asset not opted in')) {
      errorMessage = 'Wallet must opt-in to AMINA asset first';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Transaction timeout - please try again';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.message,
        refund: true // Signal frontend to refund credits
      })
    };
  }
};
