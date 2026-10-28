import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/server/store.ts';

for(const count of [2,3,4])for(const pulse of [false,true])test(`V${count}-${pulse} revanche preserva sala e sessões e exige nova preparação`,()=>{
 const store=new Store(':memory:');
 try{
  const host=store.create('Host',count),code=host.room.code,tokens=[host.token];
  for(let i=1;i<count;i++)tokens.push(store.join(code,`Jogador ${i+1}`).token);
  const act=(seat:number,action:Record<string,unknown>)=>store.act(code,tokens[seat],{id:randomUUID(),revision:store.get(code).revision,action});
  assert.throws(()=>act(0,{type:'rematch'}),/precisa terminar/);
  act(0,{type:'configure',side:'B',first:count-1,pulse,playerCount:count});
  tokens.forEach((_,i)=>act(i,{type:'ready',ready:true}));act(0,{type:'start'});
  assert.throws(()=>act(0,{type:'rematch'}),/precisa terminar/);
  act(count-1,{type:'takeTokens',slot:0});
  act(0,{type:'finishGame'});
  const finished=structuredClone(store.get(code));
  assert.throws(()=>act(1,{type:'rematch'}),/Somente o host/);
  assert.deepEqual(store.get(code),finished);
  const envelope={id:randomUUID(),revision:finished.revision,action:{type:'rematch'}};
  store.act(code,host.token,envelope);
  const lobby=store.get(code);
  assert.equal(lobby.game,null);assert.equal(lobby.turnStart,undefined);
  assert.equal(lobby.code,code);assert.equal(lobby.playerCount,count);assert.equal(lobby.pulse,pulse);assert.equal(lobby.side,'B');assert.equal(lobby.first,count-1);
  assert.deepEqual(lobby.seats.map(s=>s.ready),Array(count).fill(false));
  tokens.forEach((token,i)=>assert.equal(store.identity(code,token),i));
  store.act(code,host.token,envelope);assert.equal(store.get(code).revision,lobby.revision);
  assert.throws(()=>act(0,{type:'start'}),/todos devem confirmar/);
  tokens.forEach((_,i)=>act(i,{type:'ready',ready:true}));act(0,{type:'start'});
  const next=store.get(code).game!;
  assert.equal(next.finished,false);assert.equal(next.players.length,count);assert.equal(next.turn,count-1);
  assert.ok(next.players.every(p=>p.cards.length===0&&p.turns===0&&Object.values(p.board).every(c=>c.stack.length===0&&c.animal===null)));
  assert.equal(next.hand.length,0);assert.equal(next.selected,null);
  assert.equal(next.market.length,5);assert.ok(next.market.every(group=>group.length===3));
  assert.throws(()=>act(0,{type:'restartTurn'}),/próprio turno|encerrados/);
 }finally{store.close();}
});
