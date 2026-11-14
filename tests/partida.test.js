const { Tabuleiro, BatalhaNaval } = require('../src/BatalhaNaval');
const {
  FROTA_A,
  FROTA_B,
  posicionarFrota,
  casasDaFrota,
  casasDeAgua,
} = require('./helpers/frotas');

// Jogador 1 usa a FROTA_A e jogador 2 usa a FROTA_B.
// Frota B: porta-aviões (9,0)-(9,4) | encouraçado (0,9)-(3,9) | submarino (4,4)-(6,4) | destroier (0,0)-(0,1)

function iniciarPartida() {
  const partida = new BatalhaNaval();
  posicionarFrota(partida.obterTabuleiro(1), FROTA_A);
  posicionarFrota(partida.obterTabuleiro(2), FROTA_B);
  return partida;
}

describe('Preparação da partida', () => {
  test('CT34 - a partida deve começar na fase de posicionamento, com a vez do jogador 1 e sem vencedor', () => {
    const partida = new BatalhaNaval();

    expect(partida.obterEstado()).toBe('posicionando');
    expect(partida.jogadorDaVez()).toBe(1);
    expect(partida.vencedor()).toBeNull();
  });

  test('CT35 - cada jogador deve ter o seu próprio tabuleiro', () => {
    const partida = new BatalhaNaval();
    const tabuleiro1 = partida.obterTabuleiro(1);
    const tabuleiro2 = partida.obterTabuleiro(2);

    expect(tabuleiro1).toBeInstanceOf(Tabuleiro);
    expect(tabuleiro2).toBeInstanceOf(Tabuleiro);
    expect(tabuleiro1).not.toBe(tabuleiro2);
    expect(partida.obterTabuleiro(1)).toBe(tabuleiro1);

    [0, 3, '1', undefined].forEach((jogador) => {
      expect(() => partida.obterTabuleiro(jogador)).toThrow();
    });
  });

  test('CT36 - atirar antes de os dois jogadores posicionarem a frota deve lançar erro', () => {
    const partida = new BatalhaNaval();

    expect(() => partida.atirar(5, 5)).toThrow();
  });

  test('CT37 - com só um jogador com a frota completa, a partida deve continuar no posicionamento', () => {
    const partida = new BatalhaNaval();
    posicionarFrota(partida.obterTabuleiro(1), FROTA_A);
    posicionarFrota(partida.obterTabuleiro(2), FROTA_B.slice(0, 3));

    expect(partida.obterEstado()).toBe('posicionando');
    expect(() => partida.atirar(5, 5)).toThrow();
  });

  test('CT38 - com as duas frotas completas, a partida deve passar para a fase de tiros', () => {
    const partida = iniciarPartida();

    expect(partida.obterEstado()).toBe('jogando');
    expect(partida.jogadorDaVez()).toBe(1);
  });
});

describe('Turnos de tiro', () => {
  let partida;

  beforeEach(() => {
    partida = iniciarPartida();
  });

  test('CT39 - o jogador 1 deve atirar no tabuleiro do jogador 2', () => {
    expect(partida.atirar(4, 4)).toBe('acerto');

    expect(partida.obterTabuleiro(2).foiAtingida(4, 4)).toBe(true);
    expect(partida.obterTabuleiro(1).foiAtingida(4, 4)).toBe(false);
  });

  test('CT40 - a vez deve passar para o outro jogador depois de cada tiro, mesmo quando acerta', () => {
    partida.atirar(4, 4); // jogador 1 acerta
    expect(partida.jogadorDaVez()).toBe(2);

    partida.atirar(5, 5); // jogador 2 erra
    expect(partida.jogadorDaVez()).toBe(1);

    partida.atirar(5, 5); // jogador 1 erra
    expect(partida.jogadorDaVez()).toBe(2);
  });

  test('CT41 - o jogador 2 deve atirar no tabuleiro do jogador 1', () => {
    partida.atirar(8, 8); // jogador 1

    expect(partida.atirar(2, 0)).toBe('acerto'); // jogador 2 acerta o encouraçado do jogador 1
    expect(partida.obterTabuleiro(1).foiAtingida(2, 0)).toBe(true);
    expect(partida.obterTabuleiro(2).foiAtingida(2, 0)).toBe(false);
  });

  test('CT42 - tiro repetido deve lançar erro e a vez não deve mudar', () => {
    partida.atirar(5, 5); // jogador 1
    partida.atirar(5, 5); // jogador 2

    expect(() => partida.atirar(5, 5)).toThrow(); // jogador 1 repete
    expect(partida.jogadorDaVez()).toBe(1);
  });

  test('CT43 - os dois jogadores podem atirar na mesma coordenada, porque os tabuleiros são diferentes', () => {
    expect(partida.atirar(0, 0)).toBe('acerto'); // jogador 1 acerta o destroier do jogador 2
    expect(partida.atirar(0, 0)).toBe('acerto'); // jogador 2 acerta o porta-aviões do jogador 1
  });

  test('CT44 - afundar um navio pelo atirar deve retornar "afundou" e reduzir os navios do adversário', () => {
    partida.atirar(0, 0); // jogador 1
    partida.atirar(5, 5); // jogador 2

    expect(partida.atirar(0, 1)).toBe('afundou'); // jogador 1 afunda o destroier do jogador 2
    expect(partida.obterTabuleiro(2).naviosRestantes()).toBe(3);
    expect(partida.obterTabuleiro(1).naviosRestantes()).toBe(4);
  });

  test('CT45 - coordenada inválida deve lançar erro e a vez não deve mudar', () => {
    expect(() => partida.atirar(10, 0)).toThrow();
    expect(() => partida.atirar(0, -1)).toThrow();

    expect(partida.jogadorDaVez()).toBe(1);
  });
});

describe('Fim da partida', () => {
  test('CT46 - o jogador 1 deve vencer ao afundar todos os navios do jogador 2', () => {
    const partida = iniciarPartida();
    const alvos = casasDaFrota(FROTA_B);
    const errosDoJogador2 = casasDeAgua(FROTA_A);

    alvos.forEach(([l, c], i) => {
      partida.atirar(l, c); // jogador 1
      if (i < alvos.length - 1) {
        expect(partida.vencedor()).toBeNull();
        partida.atirar(...errosDoJogador2[i]); // jogador 2
      }
    });

    expect(partida.obterEstado()).toBe('encerrado');
    expect(partida.vencedor()).toBe(1);
    expect(partida.obterTabuleiro(2).todosAfundados()).toBe(true);
  });

  test('CT47 - o jogador 2 deve vencer ao afundar todos os navios do jogador 1', () => {
    const partida = iniciarPartida();
    const alvos = casasDaFrota(FROTA_A);
    const errosDoJogador1 = casasDeAgua(FROTA_B);

    alvos.forEach(([l, c], i) => {
      partida.atirar(...errosDoJogador1[i]); // jogador 1
      partida.atirar(l, c); // jogador 2
    });

    expect(partida.obterEstado()).toBe('encerrado');
    expect(partida.vencedor()).toBe(2);
  });

  test('CT48 - depois do fim da partida, atirar deve lançar erro', () => {
    const partida = iniciarPartida();
    const alvos = casasDaFrota(FROTA_B);
    const errosDoJogador2 = casasDeAgua(FROTA_A);

    alvos.forEach(([l, c], i) => {
      partida.atirar(l, c);
      if (i < alvos.length - 1) partida.atirar(...errosDoJogador2[i]);
    });

    expect(() => partida.atirar(...errosDoJogador2[20])).toThrow();
    expect(partida.vencedor()).toBe(1);
  });
});
