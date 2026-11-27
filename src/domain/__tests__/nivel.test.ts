import { nivelPara, porMes, proximoNivel, subiuDeNivel } from '@/domain/nivel';

describe('níveis', () => {
  it('sobe em 1, 3, 5, 10 e 20 tracks', () => {
    expect([0, 1, 2, 3, 5, 9, 10, 20, 50].map((n) => nivelPara(n).upgrade)).toEqual(['nenhum', 'anel', 'anel', 'leds', 'ouro', 'ouro', 'fones', 'coroa', 'coroa']);
  });
  it('mostra o próximo nível e quando sobe', () => {
    expect(proximoNivel(3)?.minimo).toBe(5);
    expect(proximoNivel(20)).toBeUndefined();
    expect(subiuDeNivel(2, 3)).toBe(true);
    expect(subiuDeNivel(3, 4)).toBe(false);
  });
});

describe('porMes', () => {
  it('conta as tracks dos últimos meses, terminando no atual', () => {
    const agora = new Date(2026, 10, 27).getTime();
    const r = porMes([new Date(2026, 10, 2).getTime(), new Date(2026, 10, 20).getTime(), new Date(2026, 8, 1).getTime(), new Date(2025, 10, 1).getTime()], agora, 3);
    expect(r).toEqual([
      { rotulo: 'set', total: 1 },
      { rotulo: 'out', total: 0 },
      { rotulo: 'nov', total: 2 },
    ]);
  });
});
