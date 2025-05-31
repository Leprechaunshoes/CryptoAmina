// monitor-deposits.js - API CALLS FIXED
const algosdk=require('algosdk');

const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';

async function addCreditsViaAPI(wallet, amount, txnId) {
  try {
    const response = await fetch('https://cryptoamina.netlify.app/.netlify/functions/casino-credits', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'add_credits', wallet: wallet, amount: amount, txnId: txnId})
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
}

exports.handler=async(event,context)=>{
if(event.httpMethod==='OPTIONS'){
return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'},
body:''
};
}

try{
const now=Date.now();
const txns=await scanWalletTransactions();
let processed=0;
let creditedAmounts=[];

for(const txn of txns){
const twoHoursAgo = now - (2*60*60*1000);
if(txn.timestamp <= twoHoursAgo)continue;
if(txn.assetId!==AMINA_ID || txn.receiver!==CASINO_ADDR)continue;

const amount = Math.ceil((txn.amount/100000000) * 100000000) / 100000000;

// API CALL TO ADD CREDITS
const success = await addCreditsViaAPI(txn.sender, amount, txn.id);
if(success){
creditedAmounts.push({amount,wallet:txn.sender,txnId:txn.id});
processed++;
}
}

return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({
success:true,
processed,
credits:creditedAmounts,
message:processed>0?`Credited ${processed} deposits`:'No new deposits'
})
};

}catch(error){
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:error.message})
};
}
};

async function scanWalletTransactions(){
try{
const params={limit:100,'asset-id':AMINA_ID,'tx-type':'axfer'};
const txnResponse=await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${CASINO_ADDR}/transactions?${new URLSearchParams(params)}`);
const data=await txnResponse.json();
if(!data.transactions)return [];

return data.transactions
.filter(tx=>tx['asset-transfer-transaction']&&tx['asset-transfer-transaction'].receiver===CASINO_ADDR)
.map(tx=>({
id:tx.id,
amount:tx['asset-transfer-transaction'].amount,
assetId:tx['asset-transfer-transaction']['asset-id'],
sender:tx.sender,
receiver:tx['asset-transfer-transaction'].receiver,
timestamp:tx['round-time']*1000
}))
.sort((a,b)=>b.timestamp-a.timestamp);
}catch(error){
return[];
}
}