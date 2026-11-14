const { Tabuleiro } = require('../src/BatalhaNaval');
const { FROTA_A, posicionarFrota, casasDaFrota } = require('./helpers/frotas');

// Frota A: porta-aviões (0,0)-(0,4) | encouraçado (2,0)-(5,0) | submarino (9,7)-(9,9) | destroier (7,5)-(8,5)

describe('Tiros no tabuleiro', () => {
  let tabuleiro;

  beforeEach(() => {
    tabuleiro = new Tabuleiro();
    posicionarFrota(tabuleiro, FROTA_A);
  });

  test('CT21 - receber tiro antes de todos os navios estarem posicionados deve lançar erro', () => {
    const incompleto = new Tabuleiro();
    posicionarFrota(incompleto, FROTA_A.slice(0, 3));

    expect(() => incompleto.receberTiro(5, 5)).toThrow();
  });

  test('CT22 - tiro em casa sem navio deve retornar "agua"', () => {
    expect(tabuleiro.receberTiro(5, 5)).toBe('agua');

    expect(tabuleiro.foiAtingida(5, 5)).toBe(true);
    expect(tabuleiro.foiAtingida(6, 6)).toBe(false);
    expect(tabuleiro.visaoDoAdversario()[5][5]).toBe('O');
  });

  test('CT23 - tiro em parte de um navio deve retornar "acerto"', () => {
    expect(tabuleiro.receberTiro(0, 0)).toBe('acerto');

    expect(tabuleiro.foiAtingida(0, 0)).toBe(true);
    expect(tabuleiro.visaoDoAdversario()[0][0]).toBe('X');
  });

  test('CT24 - o tiro que atinge a última parte de um navio deve retornar "afundou"', () => {
    expect(tabuleiro.receberTiro(9, 7)).toBe('acerto');
    expect(tabuleiro.receberTiro(9, 8)).toBe('acerto');
    expect(tabuleiro.receberTiro(9, 9)).toBe('afundou');

    expect(tabuleiro.navioAfundado('submarino')).toBe(true);
    expect(tabuleiro.naviosRestantes()).toBe(3);
  });

  test('CT25 - o navio só deve afundar quando todas as suas casas forem atingidas', () => {
    for (let c = 0; c <= 3; c++) {
      expect(tabuleiro.receberTiro(0, c)).toBe('acerto');
    }
    expect(tabuleiro.navioAfundado('porta-avioes')).toBe(false);
    expect(tabuleiro.naviosRestantes()).toBe(4);

    expect(tabuleiro.receberTiro(0, 4)).toBe('afundou');
    expect(tabuleiro.navioAfundado('porta-avioes')).toBe(true);
  });

  test('CT26 - a ordem dos tiros não deve importar para afundar o navio', () => {
    expect(tabuleiro.receberTiro(8, 5)).toBe('acerto');
    expect(tabuleiro.receberTiro(7, 5)).toBe('afundou');

    expect(tabuleiro.navioAfundado('destroier')).toBe(true);
  });

  test('CT27 - tiro repetido na mesma casa deve lançar erro e não alterar nada', () => {
    tabuleiro.receberTiro(5, 5);
    tabuleiro.receberTiro(0, 0);
    const antes = tabuleiro.visaoDoAdversario();

    expect(() => tabuleiro.receberTiro(5, 5)).toThrow();
    expect(() => tabuleiro.receberTiro(0, 0)).toThrow();

    expect(tabuleiro.visaoDoAdversario()).toEqual(antes);
    expect(tabuleiro.naviosRestantes()).toBe(4);
  });

  test('CT28 - atingir todas as casas da frota deve afundar todos os navios', () => {
    casasDaFrota(FROTA_A).forEach(([l, c]) => tabuleiro.receberTiro(l, c));

    expect(tabuleiro.todosAfundados()).toBe(true);
    expect(tabuleiro.naviosRestantes()).toBe(0);
    ['porta-avioes', 'encouracado', 'submarino', 'destroier'].forEach((navio) => {
      expect(tabuleiro.navioAfundado(navio)).toBe(true);
    });
  });

  test('CT29 - enquanto faltar uma casa de navio, a frota não deve estar toda afundada', () => {
    const casas = casasDaFrota(FROTA_A);
    casas.slice(0, -1).forEach(([l, c]) => tabuleiro.receberTiro(l, c));

    expect(tabuleiro.todosAfundados()).toBe(false);
    expect(tabuleiro.naviosRestantes()).toBe(1);
  });

  test('CT30 - a visão do adversário não deve revelar navios que ainda não foram atingidos', () => {
    tabuleiro.visaoDoAdversario().forEach((linha) => {
      linha.forEach((casa) => expect(casa).toBe('~'));
    });

    tabuleiro.receberTiro(0, 0);
    const visao = tabuleiro.visaoDoAdversario();

    expect(visao[0][0]).toBe('X');
    expect(visao[0][1]).toBe('~');
    expect(visao[2][0]).toBe('~');
  });

  test('CT31 - alterar a matriz retornada por visaoDoAdversario não deve alterar o tabuleiro', () => {
    const visao = tabuleiro.visaoDoAdversario();
    visao[5][5] = 'O';

    expect(tabuleiro.visaoDoAdversario()[5][5]).toBe('~');
    expect(tabuleiro.foiAtingida(5, 5)).toBe(false);
  });

  test('CT32 - navioAfundado deve aceitar "hidroaviao" e lançar erro para navio desconhecido', () => {
    tabuleiro.receberTiro(7, 5);
    tabuleiro.receberTiro(8, 5);

    expect(tabuleiro.navioAfundado('hidroaviao')).toBe(true);
    expect(() => tabuleiro.navioAfundado('cruzador')).toThrow();
  });

  test('CT33 - receberTiro e foiAtingida devem lançar erro para coordenadas inválidas, sem alterar o tabuleiro', () => {
    [[-1, 0], [0, -1], [10, 0], [0, 10], [1.5, 0], ['1', 0], [undefined, undefined]].forEach(([l, c]) => {
      expect(() => tabuleiro.receberTiro(l, c)).toThrow();
      expect(() => tabuleiro.foiAtingida(l, c)).toThrow();
    });

    tabuleiro.visaoDoAdversario().forEach((linha) => {
      linha.forEach((casa) => expect(casa).toBe('~'));
    });
  });
});
