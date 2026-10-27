import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {setup,applyAction,freshTokens,canStack} from '../src/engine/rules.ts';
import {catalogFor} from '../src/engine/catalog.ts';
import {winners,scores} from '../src/engine/scoring.ts';
import {Store} from '../src/server/store.ts';
import type {Game} from '../src/engine/model.ts';
const catalog=catalogFor(),deck=catalog.map(c=>c.id);
function end(g:Game){
 const seat=g.turn;g=applyAction(g,seat,{type:'takeTokens',slot:g.market.findIndex(m=>m.length===3)},catalog);
 while(g.hand.length){const color=g.hand[0],cell=Object.keys(g.players[seat].board).find(id=>canStack(g.players[seat].board[id],color));assert.ok(cell);g=applyAction(g,seat,{type:'placeToken',color,cell},catalog);}
 return applyAction(g,seat,{type:'endTurn'},catalog);
}
for(const n of [2,3,4])for(let first=0;first<n;first++){
 test(`N${n}-${first} preparação e rotação com ${n} jogadores, primeiro ${first}`,()=>{
  let g=setup('A',first,freshTokens(),deck,catalog,false,n);assert.equal(g.players.length,n);assert.equal(g.bag.length,105);assert.equal(g.market.length,5);assert.equal(g.animals.length,5);
  assert.equal(new Set(g.players.map(p=>p.board)).size,n);
  for(let i=0;i<n*2;i++){assert.equal(g.turn,(first+i)%n);assert.throws(()=>applyAction(g,(g.turn+1)%n,{type:'takeTokens',slot:0},catalog),/turno/);g=end(g);}
  assert.ok(g.players.every(p=>p.turns===2));assert.equal(scores(g,catalog).length,n);assert.deepEqual(winners(setup('A',first,freshTokens(),deck,catalog,false,n),catalog),Array.from({length:n},(_,i)=>i));
 });
 test(`E${n}-${first} esgotar bolsa completa rodada com primeiro ${first}`,()=>{
  let g=setup('B',first,freshTokens(),deck,catalog,false,n);g.bag=[];
  for(let i=0;i<n;i++){g=end(g);assert.equal(g.finished,i===n-1);}
  assert.ok(g.players.every(p=>p.turns===1));
 });
 for(let trigger=0;trigger<n;trigger++)test(`F${n}-${first}-${trigger} ocupação em qualquer assento completa rodada`,()=>{
  let g=setup('A',first,freshTokens(),deck,catalog,false,n);
  for(let step=0;step<n;step++){
   if(g.turn===trigger){const cells=Object.values(g.players[trigger].board);cells.slice(0,21).forEach(c=>c.stack=['green']);g.selected=0;g.hand=[];g=applyAction(g,g.turn,{type:'endTurn'},catalog);}
   else g=end(g);
   assert.equal(g.finished,step===n-1&&g.finalRound);
  }
  assert.equal(g.finished,true);assert.ok(g.players.every(p=>p.turns===1));
 });
}
test('N04 capacidade, confirmações, assentos, encerramento pelo host e legado',()=>{
 const store=new Store(':memory:');try{
  for(const n of [1,5,2.5])assert.throws(()=>store.create('Host',n),/2 e 4/);
  const a=store.create('Host',4),code=a.room.code,tokens=[a.token];
  const act=(seat:number,action:Record<string,unknown>)=>store.act(code,tokens[seat],{id:randomUUID(),revision:store.get(code).revision,action});
  act(0,{type:'ready',ready:true});assert.throws(()=>act(0,{type:'start'}),/lugares/);
  for(let i=1;i<4;i++){const p=store.join(code,`Pessoa ${i}`);assert.equal(p.seat,i);assert.equal(store.public(p.room,i).seat,i);tokens.push(p.token);}
  assert.equal(store.get(code).seats[0].ready,false);assert.throws(()=>store.join(code,'Extra'),/cheia/);
  assert.throws(()=>act(0,{type:'configure',side:'A',first:0,playerCount:3}),/remover/);
  act(0,{type:'configure',side:'B',first:3,pulse:true,playerCount:4});
  for(let i=0;i<4;i++)act(i,{type:'ready',ready:true});act(0,{type:'start'});
  const start=structuredClone(store.get(code).game!);assert.equal(start.turn,3);assert.equal(start.players.length,4);
  act(3,{type:'takeTokens',slot:0});act(3,{type:'takeCard',slot:0});
  for(let i=1;i<4;i++)assert.throws(()=>act(i,{type:'finishGame'}),/host/);
  act(3,{type:'restartTurn'});assert.deepEqual(store.get(code).game,start);
  act(3,{type:'takeTokens',slot:1});const g=store.public(store.get(code),3).game!,color=g.hand[0];act(3,{type:'placeToken',color,cell:g.hints.tokens[color][0]});
  const final=act(0,{type:'finishGame'});assert.deepEqual(final.game,{...start,finished:true,endReason:'host'});assert.equal(final.turnStart,undefined);
  for(let i=0;i<4;i++){const state=store.public(final,i);assert.equal(state.game!.scores.length,4);assert.deepEqual(state.game!.winners,[]);assert.equal(state.canRestart,false);assert.equal('turnStart' in state,false);assert.throws(()=>act(i,{type:'restartTurn'}),/terminou/);assert.throws(()=>act(i,{type:'takeTokens',slot:0}),/terminou/);}
  assert.throws(()=>act(0,{type:'finishGame'}),/terminou/);
  const legacy=store.create('Legado'),raw=structuredClone(legacy.room) as any;delete raw.playerCount;store.db.prepare('UPDATE rooms SET state=? WHERE code=?').run(JSON.stringify(raw),legacy.room.code);assert.equal(store.get(legacy.room.code).playerCount,2);
 }finally{store.close();}
});
test('N05 encerramento administrativo e número de jogadores sobrevivem ao reinício',()=>{
 const dir=mkdtempSync(join(tmpdir(),'harmonies-four-')),path=join(dir,'game.sqlite');let store=new Store(path);
 try{
  const a=store.create('Host',3),code=a.room.code,tokens=[a.token,store.join(code,'B').token,store.join(code,'C').token];
  const act=(i:number,action:Record<string,unknown>)=>store.act(code,tokens[i],{id:randomUUID(),revision:store.get(code).revision,action});
  for(let i=0;i<3;i++)act(i,{type:'ready',ready:true});act(0,{type:'start'});act(0,{type:'finishGame'});
  store.close();store=new Store(path);const room=store.get(code);assert.equal(room.playerCount,3);assert.equal(room.game!.endReason,'host');assert.equal(room.game!.finished,true);tokens.forEach((token,i)=>assert.equal(store.identity(code,token),i));
 }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
for(const n of [2,3,4])for(const pulse of [false,true])test(`G${n}-${pulse} partida integral e resultado para todos`,()=>{
 const cards=catalogFor(pulse);let g=setup('A',n-1,freshTokens(),cards.map(c=>c.id),cards,pulse,n),steps=0;
 while(!g.finished&&steps<100){g=end(g);steps++;}
 assert.ok(g.finished);assert.ok(g.players.every(p=>p.turns===g.players[0].turns));assert.equal(scores(g,cards).length,n);assert.ok(winners(g,cards).every(i=>i>=0&&i<n));
});
