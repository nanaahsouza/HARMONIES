import type {AnimalCard} from './model.ts';
import {requireRule} from './model.ts';
import {VERIFIED_CARDS} from './animals.ts';
import {PULSE_CARDS} from './pulse.ts';
// Não são inseridos padrões de memória. Veja docs/CARTAS.md.
export const CATALOG:AnimalCard[]=VERIFIED_CARDS;
export const PULSE_CATALOG:AnimalCard[]=PULSE_CARDS;
export const catalogFor=(pulse=false):AnimalCard[]=>pulse?[...CATALOG,...PULSE_CATALOG]:CATALOG;
export function validateCatalog(cards:AnimalCard[],pulse=false):void {
 const expected=pulse?42:32;
 requireRule(cards.length===expected,'CATALOG_INCOMPLETE',`Catálogo oficial incompleto: ${cards.length}/${expected} cartas verificadas. Início bloqueado.`);
 requireRule(new Set(cards.map(c=>c.id)).size===expected,'CATALOG_INVALID','Identificadores de cartas repetidos.');
 requireRule(cards.filter(c=>c.expansion==='pulse').length===(pulse?10:0),'CATALOG_INVALID','Composição do baralho não corresponde ao modo escolhido.');
 for(const c of cards){
  requireRule(c.verified&&!!c.source.url&&!!c.source.diagram,'CATALOG_UNVERIFIED','Carta sem verificação visual.');
  requireRule(c.pattern.length>0&&c.points.length>0&&c.points.every(Number.isFinite),'CATALOG_INVALID','Carta sem padrão ou pontuação.');
  requireRule(c.pattern.some(p=>p.q===c.cube.q&&p.r===c.cube.r),'CATALOG_INVALID','Destino do cubo fora do padrão.');
  requireRule(c.rotations.length===6&&new Set(c.rotations).size===6&&c.rotations.every(n=>Number.isInteger(n)&&n>=0&&n<6),'CATALOG_INVALID','Rotações inválidas.');
 }
}
export const catalogStatus=(pulse=false)=>{const cards=catalogFor(pulse),expected=pulse?42:32;return {expected,verified:cards.filter(c=>c.verified).length,ready:cards.length===expected&&cards.every(c=>c.verified)};};
