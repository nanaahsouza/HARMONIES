import {createServer} from 'node:http';
import type {ServerResponse,IncomingMessage} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {Store,safeName,errorBody} from './store.ts';
import {requireRule,RuleError} from '../engine/model.ts';
type Stream={res:ServerResponse;seat:number};
export function createApp({database='data/harmonies.sqlite',origin='',dist=resolve('dist')}={}){
 const store=new Store(database),streams=new Map<string,Set<Stream>>(),limits=new Map<string,{n:number;until:number}>();
 function publish(code:string){const clients=streams.get(code);if(!clients)return;const room=store.get(code),connected=room.seats.map((_,seat)=>[...clients].some(c=>c.seat===seat));for(const c of clients)c.res.write(`data: ${JSON.stringify(store.public(room,c.seat,connected))}\n\n`);}
 const json=(res:ServerResponse,status:number,body:unknown)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 async function body(req:IncomingMessage){requireRule(req.headers['content-type']?.split(';')[0]==='application/json','CONTENT_TYPE','Envie JSON.');let data='';for await(const chunk of req){data+=chunk;requireRule(Buffer.byteLength(data)<=8192,'BODY_SIZE','Mensagem muito grande.');}try{return JSON.parse(data);}catch{throw new RuleError('JSON','JSON inválido.');}}
 const server=createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try{
   const url=new URL(req.url??'/','http://internal');
   if(url.pathname==='/api/health'){json(res,200,{ok:true});return;}
   if(url.pathname.startsWith('/api/')){
    const ip=req.socket.remoteAddress??'unknown',now=Date.now();let limit=limits.get(ip);if(!limit||now>limit.until){limit={n:0,until:now+60_000};limits.set(ip,limit);}
    if(limits.size>10_000)for(const [k,v] of limits)if(v.until<now)limits.delete(k);
    requireRule(++limit.n<=240,'RATE_LIMIT','Muitas requisições. Aguarde um minuto.');
    if(req.headers.origin){const expected=origin||`http://${req.headers.host}`;requireRule(req.headers.origin===expected,'ORIGIN','Origem da requisição não autorizada.');}
    if(req.method==='POST'&&url.pathname==='/api/rooms'){
     const data=await body(req),created=store.create(safeName(data.name),data.playerCount??2,{side:data.side,pulse:data.pulse,avatar:data.avatar,directPlay:data.directPlay});json(res,201,{token:created.token,state:store.public(created.room,0)});return;
    }
    const match=url.pathname.match(/^\/api\/rooms\/([A-Z0-9_-]{12})(?:\/(join|actions|events))?$/);
    requireRule(match,'ROUTE','Endereço inválido.');const [,code,endpoint]=match;
    if(req.method==='POST'&&endpoint==='join'){
     const data=await body(req),joined=store.join(code,safeName(data.name),data.avatar);json(res,201,{token:joined.token,state:store.public(joined.room,joined.seat)});publish(code);return;
    }
    const auth=req.headers.authorization;requireRule(typeof auth==='string'&&auth.startsWith('Bearer ')&&auth.length<=128,'AUTH','Sessão necessária.');const token=auth.slice(7),seat=store.identity(code,token);
    if(req.method==='GET'&&endpoint==='events'){
     const clients=streams.get(code)??new Set<Stream>();requireRule([...clients].filter(c=>c.seat===seat).length<3,'STREAM_LIMIT','Feche outras abas desta sala.');
     res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();
     const client={res,seat};clients.add(client);streams.set(code,clients);publish(code);
     const heartbeat=setInterval(()=>res.write(': keep-alive\n\n'),20_000);
     res.on('close',()=>{clearInterval(heartbeat);clients.delete(client);if(clients.size)publish(code);else streams.delete(code);});return;
    }
    if(req.method==='GET'&&!endpoint){json(res,200,store.public(store.get(code),seat,store.get(code).seats.map((_,s)=>[...(streams.get(code)??[])].some(c=>c.seat===s))));return;}
    if(req.method==='POST'&&endpoint==='actions'){
     const data=await body(req);requireRule(data&&typeof data.id==='string'&&/^[a-zA-Z0-9_-]{16,80}$/.test(data.id)&&Number.isSafeInteger(data.revision)&&data.revision>=0&&data.action&&typeof data.action==='object'&&!Array.isArray(data.action),'ENVELOPE','Mensagem de ação inválida.');
     const room=store.act(code,token,data);json(res,200,store.public(room,seat));publish(code);return;
    }
    throw new RuleError('METHOD','Método não permitido.');
   }
   requireRule(req.method==='GET'||req.method==='HEAD','METHOD','Método não permitido.');
   const path=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
   const file=resolve(dist,`.${path}`);requireRule(file.startsWith(resolve(dist)+'\\')||file.startsWith(resolve(dist)+'/'),'PATH','Caminho inválido.');
   const types:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg'};
   try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':path.includes('/assets/')?'public,max-age=31536000,immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);}catch{json(res,404,{message:'Arquivo não encontrado. Execute pnpm build.'});}
  }catch(e){if(!res.headersSent){const code=e instanceof RuleError?e.code:'';json(res,code==='AUTH'?401:code==='FULL'||code==='REVISION'?409:code==='RATE_LIMIT'?429:e instanceof RuleError?400:500,errorBody(e));}else res.end();}
 });
 function closeStreams(){for(const clients of streams.values())for(const c of clients)c.res.end();streams.clear();}
 return {server,store,closeStreams};
}
