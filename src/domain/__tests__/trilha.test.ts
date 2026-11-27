import { TAREFAS } from '@/base';
import { faltaEscolherAutomacao, faseVigente, montarTrilha, precisaRetomada, progresso, proximaTarefa, trilhaComModelos } from '@/domain/trilha';

const comoEstado = (estilo: 'house' | 'deep' | 'garage') => montarTrilha(estilo).map((t) => ({ ...t, feita: false }));

describe('montarTrilha', () => {
  it('copia a base na ordem, sem o que não vale para o estilo', () => {
    const deep = montarTrilha('deep');
    expect(deep.map((t) => t.ordem)).toEqual(deep.map((_, i) => i));
    expect(deep.find((t) => t.id === 'vida.beat-repeat')).toBeUndefined();
    expect(montarTrilha('house').length).toBe(TAREFAS.length);
  });

  it('deixa o cardápio de automação para a pessoa escolher', () => {
    const t = montarTrilha('house');
    expect(t.filter((x) => x.tipo === 'cardapio').every((x) => !x.escolhida)).toBe(true);
    expect(t.filter((x) => x.tipo === 'tarefa').every((x) => x.escolhida)).toBe(true);
  });
});

describe('andamento da trilha', () => {
  it('a próxima tarefa é a primeira pendente da fase', () => {
    const t = comoEstado('house');
    expect(proximaTarefa(t, 'ideia')?.id).toBe('ideia.destino');
    t[0]!.feita = true;
    expect(proximaTarefa(t, 'ideia')?.id).toBe('ideia.referencias');
  });

  it('pula para a próxima fase com pendência e termina em null', () => {
    const t = comoEstado('house');
    t.filter((x) => x.fase === 'ideia').forEach((x) => (x.feita = true));
    expect(faseVigente(t, 'ideia')).toBe('loop');
    t.filter((x) => x.fase !== 'automacao' || x.tipo === 'tarefa').forEach((x) => (x.feita = true));
    expect(faseVigente(t, 'ideia')).toBe('automacao'); // segura até escolher 3 automações
    t.filter((x) => x.tipo === 'cardapio').slice(0, 3).forEach((x) => (x.escolhida = true));
    t.forEach((x) => (x.feita = true));
    expect(faseVigente(t, 'ideia')).toBeNull();
    expect(progresso(t, 'ideia')).toBe(1);
  });

  it('o progresso começa em zero e cresce com as tarefas', () => {
    const t = comoEstado('garage');
    expect(progresso(t, 'ideia')).toBe(0);
    t[0]!.feita = true;
    expect(progresso(t, 'ideia')).toBeGreaterThan(0);
  });

  it('pede pelo menos 3 automações escolhidas', () => {
    const t = comoEstado('deep');
    expect(faltaEscolherAutomacao(t)).toBe(true);
    t.filter((x) => x.tipo === 'cardapio').slice(0, 3).forEach((x) => (x.escolhida = true));
    expect(faltaEscolherAutomacao(t)).toBe(false);
  });
});

describe('precisaRetomada', () => {
  const dia = 86_400_000;
  it('aparece com 3 dias ou mais sem bloco', () => {
    expect(precisaRetomada(null, 10 * dia)).toBe(false);
    expect(precisaRetomada(0, 2 * dia)).toBe(false);
    expect(precisaRetomada(0, 3 * dia)).toBe(true);
  });
});

describe('trilhaComModelos', () => {
  const meu = { fase: 'loop' as const, tipo: 'tarefa' as const, baseId: null, prontoQuando: null, versaoFeia: null, grupo: null, secao: null, parametro: null };
  it('troca só a fase que tem modelo e mantém a ordem das fases', () => {
    const t = trilhaComModelos('house', [
      { ...meu, texto: 'Meu kick primeiro' },
      { ...meu, texto: 'Meu baixo depois' },
    ]);
    expect(t.filter((x) => x.fase === 'loop').map((x) => x.texto)).toEqual(['Meu kick primeiro', 'Meu baixo depois']);
    expect(t.filter((x) => x.fase === 'ideia').length).toBeGreaterThan(0);
    expect(t.map((x) => x.ordem)).toEqual(t.map((_, i) => i));
  });

  it('sem modelo, é a trilha da base', () => {
    expect(trilhaComModelos('deep', []).map((x) => x.baseId)).toEqual(montarTrilha('deep').map((x) => x.id));
  });
});
