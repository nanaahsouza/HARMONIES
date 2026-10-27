import type {ReactNode} from 'react';
// Ilustrações vetoriais próprias; os diagramas de regras ficam em Pattern.
export function PulseAnimal({id}:{id:string}){
 const n=Number(id.slice(-2));
 const shapes:Record<number,ReactNode>={
  1:<><ellipse cx="76" cy="51" rx="35" ry="23"/><path d="m109 50 27-22v45Z"/><circle cx="60" cy="46" r="4" fill="#fff"/><path d="m75 29 10-14 14 22M75 70l13 14 12-20"/></>,
  2:<><path d="M37 60q35 31 67-5l27-18q4 24-23 34Q64 99 37 60Z"/><ellipse cx="50" cy="45" rx="27" ry="24"/><path d="m30 31-12-15m13 26L12 37m20 17L15 64m53-31 12-17M72 44l22-6M69 55l19 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><circle cx="41" cy="44" r="3" fill="#fff"/><circle cx="59" cy="44" r="3" fill="#fff"/></>,
  3:<><ellipse cx="80" cy="58" rx="29" ry="26"/><circle cx="96" cy="31" r="19"/><path d="m112 28 19 8-19 7M53 61 30 80l29-6Z"/><path d="M66 49q35 2 18 26" fill="none" stroke="#fff" strokeWidth="3"/><circle cx="100" cy="28" r="3" fill="#fff"/></>,
  4:<><path d="M16 40q32-29 65 5 27-32 62-16-36 2-57 32h-13Q45 37 16 40Z"/><path d="m79 50 18 28-24-16Z"/></>,
  5:<><circle cx="46" cy="24" r="16"/><circle cx="114" cy="24" r="16"/><ellipse cx="80" cy="53" rx="46" ry="34"/><path d="m80 22-9 17h18Zm-37 14 22 8-22 4m74-12-22 8 22 4M48 62l17-6-10 16m57-10-17-6 10 16" fill="#fff"/><circle cx="65" cy="49" r="4" fill="#fff"/><circle cx="96" cy="49" r="4" fill="#fff"/><path d="m73 67 7 7 8-7" fill="#fff"/></>,
  6:<><path d="M24 75h112" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><ellipse cx="77" cy="49" rx="34" ry="20"/><circle cx="108" cy="35" r="17"/><circle cx="114" cy="31" r="5" fill="#fff"/><path d="M45 48q-32-14-30 13 2 22 22 13 13-12-2-15M60 58l-7 16m38-16 8 16" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></>,
  7:<><path d="M29 65V46q13-30 28-4 13-30 29-1h16l4-23h23v13h-11v37h-11V55H84v26H73V55H49v26H38V63Z"/><path d="M29 49q-14-9-12 8" fill="none" stroke="currentColor" strokeWidth="5"/></>,
  8:<><path d="M44 35Q12 29 18 9q10 19 32 13m66 13q32-6 26-26-10 19-32 13" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/><path d="M39 28q39-22 81 0l-6 40-18 20H64L46 68Z"/><ellipse cx="80" cy="68" rx="22" ry="13" fill="#fff"/><circle cx="61" cy="45" r="4" fill="#fff"/><circle cx="99" cy="45" r="4" fill="#fff"/></>,
  9:<><circle cx="43" cy="25" r="18"/><circle cx="117" cy="25" r="18"/><ellipse cx="80" cy="51" rx="47" ry="35" fill="#fff" stroke="currentColor" strokeWidth="3"/><ellipse cx="61" cy="47" rx="13" ry="16" transform="rotate(25 61 47)"/><ellipse cx="100" cy="47" rx="13" ry="16" transform="rotate(-25 100 47)"/><circle cx="63" cy="45" r="4" fill="#fff"/><circle cx="98" cy="45" r="4" fill="#fff"/><path d="m72 66 8 7 8-7Z"/></>,
  10:<><path d="m60 35-22-16m62 16 22-16M52 48H27m26 16-24 13m79-29h25m-26 16 24 13" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><ellipse cx="80" cy="53" rx="31" ry="34"/><path d="M80 24v61M54 39h52" stroke="#fff" strokeWidth="3"/><circle cx="69" cy="24" r="3" fill="#fff"/><circle cx="91" cy="24" r="3" fill="#fff"/></>
 };
 return <svg className="pulse-animal" viewBox="0 0 160 100" aria-hidden="true"><circle cx="80" cy="50" r="48" fill="currentColor" opacity=".05"/><g fill="currentColor">{shapes[n]}</g></svg>;
}
