export type Color = 'blue'|'gray'|'brown'|'green'|'yellow'|'red';
export type Side = 'A'|'B';
export type Coord = {q:number;r:number};
export type Cell = Coord & {stack:Color[];animal:string|null};
export type Board = Record<string,Cell>;
export type Requirement = Coord & {color:Color;height:number};
export type AnimalCard = {
 id:string; officialName:string|null; label:string; points:number[];
 pattern:Requirement[]; cube:Coord; rotations:number[];
 source:{url:string;diagram:string}; verified:boolean;
 expansion?:'pulse';allowMirror?:boolean;
};
export type HeldCard = {id:string;placed:number};
export type Player = {board:Board;cards:HeldCard[];turns:number};
export type Game = {
 pulse?:boolean;
 side:Side;players:Player[];bag:Color[];deck:string[];
 market:Color[][];animals:(string|null)[];turn:number;first:number;
 selected:number|null;hand:Color[];tookCard:boolean;
 finalRound:boolean;finished:boolean;endReason?:'host';
};
export type Action =
 | {type:'takeTokens';slot:number}
 | {type:'placeToken';color:Color;cell:string}
 | {type:'takeCard';slot:number}
 | {type:'placeAnimal';card:string;anchor:string;rotation:number;mirrored?:boolean}
 | {type:'endTurn'};
export const COLORS:Color[]=['blue','gray','brown','green','yellow','red'];
// Manual BR, p. 2: estes números somam 120, não 20 de cada cor.
export const COUNTS:Record<Color,number>={blue:23,gray:23,brown:21,green:19,yellow:19,red:15};
export class RuleError extends Error {
 code:string;
 constructor(code:string,message:string){super(message);this.code=code;}
}
export function requireRule(ok:unknown,code:string,message:string):asserts ok {
 if(!ok)throw new RuleError(code,message);
}
