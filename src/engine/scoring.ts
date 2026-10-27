import type {AnimalCard,Board,Game,HeldCard,Side} from './model.ts';
import {groups,key,neighbors} from './geometry.ts';
const heights=[0,1,3,7];
export function riverLength(board:Board):number {
 let length=0;
 for(const component of groups(board,id=>board[id].stack.at(-1)==='blue')){
  for(const start of component){const distances=new Map([[start,1]]),queue=[start];
   for(let i=0;i<queue.length;i++)for(const n of neighbors(board,board[queue[i]])){
    const id=key(n);if(n.stack.at(-1)==='blue'&&!distances.has(id)){distances.set(id,distances.get(queue[i])!+1);queue.push(id);}
   }length=Math.max(length,...distances.values());
  }
 }return length;
}
export function landscapeScore(board:Board,side:Side){
 let trees=0,mountains=0,buildings=0;
 for(const cell of Object.values(board)){
  const top=cell.stack.at(-1),adj=neighbors(board,cell);
  if(top==='green')trees+=heights[cell.stack.length];
  if(top==='gray'&&adj.some(n=>n.stack.at(-1)==='gray'))mountains+=heights[cell.stack.length];
  if(top==='red'&&cell.stack.length===2&&new Set(adj.map(n=>n.stack.at(-1)).filter(Boolean)).size>=3)buildings+=5;
 }
 const fields=5*groups(board,id=>board[id].stack.at(-1)==='yellow').filter(g=>g.length>=2).length;
 const length=riverLength(board);
 const water=side==='B'?groups(board,id=>board[id].stack.at(-1)!=='blue').length*5:([0,0,2,5,8,11,15][length]??15+4*(length-6));
 return {trees,mountains,fields,buildings,water,total:trees+mountains+fields+buildings+water};
}
export const animalScore=(cards:HeldCard[],catalog:AnimalCard[])=>cards.reduce((sum,h)=>sum+(catalog.find(c=>c.id===h.id)?.points[h.placed-1]??0),0);
export function scores(game:Game,catalog:AnimalCard[]){return game.players.map(p=>{
 const landscape=landscapeScore(p.board,game.side),animals=animalScore(p.cards,catalog),cubes=p.cards.reduce((n,c)=>n+c.placed,0);
 return {...landscape,landscape:landscape.total,animals,total:landscape.total+animals,cubes};
});}
export function winners(game:Game,catalog:AnimalCard[]):number[]{
 const score=scores(game,catalog),best=Math.max(...score.map(s=>s.total)),tied=score.map((s,i)=>({s,i})).filter(({s})=>s.total===best),cubes=Math.max(...tied.map(({s})=>s.cubes));
 return tied.filter(({s})=>s.cubes===cubes).map(({i})=>i);
}
