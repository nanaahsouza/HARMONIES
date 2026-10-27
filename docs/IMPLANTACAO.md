# Implantação pública

## Plataforma escolhida e limites conferidos

Um **Render Web Service** executa o container Node continuamente e entrega tanto `dist/` quanto `/api`. O frontend não é um Render Static Site separado. Um disco persistente de 1 GB montado em `/var/data` guarda SQLite. O plano `starter` do blueprint é pago, pois discos não estão disponíveis em serviço gratuito. Não houve contratação ou publicação por esta sessão.

Conferido em 26/10/2026 nas fontes oficiais:

- [Web Services](https://render.com/docs/web-services): serviço público, porta `PORT`, domínio `onrender.com`.
- [Discos persistentes](https://render.com/docs/disks): somente caminho montado persiste; disco atende uma instância; não permite escalar para múltiplas instâncias; redeploy com disco tem breve interrupção.
- [Blueprint YAML](https://render.com/docs/blueprint-spec): `runtime: docker`, `disk`, variáveis e `healthCheckPath`.
- [Domínios e TLS](https://render.com/docs/custom-domains): HTTPS e certificados gerenciados.

## Passo a passo

1. Crie ou use um repositório Git seu. Envie o conteúdo desta pasta, incluindo `Dockerfile`, `render.yaml`, o lockfile e as fontes. Não envie `node_modules`, banco, `.env` ou sessões de teste. Se o projeto for subpasta de um repositório maior, configure `rootDir` no blueprint para essa pasta.
2. No Render, conecte esse repositório e escolha **New → Blueprint**. Selecione o `render.yaml` entregue. Confira os custos exibidos antes de contratar o serviço e o disco.
3. O campo `PUBLIC_ORIGIN` deve conter a origem HTTPS real do serviço, sem barra final. Quando o endereço ainda não estiver disponível durante a criação, deixe esse valor vazio inicialmente, crie o serviço, copie a URL mostrada no painel e preencha a variável. Faça o redeploy que o painel solicitar. Não use um domínio fictício.
4. Confirme que `DATABASE_PATH=/var/data/harmonies.sqlite`, `PORT=3001`, disco em `/var/data`, uma única instância. O processo escuta `0.0.0.0`. Não use filesystem efêmero para o banco.
5. O Docker executará instalação pelo lockfile, testes, TypeScript e build Vite. A imagem final contém somente frontend compilado, motor e servidor. `node:24-bookworm-slim` fornece o runtime que suporta TypeScript sem transpilar o backend e SQLite nativo.
6. Aguarde a implantação ficar saudável. Abra a URL HTTPS real e `/api/health` (deve responder `{"ok":true}`). Crie uma sala, teste o convite e a reconexão.
7. Faça um redeploy de teste e confirme que a mesma sala permanece. Interrupções breves são esperadas com disco; o cliente tenta reconectar automaticamente.

Não há chaves administrativas, credenciais de banco externo ou segredos obrigatórios no frontend. A conta Git e a conta Render são externas e dependem de você. Não foi criado repositório remoto nem efetuada cobrança.

### Alternativa: servidor próprio com Docker

```sh
docker build -t harmonies-online .
docker volume create harmonies-data
docker run -d --name harmonies --restart unless-stopped -p 3001:3001 -v harmonies-data:/var/data harmonies-online
```

Configure `PUBLIC_ORIGIN` para sua origem HTTPS real e coloque um proxy com certificado válido à frente da porta 3001. O build de Docker não foi executado nesta máquina; os testes e o build das fontes foram executados diretamente em Node24/Windows.

## HTTPS, SSE e domínios

O convite usa `location.origin`, logo deve ser copiado a partir da URL pública final. `localhost`/`127.0.0.1` nunca funcionam como convite pela internet. Por compartilhar origem, o cliente usa URLs relativas e não precisa de CORS ou endereço de backend separado.

A comunicação em tempo real é **SSE sobre HTTPS**, não WebSocket; não há endpoint `wss://` a configurar. O proxy deve preservar `text/event-stream` e não bufferizar nem cachear `/api`. O servidor envia `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no` e heartbeat. Ações seguem por POST HTTPS com Bearer privado. O certificado do domínio é administrado pela Render.

Para domínio próprio, adicione-o no painel Render, aplique exatamente os registros DNS indicados e aguarde o certificado. Atualize `PUBLIC_ORIGIN` para essa nova origem e passe a compartilhar convites por ela. Armazenamento de sessão é por origem: mudar o domínio não transporta sessões antigas. Termine partidas existentes pelo domínio anterior; não altere identidades por nome.

## Diagnóstico

| Sintoma | Conferir |
|---|---|
| Build falha | Node24, pnpm11.25, lockfile, logs TypeScript e esbuild; `allowBuilds.esbuild=true` já está configurado |
| Página retorna erro de arquivo | Build deve gerar `dist/index.html`; `WORKDIR` da imagem é `/app` |
| API responde mas não sincroniza | Resposta de `/events` deve permanecer aberta com status200 e `text/event-stream`; desative buffering/cache no proxy |
| “Origem não autorizada” | `PUBLIC_ORIGIN` deve ser exatamente esquema+host+porta públicos usados no navegador, sem barra final |
| Dados somem após redeploy | Banco precisa estar sob o caminho do disco; não use serviço gratuito/efêmero para esta configuração |
| “Sala cheia” ao voltar | Abra o navegador/perfil e origem originais; o nome não recupera uma sessão perdida |
| “Estado desatualizado” | Houve ação concorrente ou snapshot atrasado; aguarde sincronização e faça nova escolha |
| Ação sem confirmação | Use “Reenviar ação”; o mesmo ID impede execução duplicada |
| Muitas requisições | Espere um minuto; o proxy pode concentrar IPs vistos pelo Node. Ajuste o limite conscientemente para a carga real |

Sem êxito público e teste entre redes, mantenha a classificação “executável local, implantação pendente”.
