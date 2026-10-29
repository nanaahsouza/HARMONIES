import React,{useRef,useState,useLayoutEffect} from 'react';

const pages=[
 {spread:2,side:0,title:'Objetivo e componentes',note:'Conheça as peças e os elementos da paisagem.'},
 {spread:2,side:1,title:'Preparação da mesa',note:'Na versão online, a distribuição e a preparação são automáticas.'},
 {spread:3,side:0,title:'Seu turno e as peças',note:'Pegue um conjunto e coloque suas três peças. As outras ações são opcionais.'},
 {spread:3,side:1,title:'Cartas de animais',note:'Pegue no máximo uma carta por turno e tenha até quatro habitats incompletos.'},
 {spread:4,side:0,title:'Posicionar os cubos',note:'Monte o padrão e coloque o cubo na peça indicada. A altura também importa.'},
 {spread:4,side:1,title:'Orientações e fim',note:'O padrão pode ser girado. Complete a rodada para todos jogarem o mesmo número de turnos.'},
 {spread:5,side:0,title:'Pontos da paisagem',note:'Veja os exemplos de árvores, montanhas, campos, rios e ilhas.'},
 {spread:5,side:1,title:'Pontos dos animais',note:'Some paisagens e animais. No empate, compare a quantidade de cubos posicionados.'}
];
export function Rulebook({dialogRef,children}:{dialogRef:React.RefObject<HTMLDialogElement|null>;children:React.ReactNode}){
 const [mode,setMode]=useState<'book'|'online'>('book'),[page,setPage]=useState(0),[zoom,setZoom]=useState(false);
 const reader=useRef<HTMLDivElement>(null),current=pages[page];
 useLayoutEffect(()=>{reader.current?.scrollTo({top:0,left:0});},[page,zoom,mode]);
 const changePage=(index:number)=>{setPage(index);setZoom(false);reader.current?.scrollTo({top:0,left:0});};
 return <dialog ref={dialogRef} className="home-dialog how-to-play manual-dialog" aria-labelledby="help-title" onClose={()=>setZoom(false)}>
  <header className="manual-header"><div><p>HARMONIES · LIVRO DE REGRAS</p><h2 id="help-title">Como jogar</h2></div><button type="button" className="manual-close" aria-label="Fechar instruções" onClick={()=>dialogRef.current?.close()}>×</button></header>
  <div className="manual-modes" role="group" aria-label="Versão das instruções"><button type="button" aria-pressed={mode==='book'} onClick={()=>setMode('book')}>Manual ilustrado</button><button type="button" aria-pressed={mode==='online'} onClick={()=>setMode('online')}>Como jogar online</button></div>
  {mode==='book'?<div className="manual-book">
   <nav className="manual-index" aria-label="Capítulos do manual"><p>EXPLORE O MANUAL</p>{pages.map((p,i)=><button type="button" key={p.title} aria-current={i===page?'page':undefined} onClick={()=>changePage(i)}><span>{String(i+1).padStart(2,'0')}</span>{p.title}</button>)}</nav>
   <section className="manual-viewer" aria-label="Página ilustrada do manual">
    <div className="manual-page-toolbar"><div><h3>{current.title}</h3><p aria-live="polite">Página {page+2} de 9 · Português</p></div><button type="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Ajustar página':'Ampliar página'}</button></div>
    <div className="manual-reader" ref={reader} tabIndex={0} aria-label={zoom?'Página ampliada. Role para ler.':'Conteúdo da página'}><figure className={`manual-sheet ${zoom?'is-zoomed':''}`}><img key={`${current.spread}-${current.side}`} src={`/assets/manual/spread-${current.spread}.png`} alt={`Manual em português, página ${page+2}: ${current.title}. Regras e exemplos ilustrados do jogo físico. O texto acessível está na aba Como jogar online.`} style={{transform:current.side?'translateX(-50%)':undefined}}/></figure></div>
    <div className="manual-caption"><p>{current.note}</p><div><button type="button" disabled={page===0} onClick={()=>changePage(page-1)} aria-label="Página anterior">←</button><span>{page+1} / {pages.length}</span><button type="button" disabled={page===pages.length-1} onClick={()=>changePage(page+1)} aria-label="Próxima página">→</button></div></div>
    <p className="manual-online-note">Na mesa online, a sala inicia quando todos entram. Para os controles e a expansão Pulsar, consulte <button type="button" onClick={()=>setMode('online')}>Como jogar online</button>. Espíritos da Natureza não estão incluídos nesta versão.</p>
   </section>
  </div>:<div className="manual-digital">{children}</div>}
  <div className="manual-footer"><span>Ilustrações e regras do manual do jogo físico · Libellud</span><button type="button" onClick={()=>dialogRef.current?.close()}>Voltar ao jogo</button></div>
 </dialog>;
}
