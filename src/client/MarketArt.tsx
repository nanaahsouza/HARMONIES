import React,{useId} from 'react';

// Cinco espaços arredondados, como a reserva física; as peças continuam interativas por cima.
const outline='M182 48C159 12 109 14 80 33C49 52 49 91 65 116L47 143C15 147 4 175 10 204C16 237 49 257 83 250L113 242L174 275C167 306 191 337 226 344C269 353 304 330 308 297L308 276L350 246C382 258 420 243 435 217C454 183 436 147 403 137L370 129L353 104C373 75 359 36 330 16C299 -5 255 2 235 31L222 45Z';
const wells=[[117,78],[297,64],[385,185],[242,284],[64,200]];
export function MarketArt(){
 const id=useId().replace(/:/g,'');
 const ref=(name:string)=>`url(#${id}-${name})`;
 return <svg className="market-art" viewBox="0 0 450 350" aria-hidden="true"><defs>
  <clipPath id={`${id}-outline`}><path d={outline}/></clipPath>
  <radialGradient id={`${id}-wood`} cx="45%" cy="38%" r="75%"><stop stopColor="#49422c"/><stop offset=".65" stopColor="#353223"/><stop offset="1" stopColor="#24271e"/></radialGradient>
  <radialGradient id={`${id}-well`}><stop stopColor="#b79b62"/><stop offset=".74" stopColor="#a88e58"/><stop offset=".94" stopColor="#8b764c"/><stop offset="1" stopColor="#615438"/></radialGradient>
  <pattern id={`${id}-leaves`} width="79" height="71" patternUnits="userSpaceOnUse"><g fill="#c7b37b" opacity=".52"><path d="M8 8q12 1 9 12Q7 18 8 8m43 22q-12 3-8 12 10-2 8-12M29 51l5 9 5-8Zm-13-16 5-3 3 6-5 3ZM60 52h4v8h-4Z"/><path d="M36 12q4-7 6-1 6-2 4 3 3 5-3 5-4 5-6 0-6-1-1-7Z"/></g><path d="M4 62q16-13 15-29M49 6q-9 17 2 27M25 9l4 5M65 25q7 18 2 31" fill="none" stroke="#151c15" strokeWidth=".8" opacity=".55"/></pattern>
  <filter id={`${id}-paper`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed="17"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".13"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
 </defs>
 <path d={outline} transform="translate(0 2)" fill="#171c17" opacity=".7"/>
 <g clipPath={ref('outline')}>
  <path d={outline} fill={ref('wood')}/>
  <path d={outline} fill={ref('leaves')}/>
  {wells.map(([x,y],i)=><g key={i}>
   <circle cx={x} cy={y} r="61" fill={ref('well')} stroke="#27291d" strokeWidth="2"/>
   <path d={`M${x-39} ${y-47}Q${x-12} ${y-4} ${x-31} ${y+49}M${x+3} ${y-58}Q${x+26} ${y+2} ${x+5} ${y+59}M${x+36} ${y-46}Q${x+49} ${y+1} ${x+34} ${y+46}`} fill="none" stroke="#4d432c" strokeWidth="1.8" opacity=".8"/>
   {[[-28,21],[22,-33],[-13,-42],[37,25],[9,39]].map(([dx,dy],j)=><circle key={j} cx={x+dx} cy={y+dy} r={j%2?1.5:2.5} fill="#5e5033" opacity=".2"/>)}
  </g>)}
  <path d={outline} fill="transparent" filter={ref('paper')}/>
 </g>
 <path d={outline} fill="none" stroke="#887b57" strokeWidth="1.3"/>
 </svg>;
}
