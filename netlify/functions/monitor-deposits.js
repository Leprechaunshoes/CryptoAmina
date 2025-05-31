// monitor-deposits.js - DIRECT STORAGE FIX
const algosdk=require('algosdk');

const client=new algosdk.Algodv2('','https://mainnet-api.algonode.cloud','');
const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';

// PERSISTENT STORAGE URLs (same as casino-credits)
const CREDITS_URL = 'https://api.jsonbin.io/v3/b/674c0000acd3cb34a8b85c42';
const PROCESSED_TXN_URL = 'https://api.jsonbin.io/v3/b/674c0001e41b4d34e45f7c83';
const JSONBIN_KEY = '$2a$10$Vq3zY6HH.pK8dWxmfN9UXO7qE.M8BQK3p2Y4wZ9A1sN7fT2mL5gR6';

let lastCheck=Date.now()-(2*60*60*1000);

async function loadCredits() {
  try {
    const response = await fetch(`${CREDITS_URL}/latest`, {
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const data = await response.json();
    return data.record || {};
  } catch (error) {
    console.log('Loading credits failed:', error.message);
    return {};
  }
}

async function saveCredits(credits) {
  try {
    const response = await fetch(CREDITS_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify(credits)
    });
    return response.ok;
  } catch (error) {
    console.error('Saving credits failed:', error);
    return false;
  }
}

async function loadProcessedTxns() {
  try {
    const response = await fetch(`${PROCESSED_TXN_URL}/latest`, {
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const data = await response.json();
    return new Set(data.record || []);
  } catch (error) {
    console.log('Loading processed txns failed:', error.message);
    return new Set();
  }
}

async function saveProcessedTxns(txnSet) {
  try {
    const response = await fetch(PROCESSED_TXN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify([...txnSet])
    });
    return response.ok;
  } catch (error) {
    console.error('Saving processed txns failed:', error);
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
const processedTxns = await loadProcessedTxns();
const credits = await loadCredits();
let processed=0;
let creditedAmounts=[];

console.log(`🔍 Scanning ${txns.length} transactions, processed set has ${processedTxns.size} entries`);

for(const txn of txns){
if(processedTxns.has(txn.id)){
console.log(`⏭️ Already processed: ${txn.id.slice(0,8)}...`);
continue;
}

const twoHoursAgo = now - (2*60*60*1000);
if(txn.timestamp <= twoHoursAgo){
console.log(`⏰ Too old: ${txn.id.slice(0,8)}...`);
continue;
}

if(txn.assetId!==AMINA_ID || txn.receiver!==CASINO_ADDR){
console.log(`❌ Wrong asset/receiver: ${txn.id.slice(0,8)}...`);
continue;
}

const amount = Math.ceil((txn.amount/100000000) * 100000000) / 100000000;

console.log(`💰 PROCESSING: ${amount} AMINA from ${txn.sender.slice(0,8)}... - TX: ${txn.id.slice(0,8)}...`);

// DIRECTLY UPDATE CREDITS (no API call)
const currentBalance = credits[txn.sender] || 0;
credits[txn.sender] = currentBalance + amount;

// MARK AS PROCESSED
processedTxns.add(txn.id);

creditedAmounts.push({amount,wallet:txn.sender,txnId:txn.id});
processed++;

console.log(`✅ CREDITED: ${amount} AMINA to ${txn.sender.slice(0,8)}... - New balance: ${credits[txn.sender]}`);
}

// SAVE BOTH CREDITS AND PROCESSED TXNS
const creditsSaved = await saveCredits(credits);
const txnsSaved = await saveProcessedTxns(processedTxns);

console.log(`💾 Credits saved: ${creditsSaved}, Txns saved: ${txnsSaved}`);

return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({
success:true,
processed,
credits:creditedAmounts,
creditsSaved,
txnsSaved,
totalTransactionsScanned: txns.length,
processedSetSize: processedTxns.size,
message:processed>0?`Credited ${processed} deposits`:'No new deposits'
})
};

}catch(error){
console.error('Monitor error:',error);
return{
statusCode:500,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:error.message,stack:error.stack})
};
}
};

async function scanWalletTransactions(){
try{
const params={
limit:100,
'asset-id':AMINA_ID,
'tx-type':'axfer'
};

const txnResponse=await fetch(
`https://mainnet-idx.algonode.cloud/v2/accounts/${CASINO_ADDR}/transactions?${new URLSearchParams(params)}`
);
const data=await txnResponse.json();

if(!data.transactions) {
console.log('❌ No transactions in API response');
return [];
}

console.log(`📊 API returned ${data.transactions.length} transactions`);

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