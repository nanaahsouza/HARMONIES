import React,{useEffect,useState,useId} from 'react';
import {createRoot} from 'react-dom/client';
import type {Store} from '../server/store.ts';
import type {AnimalCard,Board,Color} from '../engine/model.ts';
import {PieceArt,GoldCube} from './PieceArt.tsx';
import {MarketArt} from './MarketArt.tsx';
import {FitTable} from './FitTable.tsx';
import {ScoreSheet} from './ScoreSheet.tsx';

import './style.css';
import './modern.css';
import './ios.css';
import './pulse.css';
import './workspace.css';
import './table.css';
import './palette.css';
import './scene.css';
type State=ReturnType<Store['public']>;
type Hint={anchor:string;rotation:number;mirrored?:boolean;destination:string};
type Envelope={id:string;revision:number;action:Record<string,unknown>};
const names:Record<Color,string>={blue:'Água',gray:'Montanha',brown:'Tronco',green:'Copa',yellow:'Campo',red:'Construção'};
const colors:Record<Color,string>={blue:'#3a91a3',gray:'#7b858b',brown:'#996c4a',green:'#6c963f',yellow:'#e6b34f',red:'#c56858'};
const credentialKey=(code:string)=>`harmonies:session:${code}`;
function token(code:string){return localStorage.getItem(credentialKey(code))??'';}
function actionId(){
 // randomUUID exige contexto seguro; getRandomValues também funciona no HTTP da rede local.
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 return Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
}
async function request(path:string,method='GET',data?:unknown,secret=''){
 const res=await fetch(path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(secret?{Authorization:`Bearer ${secret}`}:{})},body:data?JSON.stringify(data):undefined});
 const json=await res.json();if(!res.ok)throw Object.assign(new Error(json.message??'Falha de conexão.'),{code:json.code});return json;
}
function Token({color,height=1}:{color:Color;height?:number}){return <span className="token token-illustrated" title={`${names[color]}, altura ${height}`} role="img" aria-label={names[color]}><PieceArt color={color}/>{height>1&&<small>{height}</small>}</span>;}
function Scenery(){return <svg viewBox="0 0 600 330" role="img" aria-label="Paisagem original com montanhas, rio e árvores"><circle cx="430" cy="88" r="43" fill="#eac47e"/><path d="M0 253 152 65 286 249 378 126 600 274V330H0Z" fill="#a7b7ac"/><path d="m95 135 57-70 51 70-37-19-21 17-20-12Z" fill="#f4f0e4"/><path d="M0 260Q140 193 286 257T600 246V330H0Z" fill="#627f64"/><path d="M600 239Q433 239 375 276T220 330H413Q382 301 463 284T600 265Z" fill="#77b6bb"/>{[65,113,490,537].map((x,i)=><g key={x} transform={`translate(${x} ${175+i%2*20})`}><path d="M-5 31h10v80H-5z" fill="#8e684a"/><path d="M0-42 36 46H-36Z" fill="#355d4a"/><path d="M0-12 44 77H-44Z" fill="#436e53"/></g>)}</svg>;}
function Landscape({board,legal=[],onCell,label}:{board:Board;legal?:string[];onCell?:(id:string)=>void;label:string}){
 const clipId=useId().replaceAll(':','');
 return <svg className="board board-reference" viewBox="0 0 733 519" role="group" aria-label={label}><defs><clipPath id={clipId}><path d="M38 1H703Q730 1 730 28L731 210C731 414 625 518 370 518C116 518 15 414 15 220L14 25Q14 1 38 1Z"/></clipPath>{Object.entries(colors).map(([color,value])=><linearGradient key={color} id={`piece-${color}`} x2="0" y2="1"><stop stopColor={value}/><stop offset="1" stopColor={value} stopOpacity=".8"/></linearGradient>)}</defs><image href="/assets/personal-board.jpeg" width="733" height="519" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid meet"/>{Object.entries(board).map(([id,c])=>{
  // Coordenadas visuais calibradas na imagem fornecida; as coordenadas de regras não mudam.
  const row=c.r+Math.floor(c.q/2),x=212+c.q*80.5+row*.9,y=83+row*80+(c.q%2?39:0),top=c.stack.at(-1),allowed=legal.includes(id);
  const activate=()=>onCell?.(id);
  return <g key={id} transform={`translate(${x} ${y})`} role={onCell?'button':undefined} tabIndex={onCell?0:undefined} aria-label={`${id}: ${top?names[top]+', altura '+c.stack.length:'vazio'}${c.animal?', com animal':''}${allowed?', posição disponível':''}`} onClick={activate} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}}} className={`${onCell?'cell clickable':'cell'} ${allowed?'legal':''}`}>
   <polygon points="48,0 24,36 -24,36 -48,0 -24,-36 24,-36"/>
   {top&&<><ellipse cy="22" rx="29" ry="18" fill="#3c2f2733"/>{c.stack.map((color,i)=><g key={i} transform={`translate(0 ${8-i*16})`}><PieceArt color={color} x="-42" y="-35" width="84" height="73.5"/></g>)}{c.stack.length>1&&<g className="stack-height" transform="translate(29 18)"><circle r="9" fill="#f7e9bd" stroke="#8d744a"/><text className="height" y="4">{c.stack.length}</text></g>}</>}
   {c.animal&&<g><ellipse cx="0" cy={2-(c.stack.length-1)*16} rx="10" ry="4" fill="#5d310a" opacity=".25"/><GoldCube x="-12" y={-26-(c.stack.length-1)*16} width="24" height="28"/></g>}
   <text y="32" className="coordinate">{id}</text>
  </g>;
 })}</svg>;
}
function Pattern({card}:{card:AnimalCard}){
 const points=card.pattern.map(p=>({p,x:p.q*40,y:(p.r+p.q/2)*46})),minX=Math.min(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),w=Math.max(...points.map(p=>p.x))-minX+60,h=Math.max(...points.map(p=>p.y))-minY+60;
 return <svg className="pattern" viewBox={`0 0 ${w} ${h}`} aria-label="Diagrama do habitat">{points.map(({p,x,y},i)=>{
  const stackColors:Color[]=[...Array<Color>(p.height-1).fill(p.color==='green'||p.color==='red'?'brown':p.color),p.color];
  return <g key={i} transform={`translate(${x-minX+30} ${y-minY+30})`}><polygon points="27,0 13.5,23 -13.5,23 -27,0 -13.5,-23 13.5,-23" fill="#f3ecd9" stroke="#d3c9af"/>{stackColors.map((color,j)=><PieceArt key={j} color={color} x="-28" y={-23-j*8} width="56" height="49"/>)}{p.height>1&&<text className="height diagram-height" x="19" y="13">{p.height}</text>}{p.q===card.cube.q&&p.r===card.cube.r&&<GoldCube x="-9" y={-24-(p.height-1)*8} width="18" height="21"/>}</g>;
 })}</svg>;
}
function CardArt({card,placed,onInspect,onSelect,onTake,disabled=false,selected=false}:{card:AnimalCard;placed?:number;onInspect:()=>void;onSelect?:()=>void;onTake?:()=>void;disabled?:boolean;selected?:boolean}){
 const index=Number(card.id.slice(-2))-1;
 const requirements=card.pattern.map(p=>`${names[p.color]}, altura ${p.height}, posição ${p.q},${p.r}`).join('; ');
 if(card.expansion==='pulse'){
  // Enquadramento da fotografia original; nenhum elemento da carta é redesenhado.
  const crops=[[80,94,298,472],[390,94,292,467],[716,94,291,467],[1027,94,292,467],[1337,94,303,467],[52,619,323,509],[394,618,295,507],[715,617,302,506],[1031,609,301,508],[1350,606,313,509]];
  const [x,y,w,h]=crops[Number(card.id.slice(-2))-1];
  return <button className={`card-art pulse-original-photo ${selected?'animal-selected':''}`} disabled={disabled} onClick={onTake??onSelect??onInspect} aria-pressed={onSelect?selected:undefined} aria-label={`${onTake?'Pegar carta':onSelect?'Selecionar cubo de':'Ampliar carta'} ${card.label}. Habitat: ${requirements}`} style={{backgroundImage:"url('/assets/pulse-cards-original-photo.png')",backgroundSize:`${1726/w*100}% ${1200/h*100}%`,backgroundPosition:`${x/(1726-w)*100}% ${y/(1200-h)*100}%`}}>
   {placed!==undefined&&card.points.map((_,i)=>i>=placed&&<span key={i} aria-hidden="true" className="animal-cube" style={{top:`${2+(card.points.length-1-i)*17.6}%`}}><GoldCube/></span>)}
  </button>;
 }
 return <button className={`card-art ${selected?"animal-selected":""}`} disabled={disabled} onClick={onTake??onSelect??onInspect} aria-pressed={onSelect?selected:undefined} aria-label={`${onTake?"Pegar carta":onSelect?"Selecionar cubo de":"Ampliar carta"} ${card.officialName??card.label}. Habitat: ${requirements}`} style={{'--art-x':`${(index%10)*100/9}%`,'--art-y':`${Math.floor(index/10)*25}%`} as React.CSSProperties}>
  {placed!==undefined&&card.points.map((_,i)=>i>=placed&&<span key={i} aria-hidden="true" className="animal-cube" style={{top:`${2+(card.points.length-1-i)*17.6}%`}}><GoldCube/></span>)}
 </button>;
}
function App(){
 const initial=new URLSearchParams(location.search).get('room')?.toUpperCase()??'';
 const [code,setCode]=useState(initial),[state,setState]=useState<State|null>(null),[name,setName]=useState(''),[joinCode,setJoinCode]=useState(initial),[error,setError]=useState(''),[notice,setNotice]=useState(''),[connection,setConnection]=useState('Desconectado'),[busy,setBusy]=useState(false),[selectedColor,setSelectedColor]=useState<Color|null>(null),[selectedCard,setSelectedCard]=useState(''),[selectedHint,setSelectedHint]=useState<Hint|null>(null);
 const [sessionSecret,setSessionSecret]=useState(()=>token(initial));
 const [previewCard,setPreviewCard]=useState<AnimalCard|null>(null);
 const [playerCount,setPlayerCount]=useState(2),[confirmEnd,setConfirmEnd]=useState(false);
 useEffect(()=>{if(!previewCard&&!confirmEnd)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPreviewCard(null);setConfirmEnd(false);}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[previewCard,confirmEnd]);
 const setNew=(s:State)=>setState(old=>!old||s.code!==old.code||s.revision>=old.revision?s:old);
 useEffect(()=>{
  if(!code||!token(code))return;
  const ctrl=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;let attempt=0;
  async function connect(){
   if(ctrl.signal.aborted)return;setConnection(attempt?'Reconectando…':'Conectando…');
   try{
    const res=await fetch(`/api/rooms/${code}/events`,{headers:{Authorization:`Bearer ${token(code)}`},signal:ctrl.signal});
    if(!res.ok){const data=await res.json();throw new Error(data.message);}
    setConnection('Conectado');attempt=0;const reader=res.body!.getReader(),decoder=new TextDecoder();let buffer='';
    while(!ctrl.signal.aborted){const {done,value}=await reader.read();if(done)throw new Error('Conexão interrompida.');buffer+=decoder.decode(value,{stream:true});let at:number;
     while((at=buffer.indexOf('\n\n'))!==-1){const event=buffer.slice(0,at);buffer=buffer.slice(at+2);if(event.startsWith('data: '))setNew(JSON.parse(event.slice(6)));}
    }
   }catch(e){if(!ctrl.signal.aborted){setConnection('Reconectando…');if(attempt===0)setNotice('Conexão interrompida. A partida continua salva no servidor.');timer=setTimeout(connect,Math.min(1000*2**attempt++,10000));}}
  }connect();return()=>{ctrl.abort();clearTimeout(timer);};
 },[code,sessionSecret]);
 async function enter(create:boolean){setBusy(true);setError('');try{
  const target=joinCode.trim().toUpperCase();const result=await request(create?'/api/rooms':`/api/rooms/${target}/join`,'POST',create?{name,playerCount}:{name});
  localStorage.setItem(credentialKey(result.state.code),result.token);setSessionSecret(result.token);setCode(result.state.code);setNew(result.state);history.replaceState({},'',`?room=${result.state.code}`);
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function act(action:Record<string,unknown>,retry=false){
  if(!state||busy)return;setBusy(true);setError('');
  const storageKey=`harmonies:pending:${code}`,saved=localStorage.getItem(storageKey);
  if(saved&&!retry){setError('Existe uma ação sem confirmação. Use “Reenviar ação” antes de continuar.');setBusy(false);return;}
  const envelope:Envelope=retry&&saved?JSON.parse(saved):{id:actionId(),revision:state.revision,action};localStorage.setItem(storageKey,JSON.stringify(envelope));
  try{const result=await request(`/api/rooms/${code}/actions`,'POST',envelope,token(code));localStorage.removeItem(storageKey);setNew(result);setSelectedHint(null);setSelectedColor(null);setSelectedCard('');}
  catch(e){const err=e as Error&{code?:string};if(err.code){localStorage.removeItem(storageKey);if(err.code==='REVISION'){try{setNew(await request(`/api/rooms/${code}`,'GET',undefined,token(code)));}catch{}}}setError(err.message);}
  finally{setBusy(false);}
 }
 const game=state?.game,mine=state?.seat??0,myTurn=!!game&&game.turn===mine&&!game.finished;
 const hints=game?.hints.animals as Record<string,Hint[]>|undefined;
 const legal=selectedColor?(game?.hints.tokens as Record<string,string[]>|undefined)?.[selectedColor]??[]:selectedCard?[...new Set((hints?.[selectedCard]??[]).map(h=>h.destination))]:[];
 const pending=code&&localStorage.getItem(`harmonies:pending:${code}`);
 return <><header><a className="wordmark" href="/">harmonies<span>PAISAGENS COMPARTILHADAS</span></a><span className={`connection ${connection==='Conectado'?'online':''}`}><i/>{connection}</span></header><main>
 {error&&<div className="alert" role="alert">{error}<button className="text-button" onClick={()=>setError('')}>Fechar</button></div>}
 {notice&&<div className="notice" role="status">{notice}<button className="text-button" onClick={()=>setNotice('')}>Fechar</button></div>}
 {pending&&!busy&&<div className="notice">Uma ação ainda não foi confirmada.<button disabled={busy} onClick={()=>act({},true)}>Reenviar ação</button></div>}
 {!state?<div className="welcome"><section className="intro"><p className="eyebrow">UM ENCONTRO ENTRE PAISAGENS COMPARTILHADAS</p><h1>Um mundo pequeno.<br/><em>Muitas possibilidades.</em></h1><p>Construa sua paisagem, acolha os animais e compartilhe uma partida com 2 a 4 pessoas.</p><Scenery/><p className="caption">Implementação independente · jogo de Johan Benvenuto</p></section><section className="panel entrance"><span className="step">01 / ENCONTREM-SE</span><h2>Sua próxima paisagem</h2><p>Crie uma sala privada e compartilhe o convite com os participantes.</p><label>Seu nome<input maxLength={30} value={name} onChange={e=>setName(e.target.value)} placeholder="Como você quer aparecer?" autoComplete="nickname"/></label><label>Número de jogadores<select value={playerCount} onChange={e=>setPlayerCount(Number(e.target.value))}><option value="2">2 jogadores</option><option value="3">3 jogadores</option><option value="4">4 jogadores</option></select></label><button className="primary" disabled={busy||!name.trim()} onClick={()=>enter(true)}>Criar uma sala <span>↗</span></button><div className="divider">ou entre com um código</div><label>Código da sala<input value={joinCode} maxLength={12} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="CÓDIGO DE 12 CARACTERES" className="code-input"/></label><button disabled={busy||!name.trim()||joinCode.length!==12} onClick={()=>enter(false)}>Entrar na sala</button><div className="small-note">O estado fica no servidor. Volte pelo mesmo navegador para recuperar sua sessão.</div><div className="development">Jogo-base com opção de adicionar a expansão Pulsar. Escolham o modo na preparação da sala.</div></section></div>:<>
 <section className="room-bar"><a className="room-home home-link" href="/">⌂ Início</a><div><p className="eyebrow">SALA PRIVADA</p><strong className="room-code">{code}</strong></div><button onClick={async()=>{try{await navigator.clipboard.writeText(`${location.origin}/?room=${code}`);setNotice('Link copiado.');}catch{setNotice(`Compartilhe: ${location.origin}/?room=${code}`);}}}>Copiar convite ↗</button><span className="edition-badge">{state.pulse?"Base + Pulsar":"Jogo-base"}</span><div className="players">{state.seats.map((s,i)=><span key={i} className="player-chip"><b className="player-avatar" aria-hidden="true">{s.name.trim().slice(0,1).toUpperCase()}</b><i className={s.connected?'dot on':'dot'}/>{s.name}{i===mine?' (você)':''}{s.ready?' ✓':''}</span>)}{!game&&state.seats.length<state.playerCount&&<span className="muted">{state.seats.length}/{state.playerCount} presentes · aguardando participantes…</span>}</div></section>
 {!game?<div className="lobby"><section className="panel"><p className="eyebrow">02 / PREPAREM A PARTIDA</p><h1>Escolhas compartilhadas</h1><p>Todos usam o mesmo lado do tabuleiro. O primeiro a jogar é quem viu uma paisagem magnífica mais recentemente.</p><label>Número de jogadores<select aria-label="Número de jogadores da sala" value={state.playerCount} disabled={mine!==0||busy} onChange={e=>act({type:'configure',side:state.side,first:state.first,pulse:state.pulse,playerCount:Number(e.target.value)})}>{[2,3,4].map(n=><option key={n} value={n} disabled={n<state.seats.length}>{n} jogadores</option>)}</select></label><label>Lado dos tabuleiros<select value={state.side} disabled={mine!==0||busy} onChange={e=>act({type:'configure',side:e.target.value,first:state.first,pulse:state.pulse})}><option value="A">A · O rio</option><option value="B">B · As ilhas</option></select></label><label>Primeiro jogador<select value={state.first} disabled={mine!==0||busy} onChange={e=>act({type:'configure',side:state.side,first:Number(e.target.value),pulse:state.pulse})}>{state.seats.map((s,i)=><option key={i} value={i}>{s.name}</option>)}</select></label><label className="expansion-setting"><span><strong>Expansão Pulsar</strong><small>10 novas cartas e padrões espelhados</small></span><input type="checkbox" role="switch" aria-label="Jogar com a expansão Pulsar" checked={state.pulse} disabled={mine!==0||busy} onChange={e=>act({type:"configure",side:state.side,first:state.first,pulse:e.target.checked})}/></label><p className="expansion-summary">{state.pulse?"Base + Pulsar · 42 cartas de animais":"Somente jogo-base · 32 cartas de animais"}</p><button className="primary" disabled={busy} onClick={()=>act({type:'ready',ready:!state.seats[mine].ready})}>{state.seats[mine].ready?'Retirar minha confirmação':'Confirmar preparação'}</button>{mine===0&&<button disabled={busy||state.seats.length!==state.playerCount||!state.seats.every(s=>s.ready)||!state.catalogStatus.ready} onClick={()=>act({type:'start'})}>Iniciar partida</button>}</section><aside className="panel verification"><span className="step">FIDELIDADE ÀS REGRAS</span><h2>{state.catalogStatus.verified}<small> / {state.catalogStatus.expected} cartas verificadas</small></h2><p>{state.catalogStatus.ready?'Catálogo conferido. Confirmem a preparação para começar.':'A partida está bloqueada enquanto faltarem diagramas oficiais. Nenhuma carta será substituída por dados inventados.'}</p><ul><li>De 2 a 4 participantes por sala</li><li>Estado salvo em SQLite</li><li>Reconexão com sessão privada</li><li>Servidor valida cada ação</li></ul><Scenery/></aside></div>:<>
 <section className={`turn-bar ${myTurn?"active":"waiting"}`}><div className="turn-copy"><p className="eyebrow">{game.finished?'PARTIDA ENCERRADA':game.finalRound?'ÚLTIMA RODADA':`RODADA ${Math.min(...game.players.map(p=>p.turns))+1}`}</p><h2>{game.finished?(game.endReason==='host'?'Partida encerrada pelo host.':`Vitória: ${game.winners.map(i=>state.seats[i].name).join(' e ')}`):myTurn?'É a sua vez de criar.':`${state.seats[game.turn].name} está jogando.`}</h2></div><div className="turn-stats"><span><b>{game.bagCount}</b>peças na bolsa</span><span><b>{game.deckCount}</b>cartas no baralho</span><span><b>{game.scores[mine].cubes}</b>animais posicionados</span></div><button className="restart-turn" disabled={busy||!myTurn||!state.canRestart} onClick={()=>act({type:'restartTurn'})}>↶ Reiniciar meu turno</button><button className="primary" disabled={busy||!myTurn||game.selected===null||game.hand.length>0} onClick={()=>act({type:'endTurn'})}>Encerrar turno →</button>{mine===0&&!game.finished&&<button className="finish-game" disabled={busy} onClick={()=>setConfirmEnd(true)}>Encerrar partida</button>}</section>
 {game.finished&&<ScoreSheet game={game} names={state.seats.map(seat=>seat.name)} busy={busy} onRematch={mine===0?()=>{void act({type:'rematch'});}:undefined}/>}<FitTable><div className="game-grid game-workspace" data-players={game.players.length}>
 <div className="all-players" style={{'--player-count':game.players.length} as React.CSSProperties}>
 {game.players.map((player,seat)=>{const own=seat===mine,activeCards=player.cards.filter(h=>h.placed<(state.catalog.find(c=>c.id===h.id)?.points.length??0)),completedCards=player.cards.filter(h=>!activeCards.includes(h));return <section key={seat} className={`personal-area player-table ${own?'own-table':''} ${game.turn===seat&&!game.finished?'current-player':''}`} aria-label={`Área de ${state.seats[seat].name}`}>
  <div className="player-table-heading"><h2>{state.seats[seat].name} {own&&<span>você</span>}</h2><span>{game.turn===seat&&!game.finished?'Jogando agora':`Lado ${game.side}`}</span></div>
  <section className="panel collection" aria-label={`Habitats de ${state.seats[seat].name}`}><div className="cards">
   
   {activeCards.map(h=>{const c=state.catalog.find(c=>c.id===h.id)!;return <article key={h.id} className={`animal-card ${h.placed===c.points.length?'completed':''}`}><CardArt card={c} placed={h.placed} onInspect={()=>setPreviewCard(c)} selected={own&&selectedCard===c.id} onSelect={own&&myTurn&&!busy&&h.placed<c.points.length?()=>{setSelectedCard(c.id);setSelectedColor(null);setSelectedHint(null);}:undefined}/></article>;})}
   {Array.from({length:Math.max(0,4-activeCards.length)},(_,i)=><div className="habitat-slot" key={`empty-${i}`} aria-label="Espaço de habitat disponível"/>)}
  </div></section>
  
  <section className="panel landscape-panel">{own&&selectedCard&&<div className="habitat-picker" role="status"><p>{legal.length?'Clique em um destino destacado.':'Este habitat ainda não está pronto.'}</p><button className="text-button" onClick={()=>{setSelectedCard('');setSelectedHint(null);}}>Cancelar</button></div>}<Landscape label={`Tabuleiro de ${state.seats[seat].name}`} board={player.board} legal={own?legal:[]} onCell={own&&myTurn?id=>{if(busy)return;if(selectedCard){const hint=hints?.[selectedCard]?.find(h=>h.destination===id);if(hint)act({type:'placeAnimal',card:selectedCard,anchor:hint.anchor,rotation:hint.rotation,mirrored:hint.mirrored??false});else setNotice('Escolha uma posição destacada: o habitat precisa corresponder ao desenho da carta.');}else if(selectedColor)act({type:'placeToken',color:selectedColor,cell:id});}:undefined}/>
  <div className="board-hand" aria-label={`Peças na mão de ${state.seats[seat].name}`}>
   {game.turn===seat&&!game.finished&&game.hand.map((color,i)=><button key={i} aria-label={`Selecionar peça ${names[color]}`} aria-pressed={own&&selectedColor===color} className={own&&selectedColor===color?'selected':''} disabled={!own||!myTurn||busy} onClick={()=>{setSelectedColor(color);setSelectedCard('');setSelectedHint(null);}}><Token color={color}/></button>)}
  </div>
  </section>
  {completedCards.length>0&&<div className="completed-habitats" aria-label={`Habitats completos de ${state.seats[seat].name}`}>{completedCards.map(h=>{const c=state.catalog.find(c=>c.id===h.id)!;return <article className="animal-card" key={h.id}><CardArt card={c} placed={h.placed} onInspect={()=>setPreviewCard(c)}/></article>;})}</div>}
 </section>;})}
 </div> <section className="play-area"><div className="panel market-panel"><p className="eyebrow">TABULEIRO CENTRAL</p><h2>Escolha um conjunto</h2><p className="muted">Pegue as três peças de um espaço, uma vez por turno.</p><div className="market sculpted-market"><MarketArt/><span className="market-bag-count">{game.bagCount}<small>na bolsa</small></span>{game.market.map((group,i)=><button key={i} className="token-group" disabled={busy||!myTurn||game.selected!==null||group.length!==3} onClick={()=>act({type:'takeTokens',slot:i})}><small>{i+1}</small><div>{group.map((color,j)=><Token key={j} color={color}/>)}</div>{group.length===0&&<span>Selecionado</span>}</button>)}</div></div>
 <div className="panel revealed-panel"><p className="eyebrow">ESCOLHA UMA CARTA <span>Animais disponíveis</span></p><div className="cards">{game.animals.map((id,i)=>{const card=state.catalog.find(c=>c.id===id);return card?<article className="animal-card" key={i}><CardArt card={card} onInspect={()=>setPreviewCard(card)} disabled={!myTurn||busy||game.tookCard||game.players[mine].cards.filter(h=>h.placed<(state.catalog.find(c=>c.id===h.id)?.points.length??0)).length>=4} onTake={()=>act({type:'takeCard',slot:i})}/></article>:<div className="empty-card" key={i}>Reposição no fim do turno</div>;})}</div></div></section></div></FitTable>

 </>}
 </>}
 </main>{confirmEnd&&game&&!game.finished&&mine===0&&<div className="card-lightbox"><section className="finish-dialog" role="alertdialog" aria-modal="true" aria-labelledby="finish-title"><h2 id="finish-title">Encerrar a partida para todos?</h2><p>O turno em andamento será desfeito e a partida será encerrada imediatamente. O placar será parcial, sem vencedor oficial.</p><p>Não será possível continuar esta partida depois.</p><div><button autoFocus disabled={busy} onClick={()=>setConfirmEnd(false)}>Continuar jogando</button><button className="finish-game" disabled={busy} onClick={async()=>{await act({type:'finishGame'});setConfirmEnd(false);}}>Encerrar para todos</button></div></section></div>}{previewCard&&<div className="card-lightbox" onClick={()=>setPreviewCard(null)}><section className="card-dialog" role="dialog" aria-modal="true" aria-label={`Carta ${previewCard.officialName??previewCard.label}`} onClick={e=>e.stopPropagation()}><button className="close-card" autoFocus onClick={()=>setPreviewCard(null)}>Fechar ×</button><CardArt card={previewCard} onInspect={()=>setPreviewCard(null)}/><div className="card-explanation"><p className="eyebrow">HABITAT DO ANIMAL</p><h2>{previewCard.officialName??previewCard.label}</h2><Pattern card={previewCard}/><p>{previewCard.points.join(" · ")} pontos</p><p>O cubo vai na peça marcada. Árvores e montanhas precisam da altura exata.</p></div></section></div>}<footer><span>Harmonies · implementação independente para 2 a 4 jogadores</span><a href="https://www.libellud.com/game/harmonies/" target="_blank" rel="noreferrer">Manual & fontes oficiais ↗</a></footer></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
