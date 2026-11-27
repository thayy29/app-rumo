import { FASES, TAREFAS, type Estilo, type Fase, type TarefaBase } from '@/base';

// Regras puras da trilha de uma track (ADR-017). Sem banco: recebem e devolvem dados.

export type TarefaDaTrilha = TarefaBase & { ordem: number; escolhida: boolean };

// Copia a base para a track: só o que vale para o estilo. Itens do cardápio entram não escolhidos.
export function montarTrilha(estilo: Estilo): TarefaDaTrilha[] {
  return TAREFAS.filter((t) => !t.estilos || t.estilos.includes(estilo)).map((t, ordem) => ({
    ...t,
    ordem,
    escolhida: t.tipo === 'tarefa',
  }));
}

// O mínimo que a trilha precisa saber de uma tarefa gravada.
export type EstadoTarefa = { id: string; fase: Fase; ordem: number; escolhida: boolean; feita: boolean };

export function tarefasAtivas<T extends EstadoTarefa>(tarefas: T[]): T[] {
  return tarefas.filter((t) => t.escolhida).sort((a, b) => FASES.indexOf(a.fase) - FASES.indexOf(b.fase) || a.ordem - b.ordem);
}

// A próxima tarefa é a primeira não feita da fase atual.
export function proximaTarefa<T extends EstadoTarefa>(tarefas: T[], fase: Fase): T | undefined {
  return tarefasAtivas(tarefas).find((t) => t.fase === fase && !t.feita);
}

export function faseConcluida(tarefas: EstadoTarefa[], fase: Fase): boolean {
  return proximaTarefa(tarefas, fase) === undefined;
}

// A fase em que a track está: a primeira, a partir da atual, que ainda tem tarefa pendente.
// null quando tudo está feito: a track está terminada.
export function faseVigente(tarefas: EstadoTarefa[], atual: Fase): Fase | null {
  const inicio = FASES.indexOf(atual);
  return FASES.slice(inicio).find((f) => !faseConcluida(tarefas, f)) ?? null;
}

// Progresso de 0 a 1 que o Knob mostra: fases cheias mais a fração da fase vigente.
export function progresso(tarefas: EstadoTarefa[], atual: Fase): number {
  const vigente = faseVigente(tarefas, atual);
  if (vigente === null) return 1;
  const daFase = tarefasAtivas(tarefas).filter((t) => t.fase === vigente);
  const fracao = daFase.length ? daFase.filter((t) => t.feita).length / daFase.length : 0;
  return (FASES.indexOf(vigente) + fracao) / FASES.length;
}

// Ao criar a track já adiantada (FR-024), as fases anteriores contam como feitas.
export function fasesAntes(fase: Fase): Fase[] {
  return FASES.slice(0, FASES.indexOf(fase));
}

export const ESCOLHA_AUTOMACAO = { min: 3, max: 6 } as const;

// A fase de automação só anda depois de escolher pelo menos 3 itens do cardápio.
export function faltaEscolherAutomacao(tarefas: (EstadoTarefa & { tipo: string })[]): boolean {
  return tarefas.filter((t) => t.tipo === 'cardapio' && t.escolhida).length < ESCOLHA_AUTOMACAO.min;
}

// Retomada: 3 dias ou mais sem bloco. Nunca conta os dias perdidos na tela.
export const DIAS_RETOMADA = 3;
export function precisaRetomada(ultimoBloco: number | null, agora: number): boolean {
  if (ultimoBloco === null) return false;
  return agora - ultimoBloco >= DIAS_RETOMADA * 86_400_000;
}
