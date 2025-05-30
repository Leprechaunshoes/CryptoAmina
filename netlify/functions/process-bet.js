// netlify/functions/process-bet.js
// REAL AMINA TOKEN TRANSACTION PROCESSOR

const algosdk = require('algosdk');

// Algorand mainnet configuration
const algodClient = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', '');
const AMINA_ASSET_ID = 1107424865;
const CASINO_WALLET = '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, playerWallet, amount, gameResult } = JSON.parse(event.body);
    
    // Get network parameters
    const params = await algodClient.getTransactionParams().do();
    
    let transaction;
    let response = {};

    switch (action) {
      case 'place_bet':
        // Create transaction to move AMINA from player to casino
        transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
          playerWallet,              // from
          CASINO_WALLET,            // to  
          undefined,                // close remainder to
          undefined,                // revocation target
          Math.round(amount * 1000000), // amount (convert to microAMINA)
          undefined,                // note
          AMINA_ASSET_ID,          // asset ID
          params                    // suggested params
        );
        
        response = {
          success: true,
          message: `🎰 Bet placed: ${amount} AMINA`,
          transaction: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
          amount: amount,
          from: playerWallet,
          to: CASINO_WALLET,
          type: 'bet'
        };
        break;

      case 'process_win':
        // Create transaction to send winnings from casino to player
        transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
          CASINO_WALLET,            // from (casino wallet)
          playerWallet,             // to (player)
          undefined,                // close remainder to
          undefined,                // revocation target
          Math.round(amount * 1000000), // amount (convert to microAMINA)
          undefined,                // note
          AMINA_ASSET_ID,          // asset ID
          params                    // suggested params
        );
        
        response = {
          success: true,
          message: `🎉 Winnings: ${amount} AMINA sent to player!`,
          transaction: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
          amount: amount,
          from: CASINO_WALLET,
          to: playerWallet,
          type: 'win',
          gameResult: gameResult
        };
        break;

      case 'check_balance':
        // Check player's AMINA balance
        const accountInfo = await algodClient.accountInformation(playerWallet).do();
        const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
        const balance = aminaAsset ? aminaAsset.amount / 1000000 : 0;
        
        response = {
          success: true,
          balance: balance,
          wallet: playerWallet,
          message: `💰 Balance: ${balance} AMINA`
        };
        break;

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            error: 'Invalid action',
            supportedActions: ['place_bet', 'process_win', 'check_balance']
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
    console.error('Transaction processing error:', error);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Transaction processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};