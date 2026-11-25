import { asc, eq } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import { importarSumario, marcarAte, type SumarioImportado } from '@/domain/sumario';
import { novoId } from '@/platform/id';
import type { TipoEstudo } from '@/state/rascunho';

// Casos de uso do começo (EPIC-001). Cada ação é uma transação (ADR-002).

const { estudo, grupo, topico } = schema;

// FR-001 + FR-002: grava o estudo com os grupos e tópicos do sumário.
// Se a pessoa voltou da etapa 3 e mudou o sumário, o estudo anterior é substituído.
export function salvarEstudo(entrada: {
  tipo: TipoEstudo;
  nome: string;
  sumario: string;
  substituirId?: string | null;
}): { estudoId: string; importado: SumarioImportado } {
  const importado = importarSumario(entrada.sumario, entrada.nome);
  const estudoId = novoId();
  const agora = Date.now();
  db.transaction((tx) => {
    if (entrada.substituirId) tx.delete(estudo).where(eq(estudo.id, entrada.substituirId)).run();
    tx.insert(estudo).values({ id: estudoId, nome: entrada.nome, tipo: entrada.tipo, criadoEm: agora }).run();
    importado.grupos.forEach((g, gi) => {
      const grupoId = novoId();
      tx.insert(grupo).values({ id: grupoId, estudoId, ordem: gi, nome: g.nome }).run();
      g.topicos.forEach((texto, ti) => {
        tx.insert(topico).values({ id: novoId(), grupoId, ordem: ti, texto }).run();
      });
    });
  });
  return { estudoId, importado };
}

// Consulta base: tópicos do estudo na ordem do sumário (módulo, depois tópico).
export function consultaTopicos(estudoId: string) {
  return db
    .select({
      id: topico.id,
      texto: topico.texto,
      feitoEm: topico.feitoEm,
      grupoId: grupo.id,
      grupo: grupo.nome,
    })
    .from(topico)
    .innerJoin(grupo, eq(topico.grupoId, grupo.id))
    .where(eq(grupo.estudoId, estudoId))
    .orderBy(asc(grupo.ordem), asc(topico.ordem));
}

// FR-018: tocar no último tópico feito marca ele e todos os anteriores; o resto volta a "a fazer".
export function marcarAteOTopico(estudoId: string, indice: number): void {
  const todos = consultaTopicos(estudoId).all();
  const feitos = new Set(marcarAte(todos, indice).map((t) => t.id));
  const agora = Date.now();
  db.transaction((tx) => {
    for (const t of todos) {
      const feitoEm = feitos.has(t.id) ? (t.feitoEm ?? agora) : null;
      if (feitoEm !== t.feitoEm) tx.update(topico).set({ feitoEm }).where(eq(topico.id, t.id)).run();
    }
  });
}

export function apagarEstudo(estudoId: string): void {
  db.delete(estudo).where(eq(estudo.id, estudoId)).run();
}
