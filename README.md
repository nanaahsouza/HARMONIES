# Harmonies para dois jogadores

Aplicação executável com React/TypeScript/Vite, motor independente, servidor Node 24, atualizações SSE e persistência SQLite. Inclui os 32 padrões de animais do jogo-base, tabuleiro de 23 células, ambos os lados A/B, pontuação, fim e desempates. Sem IA ou Espíritos da Natureza. A expansão **Pulsar é opcional**: selecione-a na preparação de uma nova sala para usar42 cartas e espelhamento nos novos padrões. Detalhes e fontes em `docs/PULSAR.md`.

**Situação da entrega:** compilação e testes locais executados; fluxo de dois jogadores conferido no navegador local. Não houve implantação pública nem teste em dispositivos/redes diferentes. O critério de aceite “online em duas redes” permanece pendente até publicar e executar o roteiro de validação. Não existe URL pública desta entrega.

## Executar

Requisitos: Node **24 ou superior** e pnpm **11.25.0**. Com Node instalado:

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start
```

Abra **http://localhost:3001**. O mesmo servidor serve o frontend compilado e a API; não é necessário manter Vite aberto. O banco é criado em `data/harmonies.sqlite`. Parar ou recarregar uma aba não apaga a partida.

Para desenvolver com recarga automática, rode `pnpm server` em um terminal e `pnpm dev` em outro. Abra a URL impressa por Vite. O proxy encaminha `/api` ao Node na porta 3001. Para usar arquivo de configuração: copie `.env.example` para `.env` e inicie com `node --env-file=.env src/server/main.ts`.

### Como jogar a dois

1. A primeira pessoa informa o nome e cria uma sala. Copia o convite e o envia à outra pessoa.
2. A segunda abre o link publicado, informa o próprio nome e entra. Também pode usar o código de 12 caracteres.
3. O criador seleciona lado A/B e o primeiro jogador, conforme a regra da última paisagem magnífica. O criador também pode ligar/desligar Pulsar. Os dois confirmam a configuração; o criador inicia.
4. Em seu turno, escolha um conjunto de três peças. Selecione uma peça da mão e uma célula. As posições legais vêm do servidor. Pode pegar uma carta e posicionar animais nos momentos permitidos, inclusive entre peças.
5. Para um animal, clique em “Ver habitats”, escolha explicitamente destino/orientação e confirme “Posicionar cubo escolhido”. A interface nunca executa essa escolha sozinha.
6. Depois das três peças, encerre o turno. O servidor repõe o mercado e aplica o fim de jogo. As cartas completas liberam espaço entre as quatro ativas.

Em teste no mesmo computador, use dois navegadores/perfis diferentes. Duas abas no mesmo perfil e na mesma origem compartilham a identidade. Para a conferência local desta entrega foram usadas origens `127.0.0.1` e `localhost`, com armazenamento separado, conectadas ao mesmo servidor. Essas URLs **não** são endereços públicos.

## Arquitetura e arquivos

```text
src/
  engine/
    model.ts       tipos e quantidades oficiais
    geometry.ts    coordenadas axiais e vizinhança
    animals.ts     32 cartas, alturas, pontos e fontes individuais
    catalog.ts     verificação estrutural do catálogo
    rules.ts       preparação, validações e transições puras
    scoring.ts     paisagens, cartas e desempate
  server/
    store.ts       SQLite, identidades, revisões, recibos e projeção pública
    http.ts        API, SSE, limites e entrega do frontend
    main.ts        configuração e encerramento
  client/
    main.tsx       sala, tabuleiros, cartas e interações
    style.css      interface responsiva com gráficos próprios
tests/
  rules.test.ts
  multiplayer.test.ts
docs/
  REGRAS.md        matriz de rastreabilidade e fontes
  CARTAS.md        método de verificação e limites da proveniência
  CARTAS.csv       catálogo legível, com requisitos explícitos
  IMPLANTACAO.md   publicação e diagnóstico
  VALIDACAO.md     resultados e roteiro de teste público
Dockerfile
render.yaml
pnpm-lock.yaml
```

O navegador solicita ações; toda alteração passa pelo motor no servidor. O servidor calcula também as dicas e a pontuação. SQLite usa transações `BEGIN IMMEDIATE` para gravar estado e recibo juntos. Identificadores repetidos com o mesmo conteúdo retornam o estado atual sem repetir a ação; identificadores reaproveitados com outro conteúdo são rejeitados. A revisão esperada rejeita mensagens antigas/concorrentes. A ordem futura da bolsa e do baralho não é enviada ao navegador.

SSE usa HTTP persistente para servidor→navegador, enquanto ações usam POST autenticado. É comunicação em tempo real por servidor público, compatível com NAT; não depende de IP direto entre jogadores. O servidor Node permanece ativo; desconectar um cliente não encerra a sala. SQLite e a sessão permanecem após reiniciar o processo.

O runtime de Sites usa Cloudflare Workers. Esta entrega mantém a arquitetura Node solicitada e usa um serviço Render com disco persistente; não foi criado um Site estático que aparentasse hospedar este backend. Não há dependências de runtime externas no backend, apenas APIs nativas do Node 24.

## Sessões, reconexão e operação

- Cada participante recebe um segredo aleatório de 256 bits, salvo no navegador. O banco armazena somente seu hash. O convite contém o código da sala, nunca o segredo de quem a criou.
- A sessão é por sala e sobrevive a recarregar o mesmo navegador. Copiar só o convite não transfere a identidade. Limpar o armazenamento ou perder o dispositivo perde o acesso àquela vaga; não há recuperação por nome nem tomada de vaga.
- A conexão SSE tenta reconectar com espera crescente de 1 a 10 segundos e recebe um snapshot completo do banco. Mensagens de revisão menor são ignoradas pelo cliente. O servidor envia heartbeat a cada 20 segundos.
- Ações sem resposta mantêm o mesmo envelope no navegador. “Reenviar ação” usa o mesmo ID. Após erro de revisão, o cliente sincroniza e exige uma nova escolha; não refaz uma decisão estratégica automaticamente.
- Não há vitória por desconexão, tempo limite de turno, abandono ou perda de sessão. A partida fica aguardando. Não há substituição por IA nem alteração da pontuação.
- Salas não expiram automaticamente nesta versão. A conservação é administrativa, sem mexer no resultado. Faça backup antes de arquivar/remover dados. Não há painel administrativo exposto.
- Execute uma única instância do processo por banco. SSE e presença ficam em memória, enquanto estado e recibos ficam no disco. Não escale horizontalmente esta versão.
- O limite atual é 240 requisições de API por minuto por endereço visto pelo Node e até três streams por participante. Em proxy compartilhado pode ser necessário ajustar o limite após observar a carga. SSE não consome uma requisição por evento.
- O banco precisa de cópias de segurança. Para uma cópia manual consistente, pare o processo e copie o diretório `data` inteiro; no Render, use snapshots do disco. Nunca copie apenas o arquivo principal durante escrita sem considerar o WAL.

## Fontes e verificação

O manual normativo é o [manual BR oficial](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/08/LIBELLUD_HARMONIES_RULES_BR_compressed.pdf), consultado em 26/10/2026. Os diagramas das páginas impressas 2–9 foram renderizados e inspecionados. A [FAQ da Libellud](https://www.libellud.com/game/harmonies/) esclarece rios circulares e cubos ilimitados por substitutos.

Os 32 diagramas foram inspecionados na adaptação licenciada BGA, indicada pela Libellud. Seis foram cruzados também com manual/presskit da editora. Isso não equivale a confirmação individual das outras 26 no próprio manual: veja `docs/CARTAS.md`. Nomes não confirmados são rótulos descritivos; `officialName` permanece nulo. O motor usa somente os dados de padrões transcritos. Na atualização visual solicitada pelo usuário, o frontend passou a usar a imagem de cartas fornecida por ele, salva em public/assets/animal-cards.webp. O sprite é exibido por coordenadas CSS, somente nas 32 cartas do jogo-base; não foi incorporado código da adaptação BGA. Clique na carta para ampliá-la.

O manual confirma 66 cubos de animais e 4 de Espíritos da Natureza. A página comercial resume esses 70 cubos em conjunto. Somente animais entram neste escopo; a FAQ permite substitutos quando a reserva acaba, portanto não é criado limite artificial de 66 colocações.

Os testes de padrões verificam comportamento sobre as transcrições; não são reconhecimento automático de imagens nem certificação da editora. A matriz diferencia evidência visual de evidência automatizada. A entrega não reivindica autorização comercial da Libellud.

## Publicar

Siga `docs/IMPLANTACAO.md`. A opção concreta é **Render Web Service Docker + disco persistente**, uma instância, servindo React e API sob o mesmo HTTPS. O plano com disco é pago; depende de conta e contratação pelo usuário. Depois de publicar, execute o roteiro em `docs/VALIDACAO.md` em dois dispositivos, um no Wi-Fi e outro em rede móvel.
