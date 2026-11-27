import { mapaDeArranjo, minutosESegundos, nomeDoLocator } from '@/domain/arranjo';

describe('mapaDeArranjo', () => {
  it('posiciona os locators pelo mapa do estilo', () => {
    const m = mapaDeArranjo('house', 124);
    expect(m.secoes.map(nomeDoLocator)).toEqual(['INTRO 1', 'GROOVE 33', 'BUILD 49', 'DROP 1 65', 'BREAK 97', 'BUILD 2 113', 'DROP 2 121', 'OUTRO 153']);
    expect(m.compassos).toBe(184);
  });

  it('calcula a duração pelo BPM', () => {
    const m = mapaDeArranjo('house', 120);
    expect(m.duracaoSeg).toBe(184 * 2);
    expect(minutosESegundos(m.duracaoSeg)).toBe('6:08');
  });

  it('aceita ajustes e some com a seção zerada', () => {
    const m = mapaDeArranjo('garage', 130, { INTRO: 8, BREAK: 0 });
    expect(m.secoes[0]).toMatchObject({ nome: 'INTRO', compassos: 8 });
    expect(m.secoes.find((s) => s.nome === 'BREAK')).toBeUndefined();
  });
});
