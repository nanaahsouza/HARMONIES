# Expansão Pulsar opcional

Implementada em 27/10/2026, mantendo o jogo-base como padrão.

## Como escolher

Na preparação de uma **nova sala**, o criador pode ligar/desligar “Expansão Pulsar”. Desligada: 32 cartas do jogo-base. Ligada: as 32 originais e as 10 Pulsar são embaralhadas juntas (42). Cinco ficam reveladas e 37 no monte. A bolsa continua com120 peças e todas as demais regras de paisagem, turnos, fim e desempate permanecem iguais.

Os dois participantes veem a escolha. Alterar lado, primeiro jogador ou expansão remove as confirmações de preparação; ambos precisam reconfirmar. O modo fica bloqueado depois do início. Salas antigas, sem o campo `pulse`, são lidas como jogo-base e mantêm suas jogadas e sua pontuação.

## Regra normativa

O [folheto oficial multilíngue, seção em português, página1](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/07/HARMONIES_PULSE_RULES_ML.pdf), ligado pela [página Libellud](https://www.libellud.com/game/harmonies-pulse/), determina:

- Acrescentar e embaralhar as10 cartas com o baralho de Animais na preparação.
- Permitir simetria além da orientação do padrão. Os padrões do jogo-base continuam sendo usados como antes.

O PDF foi baixado, renderizado e inspecionado visualmente, incluindo os exemplos de simetria. A reflexão axial utilizada é `(q,r) → (-q,r+q)`, seguida de uma das seis rotações. Nas cartas Pulsar, o jogador escolhe explicitamente uma orientação normal ou “espelhado”; não há posicionamento automático.

O motor recusa o campo de espelhamento em jogo-base e exige `pulse=true` e uma carta Pulsar com `allowMirror=true`. As cartas base já possuem as simetrias relevantes por rotação, portanto não foi adicionado um novo modo de transformá-las. Os10 novos padrões têm três cores e alturas exatas.

## Catálogo e proveniência

`src/engine/pulse.ts` registra requisitos, destinos, pontuações e fonte individual de cada carta. Os diagramas foram conferidos visualmente no sprite da adaptação licenciada BGA indicada pela Libellud, posições43–52: 32 cartas-base, depois10 Espíritos (não incluídos) e então10 Pulsar. Não houve reprodução de arte ou código BGA no produto.

Os nomes abaixo são identificações visuais descritivas, não nomenclatura oficial confirmada; `officialName=null`. Os valores são descobertos do primeiro cubo removido ao último.

| ID | Identificação visual | Pontos | Requisitos e posição do cubo |
|---|---|---|---|
| pulse-01 | Peixe | 6/13 | Campo1–árvore3–água1 em V aberto; cubo água extrema |
| pulse-02 | Axolote | 7/16 | Montanha2, árvore2 e água1 em triângulo; cubo água |
| pulse-03 | Pássaro de peito vermelho | 4/10/17 | Verde1, cinza1 e construção2 em triângulo; cubo construção |
| pulse-04 | Gaivota | 5/11 | Água1–campo1–construção2 em V aberto; cubo construção extrema |
| pulse-05 | Tigre | 3/10/16 | Água1–cinza1–verde1 em V aberto; cubo verde extremo |
| pulse-06 | Camaleão | 4/8/15 | Água1–verde1–campo1 em V aberto; cubo verde central |
| pulse-07 | Camelo | 4/9/16 | Construção2–cinza1–campo1 em V aberto; cubo cinza central |
| pulse-08 | Iaque | 7/16 | Água1–montanha2–campo1 em linha; cubo montanha central |
| pulse-09 | Panda | 5/13 | Árvore3, cinza1 e campo1 em triângulo; cubo campo |
| pulse-10 | Besouro | 5/12 | Construção2–campo1–cinza1 em linha; cubo campo central |

No V aberto, as duas pontas não são adjacentes. No triângulo, as três células são mutuamente adjacentes. Em cada carta, as coordenadas explícitas eliminam a ambiguidade de quiralidade e do destino; não são deduzidas do nome do animal.

As cartas novas possuem **ilustrações vetoriais próprias** e mostram os requisitos reais com as mesmas peças usadas na interface. A referência de arte enviada anteriormente pelo usuário continha32 cartas-base e10 Espíritos, não as cartas Pulsar. Por isso não foram atribuídas artes erradas do sprite-base às novas cartas.

## Implementação e testes

| Área | Implementação | Verificação |
|---|---|---|
| Seleção32/42 | `catalogFor`, `validateCatalog`, `setup` | P01/P15 |
| Reflexão e rotação | `orient`, `habitatMatches`, `legalHabitats` | P02–P12 |
| Bloqueio de transformação ilegal, cubo definitivo e pontos | `applyAction`, `animalScore` | P13 |
| Confirmação coletiva, configuração imutável e persistência | `Store.act`, normalização de salas antigas | P14 |
| Interface sincronizada | Switch somente para criador, selo do modo, dicas “espelhado” | Duas sessões de navegador locais |

Foram executados **70 testes com sucesso**, incluindo55 anteriores e15 novos. Os10 padrões passam por12 orientações (seis normais e seis espelhadas), ausência/altura errada, destino ocupado, bordas e pontos. Os padrões quirais não passam somente com uma rotação da versão normal.

Conferência no navegador: ligar/desligar refletiu32/42 nas duas sessões; o participante2 não pôde alterar a opção; ambos confirmaram; partida iniciou com37 cartas no monte; uma carta Pulsar foi escolhida; três peças foram colocadas; o fim do turno repôs carta e peças e passou a vez ao outro participante. Não foi afirmado teste público ou entre redes diferentes.
