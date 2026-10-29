import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {setup,applyAction,canStack,freshTokens} from '../src/engine/rules.ts';
import {catalogFor} from '../src/engine/catalog.ts';
import {soloSuns,winners,scores} from '../src/engine/scoring.ts';
import {Store} from '../src/server/store.ts';
import {createApp} from '../src/server/http.ts';
import type {Game} from '../src/engine/model.ts';
const catalog=catalogFor(),deck=catalog.map(c=>c.id);
const fresh=()=>setup('A',0,freshTokens(),deck,catalog,false,1);
function placeThree(g:Game){
 g=applyAction(g,0,{type:'takeTokens',slot:g.market.findIndex(m=>m.length===3)},catalog);
 while(g.hand.length){const color=g.hand[0],cell=Object.keys(g.players[0].board).find(id=>canStack(g.players[0].board[id],color));assert.ok(cell);g=applyAction(g,0,{type:'placeToken',color,cell},catalog);}
 return g;
}
test('S01 preparação solo tem três trios e três animais, lados A/B e Pulsar',()=>{
 for(const side of ['A','B'] as const)for(const pulse of [false,true]){
  const cards=catalogFor(pulse),g=setup(side,0,freshTokens(),cards.map(c=>c.id),cards,pulse,1);
  assert.equal(g.players.length,1);assert.equal(g.market.length,3);assert.equal(g.animals.length,3);assert.equal(g.bag.length,111);assert.equal(g.deck.length,cards.length-3);assert.equal(g.turn,0);
  assert.throws(()=>applyAction(g,0,{type:'takeTokens',slot:3},cards));
 }
});
test('S02 os seis discos não escolhidos são descartados e nove novos são revelados',()=>{
 const initial=fresh(),before=structuredClone(initial);let g=placeThree(initial);
 g=applyAction(g,0,{type:'endTurn'},catalog);
 assert.deepEqual(initial,before);assert.equal(g.bag.length,102);assert.deepEqual(g.market.flat(),before.bag.slice(0,9));assert.equal(g.market.flat().length,9);assert.equal(Object.values(g.players[0].board).reduce((n,c)=>n+c.stack.length,0),3);assert.equal(g.players[0].turns,1);assert.equal(g.turn,0);assert.equal(g.finished,false);
 assert.equal(g.bag.length+g.market.flat().length+3,114);
});
test('S03 troca opcional é atômica no fim, proibida ao pegar carta ou fora do solo',()=>{
 const g=placeThree(fresh()),before=structuredClone(g),old=g.animals[1],next=g.deck[0];
 const changed=applyAction(g,0,{type:'endTurn',discardCard:1},catalog);
 assert.deepEqual(g,before);assert.equal(changed.animals[1],next);assert.ok(!changed.animals.includes(old));assert.equal(changed.deck.length,g.deck.length-1);
 const taken=applyAction(g,0,{type:'takeCard',slot:0},catalog);
 assert.throws(()=>applyAction(taken,0,{type:'endTurn',discardCard:1},catalog),/não pegou/);
 for(const slot of [-1,3,1.5])assert.throws(()=>applyAction(g,0,{type:'endTurn',discardCard:slot},catalog));
 const empty=structuredClone(g);empty.deck=[];assert.throws(()=>applyAction(empty,0,{type:'endTurn',discardCard:1},catalog));
 const multi=setup('A',0,freshTokens(),deck,catalog,false,2);multi.selected=0;
 assert.throws(()=>applyAction(multi,0,{type:'endTurn',discardCard:1},catalog),/solo/);
 assert.throws(()=>applyAction(fresh(),0,{type:'endTurn',discardCard:1},catalog),/três peças/);
});
test('S04 última oferta parcial é jogável; bolsa vazia na reposição e ocupação encerram',()=>{
 let g=placeThree(fresh());g.bag=['green','green','yellow'];g=applyAction(g,0,{type:'endTurn'},catalog);
 assert.equal(g.finished,false);assert.deepEqual(g.market,[['green','green','yellow'],[],[]]);assert.equal(g.bag.length,0);
 g=applyAction(placeThree(g),0,{type:'endTurn'},catalog);assert.equal(g.finished,true);assert.equal(g.players[0].turns,2);assert.deepEqual(g.market,[[],[],[]]);assert.deepEqual(winners(g,catalog),[]);
 let occupied=fresh();Object.values(occupied.players[0].board).slice(0,21).forEach(c=>c.stack=['green']);occupied.selected=0;occupied=applyAction(occupied,0,{type:'endTurn'},catalog);assert.equal(occupied.finished,true);
 assert.throws(()=>applyAction(g,0,{type:'takeTokens',slot:0},catalog),/terminou/);
});
test('S05 sóis oficiais incluem limites exatos, lado do tabuleiro e ausência de Espírito',()=>{
 const thresholds=[40,70,90,110,130,140,150,160];
 thresholds.forEach((n,i)=>{assert.equal(soloSuns(n,'A').total,i+4);assert.equal(soloSuns(n-1,'B').total,i+2);});
 assert.deepEqual(soloSuns(130,'A'),{points:5,board:1,withoutSpirit:2,total:8});assert.equal(soloSuns(200,'B').total,10);assert.equal(soloSuns(0,'A').total,3);
});
test('S06 sala solo começa imediatamente, reinicia turno e revanche sem convidados',()=>{
 const store=new Store(':memory:');try{
  const created=store.create('Solo',1,{side:'B',avatar:'coala'}),code=created.room.code,token=created.token;
  const start=structuredClone(created.room.game);assert.ok(start);assert.equal(store.get(code).game!.players.length,1);assert.throws(()=>store.join(code,'Convidado'),/cheia/);
  const act=(action:Record<string,unknown>)=>store.act(code,token,{id:randomUUID(),revision:store.get(code).revision,action});
  act({type:'takeTokens',slot:0});act({type:'restartTurn'});assert.deepEqual(store.get(code).game,start);
  act({type:'finishGame'});assert.equal(store.get(code).game!.endReason,'host');assert.deepEqual(store.public(store.get(code),0).game!.winners,[]);
  act({type:'rematch'});const result=store.get(code);assert.ok(result.game&&!result.game.finished);assert.equal(result.game.market.length,3);assert.equal(result.seats[0].avatar,'coala');assert.equal(result.side,'B');
 }finally{store.close();}
});
test('S07 partida solo completa termina e mantém pontuação finita',()=>{
 let g=fresh();let count=0;
 while(!g.finished&&count<15){g=applyAction(placeThree(g),0,{type:'endTurn'},catalog);count++;}
 assert.ok(g.finished);assert.ok(count>1&&count<=14);assert.ok(Number.isFinite(scores(g,catalog)[0].total));
});
test('S08 criação HTTP solo entrega mesa ativa sem confirmação nem outro jogador',async()=>{
 const app=createApp({database:':memory:'});app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
 try{const address=app.server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  const res=await fetch(`${base}/api/rooms`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Solo HTTP',playerCount:1,pulse:true,avatar:'leao'})});
  assert.equal(res.status,201);const result=await res.json();assert.equal(result.state.playerCount,1);assert.ok(result.state.game);assert.equal(result.state.game.market.length,3);assert.equal(result.state.game.animals.length,3);assert.equal(result.state.catalog.length,42);assert.equal(result.state.game.bag,undefined);assert.equal(result.state.game.deck,undefined);
  const join=await fetch(`${base}/api/rooms/${result.state.code}/join`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Extra'})});assert.equal(join.status,409);
 }finally{app.closeStreams();await new Promise<void>(resolve=>app.server.close(()=>resolve()));app.store.close();}
});
