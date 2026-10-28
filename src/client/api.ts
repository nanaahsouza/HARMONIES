/** Respostas de proxy ou indisponibilidade podem ser texto/HTML, em vez de JSON. */
export async function readApiResponse(res:Response){
 const body=await res.text();let json;
 try{json=JSON.parse(body);}catch{
  throw new Error('Não foi possível acessar o servidor do jogo. Atualize a página e tente novamente. Os dados preenchidos foram mantidos.');
 }
 if(!json||typeof json!=='object'||Array.isArray(json))throw new Error('O servidor enviou uma resposta inesperada. Atualize a página e tente novamente.');
 if(!res.ok)throw Object.assign(new Error(typeof json.message==='string'?json.message:'Não foi possível concluir a ação. Tente novamente.'),{code:json.code});
 return json;
}
export async function request(path:string,method='GET',data?:unknown,secret=''){
 let res:Response;
 try{res=await fetch(path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(secret?{Authorization:`Bearer ${secret}`}:{})},body:data?JSON.stringify(data):undefined});}
 catch{throw new Error('Não foi possível conectar ao servidor do jogo. Confira a conexão e tente novamente.');}
 return readApiResponse(res);
}
