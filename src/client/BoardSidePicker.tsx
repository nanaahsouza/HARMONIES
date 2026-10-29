import React,{useId} from 'react';
import type {Side} from '../engine/model.ts';
import {emptyBoard} from '../engine/geometry.ts';
const cells=Object.values(emptyBoard());
function BoardPreview({side}:{side:Side}){
 const id=useId().replaceAll(':','');
 return <svg className="board-choice-image" viewBox="0 0 733 519" aria-hidden="true" focusable="false">
  <defs><clipPath id={`${id}-edge`}><path d="M38 1H703Q730 1 730 28L731 210C731 414 625 518 370 518C116 518 15 414 15 220L14 25Q14 1 38 1Z"/></clipPath><linearGradient id={`${id}-sea`} x2=".8" y2="1"><stop stopColor="#7ca5a6"/><stop offset="1" stopColor="#3f7887"/></linearGradient></defs>
  <g clipPath={`url(#${id}-edge)`}>{side==='A'?<image href="/assets/personal-board.jpeg" width="733" height="519"/>:<>
   <path d="M0 0H733V519H0Z" fill={`url(#${id}-sea)`}/>
   <path d="M0 40 100 25 135 70 116 122 165 150 120 196 55 182 0 209ZM605 0 584 53 620 98 680 91 733 127V0ZM0 350 62 327 110 370 81 421 140 475 105 519H0ZM550 390 605 365 675 386 733 357V519H569L528 475Z" fill="#a3ac97" opacity=".8"/>
   <path d="M5 225Q85 199 139 237M29 283Q88 251 147 286M566 145Q651 173 731 145M596 291Q667 318 733 280M158 476Q300 498 442 477" fill="none" stroke="#bad0c6" strokeWidth="4" opacity=".6"/>
   {[52,96,637,681].map((x,i)=><g key={x} transform={`translate(${x} ${i<2?60:405})`} fill="#486c67"><path d="M0 0-9 21H9ZM0 11-12 28H12Z"/><path d="M-2 25H2V34H-2Z"/></g>)}
   {cells.map(c=>{const row=c.r+Math.floor(c.q/2),x=212+c.q*80.5+row*.9,y=83+row*80+(c.q%2?39:0);return <polygon key={`${c.q},${c.r}`} points="48,0 24,36 -24,36 -48,0 -24,-36 24,-36" transform={`translate(${x} ${y})`} fill="#ece7d8" stroke="#6d8a87" strokeWidth="3" strokeLinejoin="round"/>;})}
  </>}</g>
 </svg>;
}
export function BoardSidePicker({value,onChange,disabled}:{value:Side;onChange:(side:Side)=>void;disabled:boolean}){
 return <fieldset className="board-side-picker"><legend>Lado do tabuleiro</legend><div className="board-side-options">{(['A','B'] as const).map(side=><label key={side} className={`board-side-option ${value===side?'chosen-board':''}`}><input type="radio" name="board-side" value={side} checked={value===side} disabled={disabled} onChange={()=>onChange(side)}/><BoardPreview side={side}/><span className="board-choice-title">{side==='A'?'A · Rio':'B · Ilhas'}<b aria-hidden="true">{value===side?'✓':''}</b></span><small>{side==='A'?'Forme seu maior rio':'Separe a paisagem em ilhas'}</small></label>)}</div></fieldset>;
}
