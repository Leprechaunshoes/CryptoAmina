// netlify/functions/process-bet.js
// REAL AMINA TOKEN TRANSACTION PROCESSOR - 8 DECIMALS

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
      body: JSON.stringify({ 
        success: false,
        error: 'Method not allowed' 
      })
    };
  }

  try {
    const { action, playerWallet, amount, gameResult } = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!action) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Missing action parameter' 
        })
      };
    }

    // Get network parameters
    const params = await algodClient.getTransactionParams().do();
    
    let transaction;
    let response = {};

    switch (action) {
      case 'place_bet':
        // Validate inputs for betting
        if (!playerWallet || !amount) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Missing playerWallet or amount for place_bet' 
            })
          };
        }

        // Validate wallet address format
        if (playerWallet.length !== 58) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Invalid wallet address format' 
            })
          };
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Invalid amount - must be positive number' 
            })
          };
        }

        // Check if player has opted into AMINA asset
        try {
          const accountInfo = await algodClient.accountInformation(playerWallet).do();
          const hasAminaAsset = accountInfo.assets?.some(asset => asset['asset-id'] === AMINA_ASSET_ID);
          
          if (!hasAminaAsset) {
            return {
              statusCode: 400,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ 
                success: false,
                error: 'Player wallet not opted into AMINA asset. Please add AMINA to your wallet first.' 
              })
            };
          }

          // Check if player has sufficient balance
          const aminaAsset = accountInfo.assets.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
          const playerBalance = aminaAsset.amount / 100000000; // Convert from micro units
          
          if (playerBalance < amount) {
            return {
              statusCode: 400,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ 
                success: false,
                error: `Insufficient AMINA balance. Have: ${playerBalance.toFixed(8)}, Need: ${amount.toFixed(8)}` 
              })
            };
          }
        } catch (accountError) {
          console.error('Account check error:', accountError);
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Could not verify player account. Check wallet address.' 
            })
          };
        }

        // Create transaction to move AMINA from player to casino
        try {
          transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
            playerWallet,              // from
            CASINO_WALLET,            // to  
            undefined,                // close remainder to
            undefined,                // revocation target
            Math.round(amount * 100000000), // amount (convert to 8 decimal places)
            new Uint8Array(Buffer.from(`AMINA Casino Deposit: ${amount}`)), // note
            AMINA_ASSET_ID,          // asset ID
            params                    // suggested params
          );
        } catch (txnError) {
          console.error('Transaction creation error:', txnError);
          return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Failed to create transaction' 
            })
          };
        }
        
        response = {
          success: true,
          message: `🎰 Bet transaction created: ${amount} AMINA`,
          transaction: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
          amount: amount,
          from: playerWallet,
          to: CASINO_WALLET,
          type: 'bet',
          txnId: transaction.txID()
        };
        break;

      case 'process_win':
        // Validate inputs for winnings
        if (!playerWallet || !amount) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Missing playerWallet or amount for process_win' 
            })
          };
        }

        // NOTE: This would require the casino's private key to sign
        // For now, this is a placeholder - in production you'd need secure key management
        response = {
          success: false,
          error: 'Win processing requires casino private key - not implemented for security',
          message: 'This feature requires secure backend wallet management'
        };
        break;

      case 'check_balance':
        // Validate wallet address
        if (!playerWallet) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false,
              error: 'Missing playerWallet for balance check' 
            })
          };
        }

        if (playerWallet === 'test') {
          // Return test data for backend testing
          response = {
            success: true,
            balance: 12.34567890,
            wallet: 'test',
            message: '💰 Test Balance: 12.34567890 AMINA'
          };
          break;
        }

        // Check player's AMINA balance
        try {
          const accountInfo = await algodClient.accountInformation(playerWallet).do();
          const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
          const balance = aminaAsset ? aminaAsset.amount / 100000000 : 0; // 8 decimals
          
          response = {
            success: true,
            balance: balance,
            wallet: playerWallet,
            message: `💰 Balance: ${balance.toFixed(8)} AMINA`,
            hasAminaAsset: !!aminaAsset
          };
        } catch (balanceError) {
          console.error('Balance check error:', balanceError);
          response = {
            success: false,
            error: 'Could not fetch balance - check wallet address',
            wallet: playerWallet
          };
        }
        break;

      default:
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: false,
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
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Transaction processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};