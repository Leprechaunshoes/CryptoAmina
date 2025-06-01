// casino-credits.js - BULLETPROOF CREDIT SYSTEM
async function callSessionManager(action,data){
const maxRetries=3;
for(let i=0;i<maxRetries;i++){
try{
const response=await fetch('https://cryptoamina.netlify.app/.netlify/functions/session-manager',{
method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})
});
if(!response.ok)throw new Error(`HTTP ${response.status}`);
return await response.json();
}catch(error){
console.log(`Retry ${i+1}/${maxRetries} failed:`,error.message);
if(i===maxRetries-1)return{success:false,error:error.message};
await new Promise(r=>setTimeout(r,500));
}
}
}

exports.handler=async(event,context)=>{
if(event.httpMethod==='OPTIONS'){
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, GET, OPTIONS'},body:''};
}
if(event.httpMethod!=='POST'){
return{statusCode:405,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Method not allowed'})};
}
try{
const{action,wallet,token,amount}=JSON.parse(event.body||'{}');
console.log(`💳 Credit action: ${action}`);
switch(action){
case'get_balance':
if(token){
console.log(`🔍 Getting balance by token: ${token}`);
const result=await callSessionManager('get_session',{token});
if(result.success){
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,balance:result.balance,wallet:result.wallet,token:result.token,message:`Casino credits: ${result.balance.toFixed(8)} AMINA`})};
}else{
console.log(`❌ Token invalid/expired: ${token}`);
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found',needsRefresh:true})};
}
}
if(wallet){
console.log(`🔄 Creating/restoring session for: ${wallet}`);
const result=await callSessionManager('create_session',{wallet});
if(result.success){
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,balance:result.balance||0,token:result.token,wallet:wallet,message:result.message||'Session ready'})};
}else{
console.error(`❌ Session creation failed for ${wallet}:`,result.error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session creation failed'})};
}
}
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token or wallet required'})};

case'add_credits':
if(!token||!amount||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`💰 Adding ${amount} credits with token: ${token}`);
const addResult=await callSessionManager('add_credits',{token,amount});
if(addResult.success){
console.log(`✅ Credits added: ${addResult.oldBalance} → ${addResult.newBalance}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(addResult)};
}else{
console.error(`❌ Add credits failed:`,addResult.error);
if(addResult.error.includes('Session not found')){
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session expired',needsRefresh:true})};
}
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(addResult)};
}

case'deduct_credits':
if(!token||!amount||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`🎰 Deducting ${amount} credits with token: ${token}`);
const sessionResult=await callSessionManager('get_session',{token});
if(!sessionResult.success){
console.log(`❌ Session not found for deduction: ${token}`);
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found',needsRefresh:true})};
}
if(sessionResult.balance<amount){
console.log(`❌ Insufficient credits: ${sessionResult.balance} < ${amount}`);
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Insufficient credits',balance:sessionResult.balance})};
}
const newBalance=sessionResult.balance-amount;
console.log(`📉 Deducting: ${sessionResult.balance} → ${newBalance}`);
const updateResult=await callSessionManager('update_balance',{token,amount:newBalance});
if(updateResult.success){
console.log(`✅ Credits deducted successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,wallet:sessionResult.wallet,amount:amount,oldBalance:sessionResult.balance,newBalance:newBalance,message:`Deducted ${amount.toFixed(8)} AMINA credits`})};
}else{
console.error(`❌ Balance update failed:`,updateResult.error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Balance update failed'})};
}

case'transfer_credits':
if(!token||!amount||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`🔄 Processing credit transfer: ${amount}`);
const getResult=await callSessionManager('get_session',{token});
if(!getResult.success){
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found',needsRefresh:true})};
}
if(getResult.balance<amount){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Insufficient credits',balance:getResult.balance})};
}
const newBal=getResult.balance-amount;
const transferResult=await callSessionManager('update_balance',{token,amount:newBal});
return{statusCode:transferResult.success?200:500,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify(transferResult.success?{success:true,transferred:amount,newBalance:newBal,message:`Transferred ${amount} credits`}:{success:false,error:'Transfer failed'})};

case'get_stats':
if(!token){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token required'})};
}
console.log(`📊 Getting stats for token: ${token}`);
const statsSession=await callSessionManager('get_session',{token});
if(!statsSession.success){
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found'})};
}
const walletStats=await callSessionManager('get_wallet_stats',{wallet:statsSession.wallet});
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,stats:walletStats.success?walletStats.stats:{currentBalance:statsSession.balance,wallet:statsSession.wallet}})};

case'refresh_session':
if(!wallet||wallet.length!==58){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Valid wallet required'})};
}
console.log(`🔄 Refreshing session for: ${wallet}`);
const refreshResult=await callSessionManager('create_session',{wallet});
return{statusCode:refreshResult.success?200:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(refreshResult)};

default:
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:false,error:'Invalid action',supportedActions:['get_balance','add_credits','deduct_credits','transfer_credits','get_stats','refresh_session']})};
}
}catch(error){
console.error('💥 Casino credits error:',error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Internal server error',timestamp:new Date().toISOString()})};
}
};