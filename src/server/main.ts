import {createApp} from './http.ts';
const port=Number(process.env.PORT??3001),host=process.env.HOST??'0.0.0.0';
const app=createApp({database:process.env.DATABASE_PATH??'data/harmonies.sqlite',origin:process.env.PUBLIC_ORIGIN??''});
app.server.listen(port,host,()=>console.log(`Harmonies: servidor na porta ${port}. Catálogo e validação: consulte README.md.`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{app.closeStreams();app.server.close(()=>{app.store.close();process.exit(0);});});
