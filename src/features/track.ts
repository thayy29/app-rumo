import { and, asc, desc, eq, isNotNull, isNull, max } from 'drizzle-orm';

import { FASES, type Estilo, type Fase } from '@/base';
import { db, schema } from '@/data/db';
import { fasesAntes, faseVigente, trilhaComModelos } from '@/domain/trilha';
import { novoId } from '@/platform/id';

// Casos de uso da track (FR-022 a FR-030). Cada ação grava antes da tela mudar (ADR-002).

const { track, tarefa, bloco, notaDaFase, modeloTarefa } = schema;

export type NovaTrack = { nome: string; estilo: Estilo; bpm: number; destino: 'pista' | 'streaming'; fase: Fase };

// FR-022 e FR-024: cria a track, copia a trilha da base e marca como feitas as fases anteriores.
export function criarTrack(dados: NovaTrack): string {
  const agora = Date.now();
  const id = novoId();
  const antes = new Set(fasesAntes(dados.fase));
  // O formulário de criação já responde ao destino: essa tarefa da base entra feita.
  const respondidas = new Set(['ideia.destino']);
  db.transaction((tx) => {
    tx.insert(track)
      .values({ id, nome: dados.nome.trim() || 'Track sem nome', estilo: dados.estilo, bpm: dados.bpm, destino: dados.destino, faseAtual: dados.fase, criadaEm: agora, escolhidaEm: agora })
      .run();
    // Fases com modelo próprio usam o modelo; as outras, a base (FR-023).
    const modelos = tx.select().from(modeloTarefa).orderBy(asc(modeloTarefa.ordem)).all();
    const linhas = trilhaComModelos(dados.estilo, modelos).map((t) => ({
      ...t,
      id: novoId(),
      trackId: id,
      feitaEm: (antes.has(t.fase) && t.escolhida) || (t.baseId !== null && respondidas.has(t.baseId)) ? agora : null,
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

// Só a fase em que a track está pode ser editada; as outras são para ver o progresso.
function faseDaTrack(trackId: string): Fase | null {
  const tarefas = db.select().from(tarefa).where(eq(tarefa.trackId, trackId)).all();
  return faseVigente(
    tarefas.map((x) => ({ ...x, feita: x.feitaEm !== null })),
    FASES[0],
  );
}

// FR-025: marcar ou desmarcar uma tarefa à mão, na trilha.
export function alternarFeita(tarefaId: string): void {
  const t = db.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
  if (!t || faseDaTrack(t.trackId) !== t.fase) return;
  db.update(tarefa)
    .set({ feitaEm: t.feitaEm === null ? Date.now() : null, ondeParei: null })
    .where(eq(tarefa.id, tarefaId))
    .run();
  atualizarFase(t.trackId);
}

// FR-026: escolher os itens do cardápio de automação.
export function alternarEscolhida(tarefaId: string): void {
  const t = db.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
  if (!t || t.tipo !== 'cardapio' || faseDaTrack(t.trackId) !== 'automacao') return;
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

// Observações da fase: o que está difícil. Texto vazio apaga a nota.
export function consultaNotas(trackId: string) {
  return db.select().from(notaDaFase).where(eq(notaDaFase.trackId, trackId));
}

export function salvarNota(trackId: string, fase: Fase, texto: string): void {
  const limpo = texto.trim().slice(0, 600);
  if (!limpo) {
    db.delete(notaDaFase).where(and(eq(notaDaFase.trackId, trackId), eq(notaDaFase.fase, fase))).run();
    return;
  }
  db.insert(notaDaFase)
    .values({ trackId, fase, texto: limpo, atualizadaEm: Date.now() })
    .onConflictDoUpdate({ target: [notaDaFase.trackId, notaDaFase.fase], set: { texto: limpo, atualizadaEm: Date.now() } })
    .run();
}

// Modelo próprio: a lista atual da fase vira o ponto de partida das próximas tracks.
export function salvarModelo(trackId: string, fase: Fase): void {
  const daFase = db
    .select()
    .from(tarefa)
    .where(and(eq(tarefa.trackId, trackId), eq(tarefa.fase, fase)))
    .orderBy(asc(tarefa.ordem))
    .all();
  if (daFase.length === 0) return;
  const agora = Date.now();
  db.transaction((tx) => {
    tx.delete(modeloTarefa).where(eq(modeloTarefa.fase, fase)).run();
    const linhas = daFase.map((t, ordem) => ({
      id: novoId(),
      fase,
      ordem,
      baseId: t.baseId,
      tipo: t.tipo,
      texto: t.texto,
      prontoQuando: t.prontoQuando,
      versaoFeia: t.versaoFeia,
      grupo: t.grupo,
      secao: t.secao,
      parametro: t.parametro,
      criadoEm: agora,
    }));
    for (let i = 0; i < linhas.length; i += 20) tx.insert(modeloTarefa).values(linhas.slice(i, i + 20)).run();
  });
}

export function apagarModelo(fase: Fase): void {
  db.delete(modeloTarefa).where(eq(modeloTarefa.fase, fase)).run();
}

// Fases que têm modelo próprio.
export function consultaFasesComModelo() {
  return db.selectDistinct({ fase: modeloTarefa.fase }).from(modeloTarefa);
}
