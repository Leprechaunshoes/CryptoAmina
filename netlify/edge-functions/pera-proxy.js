export default async (request, context) => {
  try {
    // Fetch the Pera Wallet script from unpkg
    const response = await fetch('https://unpkg.com/@perawallet/connect/dist/index.umd.js');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const script = await response.text();
    
    // Return the script with proper headers
    return new Response(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(`console.error('Failed to load Pera Wallet: ${error.message}');`, {
      status: 500,
      headers: {
        'Content-Type': 'application/javascript'
      }
    });
  }
};