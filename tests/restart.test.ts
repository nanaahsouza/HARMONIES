import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../src/server/store.ts';
import {catalogFor} from '../src/engine/catalog.ts';
import {legalHabitats} from '../src/engine/rules.ts';

function table(path=':memory:'){
 const store=new Store(path),a=store.create('Ana'),code=a.room.code,b=store.join(code,'Beto');
 const act=(seat:number,action:Record<string,unknown>)=>store.act(code,seat?b.token:a.token,{id:randomUUID(),revision:store.get(code).revision,action});
 act(0,{type:'ready',ready:true});act(1,{type:'ready',ready:true});act(0,{type:'start'});
 return {store,a,b,code,act};
}
test('U01 reiniciar restaura peças, cartas, bolsa e baralho; snapshot persiste e não é público',()=>{
 const dir=mkdtempSync(join(tmpdir(),'harmonies-undo-')),path=join(dir,'game.sqlite');const t=table(path);
 try{
  const initial=structuredClone(t.store.get(t.code).game!);
  t.act(0,{type:'takeTokens',slot:0});
  const g=t.store.public(t.store.get(t.code),0).game!;const color=g.hand[0],cell=g.hints.tokens[color][0];
  t.act(0,{type:'placeToken',color,cell});t.act(0,{type:'takeCard',slot:0});
  assert.equal(t.store.public(t.store.get(t.code),0).canRestart,true);
  const publicState=t.store.public(t.store.get(t.code),0);assert.equal('turnStart' in publicState,false);assert.equal('bag' in JSON.parse(JSON.stringify(publicState.game)),false);
  t.store.close();const reopened=new Store(path);
  try{
   const envelope={id:randomUUID(),revision:reopened.get(t.code).revision,action:{type:'restartTurn'}};
   reopened.act(t.code,t.a.token,envelope);assert.deepEqual(reopened.get(t.code).game,initial);
   const rev=reopened.get(t.code).revision;reopened.act(t.code,t.a.token,envelope);assert.equal(reopened.get(t.code).revision,rev);
   assert.equal(reopened.public(reopened.get(t.code),0).canRestart,false);
  }finally{reopened.close();}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('U02 adversário não desfaz; encerrar descarta definitivamente o estado anterior',()=>{
 const t=table();try{
  t.act(0,{type:'takeTokens',slot:0});assert.throws(()=>t.act(1,{type:'restartTurn'}),/próprio turno/);
  while(t.store.get(t.code).game!.hand.length){const g=t.store.public(t.store.get(t.code),0).game!,color=g.hand[0],cell=g.hints.tokens[color][0];t.act(0,{type:'placeToken',color,cell});}
  t.act(0,{type:'endTurn'});const ended=structuredClone(t.store.get(t.code).game);
  assert.equal(t.store.get(t.code).turnStart,undefined);assert.throws(()=>t.act(0,{type:'restartTurn'}),/próprio turno/);
  assert.throws(()=>t.act(1,{type:'restartTurn'}),/encerrados/);assert.deepEqual(t.store.get(t.code).game,ended);
  t.act(1,{type:'takeTokens',slot:0});t.act(1,{type:'restartTurn'});assert.deepEqual(t.store.get(t.code).game,ended);
  const room=t.store.get(t.code);room.game!.finished=true;t.store.save(room);assert.throws(()=>t.act(1,{type:'restartTurn'}),/terminou/);
 }finally{t.store.close();}
});
test('U03 reiniciar também devolve o cubo de animal e permite novas escolhas',()=>{
 const t=table();try{
  const room=t.store.get(t.code),g=room.game!,card=catalogFor()[0],board=g.players[0].board;
  const anchor=Object.values(board).find(a=>card.pattern.every(p=>board[`${a.q+p.q},${a.r+p.r}`]))!;
  for(const p of card.pattern)board[`${anchor.q+p.q},${anchor.r+p.r}`].stack=[...Array(p.height-1).fill(p.color==='green'||p.color==='red'?'brown':p.color),p.color];
  g.players[0].cards=[{id:card.id,placed:0}];t.store.save(room);const initial=structuredClone(g);
  const hint=legalHabitats(board,card)[0];assert.ok(hint);
  t.act(0,{type:'placeAnimal',card:card.id,anchor:hint.anchor,rotation:hint.rotation});assert.equal(t.store.get(t.code).game!.players[0].cards[0].placed,1);
  t.act(0,{type:'restartTurn'});assert.deepEqual(t.store.get(t.code).game,initial);
  t.act(0,{type:'takeTokens',slot:1});t.act(0,{type:'restartTurn'});assert.deepEqual(t.store.get(t.code).game,initial);
 }finally{t.store.close();}
});
