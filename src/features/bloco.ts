import { and, eq, isNull } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import type { ModoBloco } from '@/data/schema';
import { limparOndeParei, pausar, restanteMs, retomar } from '@/domain/timer';
import { atualizarFase } from '@/features/track';
import { novoId } from '@/platform/id';
import { agendarFimDoBloco, cancelar } from '@/platform/notificacoes';

// Casos de uso do bloco de foco. Cada ação grava antes da tela mudar (ADR-002).

const { bloco, tarefa } = schema;

export const MINUTOS: Record<ModoBloco, number> = { completo: 25, feia: 10, retomada: 10 };

// Consulta ao vivo do bloco aberto (no máximo um por vez), com a tarefa.
export function consultaBlocoAberto() {
  return db
    .select({
      id: bloco.id,
      trackId: bloco.trackId,
      tarefaId: bloco.tarefaId,
      modo: bloco.modo,
      iniciadoEm: bloco.iniciadoEm,
      duracaoMs: bloco.duracaoMs,
      pausadoTotalMs: bloco.pausadoTotalMs,
      pausadoEm: bloco.pausadoEm,
      notificacaoId: bloco.notificacaoId,
      texto: tarefa.texto,
      fase: tarefa.fase,
      prontoQuando: tarefa.prontoQuando,
      versaoFeia: tarefa.versaoFeia,
      secao: tarefa.secao,
      parametro: tarefa.parametro,
      ondeParei: tarefa.ondeParei,
    })
    .from(bloco)
    .leftJoin(tarefa, eq(tarefa.id, bloco.tarefaId))
    .where(isNull(bloco.encerradoEm))
    .limit(1);
}

export function blocoAberto() {
  return db.select().from(bloco).where(isNull(bloco.encerradoEm)).get();
}

export async function iniciarBloco(entrada: { trackId: string; tarefaId: string; modo: ModoBloco }): Promise<void> {
  if (blocoAberto()) return; // um bloco aberto por vez
  const agora = Date.now();
  const duracaoMs = MINUTOS[entrada.modo] * 60_000;
  const id = novoId();
  db.insert(bloco).values({ id, ...entrada, iniciadoEm: agora, duracaoMs }).run();
  try {
    const notificacaoId = await agendarFimDoBloco(agora + duracaoMs);
    db.update(bloco).set({ notificacaoId }).where(and(eq(bloco.id, id), isNull(bloco.encerradoEm))).run();
  } catch {
    // Sem permissão de notificação o bloco segue normal; só não há aviso com o app fechado.
  }
}

export async function pausarOuRetomar(): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  const agora = Date.now();
  if (b.pausadoEm === null) {
    const p = pausar(b, agora);
    db.update(bloco).set({ pausadoEm: p.pausadoEm, notificacaoId: null }).where(eq(bloco.id, b.id)).run();
    await cancelar(b.notificacaoId).catch(() => undefined);
  } else {
    const r = retomar(b, agora);
    db.update(bloco).set({ pausadoEm: null, pausadoTotalMs: r.pausadoTotalMs }).where(eq(bloco.id, b.id)).run();
    try {
      const notificacaoId = await agendarFimDoBloco(agora + restanteMs(r, agora));
      db.update(bloco).set({ notificacaoId }).where(and(eq(bloco.id, b.id), isNull(bloco.encerradoEm))).run();
    } catch {
      // ver iniciarBloco
    }
  }
}

// Fecha o bloco. "Terminei" conclui a tarefa (também na versão feia: feito conta mais que perfeito).
// Na retomada, "terminei" é o passo de volta; a tarefa continua aberta. "Continua" guarda onde parou.
export async function fecharBloco(entrada: { resposta: 'terminei' | 'continua'; ondeParei?: string }): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  const agora = Date.now();
  const nota = limparOndeParei(entrada.ondeParei ?? '');
  db.transaction((tx) => {
    tx.update(bloco).set({ encerradoEm: agora, resposta: entrada.resposta }).where(eq(bloco.id, b.id)).run();
    if (!b.tarefaId) return;
    if (entrada.resposta === 'terminei' && b.modo !== 'retomada') {
      tx.update(tarefa).set({ feitaEm: agora, ondeParei: null }).where(eq(tarefa.id, b.tarefaId)).run();
    } else if (nota) {
      tx.update(tarefa).set({ ondeParei: nota }).where(eq(tarefa.id, b.tarefaId)).run();
    }
  });
  if (b.trackId) atualizarFase(b.trackId);
  await cancelar(b.notificacaoId).catch(() => undefined);
}

// Começou sem querer: sai do bloco sem contar nada.
export async function descartarBloco(): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  db.delete(bloco).where(eq(bloco.id, b.id)).run();
  await cancelar(b.notificacaoId).catch(() => undefined);
}
