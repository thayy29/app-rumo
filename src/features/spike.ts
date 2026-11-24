import { and, asc, eq, isNull } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import { importarSumario, marcarAte, type SumarioImportado } from '@/domain/sumario';
import { pausar, restanteMs, retomar } from '@/domain/timer';
import { novoId } from '@/platform/id';
import { agendarFimDoBloco, cancelar } from '@/platform/notificacoes';

// Casos de uso do spike. Cada ação é uma transação, gravada antes da tela mudar (ADR-002).

const { estudo, grupo, topico, bloco } = schema;

export function salvarSumario(nome: string, texto: string): SumarioImportado {
  const s = importarSumario(texto, nome);
  const agora = Date.now();
  db.transaction((tx) => {
    const estudoId = novoId();
    tx.insert(estudo).values({ id: estudoId, nome, tipo: 'certificacao', criadoEm: agora }).run();
    s.grupos.forEach((g, gi) => {
      const grupoId = novoId();
      tx.insert(grupo).values({ id: grupoId, estudoId, ordem: gi, nome: g.nome }).run();
      g.topicos.forEach((t, ti) => {
        tx.insert(topico).values({ id: novoId(), grupoId, ordem: ti, texto: t }).run();
      });
    });
  });
  return s;
}

export function topicosEmOrdem(estudoId: string) {
  return db
    .select({ id: topico.id, texto: topico.texto, feitoEm: topico.feitoEm, grupo: grupo.nome })
    .from(topico)
    .innerJoin(grupo, eq(topico.grupoId, grupo.id))
    .where(eq(grupo.estudoId, estudoId))
    .orderBy(asc(grupo.ordem), asc(topico.ordem))
    .all();
}

export function marcarAteOTopico(estudoId: string, indice: number): void {
  const todos = topicosEmOrdem(estudoId);
  const feitos = new Set(marcarAte(todos, indice).map((t) => t.id));
  const agora = Date.now();
  db.transaction((tx) => {
    for (const t of todos) {
      tx.update(topico).set({ feitoEm: feitos.has(t.id) ? (t.feitoEm ?? agora) : null }).where(eq(topico.id, t.id)).run();
    }
  });
}

export function apagarTudo(): void {
  db.transaction((tx) => {
    tx.delete(bloco).run();
    tx.delete(estudo).run();
  });
}

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
