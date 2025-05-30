// AMINA CASINO - REAL TRANSACTION MONITORING WITH CREDITING
const algosdk=require('algosdk');
const client=new algosdk.Algodv2('','https://mainnet-api.algonode.cloud','');
const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';
const TOLERANCE=0.00000001;
const EXPIRE_TIME=30*60*1000; // 30 minutes

let processedTxns=new Set();
let lastCheck=Date.now()-600000; // Start 10 min ago

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
if(processedTxns.has(txn.id))continue;
if(txn.timestamp<=lastCheck)continue;
if(txn.assetId!==AMINA_ID)continue;
if(txn.receiver!==CASINO_ADDR)continue;

const amount=txn.amount/100000000;

// Store credit information for frontend to retrieve
const creditRecord={
amount:amount,
wallet:txn.sender,
txnId:txn.id,
timestamp:now,
processed:true
};

// Store in a way frontend can access (using simple storage)
const existingCredits=getStoredCredits();
existingCredits.push(creditRecord);
storeCredits(existingCredits);

creditedAmounts.push({amount,wallet:txn.sender,txnId:txn.id});
processed++;
processedTxns.add(txn.id);

console.log(`✅ Processed deposit: ${amount} AMINA from ${txn.sender.slice(0,8)}... - TX: ${txn.id.slice(0,8)}...`);
}

lastCheck=now;

return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({
success:true,
processed,
credits:creditedAmounts,
lastCheck:new Date(lastCheck).toISOString(),
message:processed>0?`Processed ${processed} deposits`:'No new deposits'
})
};

}catch(error){
console.error('Monitor error:',error);
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:error.message})
};
}
};

async function scanWalletTransactions(){
try{
const params={
limit:50,
'asset-id':AMINA_ID,
'tx-type':'axfer'
};

const txnResponse=await fetch(
`https://mainnet-idx.algonode.cloud/v2/accounts/${CASINO_ADDR}/transactions?${new URLSearchParams(params)}`
);
const data=await txnResponse.json();

return data.transactions
.filter(tx=>tx['asset-transfer-transaction']&&tx['asset-transfer-transaction'].receiver===CASINO_ADDR)
.map(tx=>({
id:tx.id,
amount:tx['asset-transfer-transaction'].amount,
assetId:tx['asset-transfer-transaction']['asset-id'],
sender:tx.sender,
receiver:tx['asset-transfer-transaction'].receiver,
timestamp:tx['round-time']*1000,
note:tx.note?Buffer.from(tx.note,'base64').toString():''
}))
.sort((a,b)=>b.timestamp-a.timestamp);

}catch(error){
console.error('Transaction scan error:',error);
return[];
}
}

function getStoredCredits(){
// In production, this would be a database
// For now, use a simple in-memory store that persists during function lifetime
if(!global.aminaCasinoCredits){
global.aminaCasinoCredits=[];
}
return global.aminaCasinoCredits;
}

function storeCredits(credits){
global.aminaCasinoCredits=credits;
// Keep only last 100 records to prevent memory issues
if(credits.length>100){
global.aminaCasinoCredits=credits.slice(-100);
}
}