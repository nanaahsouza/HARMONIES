# Auditoria visual do catálogo de animais

Pesquisa: 26/10/2026. Na pesquisa original não foram copiados código de implementação ou arquivos de arte para o produto. Em atualização visual posterior, solicitada pelo usuário, o frontend passou a usar a imagem de cartas fornecida por ele em public/assets/animal-cards.webp; a proveniência do catálogo de regras descrita aqui permanece a mesma.

## Fontes

- Manual BR oficial: https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/08/LIBELLUD_HARMONIES_RULES_BR_compressed.pdf
- Pacote de imprensa oficial: https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/07/PRESSKIT_HARMONIES_EN-LITE.zip
- Sprite visual da adaptação licenciada Board Game Arena, linkada pela página oficial Libellud: https://x.boardgamearena.net/data/themereleases/current/games/harmonies/261023-0826/img/animalCards.jpg
- Página oficial que encaminha à adaptação: https://www.libellud.com/game/harmonies/
- Página BGA com crédito explícito à autorização Libellud: https://boardgamearena.com/gamepanel?game=harmonies

O sprite contém 10 colunas e 6 linhas. O jogo-base é composto das primeiras 32 cartas. As posteriores não foram incluídas. O pacote de imprensa tem somente 5 animais e 1 Espírito (leão, excluído).

## Método

As 32 primeiras cartas foram recortadas somente em work/card-research para inspeção, sem redistribuição. Foram lidos visualmente: cor, altura, posição relativa de cada paisagem, célula do cubo e todos os valores dos espaços de cubos. Os dados foram transcritos em work/catalog-verified.json no formato do motor. Os IDs indicam a posição de leitura do sprite, não identificadores oficiais.

Todas as coordenadas foram normalizadas para o cubo em (0,0), com seis rotações e sem espelhamento. Os nomes são descritivos da ilustração: officialName=null salvo Raposa Feneco e Musaranho, que têm nomes escritos no manual BR. Os nomes descritivos não são apresentados como nomenclatura oficial.

## Cruzamento com fontes diretas Libellud

| Posição BGA | Carta | Fonte direta comparada | Resultado |
|---|---|---|---|
| 6 | Pato | Presskit FRONT_6.png | Padrão, alturas, cubo e pontos 2/4/8/13 coincidem |
| 9 | Musaranho | Manual BR p.7 | Padrão, alturas, cubo e pontos 5/10/17 coincidem |
| 11 | Esquilo | Presskit FRONT_7.png | Padrão, alturas, cubo e pontos 4/9/15 coincidem |
| 16 | Papagaio | Presskit FRONT_2.png | Padrão, alturas, cubo e pontos 4/9/14 coincidem |
| 23 | Raposa Feneco | Presskit FRONT_3.png; manual BR pp.5–7 | Padrão, alturas, cubo e pontos 4/9/16 coincidem |
| 27 | Corvo | Presskit FRONT_4.png | Padrão, alturas, cubo e pontos 4/9 coincidem |

As outras 26 cartas foram inspecionadas visualmente no sprite da adaptação licenciada; não estão todas ilustradas no manual ou no presskit consultado. Isso deve permanecer explícito na documentação de proveniência, sem alegar confirmação individual em material publicado diretamente pela Libellud.

## Geometrias que merecem regressão

- Triângulo: 3 células mutuamente adjacentes (2,7,12,14,16,19,24).
- V aberto: centro adjacente às duas extremidades; extremidades NÃO adjacentes entre si (9,10,20,21,27,29). Ângulo de 120 graus no tabuleiro hexagonal.
- Leque de 4 células: centro/cubo e três vizinhos consecutivos; o vizinho intermediário é adjacente aos outros dois (13,30).
- Linha de 3 células: cubo numa ponta, outra cor na ponta contrária (1,4,8,15,23,28,32).
- Duas células adjacentes: demais cartas.

O catálogo contém 96 espaços de cubos no total, distribuídos por 32 cartas. Isso NÃO altera a reserva física: os 66 cubos oficiais são compartilhados e a FAQ Libellud permite substitutos caso acabem. Cubos não devem ser limitados artificialmente pelo motor.

## Limites

Esta etapa foi uma revisão visual pelo agente. Não é comparação automatizada de pixels e não prova o motor. Testes de regras, rotação, altura, ocupação e bordas continuam necessários no projeto. Não usar os resumos textuais BGA como normativa: há divergências de redação; prevalecem manual e FAQ oficiais.
