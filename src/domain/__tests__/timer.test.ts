import { formatar, pausar, restanteMs, retomar, type CarimbosDoBloco } from '../timer';

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
