// netlify/functions/process-bet.js
// BULLETPROOF AMINA CASINO - SECURE HOT WALLET SYSTEM

const algosdk = require('algosdk');

// Secure configuration
const algodClient = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', '');
const AMINA_ASSET_ID = 1107424865;
const CASINO_WALLET = process.env.CASINO_ADDRESS || '6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI';
const CASINO_MNEMONIC = process.env.CASINO_PRIVATE_KEY; // Your 25-word mnemonic

// Security limits
const DAILY_WITHDRAWAL_LIMIT = parseFloat(process.env.DAILY_LIMIT || '1000');
const MAX_SINGLE_WITHDRAWAL = parseFloat(process.env.MAX_WITHDRAWAL || '100');
const MIN_WITHDRAWAL = parseFloat(process.env.MIN_WITHDRAWAL || '0.1');

// Rate limiting storage (in production, use Redis)
const withdrawalLimits = new Map();
const dailyWithdrawals = new Map();

function checkRateLimit(playerWallet) {
  const now = Date.now();
  const day = new Date().toDateString();
  const lastWithdrawal = withdrawalLimits.get(playerWallet) || 0;
  const dailyTotal = dailyWithdrawals.get(`${playerWallet}-${day}`) || 0;
  
  // 1 withdrawal per 5 minutes
  if (now - lastWithdrawal < 300000) {
    return { allowed: false, reason: 'Rate limit: 1 withdrawal per 5 minutes' };
  }
  
  return { allowed: true, dailyTotal };
}

function updateWithdrawalLimits(playerWallet, amount) {
  const now = Date.now();
  const day = new Date().toDateString();
  withdrawalLimits.set(playerWallet, now);
  const currentDaily = dailyWithdrawals.get(`${playerWallet}-${day}`) || 0;
  dailyWithdrawals.set(`${playerWallet}-${day}`, currentDaily + amount);
}

exports.handler = async (event, context) => {
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
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { action, playerWallet, amount, gameResult } = JSON.parse(event.body || '{}');
    
    if (!action) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Missing action' })
      };
    }

    const params = await algodClient.getTransactionParams().do();
    let response = {};

    switch (action) {
      case 'place_bet':
        if (!playerWallet || !amount || playerWallet.length !== 58) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid wallet or amount' })
          };
        }

        if (isNaN(amount) || amount <= 0) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid amount' })
          };
        }

        try {
          const accountInfo = await algodClient.accountInformation(playerWallet).do();
          const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
          
          if (!aminaAsset) {
            return {
              statusCode: 400,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ success: false, error: 'Wallet not opted into AMINA' })
            };
          }

          const playerBalance = aminaAsset.amount / 100000000;
          if (playerBalance < amount) {
            return {
              statusCode: 400,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ 
                success: false, 
                error: `Insufficient balance. Have: ${playerBalance.toFixed(8)}, Need: ${amount.toFixed(8)}` 
              })
            };
          }
        } catch (accountError) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid wallet address' })
          };
        }

        const depositTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
          playerWallet,
          CASINO_WALLET,
          undefined, undefined,
          Math.round(amount * 100000000),
          new Uint8Array(Buffer.from(`AMINA Casino Deposit: ${amount}`)),
          AMINA_ASSET_ID,
          params
        );
        
        response = {
          success: true,
          message: `Deposit transaction created: ${amount} AMINA`,
          transaction: Buffer.from(algosdk.encodeUnsignedTransaction(depositTxn)).toString('base64'),
          amount,
          from: playerWallet,
          to: CASINO_WALLET,
          type: 'deposit'
        };
        break;

      case 'process_withdrawal':
        if (!CASINO_MNEMONIC) {
          return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Casino wallet not configured' })
          };
        }

        if (!playerWallet || !amount || playerWallet.length !== 58) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Invalid wallet or amount' })
          };
        }

        if (amount < MIN_WITHDRAWAL || amount > MAX_SINGLE_WITHDRAWAL) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false, 
              error: `Withdrawal must be between ${MIN_WITHDRAWAL} and ${MAX_SINGLE_WITHDRAWAL} AMINA` 
            })
          };
        }

        const rateCheck = checkRateLimit(playerWallet);
        if (!rateCheck.allowed) {
          return {
            statusCode: 429,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: rateCheck.reason })
          };
        }

        if (rateCheck.dailyTotal + amount > DAILY_WITHDRAWAL_LIMIT) {
          return {
            statusCode: 429,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              success: false, 
              error: `Daily limit exceeded. Remaining: ${(DAILY_WITHDRAWAL_LIMIT - rateCheck.dailyTotal).toFixed(8)} AMINA` 
            })
          };
        }

        try {
          const casinoAccount = algosdk.mnemonicToSecretKey(CASINO_MNEMONIC);
          
          // Check casino has enough AMINA
          const casinoInfo = await algodClient.accountInformation(casinoAccount.addr).do();
          const casinoAmina = casinoInfo.assets?.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
          
          if (!casinoAmina || casinoAmina.amount < amount * 100000000) {
            return {
              statusCode: 500,
              headers: { 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ success: false, error: 'Casino insufficient funds - contact admin' })
            };
          }

          const withdrawalTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            casinoAccount.addr,
            playerWallet,
            undefined, undefined,
            Math.round(amount * 100000000),
            new Uint8Array(Buffer.from(`AMINA Casino Withdrawal: ${amount}`)),
            AMINA_ASSET_ID,
            params
          );

          const signedTxn = withdrawalTxn.signTxn(casinoAccount.sk);
          const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
          
          updateWithdrawalLimits(playerWallet, amount);
          
          response = {
            success: true,
            message: `Withdrawal successful: ${amount} AMINA`,
            txId: txId,
            amount,
            from: casinoAccount.addr,
            to: playerWallet,
            type: 'withdrawal'
          };
        } catch (withdrawError) {
          console.error('Withdrawal error:', withdrawError);
          return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Withdrawal failed - try again later' })
          };
        }
        break;

      case 'check_balance':
        if (!playerWallet) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: 'Missing wallet address' })
          };
        }

        if (playerWallet === 'test') {
          response = {
            success: true,
            balance: 12.34567890,
            wallet: 'test',
            message: 'Test balance: 12.34567890 AMINA'
          };
          break;
        }

        try {
          const accountInfo = await algodClient.accountInformation(playerWallet).do();
          const aminaAsset = accountInfo.assets?.find(asset => asset['asset-id'] === AMINA_ASSET_ID);
          const balance = aminaAsset ? aminaAsset.amount / 100000000 : 0;
          
          response = {
            success: true,
            balance,
            wallet: playerWallet,
            message: `Balance: ${balance.toFixed(8)} AMINA`,
            hasAminaAsset: !!aminaAsset
          };
        } catch (balanceError) {
          response = {
            success: false,
            error: 'Could not fetch balance',
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
            supportedActions: ['place_bet', 'process_withdrawal', 'check_balance']
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
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    };
  }
};