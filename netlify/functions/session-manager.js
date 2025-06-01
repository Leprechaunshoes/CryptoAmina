// session-manager.js - BULLETPROOF SESSION SYSTEM
const{createClient}=require('@supabase/supabase-js');
const supabaseUrl='https://smkikgtjcasobbssivoc.supabase.co';
const supabaseKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2lrZ3RqY2Fzb2Jic3Npdm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MjgwMTgsImV4cCI6MjA2NDMwNDAxOH0.LI4bRgP6sSCCJsvGEcwhf2YqLNxXvL7kTql-AkQv4P8';
const supabase=createClient(supabaseUrl,supabaseKey);
function generateToken(){return'tok_'+Math.random().toString(36).substr(2,15)+Date.now().toString(36);}

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
const{data:existing}=await supabase.from('casino_sessions').select('*').eq('wallet_address',wallet).maybeSingle();
if(existing){
console.log(`✅ Session exists: ${existing.session_token}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,token:existing.session_token,balance:parseFloat(existing.balance||0),message:'Session restored'})};
}
const newToken=generateToken();console.log(`🆕 Creating new session: ${newToken}`);
const{data:session,error}=await supabase.from('casino_sessions').insert({session_token:newToken,wallet_address:wallet,balance:0}).select().single();
if(error){console.error('❌ Session creation error:',error);throw error;}
console.log(`✅ Session created successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,token:newToken,balance:0,message:'New session created'})};

case'get_session':
if(!token){return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token required'})};}
console.log(`🔍 Getting session: ${token}`);
const{data:sessionData}=await supabase.from('casino_sessions').select('*').eq('session_token',token).maybeSingle();
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
const{data:currentSession}=await supabase.from('casino_sessions').select('balance, wallet_address').eq('session_token',token).single();
if(!currentSession){
console.log(`❌ Session not found for add credits: ${token}`);
return{statusCode:404,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Session not found'})};
}
const oldBalance=parseFloat(currentSession.balance||0);const newBalance=oldBalance+amount;
console.log(`📈 Balance update: ${oldBalance} → ${newBalance} for ${currentSession.wallet_address}`);
const{data:addData,error:addError}=await supabase.from('casino_sessions').update({balance:newBalance}).eq('session_token',token).select().single();
if(addError){console.error('❌ Add credits error:',addError);throw addError;}
console.log(`✅ Credits added successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,oldBalance:oldBalance,newBalance:parseFloat(addData.balance),amount:amount,message:`Added ${amount} credits`})};

case'update_balance':
if(!token||amount<0){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Token and valid amount required'})};
}
console.log(`🔄 Updating balance to ${amount} for: ${token}`);
const{data:updateData,error:updateError}=await supabase.from('casino_sessions').update({balance:amount}).eq('session_token',token).select().single();
if(updateError){console.error('❌ Update balance error:',updateError);throw updateError;}
console.log(`✅ Balance updated successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},
body:JSON.stringify({success:true,newBalance:parseFloat(updateData.balance),message:`Balance updated to ${amount}`})};

case'check_transaction':
if(!txnId){return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Transaction ID required'})};}
console.log(`🔍 Checking transaction: ${txnId}`);
const{data:txnCheck}=await supabase.from('processed_transactions').select('*').eq('transaction_id',txnId).maybeSingle();
const isProcessed=!!txnCheck;console.log(`📋 Transaction ${txnId} processed: ${isProcessed}`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,processed:isProcessed})};

case'mark_transaction':
if(!txnId||!wallet||!amount){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Missing required fields'})};
}
console.log(`✅ Marking transaction: ${txnId} for ${wallet} (${amount} AMINA)`);
const{error:markError}=await supabase.from('processed_transactions').upsert({transaction_id:txnId,wallet_address:wallet,amount:amount});
if(markError){
console.error('❌ Mark transaction error:',markError);
return{statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:markError.message})};
}
console.log(`✅ Transaction marked successfully`);
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,message:'Transaction marked as processed'})};

case'cleanup_sessions':
console.log(`🧹 Cleaning up old sessions...`);
const dayAgo=new Date(Date.now()-24*60*60*1000).toISOString();
const{data:cleaned,error:cleanError}=await supabase.from('casino_sessions').delete().lt('created_at',dayAgo);
if(cleanError){console.error('❌ Cleanup error:',cleanError);}else{console.log(`✅ Cleaned old sessions`);}
return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:true,message:'Cleanup completed'})};

case'get_wallet_stats':
if(!wallet||wallet.length!==58){
return{statusCode:400,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({success:false,error:'Invalid wallet'})};
}
console.log(`📊 Getting stats for: ${wallet}`);
const{data:sessionStats}=await supabase.from('casino_sessions').select('balance, created_at').eq('wallet_address',wallet).maybeSingle();
const{data:txnStats}=await supabase.from('processed_transactions').select('amount, created_at').eq('wallet_address',wallet);
const totalDeposits=txnStats?txnStats.reduce((sum,tx)=>sum+parseFloat(tx.amount||0),0):0;
const stats={
wallet:wallet,
currentBalance:sessionStats?parseFloat(sessionStats.balance||0):0,
totalDeposits:totalDeposits,
transactionCount:txnStats?txnStats.length:0,
firstSeen:sessionStats?sessionStats.created_at:null
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