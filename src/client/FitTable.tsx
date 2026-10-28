import React,{useLayoutEffect,useRef} from 'react';

// Ajusta a mesa inteira ao espaço disponível, preservando as coordenadas SVG.
export function FitTable({children}:{children:React.ReactNode}){
 const frame=useRef<HTMLDivElement>(null),table=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const container=frame.current,stage=table.current;if(!container||!stage)return;
  let pending=0;
  const fit=()=>{
   const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;
   const naturalWidth=Math.max(width,width<700?600:900);
   stage.style.width=`${naturalWidth}px`;
   stage.style.setProperty('--table-height',`${height}px`);
   const scale=Math.min(1,width/naturalWidth,height/Math.max(1,stage.offsetHeight));
   stage.style.transform=`scale(${scale})`;
   stage.style.left=`${(width-naturalWidth*scale)/2}px`;
  };
  const schedule=()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(fit);};
  const observer=new ResizeObserver(schedule);observer.observe(container);observer.observe(stage);fit();
  return()=>{observer.disconnect();cancelAnimationFrame(pending);};
 },[]);
 return <div className="table-fit" ref={frame}><div className="table-stage" ref={table}>{children}</div></div>;
}
