import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,validateCatalog} from '../src/engine/catalog.ts';
import {COLORS,COUNTS} from '../src/engine/model.ts';
import type {AnimalCard,Board,Color,Game,Requirement} from '../src/engine/model.ts';
import {emptyBoard,key,neighbors,rotate} from '../src/engine/geometry.ts';
import {applyAction,canStack,freshTokens,habitatMatches,legalHabitats,setup} from '../src/engine/rules.ts';
import {animalScore,landscapeScore,riverLength,scores,winners} from '../src/engine/scoring.ts';
const newGame=(first:0|1=0)=>setup('A',first,freshTokens(),CATALOG.map(c=>c.id),CATALOG);
const put=(b:Board,id:string,stack:Color[])=>{b[id].stack=stack;};
function stack(p:Requirement):Color[]{return p.color==='green'?[...Array<Color>(p.height-1).fill('brown'),'green']:p.color==='red'?['brown','red']:Array<Color>(p.height).fill(p.color);}
function patternBoard(card:AnimalCard,rotation=0):Board {
 const b=emptyBoard(),anchor=b['2,1'];
 for(const p of card.pattern){const v=rotate(p,rotation);put(b,key({q:anchor.q+v.q,r:anchor.r+v.r}),stack(p));}return b;
}
// Valores lidos dos espaços das cartas, do inferior para o superior, por revisão visual.
const pointOracle=['4,9,15','4,10,16','3,6,10,16','5,10,16','2,4,6,10,15','2,4,8,13','4,10,16','5,10,16','5,10,17','5,10,17','4,9,15','5,12','8,18','5,11','5,10,17','4,9,14','4,8,13','3,6,10,15','4,10,16','5,11,18','4,10,16','3,6,10,15','4,9,16','5,11','5,11','2,5,9,14','4,9','5,12','5,10,17','6,12','2,5,8,12,17','5,11'];
// Outra leitura dos diagramas: primeiro símbolo recebe o cubo; alturas explícitas.
const diagramOracle=[
 'blue1 blue1 green3|line','blue1 gray1 gray1|triangle','blue1 gray3|pair','blue1 green1 green1|line',
 'blue1 green1|pair','blue1 red2|pair','blue1 yellow1 yellow1|triangle','red2 yellow1 yellow1|line',
 'red2 yellow1 yellow1|v','red2 blue1 blue1|v','red2 green3|pair','red2 green2 green2|triangle',
 'green2 yellow1 yellow1 yellow1|fan','green1 gray2 gray2|triangle','green1 green1 red2|line','green2 blue1 blue1|triangle',
 'green2 red2|pair','green2 green1|pair','green3 yellow1 yellow1|triangle','green3 blue1 blue1|v',
 'gray1 blue1 blue1|v','gray1 green3|pair','gray1 gray1 yellow1|line','gray2 blue1 blue1|triangle',
 'gray3 yellow1|pair','gray1 yellow1|pair','yellow1 red2 red2|v','yellow1 yellow1 gray2|line',
 'yellow1 green2 green2|v','yellow1 blue1 blue1 blue1|fan','yellow1 green1|pair','yellow1 green2 green2|line'
];
const hexDistance=(a:{q:number;r:number},b:{q:number;r:number})=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
test('R01 componentes oficiais e preparação dois jogadores',()=>{
 assert.deepEqual(COUNTS,{blue:23,gray:23,brown:21,green:19,yellow:19,red:15});assert.equal(freshTokens().length,120);
 validateCatalog(CATALOG);assert.equal(CATALOG.length,32);assert.equal(CATALOG.reduce((n,c)=>n+c.points.length,0),96);
 const g=newGame(1);assert.equal(g.turn,1);assert.equal(g.bag.length,105);assert.equal(g.deck.length,27);assert.equal(g.animals.length,5);assert.deepEqual(g.market.map(m=>m.length),[3,3,3,3,3]);
 assert.equal(g.players.length,2);assert.equal(Object.keys(g.players[0].board).length,23);assert.equal(g.players[0].cards.length,0);
 for(const c of COLORS)assert.equal([...g.bag,...g.market.flat()].filter(t=>t===c).length,COUNTS[c]);
 assert.throws(()=>validateCatalog(CATALOG.slice(1)),/incompleto/);assert.throws(()=>setup('A',0,[],[],CATALOG),/Distribuição/);
});
test('R02 topologia de 23 hexágonos com vizinhança recíproca e seis rotações',()=>{
 const b=emptyBoard();assert.deepEqual([0,1,2,3,4].map(q=>Object.values(b).filter(c=>c.q===q).length),[5,4,5,4,5]);
 assert.equal(neighbors(b,b['2,1']).length,6);
 for(const c of Object.values(b))for(const n of neighbors(b,c))assert.ok(neighbors(b,n).some(v=>key(v)===key(c)));
 assert.deepEqual(rotate({q:2,r:-1},6),{q:2,r:-1});
});
test('R03 todas as pilhas permitidas, limites, cores e cubos',()=>{
 const legal:Color[][]=[[],['gray'],['gray','gray'],['gray','gray','gray'],['brown'],['brown','brown'],['green'],['brown','green'],['brown','brown','green'],['red'],['red','red'],['brown','red'],['gray','red'],['blue'],['yellow']];
 for(const current of legal)for(const color of COLORS){const c={q:0,r:0,stack:current,animal:null};assert.equal(canStack(c,color),legal.some(s=>JSON.stringify(s)===JSON.stringify([...current,color])),`${current} + ${color}`);}
 for(const color of COLORS){assert.equal(canStack({q:0,r:0,stack:[],animal:'occupied'},color),false);assert.equal(canStack(undefined,color),false);}
 assert.equal(canStack(emptyBoard()['__proto__'],'red'),false);
});
for(const [i,card] of CATALOG.entries()){
 test(`C${String(i+1).padStart(2,'0')} ${card.label}: seis rotações, alturas, cores, bordas, ocupação e pontos`,()=>{
  assert.equal(card.points.join(','),pointOracle[i]);assert.deepEqual(card.cube,{q:0,r:0});assert.equal(card.verified,true);
  const [requirements,shape]=diagramOracle[i].split('|');assert.equal(card.pattern.map(p=>p.color+p.height).join(' '),requirements);
  const distances=card.pattern.slice(1).map(p=>hexDistance(p,card.cube)).sort().join(',');
  assert.equal(distances,({pair:'1',triangle:'1,1',line:'1,2',v:'1,1',fan:'1,1,1'} as Record<string,string>)[shape]);
  if(shape==='triangle'||shape==='v')assert.equal(hexDistance(card.pattern[1],card.pattern[2]),shape==='triangle'?1:2);
  if(shape==='fan')assert.equal(hexDistance(card.pattern[1],card.pattern[3]),2);
  for(let r=0;r<6;r++){
   const b=patternBoard(card,r);assert.equal(habitatMatches(b,card,'2,1',r),true);assert.ok(legalHabitats(b,card).some(h=>h.anchor==='2,1'&&h.rotation===r));
   for(const p of card.pattern){const v=rotate(p,r),id=key({q:2+v.q,r:1+v.r}),saved=b[id].stack;
    b[id].stack=[];assert.equal(habitatMatches(b,card,'2,1',r),false,'qualquer requisito faltante invalida');
    b[id].stack=Array<Color>(p.height).fill(p.color==='yellow'?'blue':'yellow');assert.equal(habitatMatches(b,card,'2,1',r),false,'cor diferente invalida');
    b[id].stack=Array<Color>(p.height+1).fill(p.color);assert.equal(habitatMatches(b,card,'2,1',r),false,'altura precisa ser exata');b[id].stack=saved;
    if(id!=='2,1'){b[id].animal='outra-carta';assert.equal(habitatMatches(b,card,'2,1',r),true,'cubo de outro habitat não bloqueia suporte');b[id].animal=null;}
   }
   b['2,1'].animal=card.id;assert.equal(habitatMatches(b,card,'2,1',r),false,'destino do cubo deve estar livre');
  }
  const b=patternBoard(card);for(const r of [-1,6,60,360,0.5])assert.equal(habitatMatches(b,card,'2,1',r),false);
  assert.equal(habitatMatches(b,card,'99,99',0),false);assert.equal(habitatMatches(b,card,'0,0',0),false);
  assert.equal(animalScore([{id:card.id,placed:0}],CATALOG),0);
  for(let p=1;p<=card.points.length;p++)assert.equal(animalScore([{id:card.id,placed:p}],CATALOG),card.points[p-1]);
 });
}
test('R04 regressão de diagramas: V aberto, triângulo, linha e leque são diferentes',()=>{
 const fen=CATALOG[22],crow=CATALOG[26],parrot=CATALOG[15],bee=CATALOG[12];
 assert.deepEqual(fen.pattern.map(p=>[p.color,p.height,p.q,p.r]),[['gray',1,0,0],['gray',1,-1,0],['yellow',1,-2,0]]);
 const distance=(a:Requirement,b:Requirement)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
 assert.equal(distance(crow.pattern[1],crow.pattern[2]),2);assert.equal(distance(parrot.pattern[1],parrot.pattern[2]),1);
 assert.equal(bee.pattern.length,4);assert.equal(distance(bee.pattern[1],bee.pattern[3]),2);
 const b=patternBoard(crow);put(b,'3,0',[]);put(b,'2,0',['brown','red']);assert.equal(habitatMatches(b,crow,'2,1',0),false,'triângulo não substitui V');
});
test('R05 construções de qualquer base permitida servem aos habitats',()=>{
 const c=CATALOG[5],b=patternBoard(c);for(const base of ['brown','gray','red'] as Color[]){b['1,1'].stack=[base,'red'];assert.equal(habitatMatches(b,c,'2,1',0),true);}
 b['1,1'].stack=['red'];assert.equal(habitatMatches(b,c,'2,1',0),false);
});
test('R06 ações opcionais intercaladas; reposição apenas no fim; imutabilidade',()=>{
 const original=newGame();let g=applyAction(original,0,{type:'takeCard',slot:0},CATALOG);
 assert.equal(original.animals[0],CATALOG[0].id);assert.equal(g.animals[0],null);assert.equal(g.deck.length,27);
 g=applyAction(g,0,{type:'takeTokens',slot:0},CATALOG);assert.equal(g.bag.length,105);assert.equal(g.hand.length,3);
 assert.throws(()=>applyAction(g,0,{type:'takeTokens',slot:1},CATALOG),/já pegou/);assert.throws(()=>applyAction(g,0,{type:'endTurn'},CATALOG),/três peças/);
 for(const id of ['0,0','0,1','0,2'])g=applyAction(g,0,{type:'placeToken',color:'blue',cell:id},CATALOG);
 assert.throws(()=>applyAction(g,0,{type:'takeCard',slot:1},CATALOG),/uma carta/);
 g=applyAction(g,0,{type:'endTurn'},CATALOG);assert.equal(g.bag.length,102);assert.equal(g.market[0].length,3);assert.equal(g.animals.filter(Boolean).length,5);assert.equal(g.deck.length,26);assert.equal(g.turn,1);
 assert.throws(()=>applyAction(g,0,{type:'takeTokens',slot:1},CATALOG),/Aguarde/);
});
test('R07 ilegalidade de peça fora da mão, posição fora do tabuleiro e slot inválido',()=>{
 let g=newGame();assert.throws(()=>applyAction(g,0,{type:'takeTokens',slot:-1},CATALOG),/espaço/);
 g=applyAction(g,0,{type:'takeTokens',slot:0},CATALOG);assert.throws(()=>applyAction(g,0,{type:'placeToken',color:'red',cell:'0,0'},CATALOG),/indisponível/);
 assert.throws(()=>applyAction(g,0,{type:'placeToken',color:'blue',cell:'99,99'},CATALOG),/proibido/);
 assert.throws(()=>applyAction(g,0,{type:'placeToken',color:'blue',cell:'__proto__'},CATALOG),/proibido/);
});
test('R08 cartas completas liberam espaço; cubo definitivo; habitat pode ser alterado',()=>{
 let g=newGame();const card=CATALOG[22];g.players[0].board=patternBoard(card);g.players[0].cards=[{id:card.id,placed:2},...CATALOG.slice(0,3).map(c=>({id:c.id,placed:0}))];
 assert.throws(()=>applyAction(g,0,{type:'takeCard',slot:4},CATALOG),/quatro/);
 g=applyAction(g,0,{type:'placeAnimal',card:card.id,anchor:'2,1',rotation:0},CATALOG);assert.equal(g.players[0].cards[0].placed,3);
 g=applyAction(g,0,{type:'takeCard',slot:4},CATALOG);assert.equal(g.players[0].cards.length,5);
 g.selected=0;g.hand=['red'];g=applyAction(g,0,{type:'placeToken',color:'red',cell:'1,1'},CATALOG);
 assert.equal(g.players[0].board['2,1'].animal,card.id);assert.equal(habitatMatches(g.players[0].board,card,'2,1',0),false);
 assert.throws(()=>applyAction(g,0,{type:'placeAnimal',card:card.id,anchor:'2,1',rotation:0},CATALOG),/disponíveis/);
});
test('R09 árvores 1/3/7 e troncos sem copa não pontuam',()=>{
 const b=emptyBoard();put(b,'0,0',['green']);put(b,'0,1',['brown','green']);put(b,'0,2',['brown','brown','green']);put(b,'0,3',['brown','brown']);assert.equal(landscapeScore(b,'A').trees,11);
});
test('R10 montanha isolada não pontua e alturas são 1/3/7',()=>{
 const b=emptyBoard();put(b,'0,0',['gray']);put(b,'0,1',['gray','gray']);put(b,'0,2',['gray','gray','gray']);put(b,'4,2',['gray','gray','gray']);assert.equal(landscapeScore(b,'A').mountains,11);
});
test('R11 campos pontuam por grupo; adjacência diagonal conta',()=>{
 const b=emptyBoard();for(const id of ['0,0','0,1','1,0','4,1','4,2','2,3'])put(b,id,['yellow']);assert.equal(landscapeScore(b,'A').fields,10);
});
test('R12 construção exige duas peças e três cores superiores diferentes',()=>{
 const b=emptyBoard();put(b,'2,1',['brown','red']);put(b,'1,1',['blue']);put(b,'2,0',['yellow']);put(b,'3,0',['red']);assert.equal(landscapeScore(b,'A').buildings,5);
 put(b,'3,0',['yellow']);assert.equal(landscapeScore(b,'A').buildings,0);put(b,'3,0',['gray','red']);assert.equal(landscapeScore(b,'A').buildings,5);
 put(b,'2,1',['red']);assert.equal(landscapeScore(b,'A').buildings,0);
});
test('R13 rio pontua maior caminho mínimo; laços e atalhos conforme FAQ',()=>{
 const b=emptyBoard();for(const id of ['0,0','0,1','0,2','0,3','0,4'])put(b,id,['blue']);assert.equal(riverLength(b),5);assert.equal(landscapeScore(b,'A').water,11);
 const loop=emptyBoard();for(const n of neighbors(loop,loop['2,1']))n.stack=['blue'];assert.equal(riverLength(loop),4);assert.equal(landscapeScore(loop,'A').water,8);
 put(loop,'2,1',['blue']);assert.equal(riverLength(loop),3,'atalho central reduz diâmetro');
 const line=emptyBoard();for(const id of ['0,0','0,1','0,2','1,2','2,2','3,2','4,2'])put(line,id,['blue']);assert.equal(riverLength(line),7);assert.equal(landscapeScore(line,'A').water,19);
});
test('R14 ilhas contam espaços vazios e terrenos; zero água dá uma ilha',()=>{
 const b=emptyBoard();assert.equal(landscapeScore(b,'B').water,5);for(const c of Object.values(b).filter(c=>c.q===2))c.stack=['blue'];assert.equal(landscapeScore(b,'B').water,10);put(b,'0,0',['green']);assert.equal(landscapeScore(b,'B').water,10);
});
function endReady(g:Game):Game {const copy=structuredClone(g);copy.selected=0;copy.hand=[];return copy;}
test('R15 fim por ocupação completa rodada com mesmo número de turnos',()=>{
 let g=newGame();for(const c of Object.values(g.players[0].board).slice(0,21))c.stack=['yellow'];
 g=applyAction(endReady(g),0,{type:'endTurn'},CATALOG);assert.equal(g.finalRound,true);assert.equal(g.finished,false);assert.equal(g.turn,1);
 g=applyAction(endReady(g),1,{type:'endTurn'},CATALOG);assert.equal(g.finished,true);assert.deepEqual(g.players.map(p=>p.turns),[1,1]);assert.throws(()=>applyAction(g,1,{type:'endTurn'},CATALOG),/terminou/);
});
test('R16 bolsa: último trio não dispara fim até reposição encontrar bolsa vazia',()=>{
 let g=newGame();g.bag=['blue','gray','red'];g=applyAction(endReady(g),0,{type:'endTurn'},CATALOG);assert.equal(g.finalRound,false);assert.equal(g.bag.length,0);
 g=applyAction(endReady(g),1,{type:'endTurn'},CATALOG);assert.equal(g.finished,true);assert.deepEqual(g.players.map(p=>p.turns),[1,1]);
});
test('R17 primeiro jogador1 e fim no seu turno exigem resposta do jogador0',()=>{
 let g=newGame(1);g.bag=[];g=applyAction(endReady(g),1,{type:'endTurn'},CATALOG);assert.equal(g.finished,false);assert.equal(g.turn,0);g=applyAction(endReady(g),0,{type:'endTurn'},CATALOG);assert.equal(g.finished,true);
});
test('R18 desempates por cubos e vitória compartilhada',()=>{
 let g=newGame();assert.deepEqual(winners(g,CATALOG),[0,1]);g.players[0].cards=[{id:CATALOG[0].id,placed:1}];g.players[1].cards=[{id:CATALOG[5].id,placed:2}];
 assert.equal(scores(g,CATALOG)[0].total,scores(g,CATALOG)[1].total);assert.deepEqual(winners(g,CATALOG),[1]);g.players[0].cards=[];assert.deepEqual(winners(g,CATALOG),[1]);
});
test('R19 partida integral pelo motor, 14 turnos, sem escolhas automáticas no produto',()=>{
 let g=newGame();let turns=0;while(!g.finished){const player=g.turn;g=applyAction(g,player,{type:'takeTokens',slot:0},CATALOG);for(const color of [...g.hand]){const cell=Object.keys(g.players[player].board).find(id=>g.players[player].board[id].stack.length===0)!;g=applyAction(g,player,{type:'placeToken',color,cell},CATALOG);}g=applyAction(g,player,{type:'endTurn'},CATALOG);assert.ok(++turns<=20);}
 assert.equal(turns,14);assert.deepEqual(g.players.map(p=>p.turns),[7,7]);assert.ok(scores(g,CATALOG).every(s=>Number.isFinite(s.total)));
});
