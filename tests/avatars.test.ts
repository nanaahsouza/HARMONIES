import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../src/server/store.ts';
import {AVATAR_IDS,avatarForSeat} from '../src/shared/avatars.ts';

test('A01 avatares são pessoais, públicos, idempotentes e persistem na revanche',()=>{
 const dir=mkdtempSync(join(tmpdir(),'harmonies-avatar-')),path=join(dir,'test.sqlite');let store=new Store(path);
 try{
  const host=store.create('Host',4),code=host.room.code,tokens=[host.token];for(let i=1;i<4;i++)tokens.push(store.join(code,`Pessoa ${i}`).token);
  const act=(seat:number,action:Record<string,unknown>)=>store.act(code,tokens[seat],{id:randomUUID(),revision:store.get(code).revision,action});
  assert.deepEqual(store.public(store.get(code),0).seats.map(s=>s.avatar),[...AVATAR_IDS]);
  tokens.forEach((_,i)=>act(i,{type:'ready',ready:true}));act(0,{type:'start'});
  const before=structuredClone(store.get(code).game);
  const envelope={id:randomUUID(),revision:store.get(code).revision,action:{type:'setAvatar',avatar:'leao',seat:0}};
  store.act(code,tokens[2],envelope);const changed=store.get(code);
  assert.equal(changed.seats[2].avatar,'leao');assert.equal(changed.seats[0].avatar,'corvo');assert.deepEqual(changed.game,before);assert.ok(changed.seats.every(s=>s.ready));
  store.act(code,tokens[2],envelope);assert.equal(store.get(code).revision,changed.revision);
  for(const avatar of AVATAR_IDS)act(1,{type:'setAvatar',avatar});
  for(const avatar of ['inexistente','https://example.com/avatar.png',null,{},1])assert.throws(()=>act(1,{type:'setAvatar',avatar}),/quatro animais/);
  assert.throws(()=>store.act(code,'outro-token',{id:randomUUID(),revision:store.get(code).revision,action:{type:'setAvatar',avatar:'corvo'}}),/inválida/);
  act(0,{type:'finishGame'});act(0,{type:'rematch'});assert.equal(store.get(code).seats[2].avatar,'leao');
  store.close();store=new Store(path);assert.equal(store.public(store.get(code),2).seats[2].avatar,'leao');
  const legacy=store.get(code);legacy.seats.forEach(s=>delete s.avatar);store.save(legacy);
  assert.deepEqual(store.public(store.get(code),0).seats.map((s,i)=>s.avatar===avatarForSeat(i)),[true,true,true,true]);
 }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
