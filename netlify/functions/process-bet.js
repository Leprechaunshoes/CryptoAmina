// process-bet.js - BULLETPROOF BET PROCESSOR
const algosdk=require('algosdk');
const client=new algosdk.Algodv2('','https://mainnet-api.algonode.cloud','');
const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';
const MAX_BET=parseFloat(process.env.MAX_BET||'100');
const MIN_BET=parseFloat(process.env.MIN_BET||'0.01');

exports.handler=async(event,context)=>{
if(event.httpMethod==='OPTIONS')return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'},body:''};
if(event.httpMethod!=='POST')return{statusCode:405,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Method not allowed'})};
try{
const{action,playerWallet,amount,gameType}=JSON.parse(event.body||'{}');
if(!action)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Missing action'})};
console.log(`🎯 Bet action: ${action} | Game: ${gameType||'unknown'}`);
const params=await client.getTransactionParams().do();let response={};
switch(action){
case'create_bet':
if(!playerWallet||!amount||playerWallet.length!==58||isNaN(amount)||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet or amount'})};
}
if(amount<MIN_BET||amount>MAX_BET){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:`Bet must be between ${MIN_BET} and ${MAX_BET} AMINA`})};
}
console.log(`🎰 Creating bet: ${amount} AMINA from ${playerWallet} for ${gameType||'game'}`);
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
if(!asset)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Wallet not opted into AMINA - visit https://app.vestige.fi/asset/1107424865'})};
const bal=asset.amount/100000000;
if(bal<amount)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:`Insufficient balance. Have: ${bal.toFixed(8)}, Need: ${amount.toFixed(8)}`})};
console.log(`✅ Wallet validated: ${bal.toFixed(8)} AMINA available`);
}catch(e){
console.error('❌ Wallet validation error:',e);
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid or non-existent wallet address'})};
}
const noteText=gameType?`AMINA ${gameType} Bet: ${amount}`:`AMINA Casino Bet: ${amount}`;
const txn=algosdk.makeAssetTransferTxnWithSuggestedParams(playerWallet,CASINO_ADDR,undefined,undefined,Math.round(amount*100000000),
new Uint8Array(Buffer.from(noteText)),AMINA_ID,params);
console.log(`📝 Bet transaction created successfully`);
response={success:true,message:`Bet transaction created: ${amount} AMINA`,
transaction:Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),amount,from:playerWallet,to:CASINO_ADDR,type:'bet',game:gameType||'casino'};
break;

case'validate_bet':
if(!playerWallet||!amount||playerWallet.length!==58||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet or amount'})};
}
console.log(`🔍 Validating bet: ${amount} AMINA from ${playerWallet}`);
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
if(!asset){
response={success:false,valid:false,error:'Wallet not opted into AMINA',optInUrl:'https://app.vestige.fi/asset/1107424865'};
}else{
const bal=asset.amount/100000000;
const canBet=bal>=amount&&amount>=MIN_BET&&amount<=MAX_BET;
response={success:true,valid:canBet,balance:bal,minBet:MIN_BET,maxBet:MAX_BET,
message:canBet?`Valid bet: ${amount} AMINA`:`Invalid bet amount or insufficient balance`};
}
}catch(e){
console.error('❌ Bet validation error:',e);
response={success:false,valid:false,error:'Wallet validation failed'};
}
break;

case'check_balance':
if(!playerWallet||playerWallet.length!==58)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet address'})};
if(playerWallet==='test'){response={success:true,balance:12.34567890,wallet:'test',message:'Test balance: 12.34567890 AMINA'};break;}
console.log(`💰 Checking balance for: ${playerWallet}`);
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
const balance=asset?asset.amount/100000000:0;
console.log(`✅ Balance: ${balance.toFixed(8)} AMINA`);
response={success:true,balance,wallet:playerWallet,optedIn:!!asset,message:asset?`Balance: ${balance.toFixed(8)} AMINA`:'Wallet needs AMINA opt-in'};
}catch(e){
console.error('❌ Balance check error:',e);
response={success:false,error:'Could not fetch balance - wallet may not exist'};
}
break;

case'get_limits':
response={success:true,limits:{minBet:MIN_BET,maxBet:MAX_BET,assetId:AMINA_ID,casinoAddress:CASINO_ADDR,
message:`Bet limits: ${MIN_BET} - ${MAX_BET} AMINA`}};
break;

case'validate_wallet':
if(!playerWallet||playerWallet.length!==58)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet format'})};
console.log(`🔍 Validating wallet: ${playerWallet}`);
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
const balance=asset?asset.amount/100000000:0;
response={success:true,valid:true,optedIn:!!asset,balance:balance,assetId:AMINA_ID,
message:asset?`Wallet ready: ${balance.toFixed(8)} AMINA`:'Wallet exists but needs AMINA opt-in',
optInUrl:asset?null:'https://app.vestige.fi/asset/1107424865'};
}catch(e){
console.error('❌ Wallet validation error:',e);
response={success:false,valid:false,error:'Wallet does not exist or network error'};
}
break;

case'estimate_gas':
if(!playerWallet||playerWallet.length!==58)return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Valid wallet required'})};
console.log(`⛽ Estimating transaction costs...`);
try{
const suggestedParams=await client.getTransactionParams().do();
const estimatedFee=suggestedParams.fee||1000;
const algoFee=estimatedFee/1000000;
response={success:true,fee:{microAlgos:estimatedFee,algos:algoFee,message:`Estimated fee: ${algoFee.toFixed(6)} ALGO`}};
}catch(e){
console.error('❌ Gas estimation error:',e);
response={success:false,error:'Could not estimate transaction fee'};
}
break;

default:
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Invalid action',supportedActions:['create_bet','validate_bet','check_balance','get_limits','validate_wallet','estimate_gas']})};
}
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},body:JSON.stringify(response)};
}catch(error){
console.error('💥 Bet processing error:',error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},
body:JSON.stringify({success:false,error:'Internal server error',timestamp:new Date().toISOString()})};
}
};