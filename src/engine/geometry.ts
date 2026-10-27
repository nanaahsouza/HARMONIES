import type {Board,Coord} from './model.ts';
export const key=({q,r}:Coord)=>`${q},${r}`;
export const DIRECTIONS:Coord[]=[{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}];
export function emptyBoard():Board {
 const board:Board={};
 // Manual BR, p. 3, diagrama do tabuleiro: 23 hexágonos, colunas 5/4/5/4/5.
 for(let q=0;q<5;q++)for(let row=0;row<(q%2?4:5);row++){
  const c={q,r:row-Math.floor(q/2),stack:[],animal:null};board[key(c)]=c;
 }
 return board;
}
export const neighbors=(board:Board,c:Coord)=>DIRECTIONS.map(d=>board[key({q:c.q+d.q,r:c.r+d.r})]).filter(Boolean);
export function rotate(c:Coord,steps:number):Coord {
 let {q,r}=c;for(let i=0;i<steps;i++)[q,r]=[-r,q+r];return {q,r};
}
// Reflexão sobre o eixo vertical da grade, seguida da rotação escolhida.
export function orient(c:Coord,steps:number,mirrored=false):Coord {
 return rotate(mirrored?{q:-c.q,r:c.r+c.q}:c,steps);
}
export function groups(board:Board,predicate:(id:string)=>boolean):string[][] {
 const unseen=new Set(Object.keys(board).filter(predicate)),result:string[][]=[];
 while(unseen.size){const start=unseen.values().next().value!;unseen.delete(start);const group=[start];
  for(let i=0;i<group.length;i++)for(const n of neighbors(board,board[group[i]])){
   const id=key(n);if(unseen.delete(id))group.push(id);
  }result.push(group);
 }return result;
}
