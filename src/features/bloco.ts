import { and, eq, isNull } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import { limparOndeParei, pausar, restanteMs, retomar } from '@/domain/timer';
import { novoId } from '@/platform/id';
import { agendarFimDoBloco, cancelar } from '@/platform/notificacoes';

// Casos de uso do bloco de foco. Cada ação grava antes da tela mudar (ADR-002).
// Regras R4 e R5 do plano da fase de testes.

const { bloco, topico } = schema;

export const MINUTOS_BLOCO = 25;
export const MINUTOS_RETOMADA = 10;

// Consulta ao vivo do bloco aberto (no máximo um por vez), com o texto do passo.
export function consultaBlocoAberto() {
  return db
    .select({
      id: bloco.id,
      topicoId: bloco.topicoId,
      iniciadoEm: bloco.iniciadoEm,
      duracaoMs: bloco.duracaoMs,
      pausadoTotalMs: bloco.pausadoTotalMs,
      pausadoEm: bloco.pausadoEm,
      notificacaoId: bloco.notificacaoId,
      passo: topico.texto,
      ondeParei: topico.ondeParei,
    })
    .from(bloco)
    .leftJoin(topico, eq(topico.id, bloco.topicoId))
    .where(isNull(bloco.encerradoEm))
    .limit(1);
}

export function blocoAberto() {
  return db.select().from(bloco).where(isNull(bloco.encerradoEm)).get();
}

export async function iniciarBloco(topicoId: string, minutos: number): Promise<void> {
  if (blocoAberto()) return; // R4: um bloco aberto por vez
  const agora = Date.now();
  const duracaoMs = minutos * 60_000;
  const id = novoId();
  db.insert(bloco).values({ id, topicoId, iniciadoEm: agora, duracaoMs }).run();
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

// R5: fecha o bloco. "Terminei" conclui o passo; "continua" guarda onde a pessoa parou.
export async function fecharBloco(entrada: { resposta: 'terminei' | 'continua'; ondeParei?: string }): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  const agora = Date.now();
  const nota = limparOndeParei(entrada.ondeParei ?? '');
  db.transaction((tx) => {
    tx.update(bloco).set({ encerradoEm: agora, resposta: entrada.resposta }).where(eq(bloco.id, b.id)).run();
    if (!b.topicoId) return;
    if (entrada.resposta === 'terminei') {
      tx.update(topico).set({ feitoEm: agora, ondeParei: null }).where(eq(topico.id, b.topicoId)).run();
    } else if (nota) {
      tx.update(topico).set({ ondeParei: nota }).where(eq(topico.id, b.topicoId)).run();
    }
  });
  await cancelar(b.notificacaoId).catch(() => undefined);
}

// Começou sem querer: sai do bloco sem contar nada.
export async function descartarBloco(): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  db.delete(bloco).where(eq(bloco.id, b.id)).run();
  await cancelar(b.notificacaoId).catch(() => undefined);
}
