import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {createApp} from '../src/server/http.ts';

test('H01 criação HTTP salva lado e Pulsar e inicia com as opções escolhidas',async()=>{
 const app=createApp({database:':memory:'});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
 const address=app.server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
 const create=async(data:unknown)=>{const response=await fetch(`${base}/api/rooms`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:response.status,body:await response.json()};};
 try{
  const defaults=await create({name:'Padrão'});assert.equal(defaults.status,201);assert.equal(defaults.body.state.side,'A');assert.equal(defaults.body.state.pulse,false);assert.equal(defaults.body.state.playerCount,2);assert.equal(defaults.body.state.seats[0].avatar,'corvo');
  for(const side of ['A','B'])for(const pulse of [false,true])for(const playerCount of [2,3,4]){
   const avatar=['corvo','lontra','coala','leao'][(playerCount+(pulse?1:0))%4];
   const result=await create({name:'Host',playerCount,side,pulse,avatar});assert.equal(result.status,201);
   const {state,token}=result.body,code=state.code;
   assert.equal(state.side,side);assert.equal(state.pulse,pulse);assert.equal(state.playerCount,playerCount);assert.equal(state.game,null);assert.equal(state.catalog.length,pulse?42:32);
   assert.equal(state.seats[0].avatar,avatar);assert.equal(state.seats.length,1);assert.equal(state.seats[0].ready,false);
   assert.equal(app.store.get(code).seats[0].avatar,avatar);
   assert.throws(()=>app.store.act(code,token,{id:randomUUID(),revision:0,action:{type:'start'}}));
   const tokens=[token];for(let i=1;i<playerCount;i++)tokens.push(app.store.join(code,`Jogador ${i}`).token);
   const act=(seat:number,action:Record<string,unknown>)=>app.store.act(code,tokens[seat],{id:randomUUID(),revision:app.store.get(code).revision,action});
   assert.throws(()=>act(0,{type:'start'}));assert.equal(app.store.get(code).game,null);
   tokens.forEach((_,i)=>act(i,{type:'ready',ready:true}));act(0,{type:'start'});
   assert.equal(app.store.get(code).seats[0].avatar,avatar);
   const game=app.store.get(code).game!;assert.equal(game.side,side);assert.equal(game.pulse,pulse);assert.equal(game.players.length,playerCount);
  }
  const before=app.store.db.prepare('SELECT COUNT(*) as n FROM rooms').get();
  for(const invalid of [{side:'C'},{side:null},{side:3},{pulse:'true'},{pulse:null},{pulse:1},{avatar:'gato'},{avatar:null},{avatar:3}]){
   const result=await create({name:'Inválido',...invalid});assert.equal(result.status,400);assert.ok(['SIDE','EXPANSION','AVATAR'].includes(result.body.code));
  }
  assert.deepEqual(app.store.db.prepare('SELECT COUNT(*) as n FROM rooms').get(),before);
 }finally{app.closeStreams();await new Promise<void>(resolve=>app.server.close(()=>resolve()));app.store.close();}
});

test('H02 mesa direta aguarda todos e inicia automaticamente com 2, 3 ou 4 jogadores',async()=>{
 const app=createApp({database:':memory:'});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
 const address=app.server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
 const post=async(path:string,data:unknown)=>{const r=await fetch(`${base}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.status,201);return await r.json();};
 try{
  for(const playerCount of [2,3,4]){
   const created=await post('/api/rooms',{name:'Host direto',playerCount,side:'B',pulse:true,avatar:'coala',directPlay:true});
   const code=created.state.code;
   assert.equal(created.state.game,null);assert.equal(created.state.directPlay,true);assert.equal(created.state.tablePreview.players.length,playerCount);
   assert.equal(created.state.tablePreview.bag,undefined);assert.equal(created.state.tablePreview.deck,undefined);
   assert.throws(()=>app.store.act(code,created.token,{id:randomUUID(),revision:0,action:{type:'takeTokens',slot:0}}));
   for(const avatar of ['inválido',null,3]){
    const response=await fetch(`${base}/api/rooms/${code}/join`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Inválido',avatar})});
    assert.equal(response.status,400);assert.equal((await response.json()).code,'AVATAR');assert.equal(app.store.get(code).seats.length,1);assert.equal(app.store.get(code).revision,0);
   }
   for(let i=1;i<playerCount;i++){
    const avatar=['corvo','lontra','coala','leao'][(playerCount+i)%4];
    const joined=await post(`/api/rooms/${code}/join`,{name:`Convidado ${i}`,avatar});
    assert.equal(joined.state.seats[i].avatar,avatar);assert.equal(app.store.get(code).seats[i].avatar,avatar);assert.equal(joined.state.seats[0].avatar,'coala');
    if(i<playerCount-1){assert.equal(joined.state.game,null);assert.ok(joined.state.tablePreview);}
    else{assert.ok(joined.state.game);assert.equal(joined.state.tablePreview,null);assert.equal(joined.state.game.side,'B');assert.equal(joined.state.game.pulse,true);assert.equal(joined.state.game.players.length,playerCount);assert.equal(joined.state.game.turn,0);}
   }
   assert.equal(app.store.get(code).seats[0].avatar,'coala');
   assert.throws(()=>app.store.join(code,'Extra'));
   const room=app.store.get(code),id=randomUUID();
   const played=app.store.act(code,created.token,{id,revision:room.revision,action:{type:'takeTokens',slot:0}});
   assert.equal(played.game!.hand.length,3);
  }
  const legacy=app.store.create('Sala anterior',3);
  app.store.act(legacy.room.code,legacy.token,{id:randomUUID(),revision:0,action:{type:'waitForPlayers'}});
  assert.equal(app.store.get(legacy.room.code).directPlay,true);assert.equal(app.store.get(legacy.room.code).game,null);
  app.store.join(legacy.room.code,'Segundo');assert.equal(app.store.get(legacy.room.code).game,null);
  const last=app.store.join(legacy.room.code,'Terceiro');assert.ok(last.room.game);
 }finally{app.closeStreams();await new Promise<void>(resolve=>app.server.close(()=>resolve()));app.store.close();}
});
