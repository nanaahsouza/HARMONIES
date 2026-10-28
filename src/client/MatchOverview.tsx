import React from 'react';
import type {Store} from '../server/store.ts';
import {Avatar,AvatarPicker} from './Avatar.tsx';
import type {AvatarId} from '../shared/avatars.ts';
type State=ReturnType<Store['public']>;
export function MatchOverview({state,onCopy,busy,onAvatarSelect,waiting=false}:{state:State;waiting?:boolean;onCopy:()=>void;busy:boolean;onAvatarSelect:(avatar:AvatarId)=>void}){
 const game=(state.game??state.tablePreview)!;
 const myTurn=!waiting&&game.turn===state.seat&&!game.finished;
 const heading=waiting?`Aguardando jogadores · ${state.seats.length}/${state.playerCount}`:game.finished?(game.endReason==='host'?'Partida encerrada.':`Vitória: ${game.winners.map(i=>state.seats[i].name).join(' e ')}`):myTurn?'É a sua vez de criar.':`${state.seats[game.turn].name} está jogando.`;
 return <aside className="match-overview" aria-label="Informações da partida">
  <div className="match-code"><span>PARTIDA #{state.code}</span><button onClick={onCopy} aria-label="Copiar convite da partida">⧉</button></div>
  <h2 aria-live="polite">{heading}</h2>
  <p className="match-guidance">{waiting?'Compartilhe o convite. A partida começa quando todos entrarem.':game.finished?'Veja os pontos na ficha de resultado.':myTurn?'Escolha uma carta e pegue as peças.':'Acompanhe a paisagem dos participantes.'}</p>
  <ol className="match-roster">{state.seats.map((seat,i)=>{const active=!waiting&&!game.finished&&game.turn===i;return <li key={i} className={active?'playing-now':''} aria-current={active?'step':undefined}><span className={`match-avatar avatar-seat-${i}`}>{i===state.seat?<AvatarPicker value={seat.avatar} compact busy={busy} onSelect={onAvatarSelect}/>:<Avatar value={seat.avatar}/>}</span><span className="match-person"><strong>{seat.name}{i===0&&<b className="host-mark" title="Host" aria-label="Host">♛</b>}</strong><small>{waiting?'Na sala':game.finished?'Partida encerrada':active?(i===state.seat?'Sua vez':'Jogando agora'):'Aguardando…'}{i===state.seat?' · você':''}</small></span><i className={`match-presence ${seat.connected?'present':''}`} aria-label={seat.connected?'Conectado':'Desconectado'}/></li>;})}</ol>
  <div className="match-edition"><span>{state.pulse?'Base + Pulsar':'Jogo-base'} · Lado {game.side}</span><span>{waiting?'Aguardando participantes':game.finished?'Finalizada':game.finalRound?'Última rodada':`Rodada ${Math.min(...game.players.map(p=>p.turns))+1}`}</span></div>
  <div className="match-counts"><span><b>{game.deckCount}</b> cartas restantes</span></div>
  <a className="match-home" href="/">← Voltar ao início</a>
 </aside>;
}
