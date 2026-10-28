import React,{useId,useRef} from 'react';
import {AVATAR_IDS,type AvatarId} from '../shared/avatars.ts';
const labels:Record<AvatarId,string>={corvo:'Corvo',lontra:'Lontra',coala:'Coala',leao:'Leão'};
export function Avatar({value,className=''}:{value:AvatarId;className?:string}){
 return <span className={`animal-avatar ${className}`} aria-hidden="true">{value!=='coala'?<img src={value==='leao'?'/assets/game-icon.png':`/assets/avatar-${value}.png`} alt=""/>:<svg viewBox="0 0 100 100" focusable="false"><image href="/assets/animal-cards.webp" x="-1400" y="-359" width="2000" height="1720" preserveAspectRatio="none"/></svg>}</span>;
}
export function AvatarChoices({value,busy,onSelect}:{value:AvatarId;busy:boolean;onSelect:(avatar:AvatarId)=>void}){
 return <div className="avatar-options">{AVATAR_IDS.map(id=><button type="button" key={id} aria-label={`Usar avatar ${labels[id]}`} aria-pressed={value===id} disabled={busy} onClick={()=>onSelect(id)}><Avatar value={id}/><span>{labels[id]}</span></button>)}</div>;
}
export function AvatarPicker({value,busy,onSelect,compact=false}:{value:AvatarId;busy:boolean;onSelect:(avatar:AvatarId)=>void;compact?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),title=useId();
 return <><button className={`avatar-picker-trigger ${compact?'compact-avatar-picker':''}`} aria-label="Escolher meu avatar" title="Escolher meu avatar" onClick={()=>dialog.current?.showModal()}><Avatar value={value}/>{!compact&&<span>Escolher avatar</span>}</button><dialog className="avatar-dialog" ref={dialog} aria-labelledby={title}><button className="avatar-dialog-close" aria-label="Fechar escolha de avatar" onClick={()=>dialog.current?.close()}>×</button><h2 id={title}>Seu animal</h2><p>Escolha uma imagem para representar você na sala.</p><div className="avatar-options">{AVATAR_IDS.map(id=><button key={id} aria-pressed={value===id} disabled={busy} onClick={()=>{onSelect(id);dialog.current?.close();}}><Avatar value={id}/><span>{labels[id]}</span>{value===id&&<small>Selecionado</small>}</button>)}</div></dialog></>;
}
