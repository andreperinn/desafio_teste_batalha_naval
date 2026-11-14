# Desafio de Teste — Batalha Naval

Casos de teste automatizados, escritos em **JavaScript** com **Jest**, para testar um jogo de **Batalha Naval** com tabuleiro de **10 x 10** também escrito em JavaScript.

Este repositório contém **somente os casos de teste**. O código do jogo não faz parte da entrega: ele deve ser implementado a partir da especificação abaixo e passar em todos os testes.

---

## 1. Especificação do desafio

### Tabuleiro e frota

| Item | Valor |
| --- | --- |
| Tabuleiro | 10 x 10 (índices de `0` a `9`) |
| Jogadores | 2, cada um com o seu tabuleiro |

| Navio | Nome usado no código | Casas |
| --- | --- | --- |
| Porta-aviões | `'porta-avioes'` | 5 |
| Encouraçado | `'encouracado'` | 4 |
| Submarino | `'submarino'` | 3 |
| Destroier ou Hidroavião | `'destroier'` (também aceita `'hidroaviao'`) | 2 |

Cada jogador tem exatamente 1 navio de cada tipo, num total de 14 casas ocupadas. As coordenadas são sempre informadas como `(linha, coluna)`, começando em `0`.

### Regras do jogo

1. **Posicionamento:** o navio é colocado a partir de uma casa inicial e de uma orientação:
   - `'horizontal'`: ocupa a casa inicial e as casas à direita dela;
   - `'vertical'`: ocupa a casa inicial e as casas abaixo dela.
2. **Restrições do posicionamento** (o posicionamento inválido lança erro e nenhuma parte do navio fica no tabuleiro):
   - o navio não pode sair do tabuleiro;
   - o navio não pode ficar por cima de outro;
   - cada navio só pode ser posicionado uma vez;
   - nome de navio desconhecido ou orientação diferente de `'horizontal'` e `'vertical'` lançam erro.

   Navios **podem** ficar encostados uns nos outros.
3. **Destroier ou Hidroavião:** os dois nomes representam o **mesmo** navio de 2 casas. Ele pode ser posicionado com `'destroier'` ou `'hidroaviao'`, mas só uma vez, e o tabuleiro sempre o identifica como `'destroier'`.
4. **Posicionamento aleatório:** completa a frota sorteando posições válidas para os navios que ainda faltam, sem mover os que já estavam posicionados.
5. **Tiros:** só podem ser dados depois de a frota estar completa. Cada tiro retorna:
   - `'agua'`, se a casa não tem navio;
   - `'acerto'`, se atingiu uma parte de navio que ainda não afundou;
   - `'afundou'`, se atingiu a última parte que faltava daquele navio.

   Atirar duas vezes na mesma casa lança erro.
6. **Visão do adversário:** mostra apenas o resultado dos tiros, sem revelar navios não atingidos: `'~'` casa ainda não atingida, `'O'` tiro na água e `'X'` tiro em navio.
7. **Partida:**
   - começa na fase `'posicionando'` e passa para `'jogando'` quando os dois jogadores completam a frota;
   - o jogador 1 começa, e a vez **sempre** passa para o outro jogador depois de cada tiro válido, acertando ou não;
   - um tiro com erro (repetido ou coordenada inválida) não passa a vez;
   - vence quem afundar todos os navios do adversário, e a partida passa para `'encerrado'`;
   - atirar fora da fase `'jogando'` lança erro.
8. **Coordenadas inválidas:** fora do tabuleiro, não inteiras ou não numéricas lançam erro em todos os métodos que recebem coordenadas.

### Interface esperada

O jogo deve ficar no arquivo `src/BatalhaNaval.js`, exportando as duas classes com `module.exports = { Tabuleiro, BatalhaNaval };`.

**Classe `Tabuleiro`** (o tabuleiro de um jogador)

| Membro | Tipo | Descrição |
| --- | --- | --- |
| `new Tabuleiro()` | construtor | Cria um tabuleiro 10 x 10 vazio. |
| `Tabuleiro.NAVIOS` | propriedade estática | `{ 'porta-avioes': 5, encouracado: 4, submarino: 3, destroier: 2 }` |
| `tamanho` | propriedade | `10` |
| `posicionar(navio, linha, coluna, orientacao)` | método | Posiciona um navio (regras 1 a 3). |
| `posicionarAleatoriamente()` | método | Completa a frota com posições sorteadas (regra 4). |
| `navioEm(linha, coluna)` | método | Nome do navio na casa (`'porta-avioes'`, `'encouracado'`, `'submarino'` ou `'destroier'`) ou `null`. |
| `todosPosicionados()` | método | `true` se os 4 navios já foram posicionados. |
| `receberTiro(linha, coluna)` | método | Registra um tiro e retorna `'agua'`, `'acerto'` ou `'afundou'` (regra 5). |
| `foiAtingida(linha, coluna)` | método | `true` se a casa já recebeu um tiro. |
| `navioAfundado(navio)` | método | `true` se todas as casas do navio foram atingidas. Aceita `'hidroaviao'`; nome desconhecido lança erro. |
| `naviosRestantes()` | método | Quantidade de navios da frota que ainda não afundaram (`4` a `0`). |
| `todosAfundados()` | método | `true` se os 4 navios afundaram. |
| `visaoDoAdversario()` | método | Retorna uma **nova** matriz 10 x 10 com `'~'`, `'O'` ou `'X'` (regra 6). |

**Classe `BatalhaNaval`** (a partida entre 2 jogadores)

| Membro | Tipo | Descrição |
| --- | --- | --- |
| `new BatalhaNaval()` | construtor | Cria a partida com um tabuleiro vazio para cada jogador. |
| `obterTabuleiro(jogador)` | método | Retorna o `Tabuleiro` do jogador `1` ou `2` (sempre o mesmo objeto). Outro valor lança erro. |
| `obterEstado()` | método | `'posicionando'`, `'jogando'` ou `'encerrado'`. |
| `jogadorDaVez()` | método | `1` ou `2`. |
| `atirar(linha, coluna)` | método | O jogador da vez atira no tabuleiro do adversário. Retorna `'agua'`, `'acerto'` ou `'afundou'`. |
| `vencedor()` | método | `1`, `2` ou `null` enquanto ninguém venceu. |

---

## 2. Funcionamento dos casos de teste

### Como executar

Requisitos: Node.js 18.14 ou superior (recomendado usar uma versão LTS: 20, 22 ou 24).

```bash
npm install
npm test
```

Enquanto `src/BatalhaNaval.js` não existir, todos os testes falham com `Cannot find module '../src/BatalhaNaval'`. Esse é o comportamento esperado: os testes só passam quando o jogo é implementado.

### Organização

```
tests/
├── helpers/frotas.js        # frotas prontas e funções auxiliares
├── posicionamento.test.js   # CT01 a CT20 - tabuleiro, frota e posicionamento dos navios
├── tiros.test.js            # CT21 a CT33 - tiros, navios afundados e visão do adversário
└── partida.test.js          # CT34 a CT48 - fases, turnos e vencedor da partida
```

### Frotas usadas nos testes

Para os testes serem previsíveis, os navios são posicionados em lugares fixos definidos em `tests/helpers/frotas.js`:

| Navio | `FROTA_A` (jogador 1) | `FROTA_B` (jogador 2) |
| --- | --- | --- |
| Porta-aviões | `(0,0)` a `(0,4)`, horizontal | `(9,0)` a `(9,4)`, horizontal |
| Encouraçado | `(2,0)` a `(5,0)`, vertical | `(0,9)` a `(3,9)`, vertical |
| Submarino | `(9,7)` a `(9,9)`, horizontal | `(4,4)` a `(6,4)`, vertical |
| Destroier | `(7,5)` a `(8,5)`, vertical | `(0,0)` a `(0,1)`, horizontal |

Funções auxiliares: `posicionarFrota` (posiciona uma frota inteira), `casasDaFrota` (as 14 casas com navio), `casasDeAgua` (as 86 casas sem navio) e `mapaDeNavios` (matriz com o resultado de `navioEm` em cada casa).

Os testes do posicionamento aleatório (CT17 a CT20) não dependem de onde os navios caem: eles verificam regras que precisam valer em qualquer sorteio.

### Casos de teste

#### Tabuleiro e posicionamento — `posicionamento.test.js`

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| CT01 | Criar um tabuleiro | `tamanho` = 10 e visão 10 x 10 só com `'~'` |
| CT02 | Consultar `Tabuleiro.NAVIOS` | Porta-aviões 5, encouraçado 4, submarino 3 e destroier 2 |
| CT03 | Criar um tabuleiro | Nenhum navio e `todosPosicionados()` = `false` |
| CT04 | Porta-aviões em `(0,0)` na horizontal | Ocupa `(0,0)` a `(0,4)` |
| CT05 | Encouraçado em `(2,0)` na vertical | Ocupa `(2,0)` a `(5,0)` |
| CT06 | Posicionar 3 e depois 4 navios | Frota completa só com os 4, ocupando 14 casas |
| CT07 | Navios encostados na borda (`(0,5)` horizontal e `(7,9)` vertical) | São aceitos |
| CT08 | Navios que passam da borda | Lança erro e o tabuleiro continua vazio |
| CT09 | Navio por cima de outro | Lança erro |
| CT10 | Navios encostados lado a lado | São aceitos |
| CT11 | Mesmo navio duas vezes | Lança erro |
| CT12 | Navio desconhecido (`'cruzador'`, `''`, `undefined`, `'navio'`) | Lança erro |
| CT13 | Orientação inválida (`'diagonal'`, `'h'`, `undefined`) | Lança erro |
| CT14 | Posicionar com `'hidroaviao'` e depois com `'destroier'` (e o contrário) | É o mesmo navio: aparece como `'destroier'` e o segundo posicionamento lança erro |
| CT15 | Posicionamento com erro | Nenhuma parte do navio fica no tabuleiro e ele pode ser posicionado em outro lugar |
| CT16 | `posicionar` e `navioEm` com coordenadas inválidas | Lança erro |
| CT17 | Posicionamento aleatório | 4 navios e 14 casas ocupadas |
| CT18 | Posicionamento aleatório (20 rodadas) | Cada navio em linha reta, em casas seguidas e com o tamanho certo |
| CT19 | Posicionamento aleatório em 5 tabuleiros | As posições não são todas iguais |
| CT20 | Posicionamento aleatório com o porta-aviões já posicionado | Completa a frota sem mover o porta-aviões |

#### Tiros — `tiros.test.js`

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| CT21 | Tiro com a frota incompleta | Lança erro |
| CT22 | Tiro na água | `'agua'`, casa atingida e visão `'O'` |
| CT23 | Tiro em navio | `'acerto'` e visão `'X'` |
| CT24 | Atingir as 3 casas do submarino | `'acerto'`, `'acerto'`, `'afundou'`; restam 3 navios |
| CT25 | Atingir 4 das 5 casas do porta-aviões | Ainda não afundou; o 5º tiro retorna `'afundou'` |
| CT26 | Atingir o destroier na ordem inversa | `'acerto'` e depois `'afundou'` |
| CT27 | Tiro repetido (na água e em navio) | Lança erro e nada muda |
| CT28 | Atingir as 14 casas da frota | Todos os navios afundados e restam 0 |
| CT29 | Atingir 13 das 14 casas | A frota ainda não está toda afundada; resta 1 navio |
| CT30 | Visão do adversário | Navios não atingidos continuam `'~'` |
| CT31 | Alterar a matriz retornada por `visaoDoAdversario()` | O tabuleiro não é alterado |
| CT32 | `navioAfundado('hidroaviao')` e navio desconhecido | Funciona como o destroier; desconhecido lança erro |
| CT33 | `receberTiro` e `foiAtingida` com coordenadas inválidas | Lança erro e o tabuleiro não muda |

#### Partida — `partida.test.js`

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| CT34 | Criar a partida | Estado `'posicionando'`, vez do jogador 1, sem vencedor |
| CT35 | Tabuleiros dos jogadores | Cada jogador tem o seu `Tabuleiro`; jogador inválido (`0`, `3`, `'1'`, `undefined`) lança erro |
| CT36 | Atirar sem as frotas posicionadas | Lança erro |
| CT37 | Só o jogador 1 com a frota completa | Continua `'posicionando'` e atirar lança erro |
| CT38 | As duas frotas completas | Estado `'jogando'`, vez do jogador 1 |
| CT39 | Jogador 1 atira | O tiro vai para o tabuleiro do jogador 2 |
| CT40 | Sequência de tiros, com acerto e com erro | A vez sempre passa para o outro jogador |
| CT41 | Jogador 2 atira | O tiro vai para o tabuleiro do jogador 1 |
| CT42 | Tiro repetido | Lança erro e a vez não muda |
| CT43 | Os dois jogadores atiram em `(0,0)` | Os dois tiros são aceitos |
| CT44 | Afundar um navio pela partida | Retorna `'afundou'` e o adversário fica com 3 navios |
| CT45 | Tiro com coordenada inválida | Lança erro e a vez não muda |
| CT46 | Jogador 1 afunda os 4 navios do jogador 2 | Estado `'encerrado'` e vencedor `1` |
| CT47 | Jogador 2 afunda os 4 navios do jogador 1 | Estado `'encerrado'` e vencedor `2` |
| CT48 | Atirar depois do fim | Lança erro |

---

## 3. Colaboradores

| Colaborador | GitHub |
| --- | --- |
| andreperinn | [@andreperinn](https://github.com/andreperinn) |
