# Modo solo

Disponível em **Criar sala → Número de jogadores → 1 jogador · Solo**. A partida inicia imediatamente, com seu nome, avatar, lado A/B e opção Pulsar.

Implementação do solo do jogo-base **sem Espíritos da Natureza**. Não há adversário controlado por computador. As partidas para 2, 3 e 4 jogadores permanecem disponíveis.

## Regras específicas

- Três conjuntos de três peças e três cartas de animais disponíveis.
- Escolha um conjunto, coloque suas três peças e use as ações opcionais habituais.
- Ao encerrar, os conjuntos não escolhidos são descartados e os três espaços são repostos a partir da bolsa. As peças descartadas não voltam para a bolsa.
- Se você não pegou uma carta neste turno, pode marcar uma das cartas disponíveis para **Trocar ao encerrar**. A escolha pode ser cancelada antes de encerrar; a troca e a revelação da substituta só ocorrem ao confirmar o fim do turno. Não pode trocar se o baralho está vazio.
- Mesmo fim por ocupação (dois ou menos espaços vazios) ou bolsa vazia ao tentar a reposição. Quando restam só 3 ou 6 peças, a reposição deixa um ou dois conjuntos disponíveis; joga-se a última oferta, e o próximo fim de turno encontra a bolsa vazia. Essa aplicação do gatilho de reposição segue o comportamento do modo multijogador e permite até 14 turnos se a ocupação não encerrar antes.
- Reiniciar turno restaura o próprio turno; após encerrá-lo não há retorno.

## Pontuação em sóis

| Pontos | 40 | 70 | 90 | 110 | 130 | 140 | 150 | 160 |
|---|---|---|---|---|---|---|---|---|
| Sóis | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |

Abaixo de 40 pontos, zero sóis por pontuação. O lado A soma 1 sol; o B não acrescenta. Jogar sem Espírito da Natureza acrescenta 2 sóis. Esses bônus são separados no resultado. Não há vencedor por comparação com outro jogador. Encerramento antecipado pelo host mostra resultado parcial, sem avaliação em sóis.

## Fontes e validação

Manual brasileiro, página impressa 11, texto e tabela inspecionados no PDF e visualmente na renderização local. A página de Espíritos explica a variante separada do solo.

- [Manual BR da Libellud](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/08/LIBELLUD_HARMONIES_RULES_BR_compressed.pdf).
- [Manual EN da Libellud](https://cdn.svc.asmodee.net/production-libelludv2/uploads/2026/07/HARMONIES_Rules_EN_compressed-1.pdf), Solo Mode.

Testes S01–S08 cobrem preparação, descarte de seis peças, troca de carta no fim, última oferta parcial, fim, sóis, reiniciar turno, revanche e API. A criação e a partida completa também foram exercitadas pelo navegador em uma sala de teste.
