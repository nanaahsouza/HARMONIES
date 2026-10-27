import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createApp} from '../src/server/http.ts';
import {Store} from '../src/server/store.ts';
type App=ReturnType<typeof createApp>;
async function listen(app:App){app.server.listen(0,'127.0.0.1');await once(app.server,'listening');const address=app.server.address();assert.ok(address&&typeof address==='object');return `http://127.0.0.1:${address.port}`;}
async function stop(app:App){app.closeStreams();await new Promise<void>(r=>app.server.close(()=>r()));app.store.close();}
async function call(base:string,path:string,data?:unknown,token='',method=data?'POST':'GET'){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:data?JSON.stringify(data):undefined});return {status:r.status,body:await r.json()};
}
async function stream(base:string,code:string,token:string){
 const abort=new AbortController(),r=await fetch(`${base}/api/rooms/${code}/events`,{headers:{Authorization:`Bearer ${token}`},signal:abort.signal});assert.equal(r.status,200);const reader=r.body!.getReader(),decoder=new TextDecoder();let buffer='';
 return {abort,async next(revision=0){const deadline=AbortSignal.timeout(3000);while(true){const at=buffer.indexOf('\n\n');if(at>=0){const event=buffer.slice(0,at);buffer=buffer.slice(at+2);if(event.startsWith('data: ')){const s=JSON.parse(event.slice(6));if(s.revision>=revision)return s;}}else{const {done,value}=await Promise.race([reader.read(),new Promise<never>((_,reject)=>deadline.addEventListener('abort',()=>reject(Error('SSE timeout')),{once:true}))]);assert.equal(done,false);buffer+=decoder.decode(value,{stream:true});}}}};
}
test('M01 duas sessões HTTP independentes: sala, SSE, turno, duplicação, reconexão e persistência',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'harmonies-test-')),database=join(directory,'state.sqlite');let app=createApp({database}),base=await listen(app);let aStream:Awaited<ReturnType<typeof stream>>|undefined,bStream:Awaited<ReturnType<typeof stream>>|undefined;
 try{
  const a=(await call(base,'/api/rooms',{name:'Ana'})).body;const code=a.state.code,path=`/api/rooms/${code}`;assert.match(code,/^[A-Z0-9_-]{12}$/);
  const b=(await call(base,path+'/join',{name:'Bruno'})).body;assert.equal(b.state.seats.length,2);
  assert.equal((await call(base,path+'/join',{name:'Terceiro'})).status,409);
  assert.equal((await call(base,path,undefined,'invalid')).status,401);
  aStream=await stream(base,code,a.token);bStream=await stream(base,code,b.token);assert.equal((await bStream.next()).seats.every((s:{connected:boolean})=>s.connected),true);
  let revision=1;
  async function action(token:string,action:Record<string,unknown>,id=randomUUID(),rev=revision){return call(base,path+'/actions',{id,revision:rev,action},token);}
  assert.equal((await action(a.token,{type:'start'})).body.code,'NOT_READY');
  let result=await action(a.token,{type:'ready',ready:true});assert.equal(result.status,200);revision=result.body.revision;
  result=await action(b.token,{type:'ready',ready:true});revision=result.body.revision;
  result=await action(a.token,{type:'start'});assert.equal(result.status,200);revision=result.body.revision;assert.equal(result.body.catalogStatus.verified,32);
  assert.equal((await action(b.token,{type:'takeTokens',slot:0})).body.code,'NOT_YOUR_TURN');
  const id=randomUUID(),oldRev=revision;result=await action(a.token,{type:'takeTokens',slot:0},id,oldRev);assert.equal(result.status,200);revision=result.body.revision;assert.equal(result.body.game.hand.length,3);
  const duplicate=await action(a.token,{type:'takeTokens',slot:0},id,oldRev);assert.equal(duplicate.body.revision,revision);assert.equal(duplicate.body.game.hand.length,3);
  assert.equal((await action(a.token,{type:'takeTokens',slot:1},id,oldRev)).body.code,'ID_REUSE');
  assert.equal((await action(a.token,{type:'endTurn'},randomUUID(),oldRev)).body.code,'REVISION');
  const synchronized=await bStream.next(revision);assert.equal(synchronized.game.hand.length,3);assert.equal('bag' in synchronized.game,false);assert.equal('deck' in synchronized.game,false);
  assert.equal((await action(a.token,{type:'placeToken',color:result.body.game.hand[0],cell:'999,999'})).body.code,'PLACEMENT');
  const hand=[...result.body.game.hand];for(const [i,color] of hand.entries()){result=await action(a.token,{type:'placeToken',color,cell:`0,${i}`});assert.equal(result.status,200);revision=result.body.revision;}
  result=await action(a.token,{type:'endTurn'});assert.equal(result.status,200);revision=result.body.revision;assert.equal(result.body.game.turn,1);
  const snapshot=await call(base,path,undefined,b.token);assert.equal(snapshot.body.revision,revision);assert.equal(snapshot.body.game.players[0].board['0,0'].stack.length,1);
  bStream.abort.abort();bStream=undefined;const reconnected=await stream(base,code,b.token);bStream=reconnected;assert.equal((await reconnected.next(revision)).revision,revision);
  aStream.abort.abort();aStream=undefined;bStream.abort.abort();bStream=undefined;await stop(app);
  app=createApp({database});base=await listen(app);const restored=await call(base,path,undefined,b.token);assert.equal(restored.status,200);assert.equal(restored.body.revision,revision);assert.equal(restored.body.game.turn,1);
  const replay=await call(base,path+'/actions',{id,revision:oldRev,action:{type:'takeTokens',slot:0}},a.token);assert.equal(replay.body.revision,revision,'recibo sobrevive ao reinício');
 }finally{aStream?.abort.abort();bStream?.abort.abort();await stop(app);rmSync(directory,{recursive:true,force:true});}
});
test('M02 ações concorrentes na mesma revisão: uma só confirmada',async()=>{
 const app=createApp({database:':memory:'}),base=await listen(app);try{
  const {body:a}=await call(base,'/api/rooms',{name:'Alice'}),path=`/api/rooms/${a.state.code}/actions`;
  const results=await Promise.all([true,false].map(ready=>call(base,path,{id:randomUUID(),revision:0,action:{type:'ready',ready}},a.token)));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(app.store.get(a.state.code).revision,1);
 }finally{await stop(app);}
});
test('M03 validação de payload, nome, origem e bloqueio de sala cheia na persistência',async()=>{
 const app=createApp({database:':memory:',origin:'https://example.test'}),base=await listen(app);try{
  assert.equal((await call(base,'/api/rooms',{name:''})).status,400);
  const rejected=await fetch(base+'/api/rooms',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:JSON.stringify({name:'Alice'})});assert.equal(rejected.status,400);
  const {body:a}=await call(base,'/api/rooms',{name:'<script>não executa</script>'});const path=`/api/rooms/${a.state.code}/actions`;
  assert.equal((await call(base,path,{id:'short',revision:0,action:{}},a.token)).status,400);
  assert.equal((await call(base,path,{id:randomUUID(),revision:0,action:{type:'givePoints',score:999}},a.token)).body.code,'NOT_STARTED');
  assert.equal(app.store.get(a.state.code).revision,0);
 }finally{await stop(app);}
});
test('M04 sessão de outra sala não tem acesso; segredo não aparece no estado',()=>{
 const store=new Store(':memory:');try{const a=store.create('A'),b=store.create('B');assert.throws(()=>store.identity(a.room.code,b.token),/inválida/);const visible=JSON.stringify(store.public(a.room,0));assert.equal(visible.includes(a.token),false);assert.equal(visible.includes('token_hash'),false);}finally{store.close();}
});
