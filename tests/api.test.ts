import test from 'node:test';
import assert from 'node:assert/strict';
import {readApiResponse} from '../src/client/api.ts';

test('API01 respostas de texto e HTML exibem erro de conexão sem erro de JSON',async()=>{
 for(const status of [200,404,502,503])for(const body of ['The page could not be loaded','<!doctype html><html>Unavailable</html>','']){
  await assert.rejects(readApiResponse(new Response(body,{status})),err=>{
   assert.ok(err instanceof Error);assert.match(err.message,/servidor do jogo/);assert.doesNotMatch(err.message,/Unexpected token|The page|doctype/);assert.equal('code' in err,false);return true;
  });
 }
});
test('API02 mantém respostas e códigos de validação; rejeita estrutura inválida',async()=>{
 const body={state:{code:'TEST',game:null},token:'test-session'};
 assert.deepEqual(await readApiResponse(Response.json(body,{status:201})),body);
 await assert.rejects(readApiResponse(Response.json({code:'FULL',message:'Esta sala já está cheia.'},{status:400})),err=>{
  assert.equal((err as Error&{code:string}).code,'FULL');assert.equal((err as Error).message,'Esta sala já está cheia.');return true;
 });
 for(const invalid of ['null','[]','"text"','1'])await assert.rejects(readApiResponse(new Response(invalid)),/resposta inesperada/);
});
