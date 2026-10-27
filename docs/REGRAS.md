# Especificação e rastreabilidade

Consulta em 26/10/2026. Páginas abaixo são as **páginas impressas**, não o índice de páginas do PDF. O PDF BR reúne duas páginas por imagem: PDF2=impressas2–3, PDF3=4–5, PDF4=6–7, PDF5=8–9. As quatro imagens foram renderizadas e examinadas visualmente. Não foram usados somente os textos extraídos.

Fontes:

- **BR**: [Manual oficial em português brasileiro](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/08/LIBELLUD_HARMONIES_RULES_BR_compressed.pdf).
- **EN**: [Manual oficial inglês comprimido](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/07/HARMONIES_Rules_EN_compressed-1.pdf). O link inglês antigo de 23MB fornecido no pedido excedeu o limite do leitor web; foi localizada a versão atual na página oficial.
- **FAQ**: [Página e FAQ Libellud](https://www.libellud.com/game/harmonies/), seções “Scoring Rivers”, “Scoring Circular Rivers” e “Number of Animal Cubes”. Não foi localizada uma errata oficial separada do jogo-base nas páginas consultadas; isso não prova inexistência de outras publicações.
- **LUDO**: [Componentes e ficha](https://ludopedia.com.br/jogo/harmonies), [resumo de regras](https://ludopedia.com.br/jogo/harmonies/regras). O resumo declara auxílio de IA; é secundário, não normativa. Não substituiu o manual.
- **CARTAS**: sprite da adaptação licenciada BGA, ligado pela página oficial. Referência por linha/coluna em `animals.ts`. Auditoria em `CARTAS.md` e transcrição tabular em `CARTAS.csv`.

“Validado” nesta matriz significa comparação da regra com a fonte indicada e execução do teste relacionado. Não é certificação oficial nem prova exaustiva de todos os estados possíveis.

| ID | Regra/decisão normativa | Fonte, página/seção | Implementação | Testes | Status |
|---|---|---|---|---|---|
| R01 | 120 peças: azul23, cinza23, marrom21, verde19, amarelo19, vermelho15; 32 animais; 66 cubos de animais | BR2 | `model.COUNTS`, `freshTokens`, `setup` | R01 | Validado, texto e imagem |
| R02 | Duas pessoas, cinco trios e cinco cartas; ambos escolhem mesmo lado; primeiro por última paisagem magnífica | BR2–3 | `setup`, `Store.act(configure/ready/start)` | R01, M01 | Validado |
| R03 | Tabuleiro de 23 espaços, colunas5/4/5/4/5, adjacência por aresta | BR3, diagrama tabuleiro | `emptyBoard`, `neighbors` | R02 | Validado visualmente |
| R04 | Uma escolha de trio por turno, três peças obrigatórias; ações opcionais intercaláveis | BR4–5 | `applyAction` | R06, R07 | Validado |
| R05 | Qualquer peça em célula vazia; não inserir abaixo, não colocar em célula com cubo | BR4, diagrama | `canStack`, `applyAction(placeToken)` | R03, R07 | Validado visualmente |
| R06 | Cinza1/2/3; marrom1/2; verde sozinho ou sobre1/2marrons; vermelho sozinho ou sobre1cinza/marrom/vermelho; nenhum outro empilhamento | BR4, diagrama | `canStack` | R03 | Validado visualmente |
| R07 | Máximo uma carta escolhida por turno; quatro ativas; colocar cubos em todos espaços da carta ao pegar | BR5 | `applyAction(takeCard)`, contadores de `HeldCard` | R06, R08 | Validado |
| R08 | Habitat exato, árvore/montanha com altura exata; construção aceita três bases; destino livre | BR6–7, diagramas | `habitatMatches`, `applyAction(placeAnimal)` | C01–C32, R05 | Validado |
| R09 | Seis rotações da grade; sem espelhamento no base | BR7 “Orientações”; página Libellud explica espelhamento como novidade Pulse | `rotate`, `rotations` | R02, C01–C32, R04 | Validado, nenhuma expansão incluída |
| R10 | Peças compartilháveis entre habitats; cubo de suporte não invalida padrão; destino não pode ter outro cubo | BR6–7 | `habitatMatches` | C01–C32 | Validado |
| R11 | Remover cubo inferior primeiro; pontuar último valor descoberto; carta completa libera limite | BR6,9 | `HeldCard.placed`, `animalScore`, limite de ativas | R08, C01–C32 | Validado |
| R12 | Cubo definitivo mesmo com alteração posterior de suporte; não alterar célula do próprio cubo | BR6–7 | `canStack`, `applyAction` | R03, R08 | Validado |
| R13 | Reposição de três peças e até cinco cartas só no fim do turno | BR4 | `applyAction(endTurn)` | R06, R16 | Validado |
| R14 | Fim quando bolsa já vazia na tentativa de reposição; ou no fim do turno com≤2 células vazias; completar rodada | BR7, ajuda final | `applyAction(endTurn)` | R15–R17, R19 | Validado |
| R15 | Árvores1/3/7; marrom sem verde0 | BR8, tabela visual | `landscapeScore` | R09 | Validado visualmente |
| R16 | Montanhas1/3/7, só com outra montanha adjacente | BR8, tabela visual | `landscapeScore` | R10 | Validado visualmente |
| R17 | Campo grupo conectado≥2 vale5 por grupo | BR8 | `groups`, `landscapeScore` | R11 | Validado |
| R18 | Construção de altura2 vale5 se tem≥3 cores superiores adjacentes; vermelho conta como cor | BR9 | `landscapeScore` | R12 | Validado |
| R19 | Rio melhor comprimento de caminho mínimo entre extremidades; pontos0/2/5/8/11/15 e+4 após6; ciclo usa opostos | BR8, tabela; FAQ Rivers/Circular Rivers | `riverLength`, `landscapeScore` | R13 | Validado visualmente e FAQ |
| R20 | LadoB: componentes de espaços não azuis são ilhas; espaços vazios participam;5 por ilha | BR8, diagrama quatro ilhas | `groups`, `landscapeScore` | R14 | Validado visualmente |
| R21 | Carta incompleta também pontua, só espaço descoberto mais alto; intacta0 | BR9 | `animalScore` | C01–C32, R18 | Validado |
| R22 | Mais pontos, depois mais cubos posicionados, depois empate compartilhado | BR7 | `scores`, `winners` | R18 | Validado |
| R23 | Reserva física66 não é teto de jogadas; substitutos quando acaba | BR2; FAQ Number of Animal Cubes | contadores por carta, sem teto artificial | R01; inspeção implementação | Validado, não exige reposição virtual finita |
| C01–C32 | Requisitos de cores, alturas, geometria, pontos e destino de cada carta | CARTAS, posição individual | `animals.ts` | C01–C32, R04 | 32 inspeções visuais; seis cruzamentos Libellud |
| T01 | Estado autoritativo, privado por dois participantes, terceiro rejeitado | Requisito técnico do pedido | `Store`, HTTP | M01, M04 | Executado localmente |
| T02 | Revisão e ID de ação; sem duplicação; commit atômico do estado e recibo | Requisito técnico | `Store.act` | M01, M02 | Executado localmente |
| T03 | Sessão e partida após reinício; SSE após reconexão | Requisito técnico | SQLite, HTTP events, efeito cliente | M01; U01/U02 | Executado localmente |
| T04 | Validação payload/origem e nome; sem pontuação do cliente | Requisito técnico | HTTP, `safeName`, motor | M03 | Executado localmente |
| T05 | Acesso em dois dispositivos e redes reais, HTTPS público | Requisito de aceite | Render, configuração entregue | P01–P08 | **Pendente de publicação externa** |

## Detalhes da modelagem

- Célula identificada por `q,r` axial. Coluna `q` vai0..4; a coordenada vertical é `r=row-floor(q/2)`. A altura é `stack.length`; o último elemento é o topo. `animal` contém o ID da carta que colocou o cubo.
- Rotação60°: `(q,r) → (-r,q+r)` repetida0..5 vezes. Sem transformação de reflexão. O cubo é normalizado na origem nos32 padrões, mas a função aceita offset explícito.
- Construções nos padrões exigem topo vermelho de altura2. O estado produzido pelo motor só permite as três bases válidas.
- Cubos em outras células do padrão são permitidos. Um cubo bloqueia apenas colocação de outro cubo e novas peças na própria célula. Não se revalida ou remove cubo já colocado quando um suporte muda.
- Pontos das cartas estão em ordem de descoberta: inferior para superior. `points[placed-1]`; não somar todos os valores já descobertos.
- Rio usa busca em largura a partir de cada célula azul e toma a maior distância mínima, contando extremidades. É o diâmetro de cada componente azul, não o caminho simples máximo nem o total do componente. Ciclos e atalhos recebem regressões específicas.
- Ilhas usam o complemento da água dentro das23 células; não dependem de preencher o restante do tabuleiro com peças.
- A bolsa tem105 peças após a preparação. Uma reposição retira3. Chegar a zero depois de retirar o último trio não dispara fim imediatamente; a próxima reposição encontra a bolsa vazia. O encerramento completa a rodada relativa ao primeiro jogador escolhido.
- Cartas não são repostas entre ações. Se não houver carta disponível no monte, não é criado descarte/embaralhamento alternativo. Em partida legal de dois jogadores o tabuleiro limita o número de cartas completáveis antes do encerramento.

## Pendências normativas

Nenhuma regra foi preenchida por memória. Os32 nomes oficiais não foram verificáveis textualmente; por isso30 campos `officialName` são nulos. Isso não afeta os padrões. A proveniência das26 cartas vistas só na adaptação licenciada, sem uma folha completa publicada diretamente pela Libellud, permanece explicitamente registrada. Uma conferência futura com o baralho físico pode ser útil para auditoria editorial; não foi alegada certificação da editora.
