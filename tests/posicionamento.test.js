const { Tabuleiro } = require('../src/BatalhaNaval');
const {
  TAMANHO,
  TAMANHOS,
  FROTA_A,
  posicionarFrota,
  casasDoNavio,
  mapaDeNavios,
} = require('./helpers/frotas');

describe('Criação do tabuleiro', () => {
  test('CT01 - o tabuleiro deve ter 10 x 10 e começar sem nenhum tiro', () => {
    const tabuleiro = new Tabuleiro();
    const visao = tabuleiro.visaoDoAdversario();

    expect(tabuleiro.tamanho).toBe(10);
    expect(visao).toHaveLength(10);
    visao.forEach((linha) => {
      expect(linha).toHaveLength(10);
      linha.forEach((casa) => expect(casa).toBe('~'));
    });
  });

  test('CT02 - a frota deve ter 4 navios: porta-aviões (5), encouraçado (4), submarino (3) e destroier (2)', () => {
    expect(Tabuleiro.NAVIOS).toEqual({
      'porta-avioes': 5,
      encouracado: 4,
      submarino: 3,
      destroier: 2,
    });
  });

  test('CT03 - o tabuleiro deve começar sem navios', () => {
    const tabuleiro = new Tabuleiro();

    mapaDeNavios(tabuleiro).forEach((linha) => {
      linha.forEach((casa) => expect(casa).toBeNull());
    });
    expect(tabuleiro.todosPosicionados()).toBe(false);
  });
});

describe('Posicionamento manual', () => {
  let tabuleiro;

  beforeEach(() => {
    tabuleiro = new Tabuleiro();
  });

  test('CT04 - navio na horizontal deve ocupar as casas à direita da posição inicial', () => {
    tabuleiro.posicionar('porta-avioes', 0, 0, 'horizontal');

    for (let c = 0; c <= 4; c++) expect(tabuleiro.navioEm(0, c)).toBe('porta-avioes');
    expect(tabuleiro.navioEm(0, 5)).toBeNull();
    expect(tabuleiro.navioEm(1, 0)).toBeNull();
  });

  test('CT05 - navio na vertical deve ocupar as casas abaixo da posição inicial', () => {
    tabuleiro.posicionar('encouracado', 2, 0, 'vertical');

    for (let l = 2; l <= 5; l++) expect(tabuleiro.navioEm(l, 0)).toBe('encouracado');
    expect(tabuleiro.navioEm(1, 0)).toBeNull();
    expect(tabuleiro.navioEm(6, 0)).toBeNull();
    expect(tabuleiro.navioEm(2, 1)).toBeNull();
  });

  test('CT06 - com os 4 navios posicionados, a frota deve estar completa e ocupar 14 casas', () => {
    posicionarFrota(tabuleiro, FROTA_A.slice(0, 3));
    expect(tabuleiro.todosPosicionados()).toBe(false);

    posicionarFrota(tabuleiro, FROTA_A.slice(3));
    expect(tabuleiro.todosPosicionados()).toBe(true);

    const ocupadas = mapaDeNavios(tabuleiro).flat().filter((casa) => casa !== null);
    expect(ocupadas).toHaveLength(14);
  });

  test('CT07 - navio encostado na borda do tabuleiro deve ser aceito', () => {
    expect(() => tabuleiro.posicionar('porta-avioes', 0, 5, 'horizontal')).not.toThrow();
    expect(() => tabuleiro.posicionar('submarino', 7, 9, 'vertical')).not.toThrow();

    expect(tabuleiro.navioEm(0, 9)).toBe('porta-avioes');
    expect(tabuleiro.navioEm(9, 9)).toBe('submarino');
  });

  test.each([
    ['porta-avioes', 0, 6, 'horizontal'],
    ['encouracado', 7, 3, 'vertical'],
    ['submarino', 8, 0, 'vertical'],
    ['destroier', 5, 9, 'horizontal'],
  ])('CT08 - deve lançar erro se o navio sair do tabuleiro: %s em (%i, %i) na %s', (navio, l, c, orientacao) => {
    expect(() => tabuleiro.posicionar(navio, l, c, orientacao)).toThrow();
    expect(mapaDeNavios(tabuleiro).flat().every((casa) => casa === null)).toBe(true);
  });

  test('CT09 - deve lançar erro se o navio ficar por cima de outro navio', () => {
    tabuleiro.posicionar('porta-avioes', 0, 0, 'horizontal');

    expect(() => tabuleiro.posicionar('submarino', 0, 2, 'vertical')).toThrow();
  });

  test('CT10 - navios encostados lado a lado devem ser permitidos', () => {
    tabuleiro.posicionar('porta-avioes', 0, 0, 'horizontal');

    expect(() => tabuleiro.posicionar('encouracado', 1, 0, 'horizontal')).not.toThrow();
    expect(() => tabuleiro.posicionar('destroier', 0, 5, 'horizontal')).not.toThrow();
  });

  test('CT11 - deve lançar erro ao posicionar o mesmo navio duas vezes', () => {
    tabuleiro.posicionar('submarino', 4, 4, 'vertical');

    expect(() => tabuleiro.posicionar('submarino', 0, 0, 'horizontal')).toThrow();
    expect(tabuleiro.navioEm(0, 0)).toBeNull();
  });

  test.each([['cruzador'], [''], [undefined], ['navio']])(
    'CT12 - deve lançar erro para navio desconhecido: %p',
    (nome) => {
      expect(() => tabuleiro.posicionar(nome, 0, 0, 'horizontal')).toThrow();
    }
  );

  test.each([['diagonal'], ['h'], [undefined]])(
    'CT13 - deve lançar erro para orientação inválida: %p',
    (orientacao) => {
      expect(() => tabuleiro.posicionar('destroier', 0, 0, orientacao)).toThrow();
    }
  );

  test('CT14 - "hidroaviao" deve ser aceito como outro nome do destroier', () => {
    tabuleiro.posicionar('hidroaviao', 7, 5, 'vertical');

    expect(tabuleiro.navioEm(7, 5)).toBe('destroier');
    expect(tabuleiro.navioEm(8, 5)).toBe('destroier');
    expect(() => tabuleiro.posicionar('destroier', 0, 0, 'horizontal')).toThrow();

    const outro = new Tabuleiro();
    outro.posicionar('destroier', 0, 0, 'horizontal');
    expect(() => outro.posicionar('hidroaviao', 5, 5, 'horizontal')).toThrow();
    expect(outro.navioEm(5, 5)).toBeNull();
  });

  test('CT15 - um posicionamento com erro não deve deixar nenhuma parte do navio no tabuleiro', () => {
    tabuleiro.posicionar('porta-avioes', 0, 0, 'horizontal');

    expect(() => tabuleiro.posicionar('encouracado', 0, 4, 'vertical')).toThrow();
    for (let l = 1; l <= 3; l++) expect(tabuleiro.navioEm(l, 4)).toBeNull();

    expect(() => tabuleiro.posicionar('encouracado', 5, 5, 'vertical')).not.toThrow();
  });

  test('CT16 - posicionar e navioEm devem lançar erro para coordenadas inválidas', () => {
    [[-1, 0], [0, -1], [10, 0], [0, 10], [1.5, 0], ['1', 0], [undefined, undefined]].forEach(([l, c]) => {
      expect(() => tabuleiro.posicionar('destroier', l, c, 'horizontal')).toThrow();
      expect(() => tabuleiro.navioEm(l, c)).toThrow();
    });
  });
});

describe('Posicionamento aleatório', () => {
  test('CT17 - deve posicionar os 4 navios ocupando 14 casas', () => {
    const tabuleiro = new Tabuleiro();

    tabuleiro.posicionarAleatoriamente();

    expect(tabuleiro.todosPosicionados()).toBe(true);
    expect(mapaDeNavios(tabuleiro).flat().filter((casa) => casa !== null)).toHaveLength(14);
  });

  test('CT18 - cada navio deve ficar em linha reta, em casas seguidas e com o tamanho certo', () => {
    for (let rodada = 0; rodada < 20; rodada++) {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarAleatoriamente();
      const mapa = mapaDeNavios(tabuleiro);

      Object.entries(TAMANHOS).forEach(([navio, tamanho]) => {
        const casas = [];
        for (let l = 0; l < TAMANHO; l++) {
          for (let c = 0; c < TAMANHO; c++) if (mapa[l][c] === navio) casas.push([l, c]);
        }
        expect(casas).toHaveLength(tamanho);

        const [l0, c0] = casas[0];
        const horizontal = casas.every(([l, c], i) => l === l0 && c === c0 + i);
        const vertical = casas.every(([l, c], i) => c === c0 && l === l0 + i);
        expect(horizontal || vertical).toBe(true);
      });
    }
  });

  test('CT19 - tabuleiros diferentes devem receber posições diferentes', () => {
    const disposicoes = new Set();

    for (let i = 0; i < 5; i++) {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarAleatoriamente();
      disposicoes.add(JSON.stringify(mapaDeNavios(tabuleiro)));
    }

    expect(disposicoes.size).toBeGreaterThan(1);
  });

  test('CT20 - deve completar a frota sem mover os navios que já estavam posicionados', () => {
    const tabuleiro = new Tabuleiro();
    tabuleiro.posicionar('porta-avioes', 0, 0, 'horizontal');

    tabuleiro.posicionarAleatoriamente();

    expect(tabuleiro.todosPosicionados()).toBe(true);
    casasDoNavio(FROTA_A[0]).forEach(([l, c]) => {
      expect(tabuleiro.navioEm(l, c)).toBe('porta-avioes');
    });
  });
});
