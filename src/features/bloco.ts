import { and, eq, isNull } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import { pausar, restanteMs, retomar } from '@/domain/timer';
import { novoId } from '@/platform/id';
import { agendarFimDoBloco, cancelar } from '@/platform/notificacoes';

// Casos de uso do bloco de foco (usados pelo Foco na semana 4). Cada ação grava antes da tela mudar (ADR-002).

const { bloco } = schema;

export function blocoAberto() {
  return db.select().from(bloco).where(isNull(bloco.encerradoEm)).get();
}

export async function iniciarBloco(minutos: number): Promise<void> {
  const aberto = blocoAberto();
  if (aberto) return;
  const agora = Date.now();
  const duracaoMs = minutos * 60_000;
  const id = novoId();
  db.insert(bloco).values({ id, iniciadoEm: agora, duracaoMs }).run();
  const notificacaoId = await agendarFimDoBloco(agora + duracaoMs);
  db.update(bloco).set({ notificacaoId }).where(eq(bloco.id, id)).run();
}

export async function pausarOuRetomar(): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  const agora = Date.now();
  if (b.pausadoEm === null) {
    const p = pausar(b, agora);
    db.update(bloco).set({ pausadoEm: p.pausadoEm, notificacaoId: null }).where(eq(bloco.id, b.id)).run();
    await cancelar(b.notificacaoId);
  } else {
    const r = retomar(b, agora);
    db.update(bloco).set({ pausadoEm: null, pausadoTotalMs: r.pausadoTotalMs }).where(eq(bloco.id, b.id)).run();
    const notificacaoId = await agendarFimDoBloco(agora + restanteMs(r, agora));
    db.update(bloco).set({ notificacaoId }).where(and(eq(bloco.id, b.id), isNull(bloco.encerradoEm))).run();
  }
}

export async function encerrarBloco(): Promise<void> {
  const b = blocoAberto();
  if (!b) return;
  db.update(bloco).set({ encerradoEm: Date.now() }).where(eq(bloco.id, b.id)).run();
  await cancelar(b.notificacaoId);
}
