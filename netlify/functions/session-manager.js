exports.handler = async () => ({
  statusCode: 200,
  headers: {'Access-Control-Allow-Origin': '*'},
  body: JSON.stringify({success: false, error: 'disabled'})
});