# Validação

## Execução em 26/10/2026

Ambiente: Windows, Node24.22.1, pnpm11.25.0, TypeScript5.9.3, Vite7.3.7. Dependências instaladas pelo lockfile. O instalador inicialmente recusou o script de esbuild; foi configurado `allowBuilds.esbuild=true` conforme pnpm11 e a instalação terminou com sucesso.

| Verificação | Resultado | Alcance |
|---|---|---|
| `pnpm test` | **55 testes aprovados, zero falhas** | Motor e integração HTTP/SSE |
| `pnpm build` | **Aprovado** | TypeScript estrito e bundle de produção |
| Catálogo visual | **32 diagramas inspecionados** | BGA licenciado; seis também no manual/presskit |
| Duas sessões HTTP independentes | **Aprovado** | Servidor local, mesma máquina |
| Reinício com SQLite em disco | **Aprovado** | Estado, sessão e recibos restaurados |
| UI em duas origens/perfis de armazenamento | **Conferida** | Navegador local, `127.0.0.1` e `localhost`, mesmo servidor |
| Docker build | **Não executado** | Arquivo entregue; validar na hospedagem |
| Serviço Render público | **Não implantado** | Depende de conta/repositório/contratação |
| Dois dispositivos em redes diferentes | **Não testado** | Critério público ainda pendente |

### Cobertura automatizada

`tests/rules.test.ts`: 51 casos. Catálogo32; seis rotações por carta; requisitos faltantes, altura errada, destino ocupado, cubos em suportes, orientação inválida, limites; distribuições120 e reserva66 conforme documentação; preparação; empilhamento; ações obrigatórias/opcionais; reposição; cartas completas; cubo permanente; árvores/montanhas/campos/construções; rio com laço e atalho; ilhas; fim por duas causas; ordem de primeiro jogador; desempates; partida integral pelo motor.

`tests/multiplayer.test.ts`: quatro casos que abrem servidor HTTP real em porta aleatória. Duas credenciais separadas; dois streams SSE; criar/entrar; terceiro rejeitado; autenticação; turno errado; ação inválida; ID duplicado; ID reutilizado com conteúdo diferente; revisão antiga; ações concorrentes; ocultação de bolsa/baralho; reconectar stream; GET após recarga; parar/recriar servidor sobre o mesmo arquivoSQLite; persistência de sessão/estado/recibo; payload e origem inválidos; isolamento entre salas.

Os casos de carta constroem padrões a partir da transcrição e testam o motor. Pontuações têm oráculo tabular e algumas geometrias têm regressões independentes. A correção da transcrição visual é uma revisão separada, não demonstrada automaticamente pelo fato de passar nos testes.

### Conferência da interface

- U01: criar sala, abrir convite na outra origem, entrar, confirmar preparação e iniciar. Descoberta inicial: entrar por convite mantendo o mesmo código não reiniciava o efeitoSSE. Corrigido adicionando dependência da credencial; a entrada direta por convite foi repetida em nova sala, sem recarga, e a conexão imediata foi confirmada.
- U02: dois turnos de cada jogador, escolha do trio, empilhamento marrom/marrom e marrom/vermelho, árvore com altura2, escolha de carta, habitat de Pato, cubo em água adjacente à construção, pontos2, recarga mantendo cubo/turno/pontos e sincronização do mercado. Conferido no navegador.
- U03: tela desktop inspecionada e captura de uma partida real salva em `../harmonies-preview.png` na pastaoutputs. Interface usa SVG/CSS próprios; nenhum sprite comercial no bundle. Viewport390×844 conferido: largura de conteúdo375 igual à largura útil375, sem overflow horizontal.

- U04: partida completa concluída pela interface em duas sessões: oito turnos para cada jogador, encerramento por ocupação, resultado idêntico nos dois navegadores. JogadorA: paisagens14 + animais0 =14; JogadorB: paisagens20 + animais2 =22, um cubo posicionado. Tabela final e vitória doJogadorB conferidas. Captura em `../harmonies-final.png` na pastaoutputs.

## Validação depois de publicar (P01–P08)

Registre a URL pública real, commit, horário, modelo dos dispositivos e redes utilizadas. Não marque esta seção como aprovada antes de executar.

1. **P01 — HTTPS:** abra a aplicação em dispositivoA no Wi-Fi. Confirme certificado válido e `/api/health`. Registre a URL; ela deve ser pública.
2. **P02 — Redes distintas:** desligue o Wi-Fi do dispositivoB e use rede móvel. Crie sala noA e envie o convite. Entre noB. Confirme presença dos dois.
3. **P03 — Integridade:** tente entrar com terceiro navegador. Deve recusar sala cheia. Teste começar antes dos dois confirmarem: indisponível. Inicie quando ambos confirmarem.
4. **P04 — Ações:** A escolhe três peças e coloca. B observa no tabuleiro do oponente; depois B joga. Verifique mercado e pontos idênticos nas duas telas. Tente ação fora do turno e empilhamento ilegal: não deve alterar estado.
5. **P05 — Animais:** forme um padrão exato com uma carta escolhida, selecione explicitamente destino/rotação e coloque cubo. Confirme permanência e pontuação da carta nas duas telas.
6. **P06 — Rede:** interrompa a rede doB e recarregue depois de restaurar. A partida deve retornar à mesma revisão ou à mais recente. Se uma ação perdeu resposta, reenvie o mesmo envelope; não pode aparecer peça extra.
7. **P07 — Persistência:** reinicie/reimplante o serviço com o mesmo disco. Abra o convite nos perfis originais; estado/sessões/cubos devem continuar. Não crie outra sala para considerar esse item aprovado.
8. **P08 — Fim:** conclua uma partida inteira, confira mesmo número de turnos e comparação final. Registre os dois resumos de pontuação. Se houver empate, confira cubos e empate compartilhado conforme motor.

Se um item falhar, registre os passos, o erro, a revisão e o log do servidor sem compartilhar tokens privados. Corrija e acrescente regressão antes de afirmar que a versão online foi validada.

## Atualização visual com imagem fornecida pelo usuário

32 cartas renderizadas por sprite CSS 10 colunas × 5 linhas, usando as primeiras32 posições da referência3000×2580. Ampliação por clique/fechamento por Escape; cubos restantes sobre a faixa de pontos. Mesa, moldura, células e peças receberam acabamento visual. Nenhum dado de partida ou regra foi alterado. Desktop1440 e celular390 conferidos; overflow móvel detectado e corrigido por min-width0 e grid minmax0. Largura útil375 e conteúdo375 após correção. Sala existente recuperada sem executar jogadas de teste nela.


### Tabuleiro pessoal de referência
Imagem733×519 fornecida pelo usuário incorporada em public/assets/personal-board.jpeg. As23 regiões de interação foram alinhadas à imagem: centros por coluna212+80.5q, passo vertical80 e deslocamento39 nas colunas ímpares, com pequena correção horizontal por linha da fotografia. São somente coordenadas de desenho; motor, identificadores q/r e estado persistido permanecem iguais. A máscara SVG acompanha o contorno da imagem. O lado escolhido continua controlando a pontuação; a imagem é acabamento visual comum às duas faces.


### Peças ilustradas das cartas
O componente PieceArt.tsx compartilha os discos no mercado, mão, tabuleiro e diagrama ampliado. Água, montanha, copa, campo e construção mostram os próprios pixels da imagem fornecida, por máscaras SVG sem hexágono de apoio ou cubo impresso. O tronco marrom, cujo topo não aparece isolado na imagem, é desenhado sem símbolo com cores de madeira correspondentes. Pilhas mantêm a ordem real do estado; números de altura aparecem em selo separado. As alterações são somente visuais e não mudam sorteio, quantidades ou validação de jogadas.


### Interface moderna
Camada modern.css com tipografia de sistema, superfícies claras, painéis com bordas suaves, avatares e indicadores separados para bolsa/baralho/cubos. Artes, mapa de células, regras, sessões e estado preservados. Build TypeScript/Vite executado com sucesso. Conferido em1440px e390px: conteúdo útil1425/1425 e375/375, sem overflow horizontal. Indicadores não sobrepõem botão de fim de turno. Ampliação de carta e fechamento por Escape conferidos. Console sem erros observados.


### Correção do hover das cartas
Removidos legenda Ampliar e movimento ao passar o mouse. O estado hover agora mantém explicitamente tamanho1000%500% e posição do sprite, evitando que o background genérico de botões mostrasse outra região da imagem. Conferido no navegador com hover:true: posição0%25%, tamanho1000%500%, transform:none e zero legendas, iguais ao estado sem hover. Clique continua sendo a ação explícita de abrir detalhes.


### Apresentação inspirada no iOS
Camada ios.css com fonte de sistema, fundo cinza claro agrupado, superfícies brancas, ações em azul e cabeçalho translúcido. Artes e regras preservadas. Compilação TypeScript/Vite aprovada. Layout móvel390 conferido com largura útil375 e conteúdo375; console sem erros observados. Ampliação explícita por clique e fechamento por Escape funcionam; sem legenda ou transformação no hover e sprite mantém1000%500%.


## Expansão Pulsar — 27/10/2026
Executados70 testes (55 anteriores +15 Pulsar), todos aprovados, e build TypeScript/Vite aprovado. Verificação normativa, catálogos e cobertura estão em PULSAR.md. Duas sessões de navegador locais conferiram ligar/desligar32/42, escolha refletida no participante2, configuração restrita ao criador, início conjunto, compra de carta Pulsar e passagem/reposição do turno. Salas antigas continuam como base. Novas cartas usam diagramas verificados e ilustrações próprias. Não houve implantação pública.


## 27/10/2026 — Organização da área de jogo
- Cartas da coleção movidas para cima do tabuleiro pessoal.
- Conjuntos e peças da mão na lateral direita, com painel fixo durante a rolagem no computador.
- Em telas pequenas, conjuntos em faixa compacta acima do tabuleiro.
- Compilação TypeScript/Vite concluída e conferência visual no navegador, sem alterar jogadas da sala.


## 27/10/2026 — Cubos selecionáveis
- Clique na carta da coleção ou nos cubos para selecionar o animal.
- Destinos válidos destacados no tabuleiro; clique no destino envia a posição e a orientação válidas ao servidor.
- Seleção pode ser cancelada; habitat incompleto exibe orientação, sem permitir posição inválida.
- Conferência visual da seleção e destaque sem efetuar jogadas na sala do usuário. Build aprovado e 70 testes passaram.


## 27/10/2026 — Cartas conforme referências de mesa
- Oferta com cinco cartas inteiras na mesma linha, acima da área pessoal.
- Habitats escolhidos juntos ao tabuleiro, sem descrições e botões repetidos; cubos selecionáveis preservados.
- Celular com oferta, cinco conjuntos compactos e área pessoal em sequência; computador com conjuntos à direita.
- Conferido no navegador em 1440 e 390 pixels, sem transbordamento horizontal no celular. Build TypeScript/Vite aprovado.


## 27/10/2026 — Reserva de peças e cubos dourados
- Reserva central vetorial com cinco cavidades circulares, base escura e folhas, inspirada na referência enviada.
- Cinco botões originais preservados, com peças e contagem da bolsa; adaptação visual conferida em 1280 e 390 pixels.
- Cubos vetoriais dourados com três faces nas cartas, diagramas e tabuleiro, preservando a seleção.
- Build TypeScript/Vite aprovado; cinco áreas de seleção e ausência de transbordamento confirmadas no celular.


## 27/10/2026 — Peças conforme fotografias
- Seis discos vetoriais com motivos de ondas, folhas, flores, construção e montanha; tronco marrom liso e textura sutil de madeira.
- Cubo âmbar com transparência, reflexos e arestas internas, centralizado na face superior das peças e diagramas.
- Build TypeScript/Vite aprovado e conferência visual da peça com animal no navegador, sem alterar jogadas.


## 27/10/2026 — Tabuleiro de conjuntos e placar final
- Base com cinco lóbulos, áreas claras sem aros, textura e seta alongada conforme novos modelos.
- Removida a fileira extra de cubos abaixo das cartas; cubos da própria carta continuam selecionáveis.
- Placar detalhado e total renderizados somente quando a partida termina.
- Build aprovado. Navegador confirmou cinco conjuntos, zero fileiras extras e zero placares durante partida ativa.


## 27/10/2026 — Ilustrações Pulsar
- Atlas com dez ilustrações geradas pela ferramenta de imagens a partir da foto enviada, incluindo o Iaque (pulse-08).
- Arte adicionada em public/assets/pulse-cards-restored.png; números, diagramas e cubos sobrepostos a partir do catálogo real para evitar informações geradas incorretas.
- Build TypeScript/Vite aprovado e carta Peixe conferida na sala de teste, inclusive ampliação e diagrama. Regras preservadas.


## 27/10/2026 — Fotos originais Pulsar
- Artes geradas substituídas pela fotografia original enviada pelo usuário, sem redesenho ou sobreposição de números e diagramas na carta.
- Cada carta usa um enquadramento da mesma imagem original; cubos interativos preservados.
- Build aprovado e carta Peixe conferida visualmente na sala de teste.


## 27/10/2026 — Reiniciar meu turno
- Botão restaura o estado anterior à primeira ação do turno: mão, tabuleiro, cartas, cubos e reservas.
- Snapshot privado persistido em SQLite, removido ao encerrar o turno; bloqueado para adversário e partida encerrada.
- Atualizações anteriores à instalação não possuem snapshot; novas ações passam a ser registradas.
- Build aprovado e 73 testes passaram, incluindo restauração, persistência, idempotência e bloqueio após encerrar.
- Teste no navegador: pegar três peças habilitou o botão e reiniciar devolveu as três ao conjunto, sem mudar de jogador.


## 27/10/2026 — Partidas de 2, 3 e 4 jogadores e encerramento pelo host
- Configuração de lugares na criação e preparação, assentos privados corretos e presença SSE para até quatro pessoas.
- Ordem circular a partir de qualquer primeiro jogador; gatilhos normais completam a rodada para todos terem o mesmo número de turnos.
- Seletor para consultar qualquer tabuleiro; edição somente no próprio turno e no próprio tabuleiro.
- Host pode encerrar mediante confirmação, inclusive fora de seu turno. Turno incompleto desfeito; placar parcial, sem vencedor oficial, sem retomada.
- Compatibilidade com salas antigas de dois jogadores e com Pulsar.
- Build TypeScript/Vite aprovado; 129 testes passaram, incluindo partidas integrais, todos os primeiros jogadores, todos os assentos disparando fim, quatro sessões HTTP/SSE e persistência.
- Navegador: criação e início de sala com quatro lugares; consulta ao quarto tabuleiro; cancelar e confirmar encerramento. Em 390 pixels, quatro participantes visíveis sem transbordamento da página. Nenhuma jogada efetuada na sala real do usuário.


## 28/10/2026 — Prévia local: mesa completa sem troca de tabuleiro
- Todos os jogadores renderizados juntos, com cartas e tabuleiros independentes; removido o seletor de visualização.
- Barra superior e painéis compactados; escala ajustada ao espaço disponível por ResizeObserver, sem mudar coordenadas das peças.
- Corrigida regra de grid-area herdada que sobrepunha as áreas pessoais; cada painel ocupa sua própria coluna.
- Build TypeScript/Vite aprovado. Em 1280x720, os quatro tabuleiros têm coordenadas horizontais distintas e cabem na altura; em 390x844, os dois tabuleiros aparecem simultaneamente sem transbordamento.
- Conferidas seleção, colocação de peça no tabuleiro correto e reinício do turno em sala de teste; nenhuma jogada alterada em sala real.
- Alterações mantidas somente no computador para teste. Nenhum commit ou envio ao GitHub nesta alteração.


## 28/10/2026 — Proporção das cartas e mão junto ao tabuleiro (somente local)
- Quatro espaços proporcionais de habitats acima de cada paisagem, conforme referência enviada; cartas completas em miniaturas separadas.
- Peças da mão posicionadas em coluna à direita do tabuleiro do jogador da vez, com seleção restrita ao dono.
- Removida a mão do tabuleiro central. Mesas continuam juntas, com ajuste ao tamanho da janela.
- Build aprovado; teste no navegador confirmou três peças na lateral, seleção, colocação na célula correta e restauração pelo reinício do turno. Em 1280x720, sem rolagem da página.
- Nenhum envio ao GitHub.


## 28/10/2026 — Painel de vez ao lado dos conjuntos (local)
- Lista de participantes à direita da reserva, com avatar, presença e destaques Jogando agora/A seguir/Aguardando.
- O jogador atual e o próximo são derivados do turno autoritativo recebido pelo SSE; partidas encerradas não destacam turno ativo.
- Build aprovado. Conferência no navegador confirmou painel à direita, jogador atual correto e mesa sem rolagem em 1280x720.
- Nenhum envio ao GitHub.


## 28/10/2026 — Fundo bege unificado (local)
- Aplicado o tom da área dos tabuleiros ao fundo da página, cabeçalho, barra da sala, turno, oferta, conjuntos, participantes e diálogos.
- Destaques de turno e seleção preservados. Build aprovado e conferência visual no navegador.
- Nenhum envio ao GitHub.


## 28/10/2026 — Oferta ampliada no computador (local)
- Cartas disponíveis, botões de pegar carta, peças e reserva central ampliados na versão para computador.
- Espaço da mesa distribuído conforme a altura disponível, mantendo as áreas pessoais visíveis e a proporção entre suas cartas e paisagem.
- Build aprovado. Em 1280x720, cartas disponíveis com cerca de 91px de largura (antes cerca de 53px) e reserva com cerca de 169px (antes cerca de 110px); todos os tabuleiros visíveis e sem rolagem vertical.
- Regras de layout do celular preservadas. Nenhum envio ao GitHub.


## 28/10/2026 — Paleta da referência (local)
- Café no fundo, creme nas superfícies, pêssego nos controles secundários e verde nos estados ativos e seleções.
- Cores das ilustrações e peças preservadas. Paleta aplicada também à entrada, preparação e diálogos.
- Build aprovado e conferência visual no navegador. Nenhum envio ao GitHub.


### 28/10/2026 — Cenário e painéis inspirados na referência
- Fundo original fornecido pelo usuário copiado sem alterações para public/assets/sunrise-landscape.png.
- Painéis translúcidos em tons de pergaminho, identificação colorida na base de cada tabuleiro e lista de turnos em verde escuro.
- Cartas, peças, coordenadas e regras preservadas. Alterações somente locais, sem publicação no GitHub.
- Build TypeScript/Vite aprovado. Revisão no navegador em 1280x720 (2 e 4 jogadores) e 390x844 (4 jogadores), sem rolagem vertical e sem sobreposição dos tabuleiros.

### 28/10/2026 — Painéis compactos
- Oferta limitada à largura das cinco cartas e nomes dos animais removidos da mesa (identificação acessível preservada).
- Removido painel lateral de ordem dos jogadores; indicação da vez permanece na faixa superior.
- Barras de identificação abaixo dos tabuleiros acompanham o conteúdo, com margem para o ícone.
- Build aprovado e visual conferido no navegador em 1280x720, sem rolagem vertical. Somente local.

### 28/10/2026 — Escolha direta da carta
- Carta disponível passa a executar takeCard ao clicar/toque na imagem; botão separado removido.
- Brilho dourado no hover das cartas elegíveis e no foco de teclado, sem ampliação ou alteração da arte.
- Bloqueios de turno, ação pendente, escolha já feita e limite de habitats preservados com botão nativo desabilitado.
- Build aprovado. Testado clique direto, bloqueio das outras cartas e reinício do turno na sala de testes CIHWQXHIN2EK, restaurada após o teste. Somente local.

28/10/2026: cartas disponíveis recebem elevação de 4px e zoom de 3,5% junto do brilho, com transição suave e respeito a movimento reduzido. Build e foco visual conferidos no navegador. Somente local.

### 28/10/2026 — Estabilidade ao realizar ações
- Aviso de ação não confirmada aparece apenas quando não há requisição em andamento, evitando inserção e remoção de faixa durante confirmação normal via SSE/HTTP.
- act ignora chamadas enquanto busy. Preservados armazenamento de ação e reenvio em falhas.
- Espaço de reposição usa a mesma proporção da carta; reserva não muda opacidade ao bloquear e ambos os painéis têm a mesma altura.
- Build aprovado. Na sala de testes: pegar carta, pegar conjunto, selecionar e colocar peça, reiniciar turno. Altura dos dois painéis permaneceu 210,92px, posição da linha de tabuleiros 359,39px e escala 0,868098 antes/depois. Sala restaurada. Somente local.

### 28/10/2026 — Tabuleiro de conjuntos inspirado na nova foto
- SVG remodelado em proporção larga com cinco lóbulos, cinco bases de madeira, centro sem seta, pequenos motivos de folhas e textura de papel.
- Conjuntos reposicionados sobre as cinco bases; contagem da bolsa fora do centro.
- Build aprovado. Seleção do conjunto inferior e reinício do turno conferidos na sala de testes, restaurada após validação. Somente local, sem GitHub.

### 28/10/2026 — Estabilidade na seleção do cubo de animal
- Orientação do habitat passa a sobrepor a base decorativa do painel, sem aumentar sua altura ao selecionar ou remover a seleção.
- Build aprovado. Sala de testes: pegar carta, selecionar cubo, cancelar e reiniciar turno. Escala 0,884375 e posição dos tabuleiros 353,36px permaneceram iguais antes, durante e após a seleção. Habitat de teste ainda incompleto: não foi realizado placeAnimal neste teste. Sala restaurada, mudanças somente locais.

### 28/10/2026 — Hover dos controles sem redimensionamento
- Estilos antigos de hover ampliavam o padding do botão de encerrar turno. Geometria dos três controles agora é explícita e igual nos estados normal, hover, foco e ativo; efeito restrito a cor/sombra.
- Build aprovado. Hover real conferido nos botões Encerrar turno e Encerrar partida via clique direito e Escape, sem executar nenhuma ação da partida. Altura dos botões 31px, faixa 52,39px e escala da mesa 0,884375 permaneceram constantes. Somente local.

### 28/10/2026 — Ficha ilustrada de pontuação
- Substituída tabela resumida por ficha em papel bege, com peças ilustradas, seis categorias por jogador e total em faixa verde.
- Modal nativo abre apenas ao encerrar a partida; pode ser fechado e reaberto para consultar os tabuleiros. Mantém resultado parcial sem vencedor quando host encerra antecipadamente.
- Valores vêm diretamente do detalhamento do servidor, sem mudança de regras ou cálculos.
- Build aprovado. Conferidos resultado normal de dois jogadores (somas 14 e 22), quatro jogadores, fechamento/reabertura e layout de celular 390x844. Somente local, sem GitHub.

### 28/10/2026 — Versão autorizada para GitHub
Usuário autorizou o envio da versão atual. Build e 129 testes aprovados. Envio inclui fonte, documentação e imagem de fundo utilizada; banco de partidas, dependências, build gerado e configurações privadas não fazem parte do repositório.

### 28/10/2026 — Revanche e retorno à página inicial (somente local)
- Host pode preparar uma revanche após o fim normal ou antecipado. Sala, sessões, participantes e opções permanecem; tabuleiros e cartas voltam ao estado de preparação, com todos desmarcados para confirmar novamente.
- Botões no placar e na faixa de resultado; link Início disponível no topo para criar/entrar em outras salas. Retorno à entrada não apaga a sessão anterior.
- Build e 135 testes aprovados, incluindo revanche com 2, 3 e 4 participantes, com/sem Pulsar, bloqueio por host, bloqueio durante partida, idempotência e preparação obrigatória.
- No navegador: revanche da sala de testes de 4 jogadores voltou à preparação; Início abriu criação/entrada. Sala real do usuário não foi alterada. Servidor local reiniciado preservando o SQLite existente.
- Usuário pediu testar antes: alterações não enviadas ao GitHub.

28/10/2026: retiradas as faixas de pontuação dos tabuleiros após o fim da partida. Pontos permanecem na ficha de resultado. Build aprovado e ausência das faixas confirmada no navegador em partida concluída. Alteração somente local.

28/10/2026: cartas concluídas ampliadas de 29px para 48px na mesa e movidas para abaixo do tabuleiro, acima do nome. Linha única com deslocamento horizontal quando necessário. Orientação de cubo ancorada ao tabuleiro para não cobrir as cartas concluídas. Build aprovado; posição conferida no navegador com carta concluída existente, sem realizar ações na partida. Sem rolagem vertical em 1280x720. Somente local.

28/10/2026: novo aumento das cartas concluídas, de 48px para 62px, mantendo a posição acima do nome. Build e revisão visual aprovados. Somente local.

28/10/2026: usuário autorizou envio ao GitHub da revanche, retorno à página inicial, retirada dos pontos sob os tabuleiros e cartas concluídas ampliadas. Build e 135 testes aprovados.

28/10/2026: imagem fornecida harmonies logo.png adicionada sem alterações como favicon e apple-touch-icon. Build aprovado e hash da imagem de origem idêntico ao arquivo distribuído. Alteração somente local.

### 28/10/2026 — Capa, logo e Sobre o jogo na página inicial
- Aplicadas as imagens fornecidas do leão na paisagem e da logo do Harmonies, preservando os arquivos originais.
- Apresentação em painel verde escuro com texto claro; formulário bege com contraste reforçado e espaçamentos menores.
- Inserido integralmente o texto Sobre o jogo fornecido pelo usuário.
- Logo de imagem no cabeçalho da entrada e das salas. Ícone anterior preservado.
- Build aprovado; capa, logo e texto conferidos no navegador em 1280x720 e 390x844, sem transbordamento horizontal. Sem envio ao GitHub.

### 28/10/2026 — Nova entrada inspirada no modelo e Como jogar (local)
- Removida a frase UM ENCONTRO ENTRE PAISAGENS COMPARTILHADAS.
- Painel claro à esquerda, arte do leão à direita, duas opções principais de criação/entrada e resumo Sobre o jogo com Saiba mais.
- Formulários próprios para criar sala e entrar por código; erros do servidor também aparecem no formulário.
- Como jogar reúne o texto completo do usuário, preparação, ações, empilhamento, cubos, pontuação, fim de partida e revanche. Conteúdo baseado nas regras implementadas/documentadas no projeto.
- Configurações permite escolher o número inicial de participantes; opções da partida seguem na preparação.
- Build aprovado. Criada sala de testes EBKZLVHBAXXR pelo novo formulário e confirmada entrada de outra sessão por código. Abertura de instruções e configurações conferida; responsividade 1280x720 e 390x844 sem transbordamento horizontal. Sem ações na partida real do usuário. Nenhum envio ao GitHub.

### 28/10/2026 — Entrada simplificada e opções na criação (local)
- Retirados 01 / ENCONTRE-SE, Saiba mais e Configurações; topo mantém somente Como jogar.
- Imagem Sobre o jogo substituída pela caixa fornecida, sem alteração do arquivo.
- Criar sala inclui nome, número de pessoas, lado A/B e Pulsar. HTTP/Store validam e salvam as escolhas atomicamente na criação, mantendo os padrões anteriores quando omitidas.
- Build e 136 testes aprovados. Novo teste HTTP cobre as combinações de 2–4 jogadores, A/B, Pulsar ligado/desligado e opções inválidas sem criar salas.
- Navegador: sala de teste WCRASASB2TBN criada com 4 jogadores, lado B e Pulsar; configuração confirmada na preparação. Formulário móvel 390x844 cabe na tela sem transbordar horizontalmente. SQLite existente preservado; servidor local reiniciado para aplicar o backend. Nenhum envio ao GitHub.

28/10/2026: formulário Criar sala/Entrar com código ajustado para branco quente do painel inicial, com campos claros e opção Pulsar em tom neutro. Build e revisão visual aprovados. Somente local.

### 28/10/2026 — Mesa com painéis claros e coluna da partida (local)
- Aplicada composição da referência: participantes/vez na coluna esquerda, oferta de cartas ao centro, conjuntos à direita e áreas dos jogadores abaixo.
- Controles do turno em cápsulas claras no topo, com cores distintas e geometria fixa em hover/foco/ativo. Painéis arredondados claros e translúcidos.
- Preservados tabuleiros, cartas originais, peças, cubos, cartas concluídas, regra de pontuação final, reinício de turno, encerramento e revanche.
- Sidebar mostra nome e presença dos participantes, host, vez, rodada, edição, lado, contagens e convite/início.
- Build aprovado. Conferidas partida ativa e concluída, desktop 1280x720 e celular 390x844, sem rolagem vertical. Em sala de testes: pegar carta, hover de controle, selecionar cubo e reiniciar; escala 0,856338, altura do controle 37px e posições dos tabuleiros constantes. Sala de testes restaurada, sem ações na partida real do usuário. Nenhum envio ao GitHub.

### 28/10/2026 — Painel justo às cartas e avatares (local)
- Painel da oferta no desktop acompanha a largura das cinco cartas; reserva fica ao lado, sem esticar a janela da oferta.
- Contagem da bolsa retirada do tabuleiro de conjuntos e da coluna de informações; estado/regra da bolsa preservados.
- Quatro avatares: Corvo e Lontra das imagens fornecidas, Coala da arte original das cartas e Leão da imagem fornecida anteriormente. Sem gerar imagens substitutas.
- Escolha na preparação e ao clicar no próprio avatar na partida. Avatar salvo por participante, sincronizado e mostrado na lista e na barra do tabuleiro. Salas antigas recebem opções padrão sem migração destrutiva.
- Build e 137 testes aprovados; teste de avatares repetido após escolha final dos quatro modelos. Cobre identidade, validação, idempotência, persistência, compatibilidade e revanche.
- Navegador: seleção de Coala na sala de testes WCRASASB2TBN persistiu após recarregar. Seletor durante a partida conferido na sala de testes CIHWQXHIN2EK. Oferta termina a aproximadamente 14px da última carta em 1280x720, sem rolagem vertical. Nenhuma ação na sala real. Servidor reiniciado preservando o banco. Sem envio ao GitHub.

### 28/10/2026 — Alinhamento das janelas e hover de reiniciar (local)
- Hover/foco de Reiniciar turno em azul-marinho com texto branco; Encerrar turno em verde com texto branco, mantendo geometria fixa.
- Retirada indicação você apenas da barra de nome sob os tabuleiros. Identificação na lista de participantes preservada.
- Mesa centralizada como conjunto. Coluna da partida, oferta e reserva compartilham início/fim na primeira linha; tabuleiros abaixo começam no início da oferta e terminam no fim da reserva, com alturas iguais.
- Reserva centralizada horizontal/verticalmente dentro da janela.
- Build aprovado. Bordas verificadas em 1920x920 e 1280x720 sem rolagem vertical. Hover real conferido: fundo rgb(37,59,104), texto branco, posição e dimensões idênticas antes/depois. Ação de teste desfeita via Reiniciar meu turno; nenhuma ação na partida real. Sem envio ao GitHub.

28/10/2026: painel de informações mais largo e com participantes lado a lado, edição e rodada na horizontal. Reduzida a altura natural do painel para evitar espaço sobrando nas janelas de cartas e conjuntos, preservando as bordas comuns. Build e revisão visual em 1280x720 aprovados, sem rolagem vertical. Somente local.

28/10/2026: ampliadas folgas horizontais e verticais nos trios da reserva e removida margem negativa do terceiro disco. Proporção dos discos no desktop ajustada para separar também grupos vizinhos. Build aprovado e visual conferido no navegador. Somente local.

28/10/2026: conforme esclarecimento, os três discos voltam a formar um trio compacto; folga preservada entre conjuntos, mantendo a proporção menor dos discos na reserva. Build e revisão visual aprovados. Somente local.

28/10/2026: conteúdo visual das peças do tabuleiro elevado 8 unidades SVG para centralizar o disco nos hexágonos. Pilhas, sombras, indicador de altura e cubos deslocados juntos; grade, coordenadas lógicas e alvos de clique preservados. Build e revisão visual com pilhas e cubo aprovados. Somente local.

### 28/10/2026 — Avatar no formulário e espera no lobby
- Criar sala permite escolher Corvo, Lontra, Coala ou Leão, junto ao nome e às opções da partida.
- Avatar validado e salvo na mesma requisição de criação; clientes antigos mantêm avatar padrão.
- Entrada direta no lobby, sem iniciar automaticamente. Todos os lugares precisam estar ocupados e todos devem confirmar antes de o host iniciar.
- Build concluído e 137 testes aprovados. Integração cobre os quatro avatares, persistência, opções inválidas e bloqueio de início com participantes ausentes ou não preparados.
- Navegador: selecionar avatar não envia o formulário; criação com Leão levou diretamente ao lobby, recarregar preservou a imagem e Iniciar partida permaneceu desabilitado com 1/2 participantes.
- Alterações locais, sem publicação no GitHub.

### 28/10/2026 — Espera diretamente na mesa
- Substituída a tela Preparem a partida pela própria mesa, com tabuleiros vazios, vagas e convite enquanto faltam participantes.
- Criar sala ativa entrada direta; último ingresso inicia automaticamente e transmite o estado para todos. Opções e avatar permanecem os escolhidos na criação.
- Jogadas ficam bloqueadas no cliente e servidor antes da sala completar. Nenhuma confirmação ou botão Iniciar é necessário no fluxo atual.
- Salas anteriores sem partida ativa entram no mesmo fluxo quando o host abre a mesa. Partidas já em andamento são preservadas.
- 138 testes aprovados; teste HTTP de entrada direta cobre 2, 3 e 4 jogadores, avatares, configurações, bloqueio antecipado, sala cheia e salas anteriores.
- Navegador: criador entrou diretamente na mesa (1/2); convidado entrou pelo convite em outra sessão; ambos receberam início automático sem confirmação.
- Build concluído. Alterações locais, sem publicação no GitHub.

### 28/10/2026 — Avatar de quem entra por convite
- Campo Seu avatar também em Entrar com código, com os mesmos quatro animais.
- Avatar enviado e validado na própria entrada; valores ausentes preservam o padrão por assento e valores inválidos não ocupam vaga.
- 138 testes aprovados e build concluído. Integração HTTP cobre convidados com os quatro avatares, persistência e início automático com a última entrada.
- Navegador: seleção de Coala não enviou formulário; entrar iniciou a sala de teste e recarregar preservou o avatar escolhido.
- Alteração local, sem envio ao GitHub.

### 28/10/2026 — Página inicial com painel à direita
- Composição ajustada ao novo modelo: paisagem inteira, leão em destaque à esquerda, painel creme translúcido à direita e Como jogar no topo.
- Criar sala em verde petróleo, entrada por código mais leve e caixa do jogo com descrição no rodapé do painel.
- Formulários, avatares e instruções preservados. Adaptação para celular com arte acima do painel.
- Build concluído. Conferência visual em 1280×720 (sem rolagem vertical) e 390×844 (sem transbordamento horizontal). Diálogos de criação e Como jogar abriram corretamente no celular.
- Alterações locais, sem publicação no GitHub.

### 28/10/2026 — Acabamentos da página inicial
- Ícone de livro restaurado em Como jogar.
- Caixa do jogo recortada visualmente pelo contorno em CSS, retirando o quadrado branco e preservando a imagem original.
- Entrar com código com o mesmo verde do botão Criar sala e brilho suave ao passar o mouse ou focar pelo teclado, sem mudar a geometria.
- Build aprovado e conferência visual no navegador; foco de teclado confirmou o brilho na borda.
- Alterações locais, sem envio ao GitHub.
