import { ESTILO, SECOES, type Estilo, type Secao } from '@/base';

// Mapa de arranjo calculado (ADR-018): onde cada locator vai no Arrangement do Ableton.

export type SecaoDoMapa = {
  nome: Secao;
  compassos: number;
  compassoInicial: number; // 1 = começo da track, como a régua do Ableton
  inicioSeg: number;
  duracaoSeg: number;
};

export type MapaDeArranjo = { secoes: SecaoDoMapa[]; compassos: number; duracaoSeg: number };

export type Ajustes = Partial<Record<Secao, number>>;

// 4/4: um compasso tem 4 tempos.
export function segundosPorCompasso(bpm: number): number {
  return (4 * 60) / bpm;
}

export function mapaDeArranjo(estilo: Estilo, bpm: number, ajustes: Ajustes = {}): MapaDeArranjo {
  const s = segundosPorCompasso(bpm);
  let compasso = 1;
  const secoes = SECOES.map((nome) => {
    const compassos = Math.max(0, ajustes[nome] ?? ESTILO[estilo].mapa[nome]);
    const secao = { nome, compassos, compassoInicial: compasso, inicioSeg: (compasso - 1) * s, duracaoSeg: compassos * s };
    compasso += compassos;
    return secao;
  }).filter((x) => x.compassos > 0);
  const compassos = compasso - 1;
  return { secoes, compassos, duracaoSeg: compassos * s };
}

// "INTRO 1", "BUILD 49": o nome que vai no locator.
export function nomeDoLocator(secao: SecaoDoMapa): string {
  return `${secao.nome} ${secao.compassoInicial}`;
}

export function minutosESegundos(seg: number): string {
  const total = Math.round(seg);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
