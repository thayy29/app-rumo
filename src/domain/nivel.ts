// Níveis por tracks terminadas (gamificação). Cada nível evolui o equipamento do Knob.

export type Upgrade = 'nenhum' | 'anel' | 'leds' | 'ouro' | 'fones' | 'coroa';

export type Nivel = { indice: number; minimo: number; nome: string; upgrade: Upgrade; ganho: string };

export const NIVEIS: readonly Nivel[] = [
  { indice: 0, minimo: 0, nome: 'Aprendiz de estúdio', upgrade: 'nenhum', ganho: 'O Knob de fábrica' },
  { indice: 1, minimo: 1, nome: 'Finalizadora', upgrade: 'anel', ganho: 'Anel colorido com as 8 fases' },
  { indice: 2, minimo: 3, nome: 'Em série', upgrade: 'leds', ganho: 'LEDs acesos em volta' },
  { indice: 3, minimo: 5, nome: 'Disco de ouro', upgrade: 'ouro', ganho: 'Tampa dourada' },
  { indice: 4, minimo: 10, nome: 'Headliner', upgrade: 'fones', ganho: 'Fones de estúdio' },
  { indice: 5, minimo: 20, nome: 'Lenda do VU', upgrade: 'coroa', ganho: 'Coroa de VU meter' },
];

export function nivelPara(terminadas: number): Nivel {
  return [...NIVEIS].reverse().find((n) => terminadas >= n.minimo) ?? NIVEIS[0]!;
}

export function proximoNivel(terminadas: number): Nivel | undefined {
  return NIVEIS.find((n) => n.minimo > terminadas);
}

// Terminar mais uma track sobe de nível?
export function subiuDeNivel(antes: number, depois: number): boolean {
  return nivelPara(depois).indice > nivelPara(antes).indice;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Tracks terminadas por mês, dos últimos N meses até o mês atual (para o gráfico).
export function porMes(terminadasEm: number[], agora: number, meses = 6): { rotulo: string; total: number }[] {
  const hoje = new Date(agora);
  return Array.from({ length: meses }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1 - i), 1);
    const total = terminadasEm.filter((t) => {
      const x = new Date(t);
      return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
    }).length;
    return { rotulo: MESES[d.getMonth()]!, total };
  });
}
