import React,{useId} from 'react';
import type {Color} from '../engine/model.ts';

// Peças vetoriais com os motivos e cores dos discos de madeira das referências.
const palette:Record<Color,{top:string;light:string;edge:string;ink:string}>={
 blue:{top:'#058ca6',light:'#28a9bd',edge:'#07596a',ink:'#a3dfeb'},
 green:{top:'#969d27',light:'#b0b641',edge:'#626919',ink:'#e5e4a0'},
 brown:{top:'#a4643d',light:'#b67a50',edge:'#704025',ink:'#cf9c75'},
 yellow:{top:'#edb00c',light:'#ffca29',edge:'#b77c04',ink:'#fff0ae'},
 red:{top:'#e84350',light:'#f76c70',edge:'#a32432',ink:'#ffc0ad'},
 gray:{top:'#96938c',light:'#b1ada4',edge:'#64615d',ink:'#d6ddd9'}
};
export function GoldCube(props:React.SVGProps<SVGSVGElement>){
 const id=useId().replaceAll(':','');
 return <svg {...props} viewBox="0 0 30 34" className={`gold-cube ${props.className??''}`} aria-hidden="true" focusable="false">
 <defs><linearGradient id={`amber-${id}`} x2="1" y2="1"><stop stopColor="#ffe2a0" stopOpacity=".9"/><stop offset=".45" stopColor="#e69b20" stopOpacity=".48"/><stop offset="1" stopColor="#b96708" stopOpacity=".85"/></linearGradient></defs>
 <path d="m15 2 12 6v18l-12 6-12-6V8Z" fill={`url(#amber-${id})`} stroke="#c88926" strokeWidth=".8" strokeLinejoin="round"/>
 <path d="m3 8 12 6 12-6M15 14v18M15 2v17M3 26l12-7 12 7" fill="none" stroke="#d28d23" strokeWidth=".7" opacity=".7"/>
 <path d="m4 8 11-5 10 5-10 5Z" fill="#ffdc83" fillOpacity=".48" stroke="#ffe9b0" strokeWidth=".8"/>
 <path d="m4 10 9 5v14l-9-5Z" fill="#ffca67" fillOpacity=".26"/>
 <path d="m17 15 8-4v13l-8 5Z" fill="#a85d0a" fillOpacity=".24"/>
 <path d="m5 11 2 1v10l-2-1Zm12 5 2-1v10l-2 1Z" fill="#fff5d3" fillOpacity=".8"/>
 <path d="m7 7 7-3 4 2-7 3Z" fill="#fff6d7" fillOpacity=".92"/>
 <path d="m5 25 10 5 10-5" fill="none" stroke="#ffdf91" strokeWidth="1.1"/>
 <circle cx="20" cy="7" r="1" fill="#fff7d8"/>
 </svg>;
}
function Motif({color,ink}:{color:Color;ink:string}){
 if(color==='brown')return null;
 if(color==='blue')return <g fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round"><path d="M-23-13C-9-6-13 1 1-1S14-10 23-4M-25-4C-11 3-13 11 2 7S15-2 26 3M-22 8C-8 15-5 20 9 13S20 7 24 10M-13-21C-2-13-5-8 7-11S17-15 20-12M-13 21C-3 25 6 25 16 20"/></g>;
 if(color==='green')return <g fill={ink}><path d="M-12-7Q4-17 12 6Q-8 14-12-7M-17-20Q-8-19-12-9Q-21-13-17-20M8-22Q25-23 24-10Q12-7 8-22M-25-4Q-17-8-18 3Q-25 11-25-4M-15 13Q-5 9-8 20Q-18 25-15 13M2 13Q18 11 16 25Q3 26 2 13M21 6Q29 1 28 10Q22 16 21 6"/></g>;
 if(color==='red')return <g fill={ink} transform="rotate(-12)"><path d="M-9-9H9V9H-9Z"/><path d="M-21-15h7v10h-7ZM14-4h7V9h-7ZM-11 15H5v4h-16ZM-3-20h15v4H-3Z"/></g>;
 if(color==='gray')return <g fill={ink}><path d="m-11-10 8-4 10 2 6 8-3 12-10 4-12-6Z"/><path d="m-23-16 9 2-5 8Zm31-8 8 7-9 2Zm13 13 6 9-9 1ZM-25 7l9-3-1 10ZM8 19l10-5-3 11ZM-9 20l6 6-10-1Z"/></g>;
 return <g fill={ink}>{[[0,0,1.1],[-19,-12,.48],[20,-10,.5],[-18,15,.42],[18,17,.48]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0C-15-7-12-18-3-13Q2-11 0 0C2-15 16-15 14-5Q12 1 0 0C15 1 18 14 8 15Q1 14 0 0C0 16-14 19-15 9Q-15 2 0 0"/><circle r="2.5"/></g>)}</g>;
}
export function PieceArt({color,...props}:{color:Color}&React.SVGProps<SVGSVGElement>){
 const id=useId().replaceAll(':',''),p=palette[color];
 return <svg {...props} viewBox="0 0 80 70" className={`piece-art ${props.className??''}`} aria-hidden="true" focusable="false">
 <defs><linearGradient id={`edge-${id}`} x2="1" y2="0"><stop stopColor={p.edge}/><stop offset=".4" stopColor={p.top}/><stop offset="1" stopColor={p.edge}/></linearGradient><linearGradient id={`face-${id}`} x2=".8" y2="1"><stop stopColor={p.light}/><stop offset="1" stopColor={p.top}/></linearGradient><clipPath id={`grain-${id}`}><ellipse cx="40" cy="28" rx="27.5" ry="18.5"/></clipPath></defs>
 <ellipse cx="40" cy="48" rx="27" ry="11" fill="#24190d" opacity=".12"/>
 <path d="M12.5 28a27.5 18.5 0 0 1 55 0v13a27.5 18.5 0 0 1-55 0Z" fill={`url(#edge-${id})`} stroke={p.edge} strokeWidth=".8"/>
 <path d="M14 42Q40 65 66 42" fill="none" stroke={p.light} strokeOpacity=".3" strokeWidth=".8"/>
 <ellipse cx="40" cy="28" rx="27.5" ry="18.5" fill={`url(#face-${id})`} stroke={p.light} strokeWidth=".7"/>
 <g transform="translate(40 28) scale(.9 .59)"><Motif color={color} ink={p.ink}/></g>
 <g clipPath={`url(#grain-${id})`} fill="none" stroke={color==='brown'?'#dfb894':'#fff5dc'} strokeWidth=".35" opacity=".13">{Array.from({length:13},(_,i)=><path key={i} d={`M10 ${12+i*3}Q28 ${9+i*3} 42 ${13+i*3}T72 ${12+i*3}`}/>)}</g>
 <path d="M17 20Q40 3 63 20" fill="none" stroke="#fff5d5" strokeOpacity=".3" strokeWidth=".8"/>
 </svg>;
}
