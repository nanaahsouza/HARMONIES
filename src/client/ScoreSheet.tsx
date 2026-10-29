import {soloSuns} from '../engine/scoring.ts';
import React,{useEffect,useId,useRef} from 'react';
import type {Store} from '../server/store.ts';
import type {Color} from '../engine/model.ts';
import {PieceArt,GoldCube} from './PieceArt.tsx';

type Game=NonNullable<ReturnType<Store['public']>['game']>;
const categories:{key:'trees'|'mountains'|'fields'|'buildings'|'water'|'animals';label:string;color?:Color}[]=[
 {key:'trees',label:'Árvores',color:'green'},
 {key:'mountains',label:'Montanhas',color:'gray'},
 {key:'fields',label:'Campos',color:'yellow'},
 {key:'buildings',label:'Construções',color:'red'},
 {key:'water',label:'Água',color:'blue'},
 {key:'animals',label:'Animais'}
];
export function ScoreSheet({game,names,onRematch,busy}:{game:Game;names:string[];onRematch?:()=>void;busy:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),title=useId();
 useEffect(()=>{dialog.current?.showModal();},[]);
 const nextActions=<div className="postgame-actions">{onRematch?<button className="primary" disabled={busy} onClick={onRematch}>{game.players.length===1?'Jogar solo novamente':'Preparar revanche'}</button>:<span className="rematch-wait">O host pode preparar uma revanche.</span>}<a href="/" className="home-link">Voltar ao início</a></div>;
 const partial=game.endReason==='host',solo=game.players.length===1,suns=soloSuns(game.scores[0].total,game.side);
 return <>
  <div className="score-reopen"><span>{partial?'Partida encerrada pelo host':'Sua paisagem, em pontos'}</span><button onClick={()=>dialog.current?.showModal()}>Ver pontuação final ↗</button>{nextActions}</div>
  <dialog className="score-sheet" ref={dialog} aria-labelledby={title}>
   <div className="score-sheet-header"><div><p className="eyebrow">HARMONIES · FICHA DE PONTUAÇÃO</p><h2 id={title}>{partial?'Placar parcial':'Resultado final'}</h2></div><button className="score-close" autoFocus onClick={()=>dialog.current?.close()} aria-label="Fechar pontuação e ver tabuleiros">×</button></div>
   <p className="score-intro">{partial?'A partida foi encerrada antecipadamente. Estes são os pontos acumulados, sem vencedor oficial.':solo?'Sua paisagem está completa. Veja seus pontos e sóis abaixo.':`Vitória de ${game.winners.map(i=>names[i]).join(' e ')}. Cada paisagem conta uma história.`}</p>
   {solo&&!partial&&<div className="solo-suns-result"><span aria-hidden="true">☀</span><strong>{suns.total} sóis</strong><p>{suns.points} pelos pontos + {suns.board} pelo lado {game.side} + {suns.withoutSpirit} por jogar sem Espírito da Natureza.</p></div>}
   <div className="score-table-wrap"><table>
    <caption>Pontos por categoria e jogador</caption>
    <thead><tr><th scope="col">Paisagem</th>{names.map((name,i)=><th scope="col" key={i}><span className={`score-player-name score-seat-${i}`}>{name}</span>{!partial&&game.winners.includes(i)&&<small className="score-winner">Vencedor</small>}</th>)}</tr></thead>
    <tbody>{categories.map(category=><tr key={category.key}><th scope="row"><span className="score-category"><span className="score-piece" aria-hidden="true">{category.color?<PieceArt color={category.color}/>:<GoldCube/>}</span><span>{category.label}</span></span></th>{game.scores.map((score,i)=><td key={i}>{score[category.key]}</td>)}</tr>)}</tbody>
    <tfoot><tr><th scope="row">TOTAL</th>{game.scores.map((score,i)=><td key={i}><strong>{score.total}</strong><small>pontos</small></td>)}</tr></tfoot>
   </table></div>
   <div className="score-sheet-footer"><span><GoldCube/>Animais posicionados: {game.scores.map((score,i)=>`${names[i]}: ${score.cubes}`).join(' · ')}</span>{!solo&&<p>Em caso de empate no total, vence quem posicionou mais animais.</p>}<button className="primary" onClick={()=>dialog.current?.close()}>Ver tabuleiros</button>{nextActions}<p className="rematch-note">Uma nova partida mantém as opções escolhidas e começa novamente na mesma sala.</p></div>
  </dialog>
 </>;
}
