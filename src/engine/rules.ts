import {COLORS,COUNTS,requireRule} from './model.ts';
import type {Action,AnimalCard,Board,Cell,Color,Game,Side} from './model.ts';
import {emptyBoard,key,orient} from './geometry.ts';
import {validateCatalog} from './catalog.ts';
export const freshTokens=():Color[]=>COLORS.flatMap(c=>Array<Color>(COUNTS[c]).fill(c));
export function canStack(cell:Cell|undefined,color:Color):boolean {
 if(!cell||!Array.isArray(cell.stack)||cell.animal||!COLORS.includes(color))return false;
 const s=cell.stack;
 if(s.length===0)return true;
 if(color==='gray')return s.every(c=>c==='gray')&&s.length<3;
 if(color==='brown')return s.length===1&&s[0]==='brown';
 if(color==='green')return s.every(c=>c==='brown')&&s.length<=2;
 if(color==='red')return s.length===1&&['gray','brown','red'].includes(s[0]);
 return false;
}
export function habitatMatches(board:Board,card:AnimalCard,anchor:string,rotation:number,mirrored=false):boolean {
 const a=board[anchor];
 if(!a||!card.rotations.includes(rotation)||!Number.isInteger(rotation)||typeof mirrored!=='boolean'||(mirrored&&!card.allowMirror))return false;
 const cubeOffset=orient(card.cube,rotation,mirrored);
 const dest=board[key({q:a.q+cubeOffset.q,r:a.r+cubeOffset.r})];
 if(!dest||dest.animal)return false;
 return card.pattern.every(p=>{
  const v=orient(p,rotation,mirrored),c=board[key({q:a.q+v.q,r:a.r+v.r})];
  return !!c&&c.stack.at(-1)===p.color&&c.stack.length===p.height;
 });
}
export function legalHabitats(board:Board,card:AnimalCard,allowMirror=false):{anchor:string;rotation:number;mirrored:boolean;destination:string}[]{
 const result:{anchor:string;rotation:number;mirrored:boolean;destination:string}[]=[];
 for(const anchor of Object.keys(board))for(const mirrored of allowMirror&&card.allowMirror?[false,true]:[false])for(const rotation of card.rotations)if(habitatMatches(board,card,anchor,rotation,mirrored)){
  const a=board[anchor],v=orient(card.cube,rotation,mirrored);result.push({anchor,rotation,mirrored,destination:key({q:a.q+v.q,r:a.r+v.r})});
 }return result;
}
export function setup(side:Side,first:number,bag:Color[],deck:string[],catalog:AnimalCard[],pulse=false,playerCount=2):Game {
 validateCatalog(catalog,pulse);
 requireRule(side==='A'||side==='B','SIDE','Lado inválido.');
 requireRule(Number.isInteger(playerCount)&&playerCount>=2&&playerCount<=4,'PLAYER_COUNT','Escolha entre 2 e 4 jogadores.');
 requireRule(Number.isInteger(first)&&first>=0&&first<playerCount,'FIRST','Primeiro jogador inválido.');
 requireRule(bag.length===120&&COLORS.every(c=>bag.filter(t=>t===c).length===COUNTS[c]),'BAG','Distribuição incorreta de peças.');
 requireRule(deck.length===catalog.length&&new Set(deck).size===catalog.length&&deck.every(id=>catalog.some(c=>c.id===id)),'DECK','Baralho inválido.');
 const tokens=[...bag],cards=[...deck];
 return {pulse,side,first,turn:first,players:Array.from({length:playerCount},()=>({board:emptyBoard(),cards:[],turns:0})),bag:tokens.slice(15),deck:cards.slice(5),market:Array.from({length:5},(_,i)=>tokens.slice(i*3,i*3+3)),animals:cards.slice(0,5),selected:null,hand:[],tookCard:false,finalRound:false,finished:false};
}
export function applyAction(state:Game,player:number,action:Action,catalog:AnimalCard[]):Game {
 requireRule(!state.finished,'FINISHED','A partida terminou.');
 requireRule(state.turn===player,'NOT_YOUR_TURN','Aguarde seu turno.');
 const s:Game=structuredClone(state),p=s.players[s.turn];
 switch(action.type){
  case 'takeTokens':
   requireRule(s.selected===null,'ALREADY_TAKEN','Você já pegou as peças deste turno.');
   requireRule(Number.isInteger(action.slot)&&s.market[action.slot]?.length===3,'SLOT','Escolha um espaço com três peças.');
   s.selected=action.slot;s.hand=s.market[action.slot];s.market[action.slot]=[];break;
  case 'placeToken':{
   const at=s.hand.indexOf(action.color);
   requireRule(at!==-1,'TOKEN','Peça indisponível na sua mão.');
   requireRule(canStack(p.board[action.cell],action.color),'PLACEMENT','Posicionamento ou empilhamento proibido.');
   p.board[action.cell].stack.push(action.color);s.hand.splice(at,1);break;
  }
  case 'takeCard':{
   requireRule(!s.tookCard,'CARD_LIMIT','Apenas uma carta por turno.');
   requireRule(p.cards.filter(h=>h.placed<(catalog.find(c=>c.id===h.id)?.points.length??0)).length<4,'ACTIVE_LIMIT','Você já tem quatro cartas ativas.');
   const id=s.animals[action.slot];
   requireRule(Number.isInteger(action.slot)&&id,'CARD','Carta indisponível.');
   p.cards.push({id,placed:0});s.animals[action.slot]=null;s.tookCard=true;break;
  }
  case 'placeAnimal':{
   const held=p.cards.find(c=>c.id===action.card),card=catalog.find(c=>c.id===action.card);
   requireRule(held&&card&&held.placed<card.points.length,'ANIMAL','Carta sem cubos disponíveis.');
   requireRule(action.mirrored===undefined||typeof action.mirrored==='boolean','MIRROR','Simetria inválida.');
   requireRule(!action.mirrored||(s.pulse&&card.allowMirror),'MIRROR','Espelhamento disponível somente para cartas Pulsar com a expansão ativa.');
   requireRule(habitatMatches(p.board,card,action.anchor,action.rotation,action.mirrored??false),'HABITAT','Habitat ou posição do cubo inválidos.');
   const a=p.board[action.anchor],v=orient(card.cube,action.rotation,action.mirrored??false);
   p.board[key({q:a.q+v.q,r:a.r+v.r})].animal=card.id;held.placed++;break;
  }
  case 'endTurn':{
   requireRule(s.selected!==null&&s.hand.length===0,'INCOMPLETE_TURN','Pegue e posicione as três peças antes de encerrar.');
   // A bolsa fica vazia ao fim de uma reposição; o gatilho ocorre na próxima reposição que a encontra vazia.
   if(s.bag.length===0)s.finalRound=true;
   else {requireRule(s.bag.length>=3,'BAG_CORRUPT','Bolsa inconsistente.');s.market[s.selected]=s.bag.splice(0,3);}
   s.animals=s.animals.map(c=>c??s.deck.shift()??null);
   if(Object.values(p.board).filter(c=>c.stack.length===0).length<=2)s.finalRound=true;
   p.turns++;
   if(s.finalRound&&s.players.every(player=>player.turns===s.players[0].turns))s.finished=true;
   else s.turn=(s.turn+1)%s.players.length;
   s.selected=null;s.hand=[];s.tookCard=false;break;
  }
  default:requireRule(false,'ACTION','Ação desconhecida.');
 }return s;
}
