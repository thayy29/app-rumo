import { and, asc, desc, eq, isNotNull, isNull, max } from 'drizzle-orm';

import { FASES, type Estilo, type Fase } from '@/base';
import { db, schema } from '@/data/db';
import { fasesAntes, faseVigente, montarTrilha } from '@/domain/trilha';
import { novoId } from '@/platform/id';

// Casos de uso da track (FR-022 a FR-030). Cada ação grava antes da tela mudar (ADR-002).

const { track, tarefa, bloco } = schema;

export type NovaTrack = { nome: string; estilo: Estilo; bpm: number; destino: 'pista' | 'streaming'; fase: Fase };

// FR-022 e FR-024: cria a track, copia a trilha da base e marca como feitas as fases anteriores.
export function criarTrack(dados: NovaTrack): string {
  const agora = Date.now();
  const id = novoId();
  const antes = new Set(fasesAntes(dados.fase));
  db.transaction((tx) => {
    tx.insert(track)
      .values({ id, nome: dados.nome.trim() || 'Track sem nome', estilo: dados.estilo, bpm: dados.bpm, destino: dados.destino, faseAtual: dados.fase, criadaEm: agora, escolhidaEm: agora })
      .run();
    const linhas = montarTrilha(dados.estilo).map((t) => ({
      id: novoId(),
      trackId: id,
      fase: t.fase,
      ordem: t.ordem,
      baseId: t.id,
      tipo: t.tipo,
      texto: t.texto,
      prontoQuando: t.prontoQuando,
      versaoFeia: t.versaoFeia,
      grupo: t.grupo ?? null,
      secao: t.secao ?? null,
      parametro: t.parametro ?? null,
      escolhida: t.escolhida,
      feitaEm: antes.has(t.fase) && t.escolhida ? agora : null,
    }));
    // Em lotes: o SQLite limita a quantidade de parâmetros por comando.
    for (let i = 0; i < linhas.length; i += 20) tx.insert(tarefa).values(linhas.slice(i, i + 20)).run();
  });
  return id;
}

// A track aberta no Hoje: a última escolhida que não foi arquivada.
export function consultaTrackAtiva() {
  return db.select().from(track).where(isNull(track.arquivadaEm)).orderBy(desc(track.escolhidaEm)).limit(1);
}

export function consultaTracks() {
  return db.select().from(track).where(isNull(track.arquivadaEm)).orderBy(desc(track.escolhidaEm));
}

export function existeTrack(): boolean {
  return db.select({ id: track.id }).from(track).where(isNull(track.arquivadaEm)).get() !== undefined;
}

export function consultaTarefas(trackId: string) {
  return db.select().from(tarefa).where(eq(tarefa.trackId, trackId)).orderBy(asc(tarefa.ordem));
}

// Último bloco encerrado da track: decide se o Hoje abre em modo retomada.
export function consultaUltimoBloco(trackId: string) {
  return db
    .select({ em: max(bloco.encerradoEm) })
    .from(bloco)
    .where(and(eq(bloco.trackId, trackId), isNotNull(bloco.encerradoEm)));
}

export function escolherTrack(trackId: string): void {
  db.update(track).set({ escolhidaEm: Date.now() }).where(eq(track.id, trackId)).run();
}

export function arquivarTrack(trackId: string): void {
  db.update(track).set({ arquivadaEm: Date.now() }).where(eq(track.id, trackId)).run();
}

// Recalcula a fase da track depois de qualquer mudança nas tarefas. Fim da fase 8: terminada.
export function atualizarFase(trackId: string): void {
  const t = db.select().from(track).where(eq(track.id, trackId)).get();
  if (!t) return;
  const tarefas = db.select().from(tarefa).where(eq(tarefa.trackId, trackId)).all();
  const estado = tarefas.map((x) => ({ ...x, feita: x.feitaEm !== null }));
  const vigente = faseVigente(estado, FASES[0]);
  if (vigente === null) {
    db.update(track).set({ faseAtual: 'export', terminadaEm: t.terminadaEm ?? Date.now() }).where(eq(track.id, trackId)).run();
  } else {
    db.update(track).set({ faseAtual: vigente, terminadaEm: null }).where(eq(track.id, trackId)).run();
  }
}

// FR-025: marcar ou desmarcar uma tarefa à mão, na trilha.
export function alternarFeita(tarefaId: string): void {
  const t = db.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
  if (!t) return;
  db.update(tarefa)
    .set({ feitaEm: t.feitaEm === null ? Date.now() : null, ondeParei: null })
    .where(eq(tarefa.id, tarefaId))
    .run();
  atualizarFase(t.trackId);
}

// FR-026: escolher os itens do cardápio de automação.
export function alternarEscolhida(tarefaId: string): void {
  const t = db.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
  if (!t || t.tipo !== 'cardapio') return;
  db.update(tarefa).set({ escolhida: !t.escolhida }).where(eq(tarefa.id, tarefaId)).run();
  atualizarFase(t.trackId);
}

// FR-025: a pessoa acrescenta uma tarefa dela no fim da fase.
export function adicionarTarefa(trackId: string, fase: Fase, texto: string): void {
  const limpo = texto.replace(/\s+/g, ' ').trim().slice(0, 110);
  if (!limpo) return;
  const ultima = db.select({ ordem: max(tarefa.ordem) }).from(tarefa).where(eq(tarefa.trackId, trackId)).get();
  db.insert(tarefa)
    .values({ id: novoId(), trackId, fase, ordem: (ultima?.ordem ?? 0) + 1, texto: limpo, escolhida: true })
    .run();
  atualizarFase(trackId);
}

export function apagarTarefaPropria(tarefaId: string): void {
  const t = db.select().from(tarefa).where(and(eq(tarefa.id, tarefaId), isNull(tarefa.baseId))).get();
  if (!t) return;
  db.delete(tarefa).where(eq(tarefa.id, tarefaId)).run();
  atualizarFase(t.trackId);
}

export function editarTrack(trackId: string, dados: { nome?: string; bpm?: number }): void {
  const set: { nome?: string; bpm?: number } = {};
  if (dados.nome?.trim()) set.nome = dados.nome.trim();
  if (dados.bpm && dados.bpm >= 60 && dados.bpm <= 200) set.bpm = Math.round(dados.bpm);
  if (Object.keys(set).length) db.update(track).set(set).where(eq(track.id, trackId)).run();
}

// Quantas tracks já foram terminadas (o G1 do PRD).
export function consultaTerminadas() {
  return db.select({ id: track.id }).from(track).where(isNotNull(track.terminadaEm));
}
