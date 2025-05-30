// BULLETPROOF AMINA CASINO - SECURE HOT WALLET
const algosdk=require('algosdk');
const client=new algosdk.Algodv2('','https://mainnet-api.algonode.cloud','');
const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';
const CASINO_KEY=process.env.CASINO_PRIVATE_KEY;
const DAILY_LIM=parseFloat(process.env.DAILY_LIMIT||'1000');
const MAX_WITH=parseFloat(process.env.MAX_WITHDRAWAL||'100');
const MIN_WITH=parseFloat(process.env.MIN_WITHDRAWAL||'0.1');
const limits=new Map();
const daily=new Map();

function checkLimit(wallet){
const now=Date.now();
const day=new Date().toDateString();
const last=limits.get(wallet)||0;
const dayTotal=daily.get(`${wallet}-${day}`)||0;
if(now-last<300000)return{ok:false,reason:'Rate limit: 1 per 5 minutes'};
return{ok:true,dayTotal};
}

function updateLimit(wallet,amt){
const now=Date.now();
const day=new Date().toDateString();
limits.set(wallet,now);
const curr=daily.get(`${wallet}-${day}`)||0;
daily.set(`${wallet}-${day}`,curr+amt);
}

exports.handler=async(event,context)=>{
if(event.httpMethod==='OPTIONS'){
return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'},
body:''
};
}
if(event.httpMethod!=='POST'){
return{
statusCode:405,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Method not allowed'})
};
}
try{
const{action,playerWallet,amount}=JSON.parse(event.body||'{}');
if(!action){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Missing action'})
};
}
const params=await client.getTransactionParams().do();
let response={};
switch(action){
case 'place_bet':
if(!playerWallet||!amount||playerWallet.length!==58||isNaN(amount)||amount<=0){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Invalid wallet or amount'})
};
}
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
if(!asset){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Wallet not opted into AMINA'})
};
}
const bal=asset.amount/100000000;
if(bal<amount){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:`Insufficient balance. Have: ${bal.toFixed(8)}, Need: ${amount.toFixed(8)}`})
};
}
}catch(e){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Invalid wallet address'})
};
}
const txn=algosdk.makeAssetTransferTxnWithSuggestedParams(
playerWallet,CASINO_ADDR,undefined,undefined,
Math.round(amount*100000000),
new Uint8Array(Buffer.from(`AMINA Casino Deposit: ${amount}`)),
AMINA_ID,params
);
response={
success:true,
message:`Deposit transaction created: ${amount} AMINA`,
transaction:Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
amount,from:playerWallet,to:CASINO_ADDR,type:'deposit'
};
break;
case 'process_withdrawal':
if(!CASINO_KEY){
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Casino wallet not configured'})
};
}
if(!playerWallet||!amount||playerWallet.length!==58||amount<MIN_WITH||amount>MAX_WITH){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:`Withdrawal must be between ${MIN_WITH} and ${MAX_WITH} AMINA`})
};
}
const check=checkLimit(playerWallet);
if(!check.ok){
return{
statusCode:429,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:check.reason})
};
}
if(check.dayTotal+amount>DAILY_LIM){
return{
statusCode:429,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:`Daily limit exceeded. Remaining: ${(DAILY_LIM-check.dayTotal).toFixed(8)} AMINA`})
};
}
try{
const acc=algosdk.mnemonicToSecretKey(CASINO_KEY);
const info=await client.accountInformation(acc.addr).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
if(!asset||asset.amount<amount*100000000){
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Casino insufficient funds - contact admin'})
};
}
const txn=algosdk.makeAssetTransferTxnWithSuggestedParams(
acc.addr,playerWallet,undefined,undefined,
Math.round(amount*100000000),
new Uint8Array(Buffer.from(`AMINA Casino Withdrawal: ${amount}`)),
AMINA_ID,params
);
const signed=txn.signTxn(acc.sk);
const{txId}=await client.sendRawTransaction(signed).do();
updateLimit(playerWallet,amount);
response={
success:true,
message:`Withdrawal successful: ${amount} AMINA`,
txId:txId,amount,from:acc.addr,to:playerWallet,type:'withdrawal'
};
}catch(e){
console.error('Withdrawal error:',e);
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Withdrawal failed - try again later'})
};
}
break;
case 'check_balance':
if(!playerWallet){
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Missing wallet address'})
};
}
if(playerWallet==='test'){
response={success:true,balance:12.34567890,wallet:'test',message:'Test balance: 12.34567890 AMINA'};
break;
}
try{
const info=await client.accountInformation(playerWallet).do();
const asset=info.assets?.find(a=>a['asset-id']===AMINA_ID);
const balance=asset?asset.amount/100000000:0;
response={success:true,balance,wallet:playerWallet,message:`Balance: ${balance.toFixed(8)} AMINA`,hasAminaAsset:!!asset};
}catch(e){
response={success:false,error:'Could not fetch balance',wallet:playerWallet};
}
break;
default:
return{
statusCode:400,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Invalid action',supportedActions:['place_bet','process_withdrawal','check_balance']})
};
}
return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},
body:JSON.stringify(response)
};
}catch(error){
console.error('Transaction processing error:',error);
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},
body:JSON.stringify({success:false,error:'Internal server error',timestamp:new Date().toISOString()})
};
}
};