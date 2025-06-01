// session-manager.js - BULLETPROOF AUTO-CREATING SESSION SYSTEM
const{createClient}=require('@supabase/supabase-js');
const supabaseUrl='https://smkikgtjcasobbssivoc.supabase.co';
const supabaseKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2lrZ3RqY2Fzb2Jic3Npdm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MjgwMTgsImV4cCI6MjA2NDMwNDAxOH0.LI4bRgP6sSCCJsvGEcwhf2YqLNxXvL7kTql-AkQv4P8';
const supabase=createClient(supabaseUrl,supabaseKey);
function generateToken(){return'tok_'+Math.random().toString(36).substr(2,15)+Date.now().toString(36);}

let tablesCreated=false;

async function ensureTables(){
if(tablesCreated)return true;
try{
console.log('🔧 Creating casino tables...');
await supabase.rpc('exec',{sql:`
CREATE TABLE IF NOT EXISTS casino_sessions (
id SERIAL PRIMARY KEY,
session_token TEXT UNIQUE NOT NULL,
wallet_address TEXT NOT NULL,
balance DECIMAL(20,8) DEFAULT 0,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS processed_transactions (
id SERIAL PRIMARY KEY,
transaction_id TEXT UNIQUE NOT NULL,
wallet_address TEXT NOT NULL,
amount DECIMAL(20,8) NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
`});
console.log('✅ Tables ensured');
tablesCreated=true;
return true;
}catch(error){
console.log('⚠️ Table creation failed, will try manual approach:',error.message);
return false;
}
}

async function safeInsert(table,data){
try{
const{data:result,error}=await supabase.from(table).insert(data).select().single();
if(error)throw error;
return{success:true,data:result};
}catch(error){
if(error.message?.includes('relation')||error.message?.includes('table')||error.code==='42P01'){
console.log(`🔧 Table ${table} missing, creating...`);
await ensureTables();
try{
const{data:result,error:retryError}=await supabase.from(table).insert(data).select().single();
if(retryError)throw retryError;
return{success:true,data:result};
}catch(retryError){
console.error(`❌ Retry insert failed for ${table}:`,retryError);
return{success:false,error:retryError};
}
}
console.error(`❌ Insert failed for ${table}:`,error);
return{success:false,error:error};
}
}

async function safeSelect(table,query){
try{
return await supabase.from(table).select(query.select||'*').eq(query.eq.column,query.eq.value).maybeSingle();
}catch(error){
if(error.message?.includes('relation')||error.message?.includes('table')||error.code==='42P01'){
console.log(`🔧 Table ${table} missing for select, creating...`);
await ensureTables();
try{
return await supabase.from(table).select(query.select||'*').eq(query.eq.column,query.eq.value).maybeSingle();
}catch(retryError){
console.error(`❌ Retry select failed for ${table}:`,retryError);
return{data:null,error:retryError};
}
}
return{data:null,error:error};
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
const{action,wallet,token,amount,txnId}=JSON.parse(event.body||'{}');
console.log(`🔧 Session manager: ${action}`);
switch(action){
case'create_session':
if(!wallet||wallet.length!==58){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet'})};
}
console.log(`🔍 Creating session for: ${wallet}`);
const{data:existing}=await safeSelect('casino_sessions',{eq:{column:'wallet_address',value:wallet}});
if(existing){
console.log(`✅ Session exists: ${existing.session_token}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,token:existing.session_token,balance:parseFloat(existing.balance||0),message:'Session restored'})};
}
const newToken=generateToken();console.log(`🆕 Creating new session: ${newToken}`);
const insertResult=await safeInsert('casino_sessions',{session_token:newToken,wallet_address:wallet,balance:0,created_at:new Date().toISOString()});
if(!insertResult.success){
console.error('❌ Session creation failed:',insertResult.error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session creation failed'})};
}
console.log(`✅ Session created successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,token:newToken,balance:0,message:'New session created'})};

case'get_session':
if(!token){return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token required'})};}
console.log(`🔍 Getting session: ${token}`);
const{data:sessionData}=await safeSelect('casino_sessions',{eq:{column:'session_token',value:token}});
if(!sessionData){
console.log(`❌ Session not found: ${token}`);
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found'})};
}
console.log(`✅ Session found: ${sessionData.wallet_address}, balance: ${sessionData.balance}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,wallet:sessionData.wallet_address,balance:parseFloat(sessionData.balance||0),token:sessionData.session_token})};

case'add_credits':
if(!token||!amount||amount<=0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`💰 Adding ${amount} credits to: ${token}`);
const{data:currentSession}=await safeSelect('casino_sessions',{select:'balance, wallet_address',eq:{column:'session_token',value:token}});
if(!currentSession){
console.log(`❌ Session not found for add credits: ${token}`);
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found'})};
}
const oldBalance=parseFloat(currentSession.balance||0);const newBalance=oldBalance+amount;
console.log(`📈 Balance update: ${oldBalance} → ${newBalance} for ${currentSession.wallet_address}`);
try{
const{data:addData,error:addError}=await supabase.from('casino_sessions').update({balance:newBalance}).eq('session_token',token).select().single();
if(addError)throw addError;
console.log(`✅ Credits added successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,oldBalance:oldBalance,newBalance:parseFloat(addData.balance),amount:amount,message:`Added ${amount} credits`})};
}catch(addError){
console.error('❌ Add credits error:',addError);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Credit update failed'})};
}

case'update_balance':
if(!token||amount<0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`🔄 Updating balance to ${amount} for: ${token}`);
try{
const{data:updateData,error:updateError}=await supabase.from('casino_sessions').update({balance:amount}).eq('session_token',token).select().single();
if(updateError)throw updateError;
console.log(`✅ Balance updated successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,newBalance:parseFloat(updateData.balance),message:`Balance updated to ${amount}`})};
}catch(updateError){
console.error('❌ Update balance error:',updateError);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Balance update failed'})};
}

case'check_transaction':
if(!txnId){return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Transaction ID required'})};}
console.log(`🔍 Checking transaction: ${txnId}`);
const{data:txnCheck}=await safeSelect('processed_transactions',{eq:{column:'transaction_id',value:txnId}});
const isProcessed=!!txnCheck;console.log(`📋 Transaction ${txnId} processed: ${isProcessed}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,processed:isProcessed})};

case'mark_transaction':
if(!txnId||!wallet||!amount){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Missing required fields'})};
}
console.log(`✅ Marking transaction: ${txnId} for ${wallet} (${amount} AMINA)`);
const markResult=await safeInsert('processed_transactions',{transaction_id:txnId,wallet_address:wallet,amount:amount,created_at:new Date().toISOString()});
if(!markResult.success){
console.error('❌ Mark transaction error:',markResult.error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Transaction marking failed'})};
}
console.log(`✅ Transaction marked successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,message:'Transaction marked as processed'})};

case'cleanup_sessions':
console.log(`🧹 Cleaning up old sessions...`);
const dayAgo=new Date(Date.now()-24*60*60*1000).toISOString();
try{
const{error:cleanError}=await supabase.from('casino_sessions').delete().lt('created_at',dayAgo);
if(cleanError)console.error('❌ Cleanup error:',cleanError);else console.log(`✅ Cleaned old sessions`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,message:'Cleanup completed'})};
}catch(error){
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,message:'Cleanup skipped - tables may not exist yet'})};
}

case'get_wallet_stats':
if(!wallet||wallet.length!==58){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet'})};
}
console.log(`📊 Getting stats for: ${wallet}`);
const{data:sessionStats}=await safeSelect('casino_sessions',{select:'balance, created_at',eq:{column:'wallet_address',value:wallet}});
const{data:txnStats}=await safeSelect('processed_transactions',{select:'amount, created_at',eq:{column:'wallet_address',value:wallet}});
const totalDeposits=txnStats?[txnStats].flat().reduce((sum,tx)=>sum+parseFloat(tx.amount||0),0):0;
const stats={
wallet:wallet,currentBalance:sessionStats?parseFloat(sessionStats.balance||0):0,totalDeposits:totalDeposits,
transactionCount:txnStats?[txnStats].flat().length:0,firstSeen:sessionStats?sessionStats.created_at:null
};
console.log(`📈 Stats:`,stats);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,stats:stats})};

default:
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid action'})};
}
}catch(error){
console.error('💥 Session manager error:',error);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Internal server error',details:error.message})};
}
};