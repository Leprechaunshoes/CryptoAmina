// netlify/functions/hello-casino.js
// Your first serverless function for Amina Casino!

exports.handler = async (event, context) => {
  // Log the request (you'll see this in Netlify logs)
  console.log('🚀 Amina Casino function called!', event.httpMethod);
  
  // Handle different HTTP methods
  if (event.httpMethod === 'OPTIONS') {
    // Handle CORS preflight
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    // Simple GET request - just return casino info
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '🎰 Amina Casino Backend is LIVE!',
        timestamp: new Date().toISOString(),
        games: ['Cosmic Chaos', 'Quantum Plinko', 'Galaxy Blackjack', 'Cosmic Hi-Lo', 'Nebula Dice'],
        status: 'cosmic'
      })
    };
  }

  if (event.httpMethod === 'POST') {
    // Handle POST requests with data
    let requestData = {};
    
    try {
      // Parse the request body
      requestData = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          success: false
        })
      };
    }

    // Echo back the data with some casino flair
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '🌌 POST received by Amina Casino backend!',
        receivedData: requestData,
        timestamp: new Date().toISOString(),
        response: 'Your backend is working perfectly! Ready for blockchain integration! 🚀'
      })
    };
  }

  // Handle unsupported methods
  return {
    statusCode: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'Method not allowed',
      supportedMethods: ['GET', 'POST']
    })
  };
};