import { asc, eq } from 'drizzle-orm';

import { db, schema } from '@/data/db';
import { extrairGuiaMicrosoft, normalizarLinkGuia } from '@/domain/guiaMicrosoft';
import { marcarAte, type SumarioImportado } from '@/domain/sumario';
import { novoId } from '@/platform/id';
import { baixarPagina } from '@/platform/rede';
import type { TipoEstudo } from '@/state/rascunho';

// Casos de uso do começo (EPIC-001). Cada ação é uma transação (ADR-002).

const { estudo, grupo, topico } = schema;

// FR-001 + FR-002: grava o estudo com os grupos e tópicos importados.
// Se a pessoa voltou da etapa 3 e mudou o sumário, o estudo anterior é substituído.
export function salvarEstudo(entrada: {
  tipo: TipoEstudo;
  nome: string;
  importado: SumarioImportado;
  substituirId?: string | null;
}): { estudoId: string } {
  const estudoId = novoId();
  const agora = Date.now();
  db.transaction((tx) => {
    if (entrada.substituirId) tx.delete(estudo).where(eq(estudo.id, entrada.substituirId)).run();
    tx.insert(estudo).values({ id: estudoId, nome: entrada.nome, tipo: entrada.tipo, criadoEm: agora }).run();
    entrada.importado.grupos.forEach((g, gi) => {
      const grupoId = novoId();
      tx.insert(grupo).values({ id: grupoId, estudoId, ordem: gi, nome: g.nome }).run();
      g.topicos.forEach((t, ti) => {
        const detalhes = t.detalhes.length > 0 ? JSON.stringify(t.detalhes) : null;
        tx.insert(topico).values({ id: novoId(), grupoId, ordem: ti, texto: t.texto, detalhes }).run();
      });
    });
  });
  return { estudoId };
}

export type ResultadoLink =
  | { ok: true; sumario: SumarioImportado }
  | { ok: false; mensagem: string };

const MENSAGENS = {
  LINK_INVALIDO: 'Isso não parece um link. Copie o endereço completo, começando com https://',
  NAO_E_MICROSOFT_LEARN: 'Por enquanto eu leio só guias do Microsoft Learn. Para outros cursos, cole o texto do sumário.',
  SEM_HABILIDADES: 'Não achei a lista de habilidades nessa página. Use o link do "guia de estudo" da prova, ou cole o texto.',
  SEM_INTERNET: 'Não consegui abrir o link agora. Confira a internet e tente de novo, ou cole o texto.',
} as const;

// ADR-014: lê o guia de estudo de uma certificação Microsoft a partir do link.
export async function importarPorLink(link: string): Promise<ResultadoLink> {
  const normal = normalizarLinkGuia(link);
  if (!normal.ok) return { ok: false, mensagem: MENSAGENS[normal.erro] };
  let html: string;
  try {
    html = await baixarPagina(normal.url);
  } catch {
    return { ok: false, mensagem: MENSAGENS.SEM_INTERNET };
  }
  const lido = extrairGuiaMicrosoft(html);
  return lido.ok ? { ok: true, sumario: lido.sumario } : { ok: false, mensagem: MENSAGENS[lido.erro] };
}

// Consulta base: tópicos do estudo na ordem do sumário (módulo, depois tópico).
export function consultaTopicos(estudoId: string) {
  return db
    .select({
      id: topico.id,
      texto: topico.texto,
      detalhes: topico.detalhes,
      feitoEm: topico.feitoEm,
      grupoId: grupo.id,
      grupo: grupo.nome,
    })
    .from(topico)
    .innerJoin(grupo, eq(topico.grupoId, grupo.id))
    .where(eq(grupo.estudoId, estudoId))
    .orderBy(asc(grupo.ordem), asc(topico.ordem));
}

export function lerDetalhes(json: string | null): string[] {
  if (!json) return [];
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
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
