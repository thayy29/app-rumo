import { acabou, formatar, fracaoCumprida, limparOndeParei, pausar, restanteMs, retomar, type CarimbosDoBloco } from '../timer';

const MIN = 60_000;
const novo = (iniciadoEm: number): CarimbosDoBloco => ({
  iniciadoEm,
  duracaoMs: 25 * MIN,
  pausadoTotalMs: 0,
  pausadoEm: null,
});

describe('timer por carimbos', () => {
  it('calcula o restante pelo relógio, sem contador', () => {
    expect(restanteMs(novo(0), 10 * MIN)).toBe(15 * MIN);
  });

  it('nunca fica negativo', () => {
    expect(restanteMs(novo(0), 40 * MIN)).toBe(0);
  });

  it('pausa congela o tempo e retomar desconta a pausa', () => {
    const pausado = pausar(novo(0), 5 * MIN);
    expect(restanteMs(pausado, 30 * MIN)).toBe(20 * MIN);
    const retomado = retomar(pausado, 30 * MIN);
    expect(retomado.pausadoTotalMs).toBe(25 * MIN);
    expect(restanteMs(retomado, 31 * MIN)).toBe(19 * MIN);
  });

  it('formata em mm:ss arredondando para cima', () => {
    expect(formatar(18 * MIN + 41_200)).toBe('18:42');
    expect(formatar(0)).toBe('00:00');
  });
});

describe('fechar o bloco', () => {
  it('acaba quando o restante chega a zero, e não antes', () => {
    expect(acabou(novo(0), 24 * MIN)).toBe(false);
    expect(acabou(novo(0), 25 * MIN)).toBe(true);
    expect(acabou(novo(0), 40 * MIN)).toBe(true);
  });

  it('pausado não acaba, mesmo com o relógio andando', () => {
    const pausado = pausar(novo(0), 10 * MIN);
    expect(acabou(pausado, 60 * MIN)).toBe(false);
  });

  it('fração cumprida vai de 0 a 1', () => {
    expect(fracaoCumprida(novo(0), 0)).toBe(0);
    expect(fracaoCumprida(novo(0), 12.5 * MIN)).toBeCloseTo(0.5);
    expect(fracaoCumprida(novo(0), 99 * MIN)).toBe(1);
  });

  it('onde parei: limpa espaços, corta em 120 e vazio vira nulo', () => {
    expect(limparOndeParei('  parei no   refrão ')).toBe('parei no refrão');
    expect(limparOndeParei('   ')).toBeNull();
    expect(limparOndeParei('a'.repeat(200))).toHaveLength(120);
  });
});
