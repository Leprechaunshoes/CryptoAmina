// AMINA CASINO - REAL TRANSACTION MONITORING
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
const pending=getPendingDeposits();
const activePending=pending.filter(p=>now-new Date(p.timestamp).getTime()<EXPIRE_TIME);

if(activePending.length===0){
return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,message:'No pending deposits',processed:0,pending:0})
};
}

const txns=await scanWalletTransactions();
let processed=0;

for(const txn of txns){
if(processedTxns.has(txn.id))continue;
if(txn.timestamp<=lastCheck)continue;
if(txn.assetId!==AMINA_ID)continue;
if(txn.receiver!==CASINO_ADDR)continue;

const amount=txn.amount/100000000;
const match=activePending.find(p=>
Math.abs(p.amount-amount)<TOLERANCE&&
!p.processed
);

if(match){
await creditUser(match,amount,txn.id);
processed++;
processedTxns.add(txn.id);
console.log(`✅ Processed deposit: ${amount} AMINA for ${match.wallet.slice(0,8)}...`);
}
}

cleanupExpired(activePending);
lastCheck=now;

return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({
success:true,
processed,
pending:activePending.length,
lastCheck:new Date(lastCheck).toISOString()
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
const response=await client.accountInformation(CASINO_ADDR).do();
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

function getPendingDeposits(){
// In production, this would query your database
// For now, simulate with local storage pattern
return[];
}

async function creditUser(deposit,amount,txnId){
try{
// This would update your database to credit the user
// For now, just mark as processed
deposit.processed=true;
deposit.txnId=txnId;
deposit.processedAt=new Date().toISOString();

// In real implementation, you'd:
// 1. Update user's casino credits in database
// 2. Add transaction record
// 3. Notify user (email/push notification)
// 4. Update pending deposits list

console.log(`💰 Credited ${amount} AMINA to ${deposit.wallet} - TX: ${txnId.slice(0,8)}...`);
return true;

}catch(error){
console.error('Credit error:',error);
return false;
}
}

function cleanupExpired(pending){
const now=Date.now();
const expired=pending.filter(p=>
now-new Date(p.timestamp).getTime()>=EXPIRE_TIME&&
!p.processed
);

expired.forEach(p=>{
console.log(`🕒 Expired deposit: ${p.amount} AMINA from ${p.wallet.slice(0,8)}...`);
// Mark as expired in database
});

return expired.length;
}