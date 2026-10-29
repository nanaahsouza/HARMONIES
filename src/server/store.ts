import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash,randomBytes,randomInt} from 'node:crypto';
import {catalogFor,catalogStatus} from '../engine/catalog.ts';
import {applyAction,freshTokens,legalHabitats,setup,canStack} from '../engine/rules.ts';
import {scores,winners} from '../engine/scoring.ts';
import {AVATAR_IDS,avatarForSeat,type AvatarId} from '../shared/avatars.ts';
import {requireRule,RuleError} from '../engine/model.ts';
import type {Action,Game,Side} from '../engine/model.ts';
type Seat={name:string;ready:boolean;avatar?:AvatarId};
export type Room={code:string;revision:number;createdAt:string;updatedAt:string;side:Side;first:number;playerCount:number;pulse:boolean;seats:Seat[];game:Game|null;turnStart?:Game;directPlay?:boolean};
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export function shuffle<T>(values:T[]):T[]{const a=[...values];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export class Store {
 db:DatabaseSync;
 constructor(path:string){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);
  this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS rooms(code TEXT PRIMARY KEY, state TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,room TEXT NOT NULL REFERENCES rooms(code),seat INTEGER NOT NULL,UNIQUE(room,seat));
   CREATE TABLE IF NOT EXISTS receipts(room TEXT NOT NULL REFERENCES rooms(code),seat INTEGER NOT NULL,id TEXT NOT NULL,payload_hash TEXT NOT NULL,PRIMARY KEY(room,seat,id));`);
 }
 close(){this.db.close();}
 transaction<T>(fn:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 get(code:string):Room {const row=this.db.prepare('SELECT state FROM rooms WHERE code=?').get(code) as {state:string}|undefined;requireRule(row,'ROOM','Sala não encontrada.');const room:Room=JSON.parse(row.state);room.playerCount??=room.game?.players.length??2;room.pulse=room.game?.pulse??room.pulse??false;if(room.game)room.game.pulse??=room.pulse;return room;}
 save(room:Room){room.updatedAt=new Date().toISOString();this.db.prepare('INSERT INTO rooms(code,state) VALUES(?,?) ON CONFLICT(code) DO UPDATE SET state=excluded.state').run(room.code,JSON.stringify(room));}
 identity(code:string,token:string):number {
  const row=this.db.prepare('SELECT seat FROM sessions WHERE room=? AND token_hash=?').get(code,hash(token)) as {seat:number}|undefined;
  requireRule(row,'AUTH','Sessão inválida. Entre com o link e a sessão original.');return row.seat;
 }
 create(name:string,playerCount=2,options:{side?:unknown;pulse?:unknown;avatar?:unknown;directPlay?:unknown}={}){
  const side=options.side===undefined?'A':options.side,pulse=options.pulse===undefined?false:options.pulse;
  requireRule(side==='A'||side==='B','SIDE','Lado inválido.');
  requireRule(typeof pulse==='boolean','EXPANSION','Opção Pulsar inválida.');
  const avatar=options.avatar===undefined?avatarForSeat(0):options.avatar;
  requireRule(typeof avatar==='string'&&(AVATAR_IDS as readonly string[]).includes(avatar),'AVATAR','Escolha um dos quatro animais disponíveis.');
  requireRule(options.directPlay===undefined||typeof options.directPlay==='boolean','OPTIONS','Opção de entrada inválida.');
  requireRule(Number.isInteger(playerCount)&&playerCount>=1&&playerCount<=4,'PLAYER_COUNT','Escolha entre 1 e 4 jogadores.');return this.transaction(()=>{
  let code:string;do{code=randomBytes(9).toString('base64url').toUpperCase();}while(this.db.prepare('SELECT 1 FROM rooms WHERE code=?').get(code));
  const token=randomBytes(32).toString('base64url'),now=new Date().toISOString();
  const room:Room={code,revision:0,createdAt:now,updatedAt:now,side,first:0,playerCount,pulse,seats:[{name,ready:false,avatar:avatar as AvatarId}],game:null};
  room.directPlay=options.directPlay===true||playerCount===1;this.startWhenFull(room);
  this.save(room);this.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),code,0);return {room,token,seat:0};
 });}
 join(code:string,name:string,avatar?:unknown){return this.transaction(()=>{
  const room=this.get(code);requireRule(room.seats.length<room.playerCount,'FULL','Esta sala já está cheia.');
  requireRule(!room.game,'STARTED','A partida já começou.');
  const chosenAvatar=avatar===undefined?avatarForSeat(room.seats.length):avatar;
  requireRule(typeof chosenAvatar==='string'&&(AVATAR_IDS as readonly string[]).includes(chosenAvatar),'AVATAR','Escolha um dos quatro animais disponíveis.');
  const token=randomBytes(32).toString('base64url');room.seats.push({name,ready:false,avatar:chosenAvatar as AvatarId});room.seats.forEach(s=>s.ready=false);this.startWhenFull(room);room.revision++;this.save(room);
  this.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),code,room.seats.length-1);return {room,token,seat:room.seats.length-1};
 });}
 startWhenFull(room:Room){
  if(room.directPlay&&!room.game&&room.seats.length===room.playerCount){
   const catalog=catalogFor(room.pulse);requireRule(catalogStatus(room.pulse).ready,'CATALOG','Catálogo incompleto.');
   room.game=setup(room.side,room.first,shuffle(freshTokens()),shuffle(catalog.map(c=>c.id)),catalog,room.pulse,room.playerCount);
  }
 }
 act(code:string,token:string,envelope:{id:string;revision:number;action:Record<string,unknown>}):Room{return this.transaction(()=>{
  const seat=this.identity(code,token),room=this.get(code),payloadHash=hash(JSON.stringify(envelope));
  const receipt=this.db.prepare('SELECT payload_hash FROM receipts WHERE room=? AND seat=? AND id=?').get(code,seat,envelope.id) as {payload_hash:string}|undefined;
  if(receipt){requireRule(receipt.payload_hash===payloadHash,'ID_REUSE','Identificador reutilizado com conteúdo diferente.');return room;}
  requireRule(room.revision===envelope.revision,'REVISION','Estado desatualizado. Sincronize antes de jogar novamente.');
  const action=envelope.action;
  if(action.type==='waitForPlayers'){
   requireRule(seat===0,'HOST','Somente o host pode preparar a mesa.');requireRule(!room.game,'STARTED','A partida já começou.');
   room.directPlay=true;this.startWhenFull(room);
  }else if(action.type==='setAvatar'){
   requireRule(typeof action.avatar==='string'&&(AVATAR_IDS as readonly string[]).includes(action.avatar),'AVATAR','Escolha um dos quatro animais disponíveis.');
   room.seats[seat].avatar=action.avatar as AvatarId;
  }else if(action.type==='configure'){
   requireRule(!room.game,'STARTED','A partida já começou.');requireRule(seat===0,'HOST','Somente o criador pode ajustar a preparação.');
   requireRule(action.side==='A'||action.side==='B','SIDE','Lado inválido.');const count=action.playerCount??room.playerCount;
   requireRule(typeof count==='number'&&Number.isInteger(count)&&count>=1&&count<=4&&count>=room.seats.length,'PLAYER_COUNT','Escolha entre 1 e 4 lugares, sem remover participantes.');
   requireRule(typeof action.first==='number'&&Number.isInteger(action.first)&&action.first>=0&&action.first<room.seats.length,'FIRST','Primeiro jogador inválido.');
   requireRule(action.pulse===undefined||typeof action.pulse==='boolean','EXPANSION','Opção Pulsar inválida.');
   room.playerCount=count;room.side=action.side;room.first=action.first;room.pulse=(action.pulse??room.pulse) as boolean;room.seats.forEach(s=>s.ready=false);
  }else if(action.type==='rematch'){
   requireRule(seat===0,'HOST','Somente o host pode preparar a revanche.');
   requireRule(room.game?.finished,'NOT_FINISHED','A partida precisa terminar antes de preparar a revanche.');
   room.game=null;delete room.turnStart;
   room.seats.forEach(s=>s.ready=false);
   this.startWhenFull(room);
  }else if(action.type==='ready'){
   requireRule(!room.game,'STARTED','A partida já começou.');requireRule(typeof action.ready==='boolean','READY','Confirmação inválida.');room.seats[seat].ready=action.ready;
  }else if(action.type==='start'){
   requireRule(seat===0,'HOST','Somente o criador pode iniciar.');requireRule(!room.game,'STARTED','A partida já começou.');
   requireRule(room.seats.length===room.playerCount&&room.seats.every(s=>s.ready),'NOT_READY','Todos os lugares devem estar ocupados e todos devem confirmar a preparação.');
   const catalog=catalogFor(room.pulse);
   room.game=setup(room.side,room.first,shuffle(freshTokens()),shuffle(catalog.map(c=>c.id)),catalog,room.pulse,room.playerCount);
  }else {
   requireRule(room.game,'NOT_STARTED','A partida ainda não começou.');
   if(action.type==='finishGame'){
    requireRule(seat===0,'HOST','Somente o host pode encerrar a partida.');
    requireRule(!room.game.finished,'FINISHED','A partida já terminou.');
    // Encerramento administrativo: descarta o turno incompleto, sem atribuir vitória oficial.
    if(room.turnStart)room.game=structuredClone(room.turnStart);
    room.game.finished=true;room.game.endReason='host';delete room.turnStart;
   }else if(action.type==='restartTurn'){
    requireRule(!room.game.finished,'FINISHED','A partida já terminou.');
    requireRule(room.game.turn===seat,'TURN','Você só pode reiniciar seu próprio turno.');
    requireRule(room.turnStart&&room.turnStart.turn===seat,'NO_RESTART','Não há jogadas deste turno para desfazer. Turnos encerrados não podem ser reiniciados.');
    room.game=structuredClone(room.turnStart);delete room.turnStart;
   }else{
    const before=structuredClone(room.game);
    room.game=applyAction(room.game,seat,action as Action,catalogFor(room.game.pulse??false));
    if(action.type==='endTurn')delete room.turnStart;
    else room.turnStart??=before;
   }
  }
  room.revision++;this.save(room);this.db.prepare('INSERT INTO receipts VALUES(?,?,?,?)').run(code,seat,envelope.id,payloadHash);return room;
 });}
 public(room:Room,seat:number,connected:boolean[]=[]){
  const game=room.game;
  const catalog=catalogFor(game?.pulse??room.pulse);
  // Nunca expõe a ordem da bolsa ou do baralho. Dicas de posições são calculadas pelo servidor.
  const visible=game?{...game,bag:undefined,deck:undefined,bagCount:game.bag.length,deckCount:game.deck.length,scores:scores(game,catalog),winners:game.finished&&game.endReason!=='host'?winners(game,catalog):[],hints:game.turn===seat&&!game.finished?{
   tokens:Object.fromEntries([...new Set(game.hand)].map(color=>[color,Object.keys(game.players[seat].board).filter(id=>canStack(game.players[seat].board[id],color))])),
   animals:Object.fromEntries(game.players[seat].cards.filter(h=>h.placed<(catalog.find(c=>c.id===h.id)?.points.length??0)).map(h=>[h.id,legalHabitats(game.players[seat].board,catalog.find(c=>c.id===h.id)!,game.pulse??false)]))
  }:{tokens:{},animals:{}}}:null;
  const preview=game?null:setup(room.side,room.first,freshTokens(),catalog.map(c=>c.id),catalog,room.pulse,room.playerCount);
  const tablePreview=preview?{...preview,bag:undefined,deck:undefined,bagCount:0,deckCount:catalog.length,animals:Array(room.playerCount===1?3:5).fill(null) as (string|null)[],market:Array.from({length:room.playerCount===1?3:5},()=>[]),scores:scores(preview,catalog),winners:[] as number[],hints:{tokens:{},animals:{}}}:null;
  const {turnStart,...publicRoom}=room;
  return {...publicRoom,canRestart:!!game&&!game.finished&&game.turn===seat&&turnStart?.turn===seat,seats:room.seats.map((s,i)=>({...s,avatar:s.avatar??avatarForSeat(i),connected:connected[i]??false})),game:visible,tablePreview,seat,catalog,catalogStatus:catalogStatus(game?.pulse??room.pulse)};
 }
}
export function safeName(value:unknown):string {requireRule(typeof value==='string'&&value.trim().length>=1&&value.trim().length<=30,'NAME','Use um nome entre 1 e 30 caracteres.');return value.trim();}
export const errorBody=(e:unknown)=>e instanceof RuleError?{code:e.code,message:e.message}:{code:'INTERNAL',message:'Falha interna. Sua ação não foi confirmada.'};
