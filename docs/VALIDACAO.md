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

