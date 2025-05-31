// monitor-deposits.js - TIME WINDOW FIX
const algosdk=require('algosdk');
const fs = require('fs').promises;

const client=new algosdk.Algodv2('','https://mainnet-api.algonode.cloud','');
const AMINA_ID=1107424865;
const CASINO_ADDR=process.env.CASINO_ADDRESS||'UX3PHCY7QNGOHXWNWTZIXK5T3MBDZKYCFN7PAVCT2H4G4JEZKJK6W7UG44';

// SHARED STORAGE FILES
const CREDITS_FILE = '/tmp/casino_credits.json';
const PROCESSED_TXN_FILE = '/tmp/processed_transactions.json';

// EXTENDED TIME WINDOW - Look back 2 hours instead of 10 minutes
let lastCheck=Date.now()-(2*60*60*1000); // 2 hours ago

// LOAD/SAVE CREDITS (same as casino-credits.js)
async function loadCredits() {
  try {
    const data = await fs.readFile(CREDITS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveCredits(credits) {
  try {
    await fs.writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save credits:', error);
    return false;
  }
}

// LOAD/SAVE PROCESSED TRANSACTIONS
async function loadProcessedTxns() {
  try {
    const data = await fs.readFile(PROCESSED_TXN_FILE, 'utf8');
    return new Set(JSON.parse(data));
  } catch (error) {
    return new Set();
  }
}

async function saveProcessedTxns(txnSet) {
  try {
    await fs.writeFile(PROCESSED_TXN_FILE, JSON.stringify([...txnSet]));
    return true;
  } catch (error) {
    console.error('Failed to save processed txns:', error);
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
console.log(`⏭️ Skipping already processed: ${txn.id.slice(0,8)}...`);
continue;
}

// EXTENDED TIME CHECK - Look back 2 hours instead of lastCheck
const twoHoursAgo = now - (2*60*60*1000);
if(txn.timestamp <= twoHoursAgo){
console.log(`⏰ Skipping old transaction: ${txn.id.slice(0,8)}... (${new Date(txn.timestamp).toISOString()})`);
continue;
}

if(txn.assetId!==AMINA_ID){
console.log(`💎 Skipping non-AMINA asset: ${txn.assetId}`);
continue;
}

if(txn.receiver!==CASINO_ADDR){
console.log(`📍 Skipping wrong receiver: ${txn.receiver.slice(0,8)}...`);
continue;
}

// Round UP to be generous
const amount = Math.ceil((txn.amount/100000000) * 100000000) / 100000000;

console.log(`💰 PROCESSING: ${amount} AMINA from ${txn.sender.slice(0,8)}... - TX: ${txn.id.slice(0,8)}...`);

// ADD CREDITS TO USER ACCOUNT
const currentBalance = credits[txn.sender] || 0;
credits[txn.sender] = currentBalance + amount;

// MARK TRANSACTION AS PROCESSED
processedTxns.add(txn.id);

creditedAmounts.push({amount,wallet:txn.sender,txnId:txn.id});
processed++;

console.log(`✅ CREDITED: ${amount} AMINA to ${txn.sender.slice(0,8)}... - New balance: ${credits[txn.sender]}`);
}

// SAVE UPDATED DATA
await saveCredits(credits);
await saveProcessedTxns(processedTxns);

lastCheck=now;

return{
statusCode:200,
headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({
success:true,
processed,
credits:creditedAmounts,
lastCheck:new Date(lastCheck).toISOString(),
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
body:JSON.stringify({success:false,error:error.message})
};
}
};

async function scanWalletTransactions(){
try{
const params={
limit:100, // Increased from 50 to 100
'asset-id':AMINA_ID,
'tx-type':'axfer'
};

const txnResponse=await fetch(
`https://mainnet-idx.algonode.cloud/v2/accounts/${CASINO_ADDR}/transactions?${new URLSearchParams(params)}`
);
const data=await txnResponse.json();

if(!data.transactions) {
console.log('❌ No transactions found in API response');
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