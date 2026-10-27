import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {CATALOG,PULSE_CATALOG,catalogFor,validateCatalog} from '../src/engine/catalog.ts';
import {emptyBoard,key,orient,neighbors} from '../src/engine/geometry.ts';
import {applyAction,freshTokens,habitatMatches,legalHabitats,setup} from '../src/engine/rules.ts';
import {animalScore,scores} from '../src/engine/scoring.ts';
import {Store} from '../src/server/store.ts';
import type {AnimalCard,Board,Color} from '../src/engine/model.ts';
const all=catalogFor(true),deck=all.map(c=>c.id);
const values=['6,13','7,16','4,10,17','5,11','3,10,16','4,8,15','4,9,16','7,16','5,13','5,12'];
const requirements=['blue1 green3 yellow1','blue1 gray2 green2','red2 gray1 green1','red2 yellow1 blue1','green1 gray1 blue1','green1 blue1 yellow1','gray1 red2 yellow1','gray2 blue1 yellow1','yellow1 gray1 green3','yellow1 red2 gray1'];
function boardFor(card:AnimalCard,rotation=0,mirrored=false):Board {
 const b=emptyBoard();for(const p of card.pattern){const v=orient(p,rotation,mirrored);const cell=b[key({q:2+v.q,r:1+v.r})];assert.ok(cell,'padrão precisa caber no centro para teste');cell.stack=p.color==='green'?[...Array<Color>(p.height-1).fill('brown'),'green']:p.color==='red'?['gray','red']:Array<Color>(p.height).fill(p.color);}return b;
}
test('P01 opção desligada mantém32 cartas; ligada contém as32 +10 e mesma bolsa120',()=>{
 assert.equal(catalogFor(false).length,32);assert.equal(all.length,42);validateCatalog(all,true);assert.throws(()=>validateCatalog(all),/incompleto/);assert.throws(()=>validateCatalog(CATALOG,true),/incompleto/);
 const g=setup('B',1,freshTokens(),deck,all,true);assert.equal(g.pulse,true);assert.equal(g.deck.length,37);assert.equal(g.animals.length,5);assert.equal(g.bag.length,105);assert.equal(g.market.flat().length,15);
 assert.deepEqual(new Set([...g.deck,...g.animals]),new Set(deck));
 assert.equal(setup('A',0,freshTokens(),CATALOG.map(c=>c.id),CATALOG).pulse,false);
});
test('P02 espelhar é involução e preserva vizinhança; base não aceita flag de espelho',()=>{
 const b=emptyBoard(),center=b['2,1'];for(const c of [{q:2,r:-1},{q:0,r:1},{q:-2,r:1}])assert.deepEqual(orient(orient(c,0,true),0,true),c);
 assert.equal(neighbors(b,center).length,6);assert.equal(habitatMatches(boardFor(CATALOG[0]),CATALOG[0],'2,1',0,true),false);
});
for(const [i,card] of PULSE_CATALOG.entries())test(`P${String(i+3).padStart(2,'0')} Pulsar ${i+1}: requisitos,12 orientações, alturas, ocupação, limites e pontos`,()=>{
 assert.equal(card.points.join(','),values[i]);assert.equal(card.pattern.map(p=>p.color+p.height).join(' '),requirements[i]);assert.equal(new Set(card.pattern.map(p=>p.color)).size,3);assert.equal(card.allowMirror,true);assert.equal(card.expansion,'pulse');
 for(const mirrored of [false,true])for(let r=0;r<6;r++){
  const b=boardFor(card,r,mirrored);assert.equal(habitatMatches(b,card,'2,1',r,mirrored),true);
  assert.ok(legalHabitats(b,card,true).some(h=>h.anchor==='2,1'&&h.rotation===r&&h.mirrored===mirrored));
  for(const p of card.pattern){const v=orient(p,r,mirrored),cell=b[key({q:2+v.q,r:1+v.r})],saved=cell.stack;cell.stack=['brown'];assert.equal(habitatMatches(b,card,'2,1',r,mirrored),false);cell.stack=[...saved,'gray'];assert.equal(habitatMatches(b,card,'2,1',r,mirrored),false);cell.stack=saved;}
  b['2,1'].animal=card.id;assert.equal(habitatMatches(b,card,'2,1',r,mirrored),false);
 }
 const b=boardFor(card,0,true);assert.equal(habitatMatches(b,card,'99,99',0,true),false);assert.equal(habitatMatches(b,card,'2,1',6,true),false);
 if(i!==7&&i!==9)assert.ok([0,1,2,3,4,5].every(r=>!habitatMatches(b,card,'2,1',r,false)),'padrão quiral não deve passar sem espelhar');
 for(let p=0;p<=card.points.length;p++)assert.equal(animalScore([{id:card.id,placed:p}],all),p?card.points[p-1]:0);
});
test('P13 servidor do motor exige expansão para espelhamento e mantém cubo definitivo',()=>{
 const c=PULSE_CATALOG[0];let g=setup('A',0,freshTokens(),deck,all,true);g.players[0].board=boardFor(c,0,true);g.players[0].cards=[{id:c.id,placed:0}];
 const action={type:'placeAnimal' as const,card:c.id,anchor:'2,1',rotation:0,mirrored:true};
 assert.throws(()=>applyAction({...g,pulse:false},0,action,all),/Espelhamento/);
 g=applyAction(g,0,action,all);assert.equal(g.players[0].board['2,1'].animal,c.id);assert.equal(g.players[0].cards[0].placed,1);assert.equal(scores(g,all)[0].animals,6);
 assert.throws(()=>applyAction(g,0,action,all),/inválidos/);
});
test('P14 escolha de Pulsar persiste; ambos reconfirmam;32/42 não mudam após início; salas antigas são base',()=>{
 const directory=mkdtempSync(join(tmpdir(),'pulse-test-')),path=join(directory,'room.sqlite');let store=new Store(path);
 try{
  const a=store.create('Ana'),code=a.room.code,b=store.join(code,'Beto');
  const act=(token:string,action:Record<string,unknown>)=>store.act(code,token,{id:randomUUID(),revision:store.get(code).revision,action});
  act(a.token,{type:'ready',ready:true});act(b.token,{type:'ready',ready:true});
  assert.throws(()=>act(b.token,{type:'configure',side:'A',first:0,pulse:true}),/criador/);
  let room=act(a.token,{type:'configure',side:'B',first:1,pulse:true});assert.equal(room.pulse,true);assert.ok(room.seats.every(s=>!s.ready));assert.equal(store.public(room,1).catalogStatus.expected,42);
  assert.throws(()=>act(a.token,{type:'start'}),/confirmar/);
  assert.throws(()=>act(a.token,{type:'configure',side:'B',first:1,pulse:'true'}),/inválida/);
  store.close();store=new Store(path);assert.equal(store.get(code).pulse,true);assert.equal(store.identity(code,a.token),0);
  act(a.token,{type:'ready',ready:true});act(b.token,{type:'ready',ready:true});room=act(a.token,{type:'start'});assert.equal(room.game!.pulse,true);assert.equal(room.game!.deck.length,37);
  assert.throws(()=>act(a.token,{type:'configure',side:'A',first:0,pulse:false}),/começou/);
  const legacy=store.create('Legado');const raw=JSON.parse(JSON.stringify(legacy.room));delete raw.pulse;store.db.prepare('UPDATE rooms SET state=? WHERE code=?').run(JSON.stringify(raw),legacy.room.code);assert.equal(store.get(legacy.room.code).pulse,false);assert.equal(store.public(store.get(legacy.room.code),0).catalog.length,32);
 }finally{store.close();rmSync(directory,{recursive:true,force:true});}
});
test('P15 desativar Pulsar na preparação restaura catálogo base e remove cartas extras',()=>{
 const store=new Store(':memory:');try{
  const a=store.create('Ana'),code=a.room.code;const set=(pulse:boolean)=>store.act(code,a.token,{id:randomUUID(),revision:store.get(code).revision,action:{type:'configure',side:'A',first:0,pulse}});
  assert.equal(store.public(set(true),0).catalog.length,42);const base=store.public(set(false),0);assert.equal(base.catalog.length,32);assert.equal(base.catalogStatus.expected,32);assert.ok(base.catalog.every(c=>!c.expansion));
 }finally{store.close();}
});
