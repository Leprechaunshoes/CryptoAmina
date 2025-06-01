// casino-withdraw.js - BULLETPROOF WITHDRAWAL SYSTEM
const algosdk=require('algosdk');
const ALGOD_SERVER='https://mainnet-api.algonode.cloud';
const ALGOD_TOKEN='';const ALGOD_PORT='';const AMINA_ASSET_ID=1107424865;

exports.handler=async(event,context)=>{
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'};
if(event.httpMethod==='OPTIONS')return{statusCode:200,headers,body:''};
if(event.httpMethod!=='POST')return{statusCode:405,headers,body:JSON.stringify({success:false,error:'Method not allowed'})};
try{
const{amount,toAddress,wallet}=JSON.parse(event.body||'{}');
console.log(`💸 Withdrawal request: ${amount} AMINA to ${toAddress}`);
if(!amount||!toAddress||!wallet){
return{statusCode:400,headers,body:JSON.stringify({success:false,error:'Missing required fields: amount, toAddress, wallet'})};
}
if(amount<=0||amount>1000){
return{statusCode:400,headers,body:JSON.stringify({success:false,error:'Invalid withdrawal amount (0.00000001-1000 AMINA)'})};
}
if(toAddress.length!==58){
return{statusCode:400,headers,body:JSON.stringify({success:false,error:'Invalid Algorand address format'})};
}
const casinoMnemonic=process.env.CASINO_PRIVATE_KEY;
if(!casinoMnemonic){
console.error('❌ Casino wallet not configured');
return{statusCode:500,headers,body:JSON.stringify({success:false,error:'Withdrawal service temporarily unavailable'})};
}
console.log(`🔑 Initializing casino wallet...`);
const algodClient=new algosdk.Algodv2(ALGOD_TOKEN,ALGOD_SERVER,ALGOD_PORT);
const casinoAccount=algosdk.mnemonicToSecretKey(casinoMnemonic);
console.log(`💰 Casino wallet: ${casinoAccount.addr}`);
console.log(`🔍 Checking casino balance...`);
const accountInfo=await algodClient.accountInformation(casinoAccount.addr).do();
const aminaAsset=accountInfo.assets?.find(a=>a['asset-id']===AMINA_ASSET_ID);
if(!aminaAsset||aminaAsset.amount<amount*100000000){
console.error(`❌ Insufficient casino funds: ${aminaAsset?aminaAsset.amount/100000000:0} AMINA`);
return{statusCode:500,headers,body:JSON.stringify({success:false,error:'Casino insufficient funds - contact support',refund:false})};
}
console.log(`✅ Casino balance sufficient: ${aminaAsset.amount/100000000} AMINA`);
console.log(`🔍 Checking destination wallet...`);
try{
const destInfo=await algodClient.accountInformation(toAddress).do();
const destAmina=destInfo.assets?.find(a=>a['asset-id']===AMINA_ASSET_ID);
if(!destAmina){
console.error(`❌ Destination wallet not opted into AMINA`);
return{statusCode:400,headers,body:JSON.stringify({success:false,error:'Wallet must opt-in to AMINA asset first',refund:true})};
}
console.log(`✅ Destination wallet ready`);
}catch(destError){
console.error(`❌ Invalid destination wallet:`,destError.message);
return{statusCode:400,headers,body:JSON.stringify({success:false,error:'Invalid or non-existent wallet address',refund:true})};
}
console.log(`📝 Creating withdrawal transaction...`);
const suggestedParams=await algodClient.getTransactionParams().do();
const amountMicroUnits=Math.floor(amount*100000000);
const txn=algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
from:casinoAccount.addr,to:toAddress,amount:amountMicroUnits,assetIndex:AMINA_ASSET_ID,suggestedParams:suggestedParams,
note:algosdk.encodeObj(`Casino withdrawal: ${amount} AMINA`)
});
console.log(`✍️ Signing transaction...`);
const signedTxn=txn.signTxn(casinoAccount.sk);
console.log(`📡 Broadcasting transaction...`);
const txResponse=await algodClient.sendRawTransaction(signedTxn).do();
const txId=txResponse.txId;
console.log(`🚀 Transaction submitted: ${txId}`);
console.log(`⏳ Waiting for confirmation...`);
const confirmedTxn=await algosdk.waitForConfirmation(algodClient,txId,5);
if(confirmedTxn['confirmed-round']){
console.log(`✅ Transaction confirmed in round: ${confirmedTxn['confirmed-round']}`);
return{statusCode:200,headers,body:JSON.stringify({
success:true,txId:txId,amount:amount,toAddress:toAddress,confirmedRound:confirmedTxn['confirmed-round'],
message:`Successfully sent ${amount} AMINA to ${toAddress.slice(0,4)}...${toAddress.slice(-4)}`
})};
}else{
throw new Error('Transaction failed to confirm within timeout');
}
}catch(error){
console.error('💥 Withdrawal error:',error);
let errorMessage='Withdrawal failed';let refund=true;
if(error.message?.includes('insufficient funds')){
errorMessage='Casino wallet has insufficient AMINA balance';refund=false;
}else if(error.message?.includes('invalid address')||error.message?.includes('non-existent')){
errorMessage='Invalid wallet address';refund=true;
}else if(error.message?.includes('asset not opted in')||error.message?.includes('opt-in')){
errorMessage='Wallet must opt-in to AMINA asset first';refund=true;
}else if(error.message?.includes('timeout')||error.message?.includes('confirm')){
errorMessage='Transaction timeout - funds may still be processed';refund=false;
}else if(error.message?.includes('fee')||error.message?.includes('minimum')){
errorMessage='Transaction fee error - please try again';refund=true;
}else if(error.response?.status===429){
errorMessage='Network congestion - please try again in a few minutes';refund=true;
}
return{statusCode:500,headers,body:JSON.stringify({success:false,error:errorMessage,details:error.message,refund:refund,timestamp:new Date().toISOString()})};
}
};