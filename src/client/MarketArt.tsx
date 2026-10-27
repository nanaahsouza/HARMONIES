import React from 'react';
const outline='M169 45C148 4 89 3 66 41C44 74 53 115 77 140L53 165C7 168-10 216 11 253C28 286 66 301 103 282L137 309C122 352 151 390 193 394C238 398 271 363 263 324L286 302L345 329L329 281C375 281 405 245 393 205C384 173 354 157 327 161L314 135C349 105 346 59 319 33C289 4 244 12 222 46Q194 41 169 45Z';
export function MarketArt(){
 return <svg className="market-art" viewBox="0 0 400 400" aria-hidden="true"><defs>
 <clipPath id="market-outline"><path d={outline}/></clipPath>
 <radialGradient id="market-wood"><stop stopColor="#454138"/><stop offset="1" stopColor="#252923"/></radialGradient>
 <radialGradient id="market-well"><stop offset="0" stopColor="#c7ae72"/><stop offset=".78" stopColor="#b59a63"/><stop offset="1" stopColor="#9a835800"/></radialGradient>
 <pattern id="market-leaves" width="73" height="67" patternUnits="userSpaceOnUse"><g fill="#c4ad75" opacity=".65"><path d="M8 8q12 1 9 12Q7 18 8 8m43 22q-12 3-8 12 10-2 8-12M29 51l5 9 5-8Z"/><path d="m16 35 5-3 3 6-5 3ZM60 52h4v8h-4Z"/><circle cx="37" cy="14" r="2"/><circle cx="40" cy="17" r="2"/><circle cx="35" cy="18" r="2"/></g><path d="M4 62q16-13 15-29M49 6q-9 17 2 27M25 9l4 5" fill="none" stroke="#141b16" strokeWidth=".8" opacity=".65"/></pattern>
 <pattern id="market-grain" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h1m1 2h1" stroke="#e4d6ae" strokeOpacity=".09" strokeWidth=".5"/></pattern>
 </defs><path d={outline} fill="url(#market-wood)" stroke="#c1b18c" strokeWidth="1.4"/>
 <g clipPath="url(#market-outline)"><path d={outline} fill="url(#market-leaves)"/>{[[115,85],[282,80],[332,220],[205,330],[65,230]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="57" fill="url(#market-well)"/><path d={`M${x-38} ${y-47}q25 43 17 96m18-100q-5 43 22 90m-65-42 78-6`} fill="none" stroke="#3e392b" strokeWidth="1.5" opacity=".8"/><circle cx={x-20} cy={y+27} r="2" fill="#746139" opacity=".3"/><circle cx={x+17} cy={y+30} r="1" fill="#746139" opacity=".4"/></g>)}
 <path d="M319 308L191 244C158 230 153 206 166 185C180 161 213 158 234 179L326 297" fill="#887448" fillOpacity=".17" stroke="#d1b878" strokeWidth="1"/>
 <ellipse cx="197" cy="202" rx="26" ry="36" transform="rotate(-39 197 202)" fill="#1d241d" opacity=".9"/>
 <g transform="translate(195 200) rotate(-39)" fill="#b99f66"><path d="M-9-14h18v27H-9ZM-5-20H5v7H-5ZM-12-8h24v4h-24Z"/><path d="M-2-8h4v13h-4Z" fill="#f1dca5"/></g>
 <path d="m319 291 14 20-23-11Z" fill="#f6df9f"/><path d="m309 290 13 10m-10-14 13 10" stroke="#e5cd8e" strokeWidth="1.5"/>
 <path d={outline} fill="url(#market-grain)"/>
 </g></svg>;
}
