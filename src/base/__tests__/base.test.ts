import { ESTILO, ESTILOS, FASE, FASES, SECOES, TAREFAS } from '@/base';

// Teste de conteúdo (ADR-016): a base é dado, e dado errado quebra a trilha sem erro de tipo.
describe('base de conhecimento', () => {
  it('tem ids únicos e no formato fase.nome', () => {
    const ids = TAREFAS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    TAREFAS.forEach((t) => expect(t.id.startsWith(`${t.fase}.`)).toBe(true));
  });

  it('tem tarefas em todas as fases, na ordem das fases', () => {
    FASES.forEach((f) => expect(TAREFAS.some((t) => t.fase === f && t.tipo === 'tarefa')).toBe(true));
    const ordem = TAREFAS.map((t) => FASES.indexOf(t.fase));
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
  });

  it('toda tarefa tem texto, pronto quando e versão feia curtos e preenchidos', () => {
    TAREFAS.forEach((t) => {
      expect(t.texto.trim()).not.toBe('');
      expect(t.prontoQuando.trim()).not.toBe('');
      expect(t.versaoFeia.trim()).not.toBe('');
      expect(t.texto.length).toBeLessThanOrEqual(110);
      expect(t.texto.endsWith('.')).toBe(false);
    });
  });

  it('só a automação tem cardápio, e ele tem opções suficientes para escolher de 3 a 6', () => {
    const cardapio = TAREFAS.filter((t) => t.tipo === 'cardapio');
    cardapio.forEach((t) => {
      expect(t.fase).toBe('automacao');
      expect(t.parametro).toBeTruthy();
      expect(t.secao).toBeTruthy();
    });
    expect(cardapio.length).toBeGreaterThanOrEqual(6);
  });

  it('cada estilo citado existe', () => {
    TAREFAS.forEach((t) => (t.estilos ?? []).forEach((e) => expect(ESTILOS).toContain(e)));
  });

  it('as fases estão numeradas de 1 a 8 e têm passo de volta', () => {
    FASES.forEach((f, i) => {
      expect(FASE[f].numero).toBe(i + 1);
      expect(FASE[f].retomada.trim()).not.toBe('');
    });
  });

  it('os estilos têm BPM coerente e mapa com todas as seções em múltiplos de 8', () => {
    ESTILOS.forEach((e) => {
      const { bpm, mapa } = ESTILO[e];
      expect(bpm.min).toBeLessThanOrEqual(bpm.padrao);
      expect(bpm.padrao).toBeLessThanOrEqual(bpm.max);
      SECOES.forEach((s) => expect(mapa[s] % 8).toBe(0));
    });
  });
});
