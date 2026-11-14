// Frotas prontas e funções auxiliares usadas pelos casos de teste.

const TAMANHO = 10;

const TAMANHOS = {
  'porta-avioes': 5,
  encouracado: 4,
  submarino: 3,
  destroier: 2,
};

// Frota usada pelo jogador 1 nos testes da partida.
const FROTA_A = [
  { navio: 'porta-avioes', linha: 0, coluna: 0, orientacao: 'horizontal' }, // (0,0) a (0,4)
  { navio: 'encouracado', linha: 2, coluna: 0, orientacao: 'vertical' }, //    (2,0) a (5,0)
  { navio: 'submarino', linha: 9, coluna: 7, orientacao: 'horizontal' }, //    (9,7) a (9,9)
  { navio: 'destroier', linha: 7, coluna: 5, orientacao: 'vertical' }, //      (7,5) a (8,5)
];

// Frota usada pelo jogador 2 nos testes da partida.
const FROTA_B = [
  { navio: 'porta-avioes', linha: 9, coluna: 0, orientacao: 'horizontal' }, // (9,0) a (9,4)
  { navio: 'encouracado', linha: 0, coluna: 9, orientacao: 'vertical' }, //    (0,9) a (3,9)
  { navio: 'submarino', linha: 4, coluna: 4, orientacao: 'vertical' }, //      (4,4) a (6,4)
  { navio: 'destroier', linha: 0, coluna: 0, orientacao: 'horizontal' }, //    (0,0) a (0,1)
];

/** Posiciona todos os navios de uma frota no tabuleiro. */
function posicionarFrota(tabuleiro, frota) {
  frota.forEach(({ navio, linha, coluna, orientacao }) => {
    tabuleiro.posicionar(navio, linha, coluna, orientacao);
  });
}

/** Lista as casas [linha, coluna] ocupadas por um navio da frota. */
function casasDoNavio({ navio, linha, coluna, orientacao }) {
  const casas = [];
  for (let i = 0; i < TAMANHOS[navio]; i++) {
    casas.push(orientacao === 'horizontal' ? [linha, coluna + i] : [linha + i, coluna]);
  }
  return casas;
}

/** Lista todas as 14 casas ocupadas pelos navios de uma frota. */
function casasDaFrota(frota) {
  return frota.flatMap(casasDoNavio);
}

/** Lista as 86 casas de água (sem navio) de uma frota. */
function casasDeAgua(frota) {
  const ocupadas = new Set(casasDaFrota(frota).map(([l, c]) => `${l},${c}`));
  const agua = [];
  for (let l = 0; l < TAMANHO; l++) {
    for (let c = 0; c < TAMANHO; c++) {
      if (!ocupadas.has(`${l},${c}`)) agua.push([l, c]);
    }
  }
  return agua;
}

/** Monta uma matriz 10 x 10 com o nome do navio de cada casa (ou null). */
function mapaDeNavios(tabuleiro) {
  const mapa = [];
  for (let l = 0; l < TAMANHO; l++) {
    const linha = [];
    for (let c = 0; c < TAMANHO; c++) linha.push(tabuleiro.navioEm(l, c));
    mapa.push(linha);
  }
  return mapa;
}

module.exports = {
  TAMANHO,
  TAMANHOS,
  FROTA_A,
  FROTA_B,
  posicionarFrota,
  casasDoNavio,
  casasDaFrota,
  casasDeAgua,
  mapaDeNavios,
};
